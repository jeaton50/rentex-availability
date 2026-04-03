import { useState } from 'react'
import { LocBadge, thStyle, tdStyle } from './components.jsx'
import { LOC_COLORS } from './data.js'

export default function OrdersTab({ orders, dateCols }) {
  const [selectedDate, setSelectedDate] = useState(dateCols[0]?.iso || null)
  const [filterSku,    setFilterSku]    = useState('ALL')

  const skus = ['ALL', ...new Set(orders.map(o => o.sku))].sort()

  // Orders active on selectedDate: pullDate <= date <= returnDate
  const activeOrders = orders.filter(o => {
    const inDate = (!o.pullDate || o.pullDate <= selectedDate) &&
                   (!o.returnDate || o.returnDate >= selectedDate)
    const inSku  = filterSku === 'ALL' || o.sku === filterSku
    return inDate && inSku
  })

  // Per-SKU summary for active date
  const skuSummary = [...new Set(activeOrders.map(o => o.sku))].sort().map(sku => {
    const rows   = activeOrders.filter(o => o.sku === sku)
    const total  = rows.reduce((a, o) => a + o.qty, 0)
    const byLoc  = {}
    rows.forEach(o => { byLoc[o.loc] = (byLoc[o.loc] || 0) + o.qty })
    return { sku, total, byLoc, orderCount: rows.length }
  })

  const totalBooked = activeOrders.reduce((a, o) => a + o.qty, 0)

  const selectStyle = {
    background: '#0f1020', border: '1px solid var(--border2)', borderRadius: 4,
    color: 'var(--text)', fontSize: 13, padding: '6px 10px', fontFamily: 'var(--mono)',
    cursor: 'pointer',
  }

  return (
    <div className="fade-in">
      <div style={{ color: 'var(--text-faint)', fontSize: 13, letterSpacing: 2, marginBottom: 16 }}>
        ORDERS & BOOKINGS · SELECT A DATE TO SEE ACTIVE ORDERS
      </div>

      {/* Summary stat */}
      <div style={{ display: 'flex', gap: 28, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { label: 'Total Orders',  value: orders.length,        color: 'var(--text)' },
          { label: 'Active On Date',value: activeOrders.length,  color: 'var(--blue)' },
          { label: 'Units Booked',  value: totalBooked,          color: 'var(--accent)' },
          { label: 'SKUs Active',   value: skuSummary.length,    color: 'var(--yellow)' },
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

      {/* Date selector */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 5, padding: '12px 16px', marginBottom: 20 }}>
        <div style={{ color: 'var(--text-faint)', fontSize: 12, letterSpacing: 2, marginBottom: 10 }}>SELECT DATE</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {dateCols.map(({ iso, label }) => {
            const active = activeOrders.filter(o => o.pullDate <= iso && o.returnDate >= iso)
            const count  = active.reduce((a, o) => a + o.qty, 0)
            const sel    = iso === selectedDate
            return (
              <button key={iso} onClick={() => setSelectedDate(iso)} style={{
                padding: '6px 12px', fontSize: 13, cursor: 'pointer', borderRadius: 4,
                border: '1px solid',
                borderColor: sel ? 'var(--blue)' : count > 0 ? '#1a3040' : 'var(--border)',
                background:  sel ? '#4db6ff20'   : count > 0 ? '#0a1520' : 'transparent',
                color:       sel ? 'var(--blue)'  : count > 0 ? '#4488aa' : 'var(--text-dim)',
                fontFamily: 'var(--mono)', fontWeight: sel ? 700 : 400,
                transition: 'all 0.1s',
              }}>
                {label}
                {count > 0 && (
                  <span style={{ marginLeft: 5, fontSize: 11, color: sel ? 'var(--blue)' : '#446688' }}>
                    ({count})
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* SKU filter + per-SKU summary */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
        <span style={{ color: 'var(--text-faint)', fontSize: 13 }}>FILTER SKU:</span>
        <select value={filterSku} onChange={e => setFilterSku(e.target.value)} style={selectStyle}>
          {skus.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Per-SKU breakdown cards */}
      {skuSummary.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
          {skuSummary.map(({ sku, total, byLoc, orderCount }) => (
            <div key={sku} style={{
              background: 'var(--bg2)', border: '1px solid var(--border2)',
              borderRadius: 5, padding: '14px 16px', minWidth: 200,
            }}>
              <div style={{ color: 'var(--yellow)', fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{sku}</div>
              <div style={{ display: 'flex', gap: 16, marginBottom: 10 }}>
                <div>
                  <div style={{ color: 'var(--accent)', fontSize: 22, fontWeight: 700 }}>{total}</div>
                  <div style={{ color: 'var(--text-faint)', fontSize: 11 }}>UNITS</div>
                </div>
                <div>
                  <div style={{ color: 'var(--blue)', fontSize: 22, fontWeight: 700 }}>{orderCount}</div>
                  <div style={{ color: 'var(--text-faint)', fontSize: 11 }}>ORDERS</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {Object.entries(byLoc).sort((a,b) => b[1]-a[1]).map(([loc, qty]) => {
                  const c = LOC_COLORS[loc] || '#888'
                  return (
                    <span key={loc} style={{
                      background: c + '22', color: c, border: `1px solid ${c}44`,
                      padding: '2px 8px', borderRadius: 3, fontSize: 12, fontWeight: 600,
                    }}>
                      {loc} ×{qty}
                    </span>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full orders table */}
      <div style={{ color: 'var(--text-faint)', fontSize: 12, letterSpacing: 2, marginBottom: 10 }}>
        {activeOrders.length === 0 ? 'NO ACTIVE ORDERS ON THIS DATE' : `${activeOrders.length} ACTIVE ORDERS ON ${dateCols.find(d => d.iso === selectedDate)?.label || selectedDate}`}
      </div>

      {activeOrders.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Order #', 'SKU', 'Location', 'Qty', 'Pull', 'Return', 'Job Title', 'Customer', 'Agent'].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activeOrders
                .sort((a, b) => a.sku.localeCompare(b.sku) || a.loc.localeCompare(b.loc))
                .map((o, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #13131a' }}>
                  <td style={{ ...tdStyle, color: 'var(--text-dim)', fontSize: 12 }}>{o.orderNum}</td>
                  <td style={{ ...tdStyle, color: 'var(--yellow)', fontWeight: 700 }}>{o.sku}</td>
                  <td style={tdStyle}><LocBadge loc={o.loc} /></td>
                  <td style={{ ...tdStyle, color: 'var(--accent)', fontWeight: 700, textAlign: 'center' }}>{o.qty}</td>
                  <td style={{ ...tdStyle, color: 'var(--text-dim)', fontSize: 12 }}>{o.pullDate ? o.pullDate.slice(5) : '—'}</td>
                  <td style={{ ...tdStyle, color: 'var(--text-dim)', fontSize: 12 }}>{o.returnDate ? o.returnDate.slice(5) : '—'}</td>
                  <td style={{ ...tdStyle, color: 'var(--text-dim)', fontSize: 12, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.jobTitle || '—'}</td>
                  <td style={{ ...tdStyle, color: 'var(--text-dim)', fontSize: 12, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.customer || '—'}</td>
                  <td style={{ ...tdStyle, color: 'var(--text-dim)', fontSize: 12 }}>{o.agent || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
