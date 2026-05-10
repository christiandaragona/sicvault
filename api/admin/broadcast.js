import { getDb } from '../_db.js'
import { requireAdmin } from '../_admin-auth.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  if (!(await requireAdmin(req, res))) return

  const { message } = req.body || {}
  const sql = getDb()

  if (!message || !message.trim()) {
    await sql`DELETE FROM broadcasts`
    return res.json({ ok: true, cleared: true })
  }

  await sql`DELETE FROM broadcasts`
  await sql`INSERT INTO broadcasts (message) VALUES (${message.trim()})`
  return res.json({ ok: true })
}
