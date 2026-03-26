import { LOC_COLORS } from './data.js'

export function LocBadge({ loc }) {
  const c = LOC_COLORS[loc] || '#888'
  return (
    <span style={{
      background: c + '20', color: c, border: `1px solid ${c}40`,
      padding: '2px 7px', borderRadius: 3,
      fontSize: 10, letterSpacing: 1, fontWeight: 700, whiteSpace: 'nowrap',
    }}>
      {loc}
    </span>
  )
}

export function SectionLabel({ label, color = 'var(--accent)' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
      <div style={{ width: 3, height: 13, background: color, borderRadius: 2 }} />
      <span style={{ color, fontSize: 10, letterSpacing: 3, fontWeight: 700 }}>
        {label.toUpperCase()}
      </span>
    </div>
  )
}

export function Pill({ label, value, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
      <span style={{ color, fontWeight: 700, fontSize: 14 }}>{value}</span>
      <span style={{ color: 'var(--text-dim)', fontSize: 10 }}>{label}</span>
    </div>
  )
}

export function StatusBadge({ label, color }) {
  return (
    <span style={{
      color, background: color + '18', border: `1px solid ${color}33`,
      padding: '2px 9px', borderRadius: 2, fontSize: 10, fontWeight: 600,
    }}>
      {label}
    </span>
  )
}

export function MiniBtn({ onClick, color, children, style = {} }) {
  return (
    <button onClick={onClick} style={{
      padding: '3px 10px', fontSize: 10, cursor: 'pointer',
      borderRadius: 3, border: `1px solid ${color}44`,
      background: `${color}18`, color,
      fontFamily: 'var(--mono)', letterSpacing: 1,
      transition: 'all 0.12s', ...style,
    }}>
      {children}
    </button>
  )
}

export const thStyle = {
  textAlign: 'left', padding: '7px 10px',
  color: 'var(--text-dim)', fontSize: 10,
  letterSpacing: 2, textTransform: 'uppercase',
  borderBottom: '1px solid var(--border)',
}
export const tdStyle = { padding: '7px 10px', color: '#999' }
