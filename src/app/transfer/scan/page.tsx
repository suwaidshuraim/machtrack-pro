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
import { MACHINES } from "@/lib/mock-data"
import { Machine } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { ArrowRight, QrCode, CheckCircle2, Search, Keyboard } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const LOCATIONS = [
  "Production Floor A",
  "Production Floor B",
  "Assembly Line 1",
  "Machine Bank",
  "Fabrication Unit",
  "Warehouse B",
  "Packaging Area"
]

export default function ScanTransferPage() {
  const [scannedMachine, setScannedMachine] = useState<Machine | null>(null)
  const [manualId, setManualId] = useState("")
  const [newLocation, setNewLocation] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleManualDetect = () => {
    const machine = MACHINES.find(m => m.id.toUpperCase() === manualId.trim().toUpperCase())
    if (machine) {
      setScannedMachine(machine)
      toast({
        title: "Machine Identified",
        description: `Found: ${machine.name} (${machine.id})`,
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
        title: "Transfer Initiated",
        description: `${scannedMachine.name} is now being moved to ${newLocation}.`,
      })
      router.push('/dashboard')
    }, 1500)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Machine Transfer</h2>
        <p className="text-muted-foreground">Relocate an asset by scanning its QR code or entering the ID manually.</p>
      </div>

      {!scannedMachine ? (
        <Tabs defaultValue="scan" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="scan" className="flex items-center gap-2">
              <QrCode className="size-4" /> Scan QR
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <Keyboard className="size-4" /> Manual Entry
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="scan">
            <Card>
              <CardHeader className="text-center">
                <CardTitle>Align QR Code</CardTitle>
                <CardDescription>Position the machine's asset label within the frame.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <CameraScanner onScan={(id) => {
                  setManualId(id)
                  handleManualDetect()
                }} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manual">
            <Card>
              <CardHeader>
                <CardTitle>Enter Asset ID</CardTitle>
                <CardDescription>Type the unique identifier located on the machine's nameplate.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="asset-id">Machine ID</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="asset-id"
                        placeholder="e.g. MAC-001" 
                        value={manualId}
                        onChange={(e) => setManualId(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleManualDetect()}
                      />
                      <Button onClick={handleManualDetect}>
                        <Search className="size-4 mr-2" />
                        Detect
                      </Button>
                    </div>
                  </div>
                  <div className="pt-2">
                    <p className="text-xs text-muted-foreground mb-2">Available for testing:</p>
                    <div className="flex flex-wrap gap-2">
                      {MACHINES.slice(0, 4).map(m => (
                        <Badge 
                          key={m.id} 
                          variant="outline" 
                          className="cursor-pointer hover:bg-muted"
                          onClick={() => {
                            setManualId(m.id)
                          }}
                        >
                          {m.id}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Card className="animate-in fade-in slide-in-from-bottom-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="size-5 text-green-500" />
              Asset Verified
            </CardTitle>
            <CardDescription>Confirm relocation details for the identified machine.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4 bg-muted/50 p-4 rounded-lg border">
              <div>
                <Label className="text-[10px] uppercase text-muted-foreground font-bold">Machine</Label>
                <p className="font-semibold text-sm">{scannedMachine.name}</p>
                <p className="text-xs text-muted-foreground">{scannedMachine.id}</p>
              </div>
              <div>
                <Label className="text-[10px] uppercase text-muted-foreground font-bold">Current Location</Label>
                <p className="font-semibold text-sm text-primary">{scannedMachine.location}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Destination Location</Label>
                <Select onValueChange={setNewLocation} value={newLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select target floor or zone" />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCATIONS.filter(l => l !== scannedMachine.location).map(loc => (
                      <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Requested By</Label>
                <Input defaultValue="Admin User" disabled />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => {
                setScannedMachine(null)
                setManualId("")
              }}>
                Cancel / Reset
              </Button>
              <Button 
                className="flex-1 bg-accent hover:bg-accent/90" 
                disabled={!newLocation || isProcessing}
                onClick={handleTransfer}
              >
                {isProcessing ? "Processing..." : "Complete Transfer"}
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
