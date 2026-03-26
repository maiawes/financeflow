import { Card, CardContent } from "@/components/ui/card";
import { CalendarioView } from "@/components/calendario/CalendarioView";

export default function CalendarioPage() {
  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 pb-24 md:pb-8 flex flex-col min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Calendário</h2>
          <p className="text-muted-foreground mt-1">Visão mensal de recebimentos e vencimentos.</p>
        </div>
      </div>
      
      <Card className="flex-1 shadow-sm border-border/50 flex flex-col overflow-hidden bg-background">
        <CardContent className="flex-1 p-0 sm:p-6 sm:pt-6 flex flex-col min-h-[500px]">
          <CalendarioView />
        </CardContent>
      </Card>
    </div>
  );
}
