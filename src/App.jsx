import { useState, useMemo } from 'react'
import { buildEffectiveRows, computePlansForDate, buildNetworkOverview } from './logic.js'
import { MiniBtn } from './components.jsx'
import UploadScreen  from './UploadScreen.jsx'
import ShortagesTab  from './ShortagesTab.jsx'
import NetworkTab    from './NetworkTab.jsx'
import InspectionTab from './InspectionTab.jsx'

const TABS = ['Shortages & Transfers', 'Network Overview', 'Inspection']

export default function App() {
  // ── file / parse state ────────────────────────────────────────────────────
  const [parsed, setParsed] = useState(null)
  // parsed = { rows, dateCols, dateColKeys, fileName }

  // ── analyzer state ────────────────────────────────────────────────────────
  const [selectedDates, setSelectedDates] = useState(new Set())
  const [inspToggles,   setInspToggles]   = useState({})
  const [activeTab,     setActiveTab]     = useState(0)

  // When a new file lands, reset everything and default-select first date
  const handleParsed = (result) => {
    setParsed(result)
    setSelectedDates(new Set([result.dateColKeys[0]]))
    setInspToggles({})
    setActiveTab(0)
  }

  // ── derived state (only runs when we have data) ───────────────────────────
  const effectiveRows = useMemo(() => {
    if (!parsed) return []
    return buildEffectiveRows(parsed.rows, inspToggles, parsed.dateColKeys)
  }, [parsed, inspToggles])

  const allPlans = useMemo(() => {
    if (!parsed) return {}
    const result = {}
    for (const dk of selectedDates) result[dk] = computePlansForDate(effectiveRows, dk)
    return result
  }, [effectiveRows, selectedDates, parsed])

  const worstCasePlans = useMemo(() => {
    const map = {}
    for (const plans of Object.values(allPlans)) {
      for (const p of plans) {
        const key = `${p.neg.sku}_${p.neg.loc}`
        if (!map[key] || p.shortage > map[key].shortage) map[key] = p
      }
    }
    return Object.values(map).sort((a, b) => b.shortage - a.shortage)
  }, [allPlans])

  const sortedSelectedDates = useMemo(() => {
    if (!parsed) return []
    return [...selectedDates].sort((a, b) => parsed.dateColKeys.indexOf(a) - parsed.dateColKeys.indexOf(b))
  }, [selectedDates, parsed])

  const allShortagesByDate = useMemo(() =>
    sortedSelectedDates
      .filter(dk => (allPlans[dk]?.length || 0) > 0)
      .map(dk => ({ dk, plans: allPlans[dk] })),
    [allPlans, sortedSelectedDates]
  )

  const networkOverview = useMemo(() => {
    if (!parsed) return []
    return buildNetworkOverview(effectiveRows, allPlans, selectedDates)
  }, [effectiveRows, allPlans, selectedDates, parsed])

  // ── helpers ───────────────────────────────────────────────────────────────
  const toggleDate = (k) => {
    setSelectedDates(prev => {
      const next = new Set(prev)
      if (next.has(k)) { if (next.size > 1) next.delete(k) }
      else next.add(k)
      return next
    })
  }

  // ── show upload screen if no file loaded ──────────────────────────────────
  if (!parsed) return <UploadScreen onParsed={handleParsed} />

  const { dateCols, dateColKeys, fileName } = parsed
  const totalShortages  = worstCasePlans.length
  const totalUnits      = worstCasePlans.reduce((a, p) => a + p.shortage, 0)
  const totalStillShort = worstCasePlans.reduce((a, p) => a + p.stillShort, 0)

  return (
    <div style={{ fontFamily: 'var(--mono)', background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)' }}>

      {/* ── HEADER ── */}
      <header style={{
        background: 'linear-gradient(135deg, #0d1117, #161b22)',
        borderBottom: '1px solid #ff6b3540',
        padding: '14px 24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--display)', color: 'var(--accent)', fontSize: 18, fontWeight: 800, letterSpacing: 2 }}>
            RENTEX
          </span>
          <span style={{ color: '#333' }}>//</span>
          <span style={{ color: '#888', fontSize: 12, letterSpacing: 2 }}>Transfer Analyzer</span>

          {/* File badge + swap button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
            <span style={{
              background: '#1a2a1a', color: 'var(--green)',
              border: '1px solid #2a3a2a', padding: '2px 10px',
              borderRadius: 3, fontSize: 10, letterSpacing: 1,
            }}>
              📄 {fileName}
            </span>
            <MiniBtn onClick={() => setParsed(null)} color="#666">
              ↑ New File
            </MiniBtn>
          </div>
        </div>

        {/* Stat bar */}
        <div style={{ display: 'flex', gap: 28, marginTop: 12, flexWrap: 'wrap' }}>
          {[
            { label: 'Selected Dates',  value: selectedDates.size, color: 'var(--blue)'   },
            { label: 'Shortage Events', value: totalShortages,     color: 'var(--accent)' },
            { label: 'Units Short',     value: totalUnits,         color: 'var(--red)'    },
            { label: 'Unresolvable',    value: totalStillShort,    color: 'var(--orange)' },
          ].map(s => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
              <span style={{ color: s.color, fontSize: 22, fontWeight: 700, lineHeight: 1, fontFamily: 'var(--display)' }}>
                {s.value}
              </span>
              <span style={{ color: 'var(--text-faint)', fontSize: 10, letterSpacing: 1 }}>
                {s.label.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </header>

      {/* ── DATE SELECTOR ── */}
      <div style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)', padding: '12px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ color: 'var(--text-faint)', fontSize: 10, letterSpacing: 2 }}>DATE WINDOWS</span>
          <MiniBtn onClick={() => setSelectedDates(new Set(dateColKeys))} color="var(--blue)">Select All</MiniBtn>
          <MiniBtn onClick={() => setSelectedDates(new Set([dateColKeys[0]]))} color="#666">Reset</MiniBtn>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {dateColKeys.map(k => {
            const sel      = selectedDates.has(k)
            const hasShort = (allPlans[k]?.length || 0) > 0
            return (
              <button key={k} onClick={() => toggleDate(k)} style={{
                padding: '4px 9px', fontSize: 10, cursor: 'pointer', borderRadius: 3,
                border: '1px solid',
                borderColor: sel ? (hasShort ? 'var(--accent)' : 'var(--blue)') : hasShort ? '#4a2010' : 'var(--border)',
                background:  sel ? (hasShort ? '#ff6b3520' : '#4db6ff18') : 'transparent',
                color:       sel ? (hasShort ? '#ff9966'   : 'var(--blue)') : hasShort ? '#774433' : 'var(--text-dim)',
                fontFamily: 'var(--mono)', fontWeight: sel ? 700 : 400,
                transition: 'all 0.1s', position: 'relative',
              }}>
                {dateCols[k] || k}
                {hasShort && (
                  <span style={{
                    position: 'absolute', top: 2, right: 2,
                    width: 4, height: 4, borderRadius: '50%', background: 'var(--accent)',
                  }} />
                )}
              </button>
            )
          })}
        </div>

        <div style={{ marginTop: 6, color: '#2a2a3a', fontSize: 10 }}>
          {sortedSelectedDates.map(k => dateCols[k] || k).join(' · ')}
          {'  ·  '}
          <span style={{ color: '#4a2a1a' }}>● = shortage on that date</span>
        </div>
      </div>

      {/* ── TABS ── */}
      <nav style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--bg3)' }}>
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setActiveTab(i)} style={{
            padding: '10px 20px', fontSize: 10, letterSpacing: 2,
            cursor: 'pointer', fontFamily: 'var(--mono)',
            background: 'transparent', border: 'none', fontWeight: activeTab === i ? 700 : 400,
            borderBottom: `2px solid ${activeTab === i ? 'var(--accent)' : 'transparent'}`,
            color: activeTab === i ? 'var(--accent)' : 'var(--text-faint)',
            transition: 'all 0.12s',
          }}>
            {t.toUpperCase()}
          </button>
        ))}
      </nav>

      {/* ── CONTENT ── */}
      <main style={{ padding: '20px 24px', maxWidth: 1100 }}>
        {activeTab === 0 && (
          <ShortagesTab
            worstCasePlans={worstCasePlans}
            allPlans={allPlans}
            allShortagesByDate={allShortagesByDate}
            sortedSelectedDates={sortedSelectedDates}
            selectedDates={selectedDates}
            dateCols={dateCols}
          />
        )}
        {activeTab === 1 && (
          <NetworkTab
            networkOverview={networkOverview}
            sortedSelectedDates={sortedSelectedDates}
            dateCols={dateCols}
          />
        )}
        {activeTab === 2 && (
          <InspectionTab
            rows={parsed.rows}
            inspToggles={inspToggles}
            setInspToggles={setInspToggles}
          />
        )}
      </main>

      <footer style={{
        padding: '14px 24px', borderTop: '1px solid var(--border)',
        color: 'var(--text-faint)', fontSize: 10, letterSpacing: 1,
        display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8,
      }}>
        <span>RENTEX TRANSFER ANALYZER · DALLAS ORIGIN</span>
        <span>{parsed.rows.length} rows · {dateColKeys.length} date windows</span>
      </footer>
    </div>
  )
}
