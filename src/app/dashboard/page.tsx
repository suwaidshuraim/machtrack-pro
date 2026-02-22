
"use client"

import { DashboardStats } from "@/components/dashboard-stats"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip as ChartTooltip,
  Legend
} from "recharts"
import { MACHINES, TRANSFERS } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"
import { ArrowRightLeft, History } from "lucide-react"
import Link from "next/link"

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function DashboardPage() {
  // Machine Type Data
  const typeCounts = MACHINES.reduce((acc, machine) => {
    acc[machine.type] = (acc[machine.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const typeData = Object.entries(typeCounts).map(([name, value]) => ({ name, value }))

  // Recent Activity
  const recentTransfers = [...TRANSFERS].sort((a, b) => 
    new Date(b.transferDate).getTime() - new Date(a.transferDate).getTime()
  ).slice(0, 5)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">System Status</h2>
          <p className="text-muted-foreground">Overview of all factory assets and recent movements.</p>
        </div>
      </div>

      <DashboardStats />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Machine Type Distribution</CardTitle>
            <CardDescription>Breakdown of assets by their functional category.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Machine History</CardTitle>
                <CardDescription>Latest location transfers across the facility.</CardDescription>
              </div>
              <History className="size-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransfers.map((transfer) => (
                <div key={transfer.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-sm">{transfer.machineName}</span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{transfer.fromLocation}</span>
                      <ArrowRightLeft className="size-3" />
                      <span className="text-accent font-medium">{transfer.toLocation}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-[10px]">{transfer.transferDate}</Badge>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6">
               <Link href="/machines" className="text-sm text-primary hover:underline font-medium">
                  View full inventory records →
               </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
