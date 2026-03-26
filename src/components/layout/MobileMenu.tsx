"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/ThemeToggle";

export function MobileMenu({ open, onOpenChange }: { open: boolean, onOpenChange: (o: boolean) => void }) {
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0 flex flex-col">
        <SheetHeader className="p-6 border-b border-border text-left">
          <SheetTitle className="flex items-center space-x-2">
			<div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg shadow-primary/30">
			  F
			</div>
			<span className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
			  FinanceFlow
			</span>
		  </SheetTitle>
        </SheetHeader>
        
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onOpenChange(false)}
                className={cn(
                  "flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 group active:scale-95",
                  isActive
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <div className={cn(
                  "p-2 rounded-lg transition-colors",
                  isActive ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground group-hover:text-foreground group-hover:bg-background"
                )}>
                  <item.icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-border bg-muted/30 flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shadow-inner shrink-0">
              U
            </div>
            <div className="flex-1 min-w-0 pr-2">
              <p className="text-sm font-medium truncate text-foreground">Usuário Teste</p>
              <p className="text-xs text-muted-foreground truncate">Plano Free</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </SheetContent>
    </Sheet>
  );
}
