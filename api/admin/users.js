import { getDb } from '../_db.js'
import { requireAdmin } from '../_admin-auth.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()
  if (!(await requireAdmin(req, res))) return

  const sql = getDb()
  const users = await sql`
    SELECT username, email, lock_message, created_at
    FROM users ORDER BY created_at DESC
  `
  return res.json({ users })
}
