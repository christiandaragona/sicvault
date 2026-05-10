import { getDb } from './_db.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { username, newEmail } = req.body || {}

  if (!username || !newEmail)
    return res.status(400).json({ error: 'USERNAME AND EMAIL REQUIRED' })
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail))
    return res.status(400).json({ error: 'INVALID EMAIL FORMAT' })

  const sql = getDb()
  try {
    const rows = await sql`
      UPDATE users SET email = ${newEmail.trim().toLowerCase()}
      WHERE username = ${username.trim().toLowerCase()}
      RETURNING id
    `
    if (!rows.length) return res.status(404).json({ error: 'USER NOT FOUND' })
    return res.json({ ok: true })
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'EMAIL ALREADY IN USE' })
    return res.status(500).json({ error: 'UPDATE FAILED' })
  }
}
