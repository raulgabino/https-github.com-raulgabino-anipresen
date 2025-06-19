"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Play, Pause, RotateCcw } from "lucide-react"
import { generateAnimation } from "@/lib/actions"

interface AnimationState {
  isPlaying: boolean
  currentFrame: number
  totalFrames: number
}

export default function AnimationCanvas() {
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [animationDescription, setAnimationDescription] = useState("")
  const [error, setError] = useState("")
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()

  const [animationState, setAnimationState] = useState<AnimationState>({
    isPlaying: false,
    currentFrame: 0,
    totalFrames: 120, // 2 seconds at 60fps
  })

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    setError("")

    try {
      const result = await generateAnimation(prompt)

      if (result.success) {
        setAnimationDescription(result.content)
        // Reset animation state
        setAnimationState((prev) => ({
          ...prev,
          currentFrame: 0,
          isPlaying: false,
        }))
      } else {
        setError(result.error || "Failed to generate animation")
      }
    } catch (err) {
      setError("An unexpected error occurred")
      console.error("Generation error:", err)
    } finally {
      setIsGenerating(false)
    }
  }

  const drawFrame = (frame: number) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set canvas background
    ctx.fillStyle = "#1a1a2e"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    if (!animationDescription) {
      // Default animation when no description
      ctx.fillStyle = "#4f46e5"
      const x = canvas.width / 2 + Math.sin(frame * 0.1) * 100
      const y = canvas.height / 2 + Math.cos(frame * 0.1) * 50
      ctx.beginPath()
      ctx.arc(x, y, 20, 0, Math.PI * 2)
      ctx.fill()
      return
    }

    // Create a simple visualization based on the animation description
    // This is a simplified example - in a real app, you'd parse the description more thoroughly
    const progress = frame / animationState.totalFrames

    // Animated circle that changes color and position
    const hue = (frame * 3) % 360
    ctx.fillStyle = `hsl(${hue}, 70%, 60%)`

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = 30 + Math.sin(progress * Math.PI * 4) * 10

    // Multiple animated elements
    for (let i = 0; i < 5; i++) {
      const angle = progress * Math.PI * 2 + (i * Math.PI * 2) / 5
      const x = centerX + Math.cos(angle) * (50 + i * 20)
      const y = centerY + Math.sin(angle) * (50 + i * 20)

      ctx.fillStyle = `hsl(${(hue + i * 60) % 360}, 70%, 60%)`
      ctx.beginPath()
      ctx.arc(x, y, radius - i * 3, 0, Math.PI * 2)
      ctx.fill()
    }

    // Add some text overlay
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
    ctx.font = "16px Arial"
    ctx.textAlign = "center"
    ctx.fillText(`Frame: ${frame}`, canvas.width / 2, 30)
  }

  const animate = () => {
    if (!animationState.isPlaying) return

    drawFrame(animationState.currentFrame)

    setAnimationState((prev) => ({
      ...prev,
      currentFrame: (prev.currentFrame + 1) % prev.totalFrames,
    }))

    animationRef.current = requestAnimationFrame(animate)
  }

  useEffect(() => {
    if (animationState.isPlaying) {
      animate()
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
  }, [animationState.isPlaying])

  useEffect(() => {
    // Draw initial frame
    drawFrame(animationState.currentFrame)
  }, [animationDescription, animationState.currentFrame])

  const togglePlayPause = () => {
    setAnimationState((prev) => ({
      ...prev,
      isPlaying: !prev.isPlaying,
    }))
  }

  const resetAnimation = () => {
    setAnimationState((prev) => ({
      ...prev,
      currentFrame: 0,
      isPlaying: false,
    }))
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Animation Generator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Describe the animation you want to create..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleGenerate()}
              disabled={isGenerating}
            />
            <Button onClick={handleGenerate} disabled={isGenerating || !prompt.trim()}>
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate"
              )}
            </Button>
          </div>

          {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md">{error}</div>}

          {animationDescription && (
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-semibold mb-2">Animation Description:</h3>
              <p className="text-sm text-gray-700">{animationDescription}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Animation Canvas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <canvas
            ref={canvasRef}
            width={800}
            height={400}
            className="border border-gray-300 rounded-lg w-full"
            style={{ maxWidth: "100%", height: "auto" }}
          />

          <div className="flex items-center justify-center gap-4">
            <Button onClick={togglePlayPause} variant="outline">
              {animationState.isPlaying ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Play
                </>
              )}
            </Button>

            <Button onClick={resetAnimation} variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>

            <span className="text-sm text-gray-600">
              Frame: {animationState.currentFrame} / {animationState.totalFrames}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
