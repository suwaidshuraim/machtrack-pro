
"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  ArrowLeft, 
  History, 
  Wrench, 
  Repeat, 
  MapPin, 
  Info,
  QrCode,
  CalendarDays,
  Camera,
  Settings2
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MACHINES, TRANSFERS, MAINTENANCE_TASKS } from "@/lib/mock-data"
import { MachineStatus } from "@/lib/types"
import { AIInspectionCard } from "@/components/ai-inspection-card"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

export default function MachineDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  
  // Local state for machine status to simulate update
  const initialMachine = MACHINES.find(m => m.id === params.id)
  const [currentStatus, setCurrentStatus] = useState<MachineStatus>(initialMachine?.status || 'Idle')

  if (!initialMachine) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <h2 className="text-2xl font-bold">Machine Not Found</h2>
        <Button onClick={() => router.push('/machines')}>Go to Master</Button>
      </div>
    )
  }

  const machineTransfers = TRANSFERS.filter(t => t.machineId === initialMachine.id)
  const machineMaintenance = MAINTENANCE_TASKS.filter(m => m.machineId === initialMachine.id)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Running': return 'bg-green-500';
      case 'Idle': return 'bg-yellow-500';
      case 'Bank': return 'bg-blue-500';
      case 'Breakdown': return 'bg-red-500';
      case 'Repair': return 'bg-orange-500';
      default: return 'bg-slate-400';
    }
  }

  const handleStatusChange = (value: MachineStatus) => {
    setCurrentStatus(value)
    toast({
      title: "Status Updated",
      description: `Asset ${initialMachine.id} status changed to ${value}.`,
    })
  }

  const handleChangeImage = () => {
    toast({
      title: "Image Upload",
      description: "Open camera/gallery to replace asset image.",
    })
  }

  return (
    <div className="space-y-8 pb-12 max-w-6xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{initialMachine.type}</h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="font-mono">{initialMachine.id}</Badge>
            <Badge variant="secondary">{initialMachine.serialNumber}</Badge>
            <Badge className={cn("text-white font-bold", getStatusColor(currentStatus))}>{currentStatus}</Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden border-none shadow-lg">
            <div className="relative h-64 md:h-80 w-full group">
              <Image 
                src={initialMachine.imageUrl} 
                alt={initialMachine.type}
                fill
                className="object-cover"
                data-ai-hint="industrial machine"
              />
              <div className="absolute bottom-4 right-4">
                <Button variant="secondary" size="sm" onClick={handleChangeImage} className="shadow-lg backdrop-blur-sm bg-white/90 font-bold">
                  <Camera className="mr-2 size-4" />
                  Update Photo
                </Button>
              </div>
            </div>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                    <Info className="size-3" /> Asset Type
                  </span>
                  <p className="font-bold">{initialMachine.type}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                    <MapPin className="size-3" /> Active Location
                  </span>
                  <p className="font-black text-blue-600">{initialMachine.location}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                    <CalendarDays className="size-3" /> Commission Date
                  </span>
                  <p className="font-bold">2023-05-12</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="history" className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-12 bg-slate-100 p-1">
              <TabsTrigger value="history" className="font-bold">Movement Logs</TabsTrigger>
              <TabsTrigger value="maintenance" className="font-bold">Maintenance</TabsTrigger>
              <TabsTrigger value="details" className="font-bold">Specs</TabsTrigger>
            </TabsList>
            <TabsContent value="history" className="mt-4">
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <History className="size-5" /> Transfer History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {machineTransfers.length > 0 ? (
                    <div className="space-y-4">
                      {machineTransfers.map((t) => (
                        <div key={t.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                          <div className="flex flex-col">
                            <span className="font-bold text-sm">{t.fromLocation} &rarr; {t.toLocation}</span>
                            <span className="text-xs text-muted-foreground font-medium">Requested by {t.requestedBy}</span>
                          </div>
                          <span className="text-xs font-black text-slate-500">{t.transferDate}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground italic">No historical movements logged.</div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="maintenance" className="mt-4">
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Wrench className="size-5" /> Service Record
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm border-b pb-3">
                      <span className="text-muted-foreground font-medium">Last Maintenance:</span>
                      <span className="font-bold">{initialMachine.lastMaintenanceDate}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-b pb-3">
                      <span className="text-muted-foreground font-medium">Last Inspection:</span>
                      <span className="font-bold">{initialMachine.lastInspectionDate}</span>
                    </div>
                    {machineMaintenance.map(task => (
                      <div key={task.id} className="bg-slate-50 p-4 rounded-xl border border-slate-100 mt-4">
                         <div className="flex justify-between items-start mb-2">
                           <span className="text-sm font-black">{task.description}</span>
                           <Badge variant="outline" className="bg-white">{task.status}</Badge>
                         </div>
                         <div className="flex justify-between text-xs text-muted-foreground font-medium">
                            <span>Tech: {task.assignedTechnician}</span>
                            <span>{task.scheduledDate}</span>
                         </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          {/* Status Change & Quick Controls - Very Prominent */}
          <Card className="border-none shadow-xl ring-2 ring-blue-100">
            <CardHeader className="pb-3 bg-blue-50/30">
              <div className="flex items-center gap-2">
                <Settings2 className="size-5 text-blue-600" />
                <CardTitle className="text-lg">Status & Control</CardTitle>
              </div>
              <CardDescription>Update current status or trigger relocation.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-4">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-blue-600 tracking-widest">Current Unit Status</label>
                <Select value={currentStatus} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-full h-12 font-black text-lg border-2 border-blue-100 hover:border-blue-200 focus:ring-blue-100">
                    <SelectValue placeholder="Select current status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Running" className="font-bold text-green-600 py-3">Running (Operational)</SelectItem>
                    <SelectItem value="Idle" className="font-bold text-yellow-600 py-3">Idle (Standby)</SelectItem>
                    <SelectItem value="Bank" className="font-bold text-blue-600 py-3">Bank (Inventory)</SelectItem>
                    <SelectItem value="Breakdown" className="font-bold text-red-600 py-3">Breakdown (Immediate)</SelectItem>
                    <SelectItem value="Repair" className="font-bold text-orange-600 py-3">Repair (Workshop)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-3 pt-2">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 justify-start h-12 font-bold rounded-xl shadow-lg shadow-blue-100" variant="default" onClick={() => router.push('/transfer/scan')}>
                  <Repeat className="mr-2 size-5" /> Relocate to Line/Bank
                </Button>
                <Button className="w-full justify-start h-12 font-bold border-slate-200 hover:bg-slate-50 rounded-xl" variant="outline">
                  <QrCode className="mr-2 size-5" /> Print Physical Label
                </Button>
              </div>
            </CardContent>
          </Card>

          <AIInspectionCard machine={{...initialMachine, status: currentStatus}} />
        </div>
      </div>
    </div>
  )
}
