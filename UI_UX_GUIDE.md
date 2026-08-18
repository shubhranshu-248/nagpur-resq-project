# UI / UX Styling & Design System Guide

This guide documents the layout structures, responsive behaviors, visual tokens, and user experience components used throughout the **NAGPUR RESQ** application.

---

## 1. Design System Colors & Variables

Styling variables are defined in `src/index.css`:

```css
:root {
  /* Colors */
  --bg-dark: #07111F;             /* Deep navy command room canvas */
  --panel-bg: #0D1B2A;            /* Steel slate card/panel background */
  --panel-border: #1E293B;        /* Separator lines */
  --primary: #3B82F6;             /* Clinical blue select accent */
  --primary-hover: #2563EB;       
  --primary-glow: rgba(59, 130, 246, 0.15);
  --critical: #EF4444;            /* Incident red warning accent */
  --critical-glow: rgba(239, 68, 68, 0.15);
  --warning: #F59E0B;             /* Reroute yellow warning */
  --warning-glow: rgba(245, 158, 11, 0.15);
  --success: #22C55E;             /* Corridor green success */
  --success-hover: #16A34A;
  --success-glow: rgba(34, 197, 94, 0.15);
  
  /* Text */
  --text-light: #F8FAFC;          
  --text-secondary: #94A3B8;      
  --text-muted: #64748B;          
  
  /* Typography & Spacing */
  --font-sans: 'Outfit', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  --border-radius: 12px;
  --border-radius-sm: 8px;
  --transition-fast: 0.2s ease;
  --transition-normal: 0.3s ease;
}
```

---

## 2. Page Components Layouts

- **Sidebar Navigation**:
  - Locked to the left sidebar on desktop (`width: 260px`).
  - Highlights active selections with a vertical left accent line (`active-indicator`).
- **Main Viewport Layout**:
  - Flexbox header details (Title, Subtitle, and dynamic Prototype/Simulation badges).
  - Main grid layouts (`grid-3-col` or `dashboard-grid`) displaying dashboard components.
- **Card Panels**:
  - **KPI Cards**: Feature dynamic indicators (e.g. *Time Saved*, *Avg Response*) with Lucide icon alignments.
  - **Ambulance & Hospital Cards**: Feature clean flexbox lists showcasing capabilities, bed counts, and suitability scores.

---

## 3. UI/UX Interaction Design

- **Animated Pulses**:
  - Pulse markers (`status-dot status-online animate-pulse-slow`) indicate active dispatches.
  - Linear route maps feature blinking warning icons (`pulse-svg text-critical`) during blockages.
- **Transitions**:
  - Pages fade in smoothly using keyframe triggers:
    ```css
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    ```
- **Explainable Drawers**:
  - Proximity suitability breakdowns slide out smoothly from the right side of the screen when requested.

---

## 4. Responsive Viewport Adaptability

Styling rules adjust layouts dynamically for different screen sizes:
- **Large Monitors (>1200px)**: Displays full sidebars and multi-column grids side-by-side.
- **Tablets (<1024px)**: Grids wrap and scale down.
- **Mobile Viewports (<768px)**:
  - Sidebars transition off-screen (`transform: translateX(-100%)`).
  - Hamburger buttons toggle sidebars using overlay layouts.
  - Fleet lists stack vertically for easy scrolling on mobile screens.
- **Driver Cabin Viewer**: Styled specifically for mobile viewports using a CSS smartphone chassis container (`.phone-chassis`).
