const ITERATIONS = 100000

export async function generateSalt() {
  return crypto.getRandomValues(new Uint8Array(16))
}

export async function deriveKey(password, salt) {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

export async function encryptVault(key, data) {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(JSON.stringify(data))
  )
  return { iv, ciphertext: new Uint8Array(ciphertext) }
}

export async function decryptVault(key, iv, ciphertext) {
  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  )
  return JSON.parse(new TextDecoder().decode(plaintext))
}

function toB64(bytes) {
  return btoa(String.fromCharCode(...bytes))
}

function fromB64(str) {
  return new Uint8Array(atob(str).split('').map(c => c.charCodeAt(0)))
}

function vaultKey(username) {
  return `sicvault_v1_${username.trim().toLowerCase()}`
}

export function saveVaultToStorage(username, salt, iv, ciphertext) {
  localStorage.setItem(vaultKey(username), JSON.stringify({
    s: toB64(salt),
    i: toB64(iv),
    c: toB64(ciphertext),
  }))
}

export function loadVaultFromStorage(username) {
  const raw = localStorage.getItem(vaultKey(username))
  if (!raw) return null
  try {
    const { s, i, c } = JSON.parse(raw)
    return { salt: fromB64(s), iv: fromB64(i), ciphertext: fromB64(c) }
  } catch {
    return null
  }
}

export function vaultExistsForUser(username) {
  return !!localStorage.getItem(vaultKey(username))
}

export function nukeVault(username) {
  localStorage.removeItem(vaultKey(username))
}
