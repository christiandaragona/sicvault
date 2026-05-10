import { useState } from 'react'
import { forgotPassword } from '../lib/api'

export default function ForgotPassword({ onBack, theme, onToggleTheme }) {
  const [email, setEmail]   = useState('')
  const [sent, setSent]     = useState(false)
  const [error, setError]   = useState('')
  const [working, setWorking] = useState(false)

  async function handleSubmit() {
    setError('')
    if (!email.trim()) return setError('ENTER YOUR EMAIL ADDRESS')
    setWorking(true)
    try {
      await forgotPassword(email.trim())
      setSent(true)
    } catch (e) {
      setError(e.message || 'FAILED TO SEND — TRY AGAIN')
    } finally {
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
          <span className="login-subtitle">FORGOT PASSWORD</span>
        </div>

        {!sent ? (
          <>
            <div style={{ fontSize: 8, color: 'var(--text-dim)', letterSpacing: 1.5, marginBottom: 20, lineHeight: 2 }}>
              ENTER YOUR REGISTERED EMAIL ADDRESS AND WE'LL SEND YOU A PASSWORD RESET LINK.
            </div>

            <div className="form-group">
              <label className="form-label">EMAIL ADDRESS</label>
              <div className="input-wrapper">
                <input className="input" type="email" placeholder="your@email.com"
                  value={email} onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  autoFocus />
              </div>
            </div>

            {error && (
              <div style={{ fontSize: 8, letterSpacing: 1.5, color: 'var(--danger)', marginBottom: 12 }}>
                ⚠ {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
              <button className="btn btn-sm" onClick={onBack}>← BACK</button>
              <button className="btn btn-primary login-btn" style={{ flex: 1, marginTop: 0 }}
                onClick={handleSubmit} disabled={working}>
                {working ? 'SENDING...' : '▶ SEND RESET LINK'}
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 9, color: 'var(--accent-1)', letterSpacing: 2, lineHeight: 2, marginBottom: 24 }}>
              ✓ IF THAT EMAIL IS REGISTERED, A RESET LINK HAS BEEN SENT.
              <br />
              CHECK YOUR INBOX AND FOLLOW THE LINK TO RESET YOUR PASSWORD.
              <br /><br />
              <span style={{ color: 'var(--text-dim)', fontSize: 8 }}>
                LINK EXPIRES IN 1 HOUR.
              </span>
            </div>
            <button className="btn btn-primary login-btn" onClick={onBack}>
              ← BACK TO LOGIN
            </button>
          </>
        )}

        <div className="login-status" style={{ marginTop: 16 }}>
          <span className="status-dot" />
          VAULT ENCRYPTED · RESET DOES NOT EXPOSE PASSWORDS
        </div>
      </div>
    </div>
  )
}
