import { LocBadge, thStyle, tdStyle } from './components.jsx'

export default function InspectionTab({ rows, inspToggles, setInspToggles }) {
  const inspItems = rows.filter(r => r.insp > 0 || r.locked > 0 || r.repair > 0)
  const anyOn     = Object.values(inspToggles).some(Boolean)

  const totalInsp   = inspItems.reduce((a, r) => a + r.insp,   0)
  const totalRepair = inspItems.reduce((a, r) => a + r.repair, 0)
  const totalLocked = inspItems.reduce((a, r) => a + r.locked, 0)

  if (inspItems.length === 0) {
    return <div style={{ color: 'var(--text-dim)', fontSize: 15 }}>No items currently in inspection, repair, or locked.</div>
  }

  return (
    <div className="fade-in">
      <div style={{ color: 'var(--text-faint)', fontSize: 13, letterSpacing: 2, marginBottom: 14 }}>
        UNITS IN INSPECTION, REPAIR, OR LOCKED ATTACH — TOGGLE TO ADD TO AVAILABILITY
      </div>

      {/* Summary counts */}
      <div style={{ display: 'flex', gap: 28, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { label: 'In Inspection', value: totalInsp,   color: 'var(--yellow)' },
          { label: 'In Repair',     value: totalRepair, color: 'var(--red)'    },
          { label: 'Locked Attach', value: totalLocked, color: 'var(--orange)' },
        ].map(s => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ color: s.color, fontSize: 28, fontWeight: 700, lineHeight: 1, fontFamily: 'var(--display)' }}>
              {s.value}
            </span>
            <span style={{ color: 'var(--text-faint)', fontSize: 13, letterSpacing: 1 }}>
              {s.label.toUpperCase()}
            </span>
          </div>
        ))}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['SKU', 'Description', 'Location', 'In Inspection', 'In Repair', 'Locked Attach.', 'Include?'].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {inspItems.map(r => {
              const key = `${r.sku}_${r.loc}`
              const on  = !!inspToggles[key]
              return (
                <tr key={key} style={{ borderBottom: '1px solid #13131a' }}>
                  <td style={{ ...tdStyle, color: 'var(--yellow)', fontWeight: 700 }}>{r.sku}</td>
                  <td style={{ ...tdStyle, color: 'var(--text-dim)' }}>{r.desc}</td>
                  <td style={tdStyle}><LocBadge loc={r.loc} /></td>
                  <td style={{ ...tdStyle, color: 'var(--yellow)', textAlign: 'center' }}>{r.insp   > 0 ? r.insp   : '—'}</td>
                  <td style={{ ...tdStyle, color: 'var(--red)',    textAlign: 'center' }}>{r.repair > 0 ? r.repair : '—'}</td>
                  <td style={{ ...tdStyle, color: 'var(--orange)', textAlign: 'center' }}>{r.locked > 0 ? r.locked : '—'}</td>
                  <td style={tdStyle}>
                    {r.insp > 0 ? (
                      <button
                        onClick={() => setInspToggles(p => ({ ...p, [key]: !p[key] }))}
                        style={{
                          padding: '6px 16px', fontSize: 13, cursor: 'pointer',
                          borderRadius: 4, border: '1px solid',
                          background: on ? 'var(--yellow)' : 'transparent',
                          borderColor: on ? 'var(--yellow)' : '#333344',
                          color: on ? '#000' : 'var(--text-dim)',
                          fontFamily: 'var(--mono)', fontWeight: on ? 700 : 400,
                          letterSpacing: 1, transition: 'all 0.14s',
                        }}
                      >
                        {on ? '✓ INCLUDED' : 'EXCLUDED'}
                      </button>
                    ) : (
                      <span style={{ color: '#444455', fontSize: 13 }}>—</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {anyOn && (
        <div style={{
          marginTop: 24, padding: '14px 18px',
          background: '#0c130a', border: '1px solid #1e3014', borderRadius: 5,
        }}>
          <div style={{ color: 'var(--green)', fontSize: 13, letterSpacing: 2, marginBottom: 10 }}>
            IMPACT OF INCLUSIONS
          </div>
          {rows.filter(r => inspToggles[`${r.sku}_${r.loc}`]).map(r => (
            <div key={`${r.sku}_${r.loc}`} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6, fontSize: 14 }}>
              <span style={{ color: 'var(--green)', fontWeight: 700 }}>{r.sku}</span>
              <LocBadge loc={r.loc} />
              <span style={{ color: 'var(--text-dim)' }}>+{r.insp} units added across all date windows</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
