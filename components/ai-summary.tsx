"use client"

import { useState } from "react"
import { Sparkles, Quote } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Character } from "@/lib/types"

type AISummaryProps = {
  character: Character
}

export function AISummary({ character }: AISummaryProps) {
  const [summary, setSummary] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function generate() {
    setIsLoading(true)
    setError(null)
    setSummary(null)
    try {
      const res = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ character }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Error al generar el resumen")
      setSummary(data.summary)
    } catch (err) {
      console.log("[v0] generate summary error:", err)
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <Button
        type="button"
        onClick={generate}
        disabled={isLoading}
        className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 glow-primary"
      >
        <Sparkles className="h-4 w-4" aria-hidden="true" />
        {isLoading ? "Generando..." : "Generar resumen con IA"}
      </Button>

      {isLoading && (
        <div
          className="space-y-2 rounded-lg border-l-4 border-primary/60 bg-card/60 p-4"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="h-3 w-full animate-pulse rounded bg-muted" />
          <div className="h-3 w-11/12 animate-pulse rounded bg-muted" />
          <div className="h-3 w-9/12 animate-pulse rounded bg-muted" />
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive-foreground"
        >
          {error}
        </div>
      )}

      {summary && !isLoading && (
        <blockquote
          className="relative rounded-lg border-l-4 border-primary bg-card/60 p-4 pl-6 text-sm leading-relaxed text-foreground animate-fade-in"
          aria-live="polite"
        >
          <Quote
            className="absolute left-2 top-3 h-4 w-4 text-primary/70"
            aria-hidden="true"
          />
          <p className="text-pretty italic">{summary}</p>
          <footer className="mt-3 text-xs not-italic text-muted-foreground">
            — Generado por Gemini AI
          </footer>
        </blockquote>
      )}
    </div>
  )
}
