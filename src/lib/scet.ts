// SCET course catalog helpers
// fetchScetCatalog() is called once on first login and cached in localStorage.
// matchScetCourses() cross-references Canvas enrollment against the catalog.

export interface ScetCourse {
  name: string
  code: string             // e.g. "ENGIN 183A"
  units: number | null
  category: 'core' | 'challenge_lab' | 'special_topics' | 'decal'
  isCore: boolean          // true = required for certificate (183A, 183B)
}

export interface ScetCatalog {
  courses: ScetCourse[]
  semester: string         // e.g. "Spring 2026"
  certificateNote: string
  fetchedAt: string        // ISO timestamp
}

const CACHE_KEY = 'calbuddy_scet_catalog'
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000  // 1 week — course list doesn't change mid-semester

export async function fetchScetCatalog(): Promise<ScetCatalog> {
  // Return cached version if still fresh
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (raw) {
      const cached = JSON.parse(raw) as ScetCatalog
      if (Date.now() - new Date(cached.fetchedAt).getTime() < CACHE_TTL_MS) {
        return cached
      }
    }
  } catch {
    // corrupt cache — fall through to fetch
  }

  const res = await fetch('/api/scet-courses')
  if (!res.ok) throw new Error(`/api/scet-courses returned ${res.status}`)
  const catalog = (await res.json()) as ScetCatalog

  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(catalog))
  } catch {
    // storage quota exceeded — fine, just won't cache
  }

  return catalog
}

/**
 * Given a list of Canvas course objects (name + course_code), returns those
 * that look like SCET courses by matching against known ENGIN 183/283 patterns.
 * Used after Canvas sync to auto-detect and validate the user's selections.
 */
export function matchScetCourses(
  canvasCourses: Array<{ name: string; course_code: string }>,
  catalog: ScetCatalog,
): Array<{ canvasName: string; matchedCode: string }> {
  const results: Array<{ canvasName: string; matchedCode: string }> = []

  for (const course of canvasCourses) {
    const combined = `${course.name} ${course.course_code}`.toUpperCase()

    // Direct code match
    const catalogMatch = catalog.courses.find(c =>
      combined.includes(c.code.replace('ENGIN ', ''))
    )
    if (catalogMatch) {
      results.push({ canvasName: course.name, matchedCode: catalogMatch.code })
      continue
    }

    // Fallback: any ENGIN 183/283 code in the course code field
    if (/ENGIN\s+C?(?:183|283)/i.test(course.course_code)) {
      results.push({ canvasName: course.name, matchedCode: course.course_code })
    }
  }

  return results
}

export function clearScetCache() {
  localStorage.removeItem(CACHE_KEY)
}
