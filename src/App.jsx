import { useState, useMemo } from 'react'
import { buildEffectiveRows, computePlansForDate, buildNetworkOverview } from './logic.js'
import { MiniBtn } from './components.jsx'
import UploadScreen   from './UploadScreen.jsx'
import ShortagesTab   from './ShortagesTab.jsx'
import NetworkTab     from './NetworkTab.jsx'
import InspectionTab  from './InspectionTab.jsx'
import LocationsTab   from './LocationsTab.jsx'

const TABS = ['Shortages & Transfers', 'Network Overview', 'Inspection', 'Locations']

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
  const totalOwned      = parsed.rows.reduce((a, r) => a + (r.own        || 0), 0)
  const totalInsp       = parsed.rows.reduce((a, r) => a + (r.insp       || 0), 0)
  const totalRepair     = parsed.rows.reduce((a, r) => a + (r.repair     || 0), 0)
  const totalLocked     = parsed.rows.reduce((a, r) => a + (r.locked     || 0), 0)
  const totalQuarantined= parsed.rows.reduce((a, r) => a + (r.quarantined|| 0), 0)
  const totalLateReturn = parsed.rows.reduce((a, r) => a + (r.lateReturn || 0), 0)
  const totalLocations  = new Set(parsed.rows.map(r => r.loc)).size
  const totalRentableCleared = parsed.rows.reduce((a, r) => a + Math.max(0, r.own - (r.locked || 0)), 0)
  const firstDate       = dateColKeys[0]
  const totalBooked     = parsed.rows.reduce((a, r) => {
    const avail = r.avail[firstDate] ?? 0
    return a + Math.max(0, r.own - (r.locked || 0) - (r.insp || 0) - (r.repair || 0) - Math.max(0, avail))
  }, 0)

  return (
    <div style={{ fontFamily: 'var(--mono)', background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)' }}>

      {/* ── HEADER ── */}
      <header style={{
        background: 'linear-gradient(135deg, #0d1117, #161b22)',
        borderBottom: '1px solid #ff6b3540',
        padding: '18px 28px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--display)', color: 'var(--accent)', fontSize: 26, fontWeight: 800, letterSpacing: 3 }}>
            RENTEX
          </span>
          <span style={{ color: '#444' }}>//</span>
          <span style={{ color: 'var(--text-dim)', fontSize: 16, letterSpacing: 2 }}>Transfer Analyzer</span>

          {/* File badge + swap button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
            <span style={{
              background: '#1a2a1a', color: 'var(--green)',
              border: '1px solid #2a3a2a', padding: '4px 12px',
              borderRadius: 4, fontSize: 13, letterSpacing: 1,
            }}>
              📄 {fileName}
            </span>
            <MiniBtn onClick={() => setParsed(null)} color="#888">
              ↑ New File
            </MiniBtn>
          </div>
        </div>

        {/* Stat bar */}
        <div style={{ display: 'flex', gap: 32, marginTop: 16, flexWrap: 'wrap' }}>
          {[
            { label: 'Total Owned',     value: totalOwned,            color: 'var(--text)'   },
            { label: 'Locations',       value: totalLocations,        color: 'var(--blue)'   },
            { label: 'Shortage Events', value: totalShortages,        color: 'var(--accent)' },
            { label: 'Units Short',     value: totalUnits,            color: 'var(--red)'    },
            { label: 'Unresolvable',    value: totalStillShort,       color: 'var(--orange)' },
            { label: 'Booked',          value: totalBooked,           color: 'var(--blue)'   },
            { label: 'In Inspection',   value: totalInsp,             color: 'var(--yellow)' },
            { label: 'In Repair',       value: totalRepair,           color: 'var(--red)'    },
            { label: 'Quarantined',     value: totalQuarantined,      color: '#bb66ff'       },
            { label: 'Late Return',     value: totalLateReturn,       color: 'var(--orange)' },
            { label: 'Locked',          value: totalLocked,           color: 'var(--orange)' },
            { label: 'Open If Cleared', value: totalRentableCleared,  color: 'var(--green)'  },
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
      </header>

      {/* ── DATE SELECTOR ── */}
      <div style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)', padding: '14px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <span style={{ color: 'var(--text-faint)', fontSize: 13, letterSpacing: 2 }}>DATE WINDOWS</span>
          <MiniBtn onClick={() => setSelectedDates(new Set(dateColKeys))} color="var(--blue)">Select All</MiniBtn>
          <MiniBtn onClick={() => setSelectedDates(new Set([dateColKeys[0]]))} color="#888">Reset</MiniBtn>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {dateColKeys.map(k => {
            const sel      = selectedDates.has(k)
            const hasShort = (allPlans[k]?.length || 0) > 0
            return (
              <button key={k} onClick={() => toggleDate(k)} style={{
                padding: '6px 12px', fontSize: 13, cursor: 'pointer', borderRadius: 4,
                border: '1px solid',
                borderColor: sel ? (hasShort ? 'var(--accent)' : 'var(--blue)') : hasShort ? '#5a2818' : 'var(--border)',
                background:  sel ? (hasShort ? '#ff6b3528' : '#4db6ff20') : 'transparent',
                color:       sel ? (hasShort ? '#ffaa88'   : 'var(--blue)') : hasShort ? '#996644' : 'var(--text-dim)',
                fontFamily: 'var(--mono)', fontWeight: sel ? 700 : 400,
                transition: 'all 0.1s', position: 'relative',
              }}>
                {dateCols[k] || k}
                {hasShort && (
                  <span style={{
                    position: 'absolute', top: 3, right: 3,
                    width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)',
                  }} />
                )}
              </button>
            )
          })}
        </div>

        <div style={{ marginTop: 8, color: 'var(--text-faint)', fontSize: 13 }}>
          {sortedSelectedDates.map(k => dateCols[k] || k).join(' · ')}
          {'  ·  '}
          <span style={{ color: 'var(--accent)', opacity: 0.5 }}>● = shortage on that date</span>
        </div>
      </div>

      {/* ── TABS ── */}
      <nav style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--bg3)' }}>
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setActiveTab(i)} style={{
            padding: '14px 24px', fontSize: 14, letterSpacing: 2,
            cursor: 'pointer', fontFamily: 'var(--mono)',
            background: 'transparent', border: 'none', fontWeight: activeTab === i ? 700 : 400,
            borderBottom: `3px solid ${activeTab === i ? 'var(--accent)' : 'transparent'}`,
            color: activeTab === i ? 'var(--accent)' : 'var(--text-dim)',
            transition: 'all 0.12s',
          }}>
            {t.toUpperCase()}
          </button>
        ))}
      </nav>

      {/* ── CONTENT ── */}
      <main style={{ padding: '28px 32px', maxWidth: 1200 }}>
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
        {activeTab === 3 && (
          <LocationsTab
            rows={parsed.rows}
            firstDate={firstDate}
          />
        )}
      </main>

      <footer style={{
        padding: '16px 28px', borderTop: '1px solid var(--border)',
        color: 'var(--text-faint)', fontSize: 13, letterSpacing: 1,
        display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8,
      }}>
        <span>RENTEX TRANSFER ANALYZER</span>
        <span>{parsed.rows.length} rows · {dateColKeys.length} date windows</span>
      </footer>
    </div>
  )
}
