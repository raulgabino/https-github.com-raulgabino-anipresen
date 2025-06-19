"use server"

export async function generateAnimation(prompt: string) {
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.CLAUDE_API_KEY!, // Remove NEXT_PUBLIC_ prefix
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-sonnet-20240229",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: `Generate a creative animation description for: ${prompt}. Include specific movements, colors, and timing details that could be used to create a visual animation.`,
          },
        ],
      }),
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }

    const data = await response.json()
    return {
      success: true,
      content: data.content[0].text,
    }
  } catch (error) {
    console.error("Error calling Claude API:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}
