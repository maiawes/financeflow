"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Landmark, PieChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { EmprestimosList } from "@/components/emprestimos/EmprestimosList";
import { useState } from "react";
import { LoanDialog } from "@/components/forms/LoanDialog";

export default function EmprestimosPage() {
  const [isNewOpen, setIsNewOpen] = useState(false);

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 pb-24 md:pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Consignados</h2>
          <p className="text-muted-foreground mt-1">Acompanhe seus empréstimos e parcelamentos longos.</p>
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
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-500">R$ 1.250,00</div>
            <p className="text-xs text-muted-foreground mt-1 text-rose-500 font-medium">
              14% da sua renda fixa
            </p>
          </CardContent>
        </Card>
        
        <Card className="sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margem Disponível</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 450,00</div>
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
            <div className="text-2xl font-bold">R$ 45.300,00</div>
            <div className="w-full bg-muted rounded-full h-1.5 mt-3">
              <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: "35%" }}></div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              35% já pago de todos os contratos vigentes
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
