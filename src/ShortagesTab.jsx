import { LocBadge, SectionLabel } from './components.jsx'

export default function ShortagesTab({ worstCasePlans, allPlans, allShortagesByDate, sortedSelectedDates, selectedDates, dateCols }) {
  if (worstCasePlans.length === 0) {
    return (
      <div style={{ color: 'var(--green)', padding: '32px 0', fontSize: 18 }}>
        ✓ No shortages across selected dates.
      </div>
    )
  }

  return (
    <div className="fade-in">
      <div style={{ color: 'var(--text-faint)', fontSize: 13, letterSpacing: 2, marginBottom: 20 }}>
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
            marginBottom: 18, background: 'var(--bg2)',
            border: '1px solid #2a1818', borderLeft: '4px solid var(--accent)',
            borderRadius: 5, padding: '18px 20px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
              <span style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 18 }}>{plan.neg.sku}</span>
              <span style={{ color: 'var(--text-dim)', fontSize: 14 }}>{plan.neg.desc}</span>
              <LocBadge loc={plan.neg.loc} />
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {affectedDates.map(dk => {
                  const dp = (allPlans[dk] || []).find(p => p.neg.sku === plan.neg.sku && p.neg.loc === plan.neg.loc)
                  return (
                    <span key={dk} style={{
                      background: '#2a1212', color: '#ff9980',
                      border: '1px solid #3a1a1a', padding: '2px 9px',
                      borderRadius: 3, fontSize: 13,
                    }}>
                      {dateCols[dk]}: −{dp?.shortage}
                    </span>
                  )
                })}
              </div>
              <span style={{
                marginLeft: 'auto', background: '#280e0e', color: 'var(--red)',
                padding: '5px 14px', borderRadius: 4, fontSize: 15, fontWeight: 700,
                border: '1px solid #4a1a1a', whiteSpace: 'nowrap',
              }}>
                WORST: −{plan.shortage}
              </span>
            </div>

            {plan.transfers.length === 0 ? (
              <div style={{ color: 'var(--red)', fontSize: 14 }}>⚠ No donors available in network.</div>
            ) : (
              <>
                <div style={{ color: 'var(--text-faint)', fontSize: 13, letterSpacing: 2, marginBottom: 10 }}>
                  TRANSFER PLAN — CLOSEST FIRST
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {plan.transfers.map(t => (
                    <div key={t.fromLoc} style={{
                      background: '#0a140a', border: '1px solid #1e3018',
                      borderRadius: 4, padding: '10px 16px', minWidth: 150,
                    }}>
                      <div style={{ color: 'var(--text-faint)', fontSize: 13, letterSpacing: 1 }}>PULL FROM</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 5 }}>
                        <LocBadge loc={t.fromLoc} />
                        <span style={{ color: 'var(--green)', fontWeight: 700, fontSize: 22 }}>×{t.qty}</span>
                      </div>
                      <div style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 5 }}>on-hand: {t.donorAvail}</div>
                    </div>
                  ))}
                </div>
                {plan.stillShort > 0 && (
                  <div style={{ marginTop: 12, color: 'var(--orange)', fontSize: 14 }}>
                    ⚠ Still short {plan.stillShort} units — network cannot fully cover.
                  </div>
                )}
              </>
            )}
          </div>
        )
      })}

      {selectedDates.size > 1 && allShortagesByDate.length > 0 && (
        <div style={{ marginTop: 28 }}>
          <SectionLabel label="Per-Date Detail" color="var(--blue)" />
          {allShortagesByDate.map(({ dk, plans }) => (
            <div key={dk} style={{
              marginBottom: 12, padding: '12px 16px',
              background: 'var(--bg2)', border: '1px solid #161e2a', borderRadius: 5,
            }}>
              <div style={{ color: 'var(--blue)', fontSize: 13, fontWeight: 700, marginBottom: 10, letterSpacing: 2 }}>
                {(dateCols[dk] || '').toUpperCase()}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {plans.map(p => (
                  <div key={`${p.neg.sku}_${p.neg.loc}`} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: '#0d1520', border: '1px solid #1a2438',
                    padding: '6px 12px', borderRadius: 4,
                  }}>
                    <span style={{ color: 'var(--blue)', fontWeight: 700, fontSize: 14 }}>{p.neg.sku}</span>
                    <LocBadge loc={p.neg.loc} />
                    <span style={{ color: 'var(--red)', fontWeight: 700, fontSize: 14 }}>−{p.shortage}</span>
                    {p.stillShort > 0 && (
                      <span style={{ color: 'var(--orange)', fontSize: 13 }}>⚠{p.stillShort} unfilled</span>
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
