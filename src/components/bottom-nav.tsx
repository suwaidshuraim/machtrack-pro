
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Box, 
  Factory, 
  QrCode, 
  History 
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { title: "Home", url: "/dashboard", icon: LayoutDashboard },
  { title: "Fleet", url: "/machines", icon: Box },
  { title: "Scan", url: "/transfer/scan", icon: QrCode },
  { title: "Lines", url: "/lines", icon: Factory },
  { title: "Logs", url: "/transfers", icon: History },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-20 bg-white/95 backdrop-blur-md border-t-2 border-slate-100 md:hidden flex items-center justify-around px-2 pb-safe shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
      {navItems.map((item) => {
        const isActive = pathname === item.url
        return (
          <Link 
            key={item.url} 
            href={item.url}
            className={cn(
              "flex flex-col items-center justify-center gap-1.5 w-full h-full transition-all duration-300 relative",
              isActive ? "text-primary" : "text-slate-400"
            )}
          >
            {isActive && (
              <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full animate-in fade-in zoom-in duration-300" />
            )}
            <div className={cn(
              "p-2 rounded-xl transition-all duration-300",
              isActive && "bg-primary/10"
            )}>
              <item.icon className={cn("size-6", isActive && "scale-110")} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest leading-none">{item.title}</span>
          </Link>
        )
      })}
    </nav>
  )
}
