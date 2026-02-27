
"use client"

import { useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection } from "firebase/firestore"
import { 
  Repeat, 
  LayoutGrid, 
  Loader2,
  AlertCircle,
  TrendingUp,
  Factory,
  History
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Machine } from "@/lib/types"
import { DashboardCharts } from "@/components/dashboard-charts"

const MACHINE_TYPE_METADATA: Record<string, { icon: string, color: string }> = {
  "Flat Bed": { icon: 'https://picsum.photos/seed/flatbed/400/300', color: 'bg-emerald-500' },
  "Cylinder": { icon: 'https://picsum.photos/seed/cylinder/400/300', color: 'bg-blue-500' },
  "High Post": { icon: 'https://picsum.photos/seed/highpost/400/300', color: 'bg-indigo-600' },
  "AMS": { icon: 'https://picsum.photos/seed/ams/400/300', color: 'bg-teal-500' },
  "Overlock": { icon: 'https://picsum.photos/seed/overlock/400/300', color: 'bg-orange-500' },
  "Embossing": { icon: 'https://picsum.photos/seed/emboss/400/300', color: 'bg-purple-500' },
  "Pressing": { icon: 'https://picsum.photos/seed/press/400/300', color: 'bg-amber-500' },
  "Others": { icon: 'https://picsum.photos/seed/generic/400/300', color: 'bg-slate-400' },
}

export default function DashboardPage() {
  const firestore = useFirestore()

  const machinesQuery = useMemoFirebase(() => {
    if (!firestore) return null
    return collection(firestore, "machines")
  }, [firestore])

  const { data: machines, isLoading } = useCollection<Machine>(machinesQuery)

  const stats = useMemo(() => {
    const safeMachines = machines || []
    const running = safeMachines.filter(m => m.status === 'Running' || m.status === 'Idle').length
    const repair = safeMachines.filter(m => m.status === 'Breakdown' || m.status === 'Repair').length
    
    const activeTypes = Array.from(new Set(safeMachines.map(m => m.type))).filter(Boolean)
    
    return {
      running,
      repair,
      total: safeMachines.length,
      activeTypes
    }
  }, [machines])

  if (isLoading && !machines) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="size-10 animate-spin text-primary" />
          <p className="text-sm font-bold text-slate-500 animate-pulse uppercase tracking-widest text-center">
            Synchronizing Factory Data...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 md:space-y-8 pb-12">
      {/* Primary Action Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/transfer/scan" className="col-span-1">
          <Card className="border-none shadow-md bg-primary text-white hover:bg-primary/90 transition-all active:scale-95 h-full rounded-2xl">
            <CardContent className="p-4 md:p-6 flex flex-col items-center justify-center text-center gap-2">
              <div className="p-2 md:p-3 bg-white/10 rounded-xl">
                <Repeat className="size-5 md:size-6" />
              </div>
              <span className="font-bold text-xs md:text-sm">Machine Transfer</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/machines" className="col-span-1">
          <Card className="border-none shadow-md bg-accent text-white hover:bg-accent/90 transition-all active:scale-95 h-full rounded-2xl">
            <CardContent className="p-4 md:p-6 flex flex-col items-center justify-center text-center gap-2">
              <div className="p-2 md:p-3 bg-white/20 rounded-xl">
                <LayoutGrid className="size-5 md:size-6" />
              </div>
              <span className="font-bold text-xs md:text-sm">Machine Master</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/lines" className="col-span-1">
          <Card className="border-none shadow-md bg-slate-800 text-white hover:bg-slate-700 transition-all active:scale-95 h-full rounded-2xl">
            <CardContent className="p-4 md:p-6 flex flex-col items-center justify-center text-center gap-2">
              <div className="p-2 md:p-3 bg-white/10 rounded-xl">
                <Factory className="size-5 md:size-6" />
              </div>
              <span className="font-bold text-xs md:text-sm">Line Master</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/transfers" className="col-span-1">
          <Card className="border-none shadow-md bg-white text-slate-900 border border-slate-100 hover:bg-slate-50 transition-all active:scale-95 h-full rounded-2xl">
            <CardContent className="p-4 md:p-6 flex flex-col items-center justify-center text-center gap-2">
              <div className="p-2 md:p-3 bg-slate-100 rounded-xl">
                <History className="size-5 md:size-6 text-primary" />
              </div>
              <span className="font-bold text-xs md:text-sm text-slate-600">Transfer History</span>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-none shadow-md bg-white rounded-2xl">
          <CardContent className="p-4 md:p-6 flex flex-col items-center justify-center text-center gap-1">
            <TrendingUp className="size-5 text-emerald-500 mb-1" />
            <span className="text-2xl font-black text-slate-900">{stats.running}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Active Units</span>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md bg-white rounded-2xl">
          <CardContent className="p-4 md:p-6 flex flex-col items-center justify-center text-center gap-1">
            <AlertCircle className="size-5 text-red-500 mb-1" />
            <span className="text-2xl font-black text-slate-900">{stats.repair}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-red-500">In Repair</span>
          </CardContent>
        </Card>
      </div>

      <DashboardCharts machines={machines || []} />

      <div className="space-y-6 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Active Categories</h2>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stats.activeTypes.length} Classes</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.activeTypes.map((typeName) => {
            const meta = MACHINE_TYPE_METADATA[typeName] || MACHINE_TYPE_METADATA["Others"]
            const typeMachines = (machines || []).filter(m => m.type === typeName)
            const typeRunning = typeMachines.filter(m => m.status === 'Running' || m.status === 'Idle').length
            
            return (
              <Card key={typeName} className="overflow-hidden border-none shadow-md hover:shadow-xl transition-all group rounded-2xl bg-white">
                <CardContent className="p-0 flex flex-col">
                  <div className="relative h-32 w-full overflow-hidden">
                    <Image 
                      src={meta.icon} 
                      alt={typeName} 
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      data-ai-hint="industrial machine"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                    <div className="absolute bottom-3 left-4">
                      <h3 className="font-black text-white text-lg leading-tight">{typeName}</h3>
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={cn("size-2 rounded-full", meta.color)} />
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">{typeRunning} Running</span>
                      </div>
                      <span className="text-xs font-black text-slate-900">{typeMachines.length} Units</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
