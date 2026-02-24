
"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  Card, 
  CardContent, 
  CardHeader, 
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, ChevronRight, Plus, Filter, Box } from "lucide-react"
import { MACHINES } from "@/lib/mock-data"

export default function MachineHistoryPage() {
  const [search, setSearch] = useState("")

  const filteredMachines = MACHINES.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.id.toLowerCase().includes(search.toLowerCase()) ||
    m.serialNumber.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Machine History</h2>
          <p className="text-muted-foreground">Full registry of industrial assets and their current assignments.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl shadow-sm">
            <Filter className="mr-2 size-4" />
            Filter
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md">
            <Plus className="mr-2 size-4" />
            Add New Machine
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-lg overflow-hidden">
        <CardHeader className="bg-white border-b py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by ID, Name or Serial..." 
                className="pl-10 h-11 bg-slate-50 border-none focus-visible:ring-1 focus-visible:ring-blue-200"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg">
                <Box className="size-4 text-slate-500" />
                <span className="text-sm font-bold text-slate-700">{MACHINES.length} Assets</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="font-bold py-4">ID / Serial</TableHead>
                <TableHead className="font-bold">Details</TableHead>
                <TableHead className="font-bold">Current Location</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="text-right pr-6 font-bold">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMachines.map((machine) => (
                <TableRow key={machine.id} className="hover:bg-slate-50/80 transition-colors">
                  <TableCell className="py-4">
                    <div className="flex flex-col">
                      <span className="font-mono text-xs font-bold text-blue-600">{machine.id}</span>
                      <span className="text-[10px] text-muted-foreground">{machine.serialNumber}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-slate-800">{machine.name}</span>
                      <span className="text-xs text-muted-foreground">{machine.type} Machine</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 font-bold">
                      {machine.location}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`size-2 rounded-full ${
                        machine.status === 'Operational' ? 'bg-green-500' :
                        machine.status === 'In Maintenance' ? 'bg-blue-500' : 'bg-red-500'
                      }`} />
                      <span className="text-sm font-medium">{machine.status}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Button variant="ghost" size="icon" className="hover:bg-blue-50 text-blue-600" asChild>
                      <Link href={`/machines/${machine.id}`}>
                        <ChevronRight className="h-5 w-5" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
