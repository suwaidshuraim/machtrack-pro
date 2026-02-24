
"use client"

import { useState, useEffect } from "react"
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
  Settings2,
  Loader2
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useFirestore, useDoc, useCollection, useMemoFirebase } from "@/firebase"
import { doc, updateDoc, collection, query, where } from "firebase/firestore"
import { Machine, MachineStatus, Transfer } from "@/lib/types"
import { AIInspectionCard } from "@/components/ai-inspection-card"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"

export default function MachineDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const firestore = useFirestore()
  
  const machineRef = useMemoFirebase(() => {
    if (!firestore || !params.id) return null
    return doc(firestore, "machines", params.id as string)
  }, [firestore, params.id])

  const { data: machine, loading } = useDoc<Machine>(machineRef)

  const transfersQuery = useMemoFirebase(() => {
    if (!firestore || !params.id) return null
    return query(collection(firestore, "transfers"), where("machineId", "==", params.id))
  }, [firestore, params.id])

  const { data: transfers } = useCollection<Transfer>(transfersQuery)

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!machine) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <h2 className="text-2xl font-bold">Machine Not Found</h2>
        <Button onClick={() => router.push('/machines')}>Go to Master</Button>
      </div>
    )
  }

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
    if (!firestore || !machineRef) return

    updateDoc(machineRef, { status: value })
      .then(() => {
        toast({ title: "Status Updated", description: `Asset ${machine.id} status changed to ${value}.` })
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: machineRef.path,
          operation: 'update',
          requestResourceData: { status: value },
        })
        errorEmitter.emit('permission-error', permissionError)
      })
  }

  return (
    <div className="space-y-8 pb-12 max-w-6xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{machine.type}</h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="font-mono">{machine.id}</Badge>
            <Badge variant="secondary">{machine.serialNumber}</Badge>
            <Badge className={cn("text-white font-bold", getStatusColor(machine.status))}>{machine.status}</Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden border-none shadow-lg">
            <div className="relative h-64 md:h-80 w-full group">
              <Image 
                src={machine.imageUrl || `https://picsum.photos/seed/${machine.id}/600/400`} 
                alt={machine.type}
                fill
                className="object-cover"
                data-ai-hint="industrial machine"
              />
              <div className="absolute bottom-4 right-4">
                <Button variant="secondary" size="sm" className="shadow-lg backdrop-blur-sm bg-white/90 font-bold">
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
                  <p className="font-bold">{machine.type}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                    <MapPin className="size-3" /> Active Location
                  </span>
                  <p className="font-black text-blue-600">{machine.location}</p>
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
                  {transfers && transfers.length > 0 ? (
                    <div className="space-y-4">
                      {transfers.map((t) => (
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
                      <span className="font-bold">{machine.lastMaintenanceDate}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-b pb-3">
                      <span className="text-muted-foreground font-medium">Last Inspection:</span>
                      <span className="font-bold">{machine.lastInspectionDate}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
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
                <Select value={machine.status} onValueChange={(v) => handleStatusChange(v as MachineStatus)}>
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

          <AIInspectionCard machine={machine} />
        </div>
      </div>
    </div>
  )
}
