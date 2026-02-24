"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, Loader2, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AddMachinePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Auto-generated fields
  const [assetId, setAssetId] = useState("")
  const [serial, setSerial] = useState("")

  useEffect(() => {
    // Simulate auto-generation on mount
    const generatedId = `MAC-${Math.floor(1000 + Math.random() * 9000)}`
    const generatedSerial = `SN-${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Math.floor(100 + Math.random() * 899)}`
    setAssetId(generatedId)
    setSerial(generatedSerial)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      toast({
        title: "Success",
        description: `Asset ${assetId} has been registered successfully.`,
      })
      router.push('/machines')
    }, 1500)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Register New Machine</h2>
          <p className="text-muted-foreground">Add a new industrial asset to the company registry.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle>Asset Information</CardTitle>
            <CardDescription>ID and Serial Number are automatically assigned.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="asset-id" className="text-muted-foreground">Asset ID (Auto)</Label>
                <div className="relative">
                  <Input id="asset-id" value={assetId} readOnly className="bg-slate-50 font-mono text-blue-600 font-bold" />
                  <Sparkles className="absolute right-3 top-1/2 -translate-y-1/2 size-3 text-blue-400" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="serial" className="text-muted-foreground">Serial Number (Auto)</Label>
                <div className="relative">
                  <Input id="serial" value={serial} readOnly className="bg-slate-50 font-mono" />
                  <Sparkles className="absolute right-3 top-1/2 -translate-y-1/2 size-3 text-slate-400" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Machine Type</Label>
                <Select required>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Flat Bed">Flat Bed</SelectItem>
                    <SelectItem value="Cylinder">Cylinder Bed</SelectItem>
                    <SelectItem value="High Post">High Post</SelectItem>
                    <SelectItem value="AMS">AMS Automated</SelectItem>
                    <SelectItem value="Overlock">Overlock</SelectItem>
                    <SelectItem value="Embossing">Embossing</SelectItem>
                    <SelectItem value="Pressing">Pressing</SelectItem>
                    <SelectItem value="Others">Others</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Initial Location</Label>
                <Select required>
                  <SelectTrigger id="location">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Line 1">Line 1</SelectItem>
                    <SelectItem value="Line 2">Line 2</SelectItem>
                    <SelectItem value="Line 3">Line 3</SelectItem>
                    <SelectItem value="Line 4">Line 4</SelectItem>
                    <SelectItem value="Line 5">Line 5</SelectItem>
                    <SelectItem value="Machine Bank">Machine Bank</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Initial Status</Label>
              <Select defaultValue="Running">
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Running">Running</SelectItem>
                  <SelectItem value="Idle">Idle</SelectItem>
                  <SelectItem value="Bank">Bank</SelectItem>
                  <SelectItem value="Breakdown">Breakdown</SelectItem>
                  <SelectItem value="Repair">Repair</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="history">Usage/History Notes</Label>
              <Textarea id="history" placeholder="Describe the machine's intended use or background..." />
            </div>
          </CardContent>
          <CardFooter className="flex gap-3 justify-end border-t p-6">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Asset
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
