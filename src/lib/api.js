async function post(path, body) {
  const r = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return r.json()
}

async function get(path, token) {
  const r = await fetch(path, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  return r.json()
}

async function authedPost(path, body, token) {
  const r = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  })
  return r.json()
}

export const registerUser     = (username, email, emailTwoFa) => post('/api/register',             { username, email, emailTwoFa })
export const checkAccount     = (username)                    => post('/api/check-account',         { username })
export const forgotPassword   = (email)                       => post('/api/forgot-password',       { email })
export const verifyResetToken = (token)                       => post('/api/verify-reset-token',    { token })
export const consumeResetToken= (token)                       => post('/api/consume-reset-token',   { token })
export const sendEmailOtp     = (username)                    => post('/api/send-email-otp',        { username })
export const verifyEmailOtp   = (username, otp)               => post('/api/verify-email-otp',      { username, otp })
export const getAlert         = ()                            => get('/api/alert')
export const adminLogin       = (username, password)          => post('/api/admin/login',            { username, password })
export const adminGetUsers    = (token)                       => get('/api/admin/users',              token)
export const adminTerminate   = (username, token)             => authedPost('/api/admin/terminate',  { username },          token)
export const adminSendReset   = (username, token)             => authedPost('/api/admin/send-reset', { username },          token)
export const adminBroadcast   = (message, token)              => authedPost('/api/admin/broadcast',  { message },           token)
export const adminLock        = (username, message, token)    => authedPost('/api/admin/lock',       { username, message }, token)
