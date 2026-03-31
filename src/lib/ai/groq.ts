// AI enrichment pipeline — powered by Groq (free tier, Llama 3.3 70B)
// Used server-side only (Vercel API routes) — never import from frontend code.
// Get a free API key at: https://console.groq.com/keys

export interface AssignmentEnrichment {
  summary: string
  estimatedMinutes: number
  tags: string[]
}

interface EnrichmentInput {
  name: string
  description: string
  dueAt: string
  courseCode: string
}

export async function enrichAssignment(input: EnrichmentInput): Promise<AssignmentEnrichment> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error('GROQ_API_KEY is not set')

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 256,
      temperature: 0,
      messages: [{ role: 'user', content: buildPrompt(input) }],
    }),
  })

  if (!res.ok) throw new Error(`Groq API error ${res.status}`)
  const data = await res.json() as { choices: Array<{ message: { content: string } }> }
  const raw = data.choices[0]?.message?.content ?? ''
  return parseResponse(raw)
}

function buildPrompt({ name, description, dueAt, courseCode }: EnrichmentInput): string {
  const cleanDesc = stripHtml(description).slice(0, 1000)
  return `You are an academic task assistant. Given a Canvas assignment, return a JSON object with:
- "summary": one sentence plain-English summary (max 120 chars)
- "estimatedMinutes": realistic integer minutes to complete
- "tags": array of 1-3 short lowercase tags (e.g. "reading", "problem-set", "discussion")

Assignment:
Course: ${courseCode}
Name: ${name}
Due: ${dueAt}
Description: ${cleanDesc}

Respond with only valid JSON, no markdown.`
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function parseResponse(raw: string): AssignmentEnrichment {
  try {
    // Strip markdown code fences if the model adds them despite instructions
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
    const parsed = JSON.parse(cleaned) as Partial<AssignmentEnrichment>
    return {
      summary: typeof parsed.summary === 'string' ? parsed.summary : '',
      estimatedMinutes: typeof parsed.estimatedMinutes === 'number' ? parsed.estimatedMinutes : 60,
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
    }
  } catch {
    return { summary: '', estimatedMinutes: 60, tags: [] }
  }
}
