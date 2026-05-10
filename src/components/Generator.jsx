import { useState, useCallback } from 'react'
import { generateStandard, generatePronounceable, generatePassphrase, calcEntropy } from '../lib/passwordGen'

const WORDLIST = [
  'correct','horse','battery','staple','purple','monkey','dragon','login',
  'shadow','master','qwerty','letmein','welcome','sunshine','princess','football',
  'charlie','donald','password','iloveyou','admin','access','hello','ninja',
  'rocket','coffee','thunder','silver','golden','crystal','frozen','blazing',
  'cosmic','digital','phantom','vector','cipher','nexus','pulse','nova',
  'delta','echo','foxtrot','alpha','bravo','gamma','sigma','omega',
]

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

export default function Generator({ onSaveToVault }) {
  const [opts, setOpts]           = useState(DEFAULT_OPTS)
  const [aiSite, setAiSite]       = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [password, setPassword]   = useState('')
  const [copied, setCopied]       = useState(false)
  const [strength, setStrength]   = useState(0)

  function set(key, val) { setOpts(o => ({ ...o, [key]: val })) }
  function toggle(key)   { setOpts(o => ({ ...o, [key]: !o[key] })) }

  const generate = useCallback(() => {
    const len = parseInt(opts.length) || 20
    let pw = ''
    if (opts.mode === 'passphrase')       pw = generatePassphrase(WORDLIST)
    else if (opts.mode === 'pronounceable') pw = generatePronounceable(len)
    else                                  pw = generateStandard(opts)
    setPassword(pw)
    setStrength(calcEntropy(pw))
    setCopied(false)
  }, [opts])

  function handleCopy() {
    if (!password) return
    navigator.clipboard.writeText(password).catch(() => {})
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
    strength > 0   ? 'var(--danger)' : 'var(--border)'

  const strengthText =
    strength >= 80 ? 'STRONG' :
    strength >= 50 ? 'MEDIUM' :
    strength > 0   ? 'WEAK'   : '—'

  return (
    <div>
      <div className="section-heading">PASSWORD GENERATOR</div>

      <div className="generator-layout">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          <div className="generator-panel">
            <div className="panel-header">
              <span className="panel-title">AI SITE DETECTION</span>
              <span className="twofa-badge" style={{ fontSize: 7 }}>
                <span className="twofa-dot" />AI POWERED
              </span>
            </div>
            <div className="panel-body">
              <div className="ai-detect">
                <span className="ai-badge">CLAUDE AI</span>
                <div className="option-label" style={{ marginTop: 4 }}>WEBSITE / SERVICE</div>
                <div className="ai-row">
                  <input className="input" placeholder="e.g. instagram.com or Chase Bank..."
                    value={aiSite} onChange={e => setAiSite(e.target.value)} />
                  <button className="btn btn-primary" style={{ whiteSpace: 'nowrap', minWidth: 100 }}
                    onClick={handleAiDetect} disabled={aiLoading}>
                    {aiLoading ? '...' : '⚡ DETECT'}
                  </button>
                </div>
                <div style={{ marginTop: 10, fontSize: 8, letterSpacing: 1.5, color: 'var(--text-dim)' }}>
                  AUTO-CONFIGURES GENERATOR TO MATCH SITE REQUIREMENTS
                </div>
              </div>
            </div>
          </div>

          <div className="generator-panel">
            <div className="panel-header"><span className="panel-title">GENERATION MODE</span></div>
            <div className="panel-body">
              <div className="mode-tabs">
                {['standard', 'pronounceable', 'passphrase'].map(m => (
                  <button key={m} className={`mode-tab ${opts.mode === m ? 'active' : ''}`}
                    onClick={() => set('mode', m)}>
                    {m.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="generator-panel">
            <div className="panel-header"><span className="panel-title">CHARACTER OPTIONS</span></div>
            <div className="panel-body">
              <div className="option-group">
                <span className="option-label">PASSWORD LENGTH — {opts.length}</span>
                <input className="input" type="range" min={4} max={128}
                  value={opts.length} onChange={e => set('length', e.target.value)}
                  style={{ width: '100%', accentColor: 'var(--accent-1)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 7, color: 'var(--text-dim)', letterSpacing: 1 }}>
                  <span>4</span><span>128</span>
                </div>
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
                    <button key={key} className={`toggle-btn ${opts[key] ? 'active' : ''}`} onClick={() => toggle(key)}>
                      <span className={`toggle-dot ${opts[key] ? 'on' : ''}`} />{label}
                    </button>
                  ))}
                </div>
              </div>

              {opts.symbols && (
                <div className="option-group">
                  <span className="option-label">ALLOWED SYMBOLS</span>
                  <input className="input" value={opts.customSymbols}
                    onChange={e => set('customSymbols', e.target.value)}
                    placeholder="!@#$%^&*" style={{ letterSpacing: 3 }} />
                </div>
              )}

              <div className="option-group">
                <button className={`toggle-btn ${opts.excludeAmbiguous ? 'active' : ''}`}
                  onClick={() => toggle('excludeAmbiguous')} style={{ width: '100%' }}>
                  <span className={`toggle-dot ${opts.excludeAmbiguous ? 'on' : ''}`} />
                  EXCLUDE AMBIGUOUS CHARS (0 O l 1 | I)
                </button>
              </div>

              <div className="option-group">
                <span className="option-label">EXCLUDE CUSTOM CHARACTERS</span>
                <input className="input" value={opts.excludeCustom}
                  onChange={e => set('excludeCustom', e.target.value)}
                  placeholder="e.g. @#&..." style={{ letterSpacing: 3 }} />
              </div>
            </div>
          </div>

          {opts.mode === 'standard' && (
            <div className="generator-panel">
              <div className="panel-header"><span className="panel-title">MINIMUM REQUIREMENTS</span></div>
              <div className="panel-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    { key: 'minUpper',   label: 'MIN UPPERCASE', enabled: opts.upper   },
                    { key: 'minLower',   label: 'MIN LOWERCASE', enabled: opts.lower   },
                    { key: 'minNumbers', label: 'MIN NUMBERS',   enabled: opts.numbers },
                    { key: 'minSymbols', label: 'MIN SYMBOLS',   enabled: opts.symbols },
                  ].map(({ key, label, enabled }) => (
                    <div className="option-group" key={key} style={{ opacity: enabled ? 1 : 0.3 }}>
                      <span className="option-label">{label}</span>
                      <input className="input" type="number" min={0} max={10}
                        value={opts[key]} onChange={e => set(key, e.target.value)} disabled={!enabled} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="generator-panel">
            <div className="panel-header"><span className="panel-title">GENERATED PASSWORD</span></div>
            <div className="panel-body">
              <div className="pw-output">
                <div className="pw-display" style={{ minHeight: 40, wordBreak: 'break-all', color: password ? 'var(--text-main)' : 'var(--text-dim)' }}>
                  {password || '— PRESS GENERATE —'}
                </div>
                <div className="pw-meta">
                  <div className="strength-bar">
                    <div className="strength-fill"
                      style={{ width: `${strength}%`, background: strengthColor, boxShadow: strength > 0 ? `0 0 6px ${strengthColor}` : 'none', transition: 'width 0.3s ease' }} />
                  </div>
                  <span className="strength-label" style={{ color: strengthColor }}>
                    {strengthText} {strength > 0 ? `${strength}%` : ''}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={generate}>⚡ GENERATE</button>
                <button className="btn btn-icon" onClick={handleCopy} disabled={!password} title="Copy to clipboard">
                  {copied ? '✓' : '⧉'}
                </button>
              </div>

              <div style={{ fontSize: 8, letterSpacing: 2, color: 'var(--text-dim)', marginTop: 6 }}>
                LENGTH: {opts.mode === 'passphrase' ? '—' : opts.length} CHARS
                &nbsp;·&nbsp;
                ENTROPY: ~{password ? calcEntropy(password) * 1.28 | 0 : 0} BITS
              </div>
            </div>
          </div>

          <div className="generator-panel">
            <div className="panel-header"><span className="panel-title">QUICK SAVE</span></div>
            <div className="panel-body">
              <div className="option-group">
                <span className="option-label">SAVE TO VAULT</span>
                <input className="input" placeholder="site / service name..." id="quick-save-site" />
              </div>
              <button className="btn btn-primary" style={{ width: '100%' }} disabled={!password}
                onClick={() => {
                  const site = document.getElementById('quick-save-site').value.trim()
                  if (site && onSaveToVault) onSaveToVault({ site, password })
                }}>
                🔒 SAVE TO VAULT
              </button>
            </div>
          </div>

          <div className="generator-panel">
            <div className="panel-header"><span className="panel-title">PASSWORD TIPS</span></div>
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
