import { useState } from 'react'
import AddEntryModal from './AddEntryModal'

function EntryCard({ entry, onDelete, onCopyPassword }) {
  const [revealed, setRevealed] = useState(false)
  const [copied, setCopied]     = useState(false)

  function handleCopy() {
    onCopyPassword(entry.password)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  function handleSaveApple() {
    if (!navigator.credentials || !window.PasswordCredential) return
    const cred = new PasswordCredential({ id: entry.username, password: entry.password, name: entry.site })
    navigator.credentials.store(cred)
  }

  const canSaveApple = typeof window !== 'undefined' && !!window.PasswordCredential

  return (
    <div className="entry-card">
      <div className="entry-top">
        <span className="entry-site">{entry.site.toUpperCase()}</span>
        <span className="entry-category tag green">{entry.category}</span>
      </div>

      <div className="entry-row">
        <span className="entry-field-label">USERNAME</span>
        <span className="entry-field-value">{entry.username}</span>
      </div>

      {entry.url && (
        <div className="entry-row">
          <span className="entry-field-label">URL</span>
          <span className="entry-field-value" style={{ fontSize: 9 }}>{entry.url}</span>
        </div>
      )}

      <div className="entry-row">
        <span className="entry-field-label">PASSWORD</span>
        <span className={`entry-field-value ${revealed ? '' : 'masked'}`}>
          {revealed ? entry.password : '••••••••••••'}
        </span>
      </div>

      <div className="entry-actions">
        <button className="btn btn-sm btn-icon" onClick={() => setRevealed(v => !v)} title={revealed ? 'Hide' : 'Reveal'}>
          {revealed ? '🙈' : '👁'}
        </button>
        <button className="btn btn-sm btn-icon" onClick={handleCopy} title="Copy password">
          {copied ? '✓' : '⧉'}
        </button>
        {canSaveApple && (
          <button className="btn btn-sm" style={{ fontSize: 7, letterSpacing: 1 }} onClick={handleSaveApple}>
            🍎 SAVE
          </button>
        )}
        <button className="btn btn-sm btn-danger" style={{ marginLeft: 'auto' }} onClick={() => onDelete(entry.id)}>
          ✕
        </button>
      </div>
    </div>
  )
}

export default function Vault({ entries, onAdd, onDelete }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [search, setSearch]       = useState('')
  const [copied, setCopied]       = useState(false)

  const filtered = entries.filter(e =>
    e.site.toLowerCase().includes(search.toLowerCase()) ||
    e.username.toLowerCase().includes(search.toLowerCase())
  )

  function handleCopyPassword(password) {
    navigator.clipboard.writeText(password).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div>
      <div className="section-heading">CREDENTIAL VAULT</div>

      <div className="vault-stats">
        <div className="stat-card">
          <span className="stat-value">{entries.length}</span>
          <span className="stat-label">STORED ENTRIES</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">2FA</span>
          <span className="stat-label">VAULT PROTECTION</span>
        </div>
        <div className="stat-card">
          <span className="stat-value" style={{ fontSize: 14 }}>AES-256</span>
          <span className="stat-label">ENCRYPTION</span>
        </div>
      </div>

      <div className="vault-header">
        <div className="vault-search">
          <span className="search-icon">⌕</span>
          <input className="input" style={{ paddingLeft: 36 }}
            placeholder="search entries..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="vault-actions">
          {copied && (
            <span style={{ fontSize: 8, letterSpacing: 1.5, color: 'var(--accent-1)' }}>
              ✓ COPIED
            </span>
          )}
          <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
            + ADD ENTRY
          </button>
        </div>
      </div>

      {entries.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-dim)', fontSize: 9, letterSpacing: 2 }}>
          <div style={{ fontSize: 32, marginBottom: 16 }}>🔒</div>
          VAULT IS EMPTY — ADD YOUR FIRST ENTRY
        </div>
      ) : (
        <div className="entries-grid">
          {filtered.map(entry => (
            <EntryCard
              key={entry.id}
              entry={entry}
              onDelete={onDelete}
              onCopyPassword={handleCopyPassword}
            />
          ))}
        </div>
      )}

      {modalOpen && (
        <AddEntryModal
          onClose={() => setModalOpen(false)}
          onSave={entry => { onAdd(entry); setModalOpen(false) }}
        />
      )}
    </div>
  )
}
