
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
import { MACHINE_TYPES } from "@/lib/mock-data"

export default function ManageMachineTypesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [types, setTypes] = useState<string[]>(MACHINE_TYPES)
  const [newType, setNewType] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const handleAddType = () => {
    if (!newType.trim()) return
    if (types.includes(newType.trim())) {
      toast({ variant: "destructive", title: "Duplicate Type", description: "This machine type already exists." })
      return
    }
    setTypes([...types, newType.trim()])
    setNewType("")
  }

  const handleRemoveType = (typeToRemove: string) => {
    setTypes(types.filter(t => t !== typeToRemove))
  }

  const handleSave = () => {
    setIsSaving(true)
    // In a real app, this would update Firestore. For now we simulate and update local reference.
    setTimeout(() => {
      // Logic would go here to persist
      setIsSaving(false)
      toast({
        title: "Types Updated",
        description: "Machine categories have been successfully updated.",
      })
      router.push('/machines')
    }, 1000)
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
            <Label>Active Categories ({types.length})</Label>
            <div className="grid grid-cols-1 gap-2">
              {types.map((type) => (
                <div key={type} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border group hover:border-blue-200 hover:bg-white transition-all">
                  <span className="font-bold text-slate-700">{type}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                    onClick={() => handleRemoveType(type)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex gap-3 justify-end border-t p-6">
          <Button variant="outline" onClick={() => router.back()}>Discard Changes</Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 font-bold min-w-[120px]" 
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Changes
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
