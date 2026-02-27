
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
  { title: "Machines", url: "/machines", icon: Box },
  { title: "Scan", url: "/transfer/scan", icon: QrCode },
  { title: "Lines", url: "/lines", icon: Factory },
  { title: "History", url: "/transfers", icon: History },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-white border-t border-slate-200 md:hidden flex items-center justify-around px-2 pb-safe">
      {navItems.map((item) => {
        const isActive = pathname === item.url
        return (
          <Link 
            key={item.url} 
            href={item.url}
            className={cn(
              "flex flex-col items-center justify-center gap-1 w-full h-full transition-colors",
              isActive ? "text-primary" : "text-slate-400"
            )}
          >
            <item.icon className={cn("size-6", isActive && "animate-in zoom-in duration-300")} />
            <span className="text-[10px] font-bold uppercase tracking-tight">{item.title}</span>
          </Link>
        )
      })}
    </nav>
  )
}
