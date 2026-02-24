
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
  Save,
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
  const { data: machineTypes, loading } = useCollection<MachineType>(typesQuery)

  const handleAddType = () => {
    if (!newType.trim() || !firestore) return
    const typeId = newType.trim()
    const typeRef = doc(firestore, "machineTypes", typeId)
    
    setDoc(typeRef, { name: typeId })
      .then(() => {
        setNewType("")
        toast({ title: "Type Added", description: `"${typeId}" added to registry.` })
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: typeRef.path,
          operation: 'create',
          requestResourceData: { name: typeId },
        })
        errorEmitter.emit('permission-error', permissionError)
      })
  }

  const handleRemoveType = (typeId: string) => {
    if (!firestore) return
    const typeRef = doc(firestore, "machineTypes", typeId)
    
    deleteDoc(typeRef)
      .then(() => {
        toast({ title: "Type Removed", description: "Category deleted successfully." })
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: typeRef.path,
          operation: 'delete',
        })
        errorEmitter.emit('permission-error', permissionError)
      })
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Machine Categories</h2>
          <p className="text-muted-foreground">Add or remove the types of equipment available in your registry.</p>
        </div>
      </div>

      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutGrid className="size-5 text-blue-600" />
            Configure Types
          </CardTitle>
          <CardDescription>These types will appear in dropdowns across the application.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="new-type">Add New Category</Label>
            <div className="flex gap-2">
              <Input 
                id="new-type" 
                placeholder="e.g. Laser Cutter" 
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddType()}
              />
              <Button onClick={handleAddType} variant="secondary" className="font-bold">
                <Plus className="mr-2 size-4" />
                Add
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Active Categories ({machineTypes?.length || 0})</Label>
            {loading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="size-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {machineTypes?.map((type) => (
                  <div key={type.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border group hover:border-blue-200 hover:bg-white transition-all">
                    <span className="font-bold text-slate-700">{type.name}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
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
        <CardFooter className="flex gap-3 justify-end border-t p-6">
          <Button variant="outline" onClick={() => router.back()}>Back to Registry</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
