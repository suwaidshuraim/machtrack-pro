"use client"

import { DashboardStats } from "@/components/dashboard-stats"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { MACHINES, TRANSFERS } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"
import { ArrowRightLeft, History } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

const MACHINE_TYPE_METADATA: Record<string, { image: string, hint: string }> = {
  'Flat Bed': { image: 'https://picsum.photos/seed/flatbed/400/300', hint: 'sewing machine' },
  'Cylinder Bed': { image: 'https://picsum.photos/seed/cylinder/400/300', hint: 'heavy machine' },
  'AMS': { image: 'https://picsum.photos/seed/ams/400/300', hint: 'automated machine' },
  'Embossing': { image: 'https://picsum.photos/seed/emboss/400/300', hint: 'emboss machine' },
  'Pressing': { image: 'https://picsum.photos/seed/press/400/300', hint: 'press machine' },
}

export default function DashboardPage() {
  // Machine Type Counts
  const typeCounts = MACHINES.reduce((acc, machine) => {
    acc[machine.type] = (acc[machine.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const typeData = Object.entries(typeCounts).map(([name, value]) => ({ 
    name, 
    value,
    ...MACHINE_TYPE_METADATA[name] || { image: 'https://picsum.photos/seed/generic/400/300', hint: 'industrial machine' }
  }))

  // Recent Activity
  const recentTransfers = [...TRANSFERS].sort((a, b) => 
    new Date(b.transferDate).getTime() - new Date(a.transferDate).getTime()
  ).slice(0, 5)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Factory Overview</h2>
          <p className="text-muted-foreground">Real-time status and distribution of all factory assets.</p>
        </div>
      </div>

      <DashboardStats />

      <div>
        <h3 className="text-xl font-bold mb-4">Machine Fleet by Type</h3>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {typeData.map((type) => (
            <Card key={type.name} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative h-32 w-full">
                <Image 
                  src={type.image} 
                  alt={type.name} 
                  fill 
                  className="object-cover" 
                  data-ai-hint={type.hint}
                />
              </div>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-base">{type.name}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{type.value}</span>
                  <Badge variant="outline">Units</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Movement History</CardTitle>
                <CardDescription>Latest location transfers across the facility.</CardDescription>
              </div>
              <History className="size-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransfers.map((transfer) => (
                <div key={transfer.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-sm">{transfer.machineName}</span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{transfer.fromLocation}</span>
                      <ArrowRightLeft className="size-3" />
                      <span className="text-accent font-medium">{transfer.toLocation}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-[10px]">{transfer.transferDate}</Badge>
                  </div>
                </div>
              ))}
              {recentTransfers.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No recent transfers recorded.</p>
              )}
            </div>
            <div className="mt-6">
               <Link href="/machines" className="text-sm text-primary hover:underline font-medium">
                  View full machine history →
               </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-primary text-primary-foreground flex flex-col justify-center p-8">
          <h3 className="text-2xl font-bold mb-2">Need to move an asset?</h3>
          <p className="text-primary-foreground/80 mb-6">Use the mobile scanner to relocate machines instantly between production lines and the bank.</p>
          <Button variant="secondary" asChild className="w-fit">
            <Link href="/transfer/scan">Open Scan & Transfer</Link>
          </Button>
        </Card>
      </div>
    </div>
  )
}
