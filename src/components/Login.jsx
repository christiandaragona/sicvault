import { useState } from 'react'
import { deriveKey, decryptVault, loadVaultFromStorage } from '../lib/crypto'
import { verifyTOTP } from '../lib/totp'

export default function Login({ onLogin, theme, onToggleTheme }) {
  const [pw, setPw]               = useState('')
  const [token, setToken]         = useState('')
  const [showPw, setShowPw]       = useState(false)
  const [error, setError]         = useState('')
  const [working, setWorking]     = useState(false)
  const [unlocking, setUnlocking] = useState(false)

  async function handleAuth() {
    setError('')
    if (!pw) return setError('ENTER YOUR MASTER PASSWORD')
    setWorking(true)
    try {
      const stored = loadVaultFromStorage()
      if (!stored) throw new Error('NO VAULT FOUND')

      const key  = await deriveKey(pw, stored.salt)
      let vault
      try {
        vault = await decryptVault(key, stored.iv, stored.ciphertext)
      } catch {
        throw new Error('INCORRECT PASSWORD')
      }

      if (vault.settings?.totpEnabled) {
        if (!token || token.length < 6) {
          setError('ENTER YOUR 6-DIGIT 2FA CODE')
          setWorking(false)
          return
        }
        const ok = await verifyTOTP(vault.settings.totpSecret, token)
        if (!ok) throw new Error('INVALID 2FA CODE')
      }

      setWorking(false)
      setUnlocking(true)
      setTimeout(() => onLogin(key, vault), 1700)
    } catch (e) {
      setError(e.message)
      setWorking(false)
    }
  }

  return (
    <div className="login-screen">
      <button className="theme-toggle" onClick={onToggleTheme}
        style={{ position: 'absolute', top: 20, right: 20, zIndex: 20 }}>
        <span className="theme-icon">{theme === 'night' ? '☀' : '🌙'}</span>
        <span>{theme === 'night' ? 'DAY' : 'NIGHT'}</span>
      </button>

      <div className="login-card">
        <div className="login-logo">
          <span className="login-title">SICVAULT</span>
          <span style={{ display: 'block', fontSize: 9, letterSpacing: 5, color: 'var(--text-dim)', marginTop: 4 }}>v1.0</span>
          <div className="login-divider" />
          <span className="login-subtitle">SECURE VAULT SYSTEM</span>
        </div>

        <div className="form-group">
          <label className="form-label">MASTER PASSWORD</label>
          <div className="input-wrapper">
            <input className="input" type={showPw ? 'text' : 'password'}
              placeholder="enter master password..."
              autoComplete="current-password"
              value={pw} onChange={e => setPw(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAuth()} />
            <span className="input-icon" style={{ cursor: 'pointer', pointerEvents: 'all' }}
              onClick={() => setShowPw(v => !v)}>
              {showPw ? '🙈' : '👁'}
            </span>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">2FA CODE <span style={{ color: 'var(--text-dim)', fontWeight: 'normal' }}>(IF ENABLED)</span></label>
          <div className="input-wrapper">
            <input className="input" type="text" placeholder="000000" maxLength={6}
              style={{ letterSpacing: 6, textAlign: 'center' }}
              value={token} onChange={e => setToken(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAuth()} />
            <span className="input-icon">🔐</span>
          </div>
        </div>

        {error && (
          <div style={{ fontSize: 8, letterSpacing: 1.5, color: 'var(--danger)', marginBottom: 12 }}>
            ⚠ {error}
          </div>
        )}

        <button className="btn btn-primary login-btn" onClick={handleAuth} disabled={working || unlocking}>
          {working ? 'DECRYPTING...' : '▶ AUTHENTICATE'}
        </button>

        <div className="login-status">
          <span className="status-dot" />
          VAULT ENCRYPTED · AES-256-GCM · PBKDF2
        </div>
      </div>

      {unlocking && (
        <div className="unlock-overlay">
          <div className="unlock-lock">
            <div className="lock-shackle" />
            <div className="lock-body">
              <div className="lock-keyhole" />
            </div>
          </div>
          <div className="unlock-label">ACCESS GRANTED</div>
        </div>
      )}
    </div>
  )
}
