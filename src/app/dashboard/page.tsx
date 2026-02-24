
"use client"

import { Card, CardContent } from "@/components/ui/card"
import { MACHINES } from "@/lib/mock-data"
import { 
  Plus, 
  Repeat, 
  History, 
  LayoutGrid, 
  ChevronRight, 
  Wrench, 
  Factory, 
  Warehouse,
  AlertCircle
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"

const MACHINE_TYPES = [
  { name: 'Flat Bed', icon: 'https://picsum.photos/seed/flatbed/400/300', color: 'bg-green-500' },
  { name: 'Cylinder', icon: 'https://picsum.photos/seed/cylinder/400/300', color: 'bg-blue-500' },
  { name: 'High Post', icon: 'https://picsum.photos/seed/highpost/400/300', color: 'bg-blue-600' },
  { name: 'AMS', icon: 'https://picsum.photos/seed/ams/400/300', color: 'bg-green-600' },
  { name: 'Overlock', icon: 'https://picsum.photos/seed/overlock/400/300', color: 'bg-orange-500' },
  { name: 'Others', icon: 'https://picsum.photos/seed/generic/400/300', color: 'bg-blue-400' },
]

export default function DashboardPage() {
  const totalCount = MACHINES.length
  const runningCount = MACHINES.filter(m => m.status === 'Running').length
  const bankCount = MACHINES.filter(m => m.status === 'Bank' || m.location === 'Machine Bank').length
  const breakdownCount = MACHINES.filter(m => m.status === 'Breakdown' || m.status === 'Repair').length

  const getTypeStats = (typeName: string) => {
    const filtered = MACHINES.filter(m => m.type === typeName)
    return {
      total: filtered.length,
      running: filtered.filter(m => m.status === 'Running').length
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Stats Bar */}
      <Card className="border-none shadow-md bg-white/80 backdrop-blur">
        <CardContent className="p-4 flex items-center justify-around">
          <div className="text-center">
            <p className="text-xs text-muted-foreground font-medium">Total Machines</p>
            <p className="text-2xl font-bold">{totalCount}</p>
          </div>
          <div className="h-8 w-px bg-border mx-2" />
          <div className="text-center">
            <p className="text-xs text-muted-foreground font-medium">Running</p>
            <p className="text-2xl font-bold text-green-600">{runningCount}</p>
          </div>
          <div className="h-8 w-px bg-border mx-2" />
          <div className="text-center">
            <p className="text-xs text-muted-foreground font-medium">Bank</p>
            <p className="text-2xl font-bold text-blue-600">{bankCount}</p>
          </div>
          <div className="h-8 w-px bg-border mx-2" />
          <div className="text-center">
            <p className="text-xs text-muted-foreground font-medium">Repair / Breakdown</p>
            <p className="text-2xl font-bold text-red-500">{breakdownCount}</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold text-slate-900">Types of Machines</h2>
      </div>

      {/* Machine Type Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MACHINE_TYPES.map((type) => {
          const stats = getTypeStats(type.name)
          return (
            <Card key={type.name} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-0 flex items-center bg-white">
                <div className="p-4 flex-1">
                  <h3 className="font-bold text-lg mb-2">{type.name}</h3>
                  <div className="flex items-center gap-2 mb-1">
                    <div className={cn("size-2.5 rounded-full", type.color)} />
                    <span className="text-sm font-semibold">{stats.running} Running</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total <span className="font-bold text-foreground">{stats.total}</span>
                  </div>
                </div>
                <div className="relative w-40 h-32">
                  <Image 
                    src={type.icon} 
                    alt={type.name} 
                    fill 
                    className="object-cover"
                    data-ai-hint="industrial machine"
                  />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/machines">
          <div className="flex items-center gap-4 p-5 rounded-2xl bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-colors">
            <div className="p-2 bg-white/20 rounded-xl">
              <LayoutGrid className="size-8" />
            </div>
            <div>
              <p className="font-bold text-lg">Machine Master</p>
              <p className="text-blue-100 text-xs">View all assets & history</p>
            </div>
          </div>
        </Link>

        <Link href="/lines">
          <div className="flex items-center gap-4 p-5 rounded-2xl bg-slate-800 text-white shadow-lg hover:bg-slate-900 transition-colors cursor-pointer">
            <div className="p-2 bg-white/20 rounded-xl">
              <Factory className="size-8" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="font-bold text-lg">Line Master</p>
                <span className="bg-red-500 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">Important</span>
              </div>
              <p className="text-slate-300 text-xs">Real-time line allotment</p>
            </div>
          </div>
        </Link>

        <Link href="/transfer/scan">
          <div className="flex items-center gap-4 p-5 rounded-2xl bg-emerald-600 text-white shadow-lg hover:bg-emerald-700 transition-colors">
            <div className="p-2 bg-white/20 rounded-xl">
              <Repeat className="size-8" />
            </div>
            <div>
              <p className="font-bold text-lg">Machine Transfer</p>
              <p className="text-emerald-100 text-xs">Relocate machine instantly</p>
            </div>
          </div>
        </Link>

        <Link href="/transfers">
          <div className="flex items-center gap-4 p-5 rounded-2xl bg-amber-500 text-white shadow-lg hover:bg-amber-600 transition-colors">
            <div className="p-2 bg-white/20 rounded-xl">
              <History className="size-8" />
            </div>
            <div>
              <p className="font-bold text-lg">Transfer History</p>
              <p className="text-amber-100 text-xs">Historical movement logs</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Maintenance Banner */}
      <Link href="/maintenance">
        <div className="flex items-center justify-between p-4 bg-slate-100 rounded-xl border border-slate-200 hover:bg-slate-200 transition-colors">
          <div className="flex items-center gap-3">
            <Wrench className="size-5 text-slate-500" />
            <span className="font-semibold text-slate-700">Maintenance / Repair Hub</span>
          </div>
          <ChevronRight className="size-5 text-slate-400" />
        </div>
      </Link>
    </div>
  )
}
