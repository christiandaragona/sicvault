import { useState } from 'react'

export default function AddEntryModal({ onClose }) {
  const [showPw, setShowPw] = useState(false)

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">+ ADD VAULT ENTRY</span>
          <button className="btn btn-icon" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">SITE / SERVICE NAME</label>
              <input className="input" placeholder="e.g. GitHub, Gmail..." />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">URL (OPTIONAL)</label>
              <input className="input" placeholder="https://..." />
            </div>

            <div className="form-group">
              <label className="form-label">USERNAME</label>
              <input className="input" placeholder="username or email..." />
            </div>

            <div className="form-group">
              <label className="form-label">CATEGORY</label>
              <select className="input" style={{ cursor: 'pointer' }}>
                {['GENERAL','EMAIL','SOCIAL','FINANCE','DEV','CLOUD','MEDIA','OTHER'].map(c => (
                  <option key={c} value={c} style={{ background: 'var(--bg-1)' }}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="form-label">PASSWORD</label>
            <div className="pw-field-row">
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <div className="input-wrapper">
                  <input
                    className="input"
                    type={showPw ? 'text' : 'password'}
                    placeholder="enter or generate password..."
                    style={{ paddingRight: 40 }}
                    autoComplete="new-password"
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
              <button className="btn btn-primary btn-sm" style={{ whiteSpace: 'nowrap' }}>
                ⚡ GENERATE
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">NOTES (OPTIONAL)</label>
            <textarea
              className="input"
              placeholder="any additional notes..."
              rows={3}
              style={{ resize: 'vertical', minHeight: 70 }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">2FA SECRET (OPTIONAL)</label>
            <input className="input" placeholder="TOTP secret key..." style={{ letterSpacing: 2 }} />
            <div style={{ marginTop: 6, fontSize: 8, color: 'var(--text-dim)', letterSpacing: 1.5 }}>
              STORED ENCRYPTED · NEVER TRANSMITTED
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-sm" style={{ fontSize: 8 }}>
            🍎 SAVE TO APPLE PASSWORDS
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-sm" onClick={onClose}>CANCEL</button>
            <button className="btn btn-primary btn-sm">🔒 SAVE TO VAULT</button>
          </div>
        </div>
      </div>
    </div>
  )
}
