import { useState, useEffect, useCallback } from 'react'
import { adminGetUsers, adminTerminate, adminSendReset } from '../lib/api'

export default function Admin({ token, onLogout, theme, onToggleTheme }) {
  const [users, setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg]       = useState({ text: '', ok: true })

  const flash = (text, ok = true) => { setMsg({ text, ok }); setTimeout(() => setMsg({ text: '', ok: true }), 4000) }

  const loadUsers = useCallback(async () => {
    setLoading(true)
    const data = await adminGetUsers(token)
    if (data.error) flash(data.error, false)
    else setUsers(data.users || [])
    setLoading(false)
  }, [token])

  useEffect(() => { loadUsers() }, [loadUsers])

  async function handleTerminate(username) {
    if (!window.confirm(`Terminate account "${username}"? This cannot be undone.`)) return
    const r = await adminTerminate(username, token)
    if (r.error) flash(r.error, false)
    else { flash(`ACCOUNT "${username.toUpperCase()}" TERMINATED`); loadUsers() }
  }

  async function handleSendReset(username) {
    const r = await adminSendReset(username, token)
    if (r.error) flash(r.error, false)
    else flash(`RESET EMAIL SENT TO ${username.toUpperCase()}`)
  }

  const active     = users.filter(u => u.status === 'active').length
  const terminated = users.filter(u => u.status === 'terminated').length

  return (
    <div className="login-screen" style={{ alignItems: 'flex-start', overflowY: 'auto', padding: '48px 40px' }}>
      <button className="theme-toggle" onClick={onToggleTheme}
        style={{ position: 'fixed', top: 20, right: 20, zIndex: 20 }}>
        <span className="theme-icon">{theme === 'night' ? '☀' : '🌙'}</span>
        <span>{theme === 'night' ? 'DAY' : 'NIGHT'}</span>
      </button>
      <button className="btn btn-sm btn-danger" onClick={onLogout}
        style={{ position: 'fixed', top: 20, left: 20, zIndex: 20 }}>
        ✕ LOGOUT
      </button>

      <div style={{ width: '100%', maxWidth: 960, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <span className="login-title">SICVAULT</span>
          <div className="login-divider" style={{ marginTop: 12 }} />
          <span className="login-subtitle">DEVELOPER CONSOLE</span>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
          {[
            { label: 'TOTAL ACCOUNTS', value: users.length },
            { label: 'ACTIVE',         value: active,     color: 'var(--accent-1)' },
            { label: 'TERMINATED',     value: terminated, color: 'var(--danger)' },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{ flex: 1 }}>
              <span className="stat-value" style={{ color: s.color }}>{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Flash message */}
        {msg.text && (
          <div style={{
            fontSize: 8, letterSpacing: 2, marginBottom: 14, padding: '8px 14px',
            border: '1px solid', textAlign: 'center',
            color:        msg.ok ? 'var(--accent-1)' : 'var(--danger)',
            borderColor:  msg.ok ? 'var(--accent-1)' : 'var(--danger)',
            background:   msg.ok ? 'var(--glow-dim)' : 'var(--danger-dim)',
          }}>
            {msg.ok ? '✓' : '⚠'} {msg.text}
          </div>
        )}

        <div className="section-heading" style={{ marginBottom: 0 }}>
          USER REGISTRY
          <button className="btn btn-sm" style={{ marginLeft: 'auto' }} onClick={loadUsers}>
            ↺ REFRESH
          </button>
        </div>

        {loading ? (
          <div style={{ fontSize: 9, color: 'var(--text-dim)', letterSpacing: 2, padding: '24px 0' }}>LOADING...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 9, letterSpacing: 1 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-bright)' }}>
                  {['USERNAME', 'EMAIL', 'EMAIL 2FA', 'STATUS', 'CREATED', 'ACTIONS'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', color: 'var(--text-dim)', textAlign: 'left', letterSpacing: 2, fontWeight: 'normal' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.length === 0 && (
                  <tr><td colSpan={6} style={{ padding: '20px 12px', color: 'var(--text-dim)', textAlign: 'center', letterSpacing: 2 }}>NO ACCOUNTS YET</td></tr>
                )}
                {users.map(u => (
                  <tr key={u.username} style={{ borderBottom: '1px solid var(--border)', opacity: u.status === 'terminated' ? 0.45 : 1 }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text-primary)' }}>{u.username}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-secondary)', fontSize: 8 }}>{u.email}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ color: u.email_2fa_enabled ? 'var(--accent-1)' : 'var(--text-dim)', letterSpacing: 1.5 }}>
                        {u.email_2fa_enabled ? '● ON' : '○ OFF'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ color: u.status === 'active' ? 'var(--accent-1)' : 'var(--danger)', letterSpacing: 1.5 }}>
                        {u.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-dim)', fontSize: 8 }}>
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      {u.status === 'active' && (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-sm" onClick={() => handleSendReset(u.username)}>
                            ✉ RESET
                          </button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleTerminate(u.username)}>
                            ✕ TERMINATE
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
