"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const despesasData = [
  { name: "Moradia", value: 1800, color: "#f43f5e" },
  { name: "Alimentação", value: 950, color: "#f97316" },
  { name: "Transporte", value: 650, color: "#eab308" },
  { name: "Lazer", value: 400, color: "#3b82f6" },
  { name: "Saúde", value: 500, color: "#10b981" },
  { name: "Empréstimos", value: 350, color: "#8b5cf6" },
];

const evolucaoRendaExtra = [
  { month: "Out", bicos: 800, pm: 400 },
  { month: "Nov", bicos: 1200, pm: 700 },
  { month: "Dez", bicos: 2500, pm: 1050 },
  { month: "Jan", bicos: 900, pm: 350 },
  { month: "Fev", bicos: 1100, pm: 700 },
  { month: "Mar", bicos: 1550, pm: 1050 },
];

export function RelatoriosCharts() {
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
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(val) => `R$${val/1000}k`} />
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
