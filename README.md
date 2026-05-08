# 🌀 Rick and Morty — Multiverse Explorer

> Aplicación web interactiva para explorar el multiverso de Rick and Morty, con búsqueda por ID, galería de personajes y resúmenes creativos generados por **Google Gemini AI**.

###  [Ver Aplicación en Vivo (Vercel)](https://randmortyapi-4uk8tebxv-pedrovalve7s-projects.vercel.app/) | 💻 [Ver en Replit](https://c4883c7c-251c-4ca6-bbad-f195c879d916-00-1jcmoyflqz4ju.riker.replit.dev/)
![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.2-06B6D4?logo=tailwindcss)
![Vercel AI SDK](https://img.shields.io/badge/Vercel_AI_SDK-6.0-000?logo=vercel)
![License](https://img.shields.io/badge/License-MIT-green)

---

##  Tabla de Contenidos

- [ Decisiones Arquitectónicas](#️-decisiones-arquitectónicas)
- [ Estrategias de Rendimiento](#-estrategias-de-rendimiento)
- [ Guía de Implementación](#-guía-de-implementación)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [ Componentes Principales](#-componentes-principales)
- [ Archivos Clave y Fragmentos de Código](#-archivos-clave-y-fragmentos-de-código)
- [ Stack Tecnológico](#-stack-tecnológico)

---

##  Decisiones Arquitectónicas

### ¿Por qué Next.js 16 (App Router)?

Se eligió **Next.js** como framework principal por las siguientes razones estratégicas:

| Criterio | Justificación |
|---|---|
| **Server Components** | El App Router de Next.js permite que `app/page.tsx` sea un **React Server Component** por defecto. El fetching inicial a la Rick and Morty API ocurre **en el servidor**, eliminando waterfalls en el cliente y reduciendo el JavaScript enviado al navegador. |
| **API Routes integradas** | Next.js permite crear endpoints backend (`app/api/summary/route.ts`) dentro del mismo proyecto, sin necesidad de un servidor externo. Esto es crítico para proteger la API key de Gemini: la clave **nunca llega al navegador**. |
| **Optimización de imágenes** | El componente `next/image` sirve las 20+ imágenes de personajes en formato WebP, con lazy loading nativo y redimensionado automático, sin configuración adicional más allá de `remotePatterns`. |
| **ISR (Incremental Static Regeneration)** | Permite servir páginas estáticas con revalidación automática, combinando lo mejor de SSG y SSR sin rebuild completo. |
| **Ecosistema y DX** | Soporte nativo para TypeScript, Tailwind CSS 4, Google Fonts (`next/font`), y el Vercel AI SDK. Todo funciona out-of-the-box. |

### ¿Por qué Tailwind CSS 4 + Radix UI?

- **Tailwind CSS 4**: Sistema utility-first que permite construir interfaces consistentes con tokens de diseño (colores, espaciados, tipografía) definidos en CSS variables. Se aprovechan las clases utilitarias para micro-animaciones (`animate-fade-in`, `animate-slide-up`) y efectos visuales (`text-glow`, `glow-primary`).
- **Radix UI**: Proporciona componentes headless accesibles (Dialog, Button, etc.) que cumplen con WAI-ARIA por defecto, permitiendo estilizar libremente con Tailwind sin sacrificar accesibilidad.

### ¿Por qué Vercel AI SDK + Google Gemini?

La integración de IA utiliza el **Vercel AI SDK** (`ai` v6) con el proveedor `@ai-sdk/google`:

- **Abstracción unificada**: El SDK ofrece una API declarativa (`generateText()`) que abstrae la complejidad de comunicarse con diferentes proveedores de IA. Si en el futuro se quisiera migrar a OpenAI o Anthropic, el cambio sería de una línea.
- **Modelo `gemini-flash-latest`**: Se seleccionó este modelo por su balance entre velocidad de respuesta (< 2s) y calidad de generación para textos cortos (resúmenes de 3 líneas).
- **Seguridad**: La llamada a Gemini ocurre exclusivamente en el Route Handler (`app/api/summary/route.ts`). El frontend solo hace un `fetch` a `/api/summary`, garantizando que la `GOOGLE_GENERATIVE_AI_API_KEY` nunca se expone al cliente.

---

##  Estrategias de Rendimiento

### 1. Lazy Loading y Partial Hydration

**¿Qué componentes se cargan de forma diferida y cómo ayuda a la hidratación parcial?**

En esta aplicación, dos componentes se cargan con `next/dynamic` y `{ ssr: false }`:

| Componente | Razón del Lazy Loading |
|---|---|
| `CharacterDetail` | Es un modal que solo se renderiza cuando el usuario hace clic en un personaje. No tiene sentido incluir ~5KB de lógica de Dialog + Image + layout en el bundle inicial. |
| `AISummary` | Se carga dentro de `CharacterDetail` y solo se activa bajo demanda cuando el usuario presiona "Generar resumen con IA". Incluye lógica de fetch y estados de loading/error que no son necesarios hasta la interacción. |

**Implementación real en el proyecto:**

```tsx
// components/home-client.tsx — Lazy loading del modal de detalles
const CharacterDetail = dynamic(
  () => import("@/components/character-detail").then((mod) => mod.CharacterDetail),
  { ssr: false }
)

// components/character-detail.tsx — Lazy loading del componente de IA
const AISummary = dynamic(
  () => import("@/components/ai-summary").then((mod) => mod.AISummary),
  { ssr: false }
)
```

**Impacto a escala (Tráfico Masivo)**: Si la aplicación creciera a cientos de personajes, el lazy loading y la hidratación parcial garantizan que el **Time to Interactive (TTI)** se mantiene bajo. El bundle inicial solo contiene la grilla, posponiendo la carga y ejecución (hidratación) del JavaScript pesado del modal y la IA hasta que el usuario interactúa.

### 2. ISR (Incremental Static Regeneration) — Híbrido SSG + SSR

**¿Cómo se implementa?**

La página principal (`app/page.tsx`) es un **Server Component** que realiza el fetch con `next: { revalidate: 3600 }`:

```tsx
// app/page.tsx
export default async function HomePage() {
  const res = await fetch("https://rickandmortyapi.com/api/character", {
    next: { revalidate: 3600 }, // Revalidar cada hora
  })
  // ...
}
```

**¿Por qué ISR y no SSG puro o SSR puro?**

| Estrategia | Pros | Contras | ¿Aplica aquí? |
|---|---|---|---|
| **SSG puro** (`generateStaticParams`) | Máxima velocidad — HTML pre-generado en build | Datos desactualizados hasta el próximo deploy |  No ideal si la API agrega personajes |
| **SSR puro** (sin cache) | Siempre datos frescos | Latencia en cada request (~200-500ms por fetch a la API) | ❌ Innecesario — los personajes cambian poco |
| **ISR**  | HTML estático + revalidación automática cada N segundos | Ligera "stale window" (máx. 1 hora) | ✅ Balance perfecto |

**Justificación a escala masiva**: Si esta aplicación recibiera 100K+ requests/hora, ISR sirve la página desde el **CDN edge** sin ejecutar el Server Component en cada petición. Solo cada 3600 segundos (1 hora) se re-genera la página en background con datos frescos. Esto reduce la carga en el servidor a prácticamente cero para el contenido principal.

### 3. Optimización de Imágenes con `next/image`

Todas las imágenes de personajes usan el componente `<Image>` de Next.js en lugar de `<img>`:

```tsx
<Image
  src={character.image}
  alt={character.name}
  width={300}
  height={300}
  className="h-full w-full object-cover"
/>
```

**Beneficios concretos:**
- **Formato moderno**: Sirve automáticamente WebP/AVIF según el soporte del navegador.
- **Lazy loading nativo**: Las imágenes fuera del viewport no se descargan hasta que el usuario hace scroll.
- **Dimensionado óptimo**: Genera múltiples tamaños (`srcset`) para que cada dispositivo descargue la resolución adecuada.
- **Configuración**: Se habilitó el dominio externo en `next.config.mjs`:

```javascript
images: {
  remotePatterns: [
    { protocol: "https", hostname: "rickandmortyapi.com" },
  ],
}
```

### 4. Tipografía optimizada con `next/font`

Se usan **Google Fonts** cargadas localmente para evitar layout shifts (CLS):

```tsx
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-sans", display: "swap" })
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" })
```

`next/font` descarga las fuentes en build time y las sirve como archivos estáticos, eliminando la dependencia del CDN de Google Fonts en runtime.

---

## 🔧 Guía de Implementación

### Prerrequisitos

- **Node.js** ≥ 18.17
- **npm** ≥ 9 (incluido con Node.js)
- **API Key de Google Gemini** — [Obtener aquí](https://aistudio.google.com/app/apikey)

### 1. Clonar el repositorio

```bash
git clone https://github.com/PedroValve7/RANDM_API-GEMINI.git
cd RANDM_API-GEMINI
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto tomando como referencia el archivo `.env.example`:

```bash
cp .env.example .env.local
```

Edita `.env.local` y reemplaza el valor placeholder con tu API key real:

```env
GOOGLE_GENERATIVE_AI_API_KEY=tu_api_key_aquí
```

> ** Importante**: El archivo `.env.local` está incluido en `.gitignore` y **nunca se sube al repositorio**. Esto protege tus credenciales.
> **Nota para CodeSandbox:** Si trabajas o despliegas en **CodeSandbox**, puedes usar la herramienta de **Secrets / Environment Variables** (Variables de Entorno) integrada en la plataforma para configurar `GOOGLE_GENERATIVE_AI_API_KEY` de forma segura.

### 4. Ejecutar en modo desarrollo

```bash
npm run dev
```

La aplicación estará disponible en **http://localhost:3000**.

### 5. Build de producción (opcional)

```bash
npm run build
npm start
```

### Configuración en Vercel (Deploy)

Si despliegas en Vercel, configura la variable de entorno desde el dashboard:

1. Ve a **Settings → Environment Variables**
2. Agrega:
   - **Name**: `GOOGLE_GENERATIVE_AI_API_KEY`
   - **Value**: tu API key de Gemini
3. Redeploy

### Referencia: `.env.example`

El repositorio incluye un archivo `.env.example` como referencia:

```env
# API Key de Google Gemini para la generación de resúmenes con IA
# Obtén tu key en: https://aistudio.google.com/app/apikey
GOOGLE_GENERATIVE_AI_API_KEY=your_google_gemini_api_key_here
```

---

##  Estructura del Proyecto

```
RANDM_API-GEMINI/
├── app/
│   ├── api/
│   │   └── summary/
│   │       └── route.ts          # Endpoint POST — Genera resúmenes con Gemini AI
│   ├── globals.css               # Estilos globales y tokens de diseño
│   ├── layout.tsx                # Layout raíz (fonts, metadata, analytics)
│   └── page.tsx                  # Entry point — Server Component con ISR
├── components/
│   ├── ui/                       # Componentes base Radix UI + shadcn/ui
│   ├── ai-summary.tsx            # Botón y display del resumen generado por IA
│   ├── character-card.tsx        # Tarjeta individual de personaje
│   ├── character-detail.tsx      # Modal con información completa + IA
│   ├── character-grid.tsx        # Grilla responsive de personajes
│   ├── home-client.tsx           # Client Component principal (estado y lógica)
│   ├── navbar.tsx                # Barra de navegación con buscador por ID
│   └── theme-provider.tsx        # Provider para dark/light mode
├── hooks/                        # Custom React hooks
├── lib/
│   ├── types.ts                  # Tipos TypeScript (Character, CharactersResponse)
│   └── utils.ts                  # Utilidades (cn helper para clsx + tailwind-merge)
├── public/                       # Assets estáticos
├── styles/                       # Estilos adicionales
├── .env.example                  # Referencia de variables de entorno
├── .env.local                    # Variables reales (NO se sube a git)
├── next.config.mjs               # Configuración de Next.js (imágenes, TypeScript)
├── package.json                  # Dependencias y scripts
├── tsconfig.json                 # Configuración de TypeScript
└── vercel.json                   # Configuración de deploy en Vercel
```

---

##  Componentes Principales

### Flujo de datos de la aplicación

```
┌──────────────────────────────────────────────────────────────────┐
│  app/page.tsx (Server Component)                                 │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ fetch("rickandmortyapi.com/api/character")                 │  │
│  │ ISR: revalidate = 3600s                                    │  │
│  └────────────────┬───────────────────────────────────────────┘  │
│                   │ initialCharacters[]                          │
│                   ▼                                              │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ HomeClient (Client Component)                              │  │
│  │  ├── Navbar → búsqueda por ID → fetch API                 │  │
│  │  ├── CharacterGrid → renderiza CharacterCard[]             │  │
│  │  └── CharacterDetail (lazy) → Dialog modal                │  │
│  │       └── AISummary (lazy) → POST /api/summary            │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  app/api/summary/route.ts (Server-side)                          │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ generateText() → Google Gemini (gemini-flash-latest)       │  │
│  │ GOOGLE_GENERATIVE_AI_API_KEY (protegida en el servidor)    │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

### Descripción de componentes

| Componente | Tipo | Responsabilidad |
|---|---|---|
| `app/page.tsx` | Server Component | Fetch inicial con ISR, pasa datos al cliente |
| `HomeClient` | Client Component | Maneja estado (búsqueda, selección, errores), orquesta la UI |
| `Navbar` | Client Component | Barra de navegación con input de búsqueda por ID |
| `CharacterGrid` | Client Component | Renderiza la grilla responsive de `CharacterCard` |
| `CharacterCard` | Client Component | Tarjeta visual con imagen, nombre, status y especie |
| `CharacterDetail` | Client (lazy) | Modal con información detallada del personaje |
| `AISummary` | Client (lazy) | Botón para generar y mostrar el resumen de Gemini AI |

---

##  Archivos Clave y Fragmentos de Código

### `app/page.tsx` — Entry Point con ISR

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

### `app/api/summary/route.ts` — Endpoint de Inteligencia Artificial

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
      prompt: `Eres un explorador intergaláctico del universo de Rick & Morty. Basado en los siguientes datos JSON de un personaje, escribe un párrafo de 3 líneas describiéndolo de forma MUY creativa, con un toque de humor cínico o científico loco. Responde solo con el párrafo, sin encabezados ni comillas.\n\n${JSON.stringify(character, null, 2)}`,
    })

    return Response.json({ summary: text })
  } catch (error) {
    return Response.json(
      { error: "No se pudo generar el resumen. Verifica la configuración de la IA." },
      { status: 500 }
    )
  }
}
```

### `components/character-detail.tsx` — Code Splitting y `next/image`

```tsx
import dynamic from "next/dynamic"
import Image from "next/image"

// Lazy loading del componente AI para no afectar el renderizado inicial
const AISummary = dynamic(
  () => import("@/components/ai-summary").then((mod) => mod.AISummary),
  { ssr: false }
)

export function CharacterDetail({ character, open, onOpenChange }: CharacterDetailProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <Image
          src={character.image}
          alt={character.name}
          width={300}
          height={300}
          className="h-full w-full object-cover"
        />
        {/* ... datos del personaje ... */}
        <AISummary character={character} />
      </DialogContent>
    </Dialog>
  )
}
```

### `next.config.mjs` — Configuración de Imágenes Remotas

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "rickandmortyapi.com" },
    ],
  },
}

export default nextConfig
```

---

##  Stack Tecnológico

| Categoría | Tecnología | Versión |
|---|---|---|
| **Framework** | Next.js (App Router) | 16.2.4 |
| **UI Library** | React | 19 |
| **Lenguaje** | TypeScript | 5.7.3 |
| **Estilos** | Tailwind CSS | 4.2 |
| **Componentes UI** | Radix UI + shadcn/ui | Últimas |
| **Iconos** | Lucide React | 0.564 |
| **IA** | Vercel AI SDK + `@ai-sdk/google` | 6.0 / 3.0 |
| **Modelo IA** | Google Gemini (`gemini-flash-latest`) | — |
| **Analytics** | Vercel Analytics | 1.6.1 |
| **Deploy** | Vercel | — |

---

## 📄 Licencia

Este proyecto fue desarrollado como parte de una prueba técnica.

Datos provistos por [rickandmortyapi.com](https://rickandmortyapi.com) · IA por Google Gemini vía Vercel AI SDK.
