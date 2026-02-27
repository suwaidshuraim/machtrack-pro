
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardFooter
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  LayoutGrid, 
  Loader2
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, doc, setDoc, deleteDoc } from "firebase/firestore"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"
import { MachineType } from "@/lib/types"

export default function ManageMachineTypesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const firestore = useFirestore()
  const [newType, setNewType] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const typesQuery = useMemoFirebase(() => {
    if (!firestore) return null
    return collection(firestore, "machineTypes")
  }, [firestore])
  const { data: machineTypes, isLoading: loading } = useCollection<MachineType>(typesQuery)

  const handleAddType = async () => {
    if (!newType.trim() || !firestore || isSaving) return
    
    setIsSaving(true)
    const typeId = newType.trim()
    const typeRef = doc(firestore, "machineTypes", typeId)
    
    try {
      await setDoc(typeRef, { name: typeId })
      setNewType("") 
      toast({ title: "Category Registered", description: `"${typeId}" has been added.` })
    } catch (error) {
      const permissionError = new FirestorePermissionError({
        path: typeRef.path,
        operation: 'create',
        requestResourceData: { name: typeId },
      })
      errorEmitter.emit('permission-error', permissionError)
    } finally {
      setIsSaving(false)
    }
  }

  const handleRemoveType = async (typeId: string) => {
    if (!firestore) return
    const typeRef = doc(firestore, "machineTypes", typeId)
    
    try {
      await deleteDoc(typeRef)
      toast({ title: "Category Removed", description: "The type has been deleted from registry." })
    } catch (error) {
      const permissionError = new FirestorePermissionError({
        path: typeRef.path,
        operation: 'delete',
      })
      errorEmitter.emit('permission-error', permissionError)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()} className="rounded-full shadow-sm">
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900">Machine Registry</h2>
        </div>
      </div>

      <Card className="border-none shadow-2xl rounded-3xl overflow-hidden">
        <CardHeader className="bg-blue-600 text-white p-8">
          <CardTitle className="flex items-center gap-3 text-2xl font-black">
            <LayoutGrid className="size-8" />
            Category Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-10 p-8">
          <div className="space-y-4">
            <Label htmlFor="new-type" className="font-black text-[10px] uppercase tracking-[0.2em] text-blue-600">Add New Category</Label>
            <div className="flex gap-3">
              <Input 
                id="new-type" 
                placeholder="e.g. Overlock Machine" 
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddType()}
                className="h-14 rounded-2xl border-2 font-bold px-6 text-lg"
                disabled={isSaving}
              />
              <Button onClick={handleAddType} disabled={isSaving || !newType.trim()} className="bg-slate-900 h-14 px-8 rounded-2xl font-black text-lg">
                {isSaving ? <Loader2 className="size-5 animate-spin" /> : <Plus className="size-5 mr-2" />}
                Add
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <Label className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Current Fleet Categories</Label>
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="size-12 animate-spin text-blue-500" />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {machineTypes?.map((type) => (
                  <div key={type.name} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border-2 border-transparent hover:border-blue-100 transition-all group">
                    <span className="font-black text-slate-800 text-lg">{type.name}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-slate-300 hover:bg-red-50 hover:text-red-500 rounded-xl"
                      onClick={() => handleRemoveType(type.name)}
                    >
                      <Trash2 className="size-5" />
                    </Button>
                  </div>
                ))}
                {machineTypes?.length === 0 && (
                  <div className="py-20 text-center border-4 border-dashed rounded-3xl opacity-40">
                    <p className="font-black text-lg uppercase tracking-widest">Registry Empty</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="border-t bg-slate-50/50 p-8 flex justify-end">
          <Button variant="outline" onClick={() => router.back()} className="h-12 px-8 rounded-xl font-bold">Close</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
