export default function Gateway({ onLogin, onCreate, onForgotPassword }) {
  return (
    <div className="login-screen">

      <div className="login-card" style={{ textAlign: 'center' }}>
        <span className="login-title">SICVAULT</span>
        <div className="login-divider" />
        <span className="login-subtitle" style={{ marginBottom: 28, display: 'block' }}>SECURE VAULT SYSTEM</span>
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
