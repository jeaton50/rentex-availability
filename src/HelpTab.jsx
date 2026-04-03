export default function HelpTab() {
  const Section = ({ title, children }) => (
    <div style={{ marginBottom: 36 }}>
      <div style={{
        color: 'var(--accent)', fontSize: 12, letterSpacing: 3, fontWeight: 700,
        marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid #ff6b3520',
      }}>
        {title}
      </div>
      {children}
    </div>
  )

  const Row = ({ label, color = 'var(--yellow)', children }) => (
    <div style={{ display: 'flex', gap: 16, marginBottom: 12, alignItems: 'flex-start' }}>
      <span style={{
        color, fontWeight: 700, fontSize: 13, minWidth: 160, flexShrink: 0,
        letterSpacing: 0.5,
      }}>
        {label}
      </span>
      <span style={{ color: 'var(--text-dim)', fontSize: 14, lineHeight: 1.6 }}>
        {children}
      </span>
    </div>
  )

  const Chip = ({ label, color }) => (
    <span style={{
      display: 'inline-block',
      background: color + '20', color, border: `1px solid ${color}44`,
      borderRadius: 3, padding: '2px 9px', fontSize: 12, fontWeight: 700,
      marginRight: 6, marginBottom: 4,
    }}>{label}</span>
  )

  return (
    <div className="fade-in" style={{ maxWidth: 860 }}>

      {/* Intro */}
      <div style={{
        background: '#0c0c18', border: '1px solid #2a2a40',
        borderRadius: 6, padding: '20px 24px', marginBottom: 36,
      }}>
        <div style={{ color: 'var(--text)', fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
          What is this tool?
        </div>
        <div style={{ color: 'var(--text-dim)', fontSize: 14, lineHeight: 1.8 }}>
          The Rentex Transfer Analyzer reads inventory export files from RTPro and shows you
          where equipment shortages exist across all locations — and which other locations can
          send units to cover them. It also tracks your actual owned inventory against what
          RTPro reports, and lets you view bookings from the orders file.
        </div>
      </div>

      {/* Loading Files */}
      <Section title="LOADING FILES">
        <Row label="RTPro Availability">
          Export from RTPro → Rental Availability List. This is the main file — it drives
          all shortage, transfer, inspection, and location analysis.
        </Row>
        <Row label="Orders / Bookings">
          The "Equipment Availability Data Update" export. Optional — load it alongside
          the availability file to get a full Orders & Bookings tab showing active orders
          by date, customer, and location.
        </Row>
        <Row label="Combined Mode">
          Load both files at once and click <strong style={{ color: 'var(--green)' }}>⚡ LAUNCH COMBINED</strong> to
          get all tabs including Orders. Either file also works on its own.
        </Row>
      </Section>

      {/* Header Stats */}
      <Section title="HEADER STATS">
        <Row label="Total Owned" color="var(--text)">
          Total units owned across all locations as reported by RTPro.
        </Row>
        <Row label="Locations" color="var(--blue)">
          Number of distinct warehouse locations in the file.
        </Row>
        <Row label="Shortage Events" color="var(--accent)">
          Number of unique SKU + location combinations that are short on at least one selected date.
        </Row>
        <Row label="Units Short" color="var(--red)">
          Total units needed to fill all shortages across selected dates.
        </Row>
        <Row label="Unresolvable" color="var(--orange)">
          Units that are short but cannot be covered by transferring from any other location.
        </Row>
        <Row label="Booked" color="var(--blue)">
          Units currently out on rental (owned minus locked, inspection, repair, and available today).
        </Row>
        <Row label="In Inspection" color="var(--yellow)">
          Units flagged as being in the inspection queue in RTPro.
        </Row>
        <Row label="In Repair" color="var(--red)">
          Units flagged as in repair and not available for rental.
        </Row>
        <Row label="Quarantined" color="#bb66ff">
          Units held in quarantine and excluded from availability.
        </Row>
        <Row label="Late Return" color="var(--orange)">
          Units that are overdue to return from a rental.
        </Row>
        <Row label="Locked" color="var(--orange)">
          Units locked to a specific attachment or job and not freely transferable.
        </Row>
        <Row label="Open If Cleared" color="var(--green)">
          How many units would be rentable once all inspection, repair, and quarantine
          is resolved — this is your maximum possible available inventory.
        </Row>
      </Section>

      {/* Actual Inventory Panel */}
      <Section title="ACTUAL INVENTORY PANEL">
        <div style={{ color: 'var(--text-dim)', fontSize: 14, lineHeight: 1.8, marginBottom: 12 }}>
          Shows your ground-truth unit counts for the five main SKUs compared to what RTPro
          currently reports. The diff is highlighted:
        </div>
        <div style={{ marginBottom: 8 }}>
          <Chip label="+20 green" color="var(--green)" /> RTPro is under-reporting — you physically own more than it shows.
        </div>
        <div>
          <Chip label="-3 red" color="var(--red)" /> RTPro is over-reporting — the file shows more than you actually have.
        </div>
      </Section>

      {/* Date Windows */}
      <Section title="DATE WINDOWS">
        <Row label="Selecting Dates">
          Click any date button to include or exclude it from the shortage analysis. You can
          select multiple dates at once — the system shows the worst-case shortage for each
          SKU/location combination across all selected dates.
        </Row>
        <Row label="Orange dot ●">
          A small dot on a date button means there is at least one shortage on that date.
        </Row>
        <Row label="Poster Hover">
          Hover over any date to see a popup showing available poster inventory on that date —
          broken down by SKU with Owned / In Use / Available counts.
        </Row>
      </Section>

      {/* Tabs */}
      <Section title="TABS">
        <Row label="Shortages & Transfers">
          The main view. Lists every shortage — the SKU, location, how many units short,
          and a suggested transfer plan showing which nearby locations can send units to cover it.
          Locations are sorted closest-first from Dallas.
        </Row>
        <Row label="Network Overview">
          A grid showing availability for every SKU at every location across selected dates.
          Good for spotting where inventory is concentrated.
        </Row>
        <Row label="Inspection">
          Lists all units in inspection, repair, or quarantine. Toggle the "Include?" switch
          on any row to temporarily add those units back into the availability calculation —
          useful for planning around units that are about to be cleared.
          Also lets you manually add poster inventory on specific dates.
        </Row>
        <Row label="Locations">
          A summary table showing totals per warehouse: owned, available, booked,
          inspection, repair, quarantined, late return, locked, and open if cleared.
        </Row>
        <Row label="Orders & Bookings">
          Only available when the orders file is loaded alongside the availability file.
          Shows all active bookings on a selected date — per-SKU cards with location
          breakdowns and a full sortable orders table.
        </Row>
        <Row label="How To Use (this tab)">
          You're here.
        </Row>
      </Section>

      {/* Tips */}
      <Section title="TIPS">
        <Row label="Updating inventory">
          The actual owned counts (40 / 44 / 98 / 50 / 19) are hardcoded in the app.
          To change them, edit the <Chip label="ACTUAL_INVENTORY" color="var(--blue)" /> object in <code style={{ color: 'var(--text-dim)', fontSize: 12 }}>src/data.js</code>.
        </Row>
        <Row label="New file">
          Click <strong style={{ color: '#888' }}>↑ New File</strong> in the top-right corner
          to go back to the upload screen and load a fresh export without refreshing the page.
        </Row>
        <Row label="Inspection toggles">
          Turning on "Include?" for a unit adds it back to available inventory across all
          dates — so you'll immediately see if it would resolve any shortages.
        </Row>
      </Section>

    </div>
  )
}
