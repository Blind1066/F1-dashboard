# Pitwall — Formula 1 Hub (React 18 + Vite + TypeScript)

A Formula 1 calendar, live countdowns, weekend timings in local & circuit track times, race classification telemetry, and championship standings website.

Powered by the [Jolpica F1 API](https://github.com/jolpica/jolpica-f1), [OpenF1 API](https://openf1.org), [FlagCDN](https://flagcdn.com), and [Fast-F1 telemetry data](https://github.com/theOehrly/Fast-F1).

---

## Stack
* **Vite + React 18 + TypeScript** (strict mode, zero `any`)
* **React Router v6** (`/` = Race Schedule, `/standings` = Championship Standings, `/news`, `/live`, `/telemetry`)
* **TanStack Query v5** (caching, automatic refetch management, offline resilience)
* **CSS** (plain responsive CSS with CSS variables and light/dark theme support)

---

## Getting Started

### Development
```bash
cd pitwall-react
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173).

### Production Build
```bash
cd pitwall-react
npm run build
npm run preview
```

---

## Features
* **Race Schedule (Homepage):**
  * Spotlight card for the Next Grand Prix with live countdown to lights out (days, hours, minutes, seconds).
  * Dual time conversion: Your local device time alongside circuit track local time.
  * Relative time difference indicator (e.g. `⏱️ Track is 8h 30m behind your local time`).
  * Full weekend session schedule (Practice 1, Practice 2, Practice 3, Qualifying, Grand Prix).
  * 2026 Grand Prix Calendar with status filtering: `All (23)`, `Upcoming (4)`, and `Completed (19)`.
  * High-resolution country flags from FlagCDN.
* **Results Window (Fast-F1 & FIA Classification):**
  * Click any finished race or `RESULTS ↗` button to open the full race classification modal.
  * Weekend highlight cards featuring driver headshot photos for Race Winner, Pole Position, and Fastest Lap.
  * Full finishing order table with Grid starting positions, positions gained/lost (`▲ +3`, `▼ -2`), total race time or interval gap, purple fastest lap indicators, and championship points.
  * Qualifying tab with Q1, Q2, and Q3 session lap timings.
  * Sprint race classification tab for sprint weekends.
* **Championship Standings (`/standings`):**
  * 2026 Drivers' & Constructors' championship standings.
  * Leader cards with driver headshots and constructor logos.
  * After-round historical standings selector with position delta arrows and points gained.
  * Offline fallback mode with sample data banner.
