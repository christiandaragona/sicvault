import { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'
import Gateway from './components/Gateway'
import Login from './components/Login'
import Setup from './components/Setup'
import ForgotPassword from './components/ForgotPassword'
import ResetPassword from './components/ResetPassword'
import Admin from './components/Admin'
import Sidebar from './components/Sidebar'
import Vault from './components/Vault'
import Generator from './components/Generator'
import Settings from './components/Settings'
import { encryptVault, saveVaultToStorage, loadVaultFromStorage } from './lib/crypto'
import { verifyResetToken, getAlert } from './lib/api'

const LOCK_AFTER_MS = 5 * 60 * 1000

export default function App() {
  const [theme, setTheme]     = useState('night')
  const [screen, setScreen]   = useState('gateway')
  const [view, setView]       = useState('vault')

  const [vaultKey, setVaultKey] = useState(null)
  const [vault, setVault]       = useState(null)
  const [username, setUsername] = useState('')
  const [adminToken, setAdminToken] = useState(null)
  const [alert, setAlert] = useState(null)

  // Password reset state (populated from URL ?reset= param)
  const [resetToken, setResetToken]     = useState(null)
  const [resetUsername, setResetUsername] = useState('')

  const lockTimer = useRef(null)

  // Check for ?reset=token in URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('reset')
    if (!token) return
    // Clear the URL
    window.history.replaceState({}, '', window.location.pathname)
    verifyResetToken(token).then(r => {
      if (r.ok) {
        setResetToken(token)
        setResetUsername(r.username)
        setScreen('reset')
      }
    })
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const lock = useCallback(() => {
    setVaultKey(null)
    setVault(null)
    setUsername('')
    setAdminToken(null)
    setScreen('gateway')
    clearTimeout(lockTimer.current)
  }, [])

  useEffect(() => {
    if (screen !== 'app') return
    function resetTimer() {
      clearTimeout(lockTimer.current)
      lockTimer.current = setTimeout(lock, LOCK_AFTER_MS)
    }
    resetTimer()
    window.addEventListener('mousemove', resetTimer)
    window.addEventListener('keydown', resetTimer)
    window.addEventListener('click', resetTimer)
    return () => {
      clearTimeout(lockTimer.current)
      window.removeEventListener('mousemove', resetTimer)
      window.removeEventListener('keydown', resetTimer)
      window.removeEventListener('click', resetTimer)
    }
  }, [screen, lock])

  function toggleTheme() { setTheme(t => t === 'night' ? 'day' : 'night') }

  async function handleAuthSuccess(key, loadedVault, user) {
    setVaultKey(key)
    setVault(loadedVault)
    setUsername(user)
    setScreen('app')
    const r = await getAlert()
    if (r.message) setAlert(r.message)
  }

  function handleAdminLogin(token) {
    setAdminToken(token)
    setScreen('admin')
  }

  async function persistVault(updatedVault) {
    const stored = loadVaultFromStorage(username)
    if (!stored || !vaultKey) return
    const { iv, ciphertext } = await encryptVault(vaultKey, updatedVault)
    saveVaultToStorage(username, stored.salt, iv, ciphertext)
  }

  async function handleAddEntry(entry) {
    const updated = { ...vault, entries: [...vault.entries, entry] }
    setVault(updated)
    await persistVault(updated)
  }

  async function handleDeleteEntry(id) {
    const updated = { ...vault, entries: vault.entries.filter(e => e.id !== id) }
    setVault(updated)
    await persistVault(updated)
  }

  if (screen === 'reset') {
    return (
      <ResetPassword
        token={resetToken}
        username={resetUsername}
        onComplete={handleAuthSuccess}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    )
  }

  if (screen === 'admin') {
    return (
      <Admin
        token={adminToken}
        onLogout={lock}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    )
  }

  if (screen === 'gateway') {
    return (
      <Gateway
        onLogin={() => setScreen('login')}
        onCreate={() => setScreen('setup')}
        onForgotPassword={() => setScreen('forgot')}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    )
  }

  if (screen === 'forgot') {
    return (
      <ForgotPassword
        onBack={() => setScreen('gateway')}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    )
  }

  if (screen === 'setup') {
    return (
      <Setup
        onComplete={handleAuthSuccess}
        onBack={() => setScreen('gateway')}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    )
  }

  if (screen === 'login') {
    return (
      <Login
        onLogin={handleAuthSuccess}
        onAdminLogin={handleAdminLogin}
        onBack={() => setScreen('gateway')}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    )
  }

  return (
    <div className="app">
      <Sidebar view={view} setView={setView} onLock={lock} username={username} />

      <div className="main-content">
        <div className="topbar">
          <span className="topbar-title">
            {view === 'vault' ? '// CREDENTIAL VAULT' : view === 'generator' ? '// PASSWORD GENERATOR' : '// SETTINGS'}
          </span>
          <div className="topbar-right">
            <div className="twofa-badge">
              <span className="twofa-dot" />
              {username.toUpperCase()} · SESSION ACTIVE
            </div>
            <button className="theme-toggle" onClick={toggleTheme}>
              <span className="theme-icon">{theme === 'night' ? '☀' : '🌙'}</span>
              <span>{theme === 'night' ? 'DAY MODE' : 'NIGHT MODE'}</span>
            </button>
          </div>
        </div>

        {alert && (
          <div style={{
            background: 'var(--danger-dim)', borderBottom: '1px solid var(--danger)',
            padding: '10px 20px', fontSize: 8, letterSpacing: 2,
            color: 'var(--danger)', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span>⚠ SYSTEM ALERT: {alert}</span>
            <button onClick={() => setAlert(null)}
              style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: 10, fontFamily: 'inherit' }}>
              ✕
            </button>
          </div>
        )}

        <div className="content-area">
          {view === 'vault' && vault && (
            <Vault
              entries={vault.entries}
              onAdd={handleAddEntry}
              onDelete={handleDeleteEntry}
            />
          )}
          {view === 'generator' && <Generator />}
          {view === 'settings' && (
            <Settings
              username={username}
              vault={vault}
              vaultKey={vaultKey}
              onVaultUpdate={(updated, newKey) => {
                setVault(updated)
                if (newKey) setVaultKey(newKey)
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
