
"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Box,
  Settings,
  HelpCircle,
  Factory,
  QrCode,
  History,
  ChevronRight
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"

const mainNav = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Machine Master", url: "/machines", icon: Box },
  { title: "Line Master", url: "/lines", icon: Factory },
  { title: "Transfer Machine", url: "/transfer/scan", icon: QrCode },
  { title: "History", url: "/transfers", icon: History },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar variant="sidebar" collapsible="none" className="hidden md:flex border-r border-slate-800 bg-slate-950 text-slate-200">
      <SidebarHeader className="p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-xl shadow-primary/20">
            <Factory className="size-7" />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="font-black text-xl leading-none tracking-tighter text-white uppercase">MachTrack</span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mt-1">Pro Series</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarSeparator className="mx-6 opacity-20 bg-slate-700" />
      <SidebarContent className="px-4 py-8">
        <SidebarMenu className="gap-3">
          {mainNav.map((item) => {
            const isActive = pathname === item.url
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  className="h-14 rounded-2xl transition-all duration-300 font-bold px-4 data-[active=true]:bg-primary data-[active=true]:text-white data-[active=true]:shadow-lg data-[active=true]:shadow-primary/30 text-slate-400 hover:text-white hover:bg-white/5 group"
                >
                  <Link href={item.url} className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <item.icon className="size-5" />
                      <span className="font-bold tracking-tight">{item.title}</span>
                    </div>
                    {isActive && <ChevronRight className="size-4 opacity-50" />}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-8 space-y-4">
        <SidebarMenu className="gap-2">
          <SidebarMenuItem>
            <SidebarMenuButton className="h-12 rounded-2xl font-bold px-4 text-slate-400 hover:text-white hover:bg-white/5">
              <Settings className="size-5" />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton className="h-12 rounded-2xl font-bold px-4 text-slate-400 hover:text-white hover:bg-white/5">
              <HelpCircle className="size-5" />
              <span>Support</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Environment</p>
          <p className="text-xs font-bold text-slate-300 mt-1">Production Node 01</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
