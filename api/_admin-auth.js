import { SignJWT, jwtVerify } from 'jose'

function secret() {
  if (!process.env.ADMIN_JWT_SECRET) throw new Error('ADMIN_JWT_SECRET not set')
  return new TextEncoder().encode(process.env.ADMIN_JWT_SECRET)
}

export async function signAdminToken() {
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('8h')
    .sign(secret())
}

export async function requireAdmin(req, res) {
  const auth  = req.headers['authorization'] || ''
  const token = auth.replace('Bearer ', '').trim()
  if (!token) { res.status(401).json({ error: 'UNAUTHORIZED' }); return false }
  try {
    const { payload } = await jwtVerify(token, secret())
    if (payload.role !== 'admin') throw new Error()
    return true
  } catch {
    res.status(401).json({ error: 'UNAUTHORIZED' })
    return false
  }
}
