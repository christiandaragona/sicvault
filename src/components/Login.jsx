import { useState } from 'react'

export default function Login({ onLogin, theme, onToggleTheme }) {
  const [showPw, setShowPw] = useState(false)

  return (
    <div className="login-screen">
      <button className="theme-toggle" onClick={onToggleTheme} style={{ position: 'absolute', top: 20, right: 20, zIndex: 20 }}>
        <span className="theme-icon">{theme === 'night' ? '☀' : '🌙'}</span>
        <span>{theme === 'night' ? 'DAY' : 'NIGHT'}</span>
      </button>

      <div className="login-card">
        <div className="login-logo">
          <span className="login-title">SICVAULT</span>
          <span className="login-version" style={{ display: 'block', fontSize: 9, letterSpacing: 5, color: 'var(--text-dim)', marginTop: 4 }}>v1.0</span>
          <div className="login-divider" />
          <span className="login-subtitle">SECURE VAULT SYSTEM</span>
        </div>

        <div className="form-group">
          <label className="form-label">MASTER PASSWORD</label>
          <div className="input-wrapper">
            <input
              className="input"
              type={showPw ? 'text' : 'password'}
              placeholder="enter master password..."
              autoComplete="current-password"
            />
            <span
              className="input-icon"
              style={{ cursor: 'pointer', pointerEvents: 'all' }}
              onClick={() => setShowPw(v => !v)}
            >
              {showPw ? '🙈' : '👁'}
            </span>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">2FA VERIFICATION CODE</label>
          <div className="input-wrapper">
            <input
              className="input"
              type="text"
              placeholder="000000"
              maxLength={6}
              style={{ letterSpacing: 6, textAlign: 'center' }}
            />
            <span className="input-icon">🔐</span>
          </div>
        </div>

        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="twofa-badge">
            <span className="twofa-dot" />
            2FA ACTIVE
          </div>
          <span style={{ fontSize: 8, color: 'var(--text-dim)', letterSpacing: 1.5 }}>
            USE AUTHENTICATOR APP
          </span>
        </div>

        <button className="btn btn-primary login-btn" onClick={onLogin}>
          ▶ AUTHENTICATE
        </button>

        <div className="login-status">
          <span className="status-dot" />
          VAULT ENCRYPTED · AES-256 · PBKDF2
        </div>
      </div>
    </div>
  )
}
