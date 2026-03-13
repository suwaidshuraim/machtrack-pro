
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
import { Textarea } from "@/components/ui/textarea"
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  LayoutGrid, 
  Loader2,
  FileText
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, doc, setDoc, deleteDoc } from "@/lib/local-firestore"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"
import { MachineType } from "@/lib/types"

export default function ManageMachineTypesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const firestore = useFirestore()
  const [newType, setNewType] = useState("")
  const [description, setDescription] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const typesQuery = useMemoFirebase(() => {
    if (!firestore) return null
    return collection(firestore, "machineTypes")
  }, [firestore])
  const { data: machineTypes, isLoading } = useCollection<MachineType>(typesQuery)

  const handleAddType = async () => {
    if (!newType.trim() || !firestore || isSaving) return
    
    setIsSaving(true)
    const typeId = newType.trim()
    const typeRef = doc(firestore, "machineTypes", typeId)
    const typeData = { name: typeId, description: description.trim() }
    
    try {
      await setDoc(typeRef, typeData)
      setNewType("") 
      setDescription("")
      toast({ title: "Category Added", description: `"${typeId}" has been registered.` })
    } catch (error) {
      const permissionError = new FirestorePermissionError({
        path: typeRef.path,
        operation: 'create',
        requestResourceData: typeData,
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
      toast({ title: "Removed", description: "Category deleted from registry." })
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
        <Button variant="outline" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowLeft className="size-4" />
        </Button>
        <h2 className="text-3xl font-black tracking-tight text-slate-900">Machine Registry</h2>
      </div>

      <Card className="border-none shadow-2xl rounded-3xl overflow-hidden">
        <CardHeader className="bg-primary text-white p-8">
          <CardTitle className="flex items-center gap-3 text-2xl font-black">
            <LayoutGrid className="size-8" />
            Machine Categories
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-10 p-8">
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="font-black text-[10px] uppercase tracking-widest text-primary">New Category Name</Label>
              <Input 
                id="new-type"
                placeholder="e.g. Overlock Machine" 
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="h-14 rounded-2xl border-2 font-bold text-lg"
                disabled={isSaving}
              />
            </div>

            <div className="space-y-3">
              <Label className="font-black text-[10px] uppercase tracking-widest text-primary">Description (Optional)</Label>
              <Textarea 
                placeholder="Brief purpose or specification notes..." 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[100px] rounded-2xl border-2 font-medium"
                disabled={isSaving}
              />
            </div>

            <Button onClick={handleAddType} disabled={isSaving || !newType.trim()} className="w-full bg-slate-900 h-14 rounded-2xl font-black text-lg">
              {isSaving ? <Loader2 className="animate-spin mr-2" /> : <Plus className="mr-2" />}
              Register Category
            </Button>
          </div>

          <div className="space-y-4 pt-6 border-t">
            <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400">Existing Registry</Label>
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="size-8 animate-spin text-blue-500" />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {machineTypes?.map((type) => (
                  <div key={type.name} className="flex items-start justify-between p-5 bg-slate-50 rounded-2xl hover:bg-blue-50 transition-colors group">
                    <div className="space-y-1">
                      <span className="font-black text-slate-800 text-lg block">{type.name}</span>
                      {type.description && (
                        <p className="text-xs text-slate-500 font-medium line-clamp-2 italic pr-4">
                          {type.description}
                        </p>
                      )}
                    </div>
                    <Button variant="ghost" size="icon" className="text-slate-300 hover:text-red-500 shrink-0" onClick={() => handleRemoveType(type.name)}>
                      <Trash2 className="size-5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="border-t bg-slate-50/50 p-6 flex justify-end">
          <Button variant="outline" onClick={() => router.back()} className="h-12 px-8 rounded-2xl font-bold">Close</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
