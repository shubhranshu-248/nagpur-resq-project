import React from "react";
import { Radio, ShieldAlert } from "lucide-react";
import "./TrafficOperatorView.css";

const TrafficOperatorView = ({ missionData }) => {
  if (!missionData) {
    return (
      <div className="view-container animate-fade">
        <div className="section-panel" style={{ padding: "40px", textAlign: "center" }}>
          <ShieldAlert size={36} className="text-warning-icon" style={{ marginBottom: "12px" }} />
          <h3>No Active Traffic Session</h3>
          <p style={{ color: "var(--text-secondary)", maxWidth: "450px", margin: "10px auto" }}>
            The traffic operator dashboard activates dynamically during emergency dispatches. Start a mission from the Command Centre to launch the ITMS overrides logs.
          </p>
        </div>
      </div>
    );
  }

  const { id, ambulance, telemetry, signals } = missionData;

  const getStatusColor = (statusStr) => {
    if (statusStr.includes("ACTIVE") || statusStr.includes("GREEN")) return "var(--success)";
    if (statusStr.includes("READY") || statusStr.includes("YELLOW")) return "var(--warning)";
    if (statusStr.includes("PASSED")) return "var(--text-muted)";
    return "var(--text-secondary)";
  };

  return (
    <div className="view-container animate-fade">
      <div className="operator-header">
        <div>
          <h2 className="view-title">TRAFFIC CONTROL</h2>
          <p className="view-subtitle font-mono">INTELLIGENT TRAFFIC MANAGEMENT SYSTEM (ITMS) OVERRIDES</p>
        </div>
        <div className="operator-badge-mode">
          <span className="dot animate-pulse-slow"></span>
          <span>SIMULATION MODE</span>
        </div>
      </div>

      <div className="operator-grid-layout">
        {/* Left Column: Overrides Table */}
        <div className="operator-main-panel">
          <div className="section-panel">
            <div className="section-header">
              <h3 className="section-title">
                <Radio size={16} className="pulse-svg text-primary" />
                <span>ACTIVE JUNCTION OVERRIDES</span>
              </h3>
              <span className="prototype-badge">CORRIDOR: WARDHA-RD</span>
            </div>

            <div className="junction-override-table">
              <div className="table-row table-hdr">
                <span>JUNCTION ID</span>
                <span>LOCATION NAME</span>
                <span>STATUS LOG</span>
                <span>CORRIDOR MODE</span>
              </div>

              {signals.map((sig) => {
                const isActive = sig.status.includes("ACTIVE");
                const isPassed = sig.status.includes("PASSED");
                const isReady = sig.status.includes("READY");

                return (
                  <div key={sig.id} className={`table-row ${isActive ? "row-active" : ""}`}>
                    <span className="font-mono text-bold">{sig.id}</span>
                    <span>{sig.name}</span>
                    <span className="font-mono text-bold" style={{ color: getStatusColor(sig.status) }}>
                      {sig.status}
                    </span>
                    <span>
                      {isActive ? (
                        <span className="mode-badge override">🟢 ACTIVE OVERRIDE</span>
                      ) : isPassed ? (
                        <span className="mode-badge passed">⚪ NORMAL CYCLE</span>
                      ) : isReady ? (
                        <span className="mode-badge ready">🟡 PRIORITY READY</span>
                      ) : (
                        <span className="mode-badge normal">⚪ NORMAL OPERATION</span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Signal Logs Terminal */}
        <div className="operator-side-panel">
          <div className="terminal-panel">
            <div className="terminal-hdr font-mono">
              <span className="dot-term red"></span>
              <span className="dot-term yellow"></span>
              <span className="dot-term green"></span>
              <span className="title">ITMS SIGNAL OVERRIDE INTERCEPT LOGS</span>
            </div>
            <div className="terminal-body font-mono">
              <p className="line-log text-muted">[18:02:14] ITMS: Initializing Sector Sitabuldi-GMC Route query...</p>
              <p className="line-log text-muted">[18:03:02] ITMS: Dispatch ID #{id} locked on Ambulance {ambulance.id}.</p>
              <p className="line-log text-success">[18:04:12] SYSTEM: Green Corridor priority routing synced along Wardha Road.</p>
              
              {signals.map((sig) => {
                const isActive = sig.status.includes("ACTIVE");
                const isPassed = sig.status.includes("PASSED");
                if (isActive) {
                  return (
                    <p key={sig.id} className="line-log text-primary">
                      {`[18:05:22] INTERCEPT: ${sig.id} overridden. All signals forced GREEN. Lane clear protocols active.`}
                    </p>
                  );
                }
                if (isPassed) {
                  return (
                    <p key={sig.id} className="line-log text-muted">
                      {`[18:05:45] RELEASE: ${sig.id} transit logged. Standard ITMS loop times restored.`}
                    </p>
                  );
                }
                return null;
              })}
              
              <p className="line-log text-warning animate-pulse-slow">
                {`[18:05:58] TELEMETRY: Unit ${ambulance.id} at ${telemetry.distance}km, Speed: ${telemetry.speed}.`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrafficOperatorView;
