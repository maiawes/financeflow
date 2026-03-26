import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const bills = [
  { id: 1, name: "Aluguel", amount: 1200, dueDate: "Hoje", status: "pending", priority: "high" },
  { id: 2, name: "Energia Elétrica", amount: 245.50, dueDate: "Em 3 dias", status: "pending", priority: "medium" },
  { id: 3, name: "Internet", amount: 120, dueDate: "Em 5 dias", status: "pending", priority: "low" },
  { id: 4, name: "Parcela Carro", amount: 850, dueDate: "Pago", status: "paid", priority: "low" },
];

export function UpcomingBills() {
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
          {bills.map((bill) => (
            <div key={bill.id} className="flex items-center justify-between p-3 rounded-xl border border-border/40 bg-muted/20 hover:bg-muted/50 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={cn(
                  "p-2 rounded-full",
                  bill.status === "paid" ? "bg-emerald-500/10 text-emerald-500" :
                  bill.priority === "high" ? "bg-rose-500/10 text-rose-500" :
                  "bg-amber-500/10 text-amber-500"
                )}>
                  {bill.status === "paid" ? <CheckCircle2 className="w-4 h-4" /> : 
                   bill.priority === "high" ? <AlertCircle className="w-4 h-4" /> : 
                   <Clock className="w-4 h-4" />}
                </div>
                <div>
                  <p className="text-sm font-medium leading-none">{bill.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{bill.dueDate}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold">R$ {bill.amount.toFixed(2).replace('.', ',')}</p>
                <p className={cn(
                  "text-[10px] font-medium uppercase mt-0.5",
                  bill.status === "paid" ? "text-emerald-500" : "text-amber-500"
                )}>
                  {bill.status === "paid" ? "Pago" : "Pendente"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
