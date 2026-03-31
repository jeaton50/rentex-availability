import { LOC_COLORS } from './data.js'

export function LocBadge({ loc }) {
  const c = LOC_COLORS[loc] || '#888'
  return (
    <span style={{
      background: c + '28', color: c, border: `1px solid ${c}55`,
      padding: '3px 10px', borderRadius: 4,
      fontSize: 13, letterSpacing: 1, fontWeight: 700, whiteSpace: 'nowrap',
    }}>
      {loc}
    </span>
  )
}

export function SectionLabel({ label, color = 'var(--accent)' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
      <div style={{ width: 4, height: 16, background: color, borderRadius: 2 }} />
      <span style={{ color, fontSize: 13, letterSpacing: 3, fontWeight: 700 }}>
        {label.toUpperCase()}
      </span>
    </div>
  )
}

export function Pill({ label, value, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
      <span style={{ color, fontWeight: 700, fontSize: 18 }}>{value}</span>
      <span style={{ color: 'var(--text-dim)', fontSize: 13 }}>{label}</span>
    </div>
  )
}

export function StatusBadge({ label, color }) {
  return (
    <span style={{
      color, background: color + '22', border: `1px solid ${color}44`,
      padding: '4px 12px', borderRadius: 3, fontSize: 13, fontWeight: 600,
    }}>
      {label}
    </span>
  )
}

export function MiniBtn({ onClick, color, children, style = {} }) {
  return (
    <button onClick={onClick} style={{
      padding: '5px 14px', fontSize: 13, cursor: 'pointer',
      borderRadius: 4, border: `1px solid ${color}55`,
      background: `${color}22`, color,
      fontFamily: 'var(--mono)', letterSpacing: 1,
      transition: 'all 0.12s', ...style,
    }}>
      {children}
    </button>
  )
}

export const thStyle = {
  textAlign: 'left', padding: '10px 14px',
  color: 'var(--text-dim)', fontSize: 13,
  letterSpacing: 2, textTransform: 'uppercase',
  borderBottom: '1px solid var(--border)',
}
export const tdStyle = { padding: '10px 14px', color: '#c0c0d4', fontSize: 14 }
