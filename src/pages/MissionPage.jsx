import React from "react";
import { 
  Activity, 
  Clock, 
  Gauge, 
  Navigation, 
  BellRing, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle,
  Zap
} from "lucide-react";
import "./MissionPage.css";

const MissionPage = ({ 
  missionData, 
  onAcknowledgeHospital, 
  blockageState = "none", // none, active, updated, accepted
  onTriggerBlockage, 
  onAcceptReroute 
}) => {

  if (!missionData) {
    return (
      <div className="view-container animate-fade">
        <div className="section-panel" style={{ padding: "40px", textAlign: "center" }}>
          <AlertTriangle size={36} className="text-warning-icon" style={{ marginBottom: "12px" }} />
          <h3>No Active Mission</h3>
          <p style={{ color: "var(--text-secondary)", maxWidth: "450px", margin: "10px auto" }}>
            The live mission control room activates dynamically during emergency dispatches. Start a mission from the Command Centre to launch telemetry.
          </p>
        </div>
      </div>
    );
  }

  const {
    id,
    emergency,
    ambulance,
    hospital,
    telemetry,
    signals,
    timeline,
    hospitalAlertAcknowledged
  } = missionData;

  const totalDistance = 6.4;
  const currentDistance = parseFloat(telemetry.distance);
  const tripProgress = Math.min(100, Math.max(0, ((totalDistance - currentDistance) / totalDistance) * 100));

  // Determine current active route name
  const isV2 = blockageState === "accepted";

  return (
    <div className="view-container animate-fade">
      {/* Page Header */}
      <div className="mission-page-header">
        <div>
          <h2 className="view-title font-mono">MISSION #{id} {isV2 && <span className="v2-tag">ROUTE V2 ACTIVE</span>}</h2>
          <div className="mission-header-sub">
            <span className="emergency-type-tag text-critical">{emergency.type}</span>
            <span className="divider-dot"></span>
            <span className="incident-loc-tag">{emergency.location}</span>
          </div>
        </div>

        <div className="mission-header-controls">
          {blockageState === "none" && (
            <button 
              className="btn-trigger-blockage font-mono"
              onClick={onTriggerBlockage}
            >
              ⚠ SIMULATE TRAFFIC BLOCKAGE
            </button>
          )}

          <div className="mission-status-badge">
            <span className="status-dot status-online animate-pulse-slow"></span>
            <span>{telemetry.status}</span>
          </div>
        </div>
      </div>

      {/* REROUTING OVERLAYS AND ANOMALY ALERTS */}
      {(blockageState === "active" || blockageState === "recalculating") && (
        <div className="anomaly-alert-card critical-flash animate-fade">
          <div className="alert-hdr">
            <AlertTriangle className="text-critical animate-pulse-slow" size={24} />
            <div>
              <h4 className="text-critical font-mono">🚨 ROUTE DISRUPTION DETECTED</h4>
              <p className="subtext">Major congestion anomaly reported at Wardha Road Sector 2. Junction Blocked.</p>
            </div>
          </div>
          <div className="recalc-stats font-mono">
            <div className="stat">
              <span className="lbl">ORIGINAL ETA</span>
              <span className="val strike">08:42</span>
            </div>
            <div className="stat-arrow">→</div>
            <div className="stat">
              <span className="lbl">PROJECTED DELAY</span>
              <span className="val text-critical font-bold">12:16</span>
            </div>
            <div className="loader-block">
              <LoaderIcon />
              <span>RECALCULATING ROUTE V2...</span>
            </div>
          </div>
        </div>
      )}

      {blockageState === "updated" && (
        <div className="anomaly-alert-card warning-flash animate-fade">
          <div className="alert-hdr">
            <TrendingUp className="text-warning-icon" size={24} />
            <div>
              <h4 className="text-warning font-mono">ROUTE UPDATED — ALTERNATIVE OPTIMIZED</h4>
              <p className="subtext">AI Recommendation Engine has recalculated transit pathways around the bottleneck.</p>
            </div>
          </div>
          <div className="recalc-stats font-mono">
            <div className="stat">
              <span className="lbl">CONGESTED ETA</span>
              <span className="val text-critical">12:16</span>
            </div>
            <div className="stat-arrow">→</div>
            <div className="stat">
              <span className="lbl">NEW ROUTE V2 ETA</span>
              <span className="val text-success font-bold">09:18</span>
            </div>
            <div className="stat-recovered bg-success-light">
              <Zap size={14} className="text-success" />
              <span>RECOVERED: 02:58</span>
            </div>
            <button className="btn-accept-reroute" onClick={onAcceptReroute}>
              ACCEPT NEW ROUTE
            </button>
          </div>
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="mission-layout-grid">
        
        {/* Left Column: Map + Telemetry + Routes */}
        <div className="mission-main-col">
          {/* Active Mission Map */}
          <div className="mission-map-container">
            <div className="map-hdr-line">
              <span className="title">
                {isV2 ? "LIVE ORCHESTRATION PATHWAY — ROUTE V2 BYPASS" : "LIVE ORCHESTRATION PATHWAY"}
              </span>
              <span className="coordinates font-mono">
                {isV2 ? "NODE-REF: BYPASS-V2-CONGRESS" : "NODE-REF: WARDHA-RD-SITA"}
              </span>
            </div>

            <div className="mission-map-view">
              <div className="radar-mesh"></div>

              {/* Dynamic Path Progress bar */}
              <div className="path-route-line primary-route">
                
                {/* Visual lanes */}
                <div className={`route-alternate alt-1 ${isV2 ? "active-path" : "dimmed-path"}`}></div>
                <div className="route-alternate alt-2"></div>
                
                {/* Progress highlight */}
                <div 
                  className="route-progress-fill" 
                  style={{ 
                    width: `${tripProgress}%`,
                    backgroundColor: isV2 ? "var(--warning)" : "var(--primary)" 
                  }}
                ></div>

                {/* Blockage Cross Indicator ❌ */}
                {(blockageState !== "none") && (
                  <div className="map-node node-blockage-x" style={{ left: "55%", top: "50%" }}>
                    <span className="node-icon font-mono">❌</span>
                    <span className="node-label text-critical font-mono" style={{ borderColor: "var(--critical)" }}>
                      BLOCKAGE
                    </span>
                  </div>
                )}

                {/* Start Point: Incident 🔴 */}
                <div className="map-node node-start" style={{ left: "0%" }}>
                  <span className="node-icon font-mono">🚨</span>
                  <span className="node-label">SITABULDI</span>
                </div>

                {/* End Point: GMC Hospital 🏥 */}
                <div className="map-node node-end" style={{ left: "100%" }}>
                  <span className="node-icon font-mono">🏥</span>
                  <span className="node-label">GMC HOSP</span>
                </div>

                {/* Moving Ambulance A-104 🚑 */}
                <div className="map-node node-ambulance-truck animate-pulse-slow" style={{ left: `${tripProgress}%`, top: isV2 ? "-8px" : "3px" }}>
                  <span className="node-icon font-mono">🚑</span>
                  <span className="node-label font-mono text-primary">{ambulance.id}</span>
                </div>

                {/* Traffic Signals on Route */}
                {signals.map((sig, idx) => {
                  const percentPos = 20 + idx * 25; // distribute signals
                  const isGreen = sig.status.includes("GREEN") || sig.status.includes("ACTIVE");

                  return (
                    <div key={sig.id} className="map-node node-signal" style={{ left: `${percentPos}%` }}>
                      <div className={`signal-light-dot ${isGreen ? "green" : "red"}`}></div>
                      <span className="node-label font-mono" style={{ fontSize: "0.55rem" }}>
                        {sig.id}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Telemetry panel */}
          <div className="mission-telemetry-grid">
            <div className="telemetry-box">
              <Clock size={16} className="telemetry-icon" />
              <div className="box-inner">
                <span className="lbl">LIVE ETA</span>
                <span className="val font-mono text-primary">{telemetry.eta}</span>
              </div>
            </div>

            <div className="telemetry-box">
              <Navigation size={16} className="telemetry-icon" />
              <div className="box-inner">
                <span className="lbl">DISTANCE LEFT</span>
                <span className="val font-mono">{telemetry.distance} km</span>
              </div>
            </div>

            <div className="telemetry-box">
              <Gauge size={16} className="telemetry-icon" />
              <div className="box-inner">
                <span className="lbl">SPEED</span>
                <span className="val font-mono">{telemetry.speed}</span>
              </div>
            </div>

            <div className="telemetry-box">
              <Activity size={16} className="telemetry-icon" />
              <div className="box-inner">
                <span className="lbl">SYSTEM STAT</span>
                <span className="val font-mono text-success">{telemetry.status}</span>
              </div>
            </div>
          </div>

          {/* Routes Section */}
          <div className="routes-selector-panel">
            <div className="routes-panel-hdr">
              <h3 className="section-title-small">DETERMINED ROUTE OPTIONS</h3>
            </div>
            
            <div className="routes-tabs-list">
              <div className={`route-select-row ${!isV2 ? "active" : "disabled-v1"}`}>
                <div className="route-name-col">
                  <span className="badge-primary-route">ROUTE V1</span>
                  <strong>Wardha Road Highway {isV2 && "(Blocked)"}</strong>
                </div>
                <div className="route-stats font-mono">
                  <span>6.4 km</span>
                  <span className="divider-bar"></span>
                  <span className={!isV2 ? "text-primary" : "text-strike"}>08:42 mins</span>
                </div>
              </div>

              <div className={`route-select-row ${isV2 ? "active" : ""}`}>
                <div className="route-name-col">
                  <span className="badge-alt-route" style={{ color: isV2 ? "var(--warning)" : "", borderColor: isV2 ? "var(--warning)" : "" }}>
                    ROUTE V2
                  </span>
                  <strong>Congress Nagar Bypass</strong>
                </div>
                <div className="route-stats font-mono">
                  <span>7.1 km</span>
                  <span className="divider-bar"></span>
                  <span style={{ color: isV2 ? "var(--warning)" : "" }}>09:18 mins</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Hospital Alert + Timeline */}
        <div className="mission-side-col">
          {/* Hospital pre-alert notification box */}
          <div className={`hospital-alert-box ${hospitalAlertAcknowledged ? "acknowledged" : "alert-pulsing"}`}>
            <div className="alert-hdr">
              <BellRing className={`alert-icon ${hospitalAlertAcknowledged ? "" : "bell-pulsing"}`} size={20} />
              <div>
                <h4>{hospitalAlertAcknowledged ? "HOSPITAL PRE-ALERT RECEIVED" : "🚨 INCOMING PATIENT PRE-ALERT"}</h4>
                <p className="alert-sub text-muted font-mono">{hospital?.name}</p>
              </div>
            </div>

            <div className="alert-body">
              <div className="alert-item">
                <span className="lbl">Incident</span>
                <span className="val text-critical">{emergency.type}</span>
              </div>
              <div className="alert-item">
                <span className="lbl">Ambulance Unit</span>
                <span className="val font-mono">{ambulance.id}</span>
              </div>
              <div className="alert-item font-mono text-bold">
                <span className="lbl">Hospital ETA</span>
                {isV2 ? (
                  <span className="val text-warning">09:18 <span style={{ textDecoration: "line-through", fontSize: "0.68rem", color: "var(--text-muted)", marginLeft: "4px" }}>08:42</span></span>
                ) : (
                  <span className="val text-primary">{telemetry.eta}</span>
                )}
              </div>
              {isV2 && (
                <div className="reroute-log font-mono" style={{ fontSize: "0.62rem", color: "var(--warning)", borderTop: "1px dashed var(--panel-border)", paddingTop: "6px", marginTop: "4px" }}>
                  Reason: Traffic blockage + reroute
                </div>
              )}
            </div>

            <div className="alert-footer">
              {hospitalAlertAcknowledged ? (
                <div className="acknowledged-tag-bar">
                  <CheckCircle2 size={14} className="text-success" />
                  <span>PRE-ALERT ACKNOWLEDGED</span>
                </div>
              ) : (
                <button className="btn-acknowledge-alert" onClick={onAcknowledgeHospital}>
                  ACKNOWLEDGE ALERT
                </button>
              )}
            </div>
          </div>

          {/* Mission Timeline events logs */}
          <div className="mission-timeline-panel">
            <h3 className="section-title-small" style={{ marginBottom: "16px" }}>MISSION TIMELINE</h3>
            <div className="css-vertical-timeline">
              {timeline.map((event, idx) => (
                <div key={idx} className="timeline-event-row">
                  <div className="timeline-left-time font-mono">
                    {event.time}
                  </div>
                  <div className="timeline-middle-indicator">
                    <div className="timeline-circle active" style={{ backgroundColor: event.event.includes("blockage") || event.event.includes("recalculation") ? "var(--warning)" : "" }}></div>
                    {idx < timeline.length - 1 && <div className="timeline-line"></div>}
                  </div>
                  <div className="timeline-right-content">
                    <p className="event-desc-text" style={{ color: event.event.includes("blockage") || event.event.includes("recalculation") ? "var(--warning)" : "" }}>
                      {event.event}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

// Internal mini loader icon component
const LoaderIcon = () => (
  <svg 
    className="spinner-ai animate-spin" 
    viewBox="0 0 24 24" 
    fill="none" 
    style={{ width: "16px", height: "16px", marginRight: "6px", display: "inline-block", verticalAlign: "middle", animation: "spin 1s infinite linear" }}
  >
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.1 }}></circle>
    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
  </svg>
);

export default MissionPage;
