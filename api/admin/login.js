import { signAdminToken } from '../_admin-auth.js'
import { verifyTOTP } from '../_totp.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { username, password, totpToken } = req.body || {}

  if (
    !username || !password ||
    username !== process.env.ADMIN_USERNAME ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return res.status(401).json({ error: 'INVALID CREDENTIALS' })
  }

  const adminTotpSecret = process.env.ADMIN_TOTP_SECRET
  if (adminTotpSecret) {
    if (!totpToken) return res.status(401).json({ error: 'TOTP CODE REQUIRED' })
    if (!verifyTOTP(adminTotpSecret, totpToken))
      return res.status(401).json({ error: 'INVALID TOTP CODE' })
  }

  const token = await signAdminToken()
  return res.json({ token })
}
