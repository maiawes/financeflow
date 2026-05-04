"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { TransactionDialog } from "@/components/forms/TransactionDialog";
import { Transaction, useTransactions } from "@/hooks/useTransactions";
import { formatStoredDate } from "@/lib/date";
import { formatMonthKey, formatTransactionDescription, isTransactionInMonth } from "@/lib/transactions";
import { parseStoredDate } from "@/lib/date";

interface DespesasTableProps {
  referenceMonth: string;
}

export function DespesasTable({ referenceMonth }: DespesasTableProps) {
  const { transactions, loading, deleteTransaction, updateTransaction } = useTransactions("expense");
  const [editItem, setEditItem] = useState<Transaction | null>(null);
  const monthTransactions = transactions
    .filter((transaction) => isTransactionInMonth(transaction, referenceMonth))
    .sort((a, b) => {
      const dateA = parseStoredDate(a.date)?.getTime() ?? Number.MAX_SAFE_INTEGER;
      const dateB = parseStoredDate(b.date)?.getTime() ?? Number.MAX_SAFE_INTEGER;
      return dateA - dateB;
    });
  const referenceMonthLabel = formatMonthKey(referenceMonth);

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Carregando despesas...</div>;
  }

  if (monthTransactions.length === 0) {
    return <div className="p-8 text-center text-muted-foreground">Nenhuma despesa encontrada em {referenceMonthLabel}. Adicione a sua primeira conta a pagar!</div>;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[300px]">Descrição</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead className="hidden md:table-cell">Vencimento</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right pr-6">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {monthTransactions.map((item) => (
            <TableRow key={item.id} className="group hover:bg-muted/50 transition-colors">
              <TableCell className="font-medium text-foreground">{formatTransactionDescription(item)}</TableCell>
              <TableCell>
                <Badge variant="secondary" className="bg-secondary/50 text-secondary-foreground font-normal">
                  {item.cat}
                </Badge>
              </TableCell>
              <TableCell className="font-semibold text-rose-600 dark:text-rose-500">
                - R$ {item.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </TableCell>
              <TableCell className="hidden md:table-cell text-muted-foreground">{formatStoredDate(item.date) || "S/ data"}</TableCell>
              <TableCell>
                <Badge 
                  variant={item.status === "pago" ? "default" : "outline"} 
                  className={item.status === "pago" 
                    ? "bg-slate-100 text-slate-600 hover:bg-slate-200 border-transparent dark:bg-slate-800 dark:text-slate-400" 
                    : "text-rose-600 border-rose-500/30 dark:text-rose-400 font-normal"}
                >
                  {item.status === "pago" ? "Pago" : "A vencer"}
                </Badge>
              </TableCell>
              <TableCell className="pr-6 text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted focus:outline-none focus:ring-1 focus:ring-ring ml-auto">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Opções</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditItem(item)}>Editar</DropdownMenuItem>
                    <DropdownMenuItem onClick={async () => {
                      try {
                        const newStatus = item.status === 'pago' ? 'pendente' : 'pago';
                        await updateTransaction(item.id, { status: newStatus });
                        toast.success(`Status de ${item.desc} alterado com sucesso!`);
                      } catch {
                        toast.error("Erro ao atualizar status.");
                      }
                    }}>
                      Marcar como {item.status === 'pago' ? 'Pendente' : 'Pago'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={async () => {
                      try {
                        await deleteTransaction(item.id);
                        toast.error(`Registro ${item.desc} apagado.`);
                      } catch {
                        toast.error("Erro ao excluir despesa.");
                      }
                    }} className="text-rose-500 focus:text-rose-500">Excluir</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <TransactionDialog 
        type="expense"
        open={!!editItem}
        onOpenChange={(open) => !open && setEditItem(null)}
        defaultValues={editItem}
      />
    </div>
  );
}
