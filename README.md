# RANDM_API-GEMINI
Proyecto Personal
# Documentación del Proyecto: Rick and Morty Multiverse Explorer

Este documento detalla la arquitectura, optimizaciones visuales y de rendimiento, y la integración de backend de la aplicación. El proyecto está construido con **Next.js (App Router)**, incorporando mejores prácticas modernas como Server Components, ISR (Incremental Static Regeneration), optimización de imágenes y lazy loading. Además, incluye inteligencia artificial para generar resúmenes dinámicos de los personajes.

---

## 1. Optimizaciones de Rendimiento y Visuales

El proyecto ha sido optimizado para cargar rápido y proporcionar una experiencia de usuario fluida y estética.

### Incremental Static Regeneration (ISR)
La página principal (`app/page.tsx`) utiliza ISR para cachear la respuesta de la API original de Rick and Morty y revalidarla cada hora (3600 segundos). Esto reduce drásticamente las peticiones a la API externa y acelera el tiempo de carga inicial.

### Optimización de Imágenes
Se ha reemplazado el uso de la etiqueta `<img>` estándar por el componente `<Image>` de Next.js (`next/image`). Este componente se encarga de servir las imágenes en formatos modernos (como WebP), comprimirlas y aplicar *lazy loading* (carga diferida).

> [!TIP]
> **Configuración en `next.config.mjs`:** Para permitir que Next.js optimice imágenes desde un dominio externo, se configuró `remotePatterns` apuntando a `rickandmortyapi.com`.

### Lazy Loading con `next/dynamic`
Componentes pesados o que no son críticos para la primera vista, como el modal de detalles del personaje (`CharacterDetail`) y el generador de resumen IA (`AISummary`), se cargan dinámicamente usando `next/dynamic`. Esto divide el código (code splitting) y reduce el tamaño del *bundle* inicial de Javascript.

### Diseño y UI
- **Tailwind CSS + Radix UI**: Se utiliza un sistema de diseño robusto y accesible.
- **Lucide React**: Biblioteca de iconos ligeros.
- **Animaciones y Dark Mode**: Uso de clases utilitarias para micro-interacciones (ej. `animate-fade-in`, `text-glow`) y manejo de paletas oscuras estéticas.

---

## 2. API y Backend Integrado

El proyecto utiliza las Server API Routes de Next.js para proteger claves de API y ejecutar procesos seguros del lado del servidor.

### API de Resumen con IA (Google Gemini)
El archivo `app/api/summary/route.ts` expone un endpoint POST que recibe los datos de un personaje y utiliza el **Vercel AI SDK** en conjunto con el modelo **Google Gemini (`gemini-flash-latest`)** para generar un resumen creativo de 3 líneas del personaje. 

> [!IMPORTANT]
> **Seguridad**: Todo el proceso de IA ocurre en el backend (`route.ts`). El frontend (`components/ai-summary.tsx`) sólo realiza un fetch a nuestro propio endpoint `/api/summary`, manteniendo seguras las credenciales de Google AI.

---

## 3. Archivos Clave y Fragmentos de Código

### `app/page.tsx` (Entry Point & ISR)
Este Server Component hace el fetching inicial con la estrategia de revalidación.

```tsx
import { HomeClient } from "@/components/home-client"
import type { CharactersResponse } from "@/lib/types"

export default async function HomePage() {
  // ISR: Revalidar datos cada hora (3600 segundos) para optimizar carga
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
```

### `app/api/summary/route.ts` (Endpoint de Inteligencia Artificial)
Maneja la conexión segura con Gemini y el prompt personalizado.

```typescript
import { generateText } from "ai"
import { google } from "@ai-sdk/google"

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { character } = await req.json()

    if (!character) {
      return Response.json({ error: "Missing character data" }, { status: 400 })
    }

    const { text } = await generateText({
      model: google("gemini-flash-latest"),
      prompt: `Basado en los siguientes datos JSON de un personaje, escribe un párrafo de 3 líneas describiéndolo de forma creativa para un fan de la ciencia ficción. Responde solo con el párrafo, sin encabezados ni comillas.\n\n${JSON.stringify(character, null, 2)}`,
    })

    return Response.json({ summary: text })
  } catch (error) {
    return Response.json({ error: "No se pudo generar el resumen." }, { status: 500 })
  }
}
```

### `components/character-detail.tsx` (Code Splitting y next/image)
Demuestra cómo cargar componentes asíncronamente y optimizar imágenes.

```tsx
import dynamic from "next/dynamic"
import Image from "next/image"

// Lazy loading del componente AI para no afectar el renderizado inicial
const AISummary = dynamic(
  () => import("@/components/ai-summary").then((mod) => mod.AISummary),
  { ssr: false }
)

export function CharacterDetail({ character, open, onOpenChange }: CharacterDetailProps) {
  // ...
  return (
    // ...
    <div className="overflow-hidden rounded-lg border border-border bg-muted">
      <Image
        src={character.image || "/placeholder.svg"}
        alt={character.name}
        width={300}
        height={300}
        className="h-full w-full object-cover"
      />
    </div>
    // ...
    <AISummary character={character} />
    // ...
  )
}
```

### `components/home-client.tsx` (Estado del Cliente y Lazy Loading Global)
Este Client Component maneja el estado de la aplicación, como las búsquedas y el modal.

```tsx
"use client"
import dynamic from "next/dynamic"
import { useState } from "react"

// Lazy loading del componente de detalles para no cargarlo en el bundle inicial
const CharacterDetail = dynamic(
  () => import("@/components/character-detail").then((mod) => mod.CharacterDetail),
  { ssr: false }
)

export function HomeClient({ initialCharacters }: { initialCharacters: Character[] }) {
  const [selected, setSelected] = useState<Character | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  
  // Lógica de búsqueda y selección...
  
  return (
    <div>
      {/* Navbar y Grid... */}
      
      {/* El componente se cargará de forma diferida */}
      <CharacterDetail
        character={selected}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  )
}
```

### `next.config.mjs` (Configuración de Imágenes)
Habilita la carga de imágenes remotas para el componente `<Image>`.

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "rickandmortyapi.com",
      },
    ],
  },
}

export default nextConfig
```

---

## Resumen de Tecnologías Implementadas
- **Framework:** Next.js 14+ (App Router)
- **Estilos:** Tailwind CSS, Radix UI
- **Optimizaciones:** Next/Image, Next/Dynamic (Lazy Loading), ISR (Revalidación de caché).
- **Inteligencia Artificial:** Vercel AI SDK con `@ai-sdk/google` (Modelo `gemini-flash-latest`).

