"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Play,
  Pause,
  Square,
  SkipForward,
  SkipBack,
  Brain,
  Palette,
  Zap,
} from "lucide-react"

// Colores exactos requeridos
const COLORS = {
  blue: "#58C4DD",
  yellow: "#FFFF00",
  red: "#FF6B6B",
  green: "#51CF66",
}

// Claude API Configuration
const CLAUDE_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_CLAUDE_API_KEY || "user-will-provide",
  model: "claude-3-sonnet-20240229",
  maxTokens: 4000,
  temperature: 0.7,
}

interface ClaudeResponse {
  content: string
  usage: {
    input_tokens: number
    output_tokens: number
  }
}

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
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${CLAUDE_CONFIG.apiKey}`,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: CLAUDE_CONFIG.model,
        max_tokens: CLAUDE_CONFIG.maxTokens,
        temperature: CLAUDE_CONFIG.temperature,
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

async function analyzeContent(text: string): Promise<ContentAnalysis> {
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

async function generateVisualDesign(analysis: ContentAnalysis): Promise<VisualDesign> {
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

async function optimizeNarrativeFlow(elements: any[]): Promise<OptimizedSequence> {
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

// Easing function para animaciones suaves
const easeInOutCubic = (t: number): number => {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

// Tipos para el sistema de escenas
interface SceneElement {
  type: "text" | "circle" | "line" | "bullet"
  content?: string
  text?: string
  x: number
  y: number
  x1?: number
  y1?: number
  x2?: number
  y2?: number
  radius?: number
  size?: number
  color: string
  delay?: number
}

interface Scene {
  name: string
  elements: SceneElement[]
  duration: number
}

interface TimelineControls {
  totalDuration: number
  currentTime: number
  playSpeed: 0.5 | 1 | 1.5 | 2
  isPlaying: boolean
}

class TimelineController {
  private playSpeed = 1
  private callbacks: ((progress: number) => void)[] = []

  setPlaybackSpeed(speed: number): void {
    this.playSpeed = speed
  }

  getPlaybackSpeed(): number {
    return this.playSpeed
  }

  jumpToTime(seconds: number): void {
    // This will be handled by the component
  }

  stepFrame(direction: "forward" | "backward"): void {
    // This will be handled by the component
  }

  onProgressUpdate(callback: (progress: number) => void): void {
    this.callbacks.push(callback)
  }
}

class AnimatedText {
  private text: string
  private x: number
  private y: number
  private fontSize: number
  private color: string
  private ctx: CanvasRenderingContext2D
  private typewriterIndex = 0
  private cursorVisible = true
  private lastCursorToggle = 0

  constructor(text: string, x: number, y: number, fontSize: number, color: string, ctx: CanvasRenderingContext2D) {
    this.text = text
    this.x = x
    this.y = y
    this.fontSize = fontSize
    this.color = color
    this.ctx = ctx
  }

  drawProgressive(progress: number): void {
    // progress de 0 a 1, dibuja letra por letra con easing
    const easedProgress = easeInOutCubic(progress)
    const charactersToShow = Math.floor(easedProgress * this.text.length)
    const textToShow = this.text.substring(0, charactersToShow)

    this.ctx.save()
    this.ctx.font = `${this.fontSize}px 'JetBrains Mono', 'Courier New', monospace`
    this.ctx.fillStyle = this.color
    this.ctx.textBaseline = "middle"
    this.ctx.textAlign = "center"
    this.ctx.fillText(textToShow, this.x, this.y)
    this.ctx.restore()
  }

  drawTypewriter(): void {
    const currentTime = Date.now()

    // Toggle cursor cada 500ms
    if (currentTime - this.lastCursorToggle > 500) {
      this.cursorVisible = !this.cursorVisible
      this.lastCursorToggle = currentTime
    }

    const textToShow = this.text.substring(0, this.typewriterIndex)

    this.ctx.save()
    this.ctx.font = `${this.fontSize}px 'JetBrains Mono', 'Courier New', monospace`
    this.ctx.fillStyle = this.color
    this.ctx.textBaseline = "middle"
    this.ctx.textAlign = "center"

    // Dibujar texto
    this.ctx.fillText(textToShow, this.x, this.y)

    // Dibujar cursor parpadeante
    if (this.cursorVisible) {
      const textWidth = this.ctx.measureText(textToShow).width
      this.ctx.fillRect(this.x + textWidth / 2, this.y - this.fontSize / 2, 3, this.fontSize)
    }

    this.ctx.restore()
  }

  reset(): void {
    this.typewriterIndex = 0
    this.cursorVisible = true
    this.lastCursorToggle = Date.now()
  }
}

class AnimatedCircle {
  private x: number
  private y: number
  private radius: number
  private color: string
  private text?: string
  private ctx: CanvasRenderingContext2D

  constructor(x: number, y: number, radius: number, color: string, ctx: CanvasRenderingContext2D, text?: string) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.text = text
    this.ctx = ctx
  }

  drawProgressive(progress: number): void {
    // progress de 0 a 1, dibuja de 0° a 360° con easing
    const easedProgress = easeInOutCubic(progress)
    const endAngle = easedProgress * 2 * Math.PI

    this.ctx.save()
    this.ctx.strokeStyle = this.color
    this.ctx.lineWidth = 4
    this.ctx.beginPath()
    this.ctx.arc(this.x, this.y, this.radius, -Math.PI / 2, -Math.PI / 2 + endAngle)
    this.ctx.stroke()

    // Dibujar texto en el centro si existe
    if (this.text && progress > 0.5) {
      this.ctx.fillStyle = this.color
      this.ctx.font = `20px 'JetBrains Mono', 'Courier New', monospace`
      this.ctx.textAlign = "center"
      this.ctx.textBaseline = "middle"
      this.ctx.fillText(this.text, this.x, this.y)
    }

    this.ctx.restore()
  }

  drawComplete(): void {
    this.ctx.save()
    this.ctx.strokeStyle = this.color
    this.ctx.lineWidth = 4
    this.ctx.beginPath()
    this.ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI)
    this.ctx.stroke()

    // Dibujar texto en el centro si existe
    if (this.text) {
      this.ctx.fillStyle = this.color
      this.ctx.font = `20px 'JetBrains Mono', 'Courier New', monospace`
      this.ctx.textAlign = "center"
      this.ctx.textBaseline = "middle"
      this.ctx.fillText(this.text, this.x, this.y)
    }

    this.ctx.restore()
  }
}

class AnimatedLine {
  private x1: number
  private y1: number
  private x2: number
  private y2: number
  private color: string
  private ctx: CanvasRenderingContext2D

  constructor(x1: number, y1: number, x2: number, y2: number, color: string, ctx: CanvasRenderingContext2D) {
    this.x1 = x1
    this.y1 = y1
    this.x2 = x2
    this.y2 = y2
    this.color = color
    this.ctx = ctx
  }

  drawProgressive(progress: number): void {
    // progress de 0 a 1, crecimiento desde punto inicial con easing
    const easedProgress = easeInOutCubic(progress)
    const currentX = this.x1 + (this.x2 - this.x1) * easedProgress
    const currentY = this.y1 + (this.y2 - this.y1) * easedProgress

    this.ctx.save()
    this.ctx.strokeStyle = this.color
    this.ctx.lineWidth = 6
    this.ctx.lineCap = "round"
    this.ctx.beginPath()
    this.ctx.moveTo(this.x1, this.y1)
    this.ctx.lineTo(currentX, currentY)
    this.ctx.stroke()
    this.ctx.restore()
  }
}

class SceneManager {
  private ctx: CanvasRenderingContext2D
  private animatedText: AnimatedText
  private animatedCircle: AnimatedCircle
  private animatedLine: AnimatedLine
  private scenes: Scene[]

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx
    this.animatedText = new AnimatedText("", 0, 0, 24, "#FFFFFF", ctx)
    this.animatedCircle = new AnimatedCircle(0, 0, 50, "#FFFFFF", ctx)
    this.animatedLine = new AnimatedLine(0, 0, 0, 0, "#FFFFFF", ctx)

    this.scenes = [
      {
        name: "Text Presentation",
        duration: 4000,
        elements: [
          { type: "text", content: "TÍTULO PRINCIPAL", x: 600, y: 200, size: 48, color: "#58C4DD" },
          { type: "text", content: "Subtítulo explicativo", x: 600, y: 250, size: 28, color: "#ADB5BD" },
          {
            type: "bullet",
            content: "• Primera idea principal",
            x: 600,
            y: 320,
            size: 24,
            color: "#FFFFFF",
            delay: 1000,
          },
          {
            type: "bullet",
            content: "• Segunda idea importante",
            x: 600,
            y: 360,
            size: 24,
            color: "#FFFFFF",
            delay: 1500,
          },
          { type: "bullet", content: "• Tercera conclusión", x: 600, y: 400, size: 24, color: "#FFFFFF", delay: 2000 },
        ],
      },
      {
        name: "Concept Diagram",
        duration: 3500,
        elements: [
          { type: "circle", x: 600, y: 400, radius: 80, color: "#58C4DD", text: "CORE" },
          { type: "circle", x: 450, y: 300, radius: 50, color: "#FF6B6B", text: "A" },
          { type: "circle", x: 750, y: 300, radius: 50, color: "#51CF66", text: "B" },
          { type: "circle", x: 450, y: 500, radius: 50, color: "#FFFF00", text: "C" },
          { type: "circle", x: 750, y: 500, radius: 50, color: "#9775FA", text: "D" },
          { type: "line", x1: 600, y1: 400, x2: 450, y2: 300, color: "#FF6B6B" },
          { type: "line", x1: 600, y1: 400, x2: 750, y2: 300, color: "#51CF66" },
          { type: "line", x1: 600, y1: 400, x2: 450, y2: 500, color: "#FFFF00" },
          { type: "line", x1: 600, y1: 400, x2: 750, y2: 500, color: "#9775FA" },
        ],
      },
      {
        name: "Timeline",
        duration: 3300,
        elements: [
          { type: "text", content: "EVOLUCIÓN TEMPORAL", x: 600, y: 150, size: 40, color: "#58C4DD" },
          { type: "line", x1: 200, y1: 400, x2: 1000, y2: 400, color: "#FFFFFF" },
          { type: "circle", x: 300, y: 400, radius: 8, color: "#FFFF00" },
          { type: "circle", x: 500, y: 400, radius: 8, color: "#FFFF00" },
          { type: "circle", x: 700, y: 400, radius: 8, color: "#FFFF00" },
          { type: "circle", x: 900, y: 400, radius: 8, color: "#FFFF00" },
          { type: "text", content: "2020", x: 300, y: 350, size: 20, color: "#FFFF00" },
          { type: "text", content: "2021", x: 500, y: 350, size: 20, color: "#FFFF00" },
          { type: "text", content: "2022", x: 700, y: 350, size: 20, color: "#FFFF00" },
          { type: "text", content: "2023", x: 900, y: 350, size: 20, color: "#FFFF00" },
        ],
      },
    ]
  }

  getScene(index: number): Scene | null {
    return this.scenes[index] || null
  }

  getTotalScenes(): number {
    return this.scenes.length
  }

  renderScene(sceneIndex: number, elapsed: number): void {
    const scene = this.getScene(sceneIndex)
    if (!scene) return

    scene.elements.forEach((element, index) => {
      let elementProgress = 0
      let shouldRender = false

      if (sceneIndex === 0) {
        // Escena 1: título (1s) → subtítulo (0.5s) → bullets secuenciales (0.5s cada uno)
        if (index === 0) {
          // Título principal
          elementProgress = Math.min(elapsed / 1000, 1)
          shouldRender = elapsed > 0
        } else if (index === 1) {
          // Subtítulo
          elementProgress = Math.min((elapsed - 1000) / 500, 1)
          shouldRender = elapsed > 1000
        } else {
          // Bullets con delay
          const bulletDelay = element.delay || 0
          elementProgress = Math.min((elapsed - bulletDelay) / 500, 1)
          shouldRender = elapsed > bulletDelay
        }
      } else if (sceneIndex === 1) {
        // Escena 2: centro (1s) → conexiones + nodos simultáneos (0.3s cada uno)
        if (index === 0) {
          // Círculo central
          elementProgress = Math.min(elapsed / 1000, 1)
          shouldRender = elapsed > 0
        } else {
          // Otros elementos después del centro
          const delay = 1000 + (index - 1) * 300
          elementProgress = Math.min((elapsed - delay) / 300, 1)
          shouldRender = elapsed > delay
        }
      } else if (sceneIndex === 2) {
        // Escena 3: título (0.5s) → línea base (1s) → marcadores secuenciales (0.2s cada uno)
        if (index === 0) {
          // Título
          elementProgress = Math.min(elapsed / 500, 1)
          shouldRender = elapsed > 0
        } else if (index === 1) {
          // Línea base
          elementProgress = Math.min((elapsed - 500) / 1000, 1)
          shouldRender = elapsed > 500
        } else {
          // Marcadores y textos
          const delay = 1500 + (index - 2) * 200
          elementProgress = Math.min((elapsed - delay) / 200, 1)
          shouldRender = elapsed > delay
        }
      }

      if (shouldRender && elementProgress > 0) {
        this.renderElement(element, elementProgress)
      }
    })
  }

  private renderElement(element: SceneElement, progress: number): void {
    this.ctx.save()

    if (element.type === "text" || element.type === "bullet") {
      this.ctx.font = `${element.size || 24}px 'JetBrains Mono', 'Courier New', monospace`
      this.ctx.fillStyle = element.color
      this.ctx.textAlign = "center"
      this.ctx.textBaseline = "middle"

      const text = element.content || ""
      const charactersToShow = Math.floor(easeInOutCubic(progress) * text.length)
      const textToShow = text.substring(0, charactersToShow)

      this.ctx.fillText(textToShow, element.x, element.y)
    } else if (element.type === "circle") {
      const easedProgress = easeInOutCubic(progress)
      const endAngle = easedProgress * 2 * Math.PI

      this.ctx.strokeStyle = element.color
      this.ctx.lineWidth = 4
      this.ctx.beginPath()
      this.ctx.arc(element.x, element.y, element.radius || 50, -Math.PI / 2, -Math.PI / 2 + endAngle)
      this.ctx.stroke()

      // Texto en el centro si existe y el círculo está más del 50% completo
      if (element.text && progress > 0.5) {
        this.ctx.fillStyle = element.color
        this.ctx.font = `16px 'JetBrains Mono', 'Courier New', monospace`
        this.ctx.textAlign = "center"
        this.ctx.textBaseline = "middle"
        this.ctx.fillText(element.text, element.x, element.y)
      }
    } else if (element.type === "line") {
      const easedProgress = easeInOutCubic(progress)
      const currentX = element.x1! + (element.x2! - element.x1!) * easedProgress
      const currentY = element.y1! + (element.y2! - element.y1!) * easedProgress

      this.ctx.strokeStyle = element.color
      this.ctx.lineWidth = 4
      this.ctx.lineCap = "round"
      this.ctx.beginPath()
      this.ctx.moveTo(element.x1!, element.y1!)
      this.ctx.lineTo(currentX, currentY)
      this.ctx.stroke()
    }

    this.ctx.restore()
  }

  updateScene(index: number, newScene: Scene): void {
    if (index >= 0 && index < this.scenes.length) {
      this.scenes[index] = newScene
    }
  }

  getElementMarkers(sceneIndex: number): Array<{ time: number; color: string; label: string }> {
    const scene = this.getScene(sceneIndex)
    if (!scene) return []

    const markers: Array<{ time: number; color: string; label: string }> = []

    scene.elements.forEach((element, index) => {
      let startTime = 0

      if (sceneIndex === 0) {
        if (index === 0) startTime = 0
        else if (index === 1) startTime = 1000
        else startTime = element.delay || 0
      } else if (sceneIndex === 1) {
        if (index === 0) startTime = 0
        else startTime = 1000 + (index - 1) * 300
      } else if (sceneIndex === 2) {
        if (index === 0) startTime = 0
        else if (index === 1) startTime = 500
        else startTime = 1500 + (index - 2) * 200
      }

      markers.push({
        time: startTime / 1000, // Convert to seconds
        color: element.color,
        label: element.content || element.text || `${element.type} element`,
      })
    })

    return markers.sort((a, b) => a.time - b.time)
  }
}

// AI Components
const ApiConfigPanel = ({ onConnectionChange }: { onConnectionChange: (connected: boolean) => void }) => {
  const [apiKey, setApiKey] = useState("")
  const [isConnected, setIsConnected] = useState(false)
  const [isTestingConnection, setIsTestingConnection] = useState(false)

  const testConnection = async (key: string) => {
    if (!key.trim()) return

    setIsTestingConnection(true)
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-3-sonnet-20240229",
          max_tokens: 10,
          messages: [{ role: "user", content: "Test" }],
        }),
      })

      const connected = response.ok
      setIsConnected(connected)
      onConnectionChange(connected)

      if (connected) {
        CLAUDE_CONFIG.apiKey = key
      }
    } catch (error) {
      setIsConnected(false)
      onConnectionChange(false)
    } finally {
      setIsTestingConnection(false)
    }
  }

  return (
    <div className="bg-gray-800 p-4 rounded border-l-4 border-blue-500">
      <h3 className="text-white font-bold mb-2">🤖 Claude AI Configuration</h3>

      <div className="flex gap-2 mb-2">
        <input
          type="password"
          placeholder="Claude API Key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="flex-1 p-2 bg-gray-700 text-white rounded font-mono text-sm"
        />
        <button
          onClick={() => testConnection(apiKey)}
          disabled={isTestingConnection}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isTestingConnection ? "..." : "Test"}
        </button>
      </div>

      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
        <span className="text-sm text-gray-300">{isConnected ? "Connected" : "Not connected"}</span>
      </div>
    </div>
  )
}

const AIControls = ({
  isConnected,
  editorText,
  onAnalysisResult,
  onVisualDesign,
  onOptimizedFlow,
}: {
  isConnected: boolean
  editorText: string
  onAnalysisResult: (result: ContentAnalysis) => void
  onVisualDesign: (design: VisualDesign) => void
  onOptimizedFlow: (flow: OptimizedSequence) => void
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isGeneratingDesign, setIsGeneratingDesign] = useState(false)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<ContentAnalysis | null>(null)

  const handleAnalyzeContent = async () => {
    if (!editorText.trim()) return

    setIsAnalyzing(true)
    try {
      const result = await analyzeContent(editorText)
      setAnalysisResult(result)
      onAnalysisResult(result)
    } catch (error) {
      console.error("Analysis error:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleGenerateDesign = async () => {
    if (!analysisResult) return

    setIsGeneratingDesign(true)
    try {
      const design = await generateVisualDesign(analysisResult)
      onVisualDesign(design)
    } catch (error) {
      console.error("Design generation error:", error)
    } finally {
      setIsGeneratingDesign(false)
    }
  }

  const handleOptimizeFlow = async () => {
    setIsOptimizing(true)
    try {
      const flow = await optimizeNarrativeFlow([])
      onOptimizedFlow(flow)
    } catch (error) {
      console.error("Flow optimization error:", error)
    } finally {
      setIsOptimizing(false)
    }
  }

  return (
    <div className="bg-gray-900 p-4 space-y-3">
      <button
        onClick={handleAnalyzeContent}
        disabled={!isConnected || isAnalyzing || !editorText.trim()}
        className="w-full p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isAnalyzing ? (
          <>
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            Analyzing with Claude...
          </>
        ) : (
          <>
            <Brain size={20} />
            Analyze Content
          </>
        )}
      </button>

      <button
        onClick={handleGenerateDesign}
        disabled={!analysisResult || isGeneratingDesign}
        className="w-full p-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg font-bold disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isGeneratingDesign ? (
          <>
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            Generating Design...
          </>
        ) : (
          <>
            <Palette size={20} />
            Generate Visual Design
          </>
        )}
      </button>

      <button
        onClick={handleOptimizeFlow}
        disabled={!isConnected || isOptimizing}
        className="w-full p-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg font-bold disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isOptimizing ? (
          <>
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            Optimizing Flow...
          </>
        ) : (
          <>
            <Zap size={20} />
            Optimize Animation Flow
          </>
        )}
      </button>
    </div>
  )
}

const AIResultsPanel = ({
  result,
  onApplySuggestions,
}: {
  result: ContentAnalysis | null
  onApplySuggestions: (analysis: ContentAnalysis) => void
}) => {
  if (!result) return null

  return (
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
      <h4 className="text-yellow-400 font-bold mb-2">🤖 Claude Analysis</h4>

      <div className="space-y-2 text-sm">
        <div>
          <span className="text-gray-400">Title:</span>
          <span className="text-white ml-2">{result.title}</span>
        </div>

        <div>
          <span className="text-gray-400">Structure:</span>
          <span className="text-blue-400 ml-2">{result.suggestedStructure}</span>
        </div>

        <div>
          <span className="text-gray-400">Key Concepts:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {result.keyConcepts.map((concept, i) => (
              <span key={i} className="px-2 py-1 bg-purple-600 text-white rounded text-xs">
                {concept}
              </span>
            ))}
          </div>
        </div>

        <div>
          <span className="text-gray-400">Main Ideas:</span>
          <ul className="mt-1 space-y-1">
            {result.mainIdeas.map((idea, i) => (
              <li key={i} className="text-white text-xs">
                • {idea}
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={() => onApplySuggestions(result)}
          className="w-full mt-3 p-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          ✅ Apply AI Suggestions
        </button>
      </div>
    </div>
  )
}

const ErrorHandler = ({
  error,
  onRetry,
}: {
  error: Error | null
  onRetry: () => void
}) => {
  if (!error) return null

  return (
    <div className="bg-red-900 border border-red-600 p-3 rounded-lg">
      <h4 className="text-red-400 font-bold">⚠️ AI Error</h4>
      <p className="text-red-200 text-sm mt-1">{error.message}</p>
      <button onClick={onRetry} className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">
        Retry
      </button>
    </div>
  )
}

export default function AnimationCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  // Reemplazar las referencias existentes con:
  const [currentScene, setCurrentScene] = useState(0)
  const [isPlayingScene, setIsPlayingScene] = useState(false)
  const [sceneProgress, setSceneProgress] = useState(0)
  const sceneManagerRef = useRef<SceneManager | null>(null)
  const sceneStartTimeRef = useRef(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  // Timeline controls state
  const [timelineControls, setTimelineControls] = useState<TimelineControls>({
    totalDuration: 4.5,
    currentTime: 0,
    playSpeed: 1,
    isPlaying: false,
  })
  const timelineControllerRef = useRef(new TimelineController())

  // AI state
  const [isAIConnected, setIsAIConnected] = useState(false)
  const [aiAnalysisResult, setAiAnalysisResult] = useState<ContentAnalysis | null>(null)
  const [aiError, setAiError] = useState<Error | null>(null)

  // Editor state
  const [editorText, setEditorText] = useState("")
  const [fontSize, setFontSize] = useState(32)
  const [fontColor, setFontColor] = useState("#FFFFFF")
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right">("center")
  const [selectedTemplate, setSelectedTemplate] = useState("Presentation")
  const [customScene, setCustomScene] = useState<Scene | null>(null)

  // Referencias para las animaciones
  const animatedTextRef = useRef<AnimatedText | null>(null)
  const animatedCircleRef = useRef<AnimatedCircle | null>(null)
  const animatedLineRef = useRef<AnimatedLine | null>(null)
  const startTimeRef = useRef(0)

  // Configuración de timing (en milisegundos)
  const ANIMATION_CONFIG = {
    textDuration: 2000, // 2 segundos
    circleDuration: 1500, // 1.5 segundos
    lineDuration: 1000, // 1 segundo
    totalDuration: 4500, // 4.5 segundos total
  }

  const initializeAnimations = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Configurar canvas
    canvas.width = 1200
    canvas.height = 800

    // Inicializar objetos animados (mantener código original)
    animatedTextRef.current = new AnimatedText("HELLO WORLD", 600, 200, 48, COLORS.yellow, ctx)
    animatedCircleRef.current = new AnimatedCircle(600, 400, 80, COLORS.blue, ctx, "CIRCLE")
    animatedLineRef.current = new AnimatedLine(200, 600, 1000, 600, COLORS.red, ctx)

    // Inicializar SceneManager
    sceneManagerRef.current = new SceneManager(ctx)
  }, [])

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Limpiar con degradado
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, "#0D1B2A")
    gradient.addColorStop(1, "#1B263B")
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }, [])

  const animate = useCallback(
    (currentTime: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = currentTime
      }

      const elapsed = (currentTime - startTimeRef.current) * timelineControls.playSpeed
      const totalProgress = Math.min(elapsed / ANIMATION_CONFIG.totalDuration, 1)

      // Limpiar canvas
      clearCanvas()

      // Calcular progreso de cada animación
      let textProgress = 0
      let circleProgress = 0
      let lineProgress = 0

      if (elapsed <= ANIMATION_CONFIG.textDuration) {
        // Fase 1: Solo texto (0-2s)
        textProgress = elapsed / ANIMATION_CONFIG.textDuration
      } else if (elapsed <= ANIMATION_CONFIG.textDuration + ANIMATION_CONFIG.circleDuration) {
        // Fase 2: Texto completo + círculo (2-3.5s)
        textProgress = 1
        circleProgress = (elapsed - ANIMATION_CONFIG.textDuration) / ANIMATION_CONFIG.circleDuration
      } else if (elapsed <= ANIMATION_CONFIG.totalDuration) {
        // Fase 3: Todo + línea (3.5-4.5s)
        textProgress = 1
        circleProgress = 1
        lineProgress =
          (elapsed - ANIMATION_CONFIG.textDuration - ANIMATION_CONFIG.circleDuration) / ANIMATION_CONFIG.lineDuration
      } else {
        // Animación completa
        textProgress = 1
        circleProgress = 1
        lineProgress = 1
      }

      // Dibujar animaciones
      if (animatedTextRef.current) {
        animatedTextRef.current.drawProgressive(textProgress)
      }

      if (animatedCircleRef.current) {
        if (circleProgress > 0) {
          animatedCircleRef.current.drawProgressive(circleProgress)
        }
      }

      if (animatedLineRef.current) {
        if (lineProgress > 0) {
          animatedLineRef.current.drawProgressive(lineProgress)
        }
      }

      // Actualizar progress bar y timeline
      setProgress(Math.round(totalProgress * 100))
      setTimelineControls((prev) => ({
        ...prev,
        currentTime: elapsed / 1000,
      }))

      // Continuar animación o terminar
      if (totalProgress < 1 && isPlaying) {
        animationRef.current = requestAnimationFrame(animate)
      } else if (totalProgress >= 1) {
        setIsPlaying(false)
        setTimelineControls((prev) => ({ ...prev, isPlaying: false }))
      }
    },
    [isPlaying, clearCanvas, timelineControls.playSpeed],
  )

  const animateScene = useCallback(
    (currentTime: number) => {
      if (!sceneStartTimeRef.current) {
        sceneStartTimeRef.current = currentTime
      }

      const elapsed = (currentTime - sceneStartTimeRef.current) * timelineControls.playSpeed
      const scene = sceneManagerRef.current?.getScene(currentScene)

      if (!scene) return

      const totalProgress = Math.min(elapsed / scene.duration, 1)

      // Limpiar canvas
      clearCanvas()

      // Renderizar escena
      if (sceneManagerRef.current) {
        sceneManagerRef.current.renderScene(currentScene, elapsed)
      }

      // Actualizar progress bar y timeline
      setSceneProgress(Math.round(totalProgress * 100))
      setTimelineControls((prev) => ({
        ...prev,
        currentTime: elapsed / 1000,
        totalDuration: scene.duration / 1000,
      }))

      // Continuar animación o terminar
      if (totalProgress < 1 && isPlayingScene) {
        animationRef.current = requestAnimationFrame(animateScene)
      } else if (totalProgress >= 1) {
        setIsPlayingScene(false)
        setTimelineControls((prev) => ({ ...prev, isPlaying: false }))
      }
    },
    [isPlayingScene, currentScene, clearCanvas, timelineControls.playSpeed],
  )

  const processTextInput = useCallback(
    (text: string, template: string): Scene => {
      const lines = text.split("\n").filter((line) => line.trim())

      if (template === "Presentation") {
        const title = lines[0] || "Título"
        const bullets = lines.slice(1, 6) // máximo 5 bullets

        return {
          name: "Custom Presentation",
          duration: 2000 + bullets.length * 500,
          elements: [
            { type: "text", content: title, x: 600, y: 200, size: fontSize, color: fontColor },
            ...bullets.map((bullet, index) => ({
              type: "bullet" as const,
              content: `• ${bullet}`,
              x: textAlign === "center" ? 600 : textAlign === "left" ? 300 : 900,
              y: 280 + index * 40,
              size: Math.max(fontSize - 8, 16),
              color: fontColor,
              delay: 1000 + index * 500,
            })),
          ],
        }
      } else if (template === "Mind Map") {
        const center = lines[0] || "CENTRO"
        const nodes = lines.slice(1, 5) // máximo 4 nodos

        const positions = [
          { x: 450, y: 300 },
          { x: 750, y: 300 },
          { x: 450, y: 500 },
          { x: 750, y: 500 },
        ]

        return {
          name: "Custom Mind Map",
          duration: 3000,
          elements: [
            { type: "circle", x: 600, y: 400, radius: 80, color: fontColor, text: center },
            ...nodes.map((node, index) => ({
              type: "circle" as const,
              x: positions[index]?.x || 600,
              y: positions[index]?.y || 400,
              radius: 50,
              color: COLORS.blue,
              text: node.substring(0, 8),
            })),
            ...nodes.map((_, index) => ({
              type: "line" as const,
              x1: 600,
              y1: 400,
              x2: positions[index]?.x || 600,
              y2: positions[index]?.y || 400,
              color: COLORS.blue,
            })),
          ],
        }
      } else if (template === "Timeline") {
        const title = lines[0] || "TIMELINE"
        const events = lines.slice(1, 5) // máximo 4 eventos

        return {
          name: "Custom Timeline",
          duration: 2500,
          elements: [
            { type: "text", content: title, x: 600, y: 150, size: fontSize, color: fontColor },
            { type: "line", x1: 200, y1: 400, x2: 1000, y2: 400, color: "#FFFFFF" },
            ...events.flatMap((event, index) => {
              const x = 250 + index * 200
              return [
                { type: "circle" as const, x, y: 400, radius: 8, color: COLORS.yellow },
                { type: "text" as const, content: event, x, y: 350, size: 16, color: COLORS.yellow },
              ]
            }),
          ],
        }
      }

      return {
        name: "Custom Scene",
        duration: 2000,
        elements: [
          { type: "text", content: text || "Texto personalizado", x: 600, y: 400, size: fontSize, color: fontColor },
        ],
      }
    },
    [fontSize, fontColor, textAlign],
  )

  const handleGenerateAnimation = () => {
    const newScene = processTextInput(editorText, selectedTemplate)
    setCustomScene(newScene)

    // Update scene manager with custom scene
    if (sceneManagerRef.current) {
      sceneManagerRef.current.updateScene(0, newScene)
    }

    // Switch to scene 1 and reset
    setCurrentScene(0)
    setIsPlayingScene(false)
    setSceneProgress(0)
    sceneStartTimeRef.current = 0
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    clearCanvas()
  }

  // AI Integration Functions
  const applyAIsuggestions = (analysis: ContentAnalysis) => {
    // Update editor content
    const newContent = `${analysis.title}\n${analysis.mainIdeas.join("\n")}`
    setEditorText(newContent)

    // Select suggested template
    const templateMap: Record<string, string> = {
      presentation: "Presentation",
      mindmap: "Mind Map",
      timeline: "Timeline",
    }
    setSelectedTemplate(templateMap[analysis.suggestedStructure] || "Presentation")

    // Generate custom scene
    generateCustomScene(analysis)
  }

  const generateCustomScene = (analysis: ContentAnalysis) => {
    const newScene: Scene = {
      name: "AI Generated Scene",
      duration: 3000 + analysis.mainIdeas.length * 500,
      elements: [
        {
          type: "text",
          content: analysis.title,
          x: 600,
          y: 150,
          size: 48,
          color: "#58C4DD",
        },
        ...analysis.mainIdeas.map((idea, index) => ({
          type: "bullet" as const,
          content: `• ${idea}`,
          x: 600,
          y: 250 + index * 40,
          size: 24,
          color: "#FFFFFF",
          delay: 1000 + index * 500,
        })),
      ],
    }

    // Update scene manager
    if (sceneManagerRef.current) {
      sceneManagerRef.current.updateScene(0, newScene)
    }

    // Switch to the updated scene
    setCurrentScene(0)
    setCustomScene(newScene)
  }

  // Timeline control handlers
  const handleTimelinePlay = () => {
    if (isPlayingScene) {
      setIsPlayingScene(!isPlayingScene)
      setTimelineControls((prev) => ({ ...prev, isPlaying: !prev.isPlaying }))
    } else {
      setIsPlaying(!isPlaying)
      setTimelineControls((prev) => ({ ...prev, isPlaying: !prev.isPlaying }))
    }
  }

  const handleTimelineStop = () => {
    setIsPlaying(false)
    setIsPlayingScene(false)
    setProgress(0)
    setSceneProgress(0)
    startTimeRef.current = 0
    sceneStartTimeRef.current = 0
    setTimelineControls((prev) => ({ ...prev, isPlaying: false, currentTime: 0 }))
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    clearCanvas()
  }

  const handleTimelineJump = (percentage: number) => {
    const scene = sceneManagerRef.current?.getScene(currentScene)
    const duration = isPlayingScene ? scene?.duration || 4500 : ANIMATION_CONFIG.totalDuration
    const targetTime = (percentage / 100) * duration

    if (isPlayingScene) {
      sceneStartTimeRef.current = performance.now() - targetTime / timelineControls.playSpeed
      setSceneProgress(percentage)
    } else {
      startTimeRef.current = performance.now() - targetTime / timelineControls.playSpeed
      setProgress(percentage)
    }

    setTimelineControls((prev) => ({ ...prev, currentTime: targetTime / 1000 }))
  }

  const handleSpeedChange = (speed: 0.5 | 1 | 1.5 | 2) => {
    setTimelineControls((prev) => ({ ...prev, playSpeed: speed }))
    timelineControllerRef.current.setPlaybackSpeed(speed)
  }

  const handleStepFrame = (direction: "forward" | "backward") => {
    const stepSize = 0.1 // 0.1 seconds
    const scene = sceneManagerRef.current?.getScene(currentScene)
    const duration = isPlayingScene ? scene?.duration || 4500 : ANIMATION_CONFIG.totalDuration
    const currentTimeMs = timelineControls.currentTime * 1000
    const newTimeMs = Math.max(
      0,
      Math.min(duration, currentTimeMs + (direction === "forward" ? stepSize * 1000 : -stepSize * 1000)),
    )

    const percentage = (newTimeMs / duration) * 100
    handleTimelineJump(percentage)
  }

  useEffect(() => {
    initializeAnimations()
    clearCanvas()
  }, [initializeAnimations, clearCanvas])

  useEffect(() => {
    if (isPlaying) {
      startTimeRef.current = 0
      animationRef.current = requestAnimationFrame(animate)
    } else if (isPlayingScene) {
      sceneStartTimeRef.current = 0
      animationRef.current = requestAnimationFrame(animateScene)
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying, isPlayingScene, animate, animateScene])

  const handlePlayAnimation = () => {
    if (!isPlaying) {
      setProgress(0)
      startTimeRef.current = 0
    }
    setIsPlaying(!isPlaying)
  }

  const handleReset = () => {
    setIsPlaying(false)
    setProgress(0)
    startTimeRef.current = 0
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    clearCanvas()
  }

  const handlePlayScene = () => {
    if (!isPlayingScene) {
      setSceneProgress(0)
      sceneStartTimeRef.current = 0
      setIsPlaying(false) // Detener animación original si está corriendo
    }
    setIsPlayingScene(!isPlayingScene)
  }

  const handleSceneSelect = (sceneIndex: number) => {
    setCurrentScene(sceneIndex)
    setIsPlayingScene(false)
    setSceneProgress(0)
    sceneStartTimeRef.current = 0
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    clearCanvas()

    // Update timeline duration
    const scene = sceneManagerRef.current?.getScene(sceneIndex)
    if (scene) {
      setTimelineControls((prev) => ({
        ...prev,
        totalDuration: scene.duration / 1000,
        currentTime: 0,
      }))
    }
  }

  const handlePreviousScene = () => {
    const newScene = currentScene > 0 ? currentScene - 1 : 2
    handleSceneSelect(newScene)
  }

  const handleNextScene = () => {
    const newScene = currentScene < 2 ? currentScene + 1 : 0
    handleSceneSelect(newScene)
  }

  // Get current scene markers for timeline
  const currentMarkers = sceneManagerRef.current?.getElementMarkers(currentScene) || []

  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      {/* AI Panel Superior */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* API Configuration */}
            <ApiConfigPanel onConnectionChange={setIsAIConnected} />

            {/* AI Controls */}
            <AIControls
              isConnected={isAIConnected}
              editorText={editorText}
              onAnalysisResult={setAiAnalysisResult}
              onVisualDesign={(design) => console.log("Visual design:", design)}
              onOptimizedFlow={(flow) => console.log("Optimized flow:", flow)}
            />

            {/* AI Results */}
            <AIResultsPanel result={aiAnalysisResult} onApplySuggestions={applyAIsuggestions} />
          </div>

          {/* Error Handler */}
          <ErrorHandler error={aiError} onRetry={() => setAiError(null)} />
        </div>
      </div>

      <div className="flex flex-1">
        {/* Editor Sidebar */}
        <div className="w-80 bg-gray-800 border-r border-gray-700 p-6 overflow-y-auto">
          <h2 className="text-2xl font-bold text-white mb-6 font-mono">Content Editor</h2>

          {/* Text Input Area */}
          <div className="mb-6">
            <label className="block text-white font-mono text-sm mb-2">Text Content</label>
            <textarea
              value={editorText}
              onChange={(e) => setEditorText(e.target.value)}
              placeholder="Ingresa tu texto aquí..."
              maxLength={500}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg p-3 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ minHeight: "120px", maxHeight: "200px" }}
              rows={6}
            />
            <div className="text-gray-400 text-xs mt-1 font-mono">{editorText.length}/500 characters</div>
          </div>

          {/* Style Controls */}
          <div className="mb-6">
            <label className="block text-white font-mono text-sm mb-3">Style Controls</label>

            {/* Font Size Slider */}
            <div className="mb-4">
              <div className="flex justify-between text-white font-mono text-xs mb-2">
                <span>Font Size</span>
                <span>{fontSize}px</span>
              </div>
              <input
                type="range"
                min="16"
                max="72"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>

            {/* Color Buttons */}
            <div className="mb-4">
              <div className="text-white font-mono text-xs mb-2">Font Color</div>
              <div className="flex gap-2">
                {["#FFFFFF", "#58C4DD", "#FF6B6B", "#51CF66", "#FFFF00"].map((color) => (
                  <button
                    key={color}
                    onClick={() => setFontColor(color)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      fontColor === color ? "border-white scale-110" : "border-gray-600 hover:border-gray-400"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Text Alignment */}
            <div className="mb-4">
              <div className="text-white font-mono text-xs mb-2">Text Alignment</div>
              <div className="flex gap-2">
                {[
                  { value: "left", icon: AlignLeft },
                  { value: "center", icon: AlignCenter },
                  { value: "right", icon: AlignRight },
                ].map(({ value, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setTextAlign(value as any)}
                    className={`p-2 rounded-lg border transition-colors ${
                      textAlign === value
                        ? "bg-blue-600 border-blue-500 text-white"
                        : "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    <Icon size={16} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Template Selector */}
          <div className="mb-6">
            <label className="block text-white font-mono text-sm mb-3">Template</label>
            <div className="space-y-2">
              {["Presentation", "Mind Map", "Timeline"].map((template) => (
                <button
                  key={template}
                  onClick={() => setSelectedTemplate(template)}
                  className={`w-full p-3 rounded-lg border text-left transition-colors font-mono ${
                    selectedTemplate === template
                      ? "bg-blue-600 border-blue-500 text-white"
                      : "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  <div className="font-semibold">{template}</div>
                  <div className="text-xs opacity-75">
                    {template === "Presentation" && "Title + bullet points"}
                    {template === "Mind Map" && "Central concept + nodes"}
                    {template === "Timeline" && "Chronological events"}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerateAnimation}
            disabled={!editorText.trim()}
            className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors font-mono font-semibold"
          >
            Generate Animation
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col items-center gap-6 p-6">
          {/* Existing controls and content */}
          {/* Controles Originales */}
          <div className="flex gap-4 items-center">
            <button
              onClick={handlePlayAnimation}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-mono text-lg font-semibold"
            >
              {isPlaying ? "Pause Animation" : "Play Animation"}
            </button>

            <button
              onClick={handleReset}
              className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-mono text-lg font-semibold"
            >
              Reset
            </button>
          </div>

          {/* Separador */}
          <div className="w-full max-w-4xl h-px bg-gray-600"></div>

          {/* Controles de Escenas */}
          <div className="flex flex-col gap-4 items-center">
            <div className="text-white font-mono text-lg">
              Escena {currentScene + 1}/3: {sceneManagerRef.current?.getScene(currentScene)?.name || ""}
            </div>

            <div className="flex gap-4 items-center">
              <button
                onClick={handlePreviousScene}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-mono"
              >
                Previous
              </button>

              <div className="flex gap-2">
                {[0, 1, 2].map((sceneIndex) => (
                  <button
                    key={sceneIndex}
                    onClick={() => handleSceneSelect(sceneIndex)}
                    className={`px-4 py-2 rounded-lg font-mono transition-colors ${
                      currentScene === sceneIndex
                        ? "bg-blue-600 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    Escena {sceneIndex + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={handleNextScene}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-mono"
              >
                Next
              </button>
            </div>

            <button
              onClick={handlePlayScene}
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-mono text-lg font-semibold"
            >
              {isPlayingScene ? "Pause Scene" : "Play Scene"}
            </button>
          </div>

          {/* Progress Bar para Escenas */}
          <div className="w-full max-w-2xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white font-mono text-sm">Scene Progress</span>
              <span className="text-white font-mono text-sm">{sceneProgress}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-100 ease-out"
                style={{ width: `${sceneProgress}%` }}
              />
            </div>
          </div>

          {/* Progress Bar Original */}
          <div className="w-full max-w-2xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white font-mono text-sm">Demo Progress</span>
              <span className="text-white font-mono text-sm">{progress}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-100 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Canvas */}
          <canvas
            ref={canvasRef}
            className="border-2 border-gray-600 rounded-lg shadow-2xl"
            style={{
              fontFamily: "'JetBrains Mono', 'Courier New', monospace",
            }}
          />

          {/* Info */}
          <div className="text-white font-mono text-sm max-w-4xl text-center space-y-2">
            <p>
              <strong>Demo Original:</strong> Text (2s) → Circle (1.5s) → Line (1s) = 4.5s total
            </p>
            <p>
              <strong>Sistema de Escenas:</strong> 3 escenas predefinidas con navegación y timing específico
            </p>
            <p>
              <strong>Editor:</strong> Personaliza contenido y genera animaciones dinámicas
            </p>
            <p>
              <strong>AI Integration:</strong> Claude API para análisis inteligente de contenido
            </p>
            <p className="text-gray-400">
              Canvas: 1200x800px | 60fps | Easing: Cubic In-Out | Escena Actual: {currentScene + 1}/3
            </p>
          </div>
        </div>
      </div>

      {/* Timeline Panel */}
      <div className="h-30 bg-gray-800 border-t border-gray-700 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Timeline Header */}
          <div className="flex justify-between items-center mb-4">
            <div className="text-white font-mono text-sm">
              Timeline: {timelineControls.currentTime.toFixed(1)}s / {timelineControls.totalDuration.toFixed(1)}s
            </div>
            <div className="text-white font-mono text-sm">Speed: {timelineControls.playSpeed}x</div>
          </div>

          {/* Main Timeline Bar */}
          <div className="relative mb-4">
            <div className="w-full bg-gray-700 rounded-lg h-6 relative overflow-hidden">
              {/* Progress fill */}
              <div
                className="bg-gradient-to-r from-blue-500 to-green-500 h-full rounded-lg transition-all duration-100"
                style={{
                  width: `${isPlayingScene ? sceneProgress : progress}%`,
                }}
              />

              {/* Quarter markers */}
              {[25, 50, 75].map((percent) => (
                <div
                  key={percent}
                  className="absolute top-0 bottom-0 w-px bg-gray-400 opacity-50"
                  style={{ left: `${percent}%` }}
                />
              ))}

              {/* Element markers */}
              {currentMarkers.map((marker, index) => (
                <div
                  key={index}
                  className="absolute top-0 bottom-0 w-1 opacity-75 group"
                  style={{
                    left: `${(marker.time / timelineControls.totalDuration) * 100}%`,
                    backgroundColor: marker.color,
                  }}
                  title={`${marker.label} at ${marker.time.toFixed(1)}s`}
                >
                  <div className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {marker.label} at {marker.time.toFixed(1)}s
                  </div>
                </div>
              ))}

              {/* Clickable overlay */}
              <div
                className="absolute inset-0 cursor-pointer"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const percentage = ((e.clientX - rect.left) / rect.width) * 100
                  handleTimelineJump(percentage)
                }}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-between items-center">
            {/* Playback Controls */}
            <div className="flex gap-2">
              <button
                onClick={handleTimelinePlay}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {timelineControls.isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </button>

              <button
                onClick={handleTimelineStop}
                className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Square size={20} />
              </button>

              <button
                onClick={() => handleStepFrame("backward")}
                className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <SkipBack size={20} />
              </button>

              <button
                onClick={() => handleStepFrame("forward")}
                className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <SkipForward size={20} />
              </button>
            </div>

            {/* Speed Controls */}
            <div className="flex gap-2">
              {([0.5, 1, 1.5, 2] as const).map((speed) => (
                <button
                  key={speed}
                  onClick={() => handleSpeedChange(speed)}
                  className={`px-3 py-2 rounded-lg font-mono text-sm transition-colors ${
                    timelineControls.playSpeed === speed
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
