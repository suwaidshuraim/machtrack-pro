
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Repeat, Plus, Search, Calendar, Loader2, ArrowLeft } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query, orderBy } from "firebase/firestore"
import { Transfer } from "@/lib/types"

export default function TransfersPage() {
  const [search, setSearch] = useState("")
  const router = useRouter()
  const firestore = useFirestore()

  const transfersQuery = useMemoFirebase(() => {
    if (!firestore) return null
    return query(collection(firestore, "transfers"), orderBy("transferDate", "desc"))
  }, [firestore])

  const { data: transfers, isLoading: loading } = useCollection<Transfer>(transfersQuery)

  const filteredTransfers = transfers?.filter(t => 
    t.machineName?.toLowerCase().includes(search.toLowerCase()) || 
    t.fromLocation.toLowerCase().includes(search.toLowerCase()) ||
    t.toLocation.toLowerCase().includes(search.toLowerCase())
  ) || []

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()} className="rounded-full shadow-sm">
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Machine Transfers</h2>
            <p className="text-muted-foreground">Initiate and track the relocation of manufacturing equipment.</p>
          </div>
        </div>
        <Button className="bg-accent hover:bg-accent/90 text-white" asChild>
          <Link href="/transfer/scan">
            <Plus className="mr-2 size-4" />
            Request Transfer
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-none shadow-md rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Transfers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transfers?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-xl font-black">Transfer Logs</CardTitle>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search logs..." 
                className="pl-10 h-11 bg-slate-50 border-none rounded-xl"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="size-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest">Machine</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest">Route</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest">Date</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest">Requested By</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransfers.map((t) => (
                  <TableRow key={t.id} className="hover:bg-slate-50">
                    <TableCell className="font-bold text-sm text-slate-800">{t.machineName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm font-bold">
                        <span className="text-muted-foreground">{t.fromLocation}</span>
                        <Repeat className="size-3 text-accent" />
                        <span className="text-primary">{t.toLocation}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-xs font-bold text-slate-500">
                        <Calendar className="size-3" />
                        {new Date(t.transferDate).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-bold text-slate-600">{t.requestedBy}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={t.status === 'Completed' ? 'secondary' : 'outline'}
                        className={cn("font-black text-[10px] uppercase tracking-widest", t.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : '')}
                      >
                        {t.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredTransfers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-slate-400 italic font-medium">No transfer logs found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
