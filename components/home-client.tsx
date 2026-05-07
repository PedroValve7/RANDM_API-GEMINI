"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { AlertCircle } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { CharacterGrid } from "@/components/character-grid"
import type { Character } from "@/lib/types"

// Lazy loading del componente de detalles para no cargarlo en el bundle inicial
const CharacterDetail = dynamic(
  () => import("@/components/character-detail").then((mod) => mod.CharacterDetail),
  { ssr: false }
)

export function HomeClient({ initialCharacters }: { initialCharacters: Character[] }) {
  const [characters, setCharacters] = useState<Character[]>(initialCharacters)
  const [isSearching, setIsSearching] = useState(false)
  const [selected, setSelected] = useState<Character | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function handleSearchById(id: number) {
    setIsSearching(true)
    setErrorMessage(null)
    try {
      const res = await fetch(`https://rickandmortyapi.com/api/character/${id}`)
      if (res.status === 404) {
        setErrorMessage("Personaje no encontrado. Intenta con otro ID.")
        return
      }
      if (!res.ok) throw new Error("Error al consultar la API.")
      const character: Character = await res.json()
      setSelected(character)
      setDetailOpen(true)
    } catch (err) {
      console.log("[v0] search error:", err)
      setErrorMessage(err instanceof Error ? err.message : "Error al consultar la API.")
    } finally {
      setIsSearching(false)
    }
  }

  function handleSelectFromGrid(character: Character) {
    setSelected(character)
    setDetailOpen(true)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar onSearch={handleSearchById} isSearching={isSearching} />

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 space-y-2">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
            // multiverse-explorer
          </p>
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Explora el multiverso de <span className="text-primary text-glow">Rick and Morty</span>
          </h2>
          <p className="max-w-2xl text-pretty text-sm text-muted-foreground sm:text-base">
            Navega la galería de personajes, busca por ID y genera resúmenes creativos con
            inteligencia artificial impulsada por Google Gemini.
          </p>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm animate-slide-up"
          >
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" aria-hidden="true" />
            <div className="flex-1">
              <p className="font-semibold text-destructive">Atención</p>
              <p className="text-foreground/90">{errorMessage}</p>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-xs font-medium text-muted-foreground hover:text-foreground"
              aria-label="Cerrar alerta"
            >
              Cerrar
            </button>
          </div>
        )}

        <CharacterGrid
          characters={characters}
          onSelect={handleSelectFromGrid}
          isLoading={false}
        />
      </main>

      {/* El componente se cargará de forma diferida */}
      <CharacterDetail
        character={selected}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />

      <footer className="border-t border-border bg-background/60 py-6">
        <div className="mx-auto max-w-7xl px-4 text-center text-xs text-muted-foreground">
          Datos provistos por{" "}
          <a
            href="https://rickandmortyapi.com"
            target="_blank"
            rel="noreferrer"
            className="text-primary hover:underline"
          >
            rickandmortyapi.com
          </a>{" "}
          · IA por Google Gemini vía Vercel AI Gateway
        </div>
      </footer>
    </div>
  )
}
