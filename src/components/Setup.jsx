import { useState } from 'react'
import { generateSalt, deriveKey, encryptVault, saveVaultToStorage, vaultExistsForUser } from '../lib/crypto'
import { generateTOTPSecret, verifyTOTP, getTOTPUri } from '../lib/totp'

export default function Setup({ onComplete, onBack, theme, onToggleTheme }) {
  const [step, setStep]         = useState('password') // 'password' | 'totp' | 'working'
  const [username, setUsername] = useState('')
  const [pw, setPw]             = useState('')
  const [confirm, setConfirm]   = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [enable2fa, setEnable2fa] = useState(false)
  const [totpSecret, setTotpSecret] = useState(() => generateTOTPSecret())
  const [totpToken, setTotpToken]   = useState('')
  const [error, setError]       = useState('')
  const [working, setWorking]   = useState(false)

  async function handlePasswordNext() {
    setError('')
    if (username.trim().length < 2) return setError('USERNAME MUST BE AT LEAST 2 CHARACTERS')
    if (vaultExistsForUser(username)) return setError('USERNAME ALREADY TAKEN')
    if (pw.length < 8) return setError('MASTER PASSWORD MUST BE AT LEAST 8 CHARACTERS')
    if (pw !== confirm) return setError('PASSWORDS DO NOT MATCH')
    if (enable2fa) { setStep('totp'); return }
    await createVault(null)
  }

  async function handleTotpConfirm() {
    setError('')
    const ok = await verifyTOTP(totpSecret, totpToken)
    if (!ok) return setError('INVALID CODE — CHECK YOUR AUTHENTICATOR APP')
    await createVault(totpSecret)
  }

  async function createVault(secret) {
    setWorking(true)
    try {
      const salt = await generateSalt()
      const key  = await deriveKey(pw, salt)
      const initialVault = {
        entries: [],
        settings: { totpEnabled: !!secret, totpSecret: secret ?? '' },
      }
      const { iv, ciphertext } = await encryptVault(key, initialVault)
      saveVaultToStorage(username.trim(), salt, iv, ciphertext)
      onComplete(key, initialVault, username.trim())
    } catch (e) {
      setError('SETUP FAILED — ' + e.message)
      setWorking(false)
    }
  }

  const totpUri = getTOTPUri(totpSecret)

  return (
    <div className="login-screen">
      <button className="theme-toggle" onClick={onToggleTheme}
        style={{ position: 'absolute', top: 20, right: 20, zIndex: 20 }}>
        <span className="theme-icon">{theme === 'night' ? '☀' : '🌙'}</span>
        <span>{theme === 'night' ? 'DAY' : 'NIGHT'}</span>
      </button>

      <div className="login-card" style={{ maxWidth: 460 }}>
        <div className="login-logo">
          <span className="login-title">SICVAULT</span>
          <span style={{ display: 'block', fontSize: 9, letterSpacing: 5, color: 'var(--text-dim)', marginTop: 4 }}>v1.0</span>
          <div className="login-divider" />
          <span className="login-subtitle">
            {step === 'password' ? 'CREATE MASTER PASSWORD' : 'SETUP AUTHENTICATOR'}
          </span>
        </div>

        {step === 'password' && (
          <>
            <div className="form-group">
              <label className="form-label">USERNAME</label>
              <div className="input-wrapper">
                <input className="input" type="text"
                  placeholder="choose a username..."
                  autoComplete="username"
                  value={username} onChange={e => setUsername(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handlePasswordNext()} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">MASTER PASSWORD</label>
              <div className="input-wrapper">
                <input className="input" type={showPw ? 'text' : 'password'}
                  placeholder="choose a strong password..."
                  autoComplete="new-password"
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
                  autoComplete="new-password"
                  value={confirm} onChange={e => setConfirm(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handlePasswordNext()} />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <button
                className={`toggle-btn ${enable2fa ? 'active' : ''}`}
                style={{ width: '100%' }}
                onClick={() => setEnable2fa(v => !v)}>
                <span className={`toggle-dot ${enable2fa ? 'on' : ''}`} />
                ENABLE 2FA (GOOGLE AUTHENTICATOR / AUTHY)
              </button>
            </div>

            {error && (
              <div style={{ fontSize: 8, letterSpacing: 1.5, color: 'var(--danger)', marginBottom: 12 }}>
                ⚠ {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-sm" onClick={onBack}>← BACK</button>
              <button className="btn btn-primary login-btn" style={{ flex: 1, marginTop: 0 }}
                onClick={handlePasswordNext} disabled={working}>
                {enable2fa ? '▶ NEXT: SETUP 2FA' : '▶ CREATE VAULT'}
              </button>
            </div>

            <div className="login-status">
              <span className="status-dot" />
              PBKDF2 · 100K ITERATIONS · AES-256-GCM
            </div>
          </>
        )}

        {step === 'totp' && (
          <>
            <div style={{ fontSize: 8, letterSpacing: 1.5, color: 'var(--text-dim)', marginBottom: 16, lineHeight: 2 }}>
              OPEN YOUR AUTHENTICATOR APP AND ADD A NEW ACCOUNT MANUALLY USING THE KEY BELOW.
            </div>

            <div className="form-group">
              <label className="form-label">YOUR 2FA SECRET KEY</label>
              <div style={{
                background: 'var(--bg-0)', border: '1px solid var(--accent-1)',
                borderRadius: 4, padding: '10px 14px', fontFamily: 'monospace',
                fontSize: 13, letterSpacing: 3, color: 'var(--accent-1)',
                wordBreak: 'break-all', lineHeight: 1.8,
              }}>
                {totpSecret}
              </div>
              <div style={{ fontSize: 7, color: 'var(--text-dim)', marginTop: 6, letterSpacing: 1.5 }}>
                ACCOUNT NAME: SICVAULT · ISSUER: SICVAULT · SHA-1 · 6 DIGITS · 30s
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">ENTER 6-DIGIT CODE TO CONFIRM</label>
              <div className="input-wrapper">
                <input className="input" type="text" placeholder="000000" maxLength={6}
                  style={{ letterSpacing: 6, textAlign: 'center' }}
                  value={totpToken} onChange={e => setTotpToken(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleTotpConfirm()} />
                <span className="input-icon">🔐</span>
              </div>
            </div>

            {error && (
              <div style={{ fontSize: 8, letterSpacing: 1.5, color: 'var(--danger)', marginBottom: 12 }}>
                ⚠ {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-sm" onClick={() => { setStep('password'); setError('') }}>
                ← BACK
              </button>
              <button className="btn btn-primary login-btn" style={{ flex: 1 }}
                onClick={handleTotpConfirm} disabled={working || totpToken.length < 6}>
                {working ? 'CREATING VAULT...' : '▶ VERIFY & CREATE VAULT'}
              </button>
            </div>

            <div className="login-status">
              <span className="status-dot" />
              2FA ACTIVE · TOTP · SHA-1 · 30s WINDOW
            </div>
          </>
        )}

        {working && step === 'password' && (
          <div style={{ fontSize: 8, letterSpacing: 1.5, color: 'var(--text-dim)', textAlign: 'center', marginTop: 8 }}>
            DERIVING KEY... THIS MAY TAKE A MOMENT
          </div>
        )}
      </div>
    </div>
  )
}
