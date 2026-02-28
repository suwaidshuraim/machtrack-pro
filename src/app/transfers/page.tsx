
"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
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
import { 
  Repeat, 
  Plus, 
  Search, 
  Calendar as CalendarIcon, 
  Loader2, 
  ArrowLeft,
  Filter,
  X,
  ChevronDown
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query, orderBy } from "firebase/firestore"
import { Transfer, Machine, Line } from "@/lib/types"
import { cn } from "@/lib/utils"
import { 
  format, 
  isWithinInterval, 
  startOfDay, 
  endOfDay, 
  subDays, 
  startOfWeek, 
  startOfMonth, 
  endOfMonth, 
  subMonths 
} from "date-fns"

export default function TransfersPage() {
  const router = useRouter()
  const firestore = useFirestore()
  
  // Filter States
  const [search, setSearch] = useState("")
  const [machineFilter, setMachineFilter] = useState("all")
  const [lineFilter, setLineFilter] = useState("all")
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })
  const [quickFilter, setQuickFilter] = useState<string | null>(null)

  // Data Fetching
  const transfersQuery = useMemoFirebase(() => {
    if (!firestore) return null
    return query(collection(firestore, "transfers"), orderBy("transferDate", "desc"))
  }, [firestore])
  const { data: transfers, isLoading: loading } = useCollection<Transfer>(transfersQuery)

  const machinesQuery = useMemoFirebase(() => {
    if (!firestore) return null
    return collection(firestore, "machines")
  }, [firestore])
  const { data: machines } = useCollection<Machine>(machinesQuery)

  const linesQuery = useMemoFirebase(() => {
    if (!firestore) return null
    return collection(firestore, "lines")
  }, [firestore])
  const { data: lines } = useCollection<Line>(linesQuery)

  // Quick Filter Logic
  const handleQuickFilter = (type: string) => {
    const now = new Date()
    let from: Date = startOfDay(now)
    let to: Date = endOfDay(now)

    switch (type) {
      case 'today':
        from = startOfDay(now)
        to = endOfDay(now)
        break
      case 'yesterday':
        from = startOfDay(subDays(now, 1))
        to = endOfDay(subDays(now, 1))
        break
      case 'week':
        from = startOfWeek(now)
        to = endOfDay(now)
        break
      case 'month':
        from = startOfMonth(now)
        to = endOfDay(now)
        break
      case 'lastMonth':
        const lastMonth = subMonths(now, 1)
        from = startOfMonth(lastMonth)
        to = endOfMonth(lastMonth)
        break
    }
    setDateRange({ from, to })
    setQuickFilter(type)
  }

  const resetFilters = () => {
    setSearch("")
    setMachineFilter("all")
    setLineFilter("all")
    setDateRange({ from: undefined, to: undefined })
    setQuickFilter(null)
  }

  // Master Filter Logic
  const filteredTransfers = useMemo(() => {
    if (!transfers) return []
    
    return transfers.filter(t => {
      const tDate = new Date(t.transferDate)
      
      // Text Search
      const s = search.toLowerCase().trim()
      const matchesSearch = !s || 
        t.machineName?.toLowerCase().includes(s) || 
        t.fromLocation.toLowerCase().includes(s) ||
        t.toLocation.toLowerCase().includes(s) ||
        t.requestedBy.toLowerCase().includes(s)

      // Machine Filter
      const matchesMachine = machineFilter === "all" || t.machineId === machineFilter || t.machineName === machineFilter

      // Line Filter (checks source or destination)
      const matchesLine = lineFilter === "all" || t.fromLocation === lineFilter || t.toLocation === lineFilter

      // Date Filter
      let matchesDate = true
      if (dateRange.from && dateRange.to) {
        matchesDate = isWithinInterval(tDate, { 
          start: startOfDay(dateRange.from), 
          end: endOfDay(dateRange.to) 
        })
      } else if (dateRange.from) {
        matchesDate = tDate >= startOfDay(dateRange.from)
      }

      return matchesSearch && matchesMachine && matchesLine && matchesDate
    })
  }, [transfers, search, machineFilter, lineFilter, dateRange])

  const hasActiveFilters = search !== "" || machineFilter !== "all" || lineFilter !== "all" || dateRange.from !== undefined

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()} className="rounded-full shadow-sm bg-white">
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h2 className="text-3xl font-black tracking-tight text-slate-900">Transfer History</h2>
            <p className="text-muted-foreground font-medium">Audit logs for equipment movement across zones.</p>
          </div>
        </div>
        <Button className="bg-accent hover:bg-accent/90 text-white font-black rounded-xl h-12 px-6 shadow-lg shadow-accent/20" asChild>
          <Link href="/transfer/scan">
            <Plus className="mr-2 size-5" />
            Transfer Machine
          </Link>
        </Button>
      </div>

      {/* Quick Date Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-2 shrink-0">Quick range:</span>
        {[
          { label: 'Today', id: 'today' },
          { label: 'Yesterday', id: 'yesterday' },
          { label: 'This Week', id: 'week' },
          { label: 'This Month', id: 'month' },
          { label: 'Last Month', id: 'lastMonth' },
        ].map((f) => (
          <Button
            key={f.id}
            variant={quickFilter === f.id ? "default" : "outline"}
            size="sm"
            onClick={() => handleQuickFilter(f.id)}
            className={cn(
              "rounded-full px-5 font-bold h-9 border-2 transition-all shrink-0",
              quickFilter === f.id ? "bg-primary border-primary shadow-md" : "bg-white border-slate-100 text-slate-600 hover:border-primary/30"
            )}
          >
            {f.label}
          </Button>
        ))}
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={resetFilters}
            className="text-red-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-50 ml-auto shrink-0"
          >
            <X className="size-3 mr-1" /> Clear All
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Advanced Filters Sidebar (Hidden on Mobile, or top on mobile) */}
        <Card className="lg:col-span-1 border-none shadow-xl rounded-3xl bg-white h-fit">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <Filter className="size-4 text-primary" /> Advanced Search
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Global Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <Input 
                  placeholder="ID, Name, User..." 
                  className="pl-9 h-11 bg-slate-50 border-none rounded-xl font-bold text-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Machine Unit</label>
              <Select value={machineFilter} onValueChange={setMachineFilter}>
                <SelectTrigger className="h-11 border-2 rounded-xl font-bold bg-white">
                  <SelectValue placeholder="All Machines" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Units</SelectItem>
                  {machines?.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.type} ({m.id})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Production Line</label>
              <Select value={lineFilter} onValueChange={setLineFilter}>
                <SelectTrigger className="h-11 border-2 rounded-xl font-bold bg-white">
                  <SelectValue placeholder="All Lines" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="Machine Bank">Machine Bank</SelectItem>
                  {lines?.map(l => (
                    <SelectItem key={l.id} value={l.name}>{l.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Date Range</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-bold h-11 border-2 rounded-xl",
                      !dateRange.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd")} - {format(dateRange.to, "LLL dd")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-2xl border-none shadow-2xl" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange.from}
                    selected={{ from: dateRange.from, to: dateRange.to }}
                    onSelect={(range) => {
                      setDateRange({ from: range?.from, to: range?.to })
                      setQuickFilter(null)
                    }}
                    numberOfMonths={1}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card className="lg:col-span-3 border-none shadow-xl rounded-3xl overflow-hidden bg-white">
          <CardHeader className="bg-slate-50/50 border-b py-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-black text-slate-900">Transfer Logs</CardTitle>
                <CardDescription className="text-slate-500 font-medium">
                  {filteredTransfers.length} records matching current filters
                </CardDescription>
              </div>
              <Badge variant="outline" className="bg-white border-2 font-black text-[10px] uppercase tracking-widest py-1 px-3">
                Live Audit Stream
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex h-96 items-center justify-center">
                <Loader2 className="size-10 animate-spin text-primary" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50/80">
                    <TableRow className="hover:bg-transparent border-slate-100">
                      <TableHead className="font-black text-[10px] uppercase tracking-widest py-5 pl-8">Machine Unit</TableHead>
                      <TableHead className="font-black text-[10px] uppercase tracking-widest">Movement Route</TableHead>
                      <TableHead className="font-black text-[10px] uppercase tracking-widest">Audit Date</TableHead>
                      <TableHead className="font-black text-[10px] uppercase tracking-widest">Operator</TableHead>
                      <TableHead className="font-black text-[10px] uppercase tracking-widest pr-8 text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransfers.map((t) => (
                      <TableRow key={t.id} className="hover:bg-blue-50/30 transition-colors border-slate-50 group">
                        <TableCell className="py-5 pl-8">
                          <div className="flex flex-col">
                            <span className="font-black text-slate-800 text-sm">{t.machineName}</span>
                            <span className="text-[10px] font-mono font-black text-primary uppercase tracking-tighter">{t.machineId}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col">
                              <span className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">From</span>
                              <span className="text-xs font-bold text-slate-600">{t.fromLocation}</span>
                            </div>
                            <Repeat className="size-3 text-accent animate-pulse" />
                            <div className="flex flex-col">
                              <span className="text-[10px] font-black text-primary uppercase leading-none mb-1">To</span>
                              <span className="text-xs font-black text-slate-900">{t.toLocation}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                            <CalendarIcon className="size-3 text-slate-300" />
                            {format(new Date(t.transferDate), "MMM dd, yyyy")}
                            <span className="text-[10px] font-medium opacity-50">{format(new Date(t.transferDate), "HH:mm")}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-xs font-black text-slate-700">{t.requestedBy}</span>
                            {t.authorizedBy && (
                              <span className="text-[9px] font-bold text-emerald-600 uppercase">Auth: {t.authorizedBy}</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right pr-8">
                          <Badge 
                            variant={t.status === 'Completed' ? 'secondary' : 'outline'}
                            className={cn(
                              "font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-full",
                              t.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-500'
                            )}
                          >
                            {t.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredTransfers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-32">
                          <div className="flex flex-col items-center gap-4 opacity-30">
                            <Search className="size-16" />
                            <div className="space-y-1">
                              <p className="font-black text-xl uppercase tracking-widest">No Logs Found</p>
                              <p className="text-sm font-bold">Try adjusting your range or unit filters.</p>
                            </div>
                            <Button variant="link" onClick={resetFilters} className="font-black text-primary uppercase tracking-widest text-xs">
                              Reset All Filters
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
