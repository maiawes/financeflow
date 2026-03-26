"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Download, Filter, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { DespesasTable } from "@/components/despesas/DespesasTable";
import { useState } from "react";
import { TransactionDialog } from "@/components/forms/TransactionDialog";
import { useTransactions } from "@/hooks/useTransactions";
import { Input } from "@/components/ui/input";
import {
  formatMonthKey,
  getCurrentMonthKey,
  getReferenceMonthFromTransactions,
  isTransactionInMonth,
} from "@/lib/transactions";

export default function DespesasPage() {
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const { transactions, loading } = useTransactions("expense");

  const currentMonth = getCurrentMonthKey();
  const referenceMonth = getReferenceMonthFromTransactions(transactions, currentMonth);
  const effectiveMonth = selectedMonth ?? referenceMonth;
  const currentMonthLabel = formatMonthKey(currentMonth);
  const effectiveMonthLabel = formatMonthKey(effectiveMonth);
  const monthTransactions = transactions.filter((transaction) => isTransactionInMonth(transaction, effectiveMonth));
  const isShowingFallbackMonth = effectiveMonth !== currentMonth;

  const totalPago = monthTransactions
    .filter((transaction) => transaction.status === "pago")
    .reduce((acc, curr) => acc + curr.value, 0);

  const aPagar = monthTransactions
    .filter((transaction) => transaction.status === "pendente")
    .reduce((acc, curr) => acc + curr.value, 0);

  const previsaoTotal = totalPago + aPagar;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 pb-24 md:pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Despesas</h2>
          <p className="text-muted-foreground mt-1">Gerencie suas contas e gastos.</p>
          <p className="text-xs text-muted-foreground mt-1">
            {isShowingFallbackMonth
              ? `Sem despesas em ${currentMonthLabel}. Filtrando vencimentos de ${effectiveMonthLabel}.`
              : `Resumo de ${effectiveMonthLabel}.`}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-input bg-background px-2.5 py-1.5">
            <Filter className="w-4 h-4 mr-2" />
            <Input
              type="month"
              value={effectiveMonth}
              onChange={(event) => setSelectedMonth(event.target.value)}
              className="h-7 border-0 bg-transparent px-0 py-0 shadow-none focus-visible:ring-0"
              aria-label="Filtrar despesas por vencimento"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="hidden sm:flex"
            onClick={() => setSelectedMonth(null)}
            disabled={selectedMonth === null}
          >
            Vencimentos do mês-base
          </Button>
          <Button variant="outline" size="sm" className="hidden sm:flex" onClick={() => toast.success("Planilha de Despesas baixada com sucesso!")}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button size="sm" variant="destructive" onClick={() => setIsNewOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Despesa
          </Button>
        </div>
      </div>
      
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card className="bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-transparent border-rose-500/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pago (Mês)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-500">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : `R$ ${totalPago.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">A Pagar (Mês)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : `R$ ${aPagar.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Previsão Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : `R$ ${previsaoTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-border/50 overflow-hidden">
        <CardHeader className="px-6 py-4 border-b border-border/50 bg-muted/10">
          <CardTitle>Saídas com vencimento em {effectiveMonthLabel}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <DespesasTable referenceMonth={effectiveMonth} />
        </CardContent>
      </Card>

      <TransactionDialog 
        type="expense"
        open={isNewOpen}
        onOpenChange={setIsNewOpen}
      />
    </div>
  );
}
