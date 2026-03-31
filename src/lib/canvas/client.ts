// Canvas REST API v1 client
// Used server-side only (Vercel API routes) — never import from frontend code.

export interface CanvasCourse {
  id: number
  name: string
  course_code: string
  enrollment_term_id: number
  start_at: string | null
  end_at: string | null
}

export interface CanvasAssignment {
  id: number
  course_id: number
  name: string
  description: string | null
  due_at: string | null
  unlock_at: string | null
  lock_at: string | null
  points_possible: number
  submission_types: string[]
  html_url: string
}

interface CanvasClientConfig {
  baseUrl: string
  accessToken: string
}

class CanvasClient {
  private config: CanvasClientConfig

  constructor(config: CanvasClientConfig) {
    this.config = config
  }

  private async get<T>(path: string): Promise<T> {
    const url = `${this.config.baseUrl}/api/v1${path}`
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${this.config.accessToken}` },
    })
    if (!res.ok) throw new Error(`Canvas API error ${res.status} on ${path}`)
    return res.json() as Promise<T>
  }

  // Follows Link: rel="next" pagination headers to fetch all pages
  private async getAll<T>(path: string, perPage = 50): Promise<T[]> {
    const results: T[] = []
    let url: string | null = `${this.config.baseUrl}/api/v1${path}?per_page=${perPage}`

    while (url) {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${this.config.accessToken}` },
      })
      if (!res.ok) throw new Error(`Canvas API error ${res.status} on ${url}`)
      const page = (await res.json()) as T[]
      results.push(...page)

      const link = res.headers.get('Link') ?? ''
      const next = link.match(/<([^>]+)>;\s*rel="next"/)
      url = next ? next[1] : null
    }

    return results
  }

  getCourses(): Promise<CanvasCourse[]> {
    return this.getAll<CanvasCourse>('/courses?enrollment_type=student&enrollment_state=active')
  }

  getAssignments(courseId: number): Promise<CanvasAssignment[]> {
    return this.getAll<CanvasAssignment>(`/courses/${courseId}/assignments`)
  }

  getAssignment(courseId: number, assignmentId: number): Promise<CanvasAssignment> {
    return this.get<CanvasAssignment>(`/courses/${courseId}/assignments/${assignmentId}`)
  }
}

export function createCanvasClient(overrides?: Partial<CanvasClientConfig>): CanvasClient {
  const baseUrl = overrides?.baseUrl ?? process.env.CANVAS_BASE_URL
  const accessToken = overrides?.accessToken ?? process.env.CANVAS_ACCESS_TOKEN

  if (!baseUrl) throw new Error('CANVAS_BASE_URL is not set')
  if (!accessToken) throw new Error('CANVAS_ACCESS_TOKEN is not set')

  return new CanvasClient({ baseUrl, accessToken })
}
