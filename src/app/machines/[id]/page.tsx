
"use client"

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
  CalendarDays
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MACHINES, TRANSFERS, MAINTENANCE_TASKS } from "@/lib/mock-data"
import { AIInspectionCard } from "@/components/ai-inspection-card"

export default function MachineDetailPage() {
  const params = useParams()
  const router = useRouter()
  const machine = MACHINES.find(m => m.id === params.id)

  if (!machine) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <h2 className="text-2xl font-bold">Machine Not Found</h2>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    )
  }

  const machineTransfers = TRANSFERS.filter(t => t.machineId === machine.id)
  const machineMaintenance = MAINTENANCE_TASKS.filter(m => m.machineId === machine.id)

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{machine.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline">{machine.id}</Badge>
            <Badge variant="secondary">{machine.serialNumber}</Badge>
            <Badge className="bg-primary">{machine.status}</Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden">
            <div className="relative h-64 md:h-80 w-full">
              <Image 
                src={machine.imageUrl} 
                alt={machine.name}
                fill
                className="object-cover"
                data-ai-hint="industrial machine"
              />
            </div>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <Info className="size-3" /> Type
                  </span>
                  <p className="font-medium">{machine.type}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <MapPin className="size-3" /> Current Location
                  </span>
                  <p className="font-medium text-accent">{machine.location}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <CalendarDays className="size-3" /> Installation Date
                  </span>
                  <p className="font-medium">2023-05-12</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="history" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="history">Transfer History</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
              <TabsTrigger value="details">Advanced Specs</TabsTrigger>
            </TabsList>
            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <History className="size-5" /> Movement Logs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {machineTransfers.length > 0 ? (
                    <div className="space-y-4">
                      {machineTransfers.map((t) => (
                        <div key={t.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                          <div className="flex flex-col">
                            <span className="font-semibold text-sm">{t.fromLocation} &rarr; {t.toLocation}</span>
                            <span className="text-xs text-muted-foreground">Requested by {t.requestedBy}</span>
                          </div>
                          <span className="text-xs font-medium">{t.transferDate}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">No transfer records found.</div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="maintenance">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Wrench className="size-5" /> Service Record
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm border-b pb-2">
                      <span className="text-muted-foreground">Last Maintenance:</span>
                      <span className="font-medium">{machine.lastMaintenanceDate}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-b pb-2">
                      <span className="text-muted-foreground">Last Inspection:</span>
                      <span className="font-medium">{machine.lastInspectionDate}</span>
                    </div>
                    {machineMaintenance.map(task => (
                      <div key={task.id} className="bg-muted/50 p-3 rounded-md mt-4">
                         <div className="flex justify-between items-start mb-2">
                           <span className="text-sm font-semibold">{task.description}</span>
                           <Badge variant="outline">{task.status}</Badge>
                         </div>
                         <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Tech: {task.assignedTechnician}</span>
                            <span>{task.scheduledDate}</span>
                         </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="details">
               <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Technical Specifications</CardTitle>
                </CardHeader>
                <CardContent>
                   <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="p-3 border rounded-md">
                        <span className="block text-xs text-muted-foreground uppercase">Power Rating</span>
                        <span className="font-medium">45 kW</span>
                      </div>
                      <div className="p-3 border rounded-md">
                        <span className="block text-xs text-muted-foreground uppercase">Weight</span>
                        <span className="font-medium">2,450 kg</span>
                      </div>
                      <div className="p-3 border rounded-md">
                        <span className="block text-xs text-muted-foreground uppercase">Operating Temp</span>
                        <span className="font-medium">10&deg;C - 40&deg;C</span>
                      </div>
                      <div className="p-3 border rounded-md">
                        <span className="block text-xs text-muted-foreground uppercase">Control System</span>
                        <span className="font-medium">OS-Mach-9X</span>
                      </div>
                   </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <AIInspectionCard machine={machine} />

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
              <CardDescription>Manage this asset quickly.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Button className="w-full bg-primary justify-start" variant="default">
                <Repeat className="mr-2 size-4" /> Transfer Machine
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Wrench className="mr-2 size-4" /> Schedule Service
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <QrCode className="mr-2 size-4" /> Print Asset Label
              </Button>
            </CardContent>
          </Card>

          <Card>
             <CardHeader className="pb-3">
              <CardTitle className="text-lg">Usage Summary</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="text-sm text-muted-foreground italic leading-relaxed">
                  "{machine.usageHistory}"
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
