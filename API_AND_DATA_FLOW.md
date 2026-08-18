# API & Data Flow Documentation

This document describes how state is managed, how data is synchronized, and how simulated API updates behave in **NAGPUR RESQ**.

---

## 1. Mock Data Integration Layer

All baseline records are imported from `src/data/mockData.js`:

- `EMERGENCIES`: Active emergency objects (e.g. `ER-1024` with accidents in Sitabuldi, severe clinical requirements).
- `AMBULANCES`: Active fleet profiles (e.g. Advanced Life Support `A-104` with capability lists, suitability weights).
- `HOSPITALS`: Clinical network profiles (e.g. GMC Level 1 Trauma Center with ICU bed availability, readiness status).
- `NAV_ITEMS`: Navigation items representing app views.

---

## 2. Global State Orchestrator (`src/App.jsx`)

Main React hooks running the app:

```javascript
// Base states loaded from data models
const [emergencies, setEmergencies] = useState(initialEmergencies);
const [ambulances, setAmbulances] = useState(initialAmbulances);
const [hospitals, setHospitals] = useState(initialHospitals);

// View navigation state
const [activeView, setActiveView] = useState("dashboard");

// Live telemetry state
const [activeMission, setActiveMission] = useState(null);

// Congestion rerouting state
const [blockageState, setBlockageState] = useState("none");
```

---

## 3. Simulated API Telemetry Streams

Instead of standard HTTP requests, NAGPUR RESQ uses React state timers to simulate real-time API telemetry streams:

### A. Live Mission Ticker
- **Trigger**: Clicks **START MISSION** in the dispatch wizard.
- **Interval**: Runs every 1500ms.
- **Effect**: Decrements remaining distance, fluctuates speeds, recalculates ETAs, updates signal junction highlights, and appends transit log events to the timeline.

### B. Congestion Reroute Recalculation
- **Trigger**: Clicks **⚠ SIMULATE TRAFFIC BLOCKAGE** on the mission page.
- **Delay**: 3000ms delay to simulate server recalculation.
- **Effect**: Sets `blockageState` to `"updated"`, calculates bypass routes, recovers ETA time to `09:18`, and notifies GMC Hospital.

### C. Automated Demo Stepper
- **Trigger**: Clicks **▶ START DEMO** on the header bar.
- **Interval**: Runs every `1000 / demoSpeed` milliseconds.
- **Effect**: Progresses through 17 chronological steps to automate dashboard actions.

---

## 4. State Mappings & Rendering

Data flows from parent states down to UI components via props:

```text
       [App.jsx Global State]
       /        |         \
      /         |          \
     v          v           v
[Dashboard] [DriverView] [MissionPage]
  MapSection updates coordinates in lockstep.
  Ambulance lists update speeds and status dynamically.
  Hospital lists decrement available ICU beds.
```

---

## 5. Visual Loader, Empty, and Error Panels

Handled via `src/components/StatusWidgets.jsx`:
- **Loaders**: Flex-center spinners displaying status messages (e.g. *Calculating route...*).
- **Empty States**: Renders informational callouts when grids are empty (e.g. *No active emergencies*).
- **Error States**: Renders alerts for GPS staleness or connection loss, providing a `[ RETRY ]` handler to reconnect the mock feed.
- **Warning indicators**: Inline warning banners alert dispatchers of hospital capacity limits.
