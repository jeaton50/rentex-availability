import { Pill, StatusBadge, thStyle, tdStyle } from './components.jsx'

export default function NetworkTab({ networkOverview, sortedSelectedDates, dateCols }) {
  return (
    <div className="fade-in">
      <div style={{ color: 'var(--text-faint)', fontSize: 10, letterSpacing: 2, marginBottom: 16 }}>
        NETWORK-WIDE TOTALS · ALL LOCATIONS COMBINED · NO LOCATION BREAKDOWN
      </div>

      {networkOverview.map(item => {
        const dates     = sortedSelectedDates
        const minLeft   = Math.min(...dates.map(dk => item.dateStats[dk].leftover))
        const okDates   = dates.filter(dk => item.dateStats[dk].totalShortage === 0).length
        const covDates  = dates.filter(dk => item.dateStats[dk].totalShortage > 0 && item.dateStats[dk].stillShort === 0).length
        const critDates = dates.filter(dk => item.dateStats[dk].stillShort > 0).length

        return (
          <div key={item.sku} style={{
            marginBottom: 20, background: 'var(--bg2)',
            border: '1px solid var(--border2)', borderRadius: 4, padding: '16px 18px',
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
              <span style={{ color: 'var(--blue)', fontWeight: 700, fontSize: 16, fontFamily: 'var(--display)' }}>
                {item.sku}
              </span>
              <span style={{ color: 'var(--text-dim)', fontSize: 11 }}>{item.desc}</span>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 18, alignItems: 'baseline' }}>
                <Pill label="Total Own"  value={item.totalOwn}    color="#999" />
                {item.totalInsp   > 0 && <Pill label="In Insp"   value={item.totalInsp}   color="var(--yellow)" />}
                {item.totalLocked > 0 && <Pill label="Locked"    value={item.totalLocked} color="var(--orange)" />}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
              <StatusBadge label={`${okDates} dates OK`} color="var(--green)" />
              {covDates  > 0 && <StatusBadge label={`${covDates} covered by transfer`}  color="var(--yellow)" />}
              {critDates > 0 && <StatusBadge label={`${critDates} CRITICAL`}             color="var(--red)"    />}
              <StatusBadge
                label={`Min leftover: ${minLeft}`}
                color={minLeft > 5 ? 'var(--green)' : minLeft > 0 ? 'var(--yellow)' : '#666'}
              />
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ borderCollapse: 'collapse', fontSize: 11, width: '100%', minWidth: 460 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={thStyle}>Date</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>Network Avail</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>Shortage</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>Leftover</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dates.map(dk => {
                    const s      = item.dateStats[dk]
                    const status = s.totalShortage > 0 ? (s.stillShort > 0 ? 'CRITICAL' : 'COVERED') : 'OK'
                    const sc     = { OK: 'var(--green)', COVERED: 'var(--yellow)', CRITICAL: 'var(--red)' }[status]
                    return (
                      <tr key={dk} style={{
                        borderBottom: '1px solid #111116',
                        background: s.totalShortage > 0 ? '#120d0d' : 'transparent',
                      }}>
                        <td style={tdStyle}>{dateCols[dk] || dk}</td>
                        <td style={{ ...tdStyle, textAlign: 'center', color: s.totalAvail < 0 ? 'var(--red)' : '#ccc', fontWeight: 600 }}>
                          {s.totalAvail}
                        </td>
                        <td style={{ ...tdStyle, textAlign: 'center', color: 'var(--red)', fontWeight: 700 }}>
                          {s.totalShortage > 0 ? `−${s.totalShortage}` : '—'}
                        </td>
                        <td style={{
                          ...tdStyle, textAlign: 'center', fontWeight: 700,
                          color: s.leftover > 10 ? 'var(--green)' : s.leftover > 0 ? 'var(--yellow)' : s.leftover === 0 ? '#555' : 'var(--red)',
                        }}>
                          {s.leftover}
                        </td>
                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                          <span style={{
                            color: sc, background: sc + '18', border: `1px solid ${sc}33`,
                            padding: '2px 8px', borderRadius: 2, fontSize: 10, fontWeight: 700,
                          }}>
                            {status}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      })}
    </div>
  )
}
