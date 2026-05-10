import { createHmac } from 'crypto'

function b32Decode(str) {
  const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  let bits = 0, val = 0
  const out = []
  for (const ch of str.toUpperCase().replace(/=+$/, '')) {
    const idx = B32.indexOf(ch)
    if (idx === -1) continue
    val = (val << 5) | idx
    bits += 5
    if (bits >= 8) { out.push((val >>> (bits - 8)) & 0xff); bits -= 8 }
  }
  return Buffer.from(out)
}

export function verifyTOTP(secret, token, windowSize = 1) {
  const key = b32Decode(secret)
  const counter = Math.floor(Date.now() / 1000 / 30)
  for (let w = -windowSize; w <= windowSize; w++) {
    const buf = Buffer.alloc(8)
    buf.writeUInt32BE(counter + w, 4)
    const sig = createHmac('sha1', key).update(buf).digest()
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
