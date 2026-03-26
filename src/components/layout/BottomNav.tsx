"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import { MobileMenu } from "./MobileMenu";
import { useState } from "react";

export function BottomNav() {
  const pathname = usePathname();
  const mobileNavItems = NAV_ITEMS.slice(0, 4);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-background/90 backdrop-blur-xl border-t border-border z-40 px-2 pb-safe flex items-center justify-between shadow-[0_-4px_15px_-3px_rgba(0,0,0,0.05)]">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full space-y-1 relative transition-all duration-300",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isActive && (
                <div className="absolute top-0 w-8 h-1 bg-primary rounded-b-full shadow-[0_2px_8px_rgba(var(--primary),0.8)]" />
              )}
              <item.icon className={cn("w-5 h-5", isActive && "animate-in zoom-in-75 duration-300")} />
              <span className={cn("text-[10px] sm:text-xs font-medium tracking-tight", isActive && "font-bold")}>{item.name}</span>
            </Link>
          );
        })}
        
        <button
          onClick={() => setIsMenuOpen(true)}
          className="flex flex-col items-center justify-center flex-1 h-full space-y-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] sm:text-xs font-medium tracking-tight">Mais</span>
        </button>
      </nav>
      
      <MobileMenu open={isMenuOpen} onOpenChange={setIsMenuOpen} />
    </>
  );
}
