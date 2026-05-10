import { randomBytes } from 'crypto'
import { getDb } from '../_db.js'
import { requireAdmin } from '../_admin-auth.js'
import { resend, FROM, APP_URL, cyberpunkEmail } from '../_email.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  if (!(await requireAdmin(req, res))) return

  const { username } = req.body || {}
  if (!username) return res.status(400).json({ error: 'USERNAME REQUIRED' })

  const sql = getDb()
  const rows = await sql`
    SELECT email FROM users
    WHERE username = ${username.toLowerCase()} AND status = 'active'
  `
  if (!rows.length) return res.status(404).json({ error: 'ACTIVE USER NOT FOUND' })

  const { email } = rows[0]
  const token   = randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours for admin-initiated

  await sql`
    INSERT INTO password_resets (username, email, token, expires_at)
    VALUES (${username.toLowerCase()}, ${email}, ${token}, ${expires})
  `

  const resetUrl = `${APP_URL}?reset=${token}`

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'SicVault — Password Reset (Admin)',
    html: cyberpunkEmail('ADMIN PASSWORD RESET', `
      <p style="font-size:11px;color:#90A955;letter-spacing:1px;">
        An administrator has initiated a password reset for your account.
      </p>
      <a href="${resetUrl}" style="display:inline-block;margin-top:16px;padding:12px 24px;
        background:#31572C;color:#ECF39E;text-decoration:none;letter-spacing:2px;
        font-size:10px;border:1px solid #90A955;">
        ▶ RESET PASSWORD
      </a>
      <p style="font-size:9px;color:#4F772D;margin-top:20px;letter-spacing:1px;">
        LINK EXPIRES IN 24 HOURS
      </p>
    `),
  })

  return res.json({ ok: true })
}
