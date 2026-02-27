
"use client"

import { useMemo, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { useCollection, useMemoFirebase, useFirebase } from "@/firebase"
import { collection, doc, updateDoc } from "firebase/firestore"
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage"
import { 
  Repeat, 
  LayoutGrid, 
  Loader2,
  TrendingUp,
  History,
  Box,
  Warehouse,
  Wrench,
  Camera,
  Factory
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Machine, MachineType } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export default function DashboardPage() {
  const { firestore, firebaseApp } = useFirebase()
  const { toast } = useToast()
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [activeTypeId, setActiveTypeId] = useState<string | null>(null)

  const machinesQuery = useMemoFirebase(() => {
    if (!firestore) return null
    return collection(firestore, "machines")
  }, [firestore])

  const typesQuery = useMemoFirebase(() => {
    if (!firestore) return null
    return collection(firestore, "machineTypes")
  }, [firestore])

  const { data: machines, isLoading: machinesLoading } = useCollection<Machine>(machinesQuery)
  const { data: machineTypes, isLoading: typesLoading } = useCollection<MachineType>(typesQuery)

  const stats = useMemo(() => {
    const safeMachines = machines || []
    const total = safeMachines.length
    const active = safeMachines.filter(m => m.status === 'Running' || m.status === 'Idle').length
    const bank = safeMachines.filter(m => m.location === 'Machine Bank').length
    const repair = safeMachines.filter(m => m.status === 'Breakdown' || m.status === 'Repair').length
    
    return { total, active, bank, repair }
  }, [machines])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !firebaseApp || !firestore || !activeTypeId) return

    setUploadingId(activeTypeId)
    const storage = getStorage(firebaseApp)
    const imagePath = `machineTypes/${activeTypeId}/${Date.now()}_${file.name}`
    const sRef = storageRef(storage, imagePath)

    try {
      await uploadBytes(sRef, file)
      const downloadURL = await getDownloadURL(sRef)
      
      const typeDocRef = doc(firestore, "machineTypes", activeTypeId)
      await updateDoc(typeDocRef, { imageUrl: downloadURL })
      
      toast({ title: "Image Updated", description: "Machine category image has been refreshed." })
    } catch (error) {
      console.error("Upload failed", error)
      toast({ variant: "destructive", title: "Upload Failed", description: "Could not update image." })
    } finally {
      setUploadingId(null)
      setActiveTypeId(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const triggerUpload = (typeId: string) => {
    setActiveTypeId(typeId)
    fileInputRef.current?.click()
  }

  if (machinesLoading || typesLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="size-10 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-10 pb-20">
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleImageUpload} 
      />

      {/* SECTION 1: Summary Cards */}
      <section className="space-y-4">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 pl-1">Fleet Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-none shadow-md bg-white rounded-2xl">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-1">
              <Box className="size-5 text-primary mb-1" />
              <span className="text-3xl font-black text-slate-900">{stats.total}</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Total Machines</span>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md bg-white rounded-2xl">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-1">
              <TrendingUp className="size-5 text-emerald-500 mb-1" />
              <span className="text-3xl font-black text-slate-900">{stats.active}</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Active Units</span>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md bg-white rounded-2xl">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-1">
              <Warehouse className="size-5 text-blue-500 mb-1" />
              <span className="text-3xl font-black text-slate-900">{stats.bank}</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Machine Bank</span>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md bg-white rounded-2xl">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-1">
              <Wrench className="size-5 text-red-500 mb-1" />
              <span className="text-3xl font-black text-slate-900">{stats.repair}</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Repair/Breakdown</span>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* SECTION 2: Operations */}
      <section className="space-y-4">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 pl-1">Primary Operations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/transfer/scan">
            <Card className="border-none shadow-lg bg-primary text-white hover:bg-primary/95 transition-all active:scale-[0.98] rounded-2xl overflow-hidden group">
              <CardContent className="p-8 flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black tracking-tight">Machine Transfer</h3>
                  <p className="text-primary-foreground/70 text-sm font-medium">Initiate equipment relocation</p>
                </div>
                <div className="p-4 bg-white/10 rounded-2xl group-hover:scale-110 transition-transform">
                  <Repeat className="size-8" />
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/machines">
            <Card className="border-none shadow-lg bg-slate-900 text-white hover:bg-slate-800 transition-all active:scale-[0.98] rounded-2xl overflow-hidden group">
              <CardContent className="p-8 flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black tracking-tight">Machine Master</h3>
                  <p className="text-slate-400 text-sm font-medium">Registry & technical specs</p>
                </div>
                <div className="p-4 bg-white/10 rounded-2xl group-hover:scale-110 transition-transform">
                  <LayoutGrid className="size-8" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      {/* SECTION 3: Logs & Layout */}
      <section className="space-y-4">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 pl-1">Tracking & Assets</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/transfers">
            <Card className="border-none shadow-lg bg-accent text-white hover:bg-accent/95 transition-all active:scale-[0.98] rounded-2xl overflow-hidden group">
              <CardContent className="p-8 flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black tracking-tight">Transfer History</h3>
                  <p className="text-accent-foreground/70 text-sm font-medium">Historical relocation logs</p>
                </div>
                <div className="p-4 bg-white/10 rounded-2xl group-hover:scale-110 transition-transform">
                  <History className="size-8" />
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/lines">
            <Card className="border-none shadow-lg bg-white text-slate-900 border border-slate-100 hover:bg-slate-50 transition-all active:scale-[0.98] rounded-2xl overflow-hidden group">
              <CardContent className="p-8 flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black tracking-tight">Line Master</h3>
                  <p className="text-slate-500 text-sm font-medium">Production floor management</p>
                </div>
                <div className="p-4 bg-slate-100 rounded-2xl group-hover:scale-110 transition-transform text-primary">
                  <Factory className="size-8" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      {/* SECTION 4: Machine Types */}
      <section className="space-y-4">
        <div className="flex items-center justify-between pr-2">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 pl-1">Equipment Registry</h2>
          <Button variant="ghost" size="sm" className="font-black text-[10px] uppercase text-primary" asChild>
            <Link href="/machines/types">Configure Types</Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {machineTypes?.map((type) => {
            const typeMachines = (machines || []).filter(m => m.type === type.name)
            const breakdown = typeMachines.reduce((acc, m) => {
              acc[m.status] = (acc[m.status] || 0) + 1
              return acc
            }, {} as Record<string, number>)

            return (
              <Card key={type.name} className="overflow-hidden border-none shadow-md hover:shadow-xl transition-all rounded-2xl bg-white flex flex-col">
                <div className="relative h-44 w-full group">
                  <Image 
                    src={type.imageUrl || `https://picsum.photos/seed/${type.name}/400/300`} 
                    alt={type.name} 
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="font-black text-white text-xl leading-tight">{type.name}</h3>
                    <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">{typeMachines.length} Units Total</p>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="h-8 rounded-full bg-white/90 backdrop-blur-sm font-black text-[10px] uppercase opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => triggerUpload(type.name)}
                      disabled={uploadingId === type.name}
                    >
                      {uploadingId === type.name ? <Loader2 className="size-3 animate-spin" /> : <Camera className="size-3 mr-1" />}
                      Change Image
                    </Button>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {type.description && (
                      <p className="text-xs text-slate-500 font-medium leading-relaxed italic line-clamp-2">
                        "{type.description}"
                      </p>
                    )}
                    
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-emerald-50 rounded-xl p-2 border border-emerald-100 text-center">
                        <p className="text-[8px] font-black text-emerald-600 uppercase">Run</p>
                        <p className="text-sm font-black text-emerald-700">{breakdown['Running'] || 0}</p>
                      </div>
                      <div className="bg-amber-50 rounded-xl p-2 border border-amber-100 text-center">
                        <p className="text-[8px] font-black text-amber-600 uppercase">Idle</p>
                        <p className="text-sm font-black text-amber-700">{breakdown['Idle'] || 0}</p>
                      </div>
                      <div className="bg-red-50 rounded-xl p-2 border border-red-100 text-center">
                        <p className="text-[8px] font-black text-red-600 uppercase">Rep</p>
                        <p className="text-sm font-black text-red-700">{(breakdown['Repair'] || 0) + (breakdown['Breakdown'] || 0)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>
    </div>
  )
}
