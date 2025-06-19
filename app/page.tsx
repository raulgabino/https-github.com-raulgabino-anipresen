import AnimationCanvas from "@/components/animation-canvas"

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900">
      <div className="container mx-auto py-8">
        <h1 className="text-4xl font-bold text-white text-center mb-8 font-mono">AnimationCanvas - Manim Style</h1>
        <AnimationCanvas />
      </div>
    </main>
  )
}
