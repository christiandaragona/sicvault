export default function Sidebar({ view, setView, onLock }) {
  const navItems = [
    { id: 'vault',     icon: '🔒', label: 'VAULT' },
    { id: 'generator', icon: '⚡', label: 'GENERATOR' },
    { id: 'settings',  icon: '⚙', label: 'SETTINGS' },
  ]

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-title">SICVAULT</div>
        <div className="logo-version">v1.0 // SECURE</div>
      </div>

      <nav className="sidebar-nav">
        <span className="nav-label">NAVIGATION</span>
        {navItems.map(item => (
          <button
            key={item.id}
            className={`nav-item ${view === item.id ? 'active' : ''}`}
            onClick={() => setView(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div style={{ fontSize: 8, letterSpacing: 2, color: 'var(--text-dim)', marginBottom: 4 }}>
          <span style={{ color: 'var(--accent-1)' }}>●</span> VAULT UNLOCKED
        </div>
        <button className="btn btn-danger btn-sm" onClick={onLock} style={{ width: '100%' }}>
          ⏏ LOCK VAULT
        </button>
      </div>
    </div>
  )
}
