import React, { useState } from "react";
import { Gauge, Clock, Navigation, Wifi, Battery, Radio } from "lucide-react";
import { ErrorWidget } from "../components/StatusWidgets";
import "./DriverView.css";

const DriverView = ({ missionData }) => {
  const [simulatedGpsError, setSimulatedGpsError] = useState(false);
  const [simulatedConnError, setSimulatedConnError] = useState(false);

  // Standby mock mission for rich demonstration when no live dispatch is running
  const defaultMission = {
    id: "RESQ-1024",
    ambulance: {
      id: "A-104",
      type: "ALS",
      driver: "Rahul Patil",
      contact: "+91 98231 44520"
    },
    emergency: {
      type: "Road Accident",
      location: "Sitabuldi (Wardha Rd)",
      patients: 1,
      notes: "Multi-vehicle collision near metro station. Patient unresponsive but breathing."
    },
    telemetry: {
      eta: "08:42",
      distance: "6.4",
      speed: "54 km/h",
      status: "EN ROUTE"
    },
    signals: [
      { id: "SIGNAL 01", name: "Sitabuldi Interchange", status: "🟢 PRIORITY ACTIVE", eta: "00:42" },
      { id: "SIGNAL 02", name: "Wardha Road Crossing", status: "🟡 READY", eta: "01:17" },
      { id: "SIGNAL 03", name: "Congress Nagar Junction", status: "⚪ NORMAL", eta: "02:04" },
      { id: "SIGNAL 04", name: "GMC Hospital Square", status: "🟢 PRIORITY ACTIVE", eta: "03:12" }
    ]
  };

  const active = missionData || defaultMission;
  const { id, ambulance, emergency, telemetry, signals } = active;

  // Find next active signal junction
  const nextSignal = (signals && signals.find(sig => !sig.status.includes("PASSED"))) || (signals && signals[signals.length - 1]) || {
    id: "SIGNAL 01",
    name: "Sitabuldi Square",
    status: "🟢 PRIORITY ACTIVE",
    eta: "00:42"
  };

  const totalDistance = 6.4;
  const currentDistance = parseFloat(telemetry.distance || "6.4");
  const tripProgress = Math.min(100, Math.max(0, ((totalDistance - currentDistance) / totalDistance) * 100));

  return (
    <div className="view-container driver-viewport-page animate-fade">
      {!missionData && (
        <div className="driver-standby-banner font-mono">
          <span className="dot animate-pulse-slow"></span>
          <span>STANDBY IN-CAB TELEMETRY STREAM // AMBULANCE UNIT A-104 (ALS)</span>
        </div>
      )}

      {/* Smartphone frame container */}
      <div className="phone-chassis">
        <div className="phone-screen-viewport">
          
          {/* Render error overlays inside the screen viewport if triggered */}
          {simulatedGpsError && (
            <ErrorWidget type="gps" onRetry={() => setSimulatedGpsError(false)} />
          )}
          {simulatedConnError && (
            <ErrorWidget type="connection" onRetry={() => setSimulatedConnError(false)} />
          )}

          {/* Mock Smartphone Status Bar */}
          <div className="phone-status-bar">
            <span className="phone-time font-mono">18:05</span>
            <div className="notch-sensor"></div>
            <div className="status-icons">
              <span className="gps-lock-lbl font-mono">📡 GPS ACTIVE</span>
              <Wifi size={12} />
              <Battery size={14} />
            </div>
          </div>

          {/* Navigation header */}
          <div className="phone-nav-header">
            <div className="unit-indicator">
              <span className="dot animate-pulse-slow"></span>
              <span className="text font-mono">{ambulance.id} In-Cab Portal</span>
            </div>
            <span className="mission-tag font-mono">#{id}</span>
          </div>

          {/* Mini Route Map */}
          <div className="phone-mini-map">
            <div className="mini-mesh"></div>
            <div className="mini-highway-line">
              <div className="mini-progress-fill" style={{ width: `${tripProgress}%` }}></div>
              <div className="mini-node start">🚨</div>
              <div className="mini-node end">🏥</div>
              <div className="mini-node amb-dot" style={{ left: `${tripProgress}%` }}>
                <span className="amb-avatar">🚑</span>
              </div>
            </div>
            <span className="sector-overlay-label font-mono">{emergency.location} sector</span>
          </div>

          {/* Main Large Telemetry Display */}
          <div className="phone-telemetry-cluster">
            <div className="primary-eta-block">
              <Clock size={20} className="text-primary" style={{ marginBottom: "6px" }} />
              <span className="telemetry-lbl">ESTIMATED ARRIVAL TIME</span>
              <span className="telemetry-big-val font-mono text-primary">{telemetry.eta}</span>
            </div>

            <div className="telemetry-row-sub">
              <div className="sub-tel-item">
                <Navigation size={14} className="text-muted" />
                <span className="tel-lbl">DISTANCE</span>
                <span className="tel-val font-mono">{telemetry.distance} km</span>
              </div>
              <div className="sub-tel-item">
                <Gauge size={14} className="text-muted" />
                <span className="tel-lbl">SPEED</span>
                <span className="tel-val font-mono">{telemetry.speed}</span>
              </div>
            </div>
          </div>

          {/* Next Intersection Overrides Box */}
          <div className="phone-signal-priority-panel">
            <div className="panel-hdr-tiny font-mono">
              <Radio size={12} className="text-success animate-pulse-slow" style={{ display: "inline", marginRight: "4px" }} />
              <span>ITMS GREEN CORRIDOR PROTOCOL</span>
            </div>
            {nextSignal ? (
              <div className="priority-status-content">
                <div className="signal-indicator-cluster">
                  <span className="signal-avatar font-mono">🚦</span>
                  <div className="signal-details">
                    <span className="sig-name font-mono">{nextSignal.id}: {nextSignal.name}</span>
                    <span className="sig-eta font-mono">ETA: {nextSignal.eta}</span>
                  </div>
                </div>

                <div className={`override-signal-badge ${nextSignal.status.includes("ACTIVE") ? "active" : "ready"}`}>
                  <span className="badge-dot pulse-circle"></span>
                  <span className="badge-txt font-mono">
                    {nextSignal.status.includes("ACTIVE") ? "🟢 PRIORITY ACTIVE" : "🟡 APPROACHING"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="priority-status-content font-mono text-center">
                <span>DESTINATION REACHED</span>
              </div>
            )}
          </div>

          {/* Emergency details drawer preview */}
          <div className="phone-emergency-preview">
            <span className="label font-mono">INCIDENT DISPATCH DETAILS</span>
            <div className="body">
              <span className="type text-critical font-mono">{emergency.type}</span>
              <span className="notes">{emergency.notes}</span>
            </div>
          </div>

        </div>
      </div>

      {/* Interactive Simulator controls panel for hackathon panel evaluations */}
      <div className="driver-simulation-controls">
        <span className="font-mono label">SIMULATE IN-CAB DIAGNOSTICS:</span>
        <button 
          className={`btn-sim-toggle ${simulatedGpsError ? "active" : ""}`}
          onClick={() => {
            setSimulatedGpsError(!simulatedGpsError);
            setSimulatedConnError(false); // mutually exclusive
          }}
          aria-label="Toggle Simulated GPS Signal Loss"
        >
          📡 GPS FAILURE
        </button>
        <button 
          className={`btn-sim-toggle ${simulatedConnError ? "active" : ""}`}
          onClick={() => {
            setSimulatedConnError(!simulatedConnError);
            setSimulatedGpsError(false); // mutually exclusive
          }}
          aria-label="Toggle Simulated Cellular Connection Loss"
        >
          🔌 UPLINK DISCONNECT
        </button>
      </div>
    </div>
  );
};

export default DriverView;
