
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, Loader2, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { doc, setDoc, collection } from "firebase/firestore"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"
import { MachineType, MachineStatus } from "@/lib/types"

export default function AddMachinePage() {
  const router = useRouter()
  const { toast } = useToast()
  const firestore = useFirestore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [selectedType, setSelectedType] = useState<string>("")
  const [assetId, setAssetId] = useState("Select Type...")
  const [serial, setSerial] = useState("")
  const [location, setLocation] = useState("Machine Bank")
  const [status, setStatus] = useState<MachineStatus>("Running")
  const [notes, setNotes] = useState("")

  const typesQuery = useMemoFirebase(() => {
    if (!firestore) return null
    return collection(firestore, "machineTypes")
  }, [firestore])
  const { data: machineTypes } = useCollection<MachineType>(typesQuery)

  const linesQuery = useMemoFirebase(() => {
    if (!firestore) return null
    return collection(firestore, "lines")
  }, [firestore])
  const { data: lines } = useCollection<{ name: string }>(linesQuery)

  useEffect(() => {
    if (selectedType) {
      const prefix = selectedType.split(' ').map(word => word[0].toUpperCase()).join('')
      const nextNum = 100 + Math.floor(Math.random() * 900)
      const generatedId = `${prefix}-${nextNum}`
      const generatedSerial = `SN-${prefix}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
      setAssetId(generatedId)
      setSerial(generatedSerial)
    } else {
      setAssetId("Select Type...")
      setSerial("")
    }
  }, [selectedType])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedType || !firestore) return

    setIsSubmitting(true)
    const machineRef = doc(firestore, "machines", assetId)
    const machineData = {
      id: assetId,
      name: `${selectedType} ${assetId}`,
      serialNumber: serial,
      type: selectedType,
      location: location,
      status: status,
      usageHistory: notes,
      lastMaintenanceDate: new Date().toISOString().split('T')[0],
      lastInspectionDate: new Date().toISOString().split('T')[0],
      imageUrl: `https://picsum.photos/seed/${assetId}/400/300`
    }

    setDoc(machineRef, machineData)
      .then(() => {
        setIsSubmitting(false)
        toast({ title: "Success", description: `Asset ${assetId} registered successfully.` })
        router.push('/machines')
      })
      .catch(async (error) => {
        setIsSubmitting(false)
        const permissionError = new FirestorePermissionError({
          path: machineRef.path,
          operation: 'create',
          requestResourceData: machineData,
        })
        errorEmitter.emit('permission-error', permissionError)
      })
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Register New Machine</h2>
          <p className="text-muted-foreground">Add a new industrial asset to the Machine Master registry.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle>Asset Information</CardTitle>
            <CardDescription>Select a type to automatically generate the Asset ID and Serial.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="type" className="text-sm font-bold">Machine Type</Label>
              <Select onValueChange={setSelectedType} required>
                <SelectTrigger id="type" className="h-12 text-base font-semibold">
                  <SelectValue placeholder="Pick a machine category" />
                </SelectTrigger>
                <SelectContent>
                  {machineTypes?.map(type => (
                    <SelectItem key={type.name} value={type.name} className="font-medium">{type.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="asset-id" className="text-muted-foreground">Asset ID (Auto-Format)</Label>
                <div className="relative">
                  <Input id="asset-id" value={assetId} readOnly className="bg-slate-50 font-mono text-blue-600 font-bold border-dashed" />
                  {selectedType && <Sparkles className="absolute right-3 top-1/2 -translate-y-1/2 size-3 text-blue-400" />}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="serial" className="text-muted-foreground">Serial Number (Auto)</Label>
                <div className="relative">
                  <Input id="serial" value={serial} readOnly className="bg-slate-50 font-mono" />
                  {selectedType && <Sparkles className="absolute right-3 top-1/2 -translate-y-1/2 size-3 text-slate-400" />}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Initial Location</Label>
              <Select onValueChange={setLocation} value={location} required>
                <SelectTrigger id="location" className="h-11">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Machine Bank">Machine Bank</SelectItem>
                  {lines?.map(l => (
                    <SelectItem key={l.name} value={l.name}>{l.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Initial Status</Label>
              <Select onValueChange={(v) => setStatus(v as MachineStatus)} defaultValue="Running">
                <SelectTrigger id="status" className="h-11">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Running">Running</SelectItem>
                  <SelectItem value="Idle">Idle</SelectItem>
                  <SelectItem value="Bank">Bank</SelectItem>
                  <SelectItem value="Breakdown">Breakdown</SelectItem>
                  <SelectItem value="Repair">Repair</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="history">Usage/History Notes</Label>
              <Textarea id="history" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Describe the machine's intended use or background..." className="min-h-[100px]" />
            </div>
          </CardContent>
          <CardFooter className="flex gap-3 justify-end border-t p-6">
            <Button type="button" variant="outline" onClick={() => router.back()} className="h-11 px-6">Cancel</Button>
            <Button type="submit" disabled={isSubmitting || !selectedType} className="bg-blue-600 hover:bg-blue-700 h-11 min-w-[160px] font-bold">
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Asset
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
