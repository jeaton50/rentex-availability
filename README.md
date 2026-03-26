# Rentex Transfer Analyzer

Inventory transfer planning tool for Rentex's 13 national locations.  
Analyzes RTPro availability data, identifies shortages, and generates proximity-prioritized transfer plans.

## Features

- **Multi-date selection** — analyze any combination of 21 date windows simultaneously
- **Shortage & Transfer Plans** — worst-case analysis across selected dates, closest-location-first donor ranking
- **Network Overview** — SKU-level totals across all locations with date-by-date leftover breakdown
- **Inspection Toggle** — include/exclude units currently in inspection from availability calculations

---

## Local Development

```bash
npm install
npm run dev
```
Opens at `http://localhost:5173/rentex-analyzer/`

---

## Deploy to GitHub Pages

### First-time setup

1. Create a new GitHub repo named `rentex-analyzer`
2. In your repo settings → **Pages** → set Source to **GitHub Actions**
3. Push this project to the `main` branch

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/rentex-analyzer.git
git push -u origin main
```

The GitHub Actions workflow (`.github/workflows/deploy.yml`) will automatically build and deploy on every push to `main`.

Your app will be live at:  
`https://YOUR_USERNAME.github.io/rentex-analyzer/`

### If your repo is named something different

Edit `vite.config.js` and change the `base` field to match your repo name:
```js
base: '/your-repo-name/',
```

---

## Updating inventory data

All inventory data lives in `src/data.js`. When you get a new RTPro export:

1. Open `src/data.js`
2. Update the `DATE_COLS` object with new date windows
3. Update the `RAW_ROWS` array with new availability numbers
4. Commit and push — the site redeploys automatically

---

## Project structure

```
rentex-analyzer/
├── src/
│   ├── App.jsx          # Root component, state management
│   ├── data.js          # All inventory data + constants
│   ├── logic.js         # Transfer planning algorithms
│   ├── components.jsx   # Shared UI primitives
│   ├── ShortagesTab.jsx # Shortage & transfer plan view
│   ├── NetworkTab.jsx   # Network-wide overview
│   ├── InspectionTab.jsx# Inspection unit management
│   ├── main.jsx         # React entry point
│   └── index.css        # Global styles + CSS variables
├── public/
│   └── favicon.svg
├── .github/
│   └── workflows/
│       └── deploy.yml   # Auto-deploy to GitHub Pages
├── index.html
├── vite.config.js
└── package.json
```
