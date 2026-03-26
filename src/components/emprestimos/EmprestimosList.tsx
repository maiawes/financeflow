"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Landmark, Calendar, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { LoanDialog } from "@/components/forms/LoanDialog";
import { Loan, useLoans } from "@/hooks/useLoans";

export function EmprestimosList() {
  const { loans, loading, deleteLoan, updateLoan } = useLoans();
  const [editItem, setEditItem] = useState<Loan | null>(null);

  if (loading) {
    return <div className="col-span-1 md:col-span-2 lg:col-span-3 p-8 text-center text-muted-foreground animate-pulse">Carregando seus empréstimos ativos...</div>;
  }

  if (loans.length === 0) {
    return <div className="col-span-1 md:col-span-2 lg:col-span-3 p-8 text-center text-muted-foreground">Nenhum empréstimo cadastrado.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {loans.map((loan) => {
        const progress = loan.totalInstallments > 0 ? (loan.paidInstallments / loan.totalInstallments) * 100 : 0;
        const remainingStr = loan.totalInstallments - loan.paidInstallments;
        const remainingAmount = loan.totalValue - (loan.paidInstallments * loan.installmentValue);

        return (
          <Card key={loan.id} className="group overflow-hidden relative shadow-sm hover:shadow-md transition-shadow">
            <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                    <Landmark className="w-5 h-5 text-amber-600 dark:text-amber-500" />
                  </div>
                  <div>
                    <CardTitle className="text-base truncate">{loan.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">Empréstimo</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex h-8 w-8 -mr-2 -mt-2 items-center justify-center rounded-md hover:bg-muted focus:outline-none focus:ring-1 focus:ring-ring text-muted-foreground outline-none">
                    <MoreHorizontal className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditItem(loan)}>Editar</DropdownMenuItem>
                    <DropdownMenuItem onClick={async () => {
                      if (loan.paidInstallments < loan.totalInstallments) {
                        await updateLoan(loan.id, { paidInstallments: loan.paidInstallments + 1 });
                        toast.success(`Parcela do empréstimo ${loan.name} paga!`);
                      } else {
                        toast.error(`Empréstimo ${loan.name} já quitado!`);
                      }
                    }}>Pagar Parcela Atual</DropdownMenuItem>
                    <DropdownMenuItem onClick={async () => {
                      await deleteLoan(loan.id);
                      toast.error(`Empréstimo ${loan.name} apagado.`);
                    }} className="text-rose-500 focus:text-rose-500">Excluir</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="mt-2 mb-4">
                <div className="flex justify-between items-end mb-1">
                  <div>
                    <span className="text-2xl font-bold">R$ {loan.installmentValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                    <span className="text-sm text-muted-foreground ml-1">/mês</span>
                  </div>
                  <Badge variant="outline" className="bg-background text-xs font-normal border-border">
                    <Calendar className="w-3 h-3 mr-1" />
                    Faltam {remainingStr}
                  </Badge>
                </div>
              </div>

              <div className="space-y-1.5 mt-5 bg-muted/30 p-3 rounded-lg border border-border/50">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Progresso</span>
                  <span className="font-medium text-amber-600 dark:text-amber-500">{Math.round(progress)}% quitado</span>
                </div>
                <Progress value={progress} className="h-2 bg-muted-foreground/15 [&>div]:bg-amber-500" />
                <div className="flex justify-between text-[11px] pt-1 text-muted-foreground">
                  <span>{loan.paidInstallments} pagas</span>
                  <span>Dívida: R$ {remainingAmount.toLocaleString("pt-BR")}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      <LoanDialog 
        open={!!editItem}
        onOpenChange={(open: boolean) => !open && setEditItem(null)}
        defaultValues={editItem}
      />
    </div>
  );
}
