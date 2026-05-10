import { getDb } from './_db.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { username, email, emailTwoFa = false } = req.body || {}

  if (!username || !email)
    return res.status(400).json({ error: 'USERNAME AND EMAIL REQUIRED' })
  if (!/^[a-zA-Z0-9_-]{2,30}$/.test(username))
    return res.status(400).json({ error: 'USERNAME: 2-30 CHARS, LETTERS/NUMBERS/_ ONLY' })
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ error: 'INVALID EMAIL FORMAT' })

  const sql = getDb()
  try {
    await sql`
      INSERT INTO users (username, email, email_2fa_enabled)
      VALUES (${username.toLowerCase()}, ${email.toLowerCase()}, ${!!emailTwoFa})
    `
    return res.status(201).json({ ok: true })
  } catch (e) {
    if (e.message.includes('unique') || e.code === '23505') {
      if (e.detail?.includes('username') || e.message.includes('username'))
        return res.status(409).json({ error: 'USERNAME ALREADY TAKEN' })
      return res.status(409).json({ error: 'EMAIL ALREADY REGISTERED' })
    }
    console.error('register:', e)
    return res.status(500).json({ error: 'REGISTRATION FAILED' })
  }
}
