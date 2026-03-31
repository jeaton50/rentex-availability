import { LocBadge, thStyle, tdStyle } from './components.jsx'

export default function LocationsTab({ rows, firstDate }) {
  const locs = [...new Set(rows.map(r => r.loc))].sort()

  const locStats = locs.map(loc => {
    const locRows = rows.filter(r => r.loc === loc)
    const own         = locRows.reduce((a, r) => a + (r.own         || 0), 0)
    const insp        = locRows.reduce((a, r) => a + (r.insp        || 0), 0)
    const repair      = locRows.reduce((a, r) => a + (r.repair      || 0), 0)
    const locked      = locRows.reduce((a, r) => a + (r.locked      || 0), 0)
    const quarantined = locRows.reduce((a, r) => a + (r.quarantined || 0), 0)
    const lateReturn  = locRows.reduce((a, r) => a + (r.lateReturn  || 0), 0)
    const availNow    = locRows.reduce((a, r) => a + Math.max(0, r.avail[firstDate] ?? 0), 0)
    const booked      = Math.max(0, own - locked - insp - repair - availNow)
    const openIfCleared = Math.max(0, own - locked)
    return { loc, own, insp, repair, locked, quarantined, lateReturn, availNow, booked, openIfCleared }
  })

  const cols = [
    { key: 'own',           label: 'Total Own',      color: '#ccc'          },
    { key: 'availNow',      label: 'Avail Today',    color: 'var(--green)'  },
    { key: 'booked',        label: 'Booked',         color: 'var(--blue)'   },
    { key: 'insp',          label: 'Inspection',     color: 'var(--yellow)' },
    { key: 'repair',        label: 'Repair',         color: '#ff4444'       },
    { key: 'quarantined',   label: 'Quarantined',    color: '#aa44ff'       },
    { key: 'lateReturn',    label: 'Late Return',    color: 'var(--orange)' },
    { key: 'locked',        label: 'Locked',         color: '#ff9944'       },
    { key: 'openIfCleared', label: 'Open If Cleared',color: 'var(--green)'  },
  ]

  // Totals row
  const totals = {}
  for (const c of cols) totals[c.key] = locStats.reduce((a, r) => a + r[c.key], 0)

  return (
    <div className="fade-in">
      <div style={{ color: 'var(--text-faint)', fontSize: 10, letterSpacing: 2, marginBottom: 16 }}>
        PER-LOCATION BREAKDOWN · ALL SKUS COMBINED
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={thStyle}>Location</th>
              {cols.map(c => (
                <th key={c.key} style={{ ...thStyle, textAlign: 'center', color: c.color }}>{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {locStats.map(row => (
              <tr key={row.loc} style={{ borderBottom: '1px solid #101014' }}>
                <td style={tdStyle}><LocBadge loc={row.loc} /></td>
                {cols.map(c => (
                  <td key={c.key} style={{ ...tdStyle, textAlign: 'center', color: row[c.key] > 0 ? c.color : '#333', fontWeight: c.key === 'own' || c.key === 'openIfCleared' ? 700 : 400 }}>
                    {row[c.key] > 0 ? row[c.key] : '—'}
                  </td>
                ))}
              </tr>
            ))}
            {/* Totals */}
            <tr style={{ borderTop: '2px solid var(--border)', background: '#111116' }}>
              <td style={{ ...tdStyle, color: '#888', fontWeight: 700, letterSpacing: 1 }}>TOTAL</td>
              {cols.map(c => (
                <td key={c.key} style={{ ...tdStyle, textAlign: 'center', color: c.color, fontWeight: 700 }}>
                  {totals[c.key]}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
