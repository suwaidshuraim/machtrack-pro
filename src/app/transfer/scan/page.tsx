"use client"

import { useState } from "react"
import { CameraScanner } from "@/components/camera-scanner"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, doc, updateDoc, addDoc } from "firebase/firestore"
import { Machine, Line } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { 
  ArrowRight, 
  QrCode, 
  CheckCircle2, 
  Search, 
  Keyboard, 
  ListFilter,
  ArrowLeft,
  Loader2
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"

export default function ScanTransferPage() {
  const [scannedMachine, setScannedMachine] = useState<Machine | null>(null)
  const [manualId, setManualId] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [newLocation, setNewLocation] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const firestore = useFirestore()

  const machinesQuery = useMemoFirebase(() => {
    if (!firestore) return null
    return collection(firestore, "machines")
  }, [firestore])
  const { data: machines, isLoading: loading } = useCollection<Machine>(machinesQuery)

  const linesQuery = useMemoFirebase(() => {
    if (!firestore) return null
    return collection(firestore, "lines")
  }, [firestore])
  const { data: lines } = useCollection<Line>(linesQuery)

  const handleDetect = (id: string) => {
    const machine = machines?.find(m => m.id.toUpperCase() === id.trim().toUpperCase())
    if (machine) {
      setScannedMachine(machine)
      toast({ title: "Machine Identified", description: `${machine.type} (${machine.id}) found at ${machine.location}` })
    } else {
      toast({ variant: "destructive", title: "Machine Not Found", description: "Please check the ID and try again." })
    }
  }

  const handleTransfer = async () => {
    if (!scannedMachine || !newLocation || !firestore || isProcessing) return

    setIsProcessing(true)
    const machineRef = doc(firestore, "machines", scannedMachine.id)
    const transferRef = collection(firestore, "transfers")
    const oldLocation = scannedMachine.location

    const statusUpdate = newLocation === "Machine Bank" ? "Bank" : scannedMachine.status

    const transferData = {
      machineId: scannedMachine.id,
      machineName: scannedMachine.name || scannedMachine.id,
      fromLocation: oldLocation,
      toLocation: newLocation,
      transferDate: new Date().toISOString(),
      requestedBy: "Admin System",
      status: "Completed"
    }

    try {
      await addDoc(transferRef, transferData)
      await updateDoc(machineRef, { 
        location: newLocation,
        status: statusUpdate
      })
      
      toast({ title: "Transfer Completed", description: `${scannedMachine.id} relocated to ${newLocation}.` })
      router.push('/dashboard')
    } catch (error) {
      const permissionError = new FirestorePermissionError({
        path: machineRef.path,
        operation: 'update',
        requestResourceData: { location: newLocation },
      })
      errorEmitter.emit('permission-error', permissionError)
      setIsProcessing(false)
    }
  }

  const filteredMachines = machines?.filter(m => 
    m.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.type.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Machine Transfer</h2>
          <p className="text-muted-foreground">Select a machine to relocate it to a new production area.</p>
        </div>
      </div>

      {!scannedMachine ? (
        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 h-12">
            <TabsTrigger value="list" className="flex items-center gap-2 font-bold">
              <ListFilter className="size-4" /> Browse Master
            </TabsTrigger>
            <TabsTrigger value="scan" className="flex items-center gap-2 font-bold">
              <QrCode className="size-4" /> Scan QR
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center gap-2 font-bold">
              <Keyboard className="size-4" /> Manual ID
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="list">
            <Card className="border-none shadow-xl rounded-3xl">
              <CardHeader className="pb-3">
                <CardTitle className="font-black">Master Registry</CardTitle>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search machines..." 
                    className="pl-9 bg-slate-50 h-11 rounded-xl border-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex h-64 items-center justify-center">
                    <Loader2 className="size-8 animate-spin text-blue-500" />
                  </div>
                ) : (
                  <ScrollArea className="h-[350px] pr-4">
                    <div className="space-y-2">
                      {filteredMachines.map((m) => (
                        <div 
                          key={m.id}
                          className="flex items-center justify-between p-4 rounded-2xl border-2 border-transparent bg-white hover:border-blue-500 hover:bg-blue-50/50 cursor-pointer transition-all group"
                          onClick={() => handleDetect(m.id)}
                        >
                          <div>
                            <p className="font-black text-sm group-hover:text-blue-600 leading-tight">{m.type}</p>
                            <p className="font-mono text-[10px] text-muted-foreground font-black uppercase tracking-widest">{m.id}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[9px] uppercase font-black text-slate-400 tracking-widest">Current</p>
                            <p className="text-xs font-bold text-slate-700">{m.location}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scan">
            <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
              <CardHeader className="text-center bg-slate-900 text-white">
                <CardTitle className="font-black">Optical QR Scan</CardTitle>
                <CardDescription className="text-slate-400">Position the machine label within the viewfinder.</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <CameraScanner onScan={(id) => handleDetect(id)} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manual">
            <Card className="border-none shadow-xl rounded-3xl">
              <CardHeader>
                <CardTitle className="font-black">Direct ID Input</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-4">
                <div className="space-y-3">
                  <Label htmlFor="asset-id" className="font-black text-[10px] uppercase tracking-widest text-blue-600">Machine ID</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="asset-id"
                      placeholder="e.g. FB-101" 
                      className="font-mono h-14 text-lg font-black border-2 rounded-2xl px-6"
                      value={manualId}
                      onChange={(e) => setManualId(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleDetect(manualId)}
                    />
                    <Button onClick={() => handleDetect(manualId)} className="h-14 px-8 rounded-2xl font-black bg-slate-900">Detect</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Card className="border-none shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-green-600 text-white p-8">
            <CardTitle className="flex items-center gap-3 text-2xl font-black">
              <CheckCircle2 className="size-8" />
              Machine Identified
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8 p-8">
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-6 rounded-3xl border-2 border-slate-100">
              <div>
                <Label className="text-[10px] uppercase text-slate-400 font-black tracking-widest">Machine</Label>
                <p className="font-black text-xl text-slate-900 leading-tight">{scannedMachine.type}</p>
                <p className="text-xs font-mono font-black text-blue-600 uppercase tracking-widest">{scannedMachine.id}</p>
              </div>
              <div className="text-right">
                <Label className="text-[10px] uppercase text-slate-400 font-black tracking-widest">Current Unit</Label>
                <p className="font-black text-xl text-slate-700">{scannedMachine.location}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-3">
                <Label className="font-black text-[10px] uppercase tracking-widest text-blue-600">Target Destination</Label>
                <Select onValueChange={setNewLocation} value={newLocation}>
                  <SelectTrigger className="h-14 border-2 rounded-2xl font-black text-lg">
                    <SelectValue placeholder="Select target line or bank" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="Machine Bank" className="font-black py-4">Machine Bank (Warehouse)</SelectItem>
                    {lines?.filter(l => l.name !== scannedMachine.location).map(loc => (
                      <SelectItem key={loc.name} value={loc.name} className="py-4 font-bold">{loc.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button variant="outline" className="flex-1 h-14 rounded-2xl font-black" onClick={() => setScannedMachine(null)}>
                Cancel
              </Button>
              <Button 
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black h-14 rounded-2xl text-lg shadow-xl shadow-blue-100" 
                disabled={!newLocation || isProcessing}
                onClick={handleTransfer}
              >
                {isProcessing ? "Processing..." : "Complete Relocation"}
                {!isProcessing && <ArrowRight className="ml-2 size-5" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
