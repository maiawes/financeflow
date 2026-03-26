"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

export function SimuladorCenarios() {
  const baseIncome = 8900;
  const baseExpense = 4650;
  
  const [extrasPM, setExtrasPM] = useState(0); // 0 a 10, cada = R$ 350
  const [quitarEmprestimo, setQuitarEmprestimo] = useState(false); // remove R$ 250 de parcela, custa 3000
  
  const simulatedIncome = baseIncome + (extrasPM * 350);
  const simulatedExpense = baseExpense - (quitarEmprestimo ? 250 : 0) + (quitarEmprestimo ? 3000 : 0); // se quitar esse mês
  const saldoSimulado = simulatedIncome - simulatedExpense;
  
  const diff = saldoSimulado - (baseIncome - baseExpense);

  return (
    <Card className="shadow-sm border-border/50 bg-background/50">
      <CardContent className="p-6 space-y-6">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium">Fazer mais extras da PM?</label>
              <span className="text-sm font-bold text-primary">{extrasPM} extras</span>
            </div>
            <Slider 
              value={[extrasPM]} 
              onValueChange={(v) => setExtrasPM((v as number[])[0])} 
              max={10} 
              step={1}
              className="py-4"
            />
            <p className="text-xs text-muted-foreground">Gera R$ 350,00 por escala.</p>
          </div>

          <div className="pt-4 border-t border-border/40">
            <div className="flex justify-between items-center bg-muted/30 p-4 rounded-xl border border-muted">
              <div className="pr-4">
                <label className="text-sm font-bold tracking-tight block text-foreground">Quitar Empréstimo Pessoal?</label>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Pagar R$ 3.000 agora para liberar R$ 250 de margem nos próximos meses.</p>
              </div>
              <button 
                onClick={() => setQuitarEmprestimo(!quitarEmprestimo)}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${quitarEmprestimo ? 'bg-primary' : 'bg-muted-foreground/30'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${quitarEmprestimo ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border/50">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Resultado Simulado no Final do Mês</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Novo Saldo Livre</p>
              <p className={`text-3xl font-bold tracking-tight ${saldoSimulado >= 0 ? "text-primary" : "text-rose-500"}`}>
                R$ {saldoSimulado.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground mb-1">Impacto Final</p>
              <Badge variant="outline" className={`font-semibold px-3 py-1 shadow-none text-sm ${diff >= 0 ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" : "bg-rose-500/10 text-rose-600 border-rose-500/30"}`}>
                {diff >= 0 ? "+" : ""}R$ {diff.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
