import { useState, useRef, useCallback } from 'react'
import { parseRTProFile } from './parser.js'

export default function UploadScreen({ onParsed }) {
  const [dragging,  setDragging]  = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState(null)
  const inputRef = useRef()

  const handleFile = useCallback(async (file) => {
    if (!file) return
    if (!file.name.endsWith('.xlsx')) {
      setError('Please upload an .xlsx file.')
      return
    }
    setLoading(true)
    setError(null)
    const result = await parseRTProFile(file)
    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      onParsed(result)
    }
  }, [onParsed])

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    handleFile(file)
  }, [handleFile])

  const onDragOver = (e) => { e.preventDefault(); setDragging(true)  }
  const onDragLeave= ()  => setDragging(false)
  const onInput    = (e) => handleFile(e.target.files[0])

  return (
    <div className="fade-in" style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', padding: 24,
    }}>
      {/* Logo */}
      <div style={{ marginBottom: 40, textAlign: 'center' }}>
        <div style={{
          fontFamily: 'var(--display)', color: 'var(--accent)',
          fontSize: 32, fontWeight: 800, letterSpacing: 4,
        }}>
          RENTEX
        </div>
        <div style={{ color: 'var(--text-dim)', fontSize: 11, letterSpacing: 4, marginTop: 4 }}>
          TRANSFER ANALYZER
        </div>
      </div>

      {/* Drop zone */}
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => !loading && inputRef.current.click()}
        style={{
          width: '100%', maxWidth: 480,
          border: `2px dashed ${dragging ? 'var(--accent)' : error ? 'var(--red)' : 'var(--border2)'}`,
          borderRadius: 8,
          background: dragging ? '#ff6b3508' : 'var(--bg2)',
          padding: '48px 32px',
          textAlign: 'center',
          cursor: loading ? 'default' : 'pointer',
          transition: 'all 0.2s',
          userSelect: 'none',
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx"
          onChange={onInput}
          style={{ display: 'none' }}
        />

        {loading ? (
          <>
            <div className="pulse" style={{ fontSize: 36, marginBottom: 16 }}>⚙</div>
            <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>Parsing file…</div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 40, marginBottom: 16, opacity: dragging ? 1 : 0.4 }}>
              📂
            </div>
            <div style={{ color: dragging ? 'var(--accent)' : 'var(--text)', fontSize: 14, fontWeight: 700, marginBottom: 8 }}>
              {dragging ? 'Drop it!' : 'Drop your RTPro export here'}
            </div>
            <div style={{ color: 'var(--text-dim)', fontSize: 11, marginBottom: 20 }}>
              or click to browse — .xlsx only
            </div>
            <div style={{
              display: 'inline-block',
              background: 'var(--accent)', color: '#000',
              padding: '8px 24px', borderRadius: 4,
              fontSize: 11, fontWeight: 700, letterSpacing: 2,
            }}>
              SELECT FILE
            </div>
          </>
        )}
      </div>

      {/* Error */}
      {error && (
        <div style={{
          marginTop: 16, maxWidth: 480, width: '100%',
          background: '#1a0808', border: '1px solid var(--red)',
          borderRadius: 4, padding: '10px 14px',
          color: 'var(--red)', fontSize: 12,
        }}>
          ⚠ {error}
        </div>
      )}

      {/* Expected format hint */}
      <div style={{
        marginTop: 32, maxWidth: 480, width: '100%',
        color: 'var(--text-faint)', fontSize: 10, lineHeight: 1.8, letterSpacing: 0.5,
      }}>
        <div style={{ marginBottom: 6, color: 'var(--text-dim)', letterSpacing: 2 }}>EXPECTED FORMAT</div>
        Export from RTPro → Rental Availability List (.xlsx)<br />
        Columns: Equipment · Description · Location · Total Own ·<br />
        Inspection · Locked Attach. · Avail Today · [date columns…]
      </div>
    </div>
  )
}
