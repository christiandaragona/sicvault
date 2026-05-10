import { getDb } from './_db.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { username } = req.body || {}
  if (!username) return res.status(400).json({ error: 'USERNAME REQUIRED' })

  const sql = getDb()
  const rows = await sql`
    SELECT email_2fa_enabled, lock_message FROM users
    WHERE username = ${username.trim().toLowerCase()}
  `
  if (!rows.length)
    return res.status(404).json({ error: 'NO ACCOUNT FOUND FOR THIS USERNAME' })

  const { email_2fa_enabled, lock_message } = rows[0]
  if (lock_message)
    return res.status(403).json({ error: lock_message })

  return res.json({ ok: true, emailTwoFa: email_2fa_enabled })
}
