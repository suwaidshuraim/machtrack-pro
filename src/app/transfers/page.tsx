
"use client"

import { useState, useMemo, useEffect } from "react"
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
  History as HistoryIcon,
  ArrowRight
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
  
  // Initialize to undefined to avoid hydration mismatch between server and client time
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })
  const [quickFilter, setQuickFilter] = useState<string | null>(null)

  // Set initial "Today" filter on mount
  useEffect(() => {
    const now = new Date()
    setDateRange({
      from: startOfDay(now),
      to: endOfDay(now),
    })
    setQuickFilter("today")
  }, [])

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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & New Transfer Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()} className="rounded-full shadow-sm bg-white border-2">
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">Transfer History</h2>
            <p className="text-xs md:text-sm text-muted-foreground font-medium">Audit logs for equipment movement.</p>
          </div>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-white font-black rounded-2xl h-11 px-6 shadow-xl shadow-primary/20" asChild>
          <Link href="/transfer/scan">
            <Plus className="mr-2 size-5" />
            Transfer Machine
          </Link>
        </Button>
      </div>

      {/* Summary Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-1 border-none shadow-xl bg-primary text-white rounded-3xl overflow-hidden relative group">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Total Transfers</p>
              <h3 className="text-4xl font-black tracking-tighter">{filteredTransfers.length}</h3>
              <p className="text-[10px] font-bold opacity-60">Filtered results</p>
            </div>
            <div className="p-4 bg-white/10 rounded-2xl group-hover:scale-110 transition-transform">
              <HistoryIcon className="size-8" />
            </div>
          </CardContent>
          <div className="absolute top-0 right-0 p-2">
             <Badge className="bg-white/20 hover:bg-white/30 text-[9px] font-black border-none uppercase tracking-widest px-2">
                {quickFilter ? quickFilter : 'Custom Range'}
             </Badge>
          </div>
        </Card>
        
        {/* Quick Date Filters Integrated as a Bar */}
        <Card className="md:col-span-2 border-none shadow-xl bg-white rounded-3xl flex items-center px-6 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-2 py-4">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mr-2 whitespace-nowrap">Time Range:</span>
            {[
              { label: 'Today', id: 'today' },
              { label: 'Yesterday', id: 'yesterday' },
              { label: 'Week', id: 'week' },
              { label: 'Month', id: 'month' },
              { label: 'Last Month', id: 'lastMonth' },
            ].map((f) => (
              <Button
                key={f.id}
                variant={quickFilter === f.id ? "default" : "outline"}
                size="sm"
                onClick={() => handleQuickFilter(f.id)}
                className={cn(
                  "rounded-xl px-4 font-black h-9 border-2 transition-all whitespace-nowrap",
                  quickFilter === f.id ? "bg-primary border-primary shadow-lg shadow-primary/20" : "bg-white border-slate-100 text-slate-500 hover:border-primary/20"
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
                className="text-red-500 font-black text-[9px] uppercase tracking-widest hover:bg-red-50 px-3 h-9"
              >
                <X className="size-3 mr-1" /> Reset
              </Button>
            )}
          </div>
        </Card>
      </div>

      {/* Compact Advanced Search Bar */}
      <Card className="border-none shadow-lg rounded-3xl bg-white overflow-hidden border-t-4 border-t-primary/10">
        <CardContent className="p-4 md:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 pl-1 flex items-center gap-1">
                <Search className="size-2.5" /> Search Keyword
              </label>
              <Input 
                placeholder="Unit ID, name or operator..." 
                className="h-10 bg-slate-50/50 border-2 border-slate-100 rounded-xl font-bold text-xs focus-visible:ring-primary/10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 pl-1">Machine Unit</label>
              <Select value={machineFilter} onValueChange={setMachineFilter}>
                <SelectTrigger className="h-10 border-2 border-slate-100 rounded-xl font-bold bg-slate-50/50 text-xs">
                  <SelectValue placeholder="All Machines" />
                </SelectTrigger>
                <SelectContent className="rounded-xl font-bold text-xs">
                  <SelectItem value="all">All Units</SelectItem>
                  {machines?.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.type} ({m.id})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 pl-1">Production Line</label>
              <Select value={lineFilter} onValueChange={setLineFilter}>
                <SelectTrigger className="h-10 border-2 border-slate-100 rounded-xl font-bold bg-slate-50/50 text-xs">
                  <SelectValue placeholder="All Lines" />
                </SelectTrigger>
                <SelectContent className="rounded-xl font-bold text-xs">
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="Machine Bank">Machine Bank</SelectItem>
                  {lines?.map(l => (
                    <SelectItem key={l.id} value={l.name}>{l.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 pl-1">Custom Range</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-bold h-10 border-2 border-slate-100 rounded-xl bg-slate-50/50 text-xs",
                      !dateRange.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "MMM dd")} - {format(dateRange.to, "MMM dd")}
                        </>
                      ) : (
                        format(dateRange.from, "MMM dd, y")
                      )
                    ) : (
                      <span>Pick dates</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-2xl border-none shadow-2xl" align="end">
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
          </div>
        </CardContent>
      </Card>

      {/* Main Table Container */}
      <Card className="border-none shadow-2xl rounded-[32px] overflow-hidden bg-white">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex h-96 items-center justify-center">
              <Loader2 className="size-10 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="hover:bg-transparent border-slate-100">
                    <TableHead className="font-black text-[10px] uppercase tracking-[0.2em] py-5 pl-8 text-slate-400">Machine Unit</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Movement Route</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Audit Date</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Operator</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-[0.2em] pr-8 text-right text-slate-400">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransfers.map((t) => (
                    <TableRow key={t.id} className="hover:bg-primary/[0.02] transition-colors border-slate-50 group">
                      <TableCell className="py-5 pl-8">
                        <div className="flex flex-col">
                          <span className="font-black text-slate-900 text-sm">{t.machineName}</span>
                          <span className="text-[10px] font-mono font-black text-primary uppercase tracking-tighter">{t.machineId}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col">
                            <span className="text-[9px] font-black text-slate-300 uppercase leading-none mb-0.5">Origin</span>
                            <span className="text-[11px] font-bold text-slate-600">{t.fromLocation}</span>
                          </div>
                          <ArrowRight className="size-3 text-slate-200 group-hover:text-primary transition-colors" />
                          <div className="flex flex-col">
                            <span className="text-[9px] font-black text-primary/40 uppercase leading-none mb-0.5">Dest</span>
                            <span className="text-[11px] font-black text-slate-900">{t.toLocation}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-0.5 text-xs font-bold text-slate-500">
                          <span>{t.transferDate ? format(new Date(t.transferDate), "MMM dd, yyyy") : 'N/A'}</span>
                          <span className="text-[10px] font-medium opacity-40">{t.transferDate ? format(new Date(t.transferDate), "HH:mm") : ''}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-slate-700">{t.requestedBy}</span>
                          {t.authorizedBy && (
                            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-tighter">Verified by {t.authorizedBy}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-8">
                        <Badge 
                          className={cn(
                            "font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-full border-2",
                            t.status === 'Completed' 
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100' 
                              : 'bg-slate-50 text-slate-400 border-slate-100'
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
                        <div className="flex flex-col items-center gap-4 opacity-20">
                          <HistoryIcon className="size-16" />
                          <div className="space-y-1">
                            <p className="font-black text-xl uppercase tracking-widest">No Activity Logged</p>
                            <p className="text-sm font-bold">Adjust your filters to see historical data.</p>
                          </div>
                          <Button variant="link" onClick={resetFilters} className="font-black text-primary uppercase tracking-widest text-[10px]">
                            Clear All Parameters
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
  )
}
