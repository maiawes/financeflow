"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Landmark, PieChart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmprestimosList } from "@/components/emprestimos/EmprestimosList";
import { useState } from "react";
import { LoanDialog } from "@/components/forms/LoanDialog";
import { useLoans } from "@/hooks/useLoans";
import { useTransactions } from "@/hooks/useTransactions";
import {
  formatMonthKey,
  getCurrentMonthKey,
  getReferenceMonthFromTransactions,
  isTransactionInMonth,
} from "@/lib/transactions";

export default function EmprestimosPage() {
  const [isNewOpen, setIsNewOpen] = useState(false);
  const { loans, loading: loansLoading } = useLoans();
  const { transactions: incomes, loading: incomesLoading } = useTransactions("income");
  const loading = loansLoading || incomesLoading;

  const parcelasDoMes = loans.reduce((acc, loan) => {
    // Só conta se ainda tem parcelas a pagar
    if (loan.paidInstallments < loan.totalInstallments) {
      return acc + loan.installmentValue;
    }
    return acc;
  }, 0);

  const saldoDevedorTotal = loans.reduce((acc, loan) => {
    return acc + ((loan.totalInstallments - loan.paidInstallments) * loan.installmentValue);
  }, 0);

  const totalBorrowed = loans.reduce((acc, loan) => {
    return acc + (loan.totalInstallments * loan.installmentValue);
  }, 0);

  const percentPaid = totalBorrowed > 0 
    ? ((totalBorrowed - saldoDevedorTotal) / totalBorrowed) * 100 
    : 0;

  // Calculo de Margem
  const referenceMonth = getReferenceMonthFromTransactions(incomes, getCurrentMonthKey());
  const referenceMonthLabel = formatMonthKey(referenceMonth);
  const monthIncomes = incomes.filter((transaction) => isTransactionInMonth(transaction, referenceMonth));
  
  // Tenta encontrar a renda fixa (Salário ou Receita Fixa), se não houver, soma tudo
  let basicaRenda = monthIncomes
    .filter((transaction) => {
      const category = transaction.cat.toLowerCase();
      const description = transaction.desc.toLowerCase();

      return category.includes("fix") || description.includes("salár") || description.includes("salario");
    })
    .reduce((acc, curr) => acc + curr.value, 0);

  if (basicaRenda === 0) {
    basicaRenda = monthIncomes.reduce((acc, curr) => acc + curr.value, 0);
  }
  
  const marginLimit = basicaRenda * 0.3; // 30%
  const marginAvailable = Math.max(0, marginLimit - parcelasDoMes);
  const percentRendaFixa = basicaRenda > 0 ? (parcelasDoMes / basicaRenda) * 100 : 0;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 pb-24 md:pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Consignados</h2>
          <p className="text-muted-foreground mt-1">Acompanhe seus empréstimos e parcelamentos longos.</p>
          <p className="text-xs text-muted-foreground mt-1">Renda base considerada: {referenceMonthLabel}.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white" onClick={() => setIsNewOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Empréstimo
          </Button>
        </div>
      </div>
      
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/20 shadow-sm sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Parcelas do Mês</CardTitle>
            <Landmark className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-500">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : `R$ ${parcelasDoMes.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
            </div>
            <p className="text-xs text-muted-foreground mt-1 text-rose-500 font-medium">
              {loading ? "Calculando..." : `${percentRendaFixa.toFixed(1)}% da sua renda base`}
            </p>
          </CardContent>
        </Card>
        
        <Card className="sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margem Disponível</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : `R$ ${marginAvailable.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Baseado na margem de 30%
            </p>
          </CardContent>
        </Card>
        
        <Card className="sm:col-span-2 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Devedor Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : `R$ ${saldoDevedorTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
            </div>
            <div className="w-full bg-muted rounded-full h-1.5 mt-3">
              <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${percentPaid}%` }}></div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {percentPaid.toFixed(1)}% já pago de todos os contratos vigentes
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold tracking-tight mb-4">Meus Contratos</h3>
        <EmprestimosList />
      </div>

      <LoanDialog 
        open={isNewOpen}
        onOpenChange={setIsNewOpen}
      />
    </div>
  );
}
