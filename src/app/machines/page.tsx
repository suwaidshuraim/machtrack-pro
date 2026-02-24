
"use client"

import { useState } from "react"
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
  Settings2,
  Settings
} from "lucide-react"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MACHINES, MACHINE_TYPES } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

export default function MachineMasterPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [typeFilter, setTypeFilter] = useState("All")
  const [locationFilter, setLocationFilter] = useState("All")
  const router = useRouter()

  // Get unique locations for the filter
  const availableLocations = Array.from(new Set(MACHINES.map(m => m.location)))

  const filteredMachines = MACHINES.filter(m => {
    const s = search.toLowerCase()
    const matchesSearch = 
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
          <Button variant="outline" size="icon" onClick={() => router.back()} className="rounded-full">
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Machine Master</h2>
            <p className="text-muted-foreground">Full registry of industrial assets and their current assignments.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground hover:text-red-500 font-bold">
              Clear All
            </Button>
          )}
          
          <Button variant="outline" className="rounded-xl" asChild>
            <Link href="/machines/types">
              <Settings className="mr-2 size-4" />
              Configure Types
            </Link>
          </Button>

          <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md" asChild>
            <Link href="/machines/new">
              <Plus className="mr-2 size-4" />
              Add New Machine
            </Link>
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-lg overflow-hidden">
        <CardHeader className="bg-white border-b py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search ID, Type, Serial, Location, or Status..." 
                className="pl-10 h-11 bg-slate-50 border-none focus-visible:ring-1 focus-visible:ring-blue-200"
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
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg">
                <Box className="size-4 text-slate-500" />
                <span className="text-sm font-bold text-slate-700">{filteredMachines.length} Results</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="font-bold py-4">
                  <div className="flex items-center gap-2">
                    ID / Serial
                  </div>
                </TableHead>
                <TableHead className="font-bold">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-2 hover:text-blue-600 transition-colors">
                      Machine Type <Filter className="size-3" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuRadioGroup value={typeFilter} onValueChange={setTypeFilter}>
                        <DropdownMenuRadioItem value="All">All Types</DropdownMenuRadioItem>
                        {MACHINE_TYPES.map(type => (
                          <DropdownMenuRadioItem key={type} value={type}>{type}</DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableHead>
                <TableHead className="font-bold">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-2 hover:text-blue-600 transition-colors">
                      Location <Filter className="size-3" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuRadioGroup value={locationFilter} onValueChange={setLocationFilter}>
                        <DropdownMenuRadioItem value="All">All Locations</DropdownMenuRadioItem>
                        {availableLocations.map(loc => (
                          <DropdownMenuRadioItem key={loc} value={loc}>{loc}</DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableHead>
                <TableHead className="font-bold">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-2 hover:text-blue-600 transition-colors">
                      Status <Filter className="size-3" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuRadioGroup value={statusFilter} onValueChange={setStatusFilter}>
                        <DropdownMenuRadioItem value="All">All Statuses</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="Running">Running</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="Idle">Idle</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="Bank">Bank</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="Breakdown">Breakdown</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="Repair">Repair</DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableHead>
                <TableHead className="text-right pr-6 font-bold">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMachines.map((machine) => (
                <TableRow key={machine.id} className="hover:bg-slate-50/80 transition-colors">
                  <TableCell className="py-4">
                    <div className="flex flex-col">
                      <span className="font-mono text-xs font-bold text-blue-600">{machine.id}</span>
                      <span className="text-[10px] text-muted-foreground">{machine.serialNumber}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-sm text-slate-800">{machine.type}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 font-bold">
                      {machine.location}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={cn("size-2 rounded-full", getStatusColor(machine.status))} />
                      <span className="text-sm font-medium">{machine.status}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Button variant="ghost" size="icon" className="hover:bg-blue-50 text-blue-600" asChild>
                      <Link href={`/machines/${machine.id}`}>
                        <ChevronRight className="h-5 w-5" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredMachines.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    No machines found matching your search or filter criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
