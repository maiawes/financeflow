"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { useTransactions } from "@/hooks/useTransactions";
import { format, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

export function RelatoriosCharts() {
  const { transactions: expenses } = useTransactions("expense");
  const { transactions: incomes } = useTransactions("income");

  const grouped = expenses.reduce((acc, curr) => {
    acc[curr.cat] = (acc[curr.cat] || 0) + curr.value;
    return acc;
  }, {} as Record<string, number>);

  const colors = ["#f43f5e", "#f97316", "#eab308", "#3b82f6", "#10b981", "#8b5cf6", "#14b8a6", "#ec4899"];
  const despesasData = Object.keys(grouped).length > 0 
    ? Object.entries(grouped).map(([name, value], i) => ({ name, value, color: colors[i % colors.length] }))
    : [{ name: "Nenhuma despesa", value: 1, color: "#cbd5e1" }];

  const months = Array.from({ length: 6 }).map((_, i) => {
    const d = subMonths(new Date(), 5 - i);
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

  return (
    <div className="grid gap-6 grid-cols-1 xl:grid-cols-2">
      <Card className="shadow-sm border-border/50 bg-background/50">
        <CardHeader>
          <CardTitle>Despesas por Categoria</CardTitle>
          <CardDescription>Onde o seu dinheiro foi gasto este mês.</CardDescription>
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
                formatter={(value: any) => [`R$ ${Number(value).toLocaleString("pt-BR")}`, "Valor"]}
                contentStyle={{ borderRadius: "12px", border: "1px solid hsl(var(--border))", backgroundColor: "hsl(var(--background))", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
                itemStyle={{ fontWeight: "600" }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <Card className="shadow-sm border-border/50 bg-background/50">
        <CardHeader>
          <CardTitle>Evolução da Renda Extra</CardTitle>
          <CardDescription>Histórico de bicos e extras da PM nos últimos 6 meses.</CardDescription>
        </CardHeader>
        <CardContent className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={evolucaoRendaExtra} margin={{ top: 20, right: 30, left: -15, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(val) => `R$${(val/1000).toFixed(1)}k`} />
              <Tooltip
                formatter={(value: any, name: any) => [`R$ ${Number(value).toLocaleString("pt-BR")}`, name === "bicos" ? "Bicos" : "Extra PM"]}
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
