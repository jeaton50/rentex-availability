import { useState } from 'react'
import { LocBadge, thStyle, tdStyle } from './components.jsx'

export default function InspectionTab({ rows, inspToggles, setInspToggles, posterAdditions, setPosterAdditions, dateColKeys, dateCols }) {
  const inspItems = rows.filter(r => r.insp > 0 || r.locked > 0 || r.repair > 0 || r.quarantined > 0)
  const anyOn     = Object.values(inspToggles).some(Boolean)

  const totalInsp        = inspItems.reduce((a, r) => a + (r.insp        || 0), 0)
  const totalRepair      = inspItems.reduce((a, r) => a + (r.repair      || 0), 0)
  const totalLocked      = inspItems.reduce((a, r) => a + (r.locked      || 0), 0)
  const totalQuarantined = inspItems.reduce((a, r) => a + (r.quarantined || 0), 0)

  // poster SKUs for the additions UI
  const posterSkus = [...new Set(rows.filter(r => r.desc.toLowerCase().includes('poster')).map(r => r.sku))].sort()

  const [addSku,  setAddSku]  = useState(posterSkus[0] || '')
  const [addDate, setAddDate] = useState(dateColKeys?.[0] ?? '')
  const [addQty,  setAddQty]  = useState('')

  const additionEntries = Object.entries(posterAdditions)
    .map(([key, qty]) => { const [sku, dk] = key.split('__'); return { key, sku, dk: Number(dk), qty } })
    .sort((a, b) => a.sku.localeCompare(b.sku) || a.dk - b.dk)

  function handleAdd() {
    const qty = parseInt(addQty, 10)
    if (!addSku || !addDate || isNaN(qty) || qty <= 0) return
    const key = `${addSku}__${addDate}`
    setPosterAdditions(p => ({ ...p, [key]: (p[key] || 0) + qty }))
    setAddQty('')
  }

  function handleRemove(key) {
    setPosterAdditions(p => { const n = { ...p }; delete n[key]; return n })
  }

  const selectStyle = {
    background: '#0f1020', border: '1px solid var(--border2)', borderRadius: 4,
    color: 'var(--text)', fontSize: 13, padding: '6px 10px', fontFamily: 'var(--mono)',
    cursor: 'pointer',
  }
  const inputStyle = {
    ...selectStyle, width: 80, textAlign: 'center',
  }

  return (
    <div className="fade-in">
      <div style={{ color: 'var(--text-faint)', fontSize: 13, letterSpacing: 2, marginBottom: 14 }}>
        UNITS IN INSPECTION, REPAIR, QUARANTINE, OR LOCKED ATTACH — TOGGLE TO ADD TO AVAILABILITY
      </div>

      {/* Summary counts */}
      <div style={{ display: 'flex', gap: 28, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { label: 'In Inspection', value: totalInsp,        color: 'var(--yellow)' },
          { label: 'In Repair',     value: totalRepair,      color: 'var(--red)'    },
          { label: 'Quarantined',   value: totalQuarantined, color: '#bb66ff'       },
          { label: 'Locked Attach', value: totalLocked,      color: 'var(--orange)' },
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

      {inspItems.length === 0 ? (
        <div style={{ color: 'var(--text-dim)', fontSize: 15, marginBottom: 24 }}>No items currently in inspection, repair, or locked.</div>
      ) : (
        <>
          <div style={{ overflowX: 'auto', marginBottom: 24 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['SKU', 'Description', 'Location', 'In Inspection', 'In Repair', 'Quarantined', 'Locked Attach.', 'Include?'].map(h => (
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
                      <td style={{ ...tdStyle, color: 'var(--yellow)', textAlign: 'center' }}>{r.insp        > 0 ? r.insp        : '—'}</td>
                      <td style={{ ...tdStyle, color: 'var(--red)',    textAlign: 'center' }}>{r.repair      > 0 ? r.repair      : '—'}</td>
                      <td style={{ ...tdStyle, color: '#bb66ff',       textAlign: 'center' }}>{r.quarantined > 0 ? r.quarantined : '—'}</td>
                      <td style={{ ...tdStyle, color: 'var(--orange)', textAlign: 'center' }}>{r.locked      > 0 ? r.locked      : '—'}</td>
                      <td style={tdStyle}>
                        {(r.insp > 0 || r.repair > 0 || r.quarantined > 0 || r.locked > 0) ? (
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
              marginBottom: 24, padding: '14px 18px',
              background: '#0c130a', border: '1px solid #1e3014', borderRadius: 5,
            }}>
              <div style={{ color: 'var(--green)', fontSize: 13, letterSpacing: 2, marginBottom: 10 }}>
                IMPACT OF INCLUSIONS
              </div>
              {rows.filter(r => inspToggles[`${r.sku}_${r.loc}`]).map(r => (
                <div key={`${r.sku}_${r.loc}`} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6, fontSize: 14 }}>
                  <span style={{ color: 'var(--green)', fontWeight: 700 }}>{r.sku}</span>
                  <LocBadge loc={r.loc} />
                  <span style={{ color: 'var(--text-dim)' }}>+{(r.insp || 0) + (r.repair || 0) + (r.quarantined || 0) + (r.locked || 0)} units added across all date windows</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── MANUAL POSTER ADDITIONS ── */}
      {posterSkus.length > 0 && (
        <div style={{ border: '1px solid var(--border2)', borderRadius: 5, padding: '18px 20px' }}>
          <div style={{ color: 'var(--text-faint)', fontSize: 13, letterSpacing: 2, marginBottom: 16 }}>
            MANUAL POSTER ADDITIONS — ADD EXPECTED INVENTORY BY DATE
          </div>

          {/* Add row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
            <select value={addSku} onChange={e => setAddSku(e.target.value)} style={selectStyle}>
              {posterSkus.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <select value={addDate} onChange={e => setAddDate(e.target.value)} style={selectStyle}>
              {dateColKeys.map(dk => (
                <option key={dk} value={dk}>{dateCols[dk] || dk}</option>
              ))}
            </select>

            <input
              type="number" min="1" placeholder="Qty"
              value={addQty} onChange={e => setAddQty(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              style={inputStyle}
            />

            <button onClick={handleAdd} style={{
              padding: '6px 18px', fontSize: 13, cursor: 'pointer', borderRadius: 4,
              border: '1px solid var(--green)', background: '#0c1a0c',
              color: 'var(--green)', fontFamily: 'var(--mono)', fontWeight: 700,
              letterSpacing: 1, transition: 'all 0.12s',
            }}>
              + ADD
            </button>
          </div>

          {/* Current additions list */}
          {additionEntries.length === 0 ? (
            <div style={{ color: '#444455', fontSize: 13 }}>No manual additions yet.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['SKU', 'Date', 'Added Qty', ''].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {additionEntries.map(({ key, sku, dk, qty }) => (
                  <tr key={key} style={{ borderBottom: '1px solid #13131a' }}>
                    <td style={{ ...tdStyle, color: 'var(--yellow)', fontWeight: 700 }}>{sku}</td>
                    <td style={{ ...tdStyle, color: 'var(--text-dim)' }}>{dateCols[dk] || dk}</td>
                    <td style={{ ...tdStyle, color: 'var(--green)', fontWeight: 700 }}>+{qty}</td>
                    <td style={tdStyle}>
                      <button onClick={() => handleRemove(key)} style={{
                        padding: '4px 12px', fontSize: 12, cursor: 'pointer', borderRadius: 3,
                        border: '1px solid #3a1a1a', background: 'transparent',
                        color: '#774444', fontFamily: 'var(--mono)',
                        transition: 'all 0.12s',
                      }}>
                        REMOVE
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}
