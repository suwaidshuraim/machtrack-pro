
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
import { Badge } from "@/components/ui/badge"
import { 
  Bar, 
  BarChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip,
  Cell
} from "recharts"
import { MACHINES, TRANSFERS } from "@/lib/mock-data"

const chartData = [
  { name: "Operational", value: 32, color: "hsl(var(--primary))" },
  { name: "Maintenance", value: 6, color: "hsl(var(--accent))" },
  { name: "Down", value: 4, color: "hsl(var(--destructive))" },
]

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
        <p className="text-muted-foreground">Real-time status of your manufacturing assets.</p>
      </div>

      <DashboardStats />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Machine Status Distribution</CardTitle>
            <CardDescription>Current operational state across the entire facility.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Transfers</CardTitle>
            <CardDescription>Latest machine movements between departments.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {TRANSFERS.slice(0, 5).map((transfer) => (
                <div key={transfer.id} className="flex items-center justify-between gap-4 border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm">{transfer.machineName}</span>
                    <span className="text-xs text-muted-foreground">{transfer.fromLocation} → {transfer.toLocation}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-medium">{transfer.transferDate}</span>
                    <Badge variant="outline" className="text-[10px] h-5">{transfer.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Outstanding Machine Records</CardTitle>
          <CardDescription>Comprehensive list of machines requiring immediate attention or tracking.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Machine</TableHead>
                <TableHead>Serial Number</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Inspection</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MACHINES.map((machine) => (
                <TableRow key={machine.id}>
                  <TableCell className="font-medium">{machine.name}</TableCell>
                  <TableCell className="text-muted-foreground">{machine.serialNumber}</TableCell>
                  <TableCell>{machine.location}</TableCell>
                  <TableCell>
                    <Badge 
                      className={
                        machine.status === 'Operational' ? 'bg-green-100 text-green-800' :
                        machine.status === 'In Maintenance' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }
                      variant="secondary"
                    >
                      {machine.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{machine.lastInspectionDate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
