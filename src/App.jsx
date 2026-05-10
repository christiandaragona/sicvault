import { useState, useEffect } from 'react'
import './App.css'
import Login from './components/Login'
import Sidebar from './components/Sidebar'
import Vault from './components/Vault'
import Generator from './components/Generator'

export default function App() {
  const [theme, setTheme]       = useState('night')
  const [loggedIn, setLoggedIn] = useState(false)
  const [view, setView]         = useState('vault')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  function toggleTheme() {
    setTheme(t => t === 'night' ? 'day' : 'night')
  }

  if (!loggedIn) {
    return (
      <Login
        onLogin={() => setLoggedIn(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    )
  }

  return (
    <div className="app">
      <Sidebar view={view} setView={setView} onLock={() => setLoggedIn(false)} />

      <div className="main-content">
        <div className="topbar">
          <span className="topbar-title">
            {view === 'vault' ? '// CREDENTIAL VAULT' : '// PASSWORD GENERATOR'}
          </span>
          <div className="topbar-right">
            <div className="twofa-badge">
              <span className="twofa-dot" />
              SESSION ACTIVE
            </div>
            <button className="theme-toggle" onClick={toggleTheme}>
              <span className="theme-icon">{theme === 'night' ? '☀' : '🌙'}</span>
              <span>{theme === 'night' ? 'DAY MODE' : 'NIGHT MODE'}</span>
            </button>
          </div>
        </div>

        <div className="content-area">
          {view === 'vault'     && <Vault />}
          {view === 'generator' && <Generator />}
        </div>
      </div>
    </div>
  )
}
