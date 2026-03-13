
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
import { Wrench, Calendar, Clock, User, AlertCircle, Loader2 } from "lucide-react"
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query, orderBy } from "@/lib/local-firestore"
import { MaintenanceTask } from "@/lib/types"
import { cn } from "@/lib/utils"

export default function MaintenancePage() {
  const firestore = useFirestore()

  const tasksQuery = useMemoFirebase(() => {
    if (!firestore) return null
    return query(collection(firestore, "maintenanceTasks"), orderBy("scheduledDate", "asc"))
  }, [firestore])

  const { data: tasks, isLoading } = useCollection<MaintenanceTask>(tasksQuery)

  const stats = {
    overdue: tasks?.filter(t => t.status === 'Overdue').length || 0,
    scheduled: tasks?.filter(t => t.status === 'Scheduled').length || 0,
    inProgress: tasks?.filter(t => t.status === 'In Progress').length || 0,
    uptime: "99.1%" // Example dynamic calculation based on real-time fleet state could go here
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900">Maintenance Hub</h2>
          <p className="text-muted-foreground font-medium">Keep your manufacturing line running at peak efficiency.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/95 font-black rounded-2xl h-12 px-8">
          <Wrench className="mr-2 size-4" />
          Log New Incident
        </Button>
      </div>

      <div className="grid gap-6 grid-cols-2 md:grid-cols-4">
        <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden border-l-4 border-l-red-500">
           <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-red-600 tracking-tighter">{stats.overdue}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden border-l-4 border-l-amber-500">
           <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">Scheduled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-amber-600 tracking-tighter">{stats.scheduled}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden border-l-4 border-l-blue-500">
           <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-blue-600 tracking-tighter">{stats.inProgress}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden border-l-4 border-l-emerald-500">
           <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">Uptime</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-emerald-600 tracking-tighter">{stats.uptime}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-2xl rounded-[32px] overflow-hidden bg-white">
        <CardHeader className="bg-slate-50/50 border-b py-8">
          <CardTitle className="text-xl font-black">Upcoming & Active Tasks</CardTitle>
          <CardDescription className="text-slate-500 font-medium">Priority list of maintenance operations scheduled for this week.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="animate-spin size-10 text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="border-slate-100 hover:bg-transparent">
                  <TableHead className="font-black text-[10px] uppercase tracking-widest py-5 pl-8">Machine</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest">Task Description</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest">Priority</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest">Scheduled</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest">Technician</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest pr-8 text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks?.map((task) => (
                  <TableRow key={task.id} className="border-slate-50 hover:bg-slate-50/30 transition-colors">
                    <TableCell className="py-5 pl-8">
                      <span className="font-black text-sm text-slate-900">{task.machineName}</span>
                    </TableCell>
                    <TableCell className="max-w-[300px]">
                      <span className="text-xs text-slate-500 font-medium leading-relaxed">{task.description}</span>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={cn(
                          "font-black text-[9px] uppercase tracking-widest rounded-full px-3",
                          task.priority === 'Urgent' ? 'border-red-200 text-red-600 bg-red-50' :
                          task.priority === 'High' ? 'border-orange-200 text-orange-600 bg-orange-50' :
                          'border-blue-200 text-blue-600 bg-blue-50'
                        )}
                      >
                        {task.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                        <Calendar className="size-3 text-slate-300" />
                        {task.scheduledDate}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                        <User className="size-3 text-primary/40" />
                        {task.assignedTechnician}
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-8">
                      <Badge 
                        className={cn(
                          "font-black text-[9px] uppercase tracking-widest px-3",
                          task.status === 'Overdue' ? 'bg-red-50 text-red-700 border border-red-100' :
                          task.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                          'bg-slate-50 text-slate-500 border border-slate-100'
                        )}
                      >
                        {task.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {(!tasks || tasks.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-20 opacity-30">
                       <Wrench className="size-12 mx-auto mb-4" />
                       <p className="font-black text-lg uppercase tracking-widest">No active tasks</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
