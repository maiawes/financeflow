import { RelatoriosCharts } from "@/components/relatorios/RelatoriosCharts";

export default function RelatoriosPage() {
  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 pb-24 md:pb-8 flex flex-col min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Relatórios</h2>
          <p className="text-muted-foreground mt-1">Análises detalhadas das suas finanças.</p>
        </div>
      </div>
      
      <RelatoriosCharts />
    </div>
  );
}
