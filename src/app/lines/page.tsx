
"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Factory, Plus, LayoutGrid, ArrowLeft, Search, X, Loader2, Edit2, Trash2, Eye, Box, TrendingUp, Info } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, doc } from "firebase/firestore"
import { deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates"
import { Machine, Line } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"

export default function LineMasterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [search, setSearch] = useState("")
  const [lineToDelete, setLineToDelete] = useState<string | null>(null)
  const firestore = useFirestore()

  const linesQuery = useMemoFirebase(() => {
    if (!firestore) return null
    return collection(firestore, "lines")
  }, [firestore])
  const { data: lines, isLoading: linesLoading } = useCollection<Line>(linesQuery)

  const machinesQuery = useMemoFirebase(() => {
    if (!firestore) return null
    return collection(firestore, "machines")
  }, [firestore])
  const { data: machines, isLoading: machinesLoading } = useCollection<Machine>(machinesQuery)

  const filteredLines = useMemo(() => {
    if (!lines) return []
    const s = search.toLowerCase().trim()
    if (!s) return lines

    return lines.filter(line => 
      line.name.toLowerCase().includes(s) || 
      line.supervisor?.toLowerCase().includes(s)
    )
  }, [lines, search])

  const handleDelete = () => {
    if (!lineToDelete || !firestore) return
    
    // Use non-blocking delete per guidelines
    const lineRef = doc(firestore, "lines", lineToDelete)
    deleteDocumentNonBlocking(lineRef)
    
    toast({ title: "Line Removed", description: "Production line registry has been updated." })
    setLineToDelete(null)
  }

  if (linesLoading || machinesLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="size-10 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()} className="rounded-full shadow-sm bg-white border-2">
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h2 className="text-3xl font-black tracking-tight text-slate-900">Line Master</h2>
            <p className="text-muted-foreground font-medium">Manage your production floor allocations.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input 
              placeholder="Search lines..." 
              className="pl-9 h-11 w-48 md:w-64 bg-slate-50 border-none rounded-xl font-bold text-xs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg h-11 font-bold rounded-xl" asChild>
            <Link href="/lines/new">
              <Plus className="mr-2 size-4" />
              Add Line
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {filteredLines.map((line) => {
          const lineMachines = (machines || []).filter(m => m.location === line.name)
          const activeCount = lineMachines.filter(m => m.status === 'Running' || m.status === 'Idle').length
          const repairCount = lineMachines.filter(m => m.status === 'Breakdown' || m.status === 'Repair').length

          return (
            <Card key={line.id} className="overflow-hidden border-none shadow-md bg-white hover:shadow-xl transition-all group border-l-4 border-l-transparent hover:border-l-primary rounded-[32px]">
              <CardHeader className="bg-slate-50/50 border-b py-6 flex flex-row items-center justify-between px-8">
                <div className="flex items-center gap-5">
                  <div className="p-4 bg-primary rounded-2xl text-white shadow-xl group-hover:scale-105 transition-transform">
                    <Factory className="size-7" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">{line.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Lead: {line.supervisor || 'Unassigned'}
                      </span>
                      <Badge variant="outline" className="text-[9px] font-black uppercase tracking-tighter border-slate-200">
                        {lineMachines.length} Units
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <Button variant="ghost" size="icon" className="rounded-2xl h-11 w-11 hover:bg-blue-50 text-blue-600" asChild>
                      <Link href={`/lines/${line.id}`}>
                        <Eye className="size-5" />
                      </Link>
                   </Button>
                   <Button variant="ghost" size="icon" className="rounded-2xl h-11 w-11 hover:bg-slate-100" asChild>
                      <Link href={`/lines/${line.id}/edit`}>
                        <Edit2 className="size-5" />
                      </Link>
                   </Button>
                   <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-2xl h-11 w-11 hover:bg-red-50 text-red-500"
                    onClick={() => setLineToDelete(line.id)}
                   >
                      <Trash2 className="size-5" />
                   </Button>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-slate-50 rounded-3xl p-5 border-2 border-slate-100 flex items-center justify-between group/stat">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Total Fleet</p>
                      <p className="text-3xl font-black text-slate-900 tracking-tighter">{lineMachines.length}</p>
                    </div>
                    <div className="p-3 bg-white rounded-2xl shadow-sm text-slate-400 group-hover/stat:text-primary transition-colors">
                      <Box className="size-6" />
                    </div>
                  </div>
                  <div className="bg-emerald-50 rounded-3xl p-5 border-2 border-emerald-100 flex items-center justify-between group/stat">
                    <div>
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-1">Operational</p>
                      <p className="text-3xl font-black text-emerald-700 tracking-tighter">{activeCount}</p>
                    </div>
                    <div className="p-3 bg-white rounded-2xl shadow-sm text-emerald-400 group-hover/stat:text-emerald-600 transition-colors">
                      <TrendingUp className="size-6" />
                    </div>
                  </div>
                  <div className="bg-red-50 rounded-3xl p-5 border-2 border-red-100 flex items-center justify-between group/stat">
                    <div>
                      <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em] mb-1">In Repair</p>
                      <p className="text-3xl font-black text-red-700 tracking-tighter">{repairCount}</p>
                    </div>
                    <div className="p-3 bg-white rounded-2xl shadow-sm text-red-400 group-hover/stat:text-red-600 transition-colors">
                      <Info className="size-6" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                   <Button variant="ghost" size="sm" className="text-primary font-black px-6 h-12 rounded-2xl hover:bg-primary/5" asChild>
                      <Link href="/machines">
                        <LayoutGrid className="mr-3 size-5" />
                        Audit Floor Machines
                      </Link>
                   </Button>
                   <Badge 
                    variant="outline" 
                    className={cn(
                      "font-black text-[10px] uppercase tracking-widest rounded-full px-5 py-2",
                      repairCount > 0 ? "text-red-600 border-red-200 bg-red-50" : "text-emerald-600 border-emerald-200 bg-emerald-50"
                    )}
                   >
                    System Status: {repairCount > 0 ? 'Critical Attention' : 'Optimal'}
                   </Badge>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <AlertDialog open={!!lineToDelete} onOpenChange={() => setLineToDelete(null)}>
        <AlertDialogContent className="rounded-[32px] border-none shadow-2xl p-10">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-black text-3xl tracking-tight text-slate-900">Remove Line Configuration?</AlertDialogTitle>
            <AlertDialogDescription className="text-lg font-medium text-slate-500 mt-2">
              This will permanently delete this production line from the registry. All machines assigned to this line will remain in the database but will need relocation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 mt-8">
            <AlertDialogCancel className="rounded-2xl h-14 px-8 font-black text-slate-600 border-2">Keep Registry</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 rounded-2xl h-14 px-8 font-black shadow-xl shadow-red-200">Confirm Deletion</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
