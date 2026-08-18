import React from "react";
import { Loader2, Info, WifiOff, AlertTriangle, ShieldAlert } from "lucide-react";
import "./StatusWidgets.css";

// 1. Reusable Loading Widget
export const LoadingWidget = ({ message = "Processing..." }) => {
  return (
    <div className="status-widget-container loading animate-fade" aria-live="polite">
      <div className="spinner-wrapper">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
      <p className="status-message font-mono">{message.toUpperCase()}</p>
    </div>
  );
};

// 2. Reusable Empty State Widget
export const EmptyWidget = ({ title = "NO RECORDS FOUND", message = "No data is currently available." }) => {
  return (
    <div className="status-widget-container empty animate-fade" role="status">
      <div className="info-icon-wrapper">
        <Info className="text-secondary" size={24} />
      </div>
      <h4 className="empty-title font-mono">{title}</h4>
      <p className="empty-desc">{message}</p>
    </div>
  );
};

// 3. Reusable Error Widget
export const ErrorWidget = ({ type = "gps", onRetry }) => {
  if (type === "gps") {
    return (
      <div className="error-overlay animate-fade" role="alert" aria-relevant="all">
        <div className="error-panel">
          <ShieldAlert size={36} className="text-critical animate-pulse-slow" />
          <h4 className="font-mono text-critical">⚠ GPS DATA STALE</h4>
          <p className="subtext">Telemetry link latency exceeded safety thresholds. Last update: 34 seconds ago.</p>
          <button className="btn-retry font-mono" onClick={onRetry} aria-label="Retry GPS Satellite Link">
            RETRY LINK
          </button>
        </div>
      </div>
    );
  }

  if (type === "connection") {
    return (
      <div className="error-overlay animate-fade" role="alert" aria-relevant="all">
        <div className="error-panel">
          <WifiOff size={36} className="text-warning-icon animate-pulse-slow" />
          <h4 className="font-mono text-warning">⚠ CONNECTION LOST</h4>
          <p className="subtext">Lost uplink connection to ITMS gateway. Showing last known state.</p>
          <button className="btn-retry font-mono" onClick={onRetry} style={{ borderColor: "var(--warning)", color: "var(--warning)" }} aria-label="Reconnect ITMS Cellular gateway">
            RECONNECT
          </button>
        </div>
      </div>
    );
  }

  if (type === "hospital") {
    return (
      <div className="error-panel inline-alert warning animate-fade" role="alert">
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <AlertTriangle size={20} className="text-warning-icon" />
          <div>
            <h5 className="font-mono text-warning" style={{ margin: 0 }}>⚠ HOSPITAL UNAVAILABLE</h5>
            <p className="subtext" style={{ margin: "2px 0 0" }}>Searching for another suitable hospital...</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
