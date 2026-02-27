
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
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
      setNewType("") // Clear input immediately
      toast({ title: "Type Added", description: `"${typeId}" added to registry.` })
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
      toast({ title: "Type Removed", description: "Category deleted." })
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
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Machine Categories</h2>
        </div>
      </div>

      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutGrid className="size-5 text-blue-600" />
            Registry Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="new-type" className="font-bold">New Category</Label>
            <div className="flex gap-2">
              <Input 
                id="new-type" 
                placeholder="e.g. Overlock Machine" 
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddType()}
                disabled={isSaving}
              />
              <Button onClick={handleAddType} disabled={isSaving || !newType.trim()} className="bg-blue-600">
                {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4 mr-2" />}
                Add
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-xs uppercase tracking-widest text-muted-foreground font-black">Active Categories</Label>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="size-8 animate-spin text-blue-500" />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {machineTypes?.map((type) => (
                  <div key={type.name} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border group">
                    <span className="font-bold text-slate-800">{type.name}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-slate-300 hover:text-red-500"
                      onClick={() => handleRemoveType(type.name)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="border-t bg-slate-50/50 p-6 flex justify-end">
          <Button variant="outline" onClick={() => router.back()}>Close</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
