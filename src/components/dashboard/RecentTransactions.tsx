import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTransactions } from "@/hooks/useTransactions";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export function RecentTransactions() {
  const { transactions, loading } = useTransactions();

  if (loading) {
    return (
      <Card className="shadow-sm border-border/50">
        <CardHeader>
          <CardTitle>Transações Recentes</CardTitle>
          <CardDescription>Carregando...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Pegar as 5 transações mais recentes
  const recentTxs = transactions.slice(0, 5);

  return (
    <Card className="shadow-sm border-border/50">
      <CardHeader>
        <CardTitle>Transações Recentes</CardTitle>
        <CardDescription>
          Últimas movimentações da sua conta.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentTxs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhuma transação recente.</p>
          ) : (
            recentTxs.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl border border-border/40 bg-muted/10 hover:bg-muted/40 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    tx.type === "income" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                  )}>
                    {tx.type === "income" ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-none">{tx.desc}</p>
                    <p className="text-xs text-muted-foreground mt-1.5">{tx.cat} • {format(parseISO(tx.date), "dd MMM yyyy", { locale: ptBR })}</p>
                  </div>
                </div>
                <div className={cn(
                  "font-bold text-sm md:text-base whitespace-nowrap",
                  tx.type === "income" ? "text-emerald-500" : "text-foreground"
                )}>
                  {tx.type === "income" ? "+" : "-"} R$ {tx.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
