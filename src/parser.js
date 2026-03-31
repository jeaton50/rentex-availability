import * as XLSX from 'xlsx'

/**
 * Parse an RTPro .xlsx file into the internal format used by the analyzer.
 *
 * RTPro sheet structure (from observed file):
 *   Row 1: Title  e.g. "Rental Availability List - Rentex Dallas"
 *   Row 2: Headers
 *     A=Equipment, B=Category, C=Description, D=Location,
 *     E=Total Own, F=Quarantined, G=Inspection, H=Locked Attach.,
 *     I=Repair, J=Late Return, K=Avail Today, L..AE = date columns
 *   Row 3+: Data rows
 *   Last row: a row with just a number (row count) — skip it
 *
 * Returns: { rows, dateCols, dateColKeys, fileName, error }
 */
export function parseRTProFile(file) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const wb   = XLSX.read(data, { type: 'array', cellDates: false })
        const ws   = wb.Sheets[wb.SheetNames[0]]
        const raw  = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null })

        // Find header row (contains "Equipment" or "Location")
        let headerRowIdx = -1
        for (let i = 0; i < Math.min(5, raw.length); i++) {
          const row = raw[i]
          if (row && row.some(c => typeof c === 'string' && c.trim().toLowerCase() === 'equipment')) {
            headerRowIdx = i
            break
          }
        }
        if (headerRowIdx === -1) {
          resolve({ error: 'Could not find header row. Make sure this is an RTPro availability export.' })
          return
        }

        const headers = raw[headerRowIdx].map(h => (h ? String(h).trim() : ''))

        // Map header names to column indices
        const colIdx = {
          sku:    headers.findIndex(h => h.toLowerCase() === 'equipment'),
          desc:   headers.findIndex(h => h.toLowerCase() === 'description'),
          loc:    headers.findIndex(h => h.toLowerCase() === 'location'),
          own:    headers.findIndex(h => h.toLowerCase() === 'total own'),
          insp:        headers.findIndex(h => h.toLowerCase() === 'inspection'),
          locked:      headers.findIndex(h => h.toLowerCase() === 'locked attach.'),
          repair:      headers.findIndex(h => h.toLowerCase() === 'repair'),
          quarantined: headers.findIndex(h => h.toLowerCase() === 'quarantined'),
          lateReturn:  headers.findIndex(h => h.toLowerCase() === 'late return'),
        }

        // Find the "Avail Today" column and all date columns after it
        const availTodayIdx = headers.findIndex(h =>
          h.toLowerCase().includes('avail today') || h.toLowerCase() === 'avail today'
        )
        if (availTodayIdx === -1) {
          resolve({ error: 'Could not find "Avail Today" column. Check that this is an RTPro availability report.' })
          return
        }

        // Build dateCols map: index -> label
        const dateCols   = {}   // key -> label  (key = col index as string)
        const dateColKeys = []  // ordered keys
        for (let ci = availTodayIdx; ci < headers.length; ci++) {
          const h = headers[ci]
          if (h && h.trim() !== '') {
            // Clean up label: "+52 Sun May 17" -> "May 17", "Avail Today" -> "Today"
            let label = h.trim()
            if (label.toLowerCase().includes('avail today') || label.toLowerCase() === 'avail today') {
              label = 'Today'
            } else {
              // Strip leading "+NN DDD " prefix if present
              label = label.replace(/^\+\d+\s+\w{3}\s+/i, '').trim()
              // Fallback: just use as-is but trimmed
            }
            dateCols[ci]  = label
            dateColKeys.push(ci)
          }
        }

        if (dateColKeys.length === 0) {
          resolve({ error: 'No date columns found after "Avail Today".' })
          return
        }

        // Parse data rows
        const rows = []
        for (let ri = headerRowIdx + 1; ri < raw.length; ri++) {
          const row = raw[ri]
          if (!row || !row[colIdx.sku]) continue

          const sku = String(row[colIdx.sku] ?? '').trim()
          if (!sku || sku === '') continue

          // Skip summary/total rows (just a number)
          if (colIdx.desc !== -1 && !row[colIdx.desc] && !row[colIdx.loc]) continue

          const desc   = String(row[colIdx.desc]   ?? '').trim()
          const loc    = String(row[colIdx.loc]     ?? '').trim().toUpperCase()
          const own    = toInt(row[colIdx.own])
          const insp   = toInt(row[colIdx.insp])
          const locked      = toInt(row[colIdx.locked])
          const repair      = toInt(row[colIdx.repair])
          const quarantined = toInt(row[colIdx.quarantined])
          const lateReturn  = toInt(row[colIdx.lateReturn])

          if (!loc) continue

          const avail = {}
          for (const ci of dateColKeys) {
            avail[ci] = toInt(row[ci])
          }

          rows.push({ sku, desc, loc, own, insp, locked, repair, quarantined, lateReturn, avail })
        }

        if (rows.length === 0) {
          resolve({ error: 'No data rows found. Check the file format.' })
          return
        }

        resolve({ rows, dateCols, dateColKeys, fileName: file.name, error: null })
      } catch (err) {
        resolve({ error: `Parse error: ${err.message}` })
      }
    }
    reader.onerror = () => resolve({ error: 'Could not read file.' })
    reader.readAsArrayBuffer(file)
  })
}

function toInt(val) {
  if (val === null || val === undefined || val === '') return 0
  const n = Number(val)
  return isNaN(n) ? 0 : Math.round(n)
}
