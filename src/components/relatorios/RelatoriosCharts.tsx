"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { useTransactions } from "@/hooks/useTransactions";
import { useVariableExpenses } from "@/hooks/useVariableExpenses";
import { format, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import {
  formatMonthKey,
  getCurrentMonthKey,
  getReferenceMonthFromTransactions,
  isTransactionInMonth,
} from "@/lib/transactions";
import { parseStoredDate } from "@/lib/date";

export function RelatoriosCharts() {
  const { transactions: expenses } = useTransactions("expense");
  const { transactions: incomes } = useTransactions("income");
  const { expenses: variableExpenses } = useVariableExpenses();

  const referenceMonth = getReferenceMonthFromTransactions([...expenses, ...incomes], getCurrentMonthKey());
  const referenceMonthLabel = formatMonthKey(referenceMonth);
  const referenceMonthDate = parseStoredDate(`${referenceMonth}-01`) ?? new Date();
  const currentMonthExpenses = expenses.filter((transaction) => isTransactionInMonth(transaction, referenceMonth));

  const grouped = currentMonthExpenses.reduce((acc, curr) => {
    acc[curr.cat] = (acc[curr.cat] || 0) + (curr.value ?? 0);
    return acc;
  }, {} as Record<string, number>);

  const colors = ["#f43f5e", "#f97316", "#eab308", "#3b82f6", "#10b981", "#8b5cf6", "#14b8a6", "#ec4899"];
  const despesasData = Object.keys(grouped).length > 0 
    ? Object.entries(grouped).map(([name, value], i) => ({ name, value, color: colors[i % colors.length] }))
    : [{ name: "Nenhuma despesa", value: 1, color: "#cbd5e1" }];

  const months = Array.from({ length: 6 }).map((_, i) => {
    const d = subMonths(referenceMonthDate, 5 - i);
    return {
      monthStr: format(d, "MMM", { locale: ptBR }),
      yearMonth: format(d, "yyyy-MM"),
    };
  });

  const evolucaoRendaExtra = months.map(m => {
    const txForMonth = incomes.filter(t => t.date && t.date.startsWith(m.yearMonth));
    const pm = txForMonth.filter(i => i.cat.toLowerCase().includes("pm")).reduce((acc, curr) => acc + (curr.value || 0), 0);
    const bicos = txForMonth.filter(i => i.cat.toLowerCase().includes("bico")).reduce((acc, curr) => acc + (curr.value || 0), 0);

    return {
      month: m.monthStr.charAt(0).toUpperCase() + m.monthStr.slice(1),
      bicos,
      pm
    };
  });

  const evolucaoVariaveis = months.map(m => {
    const expensesForMonth = variableExpenses.filter(e => e.date && e.date.startsWith(m.yearMonth));
    const alimentacao = expensesForMonth.filter(e => e.category === "Alimentação").reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const combustivel = expensesForMonth.filter(e => e.category === "Combustível").reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const total = alimentacao + combustivel;

    return {
      month: m.monthStr.charAt(0).toUpperCase() + m.monthStr.slice(1),
      alimentacao,
      combustivel,
      total
    };
  });

  const currentVarData = evolucaoVariaveis[evolucaoVariaveis.length - 1] ?? { total: 0, alimentacao: 0, combustivel: 0 };
  const prevVarData = evolucaoVariaveis[evolucaoVariaveis.length - 2] ?? { total: 0, alimentacao: 0, combustivel: 0 };

  const calcDiff = (curr: number, prev: number) => {
    if (prev === 0 && curr === 0) return { delta: 0, isIncrease: false, isZero: true };
    if (prev === 0) return { delta: 100, isIncrease: true, isZero: false };
    const diff = curr - prev;
    return {
      delta: Math.abs((diff / prev) * 100),
      isIncrease: diff > 0,
      isZero: diff === 0
    };
  };

  const totalDiff = calcDiff(currentVarData.total, prevVarData.total);

  return (
    <div className="grid gap-6 grid-cols-1 xl:grid-cols-2">
      <Card className="shadow-sm border-border/50 bg-background/50">
        <CardHeader>
          <CardTitle>Despesas por Categoria</CardTitle>
          <CardDescription>Onde o seu dinheiro foi gasto em {referenceMonthLabel}.</CardDescription>
        </CardHeader>
        <CardContent className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={despesasData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {despesasData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`R$ ${Number(value ?? 0).toLocaleString("pt-BR")}`, "Valor"]}
                contentStyle={{ borderRadius: "12px", border: "1px solid hsl(var(--border))", backgroundColor: "hsl(var(--background))", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
                itemStyle={{ fontWeight: "600" }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      {/* Gastos Variáveis e Evolução */}
      <Card className="shadow-sm border-border/50 bg-background/50 xl:col-span-2">
        <CardHeader className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <CardTitle>Evolução de Gastos Variáveis</CardTitle>
            <CardDescription>Comparativo de Alimentação e Combustível (6 meses).</CardDescription>
          </div>
          
          {/* Badge Comparativo */}
          {!totalDiff.isZero && (
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${totalDiff.isIncrease ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'}`}>
              {totalDiff.isIncrease ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{totalDiff.isIncrease ? 'Avanço' : 'Queda'} de {totalDiff.delta.toFixed(1)}% vs Mês Anterior</span>
            </div>
          )}
          {totalDiff.isZero && (
             <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-muted/50 text-muted-foreground border border-border">
               <Minus className="w-4 h-4" />
               <span>Sem variação vs Mês Anterior</span>
             </div>
          )}
        </CardHeader>
        <CardContent className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={evolucaoVariaveis} margin={{ top: 20, right: 30, left: -15, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(val) => `R$${(val/1000).toFixed(1)}k`} />
              <Tooltip
                formatter={(value, name) => [`R$ ${Number(value ?? 0).toLocaleString("pt-BR")}`, name === "alimentacao" ? "Alimentação" : "Combustível"]}
                contentStyle={{ borderRadius: "12px", border: "1px solid hsl(var(--border))", backgroundColor: "hsl(var(--background))", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
                itemStyle={{ fontWeight: "600" }}
                cursor={{ fill: "hsl(var(--muted)/0.4)" }}
              />
              <Legend iconType="circle" wrapperStyle={{ paddingTop: "20px", fontSize: "12px" }} />
              <Bar dataKey="alimentacao" name="Alimentação" stackId="v" fill="#10b981" radius={[0, 0, 4, 4]} />
              <Bar dataKey="combustivel" name="Combustível" stackId="v" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-border/50 bg-background/50 xl:col-span-1">
        <CardHeader>
          <CardTitle>Evolução da Renda Extra</CardTitle>
          <CardDescription>Histórico de bicos e extras da PM até {referenceMonthLabel}.</CardDescription>
        </CardHeader>
        <CardContent className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={evolucaoRendaExtra} margin={{ top: 20, right: 30, left: -15, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(val) => `R$${(val/1000).toFixed(1)}k`} />
              <Tooltip
                formatter={(value, name) => [`R$ ${Number(value ?? 0).toLocaleString("pt-BR")}`, name === "bicos" ? "Bicos" : "Extra PM"]}
                contentStyle={{ borderRadius: "12px", border: "1px solid hsl(var(--border))", backgroundColor: "hsl(var(--background))", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
                itemStyle={{ fontWeight: "600" }}
                cursor={{ fill: "hsl(var(--muted)/0.4)" }}
              />
              <Legend iconType="circle" wrapperStyle={{ paddingTop: "20px", fontSize: "12px" }} />
              <Bar dataKey="bicos" name="Bicos Diversos" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} />
              <Bar dataKey="pm" name="Extra PM" stackId="a" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
    </div>
  );
}
