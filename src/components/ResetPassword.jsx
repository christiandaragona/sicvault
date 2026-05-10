import { useState } from 'react'
import { generateSalt, deriveKey, encryptVault, saveVaultToStorage } from '../lib/crypto'
import { consumeResetToken } from '../lib/api'

export default function ResetPassword({ token, username, onComplete, theme, onToggleTheme }) {
  const [pw, setPw]           = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw]   = useState(false)
  const [error, setError]     = useState('')
  const [working, setWorking] = useState(false)

  async function handleReset() {
    setError('')
    if (pw.length < 8)  return setError('PASSWORD MUST BE AT LEAST 8 CHARACTERS')
    if (pw !== confirm)  return setError('PASSWORDS DO NOT MATCH')
    setWorking(true)
    try {
      const salt = await generateSalt()
      const key  = await deriveKey(pw, salt)
      const newVault = { entries: [], settings: { totpEnabled: false, totpSecret: '' } }
      const { iv, ciphertext } = await encryptVault(key, newVault)
      saveVaultToStorage(username, salt, iv, ciphertext)
      await consumeResetToken(token)
      onComplete(key, newVault, username)
    } catch (e) {
      setError('RESET FAILED — ' + e.message)
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
          <div className="login-divider" />
          <span className="login-subtitle">RESET MASTER PASSWORD</span>
        </div>

        <div style={{ fontSize: 8, color: 'var(--text-dim)', letterSpacing: 1.5, marginBottom: 20, lineHeight: 2 }}>
          ACCOUNT: <span style={{ color: 'var(--accent-2)' }}>{username.toUpperCase()}</span>
          <br />
          <span style={{ color: 'var(--danger)' }}>⚠ WARNING: PREVIOUS VAULT CONTENTS WILL BE LOST.</span>
        </div>

        <div className="form-group">
          <label className="form-label">NEW MASTER PASSWORD</label>
          <div className="input-wrapper">
            <input className="input" type={showPw ? 'text' : 'password'}
              placeholder="choose a strong password..."
              value={pw} onChange={e => setPw(e.target.value)} />
            <span className="input-icon" style={{ cursor: 'pointer', pointerEvents: 'all' }}
              onClick={() => setShowPw(v => !v)}>
              {showPw ? '🙈' : '👁'}
            </span>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">CONFIRM PASSWORD</label>
          <div className="input-wrapper">
            <input className="input" type={showPw ? 'text' : 'password'}
              placeholder="confirm your password..."
              value={confirm} onChange={e => setConfirm(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleReset()} />
          </div>
        </div>

        {error && (
          <div style={{ fontSize: 8, letterSpacing: 1.5, color: 'var(--danger)', marginBottom: 12 }}>
            ⚠ {error}
          </div>
        )}

        <button className="btn btn-primary login-btn" onClick={handleReset} disabled={working}>
          {working ? 'RESETTING...' : '▶ SET NEW PASSWORD'}
        </button>

        <div className="login-status">
          <span className="status-dot" />
          PBKDF2 · AES-256-GCM
        </div>
      </div>
    </div>
  )
}
