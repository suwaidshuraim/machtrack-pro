
"use client"

import { useState } from "react"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
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
import { Repeat, Plus, Search, Calendar } from "lucide-react"
import { Input } from "@/components/ui/input"
import { TRANSFERS } from "@/lib/mock-data"

export default function TransfersPage() {
  const [search, setSearch] = useState("")

  const filteredTransfers = TRANSFERS.filter(t => 
    t.machineName.toLowerCase().includes(search.toLowerCase()) || 
    t.fromLocation.toLowerCase().includes(search.toLowerCase()) ||
    t.toLocation.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Machine Transfers</h2>
          <p className="text-muted-foreground">Initiate and track the relocation of manufacturing equipment.</p>
        </div>
        <Button className="bg-accent hover:bg-accent/90 text-white">
          <Plus className="mr-2 size-4" />
          Request Transfer
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground mt-1">Active relocation tasks</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground mt-1">Successful transfers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Transfer Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.5 hrs</div>
            <p className="text-xs text-muted-foreground mt-1">Efficiency rating: High</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-xl">Transfer Logs</CardTitle>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search logs..." 
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transfer ID</TableHead>
                <TableHead>Machine</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Requested By</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransfers.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{t.id}</TableCell>
                  <TableCell className="font-medium text-sm">{t.machineName}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">{t.fromLocation}</span>
                      <Repeat className="size-3 text-accent" />
                      <span>{t.toLocation}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-xs">
                      <Calendar className="size-3 text-muted-foreground" />
                      {t.transferDate}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{t.requestedBy}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={t.status === 'Completed' ? 'secondary' : 'outline'}
                      className={t.status === 'Completed' ? 'bg-green-100 text-green-800' : ''}
                    >
                      {t.status}
                    </Badge>
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
