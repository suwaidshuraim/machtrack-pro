
"use client"

import { MACHINES } from "@/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Factory, Plus, ChevronRight, LayoutGrid } from "lucide-react"
import Link from "next/link"

const PREDEFINED_LINES = ["Line 1", "Line 2", "Line 3", "Line 4", "Line 5"]

export default function LineMasterPage() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Line Master</h2>
          <p className="text-muted-foreground">Real-time machine allocation for production lines 1 through 5.</p>
        </div>
        <Button className="bg-slate-800 hover:bg-slate-900 text-white shadow-lg">
          <Plus className="mr-2 size-4" />
          Add New Line
        </Button>
      </div>

      <div className="grid gap-6">
        {PREDEFINED_LINES.map((lineName) => {
          const lineMachines = MACHINES.filter(m => m.location === lineName)
          
          // Calculate counts by type
          const typeCounts = lineMachines.reduce((acc, m) => {
            acc[m.type] = (acc[m.type] || 0) + 1
            return acc
          }, {} as Record<string, number>)

          const activeCount = lineMachines.filter(m => m.status === 'Operational').length
          const downCount = lineMachines.filter(m => m.status === 'Down' || m.status === 'In Maintenance').length

          return (
            <Card key={lineName} className="overflow-hidden border-none shadow-md bg-white hover:shadow-lg transition-shadow">
              <CardHeader className="bg-slate-50/80 border-b py-5 flex flex-row items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-md">
                    <Factory className="size-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-black text-slate-800">{lineName}</CardTitle>
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
                {downCount > 0 && (
                  <Badge variant="destructive" className="font-bold px-3 py-1 rounded-lg">
                    {downCount} Service Required
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
                        View All Assets
                      </Link>
                   </Button>
                   <Button variant="outline" size="sm" className="rounded-xl" asChild>
                      <Link href="/transfer/scan">
                        Add Machine to {lineName}
                      </Link>
                   </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
