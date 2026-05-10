import { useState, useEffect, useCallback } from 'react'
import { adminGetUsers, adminTerminate, adminSendReset, adminBroadcast, adminLock } from '../lib/api'

export default function Admin({ token, onLogout, theme, onToggleTheme }) {
  const [users, setUsers]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [msg, setMsg]           = useState({ text: '', ok: true })
  const [broadcastMsg, setBroadcastMsg] = useState('')
  const [broadcastActive, setBroadcastActive] = useState(false)

  const flash = (text, ok = true) => { setMsg({ text, ok }); setTimeout(() => setMsg({ text: '', ok: true }), 4000) }

  const loadUsers = useCallback(async () => {
    setLoading(true)
    const data = await adminGetUsers(token)
    if (data.error) flash(data.error, false)
    else setUsers(data.users || [])
    setLoading(false)
  }, [token])

  async function handleBroadcast() {
    const r = await adminBroadcast(broadcastMsg, token)
    if (r.error) return flash(r.error, false)
    setBroadcastActive(!!broadcastMsg.trim())
    flash(broadcastMsg.trim() ? 'BROADCAST ACTIVATED' : 'BROADCAST CLEARED')
  }

  async function handleLock(username, currentLock) {
    if (currentLock) {
      const r = await adminLock(username, '', token)
      if (r.error) return flash(r.error, false)
      flash(`ACCOUNT "${username.toUpperCase()}" UNLOCKED`)
      loadUsers()
    } else {
      const message = window.prompt(`Lock message for "${username}":`)
      if (!message) return
      const r = await adminLock(username, message, token)
      if (r.error) return flash(r.error, false)
      flash(`ACCOUNT "${username.toUpperCase()}" LOCKED`)
      loadUsers()
    }
  }

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

  const locked = users.filter(u => u.lock_message).length

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

      <div className="admin-content" style={{ width: '100%', maxWidth: 960, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <span className="login-title">SICVAULT</span>
          <div className="login-divider" style={{ marginTop: 12 }} />
          <span className="login-subtitle">DEVELOPER CONSOLE</span>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
          {[
            { label: 'TOTAL ACCOUNTS', value: users.length },
            { label: 'ACTIVE',         value: users.length - locked, color: 'var(--accent-1)' },
            { label: 'LOCKED',         value: locked,                color: 'var(--danger)' },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{ flex: 1 }}>
              <span className="stat-value" style={{ color: s.color }}>{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Broadcast */}
        <div className="section-heading" style={{ marginBottom: 12 }}>SYSTEM BROADCAST</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 28, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            className="input" placeholder="type a message to broadcast to all users on login..."
            style={{ flex: 1, fontSize: 9, letterSpacing: 1.5 }}
            value={broadcastMsg} onChange={e => setBroadcastMsg(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleBroadcast()}
          />
          <button className="btn btn-primary btn-sm" onClick={handleBroadcast}>
            {broadcastActive ? '↺ UPDATE' : '▶ ACTIVATE'}
          </button>
          {broadcastActive && (
            <button className="btn btn-sm btn-danger" onClick={() => { setBroadcastMsg(''); handleBroadcast() }}>
              ✕ CLEAR
            </button>
          )}
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
          <div className="admin-table-wrap">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 9, letterSpacing: 1 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-bright)' }}>
                  {['USERNAME', 'EMAIL', 'STATUS', 'CREATED', 'ACTIONS'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', color: 'var(--text-dim)', textAlign: 'left', letterSpacing: 2, fontWeight: 'normal' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.length === 0 && (
                  <tr><td colSpan={5} style={{ padding: '20px 12px', color: 'var(--text-dim)', textAlign: 'center', letterSpacing: 2 }}>NO ACCOUNTS YET</td></tr>
                )}
                {users.map(u => (
                  <tr key={u.username} style={{ borderBottom: '1px solid var(--border)', opacity: u.lock_message ? 0.6 : 1 }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text-primary)' }}>{u.username}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-secondary)', fontSize: 8 }}>{u.email}</td>
                    <td style={{ padding: '10px 12px' }}>
                      {u.lock_message
                        ? <span style={{ color: 'var(--danger)', letterSpacing: 1.5 }} title={u.lock_message}>● LOCKED</span>
                        : <span style={{ color: 'var(--accent-1)', letterSpacing: 1.5 }}>● ACTIVE</span>
                      }
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-dim)', fontSize: 8 }}>
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-sm" onClick={() => handleSendReset(u.username)}>
                          ✉ RESET
                        </button>
                        <button className="btn btn-sm" style={{ color: u.lock_message ? 'var(--accent-1)' : 'var(--danger)', borderColor: u.lock_message ? 'var(--accent-1)' : 'var(--danger)' }}
                          onClick={() => handleLock(u.username, u.lock_message)}>
                          {u.lock_message ? '🔓 UNLOCK' : '🔒 LOCK'}
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleTerminate(u.username)}>
                          ✕ TERMINATE
                        </button>
                      </div>
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
