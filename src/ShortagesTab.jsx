import { LocBadge, SectionLabel } from './components.jsx'

export default function ShortagesTab({ worstCasePlans, allPlans, allShortagesByDate, sortedSelectedDates, selectedDates, dateCols }) {
  if (worstCasePlans.length === 0) {
    return (
      <div style={{ color: 'var(--green)', padding: '28px 0', fontSize: 14 }}>
        ✓ No shortages across selected dates.
      </div>
    )
  }

  return (
    <div className="fade-in">
      <div style={{ color: 'var(--text-faint)', fontSize: 10, letterSpacing: 2, marginBottom: 16 }}>
        WORST-CASE DATE PER SHORTAGE ·{' '}
        {selectedDates.size > 1
          ? `ACROSS ${selectedDates.size} DATES`
          : (dateCols[[...selectedDates][0]] || '').toUpperCase()}
      </div>

      {worstCasePlans.map(plan => {
        const affectedDates = sortedSelectedDates.filter(dk =>
          (allPlans[dk] || []).find(p => p.neg.sku === plan.neg.sku && p.neg.loc === plan.neg.loc)
        )
        return (
          <div key={`${plan.neg.sku}_${plan.neg.loc}`} className="slide-in" style={{
            marginBottom: 14, background: 'var(--bg2)',
            border: '1px solid #241818', borderLeft: '3px solid var(--accent)',
            borderRadius: 4, padding: '14px 16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
              <span style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 14 }}>{plan.neg.sku}</span>
              <span style={{ color: 'var(--text-dim)', fontSize: 11 }}>{plan.neg.desc}</span>
              <LocBadge loc={plan.neg.loc} />
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {affectedDates.map(dk => {
                  const dp = (allPlans[dk] || []).find(p => p.neg.sku === plan.neg.sku && p.neg.loc === plan.neg.loc)
                  return (
                    <span key={dk} style={{
                      background: '#2a1212', color: '#ff8866',
                      border: '1px solid #3a1a1a', padding: '1px 7px',
                      borderRadius: 2, fontSize: 10,
                    }}>
                      {dateCols[dk]}: −{dp?.shortage}
                    </span>
                  )
                })}
              </div>
              <span style={{
                marginLeft: 'auto', background: '#250d0d', color: 'var(--red)',
                padding: '3px 12px', borderRadius: 3, fontSize: 12, fontWeight: 700,
                border: '1px solid #4a1a1a', whiteSpace: 'nowrap',
              }}>
                WORST: −{plan.shortage}
              </span>
            </div>

            {plan.transfers.length === 0 ? (
              <div style={{ color: 'var(--red)', fontSize: 12 }}>⚠ No donors available in network.</div>
            ) : (
              <>
                <div style={{ color: 'var(--text-faint)', fontSize: 10, letterSpacing: 2, marginBottom: 8 }}>
                  TRANSFER PLAN — CLOSEST FIRST
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {plan.transfers.map(t => (
                    <div key={t.fromLoc} style={{
                      background: '#0a140a', border: '1px solid #182a18',
                      borderRadius: 3, padding: '8px 14px', minWidth: 130,
                    }}>
                      <div style={{ color: '#444', fontSize: 10, letterSpacing: 1 }}>PULL FROM</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                        <LocBadge loc={t.fromLoc} />
                        <span style={{ color: 'var(--green)', fontWeight: 700, fontSize: 17 }}>×{t.qty}</span>
                      </div>
                      <div style={{ color: '#444', fontSize: 10, marginTop: 4 }}>on-hand: {t.donorAvail}</div>
                    </div>
                  ))}
                </div>
                {plan.stillShort > 0 && (
                  <div style={{ marginTop: 10, color: 'var(--orange)', fontSize: 12 }}>
                    ⚠ Still short {plan.stillShort} units — network cannot fully cover.
                  </div>
                )}
              </>
            )}
          </div>
        )
      })}

      {selectedDates.size > 1 && allShortagesByDate.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <SectionLabel label="Per-Date Detail" color="var(--blue)" />
          {allShortagesByDate.map(({ dk, plans }) => (
            <div key={dk} style={{
              marginBottom: 10, padding: '10px 14px',
              background: 'var(--bg2)', border: '1px solid #161e2a', borderRadius: 4,
            }}>
              <div style={{ color: 'var(--blue)', fontSize: 10, fontWeight: 700, marginBottom: 8, letterSpacing: 2 }}>
                {(dateCols[dk] || '').toUpperCase()}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {plans.map(p => (
                  <div key={`${p.neg.sku}_${p.neg.loc}`} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: '#0d1520', border: '1px solid #161e30',
                    padding: '5px 10px', borderRadius: 3,
                  }}>
                    <span style={{ color: 'var(--blue)', fontWeight: 700, fontSize: 11 }}>{p.neg.sku}</span>
                    <LocBadge loc={p.neg.loc} />
                    <span style={{ color: 'var(--red)', fontWeight: 700, fontSize: 11 }}>−{p.shortage}</span>
                    {p.stillShort > 0 && (
                      <span style={{ color: 'var(--orange)', fontSize: 10 }}>⚠{p.stillShort} unfilled</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
