# Complete User Journeys & Flowcharts

This document charts the user paths, workflow decisions, and automated demo chronologies inside **NAGPUR RESQ**.

---

## 1. Manual Incident Dispatch Workflow

This flowchart maps the operational dispatch wizard steps:

```mermaid
flowchart TD
    A[Open Dashboard] --> B[Go to Emergencies]
    B --> C[Click 'Create Emergency']
    C --> D[Fill Incident details & submit]
    D --> E[Simulated AI Assessment loading...]
    E --> F[Display Ranked Ambulance list]
    F --> G[Inspect proximity suitabilities via scorecard]
    G --> H[Click 'Assign' A-104]
    H --> I[Filter matching trauma hospitals]
    I --> J[Click 'Select Hospital' GMC]
    J --> K[Review Orchestration summary]
    K --> L[Click 'Start Mission']
    L --> M[Live Mission control room telemetry starts]
```

---

## 2. Dynamic Blockage & Recalculation Flow

This flowchart maps how route disruptions are handled:

```mermaid
flowchart TD
    A[Ambulance moving along Route V1] --> B[Disruption detected ahead]
    B --> C[Dispatcher clicks 'Simulate Traffic Blockage']
    C --> D[ Flashes Red Warning Card: Congestion detected]
    D --> E[ETA jumps 08:42 to 12:16]
    E --> F[AI calculates Congress Nagar Bypass V2]
    F --> G[Renders recovery stats: Recalculated ETA 09:18]
    G --> H[Dispatcher clicks 'Accept New Route']
    H --> I[Map visual updates to V2 bypass paths]
    I --> J[Traffic Corridor switches signals to 04/05/06 active]
    J --> K[GMC Hospital pre-alert registers updated ETA]
    K --> L[Ambulance reaches GMC back gate]
```

---

## 3. Automated Hackathon Demo timeline

This flowchart maps the automated demo mode steps:

```mermaid
flowchart TD
    A[User clicks Start Demo] --> B[0s: Sitabuldi incident logged]
    B --> C[10s: Show Creation wizard Form]
    C --> D[20s: AI loader ticks start]
    D --> E[30s: Ranked Ambulance fleet rendered]
    E --> F[40s: Explainable scorecard drawer opens]
    F --> G[50s: Selects hospital list]
    G --> H[60s: Summary ready]
    H --> I[75s: Starts live mission]
    I --> J[90s: Ambulance drives along Route V1]
    J --> K[110s: Blockage alert flashes]
    K --> L[120s: Bypass route V2 calculated]
    L --> M[130s: Accepts reroute]
    M --> N[140s: Switches signals to V2 corridor]
    N --> O[150s: Vehicle passes Congress Nagar Bypass]
    O --> P[160s: Hospital acknowledges status]
    P --> Q[175s: Safe arrival at GMC]
    Q --> R[180s: Completed dashboard loaded showing 06:21 mins saved]
```
