
"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
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
import { Search, Box, ChevronRight, Plus, Filter } from "lucide-react"
import { MACHINES } from "@/lib/mock-data"

export default function MachinesPage() {
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
          <h2 className="text-3xl font-bold tracking-tight">Machine Inventory</h2>
          <p className="text-muted-foreground">Manage and track all manufacturing assets across locations.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Filter className="mr-2 size-4" />
            Filter
          </Button>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 size-4" />
            Add Machine
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by name, ID or serial..." 
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="px-3 py-1">Total: {MACHINES.length}</Badge>
              <Badge variant="secondary" className="px-3 py-1 bg-green-100 text-green-800 border-green-200">Active: 38</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">ID</TableHead>
                <TableHead>Machine Details</TableHead>
                <TableHead>Current Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Maintenance</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMachines.map((machine) => (
                <TableRow key={machine.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{machine.id}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">{machine.name}</span>
                      <span className="text-xs text-muted-foreground">Type: {machine.type} | SN: {machine.serialNumber}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="size-2 rounded-full bg-accent" />
                      <span className="text-sm">{machine.location}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className={
                        machine.status === 'Operational' ? 'bg-green-100 text-green-800' :
                        machine.status === 'In Maintenance' ? 'bg-blue-100 text-blue-800' :
                        machine.status === 'In Transit' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }
                      variant="secondary"
                    >
                      {machine.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{machine.lastMaintenanceDate}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/machines/${machine.id}`}>
                        <ChevronRight className="h-4 w-4" />
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
