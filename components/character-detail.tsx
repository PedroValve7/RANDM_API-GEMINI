"use client"

import { Heart, MapPin, Users, Dna } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import type { Character } from "@/lib/types"
import dynamic from "next/dynamic"
import { cn } from "@/lib/utils"
import Image from "next/image"

// Lazy loading del componente AI para no afectar el renderizado inicial
const AISummary = dynamic(
  () => import("@/components/ai-summary").then((mod) => mod.AISummary),
  { ssr: false }
)

type CharacterDetailProps = {
  character: Character | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const statusColor: Record<Character["status"], string> = {
  Alive: "bg-primary text-primary-foreground",
  Dead: "bg-destructive text-destructive-foreground",
  unknown: "bg-muted text-muted-foreground",
}

export function CharacterDetail({ character, open, onOpenChange }: CharacterDetailProps) {
  if (!character) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto border-border bg-card text-card-foreground sm:max-w-3xl">
        <DialogHeader className="text-left">
          <DialogTitle className="text-balance text-2xl font-bold tracking-tight text-foreground">
            {character.name}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            ID #{character.id} · Personaje del multiverso de Rick and Morty
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-[240px_1fr]">
          <div className="overflow-hidden rounded-lg border border-border bg-muted">
            <Image
              src={character.image || "/placeholder.svg"}
              alt={character.name}
              width={300}
              height={300}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
                  statusColor[character.status],
                )}
              >
                <Heart className="h-3 w-3" aria-hidden="true" />
                {character.status}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
                <Dna className="h-3 w-3" aria-hidden="true" />
                {character.species}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
                <Users className="h-3 w-3" aria-hidden="true" />
                {character.gender}
              </span>
            </div>

            <dl className="grid gap-3 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Origen
                  </dt>
                  <dd className="text-foreground">{character.origin.name}</dd>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Última ubicación
                  </dt>
                  <dd className="text-foreground">{character.location.name}</dd>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Users className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Apariciones
                  </dt>
                  <dd className="text-foreground">{character.episode.length} episodios</dd>
                </div>
              </div>
            </dl>

            <div className="space-y-2 border-t border-border pt-4">
              <h3 className="text-sm font-semibold text-foreground">Resumen creativo con IA</h3>
              <AISummary character={character} />
            </div>
          </div>
        </div>

        <section aria-label="Datos crudos" className="space-y-2">
          <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
            Debug Zone
          </h3>
          <pre className="max-h-72 overflow-auto rounded-lg bg-slate-900 p-4 text-xs leading-relaxed text-green-400 font-mono">
            {JSON.stringify(character, null, 2)}
          </pre>
        </section>
      </DialogContent>
    </Dialog>
  )
}
