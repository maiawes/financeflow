import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTransactions } from "@/hooks/useTransactions";
import { format, isBefore, parseISO } from "date-fns";

export function UpcomingBills() {
  const { transactions, loading } = useTransactions("expense");

  if (loading) {
    return (
      <Card className="h-full flex flex-col shadow-sm border-border/50">
        <CardHeader>
          <CardTitle>Próximos Vencimentos</CardTitle>
          <CardDescription>Carregando...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Filtrar apenas pendentes e ordenar pelas mais próximas (para não lotar o card)
  const pendingBills = transactions
    .filter(t => t.status === "pendente")
    // Ordenar data crescente (mais próximo de vencer primeiro)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const getPriorityInfo = (bill: any) => {
    const dueDate = new Date(bill.date + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isBefore(dueDate, today)) {
      // Vencida
      return { priority: "high", label: "Atrasada", colors: "bg-rose-500/10 text-rose-500", Icon: AlertCircle };
    }
    
    // Até 3 dias
    const diffTime = Math.abs(dueDate.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    if (diffDays <= 3) {
      return { priority: "medium", label: `Em ${diffDays} dias`, colors: "bg-amber-500/10 text-amber-500", Icon: Clock };
    }
    
    return { priority: "low", label: `Em ${diffDays} dias`, colors: "bg-emerald-500/10 text-emerald-500", Icon: CheckCircle2 };
  };

  return (
    <Card className="h-full flex flex-col shadow-sm border-border/50">
      <CardHeader>
        <CardTitle>Próximos Vencimentos</CardTitle>
        <CardDescription>
          Contas a pagar nos próximos dias.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="space-y-4">
          {pendingBills.length === 0 ? (
             <p className="text-sm text-muted-foreground text-center py-4">Nenhuma conta pendente.</p>
          ) : (
            pendingBills.map((bill) => {
              const { colors, Icon, label } = getPriorityInfo(bill);
              return (
                <div key={bill.id} className="flex items-center justify-between p-3 rounded-xl border border-border/40 bg-muted/20 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className={cn("p-2 rounded-full", colors)}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-none">{bill.desc}</p>
                      <p className="text-xs text-muted-foreground mt-1">{label} ({format(parseISO(bill.date), 'dd/MM')})</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">R$ {bill.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                    <p className={cn(
                      "text-[10px] font-medium uppercase mt-0.5",
                      "text-amber-500"
                    )}>
                      Pendente
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
