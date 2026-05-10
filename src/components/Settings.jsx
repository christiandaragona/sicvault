import { useState } from 'react'
import { deriveKey, encryptVault, saveVaultToStorage, loadVaultFromStorage } from '../lib/crypto'
import { verifyTOTP } from '../lib/totp'
import { updateEmail } from '../lib/api'

function Panel({ title, children }) {
  return (
    <div style={{
      border: '1px solid var(--border-bright)', padding: '20px 24px',
      marginBottom: 20, background: 'var(--bg-1)',
    }}>
      <div className="section-heading" style={{ marginBottom: 16 }}>{title}</div>
      {children}
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div className="input-wrapper">{children}</div>
    </div>
  )
}

export default function Settings({ username, vault, vaultKey, onVaultUpdate }) {
  // Password change state
  const [pwTotp, setPwTotp]       = useState('')
  const [newPw, setNewPw]         = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwWorking, setPwWorking] = useState(false)
  const [pwMsg, setPwMsg]         = useState(null)

  // Email change state
  const [emailTotp, setEmailTotp] = useState('')
  const [newEmail, setNewEmail]   = useState('')
  const [emailWorking, setEmailWorking] = useState(false)
  const [emailMsg, setEmailMsg]   = useState(null)

  const totpSecret = vault?.settings?.totpSecret

  function flash(setter, text, ok = true) {
    setter({ text, ok })
    setTimeout(() => setter(null), 4000)
  }

  async function handlePasswordChange() {
    setPwMsg(null)
    if (!pwTotp || pwTotp.length < 6) return flash(setPwMsg, 'ENTER YOUR 6-DIGIT TOTP CODE', false)
    if (newPw.length < 8)             return flash(setPwMsg, 'NEW PASSWORD MUST BE AT LEAST 8 CHARACTERS', false)
    if (newPw !== confirmPw)          return flash(setPwMsg, 'PASSWORDS DO NOT MATCH', false)

    const ok = await verifyTOTP(totpSecret, pwTotp)
    if (!ok) return flash(setPwMsg, 'INVALID TOTP CODE', false)

    setPwWorking(true)
    try {
      const stored = loadVaultFromStorage(username)
      const newKey = await deriveKey(newPw, stored.salt)
      const { iv, ciphertext } = await encryptVault(newKey, vault)
      saveVaultToStorage(username, stored.salt, iv, ciphertext)
      onVaultUpdate(vault, newKey)
      setPwTotp(''); setNewPw(''); setConfirmPw('')
      flash(setPwMsg, 'PASSWORD UPDATED SUCCESSFULLY')
    } catch (e) {
      flash(setPwMsg, e.message || 'UPDATE FAILED', false)
    } finally {
      setPwWorking(false)
    }
  }

  async function handleEmailChange() {
    setEmailMsg(null)
    if (!emailTotp || emailTotp.length < 6) return flash(setEmailMsg, 'ENTER YOUR 6-DIGIT TOTP CODE', false)
    if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail))
      return flash(setEmailMsg, 'ENTER A VALID EMAIL ADDRESS', false)

    const ok = await verifyTOTP(totpSecret, emailTotp)
    if (!ok) return flash(setEmailMsg, 'INVALID TOTP CODE', false)

    setEmailWorking(true)
    try {
      const r = await updateEmail(username, newEmail)
      if (r.error) throw new Error(r.error)
      setEmailTotp(''); setNewEmail('')
      flash(setEmailMsg, 'EMAIL UPDATED SUCCESSFULLY')
    } catch (e) {
      flash(setEmailMsg, e.message || 'UPDATE FAILED', false)
    } finally {
      setEmailWorking(false)
    }
  }

  return (
    <div style={{ maxWidth: 520, padding: '28px 0' }}>

      <Panel title="CHANGE PASSWORD">
        <div style={{ fontSize: 8, color: 'var(--text-dim)', letterSpacing: 1.5, marginBottom: 16, lineHeight: 2 }}>
          YOUR VAULT WILL BE RE-ENCRYPTED WITH THE NEW PASSWORD.
        </div>

        <Field label="NEW PASSWORD">
          <input className="input" type="password" placeholder="new password (min 8 chars)..."
            value={newPw} onChange={e => setNewPw(e.target.value)} />
        </Field>

        <Field label="CONFIRM NEW PASSWORD">
          <input className="input" type="password" placeholder="confirm new password..."
            value={confirmPw} onChange={e => setConfirmPw(e.target.value)} />
        </Field>

        <Field label="TOTP CODE — 2FA REQUIRED">
          <input className="input" type="text" placeholder="000000" maxLength={6}
            style={{ letterSpacing: 6, textAlign: 'center' }}
            value={pwTotp} onChange={e => setPwTotp(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handlePasswordChange()} />
          <span className="input-icon">🔐</span>
        </Field>

        {pwMsg && (
          <div style={{ fontSize: 8, letterSpacing: 1.5, marginBottom: 12,
            color: pwMsg.ok ? 'var(--accent-1)' : 'var(--danger)' }}>
            {pwMsg.ok ? '✓' : '⚠'} {pwMsg.text}
          </div>
        )}

        <button className="btn btn-primary" onClick={handlePasswordChange} disabled={pwWorking}>
          {pwWorking ? 'UPDATING...' : '▶ UPDATE PASSWORD'}
        </button>
      </Panel>

      <Panel title="CHANGE EMAIL">
        <div style={{ fontSize: 8, color: 'var(--text-dim)', letterSpacing: 1.5, marginBottom: 16, lineHeight: 2 }}>
          UPDATE THE EMAIL ADDRESS ASSOCIATED WITH YOUR ACCOUNT.
        </div>

        <Field label="NEW EMAIL ADDRESS">
          <input className="input" type="email" placeholder="new@email.com"
            value={newEmail} onChange={e => setNewEmail(e.target.value)} />
        </Field>

        <Field label="TOTP CODE — 2FA REQUIRED">
          <input className="input" type="text" placeholder="000000" maxLength={6}
            style={{ letterSpacing: 6, textAlign: 'center' }}
            value={emailTotp} onChange={e => setEmailTotp(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleEmailChange()} />
          <span className="input-icon">🔐</span>
        </Field>

        {emailMsg && (
          <div style={{ fontSize: 8, letterSpacing: 1.5, marginBottom: 12,
            color: emailMsg.ok ? 'var(--accent-1)' : 'var(--danger)' }}>
            {emailMsg.ok ? '✓' : '⚠'} {emailMsg.text}
          </div>
        )}

        <button className="btn btn-primary" onClick={handleEmailChange} disabled={emailWorking}>
          {emailWorking ? 'UPDATING...' : '▶ UPDATE EMAIL'}
        </button>
      </Panel>

    </div>
  )
}
