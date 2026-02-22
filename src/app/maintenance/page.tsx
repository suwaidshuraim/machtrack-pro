
"use client"

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
import { Wrench, Calendar, Clock, User, AlertCircle } from "lucide-react"
import { MAINTENANCE_TASKS } from "@/lib/mock-data"

export default function MaintenancePage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Maintenance Hub</h2>
          <p className="text-muted-foreground">Keep your manufacturing line running at peak efficiency.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Wrench className="mr-2 size-4" />
          Log New Incident
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border-l-4 border-l-red-500">
           <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">3</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-yellow-500">
           <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Scheduled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">8</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
           <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">4</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
           <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Uptime</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">99.1%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming & Active Tasks</CardTitle>
          <CardDescription>Priority list of maintenance operations scheduled for this week.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Machine</TableHead>
                <TableHead className="max-w-[300px]">Task Description</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Scheduled</TableHead>
                <TableHead>Technician</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MAINTENANCE_TASKS.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>
                    <span className="font-semibold text-sm">{task.machineName}</span>
                  </TableCell>
                  <TableCell className="max-w-[300px]">
                    <span className="text-sm text-muted-foreground leading-snug">{task.description}</span>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline"
                      className={
                        task.priority === 'Urgent' ? 'border-red-500 text-red-600 bg-red-50' :
                        task.priority === 'High' ? 'border-orange-500 text-orange-600 bg-orange-50' :
                        'border-blue-500 text-blue-600 bg-blue-50'
                      }
                    >
                      {task.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="size-3" />
                      {task.scheduledDate}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <User className="size-3" />
                      {task.assignedTechnician}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className={
                        task.status === 'Overdue' ? 'bg-red-100 text-red-800' :
                        task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }
                    >
                      {task.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
           <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="size-5 text-accent" /> Recent Completions
            </CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Standard Calibration - Sorter S{i}</span>
                      <span className="text-xs text-muted-foreground">Finished 2 hours ago by Mike L.</span>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">Done</Badge>
                  </div>
                ))}
             </div>
          </CardContent>
        </Card>
        <Card>
           <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="size-5 text-destructive" /> Critical Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
                <div className="p-3 bg-red-50 border border-red-100 rounded-md">
                   <p className="text-sm font-bold text-red-800">Hydraulic Leak Detected</p>
                   <p className="text-xs text-red-700 mt-1">Stamping Press MAC-003 reporting pressure drop in Unit A.</p>
                </div>
                <div className="p-3 bg-orange-50 border border-orange-100 rounded-md">
                   <p className="text-sm font-bold text-orange-800">Cooling System Warning</p>
                   <p className="text-xs text-orange-700 mt-1">Laser Cutter MAC-004 temp approaching safety threshold.</p>
                </div>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
