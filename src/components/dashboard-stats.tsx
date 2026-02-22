
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
  // Active/Allotted: Operational status and not in the Machine Bank
  const activeCount = MACHINES.filter(m => m.status === 'Operational' && m.location !== 'Machine Bank').length
  // Breakdown/Needs Repair: Status is Down
  const breakdownCount = MACHINES.filter(m => m.status === 'Down').length
  // Machine Bank: Specifically located in the Machine Bank
  const bankCount = MACHINES.filter(m => m.location === 'Machine Bank').length

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Machines"
        value={totalMachines}
        description="Global company inventory"
        icon={Box}
        color="hsl(var(--primary))"
      />
      <StatCard
        title="Active (Allotted)"
        value={activeCount}
        description="Currently in production"
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
        title="Breakdown"
        value={breakdownCount}
        description="Down and non-functional"
        icon={Wrench}
        color="#ef4444"
      />
    </div>
  )
}
