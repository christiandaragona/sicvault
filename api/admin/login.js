import { signAdminToken } from '../_admin-auth.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { username, password } = req.body || {}

  if (
    !username || !password ||
    username !== process.env.ADMIN_USERNAME ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    // Intentionally vague to not leak which field is wrong
    return res.status(401).json({ error: 'INVALID CREDENTIALS' })
  }

  const token = await signAdminToken()
  return res.json({ token })
}
