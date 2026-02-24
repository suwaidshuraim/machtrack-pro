
"use client"

import { Card, CardContent } from "@/components/ui/card"
import { MACHINES } from "@/lib/mock-data"
import { 
  Repeat, 
  History, 
  LayoutGrid, 
  ChevronRight, 
  Wrench, 
  Factory, 
  Image as ImageIcon
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { PlaceHolderImages } from "@/lib/placeholder-images"

export default function DashboardPage() {
  // Statistics calculation based on specified categories
  // "Running" includes both Running and Idle as they are operational units
  const runningCount = MACHINES.filter(m => m.status === 'Running' || m.status === 'Idle').length
  const bankCount = MACHINES.filter(m => m.status === 'Bank').length
  const repairCount = MACHINES.filter(m => m.status === 'Breakdown' || m.status === 'Repair').length
  
  // Total must match the sum of these three core categories
  const totalCount = runningCount + bankCount + repairCount

  // Get unique types from the actual machine master
  const availableTypes = Array.from(new Set(MACHINES.map(m => m.type)))
  
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

  const getTypeStats = (typeName: string) => {
    const filtered = MACHINES.filter(m => m.type === typeName)
    return {
      total: filtered.length,
      running: filtered.filter(m => m.status === 'Running' || m.status === 'Idle').length
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Stats Bar - Balanced categories */}
      <Card className="border-none shadow-md bg-white/80 backdrop-blur">
        <CardContent className="p-4 flex flex-col md:flex-row items-center justify-around gap-4 md:gap-0">
          <div className="text-center">
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Total Machines</p>
            <p className="text-3xl font-black">{totalCount}</p>
          </div>
          <div className="hidden md:block h-10 w-px bg-border mx-4" />
          <div className="text-center">
            <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest">Active (Running/Idle)</p>
            <p className="text-3xl font-black text-green-600">{runningCount}</p>
          </div>
          <div className="hidden md:block h-10 w-px bg-border mx-4" />
          <div className="text-center">
            <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">Machine Bank</p>
            <p className="text-3xl font-black text-blue-600">{bankCount}</p>
          </div>
          <div className="hidden md:block h-10 w-px bg-border mx-4" />
          <div className="text-center">
            <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest">Repair / Breakdown</p>
            <p className="text-3xl font-black text-red-500">{repairCount}</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Types of Machines</h2>
        <span className="text-xs font-bold text-muted-foreground uppercase">{availableTypes.length} Active Categories</span>
      </div>

      {/* Machine Type Grid - Only show types available in master */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {availableTypes.map((typeName) => {
          const meta = MACHINE_TYPE_METADATA[typeName] || MACHINE_TYPE_METADATA["Others"]
          const stats = getTypeStats(typeName)
          return (
            <Card key={typeName} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all group">
              <CardContent className="p-0 flex items-center bg-white">
                <div className="p-5 flex-1">
                  <h3 className="font-black text-xl mb-3 text-slate-800">{typeName}</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className={cn("size-2.5 rounded-full animate-pulse", meta.color)} />
                      <span className="text-sm font-bold text-slate-600">{stats.running} Active nos</span>
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">
                      Total Inventory: <span className="font-bold text-slate-900">{stats.total}</span>
                    </div>
                  </div>
                </div>
                <div className="relative w-44 h-36 border-l overflow-hidden">
                  <Image 
                    src={meta.icon} 
                    alt={typeName} 
                    fill 
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    data-ai-hint="industrial machine"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/machines">
          <div className="flex items-center gap-4 p-5 rounded-2xl bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-all hover:-translate-y-1">
            <div className="p-2 bg-white/20 rounded-xl">
              <LayoutGrid className="size-8" />
            </div>
            <div>
              <p className="font-black text-lg">Machine Master</p>
              <p className="text-blue-100 text-xs font-medium">Full asset registry & control</p>
            </div>
          </div>
        </Link>

        <Link href="/lines">
          <div className="flex items-center gap-4 p-5 rounded-2xl bg-slate-800 text-white shadow-lg hover:bg-slate-900 transition-all hover:-translate-y-1">
            <div className="p-2 bg-white/20 rounded-xl">
              <Factory className="size-8" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="font-black text-lg">Line Master</p>
                <span className="bg-red-500 text-[10px] px-2 py-0.5 rounded font-black uppercase">Live</span>
              </div>
              <p className="text-slate-300 text-xs font-medium">Real-time floor allocation</p>
            </div>
          </div>
        </Link>

        <Link href="/transfer/scan">
          <div className="flex items-center gap-4 p-5 rounded-2xl bg-emerald-600 text-white shadow-lg hover:bg-emerald-700 transition-all hover:-translate-y-1">
            <div className="p-2 bg-white/20 rounded-xl">
              <Repeat className="size-8" />
            </div>
            <div>
              <p className="font-black text-lg">Machine Transfer</p>
              <p className="text-emerald-100 text-xs font-medium">Relocate units instantly</p>
            </div>
          </div>
        </Link>

        <Link href="/transfers">
          <div className="flex items-center gap-4 p-5 rounded-2xl bg-amber-500 text-white shadow-lg hover:bg-amber-600 transition-all hover:-translate-y-1">
            <div className="p-2 bg-white/20 rounded-xl">
              <History className="size-8" />
            </div>
            <div>
              <p className="font-black text-lg">Transfer History</p>
              <p className="text-amber-100 text-xs font-medium">Historical movement logs</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Maintenance Banner */}
      <Link href="/maintenance">
        <div className="flex items-center justify-between p-5 bg-slate-100 rounded-2xl border border-slate-200 hover:bg-slate-200 transition-colors">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <Wrench className="size-5 text-slate-500" />
            </div>
            <span className="font-bold text-slate-700">Maintenance & Repair Hub</span>
          </div>
          <ChevronRight className="size-5 text-slate-400" />
        </div>
      </Link>
    </div>
  )
}
