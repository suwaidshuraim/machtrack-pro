
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Box, Factory, Wrench, Warehouse } from "lucide-react"
import { MACHINES } from "@/lib/mock-data"

export function DashboardStats() {
  const totalMachines = MACHINES.length
  const activeCount = MACHINES.filter(m => m.status === 'Operational').length
  const breakdownCount = MACHINES.filter(m => m.status === 'Down' || m.status === 'In Maintenance').length
  const bankCount = MACHINES.filter(m => m.location === 'Machine Bank').length

  return (
    <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalMachines}</div>
        </CardContent>
      </Card>
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-green-600 uppercase tracking-wider">Running</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{activeCount}</div>
        </CardContent>
      </Card>
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-blue-600 uppercase tracking-wider">Bank</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{bankCount}</div>
        </CardContent>
      </Card>
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-red-500 uppercase tracking-wider">Repair</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-500">{breakdownCount}</div>
        </CardContent>
      </Card>
    </div>
  )
}
