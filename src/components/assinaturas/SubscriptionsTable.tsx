"use client";

import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Subscription, useSubscriptions } from "@/hooks/useSubscriptions";
import { SubscriptionDialog } from "@/components/forms/SubscriptionDialog";

export function SubscriptionsTable() {
  const { subscriptions, loading, deleteSubscription, updateSubscription } = useSubscriptions();
  const [editItem, setEditItem] = useState<Subscription | null>(null);

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Carregando assinaturas...</div>;
  }

  if (subscriptions.length === 0) {
    return <div className="p-8 text-center text-muted-foreground">Nenhuma assinatura cadastrada ainda.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[260px]">Nome</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead className="hidden md:table-cell">Vencimento</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right pr-6">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscriptions.map((subscription) => (
            <TableRow key={subscription.id} className="group hover:bg-muted/50 transition-colors">
              <TableCell className="font-medium text-foreground">{subscription.name}</TableCell>
              <TableCell>
                <Badge variant="secondary" className="bg-secondary/50 text-secondary-foreground font-normal">
                  {subscription.category}
                </Badge>
              </TableCell>
              <TableCell className="font-semibold text-sky-600 dark:text-sky-500">
                R$ {subscription.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </TableCell>
              <TableCell className="hidden md:table-cell text-muted-foreground">Dia {subscription.billingDay}</TableCell>
              <TableCell>
                <Badge
                  variant={subscription.status === "active" ? "default" : "outline"}
                  className={
                    subscription.status === "active"
                      ? "bg-sky-500/15 text-sky-700 dark:text-sky-400 hover:bg-sky-500/25 border-sky-500/20"
                      : "text-muted-foreground border-border font-normal"
                  }
                >
                  {subscription.status === "active" ? "Ativa" : "Pausada"}
                </Badge>
              </TableCell>
              <TableCell className="pr-6 text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted focus:outline-none focus:ring-1 focus:ring-ring ml-auto">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Opções</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditItem(subscription)}>Editar</DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={async () => {
                        try {
                          const nextStatus = subscription.status === "active" ? "paused" : "active";
                          await updateSubscription(subscription.id, { status: nextStatus });
                          toast.success(`Assinatura ${subscription.name} ${nextStatus === "active" ? "reativada" : "pausada"}!`);
                        } catch {
                          toast.error("Erro ao atualizar assinatura.");
                        }
                      }}
                    >
                      {subscription.status === "active" ? "Pausar" : "Reativar"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={async () => {
                        try {
                          await deleteSubscription(subscription.id);
                          toast.error(`Assinatura ${subscription.name} removida.`);
                        } catch {
                          toast.error("Erro ao excluir assinatura.");
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

      <SubscriptionDialog
        open={!!editItem}
        onOpenChange={(open) => !open && setEditItem(null)}
        defaultValues={editItem}
      />
    </div>
  );
}
