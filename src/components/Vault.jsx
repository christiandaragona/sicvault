import { useState } from 'react'
import AddEntryModal from './AddEntryModal'

const MOCK_ENTRIES = [
  { id: 1, site: 'GitHub',      username: 'sharp01',            category: 'DEV',      hasApple: true },
  { id: 2, site: 'Gmail',       username: 'c.daragona@gmail',   category: 'EMAIL',    hasApple: true },
  { id: 3, site: 'AWS Console', username: 'root@awsaccount',    category: 'CLOUD',    hasApple: false },
  { id: 4, site: 'Netflix',     username: 'sharp01@email.com',  category: 'MEDIA',    hasApple: true },
  { id: 5, site: 'Chase Bank',  username: 'christiand01',       category: 'FINANCE',  hasApple: true },
  { id: 6, site: 'Discord',     username: 'sharp#0001',         category: 'SOCIAL',   hasApple: false },
]

function EntryCard({ entry, onSaveApple }) {
  const [revealed, setRevealed] = useState(false)
  const [copied, setCopied]   = useState(false)

  function handleCopy() {
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

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

      <div className="entry-row">
        <span className="entry-field-label">PASSWORD</span>
        <span className={`entry-field-value ${revealed ? '' : 'masked'}`}>
          {revealed ? 'Tr0ub4dor&3_x9K!' : '••••••••••••'}
        </span>
      </div>

      <div className="entry-actions">
        <button className="btn btn-sm btn-icon" onClick={() => setRevealed(v => !v)} title={revealed ? 'Hide' : 'Reveal'}>
          {revealed ? '🙈' : '👁'}
        </button>
        <button className="btn btn-sm btn-icon" onClick={handleCopy} title="Copy password">
          {copied ? '✓' : '⧉'}
        </button>
        <button className="btn btn-sm" style={{ fontSize: 7, letterSpacing: 1 }}>
          ✎ EDIT
        </button>
        {entry.hasApple && (
          <button className="btn btn-sm" style={{ fontSize: 7, letterSpacing: 1 }} onClick={() => onSaveApple(entry)}>
            🍎 SAVE
          </button>
        )}
        <button className="btn btn-sm btn-danger" style={{ marginLeft: 'auto' }}>
          ✕
        </button>
      </div>
    </div>
  )
}

export default function Vault() {
  const [modalOpen, setModalOpen] = useState(false)
  const [search, setSearch]       = useState('')

  const filtered = MOCK_ENTRIES.filter(e =>
    e.site.toLowerCase().includes(search.toLowerCase()) ||
    e.username.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="section-heading">CREDENTIAL VAULT</div>

      <div className="vault-stats">
        <div className="stat-card">
          <span className="stat-value">{MOCK_ENTRIES.length}</span>
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
          <input
            className="input"
            style={{ paddingLeft: 36 }}
            placeholder="search entries..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="vault-actions">
          <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
            + ADD ENTRY
          </button>
        </div>
      </div>

      <div className="entries-grid">
        {filtered.map(entry => (
          <EntryCard key={entry.id} entry={entry} onSaveApple={() => {}} />
        ))}
      </div>

      {modalOpen && <AddEntryModal onClose={() => setModalOpen(false)} />}
    </div>
  )
}
