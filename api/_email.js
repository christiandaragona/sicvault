import { Resend } from 'resend'

export const resend   = new Resend(process.env.RESEND_API_KEY)
export const FROM     = process.env.FROM_EMAIL || 'SicVault <noreply@sicvault.app>'
export const APP_URL  = process.env.APP_URL    || 'https://sicvault.vercel.app'

export function cyberpunkEmail(title, bodyHtml) {
  return `
    <div style="font-family:monospace;background:#080f08;color:#ECF39E;padding:32px;max-width:480px;border:1px solid #90A955;">
      <h2 style="letter-spacing:4px;font-size:13px;margin:0 0 4px;">SICVAULT</h2>
      <div style="font-size:8px;letter-spacing:5px;color:#4F772D;margin-bottom:20px;">${title}</div>
      <hr style="border:none;border-top:1px solid #31572C;margin-bottom:20px;" />
      ${bodyHtml}
      <p style="font-size:9px;color:#31572C;margin-top:28px;letter-spacing:1px;">
        VAULT ENCRYPTED · AES-256-GCM · PBKDF2
      </p>
    </div>
  `
}
