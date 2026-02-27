
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
import { Machine, Line, User } from "@/lib/types"
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
  Loader2,
  ShieldCheck
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ScanTransferPage() {
  const [scannedMachine, setScannedMachine] = useState<Machine | null>(null)
  const [manualId, setManualId] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [newLocation, setNewLocation] = useState("")
  const [authorizedBy, setAuthorizedBy] = useState("")
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

  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null
    return collection(firestore, "users")
  }, [firestore])
  const { data: users } = useCollection<User>(usersQuery)

  const handleDetect = (id: string) => {
    const machine = machines?.find(m => m.id.toUpperCase() === id.trim().toUpperCase())
    if (machine) {
      setScannedMachine(machine)
      toast({ title: "Machine Identified", description: `${machine.type} (${machine.id})` })
    } else {
      toast({ variant: "destructive", title: "Machine Not Found", description: "Invalid asset identifier." })
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
      requestedBy: "Floor Operator",
      authorizedBy: authorizedBy || "Auto-Approved",
      status: "Completed"
    }

    try {
      await addDoc(transferRef, transferData)
      await updateDoc(machineRef, { 
        location: newLocation,
        status: statusUpdate
      })
      
      toast({ title: "Transfer Completed", description: `Asset relocated to ${newLocation}.` })
      router.push('/dashboard')
    } catch (error) {
      toast({ variant: "destructive", title: "Transfer Failed", description: "Check permissions and try again." })
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
          <h2 className="text-3xl font-black tracking-tight text-slate-900">Machine Transfer</h2>
          <p className="text-muted-foreground font-medium">Initiate an equipment relocation workflow.</p>
        </div>
      </div>

      {!scannedMachine ? (
        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 h-12 bg-slate-100">
            <TabsTrigger value="list" className="flex items-center gap-2 font-bold data-[state=active]:bg-white">
              <ListFilter className="size-4" /> Registry
            </TabsTrigger>
            <TabsTrigger value="scan" className="flex items-center gap-2 font-bold data-[state=active]:bg-white">
              <QrCode className="size-4" /> QR Scan
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center gap-2 font-bold data-[state=active]:bg-white">
              <Keyboard className="size-4" /> Manual ID
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="list">
            <Card className="border-none shadow-xl rounded-3xl">
              <CardHeader className="pb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search machines..." 
                    className="pl-9 h-11 bg-slate-50 border-none rounded-xl"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>
                ) : (
                  <ScrollArea className="h-[350px] pr-4">
                    <div className="space-y-2">
                      {filteredMachines.map((m) => (
                        <div 
                          key={m.id}
                          className="flex items-center justify-between p-4 rounded-2xl border-2 border-transparent bg-white hover:border-primary hover:bg-blue-50/50 cursor-pointer transition-all group"
                          onClick={() => handleDetect(m.id)}
                        >
                          <div>
                            <p className="font-black text-sm group-hover:text-primary">{m.type}</p>
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
                <CardDescription className="text-slate-400">Position the asset tag within the viewfinder.</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <CameraScanner onScan={(id) => handleDetect(id)} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manual">
            <Card className="border-none shadow-xl rounded-3xl">
              <CardHeader>
                <CardTitle className="font-black text-lg">Direct Identifier Input</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-4">
                <div className="space-y-3">
                  <Label htmlFor="asset-id" className="font-black text-[10px] uppercase tracking-widest text-primary">Asset ID</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="asset-id"
                      placeholder="e.g. FB-101" 
                      className="font-mono h-12 font-black border-2 rounded-xl"
                      value={manualId}
                      onChange={(e) => setManualId(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleDetect(manualId)}
                    />
                    <Button onClick={() => handleDetect(manualId)} className="h-12 px-8 rounded-xl font-black bg-slate-900">Identify</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Card className="border-none shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-emerald-600 text-white p-8">
            <CardTitle className="flex items-center gap-3 text-2xl font-black">
              <CheckCircle2 className="size-8" />
              Asset Verified
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8 p-8">
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-6 rounded-3xl border border-slate-100">
              <div>
                <Label className="text-[10px] uppercase text-slate-400 font-black tracking-widest">Machine</Label>
                <p className="font-black text-xl text-slate-900">{scannedMachine.type}</p>
                <p className="text-xs font-mono font-black text-primary uppercase">{scannedMachine.id}</p>
              </div>
              <div className="text-right">
                <Label className="text-[10px] uppercase text-slate-400 font-black tracking-widest">Current Unit</Label>
                <p className="font-black text-xl text-slate-700">{scannedMachine.location}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="font-black text-[10px] uppercase tracking-widest text-primary">Destination Line</Label>
                <Select onValueChange={setNewLocation} value={newLocation}>
                  <SelectTrigger className="h-12 border-2 rounded-xl font-black">
                    <SelectValue placeholder="Select target location" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="Machine Bank" className="font-black py-3">Machine Bank (Warehouse)</SelectItem>
                    {lines?.filter(l => l.name !== scannedMachine.location).map(loc => (
                      <SelectItem key={loc.id} value={loc.name} className="py-3 font-bold">{loc.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400">Authorization (Optional)</Label>
                <Select onValueChange={setAuthorizedBy} value={authorizedBy}>
                  <SelectTrigger className="h-12 border-2 rounded-xl font-bold">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="size-4 text-slate-400" />
                      <SelectValue placeholder="Authorized by..." />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {users?.map(user => (
                      <SelectItem key={user.id} value={`${user.firstName} ${user.lastName}`} className="py-3 font-bold">
                        {user.firstName} {user.lastName} ({user.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button variant="outline" className="flex-1 h-14 rounded-xl font-black" onClick={() => setScannedMachine(null)}>
                Change Unit
              </Button>
              <Button 
                className="flex-1 bg-primary hover:bg-primary/90 text-white font-black h-14 rounded-xl text-lg shadow-xl" 
                disabled={!newLocation || isProcessing}
                onClick={handleTransfer}
              >
                {isProcessing ? "Updating..." : "Complete Relocation"}
                {!isProcessing && <ArrowRight className="ml-2 size-5" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
