
"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  Card, 
  CardContent, 
  CardHeader, 
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
  Search, 
  ChevronRight, 
  Plus, 
  Filter, 
  Box, 
  ArrowLeft,
  X,
  Settings,
  Loader2,
  MapPin
} from "lucide-react"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection } from "firebase/firestore"
import { Machine, MachineType } from "@/lib/types"
import { cn } from "@/lib/utils"

export default function MachineMasterPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [typeFilter, setTypeFilter] = useState("All")
  const [locationFilter, setLocationFilter] = useState("All")
  const router = useRouter()
  const firestore = useFirestore()

  const machinesQuery = useMemoFirebase(() => {
    if (!firestore) return null
    return collection(firestore, "machines")
  }, [firestore])
  const { data: machines, isLoading: machinesLoading } = useCollection<Machine>(machinesQuery)

  const typesQuery = useMemoFirebase(() => {
    if (!firestore) return null
    return collection(firestore, "machineTypes")
  }, [firestore])
  const { data: machineTypes } = useCollection<MachineType>(typesQuery)

  const availableLocations = useMemo(() => {
    if (!machines) return []
    return Array.from(new Set(machines.map(m => m.location)))
  }, [machines])

  const filteredMachines = useMemo(() => {
    if (!machines) return []
    return machines.filter(m => {
      const s = search.toLowerCase().trim()
      const matchesSearch = 
        !s ||
        m.id.toLowerCase().includes(s) || 
        m.type.toLowerCase().includes(s) ||
        m.serialNumber.toLowerCase().includes(s) ||
        m.location.toLowerCase().includes(s) ||
        m.status.toLowerCase().includes(s)
      
      const matchesStatus = statusFilter === "All" || m.status === statusFilter
      const matchesType = typeFilter === "All" || m.type === typeFilter
      const matchesLocation = locationFilter === "All" || m.location === locationFilter
      
      return matchesSearch && matchesStatus && matchesType && matchesLocation
    })
  }, [machines, search, statusFilter, typeFilter, locationFilter])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Running': return 'bg-emerald-500';
      case 'Idle': return 'bg-amber-500';
      case 'Bank': return 'bg-blue-500';
      case 'Breakdown': return 'bg-red-500';
      case 'Repair': return 'bg-orange-500';
      default: return 'bg-slate-400';
    }
  }

  const clearFilters = () => {
    setSearch("")
    setStatusFilter("All")
    setTypeFilter("All")
    setLocationFilter("All")
  }

  const hasActiveFilters = search !== "" || statusFilter !== "All" || typeFilter !== "All" || locationFilter !== "All"

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()} className="rounded-full shadow-sm hidden md:flex">
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">Machine Master</h2>
            <p className="text-xs md:text-sm text-muted-foreground font-medium">Registry of factory industrial assets.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground hover:text-red-500 font-bold shrink-0">
              Clear
            </Button>
          )}
          <Button variant="outline" size="sm" className="rounded-xl font-bold h-9 md:h-11 shrink-0" asChild>
            <Link href="/machines/types">
              <Settings className="mr-2 size-4" />
              Types
            </Link>
          </Button>
          <Button size="sm" className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg h-9 md:h-11 px-4 md:px-6 font-bold shrink-0" asChild>
            <Link href="/machines/new">
              <Plus className="mr-2 size-4" />
              Register
            </Link>
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-xl overflow-hidden rounded-3xl">
        <CardHeader className="bg-white border-b py-4 md:py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search assets..." 
                className="pl-10 h-10 md:h-11 bg-slate-50 border-none focus-visible:ring-1 focus-visible:ring-primary/20 rounded-xl"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button 
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-slate-900"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-full w-fit">
              <Box className="size-3 md:size-4 text-primary" />
              <span className="text-[10px] md:text-xs font-black text-primary">{filteredMachines.length} Assets</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {machinesLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="size-10 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow>
                      <TableHead className="font-black text-[10px] uppercase tracking-widest py-4">ID / Serial</TableHead>
                      <TableHead className="font-black text-[10px] uppercase tracking-widest">Type</TableHead>
                      <TableHead className="font-black text-[10px] uppercase tracking-widest">Location</TableHead>
                      <TableHead className="font-black text-[10px] uppercase tracking-widest">Status</TableHead>
                      <TableHead className="text-right pr-6 font-black text-[10px] uppercase tracking-widest">Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMachines.map((machine) => (
                      <TableRow key={machine.id} className="hover:bg-blue-50/30 transition-colors">
                        <TableCell className="py-4">
                          <div className="flex flex-col">
                            <span className="font-black text-xs text-primary tracking-tighter">{machine.id}</span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase">{machine.serialNumber}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-bold text-sm">{machine.type}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 font-black text-[9px] uppercase">
                            {machine.location}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={cn("size-2 rounded-full", getStatusColor(machine.status))} />
                            <span className="text-xs font-bold text-slate-600">{machine.status}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <Button variant="ghost" size="icon" className="hover:bg-primary hover:text-white rounded-xl" asChild>
                            <Link href={`/machines/${machine.id}`}>
                              <ChevronRight className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-slate-100">
                {filteredMachines.map((machine) => (
                  <Link key={machine.id} href={`/machines/${machine.id}`} className="block p-4 active:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex flex-col">
                        <span className="font-black text-sm text-primary">{machine.id}</span>
                        <span className="text-[10px] font-bold text-slate-400">{machine.type}</span>
                      </div>
                      <Badge className={cn("text-white text-[9px] font-black uppercase", getStatusColor(machine.status))}>
                        {machine.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <MapPin className="size-3" />
                      <span className="text-[10px] font-bold uppercase tracking-wide">{machine.location}</span>
                    </div>
                  </Link>
                ))}
              </div>

              {filteredMachines.length === 0 && (
                <div className="h-64 flex flex-col items-center justify-center gap-2 opacity-40">
                  <Search className="size-12 mb-2" />
                  <p className="font-black text-lg uppercase tracking-widest">No assets found</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
