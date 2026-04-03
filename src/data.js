// ── Actual physical inventory (ground truth) ──────────────────────────────
// These are the real unit counts we own, independent of what RTPro reports.
// Used to flag discrepancies and correct network-wide totals.
export const ACTUAL_INVENTORY = {
  'EXO640B1BK':  40,
  'EXO640B2BK':  44,
  'EXO640B3BK':  98,
  'EXO640B4BK':  50,
  'EXO560BK':    19,
}

// ── Location proximity order from DALLAS (home location) — closest first ──
export const LOCATION_ORDER = [
  'DALLAS','HOUSTON','NASHVILLE','CHICAGO','ATLANTA',
  'ORLANDO','FTLAUDER','WDC','PHILADELPH','NEWYORK',
  'BOSTON','ANAHEIM','LASVEGAS','PHOENIX','SANFRAN',
]

export const LOC_COLORS = {
  DALLAS:    '#ff6b35',
  CHICAGO:   '#4db6ff',
  NEWYORK:   '#a78bfa',
  ORLANDO:   '#4caf50',
  FTLAUDER:  '#26c6da',
  LASVEGAS:  '#f0c040',
  ANAHEIM:   '#ef9a9a',
  BOSTON:    '#80cbc4',
  NASHVILLE: '#ffb74d',
  PHOENIX:   '#ff8a65',
  SANFRAN:   '#81d4fa',
  WDC:       '#ce93d8',
  PHILADELPH:'#b0bec5',
  HOUSTON:   '#a5d6a7',
  ATLANTA:   '#80deea',
  MIAMI:     '#f48fb1',
  SEATTLE:   '#b39ddb',
  DENVER:    '#a5d6a7',
}
