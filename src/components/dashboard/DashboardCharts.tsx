"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const data = [
  { name: "Jan", receitas: 8200, despesas: 4100 },
  { name: "Fev", receitas: 7900, despesas: 4300 },
  { name: "Mar", receitas: 8500, despesas: 4500 },
  { name: "Abr", receitas: 8900, despesas: 4650 },
  { name: "Mai", receitas: 9200, despesas: 4400 },
  { name: "Jun", receitas: 8700, despesas: 4200 },
];

export function DashboardCharts() {
  return (
    <Card className="h-full flex flex-col shadow-sm border-border/50">
      <CardHeader>
        <CardTitle>Evolução Financeira</CardTitle>
        <CardDescription>
          Suas receitas e despesas nos últimos 6 meses.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(value) => `R$${value/1000}k`} />
            <Tooltip 
              contentStyle={{ backgroundColor: "hsl(var(--background))", borderRadius: "8px", border: "1px solid hsl(var(--border))", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
              itemStyle={{ fontSize: "14px", fontWeight: "500" }}
              formatter={(value: any) => [`R$ ${Number(value).toLocaleString("pt-BR")}`, ""]}
            />
            <Area type="monotone" dataKey="receitas" name="Receitas" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorReceitas)" />
            <Area type="monotone" dataKey="despesas" name="Despesas" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorDespesas)" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
