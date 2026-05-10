import { getDb } from './_db.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { token } = req.body || {}
  if (!token) return res.status(400).json({ error: 'TOKEN REQUIRED' })

  const sql = getDb()
  await sql`UPDATE password_resets SET used = TRUE WHERE token = ${token}`
  return res.json({ ok: true })
}
