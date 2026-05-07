"use client"

import type { Character } from "@/lib/types"
import { cn } from "@/lib/utils"
import Image from "next/image"

type CharacterCardProps = {
  character: Character
  onSelect: (character: Character) => void
  priority?: boolean
}

const statusColor: Record<Character["status"], string> = {
  Alive: "bg-primary",
  Dead: "bg-destructive",
  unknown: "bg-muted-foreground",
}

export function CharacterCard({ character, onSelect, priority = false }: CharacterCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(character)}
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border bg-card text-left",
        "transition-all duration-300 ease-out hover:-translate-y-1 hover:border-primary/60 hover:glow-primary",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      )}
      aria-label={`Ver detalle de ${character.name}`}
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Image
          src={character.image || "/placeholder.svg"}
          alt={character.name}
          width={300}
          height={300}
          priority={priority}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-primary/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
           <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground shadow-lg">
             Ver Detalles
           </span>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-card via-card/60 to-transparent" />
      </div>

      <div className="flex flex-col gap-2 p-4">
        <h3 className="text-pretty text-base font-semibold leading-tight text-foreground line-clamp-1">
          {character.name}
        </h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span
            className={cn("inline-block h-2 w-2 rounded-full", statusColor[character.status])}
            aria-hidden="true"
          />
          <span className="font-medium text-foreground/80">{character.status}</span>
          <span aria-hidden="true">·</span>
          <span className="line-clamp-1">{character.species}</span>
        </div>
      </div>
    </button>
  )
}
