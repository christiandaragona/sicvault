export default function Logo({ locked = true, size = 38 }) {
  const h = size * 1.25

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <svg width={size} height={h} viewBox="0 0 40 50" fill="none"
        style={{ filter: 'drop-shadow(0 0 6px var(--glow))' }}>

        {/* ── 3-D lock body ── */}
        {/* Right side face (darkest) */}
        <path d="M33,22 L38,17 L38,43 L33,48 Z"
          fill="var(--bg-0)" stroke="var(--border)" strokeWidth="0.5"/>

        {/* Top face */}
        <path d="M5,22 L33,22 L38,17 L10,17 Z"
          fill="var(--bg-3)" stroke="var(--accent-1)" strokeWidth="0.8"/>

        {/* Front face */}
        <rect x="5" y="22" width="28" height="26" rx="1"
          fill="var(--bg-1)" stroke="var(--accent-1)" strokeWidth="1.5"/>

        {/* Front face inner highlight line */}
        <rect x="7" y="24" width="24" height="22" rx="0.5"
          fill="none" stroke="var(--accent-1)" strokeWidth="0.4" opacity="0.3"/>

        {/* ── Shackle ── */}
        {locked ? (
          /* Locked — both posts engaged */
          <>
            {/* 3-D shackle right side face */}
            <path d="M27,22 L27,11 Q27,4 19.5,4 Q12,4 12,11 L12,22 L15,22 L15,11
                     Q15,7 19.5,7 Q24,7 24,11 L24,22 Z"
              fill="var(--bg-0)" opacity="0.5"/>
            {/* Shackle main */}
            <path d="M12,22 L12,11 Q12,4 20,4 Q28,4 28,11 L28,22"
              stroke="var(--accent-1)" strokeWidth="4" strokeLinecap="square" fill="none"/>
            {/* Shackle highlight */}
            <path d="M12,22 L12,11 Q12,4 20,4 Q28,4 28,11 L28,22"
              stroke="var(--accent-2)" strokeWidth="1" strokeLinecap="square" fill="none" opacity="0.5"/>
          </>
        ) : (
          /* Unlocked — right post lifted and swung open */
          <>
            {/* Left post (still in lock) */}
            <line x1="12" y1="22" x2="12" y2="8"
              stroke="var(--accent-1)" strokeWidth="4" strokeLinecap="square"/>
            <line x1="12" y1="22" x2="12" y2="8"
              stroke="var(--accent-2)" strokeWidth="1" strokeLinecap="square" opacity="0.5"/>

            {/* Arc across top */}
            <path d="M12,8 Q12,4 20,4 Q28,4 28,4"
              stroke="var(--accent-1)" strokeWidth="4" strokeLinecap="square" fill="none"/>
            <path d="M12,8 Q12,4 20,4 Q28,4 28,4"
              stroke="var(--accent-2)" strokeWidth="1" strokeLinecap="square" fill="none" opacity="0.5"/>

            {/* Right post swung out (horizontal) */}
            <line x1="28" y1="4" x2="38" y2="4"
              stroke="var(--accent-1)" strokeWidth="4" strokeLinecap="square"/>
            <line x1="28" y1="4" x2="38" y2="4"
              stroke="var(--accent-2)" strokeWidth="1" strokeLinecap="square" opacity="0.5"/>
          </>
        )}

        {/* ── Keyhole ── */}
        <circle cx="19" cy="32" r="3.5"
          fill="var(--bg-0)" stroke="var(--accent-2)" strokeWidth="1.5"/>
        <rect x="17.5" y="33" width="3" height="5" rx="0.5"
          fill="var(--accent-2)" opacity="0.9"/>

        {/* ── Glow edge on front face ── */}
        <rect x="5" y="22" width="28" height="26" rx="1"
          fill="none" stroke="var(--accent-2)" strokeWidth="0.5" opacity="0.2"/>
      </svg>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{
          fontFamily: 'Modeseven, monospace',
          fontSize: 13,
          letterSpacing: 3,
          color: 'var(--text-primary)',
          textShadow: 'var(--glow-text)',
          lineHeight: 1,
        }}>
          SICVAULT
        </span>
        <span style={{
          fontFamily: 'Modeseven, monospace',
          fontSize: 7,
          letterSpacing: 2,
          color: 'var(--text-dim)',
          lineHeight: 1,
        }}>
          {locked ? 'VAULT LOCKED' : 'VAULT OPEN'}
        </span>
      </div>
    </div>
  )
}
