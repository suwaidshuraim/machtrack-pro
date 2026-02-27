
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
  X
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
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "./ui/button"

const mainNav = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Machine Master", url: "/machines", icon: Box },
  { title: "Line Master", url: "/lines", icon: Factory },
  { title: "Machine Transfer", url: "/transfer/scan", icon: QrCode },
  { title: "Transfer History", url: "/transfers", icon: History },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { isMobile, setOpenMobile } = useSidebar()

  return (
    <Sidebar variant="sidebar" collapsible="icon" className="border-r-2 border-slate-100 bg-white">
      <SidebarHeader className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-2xl shadow-primary/20">
              <Factory className="size-7" />
            </div>
            <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
              <span className="font-black text-xl leading-none tracking-tighter text-slate-900 uppercase">MachTrack</span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mt-1">Pro Series</span>
            </div>
          </div>
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={() => setOpenMobile(false)} className="md:hidden">
              <X className="size-5" />
            </Button>
          )}
        </div>
      </SidebarHeader>
      <SidebarSeparator className="mx-6 opacity-50" />
      <SidebarContent className="px-4 py-8">
        <SidebarMenu className="gap-3">
          {mainNav.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.url}
                tooltip={item.title}
                className="h-12 rounded-2xl transition-all duration-300 font-bold px-4 data-[active=true]:bg-primary data-[active=true]:text-white data-[active=true]:shadow-lg data-[active=true]:shadow-primary/30"
                onClick={() => isMobile && setOpenMobile(false)}
              >
                <Link href={item.url}>
                  <item.icon className="size-5" />
                  <span className="font-bold tracking-tight">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-6">
        <SidebarMenu className="gap-2">
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Settings" className="h-12 rounded-2xl font-bold px-4">
              <Settings className="size-5" />
              <span className="group-data-[collapsible=icon]:hidden">Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Help Center" className="h-12 rounded-2xl font-bold px-4">
              <HelpCircle className="size-5" />
              <span className="group-data-[collapsible=icon]:hidden">Support</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
