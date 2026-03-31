// GET /api/scet-courses
// Server-side proxy that fetches and parses https://scet.berkeley.edu/students/courses/
// Needed to avoid CORS — the client calls this endpoint, not the SCET site directly.

import type { VercelRequest, VercelResponse } from '@vercel/node'
import type { ScetCourse, ScetCatalog } from '../src/lib/scet.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).end()

  // 1-hour CDN cache so repeat visitors don't hammer SCET's server
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')

  try {
    const catalog = await fetchAndParse()
    return res.status(200).json(catalog)
  } catch (err) {
    console.error('[scet-courses] fetch failed, returning fallback', err)
    return res.status(200).json(buildFallback())
  }
}

async function fetchAndParse(): Promise<ScetCatalog> {
  const response = await fetch('https://scet.berkeley.edu/students/courses/', {
    headers: { 'User-Agent': 'CalBuddy/1.0 (UC Berkeley SCET student app)' },
    signal: AbortSignal.timeout(8000),
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)

  const html = await response.text()
  return parseHtml(html)
}

function parseHtml(html: string): ScetCatalog {
  // Strip tags → plain text, normalize whitespace
  const text = html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#\d+;/g, ' ')
    .replace(/&[a-z]+;/g, ' ')
    .replace(/[ \t]+/g, ' ')

  const lines = text.split(/[\n\r]/).map(l => l.trim()).filter(Boolean)

  const courses: ScetCourse[] = []
  const seen = new Set<string>()

  // Track current section category as we scan downward
  let currentCategory: ScetCourse['category'] = 'special_topics'

  const CORE_CODES = new Set(['183A', '183B', '283A', '283B'])

  for (const line of lines) {
    // Update category based on section header keywords
    const lower = line.toLowerCase()
    if (lower.includes('core course') || lower.includes('required')) {
      currentCategory = 'core'
    } else if (lower.includes('challenge lab')) {
      currentCategory = 'challenge_lab'
    } else if (lower.includes('decal') || lower.includes('student-run')) {
      currentCategory = 'decal'
    } else if (lower.includes('special topic') || lower.includes('elective')) {
      currentCategory = 'special_topics'
    }

    // Find course code pattern in this line
    const codeMatch = line.match(
      /(?:ENGIN|ENGIN\s+C|Engineering)\s+(?:C?)(\d+[A-Z]?)(?:\/(?:POL\s+SCI|283)[^,|\s]*)?(?:-\d+)?/i
    )
    if (!codeMatch) continue

    // Only care about SCET's 183/283 range
    const numPart = codeMatch[1].replace(/[^0-9]/g, '')
    const num = parseInt(numPart)
    if (num < 183 || num > 283) continue

    const rawCode = codeMatch[0].replace(/\s+/g, ' ').trim().toUpperCase()
    if (seen.has(rawCode)) continue
    seen.add(rawCode)

    // Extract name: the text that comes BEFORE the code on this line
    const codeIdx = line.indexOf(codeMatch[0])
    const namePart = line.slice(0, codeIdx).replace(/[|:,•]+$/, '').trim()
    const name = namePart.length > 4 ? namePart : inferName(rawCode)

    // Extract units
    const unitMatch = line.match(/(\d+)\s*unit/i)
    const units = unitMatch ? parseInt(unitMatch[1]) : null

    // Core = 183A or 183B
    const codeKey = rawCode.replace(/ENGIN\s+C?/, '').split(/[\s/-]/)[0]
    const isCore = CORE_CODES.has(codeKey)
    const category = isCore ? 'core' : currentCategory

    courses.push({ name, code: rawCode, units, category, isCore })
  }

  const fallback = buildFallback()

  // Detect current semester from page text
  const semMatch = text.match(/(Fall|Spring|Summer)\s+20\d{2}/i)
  const semester = semMatch ? semMatch[0] : fallback.semester

  // Extract certificate note if present
  const certMatch = text.match(/All SCET courses[^.]+\./i)
  const certificateNote = certMatch
    ? certMatch[0].trim()
    : fallback.certificateNote

  return {
    courses: courses.length >= 3 ? courses : fallback.courses,
    semester,
    certificateNote,
    fetchedAt: new Date().toISOString(),
  }
}

function inferName(code: string): string {
  const map: Record<string, string> = {
    '183A': 'A. Richard Newton Series',
    '183B': 'Berkeley Method of Entrepreneurship Bootcamp',
    '183C': 'Berkeley Challenge Lab',
    '183D': 'Product Management',
    '183E': 'Technology Entrepreneurship',
    '183F': 'Democracy^Tech',
    'C183F': 'Democracy^Tech',
    '183G': 'Startup Catalyst',
  }
  const key = code.replace('ENGIN ', '').split('-')[0]
  return map[key] ?? code
}

function buildFallback(): ScetCatalog {
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()
  const semester =
    month >= 8 ? `Fall ${year}` : month <= 5 ? `Spring ${year}` : `Summer ${year}`

  return {
    courses: [
      { name: 'A. Richard Newton Series', code: 'ENGIN 183A', units: 1, category: 'core', isCore: true },
      { name: 'Berkeley Method of Entrepreneurship Bootcamp', code: 'ENGIN 183B', units: 2, category: 'core', isCore: true },
      { name: 'Berkeley Challenge Lab', code: 'ENGIN 183C', units: 4, category: 'challenge_lab', isCore: false },
      { name: 'Product Management', code: 'ENGIN 183D', units: 3, category: 'special_topics', isCore: false },
      { name: 'Technology Entrepreneurship', code: 'ENGIN 183E', units: 3, category: 'special_topics', isCore: false },
      { name: 'Democracy^Tech', code: 'ENGIN C183F', units: 4, category: 'challenge_lab', isCore: false },
      { name: 'Startup Catalyst', code: 'ENGIN 183G', units: 3, category: 'special_topics', isCore: false },
    ],
    semester,
    certificateNote:
      'All SCET courses can be applied towards the SCET Certificate in Entrepreneurship & Technology.',
    fetchedAt: new Date().toISOString(),
  }
}
