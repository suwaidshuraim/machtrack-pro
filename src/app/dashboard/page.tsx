
"use client"

import { useMemo, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { useCollection, useMemoFirebase, useFirebase } from "@/firebase"
import { collection, doc, updateDoc } from "@/lib/local-firestore"
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
  const { firestore } = useFirebase()
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
    if (!file || !firestore || !activeTypeId) {
      toast({ variant: "destructive", title: "Error", description: "Missing required dependencies for upload." })
      return
    }

    setUploadingId(activeTypeId)
    try {
      const downloadURL = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (ev) => resolve(ev.target?.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
      const typeDocRef = doc(firestore, "machineTypes", activeTypeId)
      await updateDoc(typeDocRef, { imageUrl: downloadURL })
      
      toast({ title: "Success", description: "Machine image updated successfully." })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error)
      console.error("Upload failed:", errorMessage, error)
      toast({ 
        variant: "destructive", 
        title: "Upload Failed", 
        description: errorMessage.includes("permission") 
          ? "Check your permissions." 
          : `Error: ${errorMessage.substring(0, 100)}`
      })
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
        <Loader2 className="size-12 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-12">
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleImageUpload} 
      />

      {/* SECTION 1: Machine Statistics */}
      <section className="space-y-4">
        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Machine Statistics</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden">
            <CardContent className="p-6 md:p-8 flex flex-col items-center justify-center text-center">
              <Box className="size-6 text-primary mb-2" />
              <span className="text-4xl font-black text-slate-900 tracking-tighter">{stats.total}</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Total Machine</span>
            </CardContent>
          </Card>
          <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden">
            <CardContent className="p-6 md:p-8 flex flex-col items-center justify-center text-center">
              <TrendingUp className="size-6 text-emerald-500 mb-2" />
              <span className="text-4xl font-black text-slate-900 tracking-tighter">{stats.active}</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mt-1">Active / Running / Idle</span>
            </CardContent>
          </Card>
          <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden">
            <CardContent className="p-6 md:p-8 flex flex-col items-center justify-center text-center">
              <Warehouse className="size-6 text-blue-500 mb-2" />
              <span className="text-4xl font-black text-slate-900 tracking-tighter">{stats.bank}</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 mt-1">Machine Bank</span>
            </CardContent>
          </Card>
          <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden">
            <CardContent className="p-6 md:p-8 flex flex-col items-center justify-center text-center">
              <Wrench className="size-6 text-red-500 mb-2" />
              <span className="text-4xl font-black text-slate-900 tracking-tighter">{stats.repair}</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-red-500 mt-1">Repair / Breakdown</span>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* SECTION 2: Operations */}
      <section className="space-y-4">
        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Inventory Controls</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <Link href="/transfer/scan" className="group">
            <Card className="border-none shadow-xl bg-primary text-white hover:bg-primary/95 transition-all rounded-3xl overflow-hidden h-full">
              <CardContent className="p-8 md:p-10 flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black tracking-tight">Machine Transfer</h3>
                  <p className="text-primary-foreground/70 text-sm font-medium">Relocate equipment across zones</p>
                </div>
                <div className="p-5 bg-white/10 rounded-2xl group-hover:scale-110 transition-transform">
                  <Repeat className="size-10" />
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/machines" className="group">
            <Card className="border-none shadow-xl bg-slate-900 text-white hover:bg-slate-800 transition-all rounded-3xl overflow-hidden h-full">
              <CardContent className="p-8 md:p-10 flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black tracking-tight">Machine Master</h3>
                  <p className="text-slate-400 text-sm font-medium">Complete technical asset registry</p>
                </div>
                <div className="p-5 bg-white/10 rounded-2xl group-hover:scale-110 transition-transform">
                  <LayoutGrid className="size-10" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      {/* SECTION 3: Logs & Layout */}
      <section className="space-y-4">
        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Floor Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <Link href="/transfers" className="group">
            <Card className="border-none shadow-xl bg-accent text-white hover:bg-accent/95 transition-all rounded-3xl overflow-hidden h-full">
              <CardContent className="p-8 md:p-10 flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black tracking-tight">Transfer History</h3>
                  <p className="text-accent-foreground/70 text-sm font-medium">Audit logs for equipment movement</p>
                </div>
                <div className="p-5 bg-white/10 rounded-2xl group-hover:scale-110 transition-transform">
                  <History className="size-10" />
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/lines" className="group">
            <Card className="border-none shadow-xl bg-white text-slate-900 border-2 border-slate-100 hover:bg-slate-50 transition-all rounded-3xl overflow-hidden h-full">
              <CardContent className="p-8 md:p-10 flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black tracking-tight text-primary">Line Master</h3>
                  <p className="text-slate-500 text-sm font-medium">Production zone mapping</p>
                </div>
                <div className="p-5 bg-slate-100 rounded-2xl group-hover:scale-110 transition-transform text-primary">
                  <Factory className="size-10" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      {/* SECTION 4: Machine Types */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Equipment Categories</h2>
          <Button variant="ghost" size="sm" className="font-black text-[10px] uppercase tracking-widest text-primary" asChild>
            <Link href="/machines/types">Edit Registry</Link>
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
              <Card key={type.name} className="overflow-hidden border-none shadow-xl rounded-3xl bg-white flex flex-col group h-full">
                <div className="relative h-56 w-full">
                  <Image 
                    src={type.imageUrl || `https://picsum.photos/seed/${type.name}/500/400`} 
                    alt={type.name} 
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5">
                    <h3 className="font-black text-white text-2xl leading-none">{type.name}</h3>
                    <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mt-1.5">{typeMachines.length} Units On Floor</p>
                  </div>
                  <div className="absolute top-5 right-5">
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="h-10 rounded-2xl bg-white/95 backdrop-blur-md font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all shadow-xl"
                      onClick={() => triggerUpload(type.id || type.name)}
                      disabled={uploadingId === (type.id || type.name)}
                    >
                      {uploadingId === (type.id || type.name) ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4 mr-2" />}
                      Change Image
                    </Button>
                  </div>
                </div>
                <CardContent className="p-8 flex-1 flex flex-col justify-between">
                  <div className="space-y-6">
                    {type.description && (
                      <p className="text-xs text-slate-500 font-bold leading-relaxed italic line-clamp-3">
                        "{type.description}"
                      </p>
                    )}
                    
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-emerald-50 rounded-2xl p-3 border border-emerald-100 text-center">
                        <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Active</p>
                        <p className="text-xl font-black text-emerald-700">{breakdown['Running'] || 0}</p>
                      </div>
                      <div className="bg-amber-50 rounded-2xl p-3 border border-amber-100 text-center">
                        <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-1">Idle</p>
                        <p className="text-xl font-black text-amber-700">{breakdown['Idle'] || 0}</p>
                      </div>
                      <div className="bg-red-50 rounded-2xl p-3 border border-red-100 text-center">
                        <p className="text-[9px] font-black text-red-600 uppercase tracking-widest mb-1">Issue</p>
                        <p className="text-xl font-black text-red-700">{(breakdown['Repair'] || 0) + (breakdown['Breakdown'] || 0)}</p>
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
