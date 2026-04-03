import { useState, useRef, useCallback } from 'react'
import { parseRTProFile, parseOrdersFile } from './parser.js'

// ── Individual drop zone for one file type ────────────────────────────────
function DropZone({ label, hint, hintLines, accentColor, loading, result, error, onFile, onClear }) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef()

  const handle = useCallback(async (file) => {
    if (!file) return
    if (!file.name.endsWith('.xlsx')) { onFile(null, 'Only .xlsx files are accepted.'); return }
    onFile(file, null)
  }, [onFile])

  const onDrop     = (e) => { e.preventDefault(); setDragging(false); handle(e.dataTransfer.files[0]) }
  const onDragOver = (e) => { e.preventDefault(); setDragging(true) }
  const onDragLeave = ()  => setDragging(false)

  const loaded = !!(result && !result.error)

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Zone label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          color: accentColor, fontSize: 11, letterSpacing: 2, fontWeight: 700,
        }}>{label}</span>
        {loaded && (
          <span style={{
            background: accentColor + '22', color: accentColor,
            border: `1px solid ${accentColor}44`, borderRadius: 3,
            fontSize: 10, letterSpacing: 1, padding: '1px 7px', fontWeight: 700,
          }}>✓ LOADED</span>
        )}
      </div>

      {/* Drop area or loaded state */}
      {loaded ? (
        <div style={{
          border: `1px solid ${accentColor}55`, background: accentColor + '0c',
          borderRadius: 6, padding: '18px 16px',
          display: 'flex', alignItems: 'center', gap: 12, minHeight: 100,
        }}>
          <span style={{ fontSize: 28 }}>📄</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              color: accentColor, fontWeight: 700, fontSize: 14,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {result.fileName}
            </div>
            <div style={{ color: 'var(--text-faint)', fontSize: 12, marginTop: 3 }}>
              {result.format === 'rtpro'
                ? `${result.rows.length} rows · ${result.dateColKeys.length} date windows`
                : `${result.orders.length} orders`}
            </div>
          </div>
          <button onClick={onClear} style={{
            background: 'transparent', border: '1px solid #333', borderRadius: 4,
            color: '#666', fontSize: 13, cursor: 'pointer', padding: '4px 10px',
            transition: 'all 0.1s',
          }}>✕ Clear</button>
        </div>
      ) : (
        <div
          onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave}
          onClick={() => !loading && inputRef.current.click()}
          style={{
            border: `2px dashed ${dragging ? accentColor : error ? 'var(--red)' : 'var(--border2)'}`,
            borderRadius: 6, background: dragging ? accentColor + '0a' : 'var(--bg2)',
            padding: '28px 20px', textAlign: 'center',
            cursor: loading ? 'wait' : 'pointer',
            transition: 'all 0.15s', userSelect: 'none', minHeight: 100,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
        >
          <input ref={inputRef} type="file" accept=".xlsx" onChange={e => handle(e.target.files[0])} style={{ display: 'none' }} />
          {loading ? (
            <>
              <div className="pulse" style={{ fontSize: 28 }}>⚙</div>
              <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>Parsing…</div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 32, opacity: dragging ? 0.9 : 0.35 }}>📂</div>
              <div style={{ color: dragging ? accentColor : 'var(--text)', fontSize: 14, fontWeight: 600 }}>
                {dragging ? 'Drop it here' : 'Drop or click to load'}
              </div>
              <div style={{ color: 'var(--text-faint)', fontSize: 12 }}>{hint}</div>
            </>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          background: '#1a0808', border: '1px solid var(--red)', borderRadius: 4,
          padding: '8px 12px', color: 'var(--red)', fontSize: 12,
        }}>⚠ {error}</div>
      )}

      {/* Format hint lines */}
      <div style={{
        background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 5,
        padding: '10px 12px',
      }}>
        {hintLines.map((l, i) => (
          <div key={i} style={{ color: 'var(--text-faint)', fontSize: 12, lineHeight: 1.8 }}>{l}</div>
        ))}
      </div>
    </div>
  )
}

