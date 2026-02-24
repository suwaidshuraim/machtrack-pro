
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Factory, Plus, LayoutGrid, ArrowLeft, Search, X, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection } from "firebase/firestore"
import { Machine, Line } from "@/lib/types"

export default function LineMasterPage() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const firestore = useFirestore()

  const linesQuery = useMemoFirebase(() => {
    if (!firestore) return null
    return collection(firestore, "lines")
  }, [firestore])
  const { data: lines, loading: linesLoading } = useCollection<Line>(linesQuery)

  const machinesQuery = useMemoFirebase(() => {
    if (!firestore) return null
    return collection(firestore, "machines")
  }, [firestore])
  const { data: machines, loading: machinesLoading } = useCollection<Machine>(machinesQuery)

  if (linesLoading || machinesLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  const safeLines = lines || []
  const safeMachines = machines || []

  const filteredLines = safeLines.filter(line => {
    const s = search.toLowerCase()
    const lineMachines = safeMachines.filter(m => m.location === line.name)
    
    const matchesLineName = line.name.toLowerCase().includes(s)
    const matchesMachineInLine = lineMachines.some(m => 
      m.id.toLowerCase().includes(s) || 
      m.type.toLowerCase().includes(s) || 
      m.serialNumber.toLowerCase().includes(s)
    )
    
    return matchesLineName || matchesMachineInLine
  })

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()} className="rounded-full">
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Line Master</h2>
            <p className="text-muted-foreground">Real-time machine allocation for production lines.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input 
              placeholder="Search lines or assets..." 
              className="pl-9 h-10 w-48 md:w-64 bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button 
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-slate-900"
              >
                <X className="size-3" />
              </button>
            )}
          </div>
          <Button className="bg-slate-800 hover:bg-slate-900 text-white shadow-lg" asChild>
            <Link href="/lines/new">
              <Plus className="mr-2 size-4" />
              Add New Line
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {filteredLines.map((line) => {
          const lineMachines = safeMachines.filter(m => m.location === line.name)
          
          const typeCounts = lineMachines.reduce((acc, m) => {
            acc[m.type] = (acc[m.type] || 0) + 1
            return acc
          }, {} as Record<string, number>)

          const activeCount = lineMachines.filter(m => m.status === 'Running' || m.status === 'Idle').length
          const serviceRequiredCount = lineMachines.filter(m => m.status === 'Breakdown' || m.status === 'Repair').length

          return (
            <Card key={line.name} className="overflow-hidden border-none shadow-md bg-white hover:shadow-lg transition-shadow">
              <CardHeader className="bg-slate-50/80 border-b py-5 flex flex-row items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-md">
                    <Factory className="size-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-black text-slate-800">{line.name}</CardTitle>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                        {lineMachines.length} Machines Total
                      </span>
                      <div className="flex items-center gap-1.5">
                        <div className="size-2 rounded-full bg-green-500" />
                        <span className="text-xs font-bold text-green-600">{activeCount} Active</span>
                      </div>
                    </div>
                  </div>
                </div>
                {serviceRequiredCount > 0 && (
                  <Badge variant="destructive" className="font-bold px-3 py-1 rounded-lg">
                    {serviceRequiredCount} Service Required
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {Object.entries(typeCounts).length > 0 ? (
                    Object.entries(typeCounts).map(([type, count]) => (
                      <div key={type} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{type}</p>
                        <p className="text-xl font-black text-slate-800">{count} <span className="text-xs font-medium text-slate-500">nos</span></p>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-4 text-center py-4 text-sm text-slate-400 italic">
                      No machines currently allotted to this line.
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                   <Button variant="ghost" size="sm" className="text-blue-600 font-bold hover:bg-blue-50" asChild>
                      <Link href="/machines">
                        <LayoutGrid className="mr-2 size-4" />
                        View Assets in {line.name}
                      </Link>
                   </Button>
                   <Button variant="outline" size="sm" className="rounded-xl font-bold" asChild>
                      <Link href="/transfer/scan">
                        Relocate to {line.name}
                      </Link>
                   </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
        {filteredLines.length === 0 && (
          <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed">
            <Factory className="size-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-bold">No production lines found matching "{search}"</p>
          </div>
        )}
      </div>
    </div>
  )
}
