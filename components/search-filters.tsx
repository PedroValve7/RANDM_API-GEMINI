"use client"

import { useState, useRef } from "react"
import { Search, X, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type Filters = {
  name: string
  status: string
  species: string
  gender: string
}

type SearchFiltersProps = {
  onFiltersChange: (filters: Filters) => void
  isSearching: boolean
}

const STATUS_OPTIONS = ["", "Alive", "Dead", "unknown"]
const SPECIES_OPTIONS = ["", "Human", "Alien", "Humanoid", "Poopybutthole", "Mythological Creature", "Robot", "Animal", "Cronenberg", "Disease", "Unknown"]
const GENDER_OPTIONS = ["", "Male", "Female", "Genderless", "unknown"]

export function SearchFilters({ onFiltersChange, isSearching }: SearchFiltersProps) {
  const [filters, setFilters] = useState<Filters>({
    name: "",
    status: "",
    species: "",
    gender: "",
  })
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  function handleChange(key: keyof Filters, value: string) {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)

    if (key === "name") {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
      debounceTimer.current = setTimeout(() => {
        onFiltersChange(newFilters)
      }, 400)
    } else {
      onFiltersChange(newFilters)
    }
  }

  function handleClear() {
    const empty = { name: "", status: "", species: "", gender: "" }
    setFilters(empty)
    onFiltersChange(empty)
  }

  const hasActiveFilters = filters.name || filters.status || filters.species || filters.gender

  return (
    <div className="mb-6 space-y-3 rounded-xl border border-border bg-card/60 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Filter className="h-4 w-4 text-primary" aria-hidden="true" />
        Filtrar personajes
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            type="text"
            placeholder="Buscar por nombre..."
            value={filters.name}
            onChange={(e) => handleChange("name", e.target.value)}
            disabled={isSearching}
            className="pl-9 border-border bg-input text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
          />
        </div>

        <select
          value={filters.status}
          onChange={(e) => handleChange("status", e.target.value)}
          disabled={isSearching}
          className="h-9 rounded-md border border-border bg-input px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Status: Todos</option>
          {STATUS_OPTIONS.filter(Boolean).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select
          value={filters.species}
          onChange={(e) => handleChange("species", e.target.value)}
          disabled={isSearching}
          className="h-9 rounded-md border border-border bg-input px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Especie: Todas</option>
          {SPECIES_OPTIONS.filter(Boolean).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select
          value={filters.gender}
          onChange={(e) => handleChange("gender", e.target.value)}
          disabled={isSearching}
          className="h-9 rounded-md border border-border bg-input px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Género: Todos</option>
          {GENDER_OPTIONS.filter(Boolean).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {hasActiveFilters && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleClear}
          className="gap-2 border-primary/40 text-primary hover:bg-primary/10"
        >
          <X className="h-3 w-3" aria-hidden="true" />
          Limpiar filtros
        </Button>
      )}
    </div>
  )
}
