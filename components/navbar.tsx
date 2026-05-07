"use client"

import type React from "react"

import { Search, Tv, Dices } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type NavbarProps = {
  onSearch: (id: number) => void
  isSearching: boolean
}

export function Navbar({ onSearch, isSearching }: NavbarProps) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const idValue = formData.get("character-id")
    const id = Number(idValue)
    if (Number.isFinite(id) && id > 0) {
      onSearch(id)
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/40">
            <Tv className="h-5 w-5 text-primary" aria-hidden="true" />
          </div>
          <div className="flex flex-col leading-tight">
            <h1 className="text-balance font-sans text-lg font-bold tracking-tight text-foreground sm:text-xl">
              Rick & Morty <span className="text-primary text-glow">Explorer</span>
            </h1>
            <p className="text-xs text-muted-foreground">Multiverse data + Gemini AI</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <form onSubmit={handleSubmit} suppressHydrationWarning className="flex items-center gap-2" role="search" aria-label="Buscar personaje">
            <label htmlFor="character-id" className="sr-only">
              ID del personaje
            </label>
            <Input
              id="character-id"
              name="character-id"
              type="number"
              min={1}
              inputMode="numeric"
              placeholder="ID (1-826)"
              className="w-24 border-border bg-input text-foreground placeholder:text-muted-foreground focus-visible:ring-primary sm:w-32"
              disabled={isSearching}
            />
            <Button
              type="submit"
              disabled={isSearching}
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 glow-primary"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              <span className="hidden lg:inline">Consultar</span>
              <span className="lg:hidden">Ir</span>
            </Button>
          </form>

          <Button
            type="button"
            variant="outline"
            disabled={isSearching}
            onClick={() => onSearch(Math.floor(Math.random() * 826) + 1)}
            className="border-primary/40 text-primary hover:bg-primary/10 hover:text-primary-foreground"
            title="Personaje aleatorio"
          >
            <Dices className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </header>
  )
}
