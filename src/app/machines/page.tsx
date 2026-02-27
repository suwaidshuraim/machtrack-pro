
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
  Loader2
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
      case 'Running': return 'bg-green-500';
      case 'Idle': return 'bg-yellow-500';
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
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()} className="rounded-full shadow-sm">
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h2 className="text-3xl font-black tracking-tight text-slate-900">Machine Master</h2>
            <p className="text-muted-foreground font-medium">Full registry of industrial assets and their assignments.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground hover:text-red-500 font-bold">
              Clear All
            </Button>
          )}
          <Button variant="outline" className="rounded-xl font-bold h-11" asChild>
            <Link href="/machines/types">
              <Settings className="mr-2 size-4" />
              Configure Types
            </Link>
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg h-11 px-6 font-bold" asChild>
            <Link href="/machines/new">
              <Plus className="mr-2 size-4" />
              Register Asset
            </Link>
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-xl overflow-hidden rounded-3xl">
        <CardHeader className="bg-white border-b py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Quick search every column..." 
                className="pl-10 h-11 bg-slate-50 border-none focus-visible:ring-1 focus-visible:ring-blue-100 rounded-xl"
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
            <div className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 rounded-2xl">
              <Box className="size-4 text-blue-600" />
              <span className="text-sm font-black text-blue-700">{filteredMachines.length} Assets Found</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {machinesLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="size-10 animate-spin text-blue-500" />
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest py-4">ID / Serial</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="flex items-center gap-2 hover:text-blue-600 transition-colors uppercase">
                        Type <Filter className="size-3" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="rounded-xl p-2 min-w-[200px]">
                        <DropdownMenuRadioGroup value={typeFilter} onValueChange={setTypeFilter}>
                          <DropdownMenuRadioItem value="All" className="font-bold py-2">All Types</DropdownMenuRadioItem>
                          {machineTypes?.map(t => (
                            <DropdownMenuRadioItem key={t.name} value={t.name} className="font-medium py-2">{t.name}</DropdownMenuRadioItem>
                          ))}
                        </DropdownMenuRadioGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="flex items-center gap-2 hover:text-blue-600 transition-colors uppercase">
                        Location <Filter className="size-3" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="rounded-xl p-2 min-w-[200px]">
                        <DropdownMenuRadioGroup value={locationFilter} onValueChange={setLocationFilter}>
                          <DropdownMenuRadioItem value="All" className="font-bold py-2">All Locations</DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="Machine Bank" className="font-medium py-2">Machine Bank</DropdownMenuRadioItem>
                          {availableLocations.filter(l => l !== "Machine Bank").map(loc => (
                            <DropdownMenuRadioItem key={loc} value={loc} className="font-medium py-2">{loc}</DropdownMenuRadioItem>
                          ))}
                        </DropdownMenuRadioGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="flex items-center gap-2 hover:text-blue-600 transition-colors uppercase">
                        Status <Filter className="size-3" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="rounded-xl p-2 min-w-[200px]">
                        <DropdownMenuRadioGroup value={statusFilter} onValueChange={setStatusFilter}>
                          <DropdownMenuRadioItem value="All" className="font-bold py-2">All Statuses</DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="Running" className="text-green-600 font-bold py-2">Running</DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="Idle" className="text-yellow-600 font-bold py-2">Idle</DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="Bank" className="text-blue-600 font-bold py-2">Bank</DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="Breakdown" className="text-red-600 font-bold py-2">Breakdown</DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="Repair" className="text-orange-600 font-bold py-2">Repair</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableHead>
                  <TableHead className="text-right pr-6 font-black text-[10px] uppercase tracking-widest">Audit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMachines.map((machine) => (
                  <TableRow key={machine.id} className="hover:bg-blue-50/30 transition-colors">
                    <TableCell className="py-5">
                      <div className="flex flex-col">
                        <span className="font-black text-xs text-blue-600 tracking-tighter">{machine.id}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{machine.serialNumber}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-black text-sm text-slate-800">{machine.type}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 font-black text-[10px] uppercase tracking-wider py-1">
                        {machine.location}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={cn("size-2.5 rounded-full shadow-sm", getStatusColor(machine.status))} />
                        <span className="text-sm font-bold text-slate-600">{machine.status}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Button variant="ghost" size="icon" className="hover:bg-blue-600 hover:text-white rounded-xl transition-all" asChild>
                        <Link href={`/machines/${machine.id}`}>
                          <ChevronRight className="h-5 w-5" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredMachines.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-64 text-center">
                      <div className="flex flex-col items-center gap-2 opacity-40">
                        <Search className="size-12 mb-2" />
                        <p className="font-black text-lg uppercase tracking-widest">No matching assets</p>
                        <p className="text-sm font-medium">Try adjusting your filters or search term.</p>
                      </div>
                    </TableCell>
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
