
"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Save, Loader2, Factory, Camera, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useFirestore, useFirebase } from "@/firebase"
import { doc, setDoc } from "firebase/firestore"
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage"
import Image from "next/image"

export default function AddLinePage() {
  const router = useRouter()
  const { toast } = useToast()
  const firestore = useFirestore()
  const { firebaseApp } = useFirebase()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [lineName, setLineName] = useState("")
  const [supervisor, setSupervisor] = useState("")
  const [description, setDescription] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !firebaseApp) {
      toast({ variant: "destructive", title: "Error", description: "Firebase app not initialized." })
      return
    }

    setUploading(true)
    try {
      const storage = getStorage(firebaseApp)
      const imagePath = `lines/temp/${Date.now()}_${file.name}`
      const sRef = storageRef(storage, imagePath)

      console.log("Starting image upload:", imagePath)
      const uploadSnapshot = await uploadBytes(sRef, file)
      console.log("Upload successful:", uploadSnapshot.ref.fullPath)
      
      const url = await getDownloadURL(sRef)
      console.log("Download URL obtained:", url)
      
      setImageUrl(url)
      toast({ title: "Image Uploaded", description: "Line preview is ready." })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error)
      console.error("Upload error:", errorMessage, error)
      toast({ 
        variant: "destructive", 
        title: "Upload Failed", 
        description: errorMessage.includes("permission") 
          ? "Check Firebase Storage rules and permissions." 
          : `Error: ${errorMessage.substring(0, 100)}`
      })
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!lineName.trim() || !firestore || isSubmitting) return

    setIsSubmitting(true)
    const lineId = lineName.trim().replace(/\s+/g, '-').toLowerCase()
    const lineRef = doc(firestore, "lines", lineId)
    
    const lineData = { 
      id: lineId,
      name: lineName.trim(), 
      supervisor: supervisor.trim(),
      description: description.trim(),
      imageUrl: imageUrl
    }

    try {
      await setDoc(lineRef, lineData)
      toast({ title: "Success", description: "New production line has been defined." })
      router.push('/lines')
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not save production line." })
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900">Define Production Line</h2>
          <p className="text-muted-foreground font-medium">Create a new floor zone for machine allotment.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="border-none shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b py-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-2xl">
                <Factory className="size-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl font-black">Line Details</CardTitle>
                <CardDescription>Setup identification and location visuals.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-8 p-8">
            <div className="space-y-4">
              <Label className="font-black text-[10px] uppercase tracking-widest text-primary">Floor Visualization</Label>
              <div className="relative h-48 w-full bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden group">
                {imageUrl ? (
                  <>
                    <Image src={imageUrl} alt="Line preview" fill className="object-cover" />
                    <Button 
                      type="button" 
                      variant="destructive" 
                      size="icon" 
                      className="absolute top-2 right-2 rounded-full h-8 w-8"
                      onClick={() => setImageUrl("")}
                    >
                      <X className="size-4" />
                    </Button>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    {uploading ? <Loader2 className="animate-spin" /> : <Camera className="size-8" />}
                    <p className="text-xs font-bold uppercase tracking-widest">{uploading ? 'Uploading...' : 'Upload Line Photo'}</p>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      className="mt-2 rounded-full font-black text-[10px] uppercase"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Select File
                    </Button>
                  </div>
                )}
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="line-name" className="font-black text-[10px] uppercase tracking-widest text-slate-400">Line Name</Label>
                <Input 
                  id="line-name" 
                  placeholder="e.g. Line 06 or Zone C" 
                  className="h-12 rounded-xl border-2 font-bold"
                  value={lineName}
                  onChange={(e) => setLineName(e.target.value)}
                  required 
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="supervisor" className="font-black text-[10px] uppercase tracking-widest text-slate-400">Supervisor Name</Label>
                <Input 
                  id="supervisor" 
                  placeholder="Primary overseer" 
                  className="h-12 rounded-xl border-2 font-bold"
                  value={supervisor}
                  onChange={(e) => setSupervisor(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="desc" className="font-black text-[10px] uppercase tracking-widest text-slate-400">Description</Label>
              <Textarea 
                id="desc" 
                placeholder="Zone responsibilities or special equipment notes..." 
                className="rounded-xl border-2 min-h-[100px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex gap-4 justify-end border-t bg-slate-50/50 p-8">
            <Button type="button" variant="outline" onClick={() => router.back()} className="h-12 px-8 rounded-xl">Cancel</Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || uploading} 
              className="bg-primary hover:bg-primary/90 h-12 min-w-[160px] font-black rounded-xl"
            >
              {isSubmitting ? <Loader2 className="mr-2 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Line
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
