import React, { useState } from "react";
import { 
  Clock, 
  Navigation, 
  Gauge, 
  Radio, 
  CheckCircle2, 
  Wifi, 
  Battery, 
  AlertTriangle, 
  ChevronRight, 
  HelpCircle, 
  Smartphone, 
  Monitor, 
  Send, 
  X, 
  LogOut, 
  Building2, 
  Zap,
  TrendingDown,
  ShieldCheck,
  Compass 
} from "lucide-react";
import { ErrorWidget } from "../components/StatusWidgets";
import MapSection from "../components/MapSection";
import "./DriverPanel.css";

const DriverPanel = ({ 
  activeMission, 
  onDriverUpdateStatus, 
  onDriverReportIssue, 
  onDriverHandover,
  onJumpToHospital,
  onLogout, 
  onOpenAbout,
  showToast 
}) => {
  const [useDeviceFrame, setUseDeviceFrame] = useState(false);
  const [activeTab, setActiveTab] = useState("navigation"); // 'navigation', 'map', 'signals', 'analytics', 'diagnostics'
  const [simulatedGpsError, setSimulatedGpsError] = useState(false);
  const [simulatedConnError, setSimulatedConnError] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [issueType, setIssueType] = useState("Mechanical Problem / Engine Breakdown");
  const [issueNotes, setIssueNotes] = useState("");

  // Default fallback mock mission if none is active from Dispatcher
  const defaultMission = {
    id: "RESQ-1048",
    ambulance: {
      id: "A-104",
      type: "ALS",
      driver: "Rahul Patil",
      contact: "+91 98231 44520"
    },
    emergency: {
      type: "Critical Road Accident",
      location: "Sitabuldi (Wardha Rd)",
      latitude: 21.1458,
      longitude: 79.0882,
      patients: 1,
      notes: "Two-wheeler multi-collision near metro station. Patient unconscious, severe trauma.",
      requirements: ["Trauma Unit", "ICU Bed", "Oxygen Reservoir"]
    },
    hospital: {
      name: "Government Medical College (GMC)",
      location: "Medical Square, Nagpur",
      distance: "2.4 km"
    },
    telemetry: {
      eta: "07:18",
      distance: "4.8",
      speed: "58 km/h",
      status: "EN ROUTE"
    },
    signals: [
      { id: "SIGNAL 01", name: "Sitabuldi Square", status: "🟢 PRIORITY ACTIVE", eta: "00:32" },
      { id: "SIGNAL 02", name: "Wardha Rd Crossing", status: "🟡 PRIORITY READY", eta: "01:14" },
      { id: "SIGNAL 03", name: "Congress Nagar Junction", status: "⚪ NORMAL", eta: "02:02" },
      { id: "SIGNAL 04", name: "GMC Hospital Gate", status: "🟢 PRIORITY ACTIVE", eta: "03:10" }
    ]
  };

  const mission = activeMission || defaultMission;
  const { id, ambulance, emergency, hospital, telemetry, signals } = mission;

  // Transit Phase Workflow
  const [phaseIndex, setPhaseIndex] = useState(1);

  const phases = [
    { key: "ASSIGNED", label: "Mission Assigned", desc: "Dispatch order received from central ITMS" },
    { key: "ACCEPTED", label: "Accept Mission", desc: "Acknowledge order & start unit engine" },
    { key: "EN ROUTE TO PATIENT", label: "Start Journey to Patient", desc: "Proceed with sirens & GPS guidance" },
    { key: "ARRIVED AT INCIDENT", label: "Arrived at Scene", desc: "First response triage on patient" },
    { key: "PATIENT ONBOARD", label: "Patient Loaded Onboard", desc: "ALS monitoring initialized" },
    { key: "EN ROUTE TO HOSPITAL", label: "En Route to GMC Trauma", desc: "Green Corridor priority active" },
    { key: "ARRIVED AT HOSPITAL", label: "Arrived at Trauma Ward", desc: "Pulling into emergency bay" },
    { key: "RESOLVED", label: "Patient Handover Complete", desc: "Transferred to GMC clinical staff" }
  ];

  // Route Coordinates
  const points = {
    sitabuldi: [emergency.latitude || 21.1458, emergency.longitude || 79.0882],
    wardhaCrossing: [21.1370, 79.0830],
    congressNagar: [21.1310, 79.0860],
    rahateColony: [21.1250, 79.0780],
    gmcHospital: [hospital.latitude || 21.1275, hospital.longitude || 79.0988],
    standbyDepot: [ambulance.latitude || 21.1458, ambulance.longitude || 79.0882]
  };

  const primaryRouteV1 = [
    points.standbyDepot,
    points.sitabuldi,
    points.wardhaCrossing,
    points.congressNagar,
    points.gmcHospital
  ];

  const bypassRouteV2 = [
    points.standbyDepot,
    points.sitabuldi,
    [21.1420, 79.0790],
    points.rahateColony,
    points.gmcHospital
  ];

  const isRerouted = signals?.some(s => s.name && s.name.includes("Bypass"));

  // Turn by turn navigation steps
  const turnByTurnDirections = isRerouted ? [
    { instruction: "Head south on Wardha Rd toward Sitabuldi Interchange", dist: "450m", eta: "00:40", isCurrent: true },
    { instruction: "⚠️ TRAFFIC ALERT: Turn right onto Congress Nagar Bypass V2", dist: "1.2 km", eta: "01:20", isCongested: true },
    { instruction: "Proceed through Rahate Colony Crossing Bypass (Signal 05 - 🟢 Green Wave)", dist: "850m", eta: "01:05" },
    { instruction: "Turn left onto Ingress Expressway toward Medical Square", dist: "1.4 km", eta: "01:50" },
    { instruction: "Arrive at Government Medical College (GMC) Trauma Gate 3", dist: "200m", eta: "00:30", isDest: true }
  ] : [
    { instruction: "Head south on Wardha Rd toward Sitabuldi Interchange (Signal 01 - 🟢 Green Wave)", dist: "600m", eta: "00:42", isCurrent: true },
    { instruction: "Continue straight through Lokmat Square Crossing (Signal 02 - 🟢 Priority Active)", dist: "1.4 km", eta: "01:17" },
    { instruction: "Proceed past Congress Nagar Metro Junction (Signal 03 - 🟡 Priority Ready)", dist: "1.8 km", eta: "02:04" },
    { instruction: "Turn left onto Hanuman Nagar Expressway toward Medical Square", dist: "800m", eta: "01:05" },
    { instruction: "Arrive at GMCH Apex Trauma Center Gate 1", dist: "200m", eta: "00:30", isDest: true }
  ];

  const handleNextPhase = () => {
    if (phaseIndex < phases.length - 1) {
      const nextIdx = phaseIndex + 1;
      setPhaseIndex(nextIdx);
      const nextPhaseObj = phases[nextIdx];

      if (onDriverUpdateStatus) {
        onDriverUpdateStatus(nextPhaseObj.key);
      }

      if (nextPhaseObj.key === "RESOLVED" && onDriverHandover) {
        onDriverHandover();
      }

      if (showToast) {
        showToast(`Status updated: ${nextPhaseObj.label}`, "success");
      }
    }
  };

  const handleSendIssueReport = (e) => {
    e.preventDefault();
    if (onDriverReportIssue) {
      onDriverReportIssue({ type: issueType, notes: issueNotes });
    }
    setIsIssueModalOpen(false);
    setIssueNotes("");

    if (issueType.toLowerCase().includes("mechanical")) {
      if (showToast) {
        showToast(`⚠️ Mechanical Breakdown transmitted to Hospital. Replacement authorization requested!`, "critical");
      }
    } else {
      if (showToast) {
        showToast(`⚠️ Traffic alert sent: Route V2 bypass rerouting initiated.`, "warning");
      }
    }
  };

  return (
    <div className={`driver-portal-page animate-fade ${useDeviceFrame ? "frame-mode" : "responsive-mode"}`}>
      
      {/* Top Floating Control Bar */}
      <div className="driver-top-switch-bar">
        <div className="portal-badge-wrap font-mono">
          <span className="dot animate-pulse-slow"></span>
          <span>AMBULANCE IN-CAB TERMINAL // UNIT {ambulance.id} ({ambulance.type})</span>
        </div>

        <div className="portal-bar-actions">
          {onJumpToHospital && (
            <button 
              className="btn-portal-utility font-mono desktop-only"
              onClick={onJumpToHospital}
              title="Jump to Hospital Trauma Reception"
              style={{ color: "var(--success)", borderColor: "rgba(34, 197, 94, 0.4)" }}
            >
              <Building2 size={14} />
              <span>HOSPITAL RECEPTION →</span>
            </button>
          )}

          {/* Device Frame Toggle (Desktop only) */}
          <button 
            className="btn-portal-utility desktop-only font-mono"
            onClick={() => setUseDeviceFrame(!useDeviceFrame)}
            title="Toggle Smartphone Mockup / Responsive Wide Cockpit Mode"
          >
            {useDeviceFrame ? <Monitor size={14} /> : <Smartphone size={14} />}
            <span>{useDeviceFrame ? "WIDE COCKPIT" : "PHONE HUD"}</span>
          </button>

          {/* About Modal */}
          {onOpenAbout && (
            <button 
              className="btn-portal-utility font-mono"
              onClick={onOpenAbout}
              title="About Nagpur Driver Protocol"
            >
              <HelpCircle size={14} />
              <span>ABOUT</span>
            </button>
          )}

          {/* Logout Button */}
          {onLogout && (
            <button 
              className="btn-portal-utility logout font-mono" 
              onClick={onLogout}
              title="Log out of Ambulance Driver Portal"
            >
              <LogOut size={14} />
              <span>LOGOUT</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Container */}
      <div className="driver-main-container">
        <div className="driver-content-card">

          {/* Smartphone Status Bar */}
          <div className="driver-phone-status-bar font-mono">
            <span className="time">18:05</span>
            <div className="notch"></div>
            <div className="icons">
              <span className="gps-lock">📡 GPS 21.1458°N, 79.0882°E</span>
              <Wifi size={12} />
              <Battery size={13} />
            </div>
          </div>

          {/* In-Cab Diagnostics Overlays */}
          {simulatedGpsError && (
            <ErrorWidget type="gps" onRetry={() => setSimulatedGpsError(false)} />
          )}
          {simulatedConnError && (
            <ErrorWidget type="connection" onRetry={() => setSimulatedConnError(false)} />
          )}

          {/* Active Navigation Header */}
          <div className="driver-header-banner">
            <div className="driver-unit-badge font-mono">
              <span className="pulse-beacon"></span>
              <strong>🚑 {ambulance.id} ({ambulance.type})</strong>
              <span className="mission-tag">#{id}</span>
            </div>

            <div className="driver-status-chip font-mono">
              <span>{phases[phaseIndex].label.toUpperCase()}</span>
            </div>
          </div>

          {/* Tab Navigation Navigation (Cockpit/HUD Tabs) */}
          <div className="driver-tab-pills font-mono">
            <button 
              className={`tab-pill ${activeTab === "navigation" ? "active" : ""}`}
              onClick={() => setActiveTab("navigation")}
            >
              🧭 TURN-BY-TURN NAV & DOSSIER
            </button>

            <button 
              className={`tab-pill ${activeTab === "map" ? "active" : ""}`}
              onClick={() => setActiveTab("map")}
            >
              🛰 SATELLITE MAP RADAR
            </button>

            <button 
              className={`tab-pill ${activeTab === "signals" ? "active" : ""}`}
              onClick={() => setActiveTab("signals")}
            >
              🚦 GREEN CORRIDOR ({signals ? signals.length : 4})
            </button>

            <button 
              className={`tab-pill ${activeTab === "analytics" ? "active" : ""}`}
              onClick={() => setActiveTab("analytics")}
            >
              📊 DRIVER TRIP ANALYTICS
            </button>

            <button 
              className={`tab-pill ${activeTab === "diagnostics" ? "active" : ""}`}
              onClick={() => setActiveTab("diagnostics")}
            >
              ⚙️ IN-CAB TOOLS
            </button>
          </div>

          {/* TAB 1: TURN-BY-TURN NAVIGATION & COMPLETE INCIDENT DOSSIER */}
          {activeTab === "navigation" && (
            <div className="driver-tab-body animate-fade">
              
              {/* Telemetry Cluster */}
              <div className="driver-telemetry-cluster">
                <div className="primary-speed-box font-mono">
                  <Gauge size={22} className="text-primary" />
                  <div className="speed-val-wrap">
                    <span className="speed-num">{telemetry.speed || "58 km/h"}</span>
                    <span className="speed-lbl">CURRENT SPEED</span>
                  </div>
                </div>

                <div className="secondary-eta-box font-mono">
                  <Clock size={20} className="text-warning" />
                  <div className="eta-val-wrap">
                    <span className="eta-num text-warning">{telemetry.eta || "07:18"}</span>
                    <span className="eta-lbl">ESTIMATED ARRIVAL</span>
                  </div>
                </div>

                <div className="secondary-dist-box font-mono">
                  <Navigation size={18} className="text-success" />
                  <div className="dist-val-wrap">
                    <span className="dist-num">{telemetry.distance || "4.8"} km</span>
                    <span className="dist-lbl">REMAINING DISTANCE</span>
                  </div>
                </div>
              </div>

              {/* Complete Incident Details Dossier with Coordinates */}
              <div className="driver-incident-callout">
                <div className="callout-hdr">
                  <span className="hdr-tag font-mono">INCIDENT DOSSIER // EXACT COORDINATES</span>
                  <span className="hdr-loc font-mono">📍 {emergency.location}</span>
                </div>
                
                <div className="callout-body">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <h3 className="type-title text-critical">{emergency.type}</h3>
                    <span className="font-mono text-warning" style={{ fontSize: "0.72rem", fontWeight: "800" }}>
                      GPS: {points.sitabuldi[0].toFixed(4)}° N, {points.sitabuldi[1].toFixed(4)}° E
                    </span>
                  </div>
                  <p className="notes-text" style={{ margin: "4px 0" }}>{emergency.notes}</p>
                  
                  <div className="font-mono" style={{ fontSize: "0.68rem", color: "var(--text-secondary)", display: "flex", gap: "16px", marginTop: "4px" }}>
                    <span>Caller: <strong>{emergency.phone || "+91 98231 44520"}</strong></span>
                    <span>Patients: <strong>{emergency.patients || 1}</strong></span>
                    <span>Gear: <strong>{emergency.requirements ? emergency.requirements.join(", ") : "Trauma, ICU, O2"}</strong></span>
                  </div>
                </div>

                <div className="callout-dest font-mono" style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>🏥 DESTINATION: <strong>{hospital?.name || "Government Medical College (GMC)"}</strong></span>
                  <span className="text-success">Level 1 Apex Trauma Bay</span>
                </div>
              </div>

              {/* Turn-by-Turn Route Guidance Box */}
              <div className="section-panel" style={{ padding: "14px", backgroundColor: "var(--bg-card-inner)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.72rem", fontWeight: "800" }} className="font-mono text-primary">
                    <Compass size={14} />
                    <span>TURN-BY-TURN NAVIGATION ({isRerouted ? "ROUTE V2 BYPASS" : "ROUTE V1 MOST SUITABLE"})</span>
                  </div>
                  <span className="font-mono text-success" style={{ fontSize: "0.65rem" }}>🟢 GREEN CORRIDOR ACTIVE BY DEFAULT</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {turnByTurnDirections.map((dir, idx) => (
                    <div 
                      key={idx}
                      className="font-mono"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "8px 10px",
                        backgroundColor: dir.isCurrent ? "rgba(59, 130, 246, 0.15)" : dir.isCongested ? "rgba(239, 68, 68, 0.12)" : "var(--bg-card-meta)",
                        borderLeft: dir.isCurrent ? "3px solid var(--primary)" : dir.isCongested ? "3px solid var(--critical)" : "1px solid var(--panel-border)",
                        borderRadius: "4px",
                        fontSize: "0.7rem"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ color: dir.isCurrent ? "var(--primary)" : "var(--text-muted)" }}>{idx + 1}.</span>
                        <span style={{ color: dir.isCurrent ? "var(--text-light)" : "var(--text-secondary)", fontWeight: dir.isCurrent ? "800" : "500" }}>
                          {dir.instruction}
                        </span>
                      </div>
                      <div style={{ textAlign: "right", whiteSpace: "nowrap", marginLeft: "8px", color: "var(--text-muted)", fontSize: "0.65rem" }}>
                        <span>{dir.dist}</span> • <span>{dir.eta}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live In-Cab Moving Radar Map on Main Navigation Dashboard */}
              <div className="driver-live-map-card" style={{ margin: "14px 0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }} className="font-mono">
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", fontWeight: "800", color: "#F59E0B" }}>
                    <span className="dot animate-pulse-slow" style={{ backgroundColor: "#F59E0B" }}></span>
                    <span>IN-CAB LIVE GPS CORRIDOR RADAR // UNIT {ambulance.id}</span>
                  </div>
                  <span className="text-success" style={{ fontSize: "0.68rem" }}>🟢 AUTOMATIC GREEN WAVE SYNC</span>
                </div>
                <MapSection activeMission={mission} />
              </div>

              {/* Progress Stepper Action Box */}
              <div className="driver-stepper-panel">
                <div className="stepper-hdr font-mono">
                  <span>TRANSIT PHASE LIFECYCLE [{phaseIndex + 1}/8]</span>
                </div>

                <div className="stepper-visual-flow">
                  {phases.map((p, idx) => {
                    const isDone = idx < phaseIndex;
                    const isCurrent = idx === phaseIndex;
                    return (
                      <div key={p.key} className={`flow-node ${isDone ? "done" : isCurrent ? "current" : "pending"}`}>
                        <div className="node-circle">
                          {isDone ? "✓" : idx + 1}
                        </div>
                        <span className="node-lbl font-mono">{p.key.replace("TO ", "").slice(0, 10)}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Primary Action Button */}
                {phaseIndex < phases.length - 1 ? (
                  <button 
                    className="btn-driver-next-action font-mono"
                    onClick={handleNextPhase}
                  >
                    <span>STEP {phaseIndex + 2}: {phases[phaseIndex + 1].label.toUpperCase()}</span>
                    <ChevronRight size={18} />
                  </button>
                ) : (
                  <div className="mission-resolved-banner font-mono">
                    <CheckCircle2 size={20} className="text-success" />
                    <span>✓ MISSION RESOLVED // PATIENT HANDED OVER TO GMC TRAUMA</span>
                  </div>
                )}
              </div>

              {/* Quick Incident Reporting Trigger with Strict Rules */}
              <div className="driver-quick-actions-row">
                <button 
                  className="btn-driver-subaction warning font-mono"
                  onClick={() => setIsIssueModalOpen(true)}
                >
                  <AlertTriangle size={15} />
                  <span>REPORT INCIDENT / SITUATION TO HOSPITAL</span>
                </button>
              </div>

            </div>
          )}

          {/* TAB 2: DETAILED NAGPUR SATELLITE MAP RADAR */}
          {activeTab === "map" && (
            <div className="driver-tab-body animate-fade">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }} className="font-mono">
                <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "var(--text-light)" }}>
                  🛰 NAGPUR SATELLITE ROAD & HIGHWAY RADAR (FULL COCKPIT VIEW)
                </span>
                <span className="text-success" style={{ fontSize: "0.68rem" }}>🟢 ITMS GREEN CORRIDOR ENGAGED BY DEFAULT</span>
              </div>
              <MapSection activeMission={mission} />
              <div className="font-mono" style={{ fontSize: "0.68rem", color: "var(--text-muted)", display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
                <span>📍 Pickup: {emergency.location} ({points.sitabuldi[0].toFixed(4)}° N, {points.sitabuldi[1].toFixed(4)}° E)</span>
                <span>🏥 Destination: {hospital?.name || "GMC Nagpur"}</span>
              </div>
            </div>
          )}

          {/* TAB 3: GREEN CORRIDOR SIGNALS */}
          {activeTab === "signals" && (
            <div className="driver-tab-body animate-fade">
              <div className="signals-board-header">
                <div className="hdr-title font-mono">
                  <Radio size={16} className="text-success animate-pulse-slow" />
                  <span>ITMS GREEN CORRIDOR SYNCHRONIZATION</span>
                </div>
                <span className="simulated-label font-mono">{isRerouted ? "CONGRESS NAGAR BYPASS" : "WARDHA RD CORRIDOR"}</span>
              </div>

              <div className="signals-grid-list">
                {signals && signals.map((sig) => {
                  const isActive = sig.status.includes("ACTIVE") || sig.status.includes("GREEN");
                  const isReady = sig.status.includes("READY") || sig.status.includes("YELLOW");

                  return (
                    <div key={sig.id} className={`signal-item-card ${isActive ? "active-override" : ""}`}>
                      <div className="sig-left">
                        <span className="sig-icon">{isActive ? "🟢" : isReady ? "🟡" : "⚪"}</span>
                        <div>
                          <h4 className="sig-name font-mono">{sig.id}: {sig.name}</h4>
                          <span className="sig-eta font-mono">ETA to Intersection: {sig.eta}</span>
                        </div>
                      </div>

                      <div className="sig-right">
                        <span className={`sig-status-badge font-mono ${isActive ? "active" : isReady ? "ready" : "passed"}`}>
                          {sig.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="signals-footer-note font-mono">
                <span>🚦 Signals auto-trigger GREEN 300m before arrival via ITMS Radio Beacon.</span>
              </div>
            </div>
          )}

          {/* TAB 4: DRIVER PERFORMANCE ANALYTICS */}
          {activeTab === "analytics" && (
            <div className="driver-tab-body animate-fade">
              <div className="driver-telemetry-cluster">
                <div className="primary-speed-box font-mono">
                  <Zap size={22} className="text-warning" />
                  <div className="speed-val-wrap">
                    <span className="speed-num text-warning">06:21</span>
                    <span className="speed-lbl">MINUTES SAVED THIS RUN</span>
                  </div>
                </div>

                <div className="secondary-eta-box font-mono">
                  <Clock size={20} className="text-primary" />
                  <div className="eta-val-wrap">
                    <span className="eta-num text-primary">12:21</span>
                    <span className="eta-lbl">ACTUAL TRIP TRANSIT</span>
                  </div>
                </div>

                <div className="secondary-dist-box font-mono">
                  <TrendingDown size={18} className="text-success" />
                  <div className="dist-val-wrap">
                    <span className="dist-num text-success">34%</span>
                    <span className="dist-lbl">TIME REDUCTION RATE</span>
                  </div>
                </div>
              </div>

              <div className="section-panel font-mono" style={{ padding: "16px", backgroundColor: "var(--bg-card-inner)" }}>
                <h4 style={{ fontSize: "0.8rem", color: "var(--text-light)", marginBottom: "10px" }}>
                  <ShieldCheck size={16} className="text-success" style={{ display: "inline", marginRight: "6px" }} />
                  PARAMEDIC TRANSIT REPORT DEBRIEF
                </h4>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.72rem", color: "var(--text-secondary)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed rgba(255,255,255,0.06)", paddingBottom: "4px" }}>
                    <span>Unit Registration:</span>
                    <strong className="text-light">MH-31-EQ-9104 (Unit A-104 ALS)</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed rgba(255,255,255,0.06)", paddingBottom: "4px" }}>
                    <span>Baseline Manual Driving ETA:</span>
                    <strong className="text-muted">18:42 mins (Without Green Wave)</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed rgba(255,255,255,0.06)", paddingBottom: "4px" }}>
                    <span>Green Corridor Overrides:</span>
                    <strong className="text-success">4 Signals Cleared (100% Green Waves)</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Hospital Handover Status:</span>
                    <strong className="text-success">GMC Trauma ICU Bed #04 Confirmed</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: IN-CAB DIAGNOSTICS & HARDWARE FAILOVER */}
          {activeTab === "diagnostics" && (
            <div className="driver-tab-body animate-fade">
              <div className="diagnostics-panel">
                <h3 className="diag-title font-mono">SIMULATE IN-CAB SATELLITE FAULTS</h3>
                <p className="diag-desc">
                  Test telemetry failover and fallback alerts during hackathon jury evaluation.
                </p>

                <div className="diag-buttons-grid">
                  <button 
                    className={`btn-diag-toggle font-mono ${simulatedGpsError ? "active" : ""}`}
                    onClick={() => {
                      setSimulatedGpsError(!simulatedGpsError);
                      setSimulatedConnError(false);
                    }}
                  >
                    📡 TOGGLE GPS SATELLITE LOSS
                  </button>

                  <button 
                    className={`btn-diag-toggle font-mono ${simulatedConnError ? "active" : ""}`}
                    onClick={() => {
                      setSimulatedConnError(!simulatedConnError);
                      setSimulatedGpsError(false);
                    }}
                  >
                    🔌 TOGGLE 5G UPLINK DISCONNECT
                  </button>
                </div>
              </div>

              <div className="driver-profile-card">
                <h4 className="font-mono">PARAMEDIC ON-DUTY PROFILE</h4>
                <div className="profile-row font-mono">
                  <span>Driver: <strong>{ambulance.driver || "Rahul Patil"}</strong></span>
                  <span>Paramedic ID: <strong>NGP-EMS-882</strong></span>
                </div>
                <div className="profile-row font-mono">
                  <span>Vehicle: <strong>{ambulance.id} ({ambulance.type} Unit)</strong></span>
                  <span>Base: <strong>Sonegaon / Wardha Depot</strong></span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Driver Hazard / Situation Reporting Modal */}
      {isIssueModalOpen && (
        <div className="mission-modal-overlay" onClick={() => setIsIssueModalOpen(false)}>
          <div className="mission-modal animate-fade" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <AlertTriangle size={18} className="text-warning" />
                <h3>Report Situation / Hazard to Hospital</h3>
              </div>
              <button className="modal-close" onClick={() => setIsIssueModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSendIssueReport}>
              <div className="modal-body">
                <div className="form-item-group">
                  <label className="font-mono">SITUATION CATEGORY</label>
                  <select 
                    value={issueType} 
                    onChange={(e) => setIssueType(e.target.value)}
                    className="custom-select"
                  >
                    <option value="Mechanical Problem / Engine Breakdown">
                      🔧 Mechanical Problem / Engine Breakdown (Authorizes New Ambulance)
                    </option>
                    <option value="Heavy Traffic Congestion">
                      🚦 Heavy Traffic Congestion (Triggers Route V2 Rerouting Only)
                    </option>
                    <option value="Road Construction / Physical Barrier">
                      🚧 Road Construction / Barrier (Triggers Route V2 Rerouting Only)
                    </option>
                  </select>
                </div>

                <div className="emergency-callout-warning font-sans" style={{ fontSize: "0.72rem", padding: "8px 12px", margin: "8px 0" }}>
                  <AlertTriangle size={14} className="text-warning" />
                  <span>
                    {issueType.toLowerCase().includes("mechanical") ? (
                      <strong className="text-critical">Rule: Mechanical failure will notify Hospital Reception to authorize dispatching a replacement ambulance.</strong>
                    ) : (
                      <strong className="text-warning">Rule: Traffic/Road bottlenecks will trigger Route V2 bypass rerouting only (No ambulance replacement).</strong>
                    )}
                  </span>
                </div>

                <div className="form-item-group">
                  <label className="font-mono">OBSERVATION DETAILS (OPTIONAL)</label>
                  <textarea 
                    value={issueNotes}
                    onChange={(e) => setIssueNotes(e.target.value)}
                    placeholder="e.g. Engine temperature spiking or road blocked near flyover..."
                    className="custom-textarea"
                    rows={2}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-close-modal font-mono" onClick={() => setIsIssueModalOpen(false)}>
                  CANCEL
                </button>
                <button type="submit" className="btn-driver-next-action font-mono" style={{ padding: "8px 16px", fontSize: "0.75rem" }}>
                  <Send size={13} />
                  <span>TRANSMIT SITUATION ALERT</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="driver-portal-footer font-mono">
        <span>NAGPUR RESQ DRIVER INTERFACE // VIKASIT NAGPUR 2026</span>
      </footer>

    </div>
  );
};

export default DriverPanel;
