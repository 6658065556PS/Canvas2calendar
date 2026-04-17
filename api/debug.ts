// GET /api/debug
// Checks env vars and connectivity — delete this file after debugging.

import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const checks: Record<string, { ok: boolean; detail: string }> = {}

  // 1. Env var presence
  const vars = [
    'CANVAS_BASE_URL',
    'SUPABASE_URL',
    'VITE_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'GROQ_API_KEY',
  ]
  for (const v of vars) {
    const val = process.env[v]
    checks[v] = val
      ? { ok: true, detail: `set (${val.slice(0, 8)}…)` }
      : { ok: false, detail: 'MISSING' }
  }

  // 2. Supabase connectivity
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (supabaseUrl && serviceKey) {
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const db = createClient(supabaseUrl, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
      const { error } = await db.from('profiles').select('id').limit(1)
      checks['supabase_query'] = error
        ? { ok: false, detail: error.message }
        : { ok: true, detail: 'profiles table reachable' }
    } catch (err) {
      checks['supabase_query'] = { ok: false, detail: String(err) }
    }
  } else {
    checks['supabase_query'] = { ok: false, detail: 'skipped — missing URL or key' }
  }

  // 3. Canvas base URL reachability
  const canvasBase = process.env.CANVAS_BASE_URL
  if (canvasBase) {
    try {
      const r = await fetch(`${canvasBase}/api/v1/courses`, {
        headers: { Authorization: 'Bearer invalid-token-probe' },
      })
      // 401 = Canvas is reachable; anything else is suspicious
      checks['canvas_reachable'] = r.status === 401
        ? { ok: true, detail: `Canvas responded 401 (reachable)` }
        : { ok: false, detail: `Canvas returned ${r.status} — unexpected` }
    } catch (err) {
      checks['canvas_reachable'] = { ok: false, detail: `Network error: ${String(err)}` }
    }
  } else {
    checks['canvas_reachable'] = { ok: false, detail: 'skipped — CANVAS_BASE_URL missing' }
  }

  const allOk = Object.values(checks).every(c => c.ok)
  return res.status(allOk ? 200 : 500).json({ allOk, checks })
}
