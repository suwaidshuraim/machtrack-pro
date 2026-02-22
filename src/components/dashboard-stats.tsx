
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Box, MapPin, CheckCircle2, AlertCircle } from "lucide-react"
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
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`p-2 rounded-md ${color} text-white`}>
          <Icon className="w-4 h-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  )
}

export function DashboardStats() {
  const totalMachines = MACHINES.length
  const uniqueLocations = new Set(MACHINES.map(m => m.location)).size
  const operational = MACHINES.filter(m => m.status === 'Operational').length
  const down = MACHINES.filter(m => m.status === 'Down').length

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Machines"
        value={totalMachines}
        description="Across all departments"
        icon={Box}
        color="bg-primary"
      />
      <StatCard
        title="Active Locations"
        value={uniqueLocations}
        description="Functional work zones"
        icon={MapPin}
        color="bg-accent"
      />
      <StatCard
        title="Operational"
        value={operational}
        description="Ready for production"
        icon={CheckCircle2}
        color="bg-green-600"
      />
      <StatCard
        title="Offline / Issues"
        value={down}
        description="Requires attention"
        icon={AlertCircle}
        color="bg-destructive"
      />
    </div>
  )
}
