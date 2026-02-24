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
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MACHINES } from "@/lib/mock-data"
import { Machine } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { 
  ArrowRight, 
  QrCode, 
  CheckCircle2, 
  Search, 
  Keyboard, 
  ListFilter,
  ArrowLeft
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const LOCATIONS = [
  "Line 1",
  "Line 2",
  "Line 3",
  "Line 4",
  "Line 5",
  "Machine Bank",
  "Production Floor A",
  "Fabrication Unit",
]

export default function ScanTransferPage() {
  const [scannedMachine, setScannedMachine] = useState<Machine | null>(null)
  const [manualId, setManualId] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [newLocation, setNewLocation] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleDetect = (id: string) => {
    const machine = MACHINES.find(m => m.id.toUpperCase() === id.trim().toUpperCase())
    if (machine) {
      setScannedMachine(machine)
      toast({
        title: "Machine Identified",
        description: `${machine.type} (${machine.id}) found at ${machine.location}`,
      })
    } else {
      toast({
        variant: "destructive",
        title: "Asset Not Found",
        description: "Please check the ID and try again.",
      })
    }
  }

  const handleTransfer = () => {
    if (!scannedMachine || !newLocation) return

    setIsProcessing(true)
    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false)
      toast({
        title: "Transfer Completed",
        description: `${scannedMachine.id} relocated to ${newLocation}.`,
      })
      router.push('/dashboard')
    }, 1200)
  }

  const filteredMachines = MACHINES.filter(m => 
    m.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.type.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Machine Transfer</h2>
          <p className="text-muted-foreground">Select an asset to relocate it to a new production line.</p>
        </div>
      </div>

      {!scannedMachine ? (
        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <ListFilter className="size-4" /> Browse Master
            </TabsTrigger>
            <TabsTrigger value="scan" className="flex items-center gap-2">
              <QrCode className="size-4" /> Scan QR
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <Keyboard className="size-4" /> Manual ID
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="list">
            <Card className="border-none shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle>Select from Master Registry</CardTitle>
                <CardDescription>Search for a machine by its Asset ID or Type.</CardDescription>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search machines..." 
                    className="pl-9 bg-slate-50"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[350px] pr-4">
                  <div className="space-y-2">
                    {filteredMachines.map((m) => (
                      <div 
                        key={m.id}
                        className="flex items-center justify-between p-3 rounded-xl border bg-white hover:border-blue-500 hover:bg-blue-50/50 cursor-pointer transition-all group"
                        onClick={() => handleDetect(m.id)}
                      >
                        <div>
                          <p className="font-bold text-sm group-hover:text-blue-600">{m.type}</p>
                          <p className="font-mono text-[10px] text-muted-foreground font-bold uppercase">{m.id}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] uppercase font-bold text-slate-400">Location</p>
                          <p className="text-xs font-semibold">{m.location}</p>
                        </div>
                      </div>
                    ))}
                    {filteredMachines.length === 0 && (
                      <div className="py-12 text-center text-muted-foreground">
                        No machines found matching your search.
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scan">
            <Card className="border-none shadow-lg">
              <CardHeader className="text-center">
                <CardTitle>Align QR Code</CardTitle>
                <CardDescription>Position the machine's asset label within the frame.</CardDescription>
              </CardHeader>
              <CardContent>
                <CameraScanner onScan={(id) => handleDetect(id)} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manual">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle>Enter Asset ID</CardTitle>
                <CardDescription>Type the unique identifier (e.g., FB-101).</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="asset-id">Machine ID</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="asset-id"
                      placeholder="e.g. FB-101" 
                      className="font-mono h-11"
                      value={manualId}
                      onChange={(e) => setManualId(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleDetect(manualId)}
                    />
                    <Button onClick={() => handleDetect(manualId)} className="h-11">
                      Detect
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Card className="border-none shadow-xl animate-in fade-in slide-in-from-bottom-4">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="flex items-center gap-2 text-xl">
              <CheckCircle2 className="size-6 text-green-500" />
              Identify Complete
            </CardTitle>
            <CardDescription>Confirm the relocation details for this asset.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid grid-cols-2 gap-4 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
              <div>
                <Label className="text-[10px] uppercase text-blue-600 font-black tracking-widest">Asset Identified</Label>
                <p className="font-bold text-lg leading-tight">{scannedMachine.type}</p>
                <p className="text-xs font-mono font-bold text-slate-500 uppercase">{scannedMachine.id}</p>
              </div>
              <div className="text-right">
                <Label className="text-[10px] uppercase text-slate-500 font-black tracking-widest">Current Location</Label>
                <p className="font-black text-lg text-blue-600">{scannedMachine.location}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="font-bold">Target Destination</Label>
                <Select onValueChange={setNewLocation} value={newLocation}>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Select target line or bank" />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCATIONS.filter(l => l !== scannedMachine.location).map(loc => (
                      <SelectItem key={loc} value={loc} className="py-3 font-medium">
                        {loc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground font-bold">Requested By</Label>
                <Input defaultValue="Admin System" disabled className="bg-slate-50 h-11" />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1 h-12 rounded-xl" onClick={() => {
                setScannedMachine(null)
                setManualId("")
              }}>
                Cancel / Reset
              </Button>
              <Button 
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-blue-200" 
                disabled={!newLocation || isProcessing}
                onClick={handleTransfer}
              >
                {isProcessing ? "Processing..." : "Finish Transfer"}
                {!isProcessing && <ArrowRight className="ml-2 size-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
