import { getDb } from '../_db.js'
import { requireAdmin } from '../_admin-auth.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  if (!(await requireAdmin(req, res))) return

  const { username } = req.body || {}
  if (!username) return res.status(400).json({ error: 'USERNAME REQUIRED' })

  const sql = getDb()
  const rows = await sql`
    UPDATE users SET status = 'terminated'
    WHERE username = ${username.toLowerCase()} AND status = 'active'
    RETURNING id
  `
  if (!rows.length) return res.status(404).json({ error: 'ACTIVE USER NOT FOUND' })

  return res.json({ ok: true })
}
