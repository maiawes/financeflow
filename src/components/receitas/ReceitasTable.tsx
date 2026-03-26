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
import { formatMonthKey, isTransactionInMonth } from "@/lib/transactions";

interface ReceitasTableProps {
  referenceMonth: string;
}

export function ReceitasTable({ referenceMonth }: ReceitasTableProps) {
  const { transactions, loading, deleteTransaction, updateTransaction } = useTransactions("income");
  const [editItem, setEditItem] = useState<Transaction | null>(null);
  const monthTransactions = transactions.filter((transaction) => isTransactionInMonth(transaction, referenceMonth));
  const referenceMonthLabel = formatMonthKey(referenceMonth);

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Carregando receitas...</div>;
  }

  if (monthTransactions.length === 0) {
    return <div className="p-8 text-center text-muted-foreground">Nenhuma receita encontrada em {referenceMonthLabel}. Adicione sua primeira!</div>;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[300px]">Descrição</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead className="hidden md:table-cell">Data</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right pr-6">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {monthTransactions.map((rec) => (
            <TableRow key={rec.id} className="group hover:bg-muted/50 transition-colors">
              <TableCell className="font-medium text-foreground">{rec.desc}</TableCell>
              <TableCell>
                <Badge variant="secondary" className="bg-secondary/50 text-secondary-foreground font-normal">
                  {rec.cat}
                </Badge>
              </TableCell>
              <TableCell className="font-semibold text-emerald-600 dark:text-emerald-500">
                + R$ {rec.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </TableCell>
              <TableCell className="hidden md:table-cell text-muted-foreground">{formatStoredDate(rec.date) || "S/ data"}</TableCell>
              <TableCell>
                <Badge 
                  variant={rec.status === "recebido" ? "default" : "outline"} 
                  className={rec.status === "recebido" 
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 border-emerald-500/20" 
                    : "text-amber-600 border-amber-500/30 dark:text-amber-400 font-normal"}
                >
                  {rec.status === "recebido" ? "Recebido" : "Pendente"}
                </Badge>
              </TableCell>
              <TableCell className="pr-6 text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted focus:outline-none focus:ring-1 focus:ring-ring ml-auto">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Opções</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditItem(rec)}>Editar</DropdownMenuItem>
                    <DropdownMenuItem onClick={async () => {
                      const newStatus = rec.status === 'recebido' ? 'pendente' : 'recebido';
                      await updateTransaction(rec.id, { status: newStatus });
                      toast.success(`Status de ${rec.desc} alterado!`);
                    }}>
                      Marcar como {rec.status === 'recebido' ? 'Pendente' : 'Recebido'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={async () => {
                      await deleteTransaction(rec.id);
                      toast.error(`${rec.desc} foi excluído!`);
                    }} className="text-rose-500 focus:text-rose-500">Excluir</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <TransactionDialog 
        type="income"
        open={!!editItem}
        onOpenChange={(open) => !open && setEditItem(null)}
        defaultValues={editItem}
      />
    </div>
  );
}
