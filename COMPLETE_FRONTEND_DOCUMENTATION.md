# Complete Frontend Reference Documentation

This document describes the frontend architecture, component layout structure, user action behaviors, state variables, form validation criteria, and diagnostic controls of the **NAGPUR RESQ** application.

---

## 1. Project Overview & Main Modules
NAGPUR RESQ is designed for city-wide emergency dispatch orchestration. The platform integrates:
- **Active Dispatch Control**: Real-time updates for coordinates, ETA, and speeds.
- **AI Recommendation Engine**: Filters fleet units and matches hospitals based on patient requirements.
- **ITMS Traffic Overrides**: Synchronized priority light switches along emergency paths.
- **Performance Auditing**: CSS graphs illustrating response metrics.

---

## 2. Directory & Components Architecture

```text
src/
 ├── App.jsx                   # Central state machine, views router, and simulation intervals
 ├── App.css                   # Responsive dashboard layouts and modal overlays
 ├── index.css                 # CSS variables, animations, and color scheme tokens
 ├── components/               # Reusable view components
 │    ├── Sidebar.jsx          # Left drawer menu listing active views
 │    ├── TopBar.jsx           # Header details and automated demo stepper cockpit
 │    ├── MapSection.jsx       # Nagpur grid rendering showing live vehicle position
 │    ├── KpiCard.jsx          # Counter dashboard widgets
 │    ├── EmergencyCard.jsx    # Quick details log for active emergencies
 │    ├── AmbulanceCard.jsx    # Onboard equipments and score breakdowns
 │    ├── HospitalCard.jsx     # Bed vacancy and readiness states
 │    ├── StatusWidgets.jsx    # Loaders, empty warnings, and diagnostic panels
 │    └── Toast.jsx            # Floating success/error warning logs
 │
 └── pages/                    # Multi-view template pages
      ├── EmergenciesPage.jsx  # Registry of all incidents
      ├── NewEmergencyFlow.jsx # Multi-step dispatch wizard
      ├── MissionPage.jsx      # Telemetry logs and road blockage simulation controls
      ├── GreenCorridorPage.jsx# Interactive municipal traffic signal overriding panel
      ├── DriverView.jsx       # Driver console HUD inside smartphone frame
      ├── TrafficOperatorView.jsx # Monospace municipal logs console
      ├── AnalyticsPage.jsx    # Custom CSS comparative graphs
      └── MissionHistoryPage.jsx# Log list database of completed runs
```

---

## 3. Data Flow Mechanism

State is handled in `App.jsx` and passed down to children via React props.

```text
User Actions (e.g. click Assign, trigger blockage, or toggle demo)
  ↓
Calls state-updating callbacks in App.jsx (e.g. handleStartMission, triggerBlockage)
  ↓
App.jsx runs tickers (e.g. 1.5s live route ticker or 1s automated demo stepper)
  ↓
State variables (activeMission, blockageState, activeView) are modified
  ↓
React updates props and triggers component re-renders
  ↓
UI nodes (maps, timeline feeds, driver console, traffic bulbs) display updated telemetry
```

---

## 4. Complete Page Matrix

| Page Name | Routing ID | Purpose | Layout Structure | Main Components Used |
| :--- | :--- | :--- | :--- | :--- |
| **Command Centre** | `dashboard` | Global operational overview. | 5 KPI Cards → Map Panel → 2 Columns (Fleet list & Active incident card). | `MapSection`, `AmbulanceCard`, `EmergencyCard`, `HospitalCard`, `KpiCard` |
| **Emergencies** | `emergencies` | List active emergency alerts. | Header → Registry list rows. | `EmergencyCard` |
| **New Dispatch** | `new-emergency` | Multi-step setup wizard. | Wizard Steps Header → Active Form Step panels. | `AmbulanceCard`, `HospitalCard`, `ExplainableDrawer`, `LoaderWidget` |
| **Live Mission** | `mission` | Telemetry logs and routing path. | Anomaly Banners → Live Map Track → 2 Columns (Metrics & Timelines). | `MissionPage`, `LoaderIcon` |
| **Green Corridor** | `corridor` | Signal overrides board. | Header note → 4 Junction light cards with blinking CSS bulbs. | `GreenCorridorPage` |
| **Driver View** | `driver` | Phone simulator view. | Smartphone frame chassis → GPS Map → Speedometers. | `DriverView`, `ErrorWidget` |
| **Traffic Control** | `operator` | Monospace operations terminal. | Split Grid (Junctions table & terminal log intercepts). | `TrafficOperatorView` |
| **Analytics** | `analytics` | Performance comparative graphs. | 6 KPIs → Time Saved Hero comparison → Sector details columns. | `AnalyticsPage` |
| **Mission History**| `history` | List archived completed dispatches. | Header → Log details table grids. | `MissionHistoryPage` |
| **Completed** | `completed` | Debrief summary report. | Giant check badge → 3 Stats blocks → debrief summary → Action row. | `MissionCompletedPage` |

---

## 5. Complete Button Matrix

