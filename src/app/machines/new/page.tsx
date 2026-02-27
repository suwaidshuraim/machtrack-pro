
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, Loader2, Sparkles, Building2 } from "lucide-react"
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
  const [status, setStatus] = useState<MachineStatus>("Bank")
  const [notes, setNotes] = useState("")

  const typesQuery = useMemoFirebase(() => {
    if (!firestore) return null
    return collection(firestore, "machineTypes")
  }, [firestore])
  const { data: machineTypes, isLoading: typesLoading } = useCollection<MachineType>(typesQuery)

  const linesQuery = useMemoFirebase(() => {
    if (!firestore) return null
    return collection(firestore, "lines")
  }, [firestore])
  const { data: lines, isLoading: linesLoading } = useCollection<{ name: string }>(linesQuery)

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

  // Sync status constraints when location changes
  useEffect(() => {
    if (location === "Machine Bank") {
      if (status !== "Bank" && status !== "Repair" && status !== "Breakdown") {
        setStatus("Bank")
      }
    }
  }, [location, status])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedType || !firestore || isSubmitting) return

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

    try {
      await setDoc(machineRef, machineData)
      toast({ title: "Asset Registered", description: `Asset ${assetId} has been added to the registry.` })
      router.push('/machines')
    } catch (error) {
      const permissionError = new FirestorePermissionError({
        path: machineRef.path,
        operation: 'create',
        requestResourceData: machineData,
      })
      errorEmitter.emit('permission-error', permissionError)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Register Machine</h2>
          <p className="text-muted-foreground">Add a new asset to your factory registry.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="border-none shadow-lg overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b">
            <CardTitle>Specifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <Label htmlFor="type" className="font-bold">Machine Category</Label>
              <Select onValueChange={setSelectedType} required>
                <SelectTrigger id="type" className="h-12 border-2">
                  <SelectValue placeholder={typesLoading ? "Loading..." : "Pick a category"} />
                </SelectTrigger>
                <SelectContent>
                  {machineTypes?.map(type => (
                    <SelectItem key={type.name} value={type.name}>{type.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400">Asset ID</Label>
                <Input value={assetId} readOnly className="bg-slate-50 font-mono text-blue-600 font-bold" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400">Serial No</Label>
                <Input value={serial} readOnly className="bg-slate-50 font-mono" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="location" className="font-bold">Location</Label>
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
                <Label htmlFor="status" className="font-bold">Initial Status</Label>
                <Select onValueChange={(v) => setStatus(v as MachineStatus)} value={status}>
                  <SelectTrigger id="status" className="h-11">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {location === "Machine Bank" ? (
                      <>
                        <SelectItem value="Bank" className="text-blue-600">Available (Bank)</SelectItem>
                        <SelectItem value="Repair" className="text-orange-600">In Repair</SelectItem>
                        <SelectItem value="Breakdown" className="text-red-600">Breakdown</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="Running" className="text-green-600">Running</SelectItem>
                        <SelectItem value="Idle" className="text-yellow-600">Idle</SelectItem>
                        <SelectItem value="Breakdown" className="text-red-600">Breakdown</SelectItem>
                        <SelectItem value="Repair" className="text-orange-600">In Repair</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="history" className="font-bold">Initial Notes</Label>
              <Textarea 
                id="history" 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)} 
                className="min-h-[100px] resize-none" 
              />
            </div>
          </CardContent>
          <CardFooter className="flex gap-3 justify-end border-t bg-slate-50/50 p-6">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !selectedType} 
              className="bg-blue-600 hover:bg-blue-700 min-w-[150px] font-bold"
            >
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Asset
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
