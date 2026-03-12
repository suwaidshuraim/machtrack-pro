
"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Save, Loader2, Factory, Camera, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useFirestore, useFirebase, useDoc, useMemoFirebase } from "@/firebase"
import { doc, updateDoc } from "firebase/firestore"
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage"
import Image from "next/image"
import { Line } from "@/lib/types"

export default function EditLinePage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const firestore = useFirestore()
  const { firebaseApp } = useFirebase()
  
  const lineRef = useMemoFirebase(() => {
    if (!firestore || !params.id) return null
    return doc(firestore, "lines", params.id as string)
  }, [firestore, params.id])

  const { data: line, isLoading: loading } = useDoc<Line>(lineRef)
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lineName, setLineName] = useState("")
  const [supervisor, setSupervisor] = useState("")
  const [description, setDescription] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (line) {
      setLineName(line.name)
      setSupervisor(line.supervisor || "")
      setDescription(line.description || "")
      setImageUrl(line.imageUrl || "")
    }
  }, [line])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !firebaseApp) {
      toast({ variant: "destructive", title: "Error", description: "Firebase app not initialized." })
      return
    }

    setUploading(true)
    try {
      const storage = getStorage(firebaseApp)
      const imagePath = `lines/${params.id}/${Date.now()}_${file.name}`
      const sRef = storageRef(storage, imagePath)

      console.log("Starting image upload:", imagePath)
      const uploadSnapshot = await uploadBytes(sRef, file)
      console.log("Upload successful:", uploadSnapshot.ref.fullPath)
      
      const url = await getDownloadURL(sRef)
      console.log("Download URL obtained:", url)
      
      setImageUrl(url)
      
      // Update Firestore immediately if editing existing
      if (lineRef) {
        await updateDoc(lineRef, { imageUrl: url })
        console.log("Firestore document updated")
      }
      
      toast({ title: "Image Uploaded", description: "Line preview updated." })
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
    if (!lineName.trim() || !lineRef || isSubmitting) return

    setIsSubmitting(true)
    const lineData = { 
      name: lineName.trim(), 
      supervisor: supervisor.trim(),
      description: description.trim(),
      imageUrl: imageUrl
    }

    try {
      await updateDoc(lineRef, lineData)
      toast({ title: "Updated", description: "Line configuration saved." })
      router.push('/lines')
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not update production line." })
      setIsSubmitting(false)
    }
  }

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="size-10 animate-spin text-primary" /></div>

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()} className="rounded-full shadow-sm bg-white border-2 border-slate-100">
          <ArrowLeft className="size-5" />
        </Button>
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900">Edit Production Line</h2>
          <p className="text-muted-foreground font-medium">Modify floor zone parameters.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="border-none shadow-2xl rounded-3xl overflow-hidden bg-white">
          <CardHeader className="bg-slate-50 border-b p-10">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-primary/10 rounded-2xl">
                <Factory className="size-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl font-black">Line: {lineName}</CardTitle>
                <CardDescription className="text-base font-bold text-slate-400">Manage identification and mapping.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-10 p-10">
            <div className="space-y-4">
              <Label className="font-black text-[11px] uppercase tracking-[0.2em] text-primary pl-1">Floor Visualization</Label>
              <div className="relative h-64 w-full bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden group transition-all hover:border-primary/50">
                {imageUrl ? (
                  <>
                    <Image src={imageUrl} alt="Line preview" fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <Button 
                        type="button" 
                        variant="secondary" 
                        size="sm" 
                        className="rounded-2xl font-black text-xs uppercase shadow-2xl"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Camera className="size-4 mr-2" />
                        Replace Image
                      </Button>
                    </div>
                    <Button 
                      type="button" 
                      variant="destructive" 
                      size="icon" 
                      className="absolute top-4 right-4 rounded-xl h-10 w-10 shadow-xl"
                      onClick={() => setImageUrl("")}
                    >
                      <X className="size-5" />
                    </Button>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-3 text-slate-400">
                    {uploading ? <Loader2 className="animate-spin size-10" /> : <Camera className="size-12" />}
                    <p className="text-xs font-black uppercase tracking-widest">{uploading ? 'Processing Storage...' : 'Upload Floor Photo'}</p>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      className="mt-3 rounded-2xl font-black text-[10px] uppercase border-2 h-10 px-6"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      Select File
                    </Button>
                  </div>
                )}
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label htmlFor="line-name" className="font-black text-[11px] uppercase tracking-widest text-slate-400 pl-1">Line Name</Label>
                <Input 
                  id="line-name" 
                  placeholder="e.g. Line 06" 
                  className="h-14 rounded-2xl border-2 font-bold text-lg focus-visible:ring-primary/20"
                  value={lineName}
                  onChange={(e) => setLineName(e.target.value)}
                  required 
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="supervisor" className="font-black text-[11px] uppercase tracking-widest text-slate-400 pl-1">Lead Supervisor</Label>
                <Input 
                  id="supervisor" 
                  placeholder="Full name" 
                  className="h-14 rounded-2xl border-2 font-bold text-lg focus-visible:ring-primary/20"
                  value={supervisor}
                  onChange={(e) => setSupervisor(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="desc" className="font-black text-[11px] uppercase tracking-widest text-slate-400 pl-1">Zone Responsibilities</Label>
              <Textarea 
                id="desc" 
                placeholder="Describe machine types or processes in this zone..." 
                className="rounded-2xl border-2 min-h-[140px] text-base font-medium p-5 focus-visible:ring-primary/20"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex gap-4 justify-end border-t bg-slate-50 p-10">
            <Button type="button" variant="outline" onClick={() => router.back()} className="h-14 px-10 rounded-2xl font-bold border-2">Cancel</Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || uploading} 
              className="bg-primary hover:bg-primary/95 h-14 min-w-[200px] font-black text-lg rounded-2xl shadow-xl shadow-primary/20"
            >
              {isSubmitting ? <Loader2 className="mr-3 animate-spin" /> : <Save className="mr-3 h-5 w-5" />}
              Save Changes
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
