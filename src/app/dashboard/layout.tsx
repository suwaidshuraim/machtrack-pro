
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { BottomNav } from "@/components/bottom-nav"
import { Toaster } from "@/components/ui/toaster"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 md:h-16 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur">
          <SidebarTrigger className="hidden md:inline-flex" />
          <div className="flex flex-1 items-center justify-between">
            <h1 className="text-lg md:text-xl font-bold tracking-tight text-primary">MachTrack Pro</h1>
            <div className="flex items-center gap-4">
              <div className="size-8 rounded-full bg-slate-200" />
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-background pb-20 md:pb-8">
          <div className="mx-auto max-w-7xl space-y-6 md:space-y-8">
            {children}
          </div>
        </main>
        <BottomNav />
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  )
}
