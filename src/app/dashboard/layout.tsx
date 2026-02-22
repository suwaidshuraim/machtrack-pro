
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
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
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur">
          <SidebarTrigger />
          <div className="flex flex-1 items-center justify-between">
            <h1 className="text-xl font-semibold tracking-tight">MachTrack Pro</h1>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-background">
          <div className="mx-auto max-w-7xl space-y-8">
            {children}
          </div>
        </main>
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  )
}
