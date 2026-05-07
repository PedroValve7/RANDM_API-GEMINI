import { HomeClient } from "@/components/home-client"
import type { CharactersResponse } from "@/lib/types"

export default async function HomePage() {
  // ISR: Revalidar datos cada hora (3600 segundos) para optimizar carga y reducir llamadas a la API original
  const res = await fetch("https://rickandmortyapi.com/api/character", {
    next: { revalidate: 3600 },
  })

  let initialCharacters = []
  if (res.ok) {
    const data: CharactersResponse = await res.json()
    initialCharacters = data.results
  }

  return <HomeClient initialCharacters={initialCharacters} />
}
