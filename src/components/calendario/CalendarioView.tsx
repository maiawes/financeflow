"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DAYS_OF_WEEK = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const mockEvents = [
  { day: 5, title: "Salário Base", type: "income", amount: 5400 },
  { day: 5, title: "Energia Elétrica", type: "expense", amount: 245.5 },
  { day: 10, title: "Aluguel", type: "expense", amount: 1200 },
  { day: 15, title: "Bico", type: "income", amount: 1200 },
  { day: 20, title: "Parcela Carro", type: "expense", amount: 850 },
  { day: 25, title: "Consignado BB", type: "expense", amount: 550 },
];

export function CalendarioView() {
  // Hardcoded for Mar 2026 for now (starts on Sunday, 31 days)
  const daysInMonth = 31;
  const firstDayOfMonth = 0; // 0 = Sunday
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 sm:px-0 pb-6 sm:pt-0 border-b border-border/50 sm:border-none mb-4 sm:mb-0">
        <h3 className="text-xl font-bold tracking-tight">Março 2026</h3>
        <div className="flex space-x-2">
          <Button variant="outline" size="icon" className="w-8 h-8 sm:w-10 sm:h-10">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" className="w-8 h-8 sm:w-10 sm:h-10">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-px bg-border/40 sm:rounded-xl overflow-hidden flex-1 shadow-sm border border-border/50 sm:border-none">
        {DAYS_OF_WEEK.map((day) => (
          <div key={day} className="bg-muted/30 p-2 sm:p-3 text-center text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {day}
          </div>
        ))}
        
        {blanks.map((blank) => (
          <div key={`blank-${blank}`} className="bg-background min-h-[80px] sm:min-h-[120px] p-2" />
        ))}
        
        {days.map((day) => {
          const dayEvents = mockEvents.filter(e => e.day === day);
          const isToday = day === 15; 
          
          return (
            <div 
              key={day} 
              className={cn(
                "bg-background p-1.5 sm:p-2 transition-colors min-h-[80px] sm:min-h-[120px] group relative",
                isToday ? "bg-primary/[0.03]" : "hover:bg-muted/10"
              )}
            >
              <div className="flex justify-between items-start mb-1 sm:mb-2">
                <span className={cn(
                  "inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full text-[10px] sm:text-xs font-semibold",
                  isToday ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : "text-muted-foreground group-hover:text-foreground"
                )}>
                  {day}
                </span>
              </div>
              
              <div className="space-y-1">
                {dayEvents.map((evt, idx) => (
                  <div 
                    key={idx} 
                    className={cn(
                      "px-1.5 py-1 text-[9px] sm:text-[10px] rounded flex flex-col leading-tight overflow-hidden",
                      evt.type === "income" ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "bg-rose-500/10 text-rose-700 dark:text-rose-400"
                    )}
                    title={`${evt.title} - R$ ${evt.amount}`}
                  >
                    <span className="font-bold truncate">{evt.title}</span>
                    <span className="opacity-80 font-medium truncate hidden sm:inline-block">R$ {evt.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
