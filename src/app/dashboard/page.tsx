
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
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Bar, 
  BarChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip,
  Cell
} from "recharts"
import { MACHINES } from "@/lib/mock-data"

export default function DashboardPage() {
  // Calculate machines per location
  const locationCounts = MACHINES.reduce((acc, machine) => {
    acc[machine.location] = (acc[machine.location] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const chartData = Object.entries(locationCounts).map(([name, value]) => ({
    name,
    value,
    color: "hsl(var(--primary))"
  }))

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">System Overview</h2>
        <p className="text-muted-foreground">Monitoring machine quantity and location distribution.</p>
      </div>

      <DashboardStats />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Machine Distribution by Location</CardTitle>
            <CardDescription>Visual breakdown of how many machines are in each area.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    stroke="#888888" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false}
                    width={150}
                  />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Location Summary</CardTitle>
            <CardDescription>Total counts per department.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(locationCounts).map(([location, count]) => (
                <div key={location} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <span className="font-medium text-sm">{location}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">{count}</span>
                    <span className="text-xs text-muted-foreground">machines</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Global Machine List</CardTitle>
          <CardDescription>Quick view of every asset and its current location.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset Name</TableHead>
                <TableHead>Current Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Serial #</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MACHINES.map((machine) => (
                <TableRow key={machine.id}>
                  <TableCell className="font-medium">{machine.name}</TableCell>
                  <TableCell>{machine.location}</TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      machine.status === 'Operational' ? 'bg-green-100 text-green-700' : 
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {machine.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground font-mono text-xs">
                    {machine.serialNumber}
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
