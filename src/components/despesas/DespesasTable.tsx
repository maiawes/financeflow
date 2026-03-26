"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { TransactionDialog } from "@/components/forms/TransactionDialog";
import { useTransactions } from "@/hooks/useTransactions";

export function DespesasTable() {
  const { transactions, loading, deleteTransaction, updateTransaction } = useTransactions("expense");
  const [editItem, setEditItem] = useState<any>(null);

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Carregando despesas...</div>;
  }

  if (transactions.length === 0) {
    return <div className="p-8 text-center text-muted-foreground">Nenhuma despesa registrada. Adicione a sua primeira conta a pagar!</div>;
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
          {transactions.map((item) => (
            <TableRow key={item.id} className="group hover:bg-muted/50 transition-colors">
              <TableCell className="font-medium text-foreground">{item.desc}</TableCell>
              <TableCell>
                <Badge variant="secondary" className="bg-secondary/50 text-secondary-foreground font-normal">
                  {item.cat}
                </Badge>
              </TableCell>
              <TableCell className="font-semibold text-rose-600 dark:text-rose-500">
                - R$ {item.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </TableCell>
              <TableCell className="hidden md:table-cell text-muted-foreground">{item.date}</TableCell>
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
                      const newStatus = item.status === 'pago' ? 'pendente' : 'pago';
                      await updateTransaction(item.id, { status: newStatus });
                      toast.success(`Status de ${item.desc} alterado com sucesso!`);
                    }}>
                      Marcar como {item.status === 'pago' ? 'Pendente' : 'Pago'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={async () => {
                      await deleteTransaction(item.id);
                      toast.error(`Registro ${item.desc} apagado.`);
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
