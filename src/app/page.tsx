"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownIcon, ArrowUpIcon, DollarSign, Wallet, Loader2 } from "lucide-react";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { UpcomingBills } from "@/components/dashboard/UpcomingBills";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { useTransactions } from "@/hooks/useTransactions";
import { useLoans } from "@/hooks/useLoans";
import { subMonths } from "date-fns";
import { parseStoredDate } from "@/lib/date";
import {
  formatMonthKey,
  getCurrentMonthKey,
  getReferenceMonthFromTransactions,
  isTransactionInMonth,
} from "@/lib/transactions";

export default function DashboardPage() {
  const { transactions: incomes, loading: loading1 } = useTransactions("income");
  const { transactions: expenses, loading: loading2 } = useTransactions("expense");
  const { loans, loading: loading3 } = useLoans();
  const currentMonth = getCurrentMonthKey();
  const referenceMonth = getReferenceMonthFromTransactions([...incomes, ...expenses], currentMonth);
  const currentMonthLabel = formatMonthKey(currentMonth);
  const referenceMonthLabel = formatMonthKey(referenceMonth);
  const referenceMonthDate = parseStoredDate(`${referenceMonth}-01`) ?? new Date();
  const previousMonth = getCurrentMonthKey(subMonths(referenceMonthDate, 1));
  const currentMonthIncomes = incomes.filter((transaction) => isTransactionInMonth(transaction, referenceMonth));
  const currentMonthExpenses = expenses.filter((transaction) => isTransactionInMonth(transaction, referenceMonth));
  const previousMonthIncomes = incomes.filter((transaction) => isTransactionInMonth(transaction, previousMonth));
  const previousMonthExpenses = expenses.filter((transaction) => isTransactionInMonth(transaction, previousMonth));

  const totalIncome = currentMonthIncomes.reduce((acc, curr) => acc + curr.value, 0);
  const totalExpense = currentMonthExpenses.reduce((acc, curr) => acc + curr.value, 0);
  const totalLoans = loans.reduce((acc, curr) => acc + curr.installmentValue, 0);
  const balance = totalIncome - totalExpense - totalLoans;
  const previousBalance =
    previousMonthIncomes.reduce((acc, curr) => acc + curr.value, 0) -
    previousMonthExpenses.reduce((acc, curr) => acc + curr.value, 0);
  const balanceDelta = balance - previousBalance;
  const hasBalanceComparison = previousBalance !== 0;
  const balanceDeltaLabel =
    !hasBalanceComparison
      ? "Sem base suficiente para comparar"
      : `${balanceDelta >= 0 ? "+" : ""}${((balanceDelta / Math.abs(previousBalance)) * 100).toFixed(1)}% vs mês anterior`;
  
  const loading = loading1 || loading2 || loading3;
  const isShowingFallbackMonth = referenceMonth !== currentMonth;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 pb-24 md:pb-8">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Visão Geral</h2>
          <p className="text-xs text-muted-foreground mt-1">
            {isShowingFallbackMonth
              ? `Sem movimentações em ${currentMonthLabel}. Exibindo ${referenceMonthLabel}, o mês mais próximo com lançamentos.`
              : `Resumo de ${referenceMonthLabel}.`}
          </p>
        </div>
      </div>
      
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {/* Card: Saldo Previsto */}
        <Card className="col-span-2 sm:col-span-1 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20 shadow-sm relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 bg-primary w-24 h-24 rounded-bl-full translate-x-8 -translate-y-8 blur-md" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Previsto livre</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : `R$ ${balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center font-medium">
              <span className={hasBalanceComparison && balanceDelta < 0 ? "text-rose-500 mr-1 flex items-center" : "text-emerald-500 mr-1 flex items-center"}>
                {!hasBalanceComparison ? "Comparativo" : balanceDelta >= 0 ? "Alta" : "Queda"}
              </span>
              {loading ? "Calculando variação..." : balanceDeltaLabel}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Considera apenas receitas e despesas previstas do mês.
            </p>
          </CardContent>
        </Card>
        
        {/* Card: Receitas */}
        <Card className="col-span-2 sm:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas Estimadas</CardTitle>
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <ArrowUpIcon className="h-4 w-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : `R$ ${totalIncome.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Salário + Bicos + PM</p>
          </CardContent>
        </Card>

        {/* Card: Despesas */}
        <Card className="col-span-2 sm:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas Estimadas</CardTitle>
            <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center">
              <ArrowDownIcon className="h-4 w-4 text-rose-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : `R$ ${totalExpense.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
            </div>
            <p className="text-xs text-muted-foreground mt-1 text-rose-500/80 font-medium">
              {totalIncome > 0 && !loading ? `${((totalExpense / totalIncome) * 100).toFixed(1)}% da renda comprometida` : "Buscando dados..."}
            </p>
          </CardContent>
        </Card>

        {/* Card: Empréstimos */}
        <Card className="col-span-2 sm:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consignados</CardTitle>
            <div className="w-8 h-8 rounded-full border border-amber-500/20 bg-amber-500/10 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : `R$ ${totalLoans.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalIncome > 0 && !loading ? `Impacto de ${((totalLoans / totalIncome) * 100).toFixed(1)}% na renda` : "Buscando dados..."}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-1 md:col-span-2 lg:col-span-4 h-full">
          <DashboardCharts />
        </div>
        <div className="col-span-1 md:col-span-2 lg:col-span-3">
          <UpcomingBills />
        </div>
      </div>
      
      <div className="grid gap-4 grid-cols-1">
        <RecentTransactions />
      </div>
    </div>
  );
}
