"use client";

import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatStoredDate } from "@/lib/date";
import { VariableExpense, useVariableExpenses } from "@/hooks/useVariableExpenses";
import { VariableExpenseDialog } from "@/components/forms/VariableExpenseDialog";

interface VariableExpensesTableProps {
  expenses: VariableExpense[];
  loading: boolean;
  monthLabel: string;
}

export function VariableExpensesTable({ expenses, loading, monthLabel }: VariableExpensesTableProps) {
  const { deleteVariableExpense } = useVariableExpenses();
  const [editItem, setEditItem] = useState<VariableExpense | null>(null);

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Carregando gastos variáveis...</div>;
  }

  if (expenses.length === 0) {
    return <div className="p-8 text-center text-muted-foreground">Nenhum gasto variável encontrado em {monthLabel}.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[260px]">Descrição</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead className="hidden md:table-cell">Data</TableHead>
            <TableHead className="text-right pr-6">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((expense) => (
            <TableRow key={expense.id} className="group hover:bg-muted/50 transition-colors">
              <TableCell className="font-medium text-foreground">{expense.name}</TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={
                    expense.category === "Combustível"
                      ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 font-normal"
                      : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-normal"
                  }
                >
                  {expense.category}
                </Badge>
              </TableCell>
              <TableCell className="font-semibold text-orange-600 dark:text-orange-500">
                R$ {expense.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </TableCell>
              <TableCell className="hidden md:table-cell text-muted-foreground">{formatStoredDate(expense.date) || "S/ data"}</TableCell>
              <TableCell className="pr-6 text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted focus:outline-none focus:ring-1 focus:ring-ring ml-auto">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Opções</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditItem(expense)}>Editar</DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={async () => {
                        try {
                          await deleteVariableExpense(expense.id);
                          toast.error(`Gasto ${expense.name} removido.`);
                        } catch {
                          toast.error("Erro ao excluir gasto.");
                        }
                      }}
                      className="text-rose-500 focus:text-rose-500"
                    >
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <VariableExpenseDialog
        open={!!editItem}
        onOpenChange={(open) => !open && setEditItem(null)}
        defaultValues={editItem}
      />
    </div>
  );
}
