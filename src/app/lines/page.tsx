
"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Factory, Plus, LayoutGrid, ArrowLeft, Search, X, Loader2, Edit2, Trash2, Eye } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, doc, deleteDoc } from "firebase/firestore"
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

  const handleDelete = async () => {
    if (!lineToDelete || !firestore) return
    try {
      await deleteDoc(doc(firestore, "lines", lineToDelete))
      toast({ title: "Line Deleted", description: "Production line removed from registry." })
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not delete line." })
    } finally {
      setLineToDelete(null)
    }
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
          <Button variant="outline" size="icon" onClick={() => router.back()} className="rounded-full shadow-sm">
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
              className="pl-9 h-11 w-48 md:w-64 bg-slate-50 border-none rounded-xl"
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
            <Card key={line.id} className="overflow-hidden border-none shadow-md bg-white hover:shadow-xl transition-all group border-l-4 border-l-transparent hover:border-l-primary rounded-3xl">
              <CardHeader className="bg-slate-50/50 border-b py-5 flex flex-row items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary rounded-2xl text-white shadow-lg">
                    <Factory className="size-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-black text-slate-800">{line.name}</CardTitle>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                      Sup: {line.supervisor || 'Unassigned'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <Button variant="ghost" size="icon" className="rounded-full hover:bg-blue-50 text-blue-600" asChild>
                      <Link href={`/lines/${line.id}`}>
                        <Eye className="size-4" />
                      </Link>
                   </Button>
                   <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100" asChild>
                      <Link href={`/lines/${line.id}/edit`}>
                        <Edit2 className="size-4" />
                      </Link>
                   </Button>
                   <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-full hover:bg-red-50 text-red-500"
                    onClick={() => setLineToDelete(line.id)}
                   >
                      <Trash2 className="size-4" />
                   </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Fleet</p>
                    <p className="text-2xl font-black text-slate-800">{lineMachines.length} units</p>
                  </div>
                  <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Running</p>
                    <p className="text-2xl font-black text-emerald-700">{activeCount}</p>
                  </div>
                  <div className="bg-red-50 rounded-2xl p-4 border border-red-100">
                    <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">In Repair</p>
                    <p className="text-2xl font-black text-red-700">{repairCount}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-5 border-t border-slate-50">
                   <Button variant="ghost" size="sm" className="text-primary font-black px-4 rounded-xl" asChild>
                      <Link href="/machines">
                        <LayoutGrid className="mr-2 size-4" />
                        Audit Machines
                      </Link>
                   </Button>
                   <Badge variant="outline" className="font-black text-[10px] uppercase tracking-widest rounded-full px-4">
                    Live Status: {repairCount > 0 ? 'Action Needed' : 'Nominal'}
                   </Badge>
                </div>
              </CardContent>
            </Card>
          )
        })}
        {filteredLines.length === 0 && (
          <div className="text-center py-20 opacity-40">
            <Factory className="size-16 mx-auto mb-4" />
            <p className="font-black text-lg uppercase tracking-widest">No production lines found</p>
          </div>
        )}
      </div>

      <AlertDialog open={!!lineToDelete} onOpenChange={() => setLineToDelete(null)}>
        <AlertDialogContent className="rounded-3xl border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-black text-2xl">Delete line configuration?</AlertDialogTitle>
            <AlertDialogDescription className="font-medium text-slate-500">
              This will permanently delete this production line from the registry. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-xl h-12 font-bold">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 rounded-xl h-12 font-black">Delete Line</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
