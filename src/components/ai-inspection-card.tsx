
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react"
import { recommendMachineInspection, MachineInspectionOutput } from "@/ai/flows/recommend-machine-inspection"
import { Machine } from "@/lib/types"

interface AIInspectionCardProps {
  machine: Machine
}

export function AIInspectionCard({ machine }: AIInspectionCardProps) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<MachineInspectionOutput | null>(null)

  const handleRecommend = async () => {
    setLoading(true)
    try {
      const output = await recommendMachineInspection({
        machineId: machine.id,
        usageHistory: machine.usageHistory,
        lastMaintenanceDate: machine.lastMaintenanceDate,
        lastInspectionDate: machine.lastInspectionDate,
      })
      setResult(output)
    } catch (error) {
      console.error("AI Recommendation failed", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-accent/20 bg-accent/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-accent" />
            <CardTitle className="text-lg">AI Inspection Advisory</CardTitle>
          </div>
          {result?.needsInspection && (
            <Badge variant="destructive" className="animate-pulse">Required</Badge>
          )}
        </div>
        <CardDescription>
          Generative AI analysis of usage history and maintenance logs.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!result ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <p className="text-sm text-muted-foreground mb-4 max-w-[280px]">
              Analyze this machine's performance history to determine the optimal next inspection date.
            </p>
            <Button 
              onClick={handleRecommend} 
              disabled={loading}
              className="bg-accent hover:bg-accent/90 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing History...
                </>
              ) : (
                "Generate AI Report"
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="grid gap-3">
              <div className="rounded-lg bg-background p-3 border shadow-sm">
                <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Condition Summary</span>
                <p className="text-sm mt-1">{result.conditionSummary}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-background p-3 border shadow-sm">
                  <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Recommended Date</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-semibold text-accent">{result.inspectionRecommendation}</span>
                  </div>
                </div>
                <div className="rounded-lg bg-background p-3 border shadow-sm flex flex-col items-center justify-center">
                   <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Status</span>
                   {result.needsInspection ? (
                      <div className="flex items-center gap-1 text-destructive mt-1">
                        <AlertTriangle className="size-4" />
                        <span className="text-xs font-bold">Needs Attention</span>
                      </div>
                   ) : (
                      <div className="flex items-center gap-1 text-green-600 mt-1">
                        <CheckCircle2 className="size-4" />
                        <span className="text-xs font-bold">In Compliance</span>
                      </div>
                   )}
                </div>
              </div>

              <div className="rounded-lg bg-background p-3 border shadow-sm">
                <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">AI Justification</span>
                <p className="text-xs mt-1 text-muted-foreground leading-relaxed italic">"{result.justification}"</p>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setResult(null)}
              className="w-full text-xs"
            >
              Recalculate
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