| Button Label | Location | Purpose | Event Trigger / Result |
| :--- | :--- | :--- | :--- |
| **[ CREATE EMERGENCY ]** | Emergencies Page | Initiates the dispatch wizard. | Sets `activeView` to `"new-emergency"`. |
| **[ VIEW MISSION ]** | Emergency Card / Completed Page | Redirects to active mission screen. | Sets `activeView` to `"mission"`. |
| **[ VIEW DETAILS ]** | Emergency Card | Opens dispatch feed modal. | Sets `selectedMission` object to open modal. |
| **[ WHY A-104? ]** | Wizard (Ambulance step) | Reviews compatibility metrics. | Sets `drawerOpen` to true with ambulance scorecard data. |
| **[ ASSIGN ]** | Wizard (Ambulance step) | Selects unit for dispatch. | Sets `selectedAmbulance` and advances step to `"hospital"`. |
| **[ SELECT HOSPITAL ]** | Wizard (Hospital step) | Selects destination clinical node. | Sets `selectedHospital` and advances step to `"summary"`. |
| **[ START MISSION ]** | Wizard (Summary step) | Activates live mission state. | Invokes `handleStartMission`, starts live ticker, sets `activeView` to `"mission"`. |
| **[ ACKNOWLEDGE ALERT ]** | Mission Page / Driver View | Confirms GMC trauma reception. | Sets `hospitalAlertAcknowledged` to true. |
| **[ ⚠ SIMULATE BLOCKAGE ]** | Mission Page | Triggers traffic blockage anomaly. | Sets `blockageState` to `"active"`, slows speed, increases ETA to 12:16. |
| **[ ACCEPT NEW ROUTE ]** | Mission Page | Reroutes ambulance to V2 bypass. | Sets `blockageState` to `"accepted"`, restores speed, reduces ETA to 09:18. |
| **[ ▶ START DEMO ]** | TopBar Header | Launches automated demo. | Sets `isDemoActive` to true, runs chronological transitions. |
| **[ ⏸ PAUSE ]** | TopBar Header | Suspends automated demo. | Sets `isDemoActive` to false, stops demo timer. |
| **[ 🔄 RESET ]** | TopBar Header | Clears all active variables. | Invokes `resetDemo`, resets state arrays, sets `activeView` to `"dashboard"`. |
| **[ 1x / 3x / 5x ]** | TopBar Header | Speeds up simulation. | Sets `demoSpeed` value to scale ticker intervals. |
| **[ 📡 GPS FAILURE ]** | Driver View (diagnostic bar)| Simulates GPS signal loss. | Sets `simulatedGpsError` to true, displaying the GPS error screen. |
| **[ 🔌 UPLINK DISCONNECT ]**| Driver View (diagnostic bar)| Simulates network signal loss. | Sets `simulatedConnError` to true, displaying connection error screen. |
| **[ RETRY LINK / RECONNECT ]**| Status Widgets (inside phone)| Restores signal connection. | Dismisses active simulated error state. |
| **[ VIEW LOG ]** | Mission History Page | Reviews archived details. | Sets `selectedMission` object to open modal logs. |

---

## 6. Form Field & Validation Matrix

The incident form is located on Step 1 of the **New Emergency Flow** wizard:

| Field Name | Type | Required | Default State | Validation / Interaction Result |
| :--- | :--- | :--- | :--- | :--- |
| **Emergency Type** | Dropdown Select | Yes | `"Road Accident"` | Sets `emergencyType` state value. |
| **Severity Level** | Selector Row | Yes | `"Critical"` | Sets `severity` state value (Critical / High / Warning). |
| **Patient Count** | Number Input | Yes | `1` | Sets `patientCount` state (validated `min="1"`). |
| **Sector Location**| Text Input | Yes | `"Sitabuldi"` | Sets `location` string. Alerts if input is empty. |
| **Onboard Reqs** | Checkbox Group | No | `{Trauma: true, Oxygen: true, ICU: true}` | Toggles required ambulance capabilities keys. |
| **Incident Notes** | Text Area | No | `""` | Appends optional details text. |

---

## 7. Responsive Breakpoint Rules

Responsive adjustments are declared in the CSS files:
- **Mobile Grid Stack (`@media (max-width: 900px)`)**:
  - Two-column dashboard grids and lists collapse into a single vertical column.
  - Sidebar links transform into collapsible items triggered via a hamburger button in the TopBar header.
- **Smartphone frame chassis (`@media (max-width: 480px)`)**:
  - The driver cabin frame scales down or expands to fit mobile screen widths.
- **Tables auto-wrap (`@media (max-width: 1000px)`)**:
  - Mission history tables hide headers and display grid layout blocks.

---

## 8. Accessibility Compliance
- **Legible contrast**: Text elements are styled with highly legible secondary styles against dark backgrounds.
- **Semantic buttons**: Standard `<button>` elements are used for interactive controls.
- **Aria Attributes**:
  - Interactive inputs declare custom `aria-label` elements.
  - System logs specify `role="status"` and `role="alert"` tags.
  - Real-time updates declare `aria-live="polite"` elements to inform screen readers of changes.
