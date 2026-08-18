import React from "react";
import { Shield, ShieldAlert, Cpu } from "lucide-react";
import "./GreenCorridorPage.css";

// Visual Traffic Light Bulb Component
const TrafficLight = ({ status }) => {
  const isRed = status.toUpperCase() === "RED";
  const isYellow = status.toUpperCase() === "YELLOW" || status.toUpperCase() === "READY";
  const isGreen = status.toUpperCase() === "GREEN" || status.includes("ACTIVE");

  return (
    <div className="traffic-light-fixture">
      <div className={`light-lens red ${isRed ? "lit" : ""}`}></div>
      <div className={`light-lens yellow ${isYellow ? "lit" : ""}`}></div>
      <div className={`light-lens green ${isGreen ? "lit" : ""}`}></div>
    </div>
  );
};

const GreenCorridorPage = ({ missionData }) => {
  if (!missionData) {
    return (
      <div className="view-container animate-fade">
        <div className="section-panel" style={{ padding: "40px", textAlign: "center" }}>
          <ShieldAlert size={36} className="text-warning-icon" style={{ marginBottom: "12px" }} />
          <h3>No Active Green Corridor</h3>
          <p style={{ color: "var(--text-secondary)", maxWidth: "450px", margin: "10px auto" }}>
            Dispatched ambulance missions automatically trigger municipal green corridor override protocols. Start a mission to view real-time synchronization.
          </p>
        </div>
      </div>
    );
  }

  const { ambulance, emergency, telemetry, signals } = missionData;

  return (
    <div className="view-container animate-fade">
      {/* Simulation Banner Notice */}
      <div className="simulation-disclaimer-banner">
        <div className="disclaimer-group">
          <span className="proto-pulse">🟣</span>
          <div>
            <strong>PROTOTYPE SIMULATION MODE</strong>
            <p>Nagpur Resq corridor override simulator. Municipal signal grids are mocked for development validation.</p>
          </div>
        </div>
      </div>

      <div className="corridor-header-block">
        <div className="corridor-title-row">
          <Shield className="text-success" size={22} />
          <div>
            <h2 className="view-title">GREEN CORRIDOR PROTOCOLS</h2>
            <p className="view-subtitle">Live override status of municipal traffic signal networks.</p>
          </div>
        </div>
        
        <div className="corridor-tracking-stats">
          <span className="stat-item">UNIT: <strong className="font-mono text-primary">{ambulance.id}</strong></span>
          <span className="divider-line"></span>
          <span className="stat-item">SECTOR: <strong>{emergency.location}</strong></span>
          <span className="divider-line"></span>
          <span className="stat-item">ROUTE ETA: <strong className="font-mono text-success">{telemetry.eta}</strong></span>
        </div>
      </div>

      {/* Signals List Grid */}
      <div className="corridor-grid-panels">
        {signals.map((sig) => {
          // Determine color state for visual light based on status string
          let bulbStatus = "RED";
          if (sig.status.includes("ACTIVE") || sig.status.includes("GREEN")) {
            bulbStatus = "GREEN";
          } else if (sig.status.includes("READY") || sig.status.includes("YELLOW")) {
            bulbStatus = "YELLOW";
          } else if (sig.status.includes("PASSED")) {
            bulbStatus = "YELLOW"; // or red
          }

          const isActive = sig.status.includes("ACTIVE");
          const isPassed = sig.status.includes("PASSED");
          const isReady = sig.status.includes("READY");

          return (
            <div 
              key={sig.id} 
              className={`signal-card ${isActive ? "priority-active" : ""} ${isPassed ? "passed-restoring" : ""}`}
            >
              <div className="signal-card-left">
                <TrafficLight status={bulbStatus} />
              </div>

              <div className="signal-card-right">
                <div className="signal-meta-hdr">
                  <span className="sig-id font-mono">{sig.id}</span>
                  <span className="sig-name">{sig.name}</span>
                </div>

                <div className="signal-status-indicator-bar">
                  {isActive && (
                    <div className="indicator-badge active font-mono animate-pulse-slow">
                      AMBULANCE PRIORITY ACTIVE
                    </div>
                  )}
                  {isPassed && (
                    <div className="indicator-badge passed font-mono">
                      AMBULANCE PASSED
                    </div>
                  )}
                  {isReady && (
                    <div className="indicator-badge ready font-mono">
                      CORRIDOR READY
                    </div>
                  )}
                  {!isActive && !isPassed && !isReady && (
                    <div className="indicator-badge normal font-mono">
                      NORMAL OPERATION
                    </div>
                  )}
                </div>

                <div className="signal-telemetry-rows">
                  <div className="t-row">
                    <span className="lbl">Junction ETA</span>
                    <span className="val font-mono text-primary">{sig.eta}</span>
                  </div>
                  <div className="t-row">
                    <span className="lbl">Telemetry State</span>
                    <span className="val font-mono">
                      {isActive ? "OVERRIDE ACTIVE" : isPassed ? "RESTORING CYCLE..." : "SYNC READY"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Control center information box */}
      <div className="section-panel" style={{ marginTop: "24px" }}>
        <div className="section-header">
          <h3 className="section-title">
            <Cpu size={16} />
            <span>MUNICIPAL SIGNAL GRID OVERVIEW</span>
          </h3>
        </div>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: "1.5" }}>
          Nagpur Resq integrates with the city's intelligent traffic management system (ITMS). During emergency transits, GPS trackers transmit real-time coordinate updates. The recommendation engine predicts corridor intersection points and overrides signal timers to clear lane bottlenecks 1,500 meters ahead of the unit, restoring standard cycles immediately after transit.
        </p>
      </div>
    </div>
  );
};

export default GreenCorridorPage;
