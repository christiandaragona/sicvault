import { getDb } from './_db.js'
import { resend, FROM, cyberpunkEmail } from './_email.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { username } = req.body || {}
  if (!username) return res.status(400).json({ error: 'USERNAME REQUIRED' })

  const sql = getDb()
  const rows = await sql`
    SELECT email FROM users
    WHERE username = ${username.trim().toLowerCase()} AND status = 'active'
  `
  if (!rows.length) return res.status(404).json({ error: 'USER NOT FOUND' })

  const { email } = rows[0]
  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  const expires = new Date(Date.now() + 10 * 60 * 1000) // 10 min

  await sql`DELETE FROM email_otps WHERE email = ${email}`
  await sql`INSERT INTO email_otps (email, otp, expires_at) VALUES (${email}, ${otp}, ${expires})`

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'SicVault — Login Verification Code',
    html: cyberpunkEmail('LOGIN VERIFICATION', `
      <p style="font-size:11px;color:#90A955;letter-spacing:1px;">Your one-time login code:</p>
      <div style="font-size:36px;letter-spacing:10px;color:#ECF39E;margin:20px 0;padding:16px;
        background:#132A13;border:1px solid #90A955;text-align:center;
        text-shadow:0 0 10px rgba(236,243,158,0.6);">
        ${otp}
      </div>
      <p style="font-size:9px;color:#4F772D;letter-spacing:1.5px;">
        EXPIRES IN 10 MINUTES · DO NOT SHARE THIS CODE
      </p>
    `),
  })

  return res.json({ ok: true })
}
