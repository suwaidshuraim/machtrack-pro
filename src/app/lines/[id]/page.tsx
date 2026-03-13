
"use client"

import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  ArrowLeft, 
  Edit2, 
  MapPin, 
  Info,
  User,
  Box,
  TrendingUp,
  Loader2,
  Factory
} from "lucide-react"
import { useFirestore, useDoc, useCollection, useMemoFirebase } from "@/firebase"
import { doc, collection, query, where } from "@/lib/local-firestore"
import { Machine, Line } from "@/lib/types"
import Link from "next/link"

export default function LineDetailPage() {
  const params = useParams()
  const router = useRouter()
  const firestore = useFirestore()
  
  const lineRef = useMemoFirebase(() => {
    if (!firestore || !params.id) return null
    return doc(firestore, "lines", params.id as string)
  }, [firestore, params.id])

  const { data: line, isLoading: loading } = useDoc<Line>(lineRef)

  const machinesQuery = useMemoFirebase(() => {
    if (!firestore || !line) return null
    return query(collection(firestore, "machines"), where("location", "==", line.name))
  }, [firestore, line])

  const { data: machines, isLoading: machinesLoading } = useCollection<Machine>(machinesQuery)

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin" /></div>
  if (!line) return <div className="text-center py-20 font-black">Line Not Found</div>

  const activeCount = (machines || []).filter(m => m.status === 'Running' || m.status === 'Idle').length
  const breakdownCount = (machines || []).filter(m => m.status === 'Breakdown' || m.status === 'Repair').length

  return (
    <div className="space-y-8 pb-12 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()} className="rounded-full">
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h2 className="text-3xl font-black tracking-tight">{line.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="font-mono">{line.id}</Badge>
              <Badge className="bg-primary font-black uppercase tracking-widest text-[10px]">Active Floor Plan</Badge>
            </div>
          </div>
        </div>
        <Button className="bg-slate-900 rounded-xl" asChild>
          <Link href={`/lines/${line.id}/edit`}>
            <Edit2 className="mr-2 size-4" />
            Edit Configuration
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden border-none shadow-xl rounded-3xl">
            <div className="relative h-64 md:h-80 w-full">
              <Image 
                src={line.imageUrl || `https://picsum.photos/seed/${line.id}/600/400`} 
                alt={line.name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-6 left-6 flex items-center gap-4 text-white">
                 <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                    <Factory className="size-8" />
                 </div>
                 <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] opacity-70">Supervisor</p>
                    <p className="text-xl font-black">{line.supervisor || 'N/A'}</p>
                 </div>
              </div>
            </div>
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Zone Description</h4>
                  <p className="text-slate-600 leading-relaxed font-medium">
                    {line.description || "No detailed description provided for this production line."}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-4 border-t">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                      <Box className="size-3" /> Total Fleet
                    </span>
                    <p className="text-xl font-black">{machines?.length || 0} Assets</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                      <TrendingUp className="size-3" /> Operational
                    </span>
                    <p className="text-xl font-black text-emerald-600">{activeCount}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center gap-1">
                      <Info className="size-3" /> Repair State
                    </span>
                    <p className="text-xl font-black text-red-600">{breakdownCount}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md rounded-3xl">
            <CardHeader>
              <CardTitle className="text-lg font-black">Line Machine List</CardTitle>
            </CardHeader>
            <CardContent>
              {machinesLoading ? (
                <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
              ) : machines && machines.length > 0 ? (
                <div className="space-y-3">
                  {machines.map((m) => (
                    <div key={m.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-sm transition-all">
                      <div className="flex items-center gap-4">
                        <div className="size-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                          <Box className="size-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-black text-sm">{m.type}</p>
                          <p className="text-[10px] font-mono text-muted-foreground">{m.id}</p>
                        </div>
                      </div>
                      <Badge className={m.status === 'Running' ? 'bg-emerald-500' : 'bg-slate-400'}>
                        {m.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 italic font-medium">No machines assigned to this line.</div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-lg rounded-3xl bg-primary text-white">
            <CardHeader>
               <CardTitle className="text-lg font-black">Zone Snapshot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="opacity-70">Uptime Rate</span>
                <span className="font-black text-lg">94.2%</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="opacity-70">Current Load</span>
                <span className="font-black text-lg">Heavy</span>
              </div>
              <Button className="w-full bg-white text-primary hover:bg-slate-100 font-black rounded-xl" asChild>
                <Link href="/transfer/scan">
                  Relocate Unit to {line.name}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
