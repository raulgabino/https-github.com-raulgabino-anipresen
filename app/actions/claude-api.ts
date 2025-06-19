"use server"

interface ContentAnalysis {
  title: string
  mainIdeas: string[]
  keyConcepts: string[]
  connections: Array<{ from: string; to: string; relation: string }>
  suggestedStructure: "presentation" | "mindmap" | "timeline"
  reasoning: string
}

interface VisualDesign {
  layout: "radial" | "linear" | "hierarchical"
  elements: Array<{
    type: "text" | "circle" | "line"
    content: string
    position: { x: number; y: number }
    color: string
    size: number
    animationStart: number
    animationDuration: number
    effect: "typewriter" | "grow" | "slide" | "fade"
  }>
  connections: Array<{
    from: { x: number; y: number }
    to: { x: number; y: number }
    style: "straight" | "curved"
    color: string
    timing: number
  }>
}

interface OptimizedSequence {
  sequence: Array<{
    step: number
    elements: string[]
    startTime: number
    duration: number
    emphasis: "low" | "medium" | "high"
    pauseAfter: number
  }>
  totalDuration: number
  keyMoments: Array<{
    time: number
    description: string
    visualEffect: "highlight" | "zoom" | "pulse"
  }>
}

async function callClaudeAPI(prompt: string): Promise<any> {
  const apiKey = process.env.NEXT_PUBLIC_CLAUDE_API_KEY

  if (!apiKey) {
    throw new Error("Claude API key not configured")
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-sonnet-20240229",
        max_tokens: 4000,
        temperature: 0.7,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }

    const data = await response.json()
    return JSON.parse(data.content[0].text)
  } catch (error) {
    console.error("Claude API Error:", error)
    throw error
  }
}

export async function analyzeContent(text: string): Promise<ContentAnalysis> {
  const prompt = `Analiza este texto y extrae exactamente:

1. TÍTULO PRINCIPAL (máximo 6 palabras, impactante)
2. IDEAS PRINCIPALES (exactamente 3-5 bullets, concisos)
3. CONCEPTOS CLAVE (6-8 palabras/frases importantes)
4. RELACIONES entre conceptos (qué conecta con qué)
5. ESTRUCTURA SUGERIDA (timeline/mapa mental/presentación)

Texto: "${text}"

Responde SOLO en JSON válido:
{
  "title": "string",
  "mainIdeas": ["string", "string", "string"],
  "keyConcepts": ["string", "string"],
  "connections": [{"from": "concepto1", "to": "concepto2", "relation": "causa"}],
  "suggestedStructure": "presentation|mindmap|timeline",
  "reasoning": "Por qué esta estructura"
}`

  return await callClaudeAPI(prompt)
}

export async function generateVisualDesign(analysis: ContentAnalysis): Promise<VisualDesign> {
  const prompt = `Basándote en este análisis, diseña visualización para canvas 1200x800:

Análisis: ${JSON.stringify(analysis)}

Genera diseño específico en JSON válido:
{
  "layout": "radial|linear|hierarchical",
  "elements": [
    {
      "type": "text|circle|line",
      "content": "string",
      "position": {"x": number, "y": number},
      "color": "#58C4DD|#FF6B6B|#51CF66|#FFFF00|#9775FA",
      "size": number,
      "animationStart": number,
      "animationDuration": number,
      "effect": "typewriter|grow|slide|fade"
    }
  ],
  "connections": [
    {
      "from": {"x": number, "y": number},
      "to": {"x": number, "y": number},
      "style": "straight|curved",
      "color": "#hexcode",
      "timing": number
    }
  ]
}`

  return await callClaudeAPI(prompt)
}

export async function optimizeNarrativeFlow(elements: any[]): Promise<OptimizedSequence> {
  const prompt = `Optimiza secuencia de animación:

Elementos: ${JSON.stringify(elements)}

Responde en JSON válido:
{
  "sequence": [
    {
      "step": number,
      "elements": ["elementId"],
      "startTime": number,
      "duration": number,
      "emphasis": "low|medium|high",
      "pauseAfter": number
    }
  ],
  "totalDuration": number,
  "keyMoments": [
    {
      "time": number,
      "description": "momento clave",
      "visualEffect": "highlight|zoom|pulse"
    }
  ]
}`

  return await callClaudeAPI(prompt)
}

export async function testClaudeConnection(): Promise<{ success: boolean; message: string }> {
  const apiKey = process.env.NEXT_PUBLIC_CLAUDE_API_KEY

  if (!apiKey) {
    return { success: false, message: "API key not configured" }
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-sonnet-20240229",
        max_tokens: 10,
        messages: [{ role: "user", content: "Test" }],
      }),
    })

    return {
      success: response.ok,
      message: response.ok ? "Connection successful" : `API Error: ${response.status}`,
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Connection failed",
    }
  }
}
