import { getDb } from './_db.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { token } = req.body || {}
  if (!token) return res.status(400).json({ error: 'TOKEN REQUIRED' })

  const sql = getDb()
  const rows = await sql`
    SELECT username, email, expires_at, used FROM password_resets
    WHERE token = ${token} ORDER BY created_at DESC LIMIT 1
  `
  if (!rows.length) return res.status(404).json({ error: 'INVALID RESET LINK' })

  const r = rows[0]
  if (r.used)                          return res.status(400).json({ error: 'RESET LINK ALREADY USED' })
  if (new Date(r.expires_at) < new Date()) return res.status(400).json({ error: 'RESET LINK EXPIRED' })

  return res.json({ ok: true, username: r.username, email: r.email })
}
