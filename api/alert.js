import { getDb } from './_db.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()
  const sql = getDb()
  const rows = await sql`SELECT message FROM broadcasts ORDER BY created_at DESC LIMIT 1`
  return res.json({ message: rows[0]?.message || null })
}
