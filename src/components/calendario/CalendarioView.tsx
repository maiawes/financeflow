"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTransactions } from "@/hooks/useTransactions";
import { useState } from "react";
import { format, getDaysInMonth, startOfMonth, getDay, addMonths, subMonths, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatTransactionDescription } from "@/lib/transactions";

const DAYS_OF_WEEK = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function CalendarioView() {
  const { transactions } = useTransactions();
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = getDaysInMonth(currentDate);
  const start = startOfMonth(currentDate);
  const firstDayOfMonth = getDay(start); // 0 = Sunday
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const monthName = format(currentDate, "MMMM yyyy", { locale: ptBR });
  const yearMonth = format(currentDate, "yyyy-MM");

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 sm:px-0 pb-6 sm:pt-0 border-b border-border/50 sm:border-none mb-4 sm:mb-0">
        <h3 className="text-xl font-bold tracking-tight capitalize">{monthName}</h3>
        <div className="flex space-x-2">
          <Button variant="outline" size="icon" className="w-8 h-8 sm:w-10 sm:h-10" onClick={prevMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" className="w-8 h-8 sm:w-10 sm:h-10" onClick={nextMonth}>
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
          const dateStr = `${yearMonth}-${String(day).padStart(2, '0')}`;
          const dayEvents = transactions.filter(e => e.date === dateStr);
          const isToday = isSameDay(new Date(currentDate.getFullYear(), currentDate.getMonth(), day), new Date()); 
          
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
                    title={`${formatTransactionDescription(evt)} - R$ ${evt.value}`}
                  >
                    <span className="font-bold truncate">{formatTransactionDescription(evt)}</span>
                    <span className="opacity-80 font-medium truncate hidden sm:inline-block">R$ {evt.value}</span>
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
