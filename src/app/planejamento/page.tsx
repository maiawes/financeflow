"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, TrendingUp, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { SimuladorCenarios } from "@/components/planejamento/SimuladorCenarios";

export default function PlanejamentoPage() {
  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 pb-24 md:pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Planejamento do Mês</h2>
          <p className="text-muted-foreground mt-1">Visão geral do mês e simulação de cenários.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button size="sm" onClick={() => toast.success("Mês de Março de 2026 devidamente fechado com sucesso!")}>
            Fechar Mês Atual
          </Button>
        </div>
      </div>
      
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entradas Previstas</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-500">R$ 8.900,00</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saídas Previstas</CardTitle>
            <Target className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-500">R$ 4.650,00</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20 shadow-sm sm:col-span-2 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Livre Previsto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">R$ 4.250,00</div>
            <div className="text-xs text-muted-foreground mt-2">
              Você ainda tem 47% da sua renda livre para este mês.
            </div>
            <div className="w-full bg-muted rounded-full h-1.5 mt-2">
              <div className="bg-primary h-1.5 rounded-full" style={{ width: "47%" }}></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 xl:grid-cols-2 mt-8">
        <div>
          <h3 className="text-xl font-semibold tracking-tight mb-4">Simulador de Cenários</h3>
          <p className="text-sm text-muted-foreground mb-6">Mova os controles para ver como sua renda e despesas seriam afetadas por decisões extras este mês.</p>
          <SimuladorCenarios />
        </div>
        
        <div>
          <h3 className="text-xl font-semibold tracking-tight mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-amber-500" /> Alertas Inteligentes
          </h3>
          <p className="text-sm text-muted-foreground mb-6">O sistema analisa seus gastos e receitas para gerar dicas.</p>
          <div className="space-y-4 pt-1">
            <Card className="border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 transition-colors">
              <CardContent className="p-4 flex gap-4">
                <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-600 dark:text-amber-500 text-base">Alto comprometimento</h4>
                  <p className="text-sm text-amber-600/80 dark:text-amber-500/80 mt-1">
                    Você já comprometeu mais de 50% da sua renda antes mesmo de receber todo o seu salário. Tente reduzir gastos variáveis nos próximos dias.
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/10 transition-colors">
              <CardContent className="p-4 flex gap-4">
                <Target className="w-6 h-6 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-rose-600 dark:text-rose-500 text-base">Queda na Renda Extra</h4>
                  <p className="text-sm text-rose-600/80 dark:text-rose-500/80 mt-1">
                    Sua previsão de bicos este mês (R$ 1.550) está 25% menor que a média dos últimos 3 meses (R$ 2.100). Isso pode impactar suas metas.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
