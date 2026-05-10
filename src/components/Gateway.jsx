export default function Gateway({ onLogin, onCreate, onForgotPassword, theme, onToggleTheme }) {
  return (
    <div className="login-screen">
      <button className="theme-toggle" onClick={onToggleTheme}
        style={{ position: 'absolute', top: 20, right: 20, zIndex: 20 }}>
        <span className="theme-icon">{theme === 'night' ? '☀' : '🌙'}</span>
        <span>{theme === 'night' ? 'DAY' : 'NIGHT'}</span>
      </button>

      <div className="login-card" style={{ textAlign: 'center' }}>
        <div className="login-logo">
          <span className="login-title">SICVAULT</span>
          <span style={{ display: 'block', fontSize: 9, letterSpacing: 5, color: 'var(--text-dim)', marginTop: 4 }}>v1.0</span>
          <div className="login-divider" />
          <span className="login-subtitle">SECURE VAULT SYSTEM</span>
        </div>

        <div style={{ fontSize: 8, letterSpacing: 2, color: 'var(--text-dim)', marginBottom: 28, lineHeight: 2 }}>
          AES-256-GCM · PBKDF2 · TOTP 2FA
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button className="btn btn-primary login-btn" onClick={onLogin}>
            ▶ LOGIN
          </button>
          <button className="btn login-btn" onClick={onCreate}>
            + CREATE ACCOUNT
          </button>
        </div>

        <button
          onClick={onForgotPassword}
          style={{ background: 'none', border: 'none', cursor: 'pointer', marginTop: 12,
            fontSize: 8, letterSpacing: 2, color: 'var(--text-dim)', fontFamily: 'inherit' }}>
          FORGOT PASSWORD?
        </button>

        <div className="login-status" style={{ marginTop: 16 }}>
          <span className="status-dot" />
          COMPATIBLE WITH GOOGLE AUTHENTICATOR · AUTHY · ANY TOTP APP
        </div>
      </div>
    </div>
  )
}
