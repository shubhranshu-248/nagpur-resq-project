# NAGPUR RESQ — Emergency Response Orchestration Platform

> **"From Incident to Treatment — Every Second Coordinated."**

NAGPUR RESQ is an advanced emergency command centre dashboard prototype built for smart ambulance dispatch, AI-assisted clinical matching, dynamic traffic corridor management, and real-time telemetry streaming in Nagpur city.

---

## ⚡ Main Features

- **Command Centre Dashboard**: Displays active incidents, ready trauma units, dynamic KPI counters, live sector tracking maps, and fleet telemetrics.
- **AI Recommendation Wizard**: Orchestrates patient inputs, ranks ambulances based on capabilities (rejecting unsuitable units like BLS for critical ICU dispatches), opens explainable DRA scorecards, and filters Level 1 trauma centers.
- **Transit Telemetry Simulator**: Streams live coordinates, fluctuates speeds, and updates ETAs in lockstep across driver terminals, municipal grids, and operators' desks.
- **Congestion Rerouting**: Simulates unexpected traffic blockages, recalculates bypass routing (Route V2), updates GMC Hospital pre-alert ETAs, and triggers bypass green corridors.
- **Mobile Driver Console**: A mobile-first screen inside a CSS smartphone frame showing speedometers, impended signals, and diagnostic switches (simulating stale GPS or server disconnects).
- **Performance Analytics**: Renders comparative bar graphs (Baseline 18:42 mins vs Nagpur RESQ 12:21 mins) and sector utilization charts built with pure CSS.
- **Mission History Database**: Logs archived dispatches with detailed step summaries and historical timelines.

---

## 🛠️ Technology Stack

- **Core**: React.js (v18+), JavaScript (ES6+), JSX
- **Styling**: Vanilla CSS (no Tailwind, kept clean for B.Tech student editing)
- **Bundler**: Vite (v8+)
- **Icons**: Lucide React

---

## 📁 Project Structure

```text
NAGPUR RESQ PROJECT/
│
├── src/
│   ├── components/                 # Reusable UI Blocks
│   │   ├── AmbulanceCard.jsx       # Ambulance stats & contact card
│   │   ├── EmergencyCard.jsx       # Active incident detail card
│   │   ├── ExplainableDrawer.jsx   # Proximity/capabilities scorecard drawer
│   │   ├── HospitalCard.jsx        # ICU beds & oxygen levels card
│   │   ├── KpiCard.jsx             # Top dashboard counter widgets
│   │   ├── MapSection.jsx          # Live Nagpur sector grid rendering
│   │   ├── Sidebar.jsx             # Left navigation role panel
│   │   ├── StatusWidgets.jsx       # Reusable Loader/Empty/Error panels
│   │   ├── Toast.jsx               # Floating alert status indicators
│   │   └── TopBar.jsx              # Header bar & Demo stepper cockpit
│   │
│   ├── pages/                      # Page View Modules
│   │   ├── AnalyticsPage.jsx       # Response graphs and comparative charts
│   │   ├── DriverView.jsx          # Smartphone console driver dashboard
│   │   ├── EmergenciesPage.jsx     # Active incident database list
│   │   ├── GreenCorridorPage.jsx   # Signal priority override board
│   │   ├── MissionCompletedPage.jsx# Debrief metrics and time saved logs
│   │   ├── MissionHistoryPage.jsx  # Archived historical resolved logs
│   │   ├── MissionPage.jsx         # Live map tracking & blockage control
│   │   ├── NewEmergencyFlow.jsx    # Dispatch wizard form & AI rankings
│   │   └── TrafficOperatorView.jsx # Municipal junction logs terminal
│   │
│   ├── data/
│   │   └── mockData.js             # Initial state lists and nav items
│   │
│   ├── utils/
│   │   └── simulation.js           # 180s automated hackathon script
│   │
│   ├── App.jsx                     # Central state router and tickers
│   ├── main.jsx                    # Application entry point
│   ├── index.css                   # Global tokens and design variables
│   └── App.css                     # Global view layout grids
│
├── index.html                      # DOM mounting page
├── package.json                    # Project dependencies
└── vite.config.js                  # Vite configuration settings
```

---

## 🚀 Setup & Execution

### 1. Install Dependencies
Restore all dependencies from `package.json`:
```bash
npm install
```

### 2. Run Local Development Server
Launch the server:
```bash
npm run dev
```
Open **[http://localhost:5173/](http://localhost:5173/)** in your web browser.

### 3. Production Build
Verify files compile cleanly:
```bash
npm run build
```

---

## 🟣 Prototype Simulation Safety Notice

This application is a **frontend prototype simulator**. 
- No actual Nagpur municipal traffic signals or GPS servers are controlled.
- Data shown on maps, hospitals, and ambulance statuses represents simulated **DEMO DATA** for presentation evaluation.
