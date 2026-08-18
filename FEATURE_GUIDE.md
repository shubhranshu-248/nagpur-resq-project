# Feature Guide & User Manual

This manual details how to navigate the operational features of the **NAGPUR RESQ** application.

---

## Feature 1: Command Centre Overview
- **What it does**: Provides real-time visibility into the city's emergency metrics, ambulance coordinates, and ready hospitals.
- **Where to find it**: Select **Command Centre** in the left sidebar.
- **Expected Result**: A simulated radar grid rendering maps, active vehicle pins, dynamic stats, and alerts.
- **Loading / Empty States**:
  - Displays `"No active emergency alerts logged"` if no incidents are registered.
  - Quick telemetric feeds show `"STANDBY"` when ambulances are not on a mission.

---

## Feature 2: Dispatch Setup Wizard
- **What it does**: Automatically assesses, ranks, and maps incoming emergency requests.
- **Where to find it**: Go to **Emergencies** and click **CREATE EMERGENCY**.
- **Steps**:
  1. **Incident Details**: Enter the accident type, severity, location, and required medical equipment. Click **NEXT**.
  2. **AI Assessment Loader**: Runs checks to filter ambulances by clinical compatibility.
  3. **Ambulance Ranking List**: Displays ranked ambulances. If a unit lacks required features (like BLS A-109 lacking ICU), it shows a warning badge.
  4. **Why A-104 Scorecard Drawer**: Click **WHY A-104?** to view the explainable scorecard drawer. Click **ASSIGN**.
  5. **Hospital Ranking List**: Lists matching trauma centers. Click **SELECT HOSPITAL**.
  6. **Orchestration Summary**: Displays the dispatch overview. Click **START MISSION**.
- **Expected Result**: Automatically triggers live mission telemetry and navigates to the active mission screen.

---

## Feature 3: Live Transit Tracking
- **What it does**: Tracks transit metrics (speed, distance, ETA) and logs incidents along the route.
- **Where to find it**: Navigate to **Live Mission** in the sidebar.
- **Expected Result**: Shows the ambulance icon moving across the linear map, updating ETA timers, and logging checkpoints in the vertical timeline.
- **Hospital Pre-Alert**: Flashes alerts at the destination hospital. Click **ACKNOWLEDGE ALERT** to confirm trauma room readiness.

---

## Feature 4: Dynamic Congestion Rerouting
- **What it does**: Simulates traffic blockage incidents and calculates alternative bypass routes.
- **Where to find it**: Located on the **Live Mission** page.
- **Steps**:
  1. Click **⚠ SIMULATE TRAFFIC BLOCKAGE** on the mission header.
  2. A red flashing **ROUTE DISRUPTION** banner appears, showing the ETA jump from `08:42` to `12:16` while recalculating.
  3. A **ROUTE UPDATED** notification card loads, displaying Route V2 details (Bypass ETA `09:18`, recovering `02:58` minutes).
  4. Click **ACCEPT NEW ROUTE**.
- **Expected Result**: The map switches to Route V2 (yellow path), updating telemetry, resetting signal states, and notifying GMC hospital of the updated ETA.

---

## Feature 5: Green Corridor Controls
- **What it does**: Provides visibility into automated traffic signal overrides.
- **Where to find it**: Select **Green Corridor** in the sidebar.
- **Expected Result**: Displays the route's 4 traffic junctions. As the ambulance approaches a junction, its status shifts to `🟢 AMBULANCE PRIORITY ACTIVE`, then turns `AMBULANCE PASSED` as the next junction lights up.

---

## Feature 6: In-Cab Driver HUD
- **What it does**: Replicates a driver's mobile console dashboard.
- **Where to find it**: Select **Driver In-Cab** in the sidebar.
- **Interactive Failure Mocking**:
  - Toggle **📡 GPS FAILURE** at the bottom of the page to render a stale GPS error screen. Click **RETRY LINK** to reconnect.
  - Toggle **🔌 UPLINK DISCONNECT** to render a connection lost error screen. Click **RECONNECT** to restore telemetry.

---

## Feature 7: Performance Analytics
- **What it does**: Reviews audit performance data and comparisons.
- **Where to find it**: Select **Analytics** in the sidebar.
- **Expected Result**: Displays CSS bar charts comparing baseline transit estimates against optimized Nagpur RESQ transit times.
- **Tagline**: *"From Incident to Treatment — Every Second Coordinated."*
