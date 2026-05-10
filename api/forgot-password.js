import { randomBytes } from 'crypto'
import { getDb } from './_db.js'
import { resend, FROM, APP_URL, cyberpunkEmail } from './_email.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { email } = req.body || {}
  if (!email) return res.status(400).json({ error: 'EMAIL REQUIRED' })

  const sql = getDb()
  const rows = await sql`
    SELECT username FROM users
    WHERE email = ${email.trim().toLowerCase()} AND status = 'active'
  `
  // Always return ok to prevent email enumeration
  if (!rows.length) return res.json({ ok: true })

  const { username } = rows[0]
  const token   = randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

  await sql`
    INSERT INTO password_resets (username, email, token, expires_at)
    VALUES (${username}, ${email.trim().toLowerCase()}, ${token}, ${expires})
  `

  const resetUrl = `${APP_URL}?reset=${token}`

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'SicVault — Password Reset',
    html: cyberpunkEmail('PASSWORD RESET', `
      <p style="font-size:11px;color:#90A955;letter-spacing:1px;">
        A reset was requested for account: <strong style="color:#ECF39E;">${username}</strong>
      </p>
      <a href="${resetUrl}" style="display:inline-block;margin-top:16px;padding:12px 24px;
        background:#31572C;color:#ECF39E;text-decoration:none;letter-spacing:2px;
        font-size:10px;border:1px solid #90A955;">
        ▶ RESET PASSWORD
      </a>
      <p style="font-size:9px;color:#4F772D;margin-top:20px;letter-spacing:1px;">
        LINK EXPIRES IN 1 HOUR · IF YOU DID NOT REQUEST THIS, IGNORE THIS EMAIL
      </p>
      <p style="font-size:9px;color:#4F772D;">
        NOTE: RESETTING YOUR PASSWORD WILL CREATE A NEW EMPTY VAULT.
        YOUR ENCRYPTED DATA CANNOT BE RECOVERED WITHOUT YOUR OLD PASSWORD.
      </p>
    `),
  })

  return res.json({ ok: true })
}
