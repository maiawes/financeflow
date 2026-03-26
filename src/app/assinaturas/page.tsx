"use client";

import { useState } from "react";
import { BellRing, CalendarClock, Download, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SubscriptionsTable } from "@/components/assinaturas/SubscriptionsTable";
import { SubscriptionDialog } from "@/components/forms/SubscriptionDialog";
import { useSubscriptions } from "@/hooks/useSubscriptions";

function getNextBillingLabel(days: number[]) {
  if (days.length === 0) {
    return "Sem vencimentos";
  }

  const today = new Date().getDate();
  const nextDay = [...days].sort((a, b) => a - b).find((day) => day >= today);

  if (nextDay) {
    return `Dia ${nextDay}`;
  }

  return `Dia ${Math.min(...days)} (próximo ciclo)`;
}

export default function AssinaturasPage() {
  const [isNewOpen, setIsNewOpen] = useState(false);
  const { subscriptions, loading } = useSubscriptions();

  const activeSubscriptions = subscriptions.filter((subscription) => subscription.status === "active");
  const pausedSubscriptions = subscriptions.filter((subscription) => subscription.status === "paused");
  const monthlyTotal = activeSubscriptions.reduce((acc, curr) => acc + curr.amount, 0);
  const yearlyTotal = monthlyTotal * 12;
  const nextBillingLabel = getNextBillingLabel(activeSubscriptions.map((subscription) => subscription.billingDay));

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 pb-24 md:pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Assinaturas</h2>
          <p className="text-muted-foreground mt-1">Cadastre e acompanhe seus gastos recorrentes mensais.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="hidden sm:flex" onClick={() => toast.success("Exportação de assinaturas em desenvolvimento!")}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button size="sm" className="bg-sky-600 hover:bg-sky-700 text-white" onClick={() => setIsNewOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Assinatura
          </Button>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card className="bg-gradient-to-br from-sky-500/10 via-sky-500/5 to-transparent border-sky-500/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assinaturas Ativas</CardTitle>
            <BellRing className="w-4 h-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-sky-700 dark:text-sky-400">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : activeSubscriptions.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {loading ? "Calculando..." : `${pausedSubscriptions.length} pausada(s) no momento`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custo Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : `R$ ${monthlyTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {loading ? "Calculando..." : `R$ ${yearlyTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} por ano`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximo Vencimento</CardTitle>
            <CalendarClock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : nextBillingLabel}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Baseado nas assinaturas ativas
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-border/50 overflow-hidden">
        <CardHeader className="px-6 py-4 border-b border-border/50 bg-muted/10">
          <CardTitle>Assinaturas Cadastradas</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <SubscriptionsTable />
        </CardContent>
      </Card>

      <SubscriptionDialog open={isNewOpen} onOpenChange={setIsNewOpen} />
    </div>
  );
}
