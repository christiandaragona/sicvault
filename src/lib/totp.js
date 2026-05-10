const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

function b32Decode(str) {
  let bits = 0, val = 0
  const out = []
  for (const ch of str.toUpperCase().replace(/=+$/, '')) {
    const idx = B32.indexOf(ch)
    if (idx === -1) continue
    val = (val << 5) | idx
    bits += 5
    if (bits >= 8) { out.push((val >>> (bits - 8)) & 0xff); bits -= 8 }
  }
  return new Uint8Array(out)
}

export function generateTOTPSecret() {
  const bytes = crypto.getRandomValues(new Uint8Array(20))
  let result = '', buf = 0, bitsLeft = 0
  for (const byte of bytes) {
    buf = (buf << 8) | byte
    bitsLeft += 8
    while (bitsLeft >= 5) {
      result += B32[(buf >>> (bitsLeft - 5)) & 31]
      bitsLeft -= 5
    }
  }
  return result  // 32 chars, proper base32, no padding needed
}

export async function verifyTOTP(secret, token, windowSize = 1) {
  const key = await crypto.subtle.importKey(
    'raw', b32Decode(secret),
    { name: 'HMAC', hash: 'SHA-1' },
    false, ['sign']
  )
  const counter = Math.floor(Date.now() / 1000 / 30)
  for (let w = -windowSize; w <= windowSize; w++) {
    const buf = new ArrayBuffer(8)
    new DataView(buf).setUint32(4, counter + w, false)
    const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, buf))
    const off = sig[19] & 0xf
    const otp = (
      ((sig[off]     & 0x7f) << 24) |
      ((sig[off + 1] & 0xff) << 16) |
      ((sig[off + 2] & 0xff) << 8)  |
       (sig[off + 3] & 0xff)
    ) % 1_000_000
    if (otp.toString().padStart(6, '0') === token.trim()) return true
  }
  return false
}

export function getTOTPUri(secret, label = 'SicVault') {
  return `otpauth://totp/${encodeURIComponent(label)}?secret=${secret}&issuer=SicVault&algorithm=SHA1&digits=6&period=30`
}
