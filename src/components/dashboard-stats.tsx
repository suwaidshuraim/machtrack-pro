
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Box, Factory, Wrench, Warehouse } from "lucide-react"
import { MACHINES } from "@/lib/mock-data"

interface StatsCardProps {
  title: string
  value: string | number
  description: string
  icon: React.ElementType
  color: string
}

function StatCard({ title, value, description, icon: Icon, color }: StatsCardProps) {
  return (
    <Card className="overflow-hidden border-b-4" style={{ borderColor: color }}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  )
}

export function DashboardStats() {
  const totalMachines = MACHINES.length
  const activeCount = MACHINES.filter(m => m.status === 'Operational' && m.location !== 'Machine Bank').length
  const repairCount = MACHINES.filter(m => m.status === 'Down' || m.status === 'In Maintenance').length
  const bankCount = MACHINES.filter(m => m.location === 'Machine Bank').length

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Assets"
        value={totalMachines}
        description="Global inventory"
        icon={Box}
        color="hsl(var(--primary))"
      />
      <StatCard
        title="Active in Production"
        value={activeCount}
        description="Operational units"
        icon={Factory}
        color="#22c55e"
      />
      <StatCard
        title="In Machine Bank"
        value={bankCount}
        description="Available for deployment"
        icon={Warehouse}
        color="hsl(var(--accent))"
      />
      <StatCard
        title="Needs Repair"
        value={repairCount}
        description="Down or Scheduled"
        icon={Wrench}
        color="#ef4444"
      />
    </div>
  )
}
