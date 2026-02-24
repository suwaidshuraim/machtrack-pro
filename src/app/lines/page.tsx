
"use client"

import { MACHINES } from "@/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Factory, ChevronRight, Activity } from "lucide-react"
import Link from "next/link"

export default function LineMasterPage() {
  // Identify all locations that function as production lines (excluding storage)
  const lineLocations = Array.from(new Set(MACHINES.map(m => m.location)))
    .filter(loc => loc !== "Machine Bank" && loc !== "Warehouse B")

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Line Master</h2>
        <p className="text-muted-foreground">Monitor real-time machine allocation and status across all production lines.</p>
      </div>

      <div className="grid gap-6">
        {lineLocations.length > 0 ? (
          lineLocations.map((lineName) => {
            const lineMachines = MACHINES.filter(m => m.location === lineName)
            const activeCount = lineMachines.filter(m => m.status === 'Operational').length
            const issueCount = lineMachines.filter(m => m.status === 'Down' || m.status === 'In Maintenance').length

            return (
              <Card key={lineName} className="overflow-hidden border-none shadow-md bg-white">
                <CardHeader className="bg-slate-50/80 border-b py-4 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-slate-800 rounded-xl text-white shadow-sm">
                      <Factory className="size-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold tracking-tight">{lineName}</CardTitle>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground font-medium">{lineMachines.length} Assets</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <div className="flex items-center gap-1">
                          <Activity className="size-3 text-green-500" />
                          <span className="text-xs font-bold text-green-600">{activeCount} Running</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {issueCount > 0 && (
                    <Badge variant="destructive" className="font-bold">
                      {issueCount} Alert{issueCount > 1 ? 's' : ''}
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-slate-100">
                    {lineMachines.map((machine) => (
                      <Link 
                        key={machine.id} 
                        href={`/machines/${machine.id}`}
                        className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`size-3 rounded-full shadow-sm ${
                            machine.status === 'Operational' ? 'bg-green-500' : 
                            machine.status === 'In Maintenance' ? 'bg-blue-500' : 'bg-red-500'
                          }`} />
                          <div>
                            <p className="font-bold text-sm text-slate-800 group-hover:text-blue-600 transition-colors">{machine.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Badge variant="outline" className="text-[10px] h-4 px-1.5 font-mono bg-white">
                                {machine.id}
                              </Badge>
                              <span className="text-xs text-muted-foreground">{machine.type}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <Badge 
                            variant="secondary"
                            className={`text-[10px] font-bold uppercase tracking-wider ${
                              machine.status === 'Operational' ? 'bg-green-50 text-green-700' :
                              machine.status === 'In Maintenance' ? 'bg-blue-50 text-blue-700' :
                              'bg-red-50 text-red-700'
                            }`}
                          >
                            {machine.status}
                          </Badge>
                          <ChevronRight className="size-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })
        ) : (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed">
            <Factory className="size-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-600">No Production Lines Detected</h3>
            <p className="text-sm text-slate-400">Add machines and assign them to production areas to see them here.</p>
          </div>
        )}
      </div>
    </div>
  )
}
