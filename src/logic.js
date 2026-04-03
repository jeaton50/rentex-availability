import { LOCATION_ORDER } from './data.js'

export function locPriority(loc) {
  const i = LOCATION_ORDER.indexOf(loc.toUpperCase())
  return i === -1 ? 99 : i
}

export function buildEffectiveRows(rawRows, inspToggles, dateColKeys) {
  return rawRows.map(r => {
    const add = inspToggles[`${r.sku}_${r.loc}`] ? (r.insp || 0) + (r.repair || 0) + (r.quarantined || 0) : 0
    const ea  = {}
    for (const k of dateColKeys) ea[k] = (r.avail[k] ?? 0) + add
    return { ...r, effectiveAvail: ea }
  })
}

export function computePlansForDate(effectiveRows, dateKey) {
  const negatives = effectiveRows.filter(r => (r.effectiveAvail[dateKey] ?? 0) < 0)
  return negatives.map(neg => {
    let remaining = Math.abs(neg.effectiveAvail[dateKey])
    const donors  = effectiveRows
      .filter(r => r.sku === neg.sku && r.loc !== neg.loc && (r.effectiveAvail[dateKey] ?? 0) > 0)
      .sort((a, b) =>
        locPriority(a.loc) - locPriority(b.loc) ||
        b.effectiveAvail[dateKey] - a.effectiveAvail[dateKey]
      )
    const transfers = []
    for (const d of donors) {
      if (remaining <= 0) break
      const give = Math.min(remaining, d.effectiveAvail[dateKey])
      transfers.push({ fromLoc: d.loc, qty: give, donorAvail: d.effectiveAvail[dateKey] })
      remaining -= give
    }
    return { neg, shortage: Math.abs(neg.effectiveAvail[dateKey]), transfers, stillShort: remaining, dateKey }
  })
}

export function buildNetworkOverview(effectiveRows, allPlans, selectedDates) {
  const skus = [...new Set(effectiveRows.map(r => r.sku))]
  return skus.map(sku => {
    const rows        = effectiveRows.filter(r => r.sku === sku)
    const desc        = rows[0]?.desc || sku
    const totalOwn    = rows.reduce((a, r) => a + r.own,    0)
    const totalInsp   = rows.reduce((a, r) => a + r.insp,   0)
    const totalLocked = rows.reduce((a, r) => a + r.locked, 0)
    const dateStats   = {}
    for (const dk of selectedDates) {
      const totalAvail    = rows.reduce((a, r) => a + (r.effectiveAvail[dk] ?? 0), 0)
      const skuPlans      = (allPlans[dk] || []).filter(p => p.neg.sku === sku)
      const totalShortage = skuPlans.reduce((a, p) => a + p.shortage, 0)
      const usedMap       = {}
      for (const p of skuPlans)
        for (const t of p.transfers)
          usedMap[t.fromLoc] = (usedMap[t.fromLoc] || 0) + t.qty
      const leftover = rows.reduce((a, r) => {
        const av = r.effectiveAvail[dk] ?? 0
        return av <= 0 ? a : a + av - (usedMap[r.loc] || 0)
      }, 0)
      const stillShort = skuPlans.reduce((a, p) => a + p.stillShort, 0)
      dateStats[dk] = { totalAvail, totalShortage, leftover, stillShort }
    }
    return { sku, desc, totalOwn, totalInsp, totalLocked, dateStats }
  })
}
