<div align="center">

# 🏎️ PITWALL — Formula 1 Telemetry & Analytics Hub

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0.3-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-5.62-FF4154?style=for-the-badge&logo=reactquery&logoColor=white)](https://tanstack.com/query)
[![Recharts](https://img.shields.io/badge/Recharts-3.10-22b5bf?style=for-the-badge&logo=d3.js&logoColor=white)](https://recharts.org/)
[![OpenF1](https://img.shields.io/badge/OpenF1-API_v1-E10600?style=for-the-badge&logo=formula1&logoColor=white)](https://openf1.org/)

**A professional, dark-mode motorsport dashboard engineered for live and historical Formula 1 performance analytics, distance-synchronized telemetry comparison, tyre degradation modelling, and official FIA Grand Prix schedules.**

[Features](#-key-features) • [APIs & Keys](#-apis--data-sources-everything-used) • [Tech Stack](#-technical-stack--dependencies) • [Project Structure](#-project-structure) • [Getting Started](#-getting-started) • [Deployment](#-deployment-vercel)

</div>

---

## 📌 Overview

**PITWALL** is a high-performance web application designed for motorsport engineers, data analysts, and Formula 1 enthusiasts. It pairs real-time session data from **OpenF1** and historical classification from **Jolpica F1 (Ergast)** with a high-fidelity local telemetry physics engine to provide interactive car telemetry, sector-by-sector delta analysis, tyre degradation modeling, and circuit visualizers.

---

## 🚀 Key Features

### 1. Interactive Driver Telemetry & Performance Analytics (`/telemetry`)
* **Distance-Synchronized Charts**: Compare speed, throttle application, braking pressure, gear selection, and engine RPM across every meter of the track.
* **Dual-Driver Comparison Overlay**: Overlay two drivers (e.g. Verstappen vs. Norris) on the same lap with color-coded traces and automatic time delta gain/loss calculations.
* **Lap-by-Lap Timing & Sectors**: Complete lap history with sector 1, sector 2, and sector 3 times, personal bests, and theoretical best lap (sum of optimal sectors).
* **Tyre Degradation Modeling**: Real-time compound tracking (Soft, Medium, Hard, Intermediate, Wet), tyre age, degradation curves, and pit stop durations.
* **Race Pace & Position Progression**: Position changes from starting grid to chequered flag, gaps to leader and car ahead, safety car periods, and race control flags.
* **Official Grand Prix Starting Grid & Classification**: Direct row-click driver selector with real starting grid positions, finishing positions, and net deltas.
* **Interactive Circuit Blueprint**: Real vector circuit map with telemetry heatmaps, braking zones, and speed traps.

### 2. Multi-Season Race Calendar & Timings (`/schedule`)
* **Dual Season Separation**: Seamless switching between the **2026 FIA Formula 1 Championship** and the **2027 Provisional Calendar**.
* **Automatic Dual Time Zone Conversion**: Displays race session times in your browser's local time zone alongside track local time.
* **Countdown to Lights Out**: Digital countdown clocks (days, hours, minutes, seconds) for the next upcoming Grand Prix.
* **Full Weekend Sessions**: Complete schedules for FP1, FP2, FP3, Qualifying, Sprint Shootout, Sprint Race, and Grand Prix.
* **Circuit Blueprint & Photography**: Official track silhouettes, turn numbers, DRS zones, lap records, and high-resolution track photography.

### 3. World Championship Standings (`/standings`)
* **Driver & Constructor Title Tables**: Live points, wins, podiums, position changes, and points gained.
* **Historical Round-by-Round Time Travel**: Inspect the title standings after any completed round of the season.
* **Driver Headshots & Team Crests**: Official FIA high-res driver portraits and vector constructor marks.

---

## 🔑 APIs & Data Sources (Everything Used)

All APIs used in this project are **100% free and open-access**. **No paid API keys or credit cards are required** to clone and run the project locally or in production.

| Service | Purpose | Auth / API Key Required? | Base URL / Endpoints | Notes & Rate Limits |
|:---|:---|:---:|:---|:---|
| **OpenF1 API** | High-frequency car telemetry, lap timing, stints, intervals, weather & race control | **NO** (Free Public Access) | `https://api.openf1.org/v1` | Historical sessions (e.g. Brazilian GP Session `#9636`) are completely free. Paid subscriptions are only for sub-second live websockets. |
| **Jolpica F1 API** | Official race results, starting grids, qualifying times, driver & constructor standings | **NO** (Free Public Access) | `https://api.jolpi.ca/ergast/f1/` | Modern successor to the Ergast Developer API. Requires a valid `User-Agent` HTTP header (pre-configured in our client). |
| **FlagCDN** | Country flag icons for driver nationalities and Grand Prix host nations | **NO** (Free Public CDN) | `https://flagcdn.com/w40/{code}.png` | High-resolution PNG and SVG country flags. |
| **Formula 1 Media CDN** | Official driver portraits, headshots, and car imagery | **NO** (Public CDN) | `https://media.formula1.com/` | Used as primary source for driver profile images. |
| **Internal Physics Engine** | High-precision Interlagos telemetry, car dynamics & fallback simulation | **NO** (Pure TypeScript) | `src/api/telemetryDemo.ts` | Local engine with realistic car physics (braking points, apex speeds, RPM redline, tyre deg) when offline. |

### API Endpoints Utilized in Detail:

#### 1. OpenF1 Endpoints (`https://api.openf1.org/v1`)
* `GET /sessions?session_key={key}` — Retrieves session metadata, circuit short names, and GMT offsets.
* `GET /drivers?session_key={key}` — Retrieves the 20 participating drivers, racing numbers, acronyms, and team names.
* `GET /car_data?session_key={key}&driver_number={num}&date>={start}&date<={end}` — Streams speed (km/h), throttle (0-100%), brake (0/1), RPM, gear (1-8), and DRS status.
* `GET /laps?session_key={key}&driver_number={num}` — Lap times, S1/S2/S3 sector splits, and i1/i2 speed traps.
* `GET /stints?session_key={key}&driver_number={num}` — Tyre compounds fitted, start lap, end lap, and tyre age.
* `GET /position?session_key={key}&driver_number={num}` — Lap-by-lap position progression.
* `GET /intervals?session_key={key}&driver_number={num}` — Gap to race leader and interval to the car ahead.
* `GET /pit?session_key={key}&driver_number={num}` — Pit stop in-lap, lane duration, and stationary stop duration.
* `GET /race_control?session_key={key}` — Flags (Yellow, Green, Red), Safety Car (SC), and Virtual Safety Car (VSC).
* `GET /weather?session_key={key}` — Air temperature, track temperature, humidity, and rainfall flags.
* `GET /session_result?session_key={key}` — Final classified finishing positions, points awarded, and laps completed.

#### 2. Jolpica F1 Endpoints (`https://api.jolpi.ca/ergast/f1`)
* `GET /{year}.json` — Full Grand Prix schedule for the chosen season.
* `GET /{year}/{round}/results.json` — Official race classification and starting grid positions.
* `GET /{year}/{round}/qualifying.json` — Q1, Q2, and Q3 session timings.
* `GET /{year}/{round}/sprint.json` — Sprint race classification.
* `GET /{year}/{round}/driverStandings.json` — World Drivers' Championship standings after a given round.
* `GET /{year}/{round}/constructorStandings.json` — World Constructors' Championship standings after a given round.

---

## 🛠️ Technical Stack & Dependencies

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.28.0",
    "@tanstack/react-query": "^5.62.8",
    "recharts": "^3.10.1"
  },
  "devDependencies": {
    "typescript": "^5.6.3",
    "vite": "^6.0.3",
    "@vitejs/plugin-react": "^4.3.4",
    "@types/react": "^18.3.18",
    "@types/react-dom": "^18.3.5"
  }
}
```

* **Vite 6**: Ultra-fast build tool and modern dev server with instant Hot Module Replacement (HMR).
* **React 18 & TypeScript 5**: Component-driven UI built under strict TypeScript compilation mode with 100% type safety.
* **TanStack Query (React Query) v5**: Handles intelligent asynchronous state management, in-memory caching with 30-minute stale time, and offline fallback transitions.
* **Recharts 3**: Composable SVG charting library driving the synchronized multi-channel telemetry displays.
* **React Router v6**: Client-side routing with URL query-string state synchronization (`?season=2026`, `?season=2027`).
* **Pure CSS (No Heavy Frameworks)**: Dark motorsport dashboard aesthetic with custom CSS variables, responsive design, and hardware-accelerated transitions.

---

## 📂 Project Structure

```
c:\Users\MAMAT\Desktop\f1\
├── public/
│   ├── assets/
│   │   ├── headshots/          # Local driver portraits (Lindblad, Ocon, Tsunoda, etc.)
│   │   ├── logos/              # Official SVG vector constructor team logos
│   │   └── tracks/             # 2026/2027 track photo cards
│   └── favicon.svg             # Pitwall brand favicon
├── src/
│   ├── api/
│   │   ├── openf1.ts           # OpenF1 REST API client with in-memory caching
│   │   ├── jolpica.ts          # Jolpica F1 Ergast client & time zone formatter
│   │   ├── demo.ts             # 2026 & 2027 official/provisional calendar datasets
│   │   └── telemetryDemo.ts    # High-precision Interlagos physics simulation engine
│   ├── components/
│   │   ├── telemetry/          # Telemetry & Performance Analytics Suite
│   │   │   ├── DriverAnalyticsView.tsx    # Telemetry view container & tab router
│   │   │   ├── DriverAnalyticsHeader.tsx  # Driver profile card, stats & selectors
│   │   │   ├── TelemetryCharts.tsx        # Speed, Throttle, Brake, Gear, RPM traces
│   │   │   ├── LapAnalysisTab.tsx         # Lap table, PB progression, sector splits
│   │   │   ├── TyreDegradationTab.tsx     # Stints timeline, compound wear curves
│   │   │   ├── RacePaceTab.tsx            # Position progression & gap to leader
│   │   │   ├── DriverComparisonTab.tsx    # Head-to-head overlay & delta analysis
│   │   │   └── CircuitTelemetryMap.tsx    # GPS circuit trace & speed heatmap
│   │   ├── Banner.tsx          # Warning & status banners
│   │   ├── NextRaceCard.tsx    # Spotlight card with digital countdown clock
│   │   ├── NextRacesTiles.tsx  # Upcoming Grand Prix cards
│   │   ├── RaceItem.tsx        # Accordion race item with session timings
│   │   ├── ResultsModal.tsx    # Full-screen race classification modal
│   │   ├── StandingsTable.tsx  # Drivers & Constructors standings tables
│   │   ├── TopBar.tsx          # Navigation header
│   │   └── TrackBlueprint.tsx  # Dynamic SVG circuit vector renderer
│   ├── data/
│   │   └── circuits.ts         # Vector SVG paths, turn coordinates, DRS zones
│   ├── pages/
│   │   ├── Home.tsx            # Spotlight countdown & upcoming 2026 rounds
│   │   ├── Schedule.tsx        # 2026 vs 2027 separated race schedules
│   │   ├── Standings.tsx       # Championship standings with round selector
│   │   └── Telemetry.tsx       # Dedicated full-screen Driver Telemetry page
│   ├── types/
│   │   ├── index.ts            # Schedule, race, and standings TypeScript types
│   │   └── telemetry.ts        # OpenF1 and telemetry channel TypeScript types
│   ├── utils/
│   │   └── trackPhotos.ts      # Circuit photo resolver & weekend date formatters
│   ├── App.tsx                 # App routing & React Query client provider
│   ├── index.css               # Global dark motorsport dashboard styling
│   └── main.tsx                # Application entrypoint
├── vercel.json                 # Vercel SPA routing rewrite rules & CDN headers
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 💻 Getting Started

### Prerequisites
* **Node.js**: `v18.0.0` or higher
* **npm**: `v9.0.0` or higher (or `pnpm` / `yarn`)

### Installation & Run

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Blind1066/F1-dashboard.git
   cd F1-dashboard
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start local development server:**
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173`.

4. **Verify TypeScript & Production Build:**
   ```bash
   npm run build
   ```

5. **Preview Production Build locally:**
   ```bash
   npm run preview
   ```

---

## 🌐 Deployment (Vercel)

The project includes a production-ready `vercel.json` configured for single-page applications:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Deploying to Vercel in 2 Minutes:
1. Push your code to your GitHub repository.
2. Go to [vercel.com](https://vercel.com) and click **"Add New..." → "Project"**.
3. Select your repository (`F1-dashboard`).
4. Keep the default settings (**Framework Preset: Vite**, **Output Directory: `dist`**).
5. Click **Deploy**.

---

## 📊 Telemetry Channels & Units Reference

| Telemetry Channel | Unit | Range | Description |
|:---|:---:|:---:|:---|
| **Distance** | Metres ($m$) | $0 - 4309$ | Distance along the racing line from the start/finish line. |
| **Speed** | $km/h$ | $0 - 350$ | Instantaneous GPS/wheel vehicle speed. |
| **Throttle** | Percentage ($\%$) | $0 - 100\%$ | Throttle pedal application percentage. |
| **Brake** | Percentage ($\%$) | $0 - 100\%$ | Hydraulic braking pressure application. |
| **Gear** | Integer | $1 - 8$ | Active transmission gear selection ($N$ for neutral). |
| **Engine RPM** | $RPM$ | $0 - 12500$ | Internal combustion engine crankshaft rotational speed. |
| **DRS** | Boolean / State | $0, 10, 12, 14$ | Drag Reduction System activation state. |
| **Lap Time** | $m:ss.fff$ | - | Lap duration formatted to thousandths of a second. |

---

<div align="center">
  <sub>Engineered with ❤️ for Formula 1 fans and motorsport telemetry analysts worldwide.</sub>
</div>
