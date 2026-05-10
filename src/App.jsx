import { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'
import Gateway from './components/Gateway'
import Login from './components/Login'
import Setup from './components/Setup'
import Sidebar from './components/Sidebar'
import Vault from './components/Vault'
import Generator from './components/Generator'
import { encryptVault, saveVaultToStorage, loadVaultFromStorage } from './lib/crypto'

const LOCK_AFTER_MS = 5 * 60 * 1000

export default function App() {
  const [theme, setTheme]   = useState('night')
  const [screen, setScreen] = useState('gateway')
  const [view, setView]     = useState('vault')

  const [vaultKey, setVaultKey]   = useState(null)
  const [vault, setVault]         = useState(null)
  const [username, setUsername]   = useState('')

  const lockTimer = useRef(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const lock = useCallback(() => {
    setVaultKey(null)
    setVault(null)
    setUsername('')
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

  function toggleTheme() {
    setTheme(t => t === 'night' ? 'day' : 'night')
  }

  function handleAuthSuccess(key, loadedVault, user) {
    setVaultKey(key)
    setVault(loadedVault)
    setUsername(user)
    setScreen('app')
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

  if (screen === 'gateway') {
    return (
      <Gateway
        onLogin={() => setScreen('login')}
        onCreate={() => setScreen('setup')}
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
            {view === 'vault' ? '// CREDENTIAL VAULT' : '// PASSWORD GENERATOR'}
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

        <div className="content-area">
          {view === 'vault' && vault && (
            <Vault
              entries={vault.entries}
              onAdd={handleAddEntry}
              onDelete={handleDeleteEntry}
            />
          )}
          {view === 'generator' && <Generator />}
        </div>
      </div>
    </div>
  )
}
