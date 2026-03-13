"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { doc, setDoc, collection } from "@/lib/local-firestore"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"
import { MachineType, MachineStatus, Line } from "@/lib/types"
import { cn } from "@/lib/utils"

export default function AddMachinePage() {
  const router = useRouter()
  const { toast } = useToast()
  const firestore = useFirestore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [selectedType, setSelectedType] = useState<string>("")
  const [assetId, setAssetId] = useState("...")
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
  const { data: lines } = useCollection<Line>(linesQuery)

  useEffect(() => {
    if (selectedType) {
      const prefix = selectedType.split(' ').map(word => word[0].toUpperCase()).join('')
      const nextNum = 100 + Math.floor(Math.random() * 900)
      setAssetId(`${prefix}-${nextNum}`)
      setSerial(`SN-${prefix}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`)
    }
  }, [selectedType])

  const statusOptions = useMemo(() => {
    if (location === "Machine Bank") {
      return [
        { label: "Available (Bank)", value: "Bank", className: "text-blue-600" },
        { label: "Repair", value: "Repair", className: "text-orange-600" },
        { label: "Breakdown", value: "Breakdown", className: "text-red-600" }
      ]
    }
    return [
      { label: "Running", value: "Running", className: "text-green-600" },
      { label: "Idle", value: "Idle", className: "text-yellow-600" },
      { label: "Breakdown", value: "Breakdown", className: "text-red-600" },
      { label: "Repair", value: "Repair", className: "text-orange-600" }
    ]
  }, [location])

  useEffect(() => {
    const validValues = statusOptions.map(o => o.value)
    if (!validValues.includes(status)) {
      setStatus(validValues[0] as MachineStatus)
    }
  }, [location, statusOptions, status])

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
      toast({ title: "Registration Successful", description: `Machine ${assetId} added to registry.` })
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
          <h2 className="text-3xl font-black tracking-tight text-slate-900">Register Machine</h2>
          <p className="text-muted-foreground font-medium">Onboard a new industrial machine to your fleet.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="border-none shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b py-8">
            <CardTitle className="text-xl font-black">Technical Specifications</CardTitle>
            <CardDescription>Define identifying characteristics and initial placement.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 pt-8 px-8">
            <div className="space-y-3">
              <Label className="font-black text-[10px] uppercase tracking-widest text-blue-600">Equipment Category</Label>
              <Select onValueChange={setSelectedType} required>
                <SelectTrigger className="h-14 border-2 rounded-2xl font-bold text-lg">
                  <SelectValue placeholder={typesLoading ? "Syncing..." : "Pick a category"} />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  {machineTypes?.map(type => (
                    <SelectItem key={type.name} value={type.name} className="py-3 font-bold">{type.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Machine ID</Label>
                <input value={assetId} readOnly className="h-14 bg-slate-50 border-none font-mono text-blue-600 font-black text-lg rounded-2xl w-full px-4 focus:outline-none" />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Serial Number</Label>
                <input value={serial} readOnly className="h-14 bg-slate-50 border-none font-mono font-bold text-lg rounded-2xl w-full px-4 focus:outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="font-black text-[10px] uppercase tracking-widest text-blue-600">Placement</Label>
                <Select onValueChange={setLocation} value={location} required>
                  <SelectTrigger className="h-14 border-2 rounded-2xl font-bold">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="Machine Bank" className="font-bold py-3">Machine Bank (Warehouse)</SelectItem>
                    {lines?.map(l => (
                      <SelectItem key={l.name} value={l.name} className="font-bold py-3">{l.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="font-black text-[10px] uppercase tracking-widest text-blue-600">Initial Status</Label>
                <Select onValueChange={(v) => setStatus(v as MachineStatus)} value={status}>
                  <SelectTrigger className="h-14 border-2 rounded-2xl font-bold">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    {statusOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value} className={cn("py-3 font-black", opt.className)}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="font-black text-[10px] uppercase tracking-widest text-blue-600">Notes</Label>
              <Textarea 
                placeholder="Condition notes, required attachments..."
                value={notes} 
                onChange={(e) => setNotes(e.target.value)} 
                className="min-h-[120px] rounded-2xl border-2" 
              />
            </div>
          </CardContent>
          <CardFooter className="flex gap-4 justify-end border-t bg-slate-50/50 p-8">
            <Button type="button" variant="outline" onClick={() => router.back()} className="h-14 px-8 rounded-2xl">Cancel</Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !selectedType} 
              className="bg-blue-600 hover:bg-blue-700 h-14 min-w-[200px] font-black text-lg rounded-2xl"
            >
              {isSubmitting ? <Loader2 className="mr-2 animate-spin" /> : <Save className="mr-2" />}
              Save Machine
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
