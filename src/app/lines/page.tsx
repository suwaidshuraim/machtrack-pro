
"use client"

import { useState, useMemo } from "react"
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
  const { data: lines, isLoading: linesLoading } = useCollection<Line>(linesQuery)

  const machinesQuery = useMemoFirebase(() => {
    if (!firestore) return null
    return collection(firestore, "machines")
  }, [firestore])
  const { data: machines, isLoading: machinesLoading } = useCollection<Machine>(machinesQuery)

  const filteredLines = useMemo(() => {
    if (!lines) return []
    const safeLines = lines || []
    const safeMachines = machines || []
    const s = search.toLowerCase().trim()

    if (!s) return safeLines

    return safeLines.filter(line => {
      const lineMachines = safeMachines.filter(m => m.location === line.name)
      
      const matchesLineName = line.name.toLowerCase().includes(s)
      const matchesMachineInLine = lineMachines.some(m => 
        m.id.toLowerCase().includes(s) || 
        m.type.toLowerCase().includes(s) || 
        m.serialNumber.toLowerCase().includes(s)
      )
      
      return matchesLineName || matchesMachineInLine
    })
  }, [lines, machines, search])

  if (linesLoading || machinesLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="size-10 animate-spin text-blue-500" />
          <p className="text-sm font-bold text-slate-500 animate-pulse uppercase tracking-widest">Initializing Floor Plan...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()} className="rounded-full shadow-sm">
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h2 className="text-3xl font-black tracking-tight text-slate-900">Line Master</h2>
            <p className="text-muted-foreground font-medium">Manage your production floor allocations.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
            <Input 
              placeholder="Search lines or assets..." 
              className="pl-9 h-11 w-48 md:w-72 bg-white border-slate-200 focus-visible:ring-blue-100"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button 
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-slate-900"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
          <Button className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg h-11 px-6 font-bold" asChild>
            <Link href="/lines/new">
              <Plus className="mr-2 size-4" />
              Define Line
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {filteredLines.map((line) => {
          const lineMachines = (machines || []).filter(m => m.location === line.name)
          
          const typeCounts = lineMachines.reduce((acc, m) => {
            acc[m.type] = (acc[m.type] || 0) + 1
            return acc
          }, {} as Record<string, number>)

          const activeCount = lineMachines.filter(m => m.status === 'Running' || m.status === 'Idle').length
          const serviceRequiredCount = lineMachines.filter(m => m.status === 'Breakdown' || m.status === 'Repair').length

          return (
            <Card key={line.name} className="overflow-hidden border-none shadow-md bg-white hover:shadow-xl transition-all group border-l-4 border-l-transparent hover:border-l-blue-600">
              <CardHeader className="bg-slate-50/50 border-b py-5 flex flex-row items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg transition-transform group-hover:scale-105">
                    <Factory className="size-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-black text-slate-800">{line.name}</CardTitle>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        {lineMachines.length} Assets
                      </span>
                      <div className="flex items-center gap-1.5">
                        <div className="size-2 rounded-full bg-green-500" />
                        <span className="text-xs font-bold text-green-600">{activeCount} Running</span>
                      </div>
                    </div>
                  </div>
                </div>
                {serviceRequiredCount > 0 && (
                  <Badge variant="destructive" className="font-black px-3 py-1.5 rounded-xl border-none animate-pulse">
                    {serviceRequiredCount} Attention Required
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {Object.entries(typeCounts).length > 0 ? (
                    Object.entries(typeCounts).map(([type, count]) => (
                      <div key={type} className="bg-slate-50 rounded-2xl p-4 border border-slate-100 hover:bg-white hover:shadow-sm transition-all">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">{type}</p>
                        <p className="text-2xl font-black text-slate-800">{count} <span className="text-xs font-medium text-slate-500">units</span></p>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-4 text-center py-6 text-sm text-slate-400 font-medium italic border-2 border-dashed rounded-2xl">
                      No assets currently assigned to this line.
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-5 border-t border-slate-50">
                   <Button variant="ghost" size="sm" className="text-blue-600 font-black hover:bg-blue-50 h-10 px-4 rounded-xl" asChild>
                      <Link href="/machines">
                        <LayoutGrid className="mr-2 size-4" />
                        Audit Line Assets
                      </Link>
                   </Button>
                   <Button variant="outline" size="sm" className="rounded-xl font-black h-10 px-6 hover:bg-slate-900 hover:text-white transition-colors" asChild>
                      <Link href="/transfer/scan">
                        Relocate Asset
                      </Link>
                   </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
        {filteredLines.length === 0 && (
          <div className="text-center py-24 bg-slate-50 rounded-3xl border-4 border-dashed border-slate-200">
            <div className="bg-white size-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Factory className="size-8 text-slate-300" />
            </div>
            <p className="text-slate-500 font-black text-lg">No results for "{search}"</p>
            <p className="text-slate-400 text-sm">Try searching for a different line or machine ID.</p>
          </div>
        )}
      </div>
    </div>
  )
}
