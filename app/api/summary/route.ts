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
      prompt: `Eres un explorador intergaláctico del universo de Rick & Morty. Basado en los siguientes datos JSON de un personaje, escribe un párrafo de 3 líneas describiéndolo de forma MUY creativa, con un toque de humor cínico o científico loco. Responde solo con el párrafo, sin encabezados ni comillas.\n\n${JSON.stringify(
        character,
        null,
        2,
      )}`,
    })

    return Response.json({ summary: text })
  } catch (error) {
    console.log("[v0] AI summary error:", error)
    return Response.json(
      { error: "No se pudo generar el resumen. Verifica la configuración de la IA." },
      { status: 500 },
    )
  }
}
