
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Save, Loader2, Factory } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useFirestore } from "@/firebase"
import { doc, setDoc } from "firebase/firestore"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"

export default function AddLinePage() {
  const router = useRouter()
  const { toast } = useToast()
  const firestore = useFirestore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lineName, setLineName] = useState("")
  const [supervisor, setSupervisor] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!lineName.trim() || !firestore) return

    setIsSubmitting(true)
    const lineId = lineName.trim()
    const lineRef = doc(firestore, "lines", lineId)
    const lineData = { name: lineId, supervisor: supervisor }

    setDoc(lineRef, lineData)
      .then(() => {
        setIsSubmitting(false)
        toast({ title: "Success", description: "New production line has been defined." })
        router.push('/lines')
      })
      .catch(async (error) => {
        setIsSubmitting(false)
        const permissionError = new FirestorePermissionError({
          path: lineRef.path,
          operation: 'create',
          requestResourceData: lineData,
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
          <h2 className="text-3xl font-bold tracking-tight">Create Production Line</h2>
          <p className="text-muted-foreground">Define a new zone or assembly line for asset allotment.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="border-none shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-lg">
                <Factory className="size-5 text-slate-600" />
              </div>
              <CardTitle>Line Details</CardTitle>
            </div>
            <CardDescription>Setup the identification for a new production area.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="line-name">Line Name</Label>
              <Input 
                id="line-name" 
                placeholder="e.g. Line 6 or Zone C" 
                value={lineName}
                onChange={(e) => setLineName(e.target.value)}
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supervisor">Supervisor Assigned (Optional)</Label>
              <Input 
                id="supervisor" 
                placeholder="e.g. John Doe" 
                value={supervisor}
                onChange={(e) => setSupervisor(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex gap-3 justify-end border-t p-6">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting} className="bg-slate-800 hover:bg-slate-900 text-white">
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Create Line
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
