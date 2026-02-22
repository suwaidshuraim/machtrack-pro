
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
import { MACHINES } from "@/lib/mock-data"
import { Machine } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { ArrowRight, QrCode, CheckCircle2 } from "lucide-react"

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
  const [newLocation, setNewLocation] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // Simulate finding a machine by ID (from a QR scan)
  const handleSimulateScan = () => {
    // For demo: picking a random machine
    const randomMachine = MACHINES[Math.floor(Math.random() * MACHINES.length)]
    setScannedMachine(randomMachine)
    toast({
      title: "Machine Identified",
      description: `Detected: ${randomMachine.name} (${randomMachine.id})`,
    })
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
        <p className="text-muted-foreground">Scan an asset QR code to update its location instantly.</p>
      </div>

      {!scannedMachine ? (
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto size-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
              <QrCode className="size-6 text-accent" />
            </div>
            <CardTitle>Align QR Code</CardTitle>
            <CardDescription>Position the machine's asset label within the frame below.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <CameraScanner onScan={(id) => console.log('Scanned ID:', id)} />
            
            <div className="flex flex-col items-center gap-4">
              <p className="text-xs text-muted-foreground italic">Having trouble scanning? Try entering the ID manually.</p>
              <div className="flex gap-2 w-full">
                <Input placeholder="Enter Asset ID (e.g. MAC-001)" />
                <Button variant="secondary" onClick={handleSimulateScan}>Detect</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="animate-in fade-in slide-in-from-bottom-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="size-5 text-green-500" />
              Asset Verified
            </CardTitle>
            <CardDescription>Confirm relocation details for the machine below.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4 bg-muted/50 p-4 rounded-lg border">
              <div>
                <Label className="text-[10px] uppercase text-muted-foreground font-bold">Machine</Label>
                <p className="font-semibold text-sm">{scannedMachine.name}</p>
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
              <Button variant="outline" className="flex-1" onClick={() => setScannedMachine(null)}>
                Rescan
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
