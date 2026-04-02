import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTransactions } from "@/hooks/useTransactions";
import { isAfter } from "date-fns";
import { formatStoredDate, parseStoredDate } from "@/lib/date";
import { formatTransactionDescription } from "@/lib/transactions";

export function RecentTransactions() {
  const { transactions, loading } = useTransactions();
  const today = new Date();

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
  const recentTxs = transactions
    .filter((transaction) => {
      const transactionDate = parseStoredDate(transaction.date);
      return transactionDate ? !isAfter(transactionDate, today) : true;
    })
    .slice(0, 5);

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
                    <p className="text-sm font-medium leading-none">{formatTransactionDescription(tx)}</p>
                    <p className="text-xs text-muted-foreground mt-1.5">{tx.cat} • {tx.date ? formatStoredDate(tx.date, "dd MMM yyyy") : 'S/ data'}</p>
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
