import { getDb } from './_db.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { username, otp } = req.body || {}
  if (!username || !otp) return res.status(400).json({ error: 'USERNAME AND CODE REQUIRED' })

  const sql = getDb()
  const rows = await sql`
    SELECT eo.id, eo.expires_at, eo.used
    FROM email_otps eo
    JOIN users u ON u.email = eo.email
    WHERE u.username = ${username.trim().toLowerCase()} AND eo.otp = ${otp.trim()}
    ORDER BY eo.created_at DESC LIMIT 1
  `
  if (!rows.length) return res.status(400).json({ error: 'INVALID CODE' })

  const row = rows[0]
  if (row.used)                          return res.status(400).json({ error: 'CODE ALREADY USED' })
  if (new Date(row.expires_at) < new Date()) return res.status(400).json({ error: 'CODE EXPIRED' })

  await sql`UPDATE email_otps SET used = TRUE WHERE id = ${row.id}`
  return res.json({ ok: true })
}
