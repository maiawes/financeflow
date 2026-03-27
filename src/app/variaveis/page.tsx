"use client";

import { useState } from "react";
import { CarFront, Download, Loader2, Plus, ShoppingBasket } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VariableExpenseDialog } from "@/components/forms/VariableExpenseDialog";
import { VariableExpensesTable } from "@/components/variaveis/VariableExpensesTable";
import { useVariableExpenses } from "@/hooks/useVariableExpenses";
import { formatMonthKey, getCurrentMonthKey, getReferenceMonthFromTransactions, isTransactionInMonth } from "@/lib/transactions";

export default function VariaveisPage() {
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const { expenses, loading } = useVariableExpenses();

  const currentMonth = getCurrentMonthKey();
  const referenceMonth = getReferenceMonthFromTransactions(expenses, currentMonth);
  const effectiveMonth = selectedMonth ?? referenceMonth;
  const effectiveMonthLabel = formatMonthKey(effectiveMonth);
  const monthExpenses = expenses.filter((expense) => isTransactionInMonth(expense, effectiveMonth));

  const totalMonth = monthExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalFood = monthExpenses
    .filter((expense) => expense.category === "Alimentação")
    .reduce((acc, curr) => acc + curr.amount, 0);
  const totalFuel = monthExpenses
    .filter((expense) => expense.category === "Combustível")
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 pb-24 md:pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Gastos Variáveis</h2>
          <p className="text-muted-foreground mt-1">Controle alimentação e combustível ao longo do mês.</p>
          <p className="text-xs text-muted-foreground mt-1">Resumo de {effectiveMonthLabel}.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Input
            type="month"
            value={effectiveMonth}
            onChange={(event) => setSelectedMonth(event.target.value)}
            className="h-8 sm:w-[180px]"
            aria-label="Filtrar gastos variáveis por mês"
          />
          <Button variant="outline" size="sm" className="hidden sm:flex" onClick={() => setSelectedMonth(null)} disabled={selectedMonth === null}>
            Mês-base
          </Button>
          <Button variant="outline" size="sm" className="hidden sm:flex" onClick={() => toast.success("Exportação de gastos variáveis em desenvolvimento!")}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white" onClick={() => setIsNewOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Gasto
          </Button>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card className="bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-transparent border-orange-500/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total no Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700 dark:text-orange-400">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : `R$ ${totalMonth.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Soma dos gastos variáveis do mês
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alimentação</CardTitle>
            <ShoppingBasket className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : `R$ ${totalFood.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Combustível</CardTitle>
            <CarFront className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : `R$ ${totalFuel.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-border/50 overflow-hidden">
        <CardHeader className="px-6 py-4 border-b border-border/50 bg-muted/10">
          <CardTitle>Lançamentos de {effectiveMonthLabel}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <VariableExpensesTable expenses={monthExpenses} loading={loading} monthLabel={effectiveMonthLabel} />
        </CardContent>
      </Card>

      <VariableExpenseDialog open={isNewOpen} onOpenChange={setIsNewOpen} />
    </div>
  );
}
