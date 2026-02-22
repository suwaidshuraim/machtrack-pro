
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Box, Repeat, Wrench, AlertCircle } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string
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
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Machines"
        value="42"
        description="+2 since last month"
        icon={Box}
        color="bg-primary"
      />
      <StatCard
        title="Active Transfers"
        value="8"
        description="4 scheduled for today"
        icon={Repeat}
        color="bg-accent"
      />
      <StatCard
        title="Maintenance Due"
        value="12"
        description="3 urgent tasks pending"
        icon={Wrench}
        color="bg-yellow-500"
      />
      <StatCard
        title="System Status"
        value="98.2%"
        description="Machine uptime efficiency"
        icon={AlertCircle}
        color="bg-green-500"
      />
    </div>
  )
}
