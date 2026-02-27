"use client"

import { useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection } from "firebase/firestore"
import { 
  Repeat, 
  LayoutGrid, 
  Loader2
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Machine } from "@/lib/types"

const MACHINE_TYPE_METADATA: Record<string, { icon: string, color: string }> = {
  "Flat Bed": { icon: 'https://picsum.photos/seed/flatbed/400/300', color: 'bg-green-500' },
  "Cylinder": { icon: 'https://picsum.photos/seed/cylinder/400/300', color: 'bg-blue-500' },
  "High Post": { icon: 'https://picsum.photos/seed/highpost/400/300', color: 'bg-blue-600' },
  "AMS": { icon: 'https://picsum.photos/seed/ams/400/300', color: 'bg-green-600' },
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
    const bank = safeMachines.filter(m => m.status === 'Bank').length
    const repair = safeMachines.filter(m => m.status === 'Breakdown' || m.status === 'Repair').length
    
    const activeTypes = Array.from(new Set(safeMachines.map(m => m.type))).filter(Boolean)
    
    return {
      running,
      bank,
      repair,
      total: safeMachines.length,
      activeTypes
    }
  }, [machines])

  if (isLoading && !machines) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="size-10 animate-spin text-blue-500" />
          <p className="text-sm font-bold text-slate-500 animate-pulse uppercase tracking-widest text-center">
            Synchronizing Factory Data...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12" suppressHydrationWarning>
      <Card className="border-none shadow-xl bg-white/80 backdrop-blur-md rounded-3xl overflow-hidden">
        <CardContent className="p-8 flex flex-col md:flex-row items-center justify-around gap-6 md:gap-0">
          <div className="text-center group">
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] mb-1">Total Machines</p>
            <p className="text-4xl font-black text-slate-900 group-hover:scale-110 transition-transform">{stats.total}</p>
          </div>
          <div className="hidden md:block h-12 w-px bg-slate-100" />
          <div className="text-center group">
            <p className="text-[10px] text-green-600 font-black uppercase tracking-[0.2em] mb-1">Active</p>
            <p className="text-4xl font-black text-green-600 group-hover:scale-110 transition-transform">{stats.running}</p>
          </div>
          <div className="hidden md:block h-12 w-px bg-slate-100" />
          <div className="text-center group">
            <p className="text-[10px] text-blue-600 font-black uppercase tracking-[0.2em] mb-1">In Bank</p>
            <p className="text-4xl font-black text-blue-600 group-hover:scale-110 transition-transform">{stats.bank}</p>
          </div>
          <div className="hidden md:block h-12 w-px bg-slate-100" />
          <div className="text-center group">
            <p className="text-[10px] text-red-500 font-black uppercase tracking-[0.2em] mb-1">In Repair</p>
            <p className="text-4xl font-black text-red-500 group-hover:scale-110 transition-transform">{stats.repair}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/transfer/scan">
          <div className="flex items-center gap-5 p-6 rounded-3xl bg-slate-900 text-white shadow-xl hover:bg-slate-800 transition-all hover:-translate-y-1 active:scale-95 group">
            <div className="p-3 bg-white/10 rounded-2xl group-hover:bg-blue-500 transition-colors">
              <Repeat className="size-8" />
            </div>
            <div>
              <p className="font-black text-xl">Machine Transfer</p>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Instant Relocation</p>
            </div>
          </div>
        </Link>

        <Link href="/machines">
          <div className="flex items-center gap-5 p-6 rounded-3xl bg-blue-600 text-white shadow-xl hover:bg-blue-700 transition-all hover:-translate-y-1 active:scale-95 group">
            <div className="p-3 bg-white/20 rounded-2xl group-hover:bg-white/40 transition-colors">
              <LayoutGrid className="size-8" />
            </div>
            <div>
              <p className="font-black text-xl">Machine Master</p>
              <p className="text-blue-100 text-xs font-bold uppercase tracking-wider">Full Inventory Control</p>
            </div>
          </div>
        </Link>
      </div>

      <div className="space-y-6 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Available Fleet Categories</h2>
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{stats.activeTypes.length} Types Active</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stats.activeTypes.map((typeName) => {
            const meta = MACHINE_TYPE_METADATA[typeName] || MACHINE_TYPE_METADATA["Others"]
            const typeMachines = (machines || []).filter(m => m.type === typeName)
            const typeRunning = typeMachines.filter(m => m.status === 'Running' || m.status === 'Idle').length
            
            return (
              <Card key={typeName} className="overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all group rounded-3xl">
                <CardContent className="p-0 flex items-center bg-white h-full">
                  <div className="p-6 flex-1">
                    <h3 className="font-black text-2xl mb-4 text-slate-800 leading-tight">{typeName}</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className={cn("size-3 rounded-full animate-pulse", meta.color)} />
                        <span className="text-sm font-black text-slate-600 uppercase tracking-wider">{typeRunning} Running</span>
                      </div>
                      <div className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                        Total Stock: <span className="font-black text-slate-900 ml-1">{typeMachines.length}</span>
                      </div>
                    </div>
                  </div>
                  <div className="relative w-40 h-44 border-l border-slate-50 overflow-hidden shrink-0">
                    <Image 
                      src={meta.icon} 
                      alt={typeName} 
                      width={160}
                      height={176}
                      className="object-cover transition-transform duration-700 group-hover:scale-125"
                      data-ai-hint="industrial machine"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
                  </div>
                </CardContent>
              </Card>
            )
          })}
          {stats.activeTypes.length === 0 && (
            <div className="col-span-2 py-16 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
              <p className="text-slate-500 font-black">No active machines found.</p>
              <p className="text-slate-400 text-sm mt-1">Register machines to see your fleet analytics here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
