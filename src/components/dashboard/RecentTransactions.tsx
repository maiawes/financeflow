import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

const transactions = [
  { id: 1, description: "Salário Base", category: "Receita Fixa", amount: 5400, date: "05 Mar 2026", type: "INCOME" },
  { id: 2, description: "Supermercado Extra", category: "Alimentação", amount: -450.25, date: "03 Mar 2026", type: "EXPENSE" },
  { id: 3, description: "Escala PM Extra", category: "Renda Extra", amount: 350, date: "02 Mar 2026", type: "INCOME" },
  { id: 4, description: "Posto Ipiranga", category: "Transporte", amount: -210, date: "01 Mar 2026", type: "EXPENSE" },
  { id: 5, description: "Netflix", category: "Assinaturas", amount: -55.90, date: "28 Fev 2026", type: "EXPENSE" },
];

export function RecentTransactions() {
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
          {transactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl border border-border/40 bg-muted/10 hover:bg-muted/40 transition-colors">
              <div className="flex items-center space-x-4">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  tx.type === "INCOME" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                )}>
                  {tx.type === "INCOME" ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-sm font-medium leading-none">{tx.description}</p>
                  <p className="text-xs text-muted-foreground mt-1.5">{tx.category} • {tx.date}</p>
                </div>
              </div>
              <div className={cn(
                "font-bold text-sm md:text-base",
                tx.type === "INCOME" ? "text-emerald-500" : "text-foreground"
              )}>
                {tx.type === "INCOME" ? "+" : ""}
                R$ {Math.abs(tx.amount).toFixed(2).replace('.', ',')}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
