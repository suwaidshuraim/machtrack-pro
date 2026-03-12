
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { BottomNav } from "@/components/bottom-nav";
import { Toaster } from "@/components/ui/toaster";
import { Menu } from "lucide-react";

export const metadata: Metadata = {
  title: 'MachTrack Pro | Industrial Asset Management',
  description: 'Real-time manufacturing machine tracking and maintenance advisory.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MachTrack Pro',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: '#2E5AA5',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body selection:bg-accent selection:text-white" suppressHydrationWarning>
        <FirebaseClientProvider>
          <SidebarProvider defaultOpen={true}>
            <div className="flex min-h-screen w-full bg-background overflow-hidden">
              <AppSidebar />
              <div className="flex flex-1 flex-col min-h-screen relative overflow-y-auto">
                <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur md:px-8">
                  <div className="flex flex-1 items-center justify-between">
                    <h1 className="text-xl font-black tracking-tight text-primary uppercase">MachTrack Pro</h1>
                    <div className="flex items-center gap-4">
                      <div className="size-10 rounded-2xl bg-slate-100 border-2 border-slate-200 flex items-center justify-center font-black text-primary text-xs">
                        OP
                      </div>
                    </div>
                  </div>
                </header>
                <main className="flex-1 p-4 md:p-8 pb-24 md:pb-12 w-full max-w-7xl mx-auto">
                  {children}
                </main>
                <BottomNav />
              </div>
            </div>
            <Toaster />
            <FirebaseErrorListener />
          </SidebarProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