// ── Main upload screen ─────────────────────────────────────────────────────
export default function UploadScreen({ onParsed }) {
  const [rtproResult,  setRtproResult]  = useState(null)
  const [ordersResult, setOrdersResult] = useState(null)
  const [rtproLoading, setRtproLoading] = useState(false)
  const [ordersLoading,setOrdersLoading]= useState(false)
  const [rtproError,   setRtproError]   = useState(null)
  const [ordersError,  setOrdersError]  = useState(null)

  const handleRTProFile = useCallback(async (file, err) => {
    if (err) { setRtproError(err); return }
    setRtproLoading(true)
    setRtproError(null)
    setRtproResult(null)
    const result = await parseRTProFile(file)
    setRtproLoading(false)
    if (result.error) setRtproError(result.error)
    else setRtproResult(result)
  }, [])

  const handleOrdersFile = useCallback(async (file, err) => {
    if (err) { setOrdersError(err); return }
    setOrdersLoading(true)
    setOrdersError(null)
    setOrdersResult(null)
    const result = await parseOrdersFile(file)
    setOrdersLoading(false)
    if (result.error) setOrdersError(result.error)
    else setOrdersResult(result)
  }, [])

  const canLaunch = !!(rtproResult || ordersResult)
  const bothLoaded = !!(rtproResult && ordersResult)

  const launch = () => {
    if (!canLaunch) return
    if (bothLoaded) {
      // Combined: merge rtpro base with orders supplement
      onParsed({
        format: 'combined',
        rows:        rtproResult.rows,
        dateCols:    rtproResult.dateCols,
        dateColKeys: rtproResult.dateColKeys,
        fileName:    rtproResult.fileName,
        orders:      ordersResult.orders,
        orderDateCols: ordersResult.dateCols,
      })
    } else if (rtproResult) {
      onParsed(rtproResult)
    } else {
      onParsed(ordersResult)
    }
  }

  return (
    <div className="fade-in" style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', padding: 32,
    }}>
      {/* Logo */}
      <div style={{ marginBottom: 40, textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--display)', color: 'var(--accent)', fontSize: 32, fontWeight: 800, letterSpacing: 4 }}>
          RENTEX
        </div>
        <div style={{ color: 'var(--text-dim)', fontSize: 13, letterSpacing: 4, marginTop: 4 }}>
          TRANSFER ANALYZER
        </div>
        <div style={{ color: 'var(--text-faint)', fontSize: 13, marginTop: 10 }}>
          Load one or both files — they work independently or together
        </div>
      </div>

      {/* Combined badge */}
      {bothLoaded && (
        <div style={{
          background: '#1a2a1a', border: '1px solid var(--green)',
          borderRadius: 5, padding: '8px 20px', marginBottom: 24,
          color: 'var(--green)', fontSize: 13, letterSpacing: 2, fontWeight: 700,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          ⚡ COMBINED MODE — both files loaded, full detail available
        </div>
      )}

      {/* Two drop zones */}
      <div style={{ display: 'flex', gap: 24, width: '100%', maxWidth: 860, alignItems: 'stretch' }}>
        <DropZone
          label="RTPRO AVAILABILITY"
          hint=".xlsx export from RTPro"
          accentColor="var(--accent)"
          loading={rtproLoading}
          result={rtproResult}
          error={rtproError}
          onFile={handleRTProFile}
          onClear={() => { setRtproResult(null); setRtproError(null) }}
          hintLines={[
            'RTPro → Rental Availability List',
            'Columns: Equipment · Description · Location',
            'Total Own · Inspection · Avail Today · [dates]',
          ]}
        />

        {/* Divider */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
          color: 'var(--text-faint)', fontSize: 12, paddingTop: 28,
        }}>
          <div style={{ width: 1, flex: 1, background: 'var(--border)' }} />
          <span>+</span>
          <div style={{ width: 1, flex: 1, background: 'var(--border)' }} />
        </div>

        <DropZone
          label="ORDERS / BOOKINGS"
          hint=".xlsx from Equipment Availability Update"
          accentColor="var(--green)"
          loading={ordersLoading}
          result={ordersResult}
          error={ordersError}
          onFile={handleOrdersFile}
          onClear={() => { setOrdersResult(null); setOrdersError(null) }}
          hintLines={[
            'Equipment Availability Data Update',
            'Columns: Order · Equipment · Qty Ord',
            'Location · Pull Date · Return Date',
          ]}
        />
      </div>

      {/* Launch button */}
      <button
        onClick={launch}
        disabled={!canLaunch}
        style={{
          marginTop: 32, padding: '14px 48px',
          background: canLaunch
            ? bothLoaded ? 'var(--green)' : 'var(--accent)'
            : '#1a1a2a',
          color: canLaunch ? '#000' : 'var(--text-faint)',
          border: 'none', borderRadius: 5,
          fontSize: 15, fontWeight: 700, letterSpacing: 3,
          cursor: canLaunch ? 'pointer' : 'not-allowed',
          fontFamily: 'var(--mono)', transition: 'all 0.15s',
          opacity: canLaunch ? 1 : 0.5,
        }}
      >
        {!canLaunch
          ? 'LOAD AT LEAST ONE FILE'
          : bothLoaded
            ? '⚡ LAUNCH COMBINED'
            : rtproResult
              ? '▶ LAUNCH AVAILABILITY ANALYZER'
              : '▶ LAUNCH ORDERS VIEWER'}
      </button>
    </div>
  )
}
