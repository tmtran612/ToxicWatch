import { type NextRequest, NextResponse } from "next/server"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { generateText } from "ai"
import { healthImpacts, sampleFacilities, sampleReleases } from "@/lib/sample-data"

// 1. Initialize the Google Generative AI provider
const google = createGoogleGenerativeAI({
  // The API key will be read from the GOOGLE_API_KEY environment variable
});

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json()

    // Build context from our TRI data
    const context = buildTRIContext(message)

    const systemPrompt = `You are a helpful AI assistant specializing in toxic chemical health impacts and EPA TRI (Toxic Release Inventory) data. 

Your role is to:
1. Explain chemical health effects in plain, accessible language
2. Provide context about toxic releases in communities
3. Compare local data to broader patterns
4. Suggest community actions (not specific medical advice)
5. Always be factual and cite when information comes from EPA TRI data

Available data context:
${context}

Guidelines:
- Use "Explain Like I'm 12" language for complex topics
- Always mention when discussing EPA TRI facilities or data
- For health effects, focus on established scientific knowledge
- Suggest community engagement but not specific medical treatments
- Be empathetic about environmental justice concerns`

    const conversationHistory = history
      .slice(-5) // Keep last 5 messages for context
      .map((msg: any) => `${msg.role}: ${msg.content}`)
      .join("\n")

    const fullPrompt = `${systemPrompt}

Recent conversation:
${conversationHistory}

User question: ${message}

Please provide a helpful, accurate response about chemical health impacts or toxic release data.`

    const { text } = await generateText({
      model: google("models/gemini-2.0-flash-001"),
      prompt: fullPrompt,
      maxTokens: 500,
    })

    return NextResponse.json({
      success: true,
      response: text,
    })
  } catch (error) {
    console.error("AI chat error:", error)
    return NextResponse.json({ success: false, error: "Failed to generate AI response" }, { status: 500 })
  }
}

function buildTRIContext(message: string): string {
  const lowerMessage = message.toLowerCase()
  let context = ""

  // Add relevant health impact data
  const relevantChemicals = healthImpacts.filter(
    (h) =>
      lowerMessage.includes(h.chemicalName.toLowerCase()) ||
      (lowerMessage.includes("cancer") && h.carcinogen) ||
      lowerMessage.includes("toxic") ||
      lowerMessage.includes("health"),
  )

  if (relevantChemicals.length > 0) {
    context += "Relevant Chemical Health Data:\n"
    relevantChemicals.forEach((chemical) => {
      context += `- ${chemical.chemicalName}: ${chemical.description}\n`
      context += `  Health Effects: ${chemical.healthEffects.join(", ")}\n`
      context += `  Carcinogen: ${chemical.carcinogen ? "Yes" : "No"}\n\n`
    })
  }

  // Add facility context if location mentioned
  if (lowerMessage.includes("richmond") || lowerMessage.includes("virginia") || lowerMessage.includes("va")) {
    context += "Local EPA TRI Facilities (Virginia):\n"
    sampleFacilities.forEach((facility) => {
      const facilityReleases = sampleReleases.filter((r) => r.facilityId === facility.id)
      const totalReleases = facilityReleases.reduce((sum, r) => sum + r.amount, 0)
      context += `- ${facility.facilityName} (${facility.city}, ${facility.state}): ${totalReleases} lbs total releases\n`
      context += `  Industry: ${facility.industry}\n`
      context += `  Top chemicals: ${facilityReleases.map((r) => r.chemicalName).join(", ")}\n\n`
    })
  }

  // Add general statistics
  const totalFacilities = sampleFacilities.length
  const totalReleases = sampleReleases.reduce((sum, r) => sum + r.amount, 0)
  const uniqueChemicals = new Set(sampleReleases.map((r) => r.chemicalName)).size

  context += `General TRI Statistics:
- Total facilities in dataset: ${totalFacilities}
- Total chemical releases: ${totalReleases.toLocaleString()} pounds
- Unique chemicals tracked: ${uniqueChemicals}
- Most common chemicals: ${Array.from(new Set(sampleReleases.map((r) => r.chemicalName))).join(", ")}`

  return context
}
