import { useState } from 'react'

const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?'

const DEFAULT_OPTS = {
  length: '20',
  upper: true,
  lower: true,
  numbers: true,
  symbols: true,
  customSymbols: '!@#$%^&*',
  excludeAmbiguous: false,
  excludeCustom: '',
  minUpper: '1',
  minLower: '1',
  minNumbers: '1',
  minSymbols: '1',
  mode: 'standard',
}

export default function Generator() {
  const [opts, setOpts]         = useState(DEFAULT_OPTS)
  const [aiSite, setAiSite]     = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [password, setPassword] = useState('Tr0ub4dor&3_x9K!kZ')
  const [copied, setCopied]     = useState(false)
  const [strength, setStrength] = useState(92)

  function set(key, val) {
    setOpts(o => ({ ...o, [key]: val }))
  }

  function toggle(key) {
    setOpts(o => ({ ...o, [key]: !o[key] }))
  }

  function handleCopy() {
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  function handleAiDetect() {
    if (!aiSite.trim()) return
    setAiLoading(true)
    setTimeout(() => setAiLoading(false), 1800)
  }

  const strengthColor =
    strength >= 80 ? 'var(--accent-1)' :
    strength >= 50 ? '#d4a017' :
    'var(--danger)'

  const strengthText =
    strength >= 80 ? 'STRONG' :
    strength >= 50 ? 'MEDIUM' : 'WEAK'

  return (
    <div>
      <div className="section-heading">PASSWORD GENERATOR</div>

      <div className="generator-layout">
        {/* Left: options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* AI Detect */}
          <div className="generator-panel">
            <div className="panel-header">
              <span className="panel-title">AI SITE DETECTION</span>
              <span className="twofa-badge" style={{ fontSize: 7 }}>
                <span className="twofa-dot" />
                AI POWERED
              </span>
            </div>
            <div className="panel-body">
              <div className="ai-detect">
                <span className="ai-badge">CLAUDE AI</span>
                <div className="option-label" style={{ marginTop: 4 }}>WEBSITE / SERVICE</div>
                <div className="ai-row">
                  <input
                    className="input"
                    placeholder="e.g. instagram.com or Chase Bank..."
                    value={aiSite}
                    onChange={e => setAiSite(e.target.value)}
                  />
                  <button
                    className="btn btn-primary"
                    style={{ whiteSpace: 'nowrap', minWidth: 100 }}
                    onClick={handleAiDetect}
                    disabled={aiLoading}
                  >
                    {aiLoading ? '...' : '⚡ DETECT'}
                  </button>
                </div>
                <div style={{ marginTop: 10, fontSize: 8, letterSpacing: 1.5, color: 'var(--text-dim)' }}>
                  AUTO-CONFIGURES GENERATOR TO MATCH SITE REQUIREMENTS
                </div>
              </div>
            </div>
          </div>

          {/* Mode */}
          <div className="generator-panel">
            <div className="panel-header">
              <span className="panel-title">GENERATION MODE</span>
            </div>
            <div className="panel-body">
              <div className="mode-tabs">
                {['standard', 'pronounceable', 'passphrase'].map(m => (
                  <button
                    key={m}
                    className={`mode-tab ${opts.mode === m ? 'active' : ''}`}
                    onClick={() => set('mode', m)}
                  >
                    {m.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Character options */}
          <div className="generator-panel">
            <div className="panel-header">
              <span className="panel-title">CHARACTER OPTIONS</span>
            </div>
            <div className="panel-body">

              <div className="option-group">
                <span className="option-label">PASSWORD LENGTH</span>
                <input
                  className="input"
                  type="number"
                  min={4} max={128}
                  value={opts.length}
                  onChange={e => set('length', e.target.value)}
                  style={{ width: 100 }}
                />
              </div>

              <div className="option-group">
                <span className="option-label">CHARACTER SETS</span>
                <div className="toggle-grid">
                  {[
                    { key: 'upper',   label: 'UPPERCASE  A-Z' },
                    { key: 'lower',   label: 'LOWERCASE  a-z' },
                    { key: 'numbers', label: 'NUMBERS    0-9' },
                    { key: 'symbols', label: 'SYMBOLS    !@#' },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      className={`toggle-btn ${opts[key] ? 'active' : ''}`}
                      onClick={() => toggle(key)}
                    >
                      <span className={`toggle-dot ${opts[key] ? 'on' : ''}`} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {opts.symbols && (
                <div className="option-group">
                  <span className="option-label">ALLOWED SYMBOLS</span>
                  <input
                    className="input"
                    value={opts.customSymbols}
                    onChange={e => set('customSymbols', e.target.value)}
                    placeholder="!@#$%^&*"
                    style={{ letterSpacing: 3 }}
                  />
                </div>
              )}

              <div className="option-group">
                <button
                  className={`toggle-btn ${opts.excludeAmbiguous ? 'active' : ''}`}
                  onClick={() => toggle('excludeAmbiguous')}
                  style={{ width: '100%' }}
                >
                  <span className={`toggle-dot ${opts.excludeAmbiguous ? 'on' : ''}`} />
                  EXCLUDE AMBIGUOUS CHARS (0 O l 1 | I)
                </button>
              </div>

              <div className="option-group">
                <span className="option-label">EXCLUDE CUSTOM CHARACTERS</span>
                <input
                  className="input"
                  value={opts.excludeCustom}
                  onChange={e => set('excludeCustom', e.target.value)}
                  placeholder="e.g. @#&..."
                  style={{ letterSpacing: 3 }}
                />
              </div>
            </div>
          </div>

          {/* Minimum requirements */}
          <div className="generator-panel">
            <div className="panel-header">
              <span className="panel-title">MINIMUM REQUIREMENTS</span>
            </div>
            <div className="panel-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { key: 'minUpper',   label: 'MIN UPPERCASE' },
                  { key: 'minLower',   label: 'MIN LOWERCASE' },
                  { key: 'minNumbers', label: 'MIN NUMBERS'   },
                  { key: 'minSymbols', label: 'MIN SYMBOLS'   },
                ].map(({ key, label }) => (
                  <div className="option-group" key={key}>
                    <span className="option-label">{label}</span>
                    <input
                      className="input"
                      type="number"
                      min={0} max={10}
                      value={opts[key]}
                      onChange={e => set(key, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: output */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="generator-panel">
            <div className="panel-header">
              <span className="panel-title">GENERATED PASSWORD</span>
            </div>
            <div className="panel-body">
              <div className="pw-output">
                <div className="pw-display">{password}</div>
                <div className="pw-meta">
                  <div className="strength-bar">
                    <div
                      className="strength-fill"
                      style={{ width: `${strength}%`, background: strengthColor, boxShadow: `0 0 6px ${strengthColor}` }}
                    />
                  </div>
                  <span className="strength-label" style={{ color: strengthColor }}>
                    {strengthText} {strength}%
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button className="btn btn-primary" style={{ flex: 1 }}>
                  ⚡ GENERATE
                </button>
                <button className="btn btn-icon" onClick={handleCopy}>
                  {copied ? '✓' : '⧉'}
                </button>
              </div>

              <div style={{ fontSize: 8, letterSpacing: 2, color: 'var(--text-dim)', marginTop: 6 }}>
                LENGTH: {opts.length} CHARS
                &nbsp;·&nbsp;
                ENTROPY: ~{Math.round(parseInt(opts.length || 0) * 6.5)} BITS
              </div>
            </div>
          </div>

          <div className="generator-panel">
            <div className="panel-header">
              <span className="panel-title">QUICK SAVE</span>
            </div>
            <div className="panel-body">
              <div className="option-group">
                <span className="option-label">SAVE TO VAULT</span>
                <input className="input" placeholder="site / service name..." />
              </div>
              <button className="btn btn-primary" style={{ width: '100%' }}>
                🔒 SAVE TO VAULT
              </button>
            </div>
          </div>

          <div className="generator-panel">
            <div className="panel-header">
              <span className="panel-title">PASSWORD TIPS</span>
            </div>
            <div className="panel-body">
              {[
                'Use 16+ characters for strong security',
                'Avoid reusing passwords across sites',
                'Enable 2FA wherever available',
                'Use passphrase mode for memorable passwords',
              ].map((tip, i) => (
                <div key={i} style={{ fontSize: 8, letterSpacing: 1.2, color: 'var(--text-dim)', paddingBottom: 8, borderBottom: '1px solid var(--border)', marginBottom: 8, lineHeight: 1.6 }}>
                  <span style={{ color: 'var(--accent-1)', marginRight: 6 }}>›</span>
                  {tip.toUpperCase()}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
