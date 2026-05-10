import { useState } from 'react'
import { generateStandard } from '../lib/passwordGen'

const CATEGORIES = ['GENERAL','EMAIL','SOCIAL','FINANCE','DEV','CLOUD','MEDIA','OTHER']

export default function AddEntryModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    site: '', url: '', username: '', category: 'GENERAL',
    password: '', notes: '', totpSecret: '',
  })
  const [showPw, setShowPw] = useState(false)
  const [error, setError]   = useState('')

  function set(key, val) { setForm(f => ({ ...f, [key]: val })) }

  function handleGenerate() {
    const pw = generateStandard({
      length: '20', upper: true, lower: true, numbers: true, symbols: true,
      customSymbols: '!@#$%^&*', excludeAmbiguous: false, excludeCustom: '',
      minUpper: '1', minLower: '1', minNumbers: '1', minSymbols: '1',
    })
    set('password', pw)
    setShowPw(true)
  }

  function handleSave() {
    if (!form.site.trim())     return setError('SITE NAME IS REQUIRED')
    if (!form.username.trim()) return setError('USERNAME IS REQUIRED')
    if (!form.password.trim()) return setError('PASSWORD IS REQUIRED')
    onSave({
      id: crypto.randomUUID(),
      site: form.site.trim(),
      url: form.url.trim(),
      username: form.username.trim(),
      category: form.category,
      password: form.password,
      notes: form.notes.trim(),
      totpSecret: form.totpSecret.trim(),
      createdAt: Date.now(),
    })
  }

  function handleSaveApple() {
    if (!form.username || !form.password || !window.PasswordCredential) return
    const cred = new PasswordCredential({ id: form.username, password: form.password, name: form.site })
    navigator.credentials.store(cred)
  }

  const canSaveApple = typeof window !== 'undefined' && !!window.PasswordCredential

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
              <input className="input" placeholder="e.g. GitHub, Gmail..."
                value={form.site} onChange={e => set('site', e.target.value)} />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">URL (OPTIONAL)</label>
              <input className="input" placeholder="https://..."
                value={form.url} onChange={e => set('url', e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">USERNAME</label>
              <input className="input" placeholder="username or email..."
                value={form.username} onChange={e => set('username', e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">CATEGORY</label>
              <select className="input" style={{ cursor: 'pointer' }}
                value={form.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.map(c => (
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
                  <input className="input"
                    type={showPw ? 'text' : 'password'}
                    placeholder="enter or generate password..."
                    style={{ paddingRight: 40 }}
                    autoComplete="new-password"
                    value={form.password} onChange={e => set('password', e.target.value)} />
                  <span className="input-icon" style={{ cursor: 'pointer', pointerEvents: 'all' }}
                    onClick={() => setShowPw(v => !v)}>
                    {showPw ? '🙈' : '👁'}
                  </span>
                </div>
              </div>
              <button className="btn btn-primary btn-sm" style={{ whiteSpace: 'nowrap' }} onClick={handleGenerate}>
                ⚡ GENERATE
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">NOTES (OPTIONAL)</label>
            <textarea className="input" placeholder="any additional notes..." rows={3}
              style={{ resize: 'vertical', minHeight: 70 }}
              value={form.notes} onChange={e => set('notes', e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">2FA SECRET (OPTIONAL)</label>
            <input className="input" placeholder="TOTP secret key..." style={{ letterSpacing: 2 }}
              value={form.totpSecret} onChange={e => set('totpSecret', e.target.value)} />
            <div style={{ marginTop: 6, fontSize: 8, color: 'var(--text-dim)', letterSpacing: 1.5 }}>
              STORED ENCRYPTED · NEVER TRANSMITTED
            </div>
          </div>

          {error && (
            <div style={{ fontSize: 8, letterSpacing: 1.5, color: 'var(--danger)' }}>
              ⚠ {error}
            </div>
          )}
        </div>

        <div className="modal-footer">
          {canSaveApple && (
            <button className="btn btn-sm" style={{ fontSize: 8 }} onClick={handleSaveApple}>
              🍎 SAVE TO APPLE PASSWORDS
            </button>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-sm" onClick={onClose}>CANCEL</button>
            <button className="btn btn-primary btn-sm" onClick={handleSave}>🔒 SAVE TO VAULT</button>
          </div>
        </div>
      </div>
    </div>
  )
}
