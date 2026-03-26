"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, TrendingUp, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { SimuladorCenarios } from "@/components/planejamento/SimuladorCenarios";
import { useTransactions } from "@/hooks/useTransactions";
import { Loader2 } from "lucide-react";
import { subMonths } from "date-fns";
import { parseStoredDate } from "@/lib/date";
import {
  formatMonthKey,
  getCurrentMonthKey,
  getReferenceMonthFromTransactions,
  isTransactionInMonth,
} from "@/lib/transactions";

function isExtraIncomeCategory(category: string) {
  const normalizedCategory = category.toLowerCase();

  return normalizedCategory.includes("pm") || normalizedCategory.includes("bico") || normalizedCategory.includes("avuls");
}

export default function PlanejamentoPage() {
  const { transactions: incomes, loading: loading1 } = useTransactions("income");
  const { transactions: expenses, loading: loading2 } = useTransactions("expense");
  const currentMonth = getCurrentMonthKey();
  const referenceMonth = getReferenceMonthFromTransactions([...incomes, ...expenses], currentMonth);
  const currentMonthLabel = formatMonthKey(currentMonth);
  const referenceMonthLabel = formatMonthKey(referenceMonth);
  const referenceMonthDate = parseStoredDate(`${referenceMonth}-01`) ?? new Date();
  const currentMonthIncomes = incomes.filter((transaction) => isTransactionInMonth(transaction, referenceMonth));
  const currentMonthExpenses = expenses.filter((transaction) => isTransactionInMonth(transaction, referenceMonth));

  const totalIncome = currentMonthIncomes.reduce((acc, curr) => acc + curr.value, 0);
  const totalExpense = currentMonthExpenses.reduce((acc, curr) => acc + curr.value, 0);
  const balance = totalIncome - totalExpense;
  const loading = loading1 || loading2;
  const freePercentage = totalIncome > 0 ? Math.max(0, (balance / totalIncome) * 100) : 0;
  const currentExtraIncome = currentMonthIncomes
    .filter((transaction) => isExtraIncomeCategory(transaction.cat))
    .reduce((acc, curr) => acc + curr.value, 0);
  const previousExtraIncomeValues = Array.from({ length: 3 }, (_, index) => {
    const monthKey = getCurrentMonthKey(subMonths(referenceMonthDate, index + 1));

    return incomes
      .filter(
        (transaction) =>
          isTransactionInMonth(transaction, monthKey) && isExtraIncomeCategory(transaction.cat),
      )
      .reduce((acc, curr) => acc + curr.value, 0);
  }).filter((value) => value > 0);
  const extraIncomeAverage =
    previousExtraIncomeValues.length > 0
      ? previousExtraIncomeValues.reduce((acc, value) => acc + value, 0) / previousExtraIncomeValues.length
      : 0;
  const extraIncomeDeltaPercentage =
    extraIncomeAverage > 0 ? ((currentExtraIncome - extraIncomeAverage) / extraIncomeAverage) * 100 : 0;
  const extraIncomeTrend = extraIncomeAverage === 0 ? "neutral" : currentExtraIncome < extraIncomeAverage ? "down" : "up";
  const extraIncomeAlertTitle =
    extraIncomeTrend === "neutral"
      ? "Renda Extra"
      : extraIncomeTrend === "down"
        ? "Queda na Renda Extra"
        : "Alta na Renda Extra";
  const extraIncomeAlert =
    extraIncomeAverage === 0
      ? `Sua renda extra em ${referenceMonthLabel} soma R$ ${currentExtraIncome.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}. Continue registrando para liberar comparativos históricos.`
      : currentExtraIncome < extraIncomeAverage
        ? `Sua renda extra em ${referenceMonthLabel} ficou em R$ ${currentExtraIncome.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}, ${Math.abs(extraIncomeDeltaPercentage).toFixed(0)}% abaixo da média recente de R$ ${extraIncomeAverage.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}.`
        : `Sua renda extra em ${referenceMonthLabel} está em R$ ${currentExtraIncome.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}, ${extraIncomeDeltaPercentage.toFixed(0)}% acima da média recente de R$ ${extraIncomeAverage.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}.`;
  const isShowingFallbackMonth = referenceMonth !== currentMonth;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 pb-24 md:pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Planejamento do Mês</h2>
          <p className="text-muted-foreground mt-1">Visão geral do mês e simulação de cenários.</p>
          <p className="text-xs text-muted-foreground mt-1">
            {isShowingFallbackMonth
              ? `Sem movimentações em ${currentMonthLabel}. Exibindo ${referenceMonthLabel}, o mês mais próximo com lançamentos.`
              : `Resumo de ${referenceMonthLabel}.`}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button size="sm" onClick={() => toast.success(`${referenceMonthLabel} fechado com sucesso!`)}>
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
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-500">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : `R$ ${totalIncome.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saídas Previstas</CardTitle>
            <Target className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-500">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : `R$ ${totalExpense.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20 shadow-sm sm:col-span-2 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Livre Previsto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : `R$ ${balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              {loading ? "Calculando..." : `Você ainda tem ${freePercentage.toFixed(0)}% da sua renda livre para este mês.`}
            </div>
            <div className="w-full bg-muted rounded-full h-1.5 mt-2 overflow-hidden">
              <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${freePercentage}%` }}></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 xl:grid-cols-2 mt-8">
        <div>
          <h3 className="text-xl font-semibold tracking-tight mb-4">Simulador de Cenários</h3>
          <p className="text-sm text-muted-foreground mb-6">Mova os controles para ver como sua renda e despesas seriam afetadas por decisões extras este mês.</p>
          <SimuladorCenarios baseIncome={totalIncome} baseExpense={totalExpense} />
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
                    {loading ? "Analisando..." : `Você já comprometeu ${(totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 0).toFixed(0)}% da sua renda antes mesmo de receber todo o seu salário. Tente reduzir gastos variáveis nos próximos dias.`}
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card
              className={
                extraIncomeTrend === "up"
                  ? "border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors"
                  : "border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/10 transition-colors"
              }
            >
              <CardContent className="p-4 flex gap-4">
                <Target className={extraIncomeTrend === "up" ? "w-6 h-6 text-emerald-500 shrink-0 mt-0.5" : "w-6 h-6 text-rose-500 shrink-0 mt-0.5"} />
                <div>
                  <h4 className={extraIncomeTrend === "up" ? "font-semibold text-emerald-600 dark:text-emerald-500 text-base" : "font-semibold text-rose-600 dark:text-rose-500 text-base"}>
                    {extraIncomeAlertTitle}
                  </h4>
                  <p className={extraIncomeTrend === "up" ? "text-sm text-emerald-600/80 dark:text-emerald-500/80 mt-1" : "text-sm text-rose-600/80 dark:text-rose-500/80 mt-1"}>
                    {loading ? "Analisando..." : extraIncomeAlert}
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
