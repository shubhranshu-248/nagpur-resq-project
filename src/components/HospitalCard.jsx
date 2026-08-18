import React from "react";
import { Hospital, CheckCircle, AlertTriangle } from "lucide-react";
import "./HospitalCard.css";

const HospitalCard = ({ hospital }) => {
  if (!hospital) return null;

  const {
    name,
    distance,
    trauma,
    icuBeds,
    oxygen,
    emergencyStatus,
    color
  } = hospital;

  const isReady = emergencyStatus === "READY";

  return (
    <div className="hospital-card" style={{ borderLeftColor: color }}>
      <div className="hosp-card-header">
        <div className="hosp-title-group">
          <Hospital size={16} className="hosp-icon-main" />
          <h4 className="hosp-name">{name}</h4>
        </div>
        <span className="hosp-dist font-mono">{distance}</span>
      </div>

      <div className="hosp-card-body">
        <div className="resource-row">
          <span className="res-lbl">Trauma Unit</span>
          <span className={`res-val ${trauma.includes("Yes") ? "text-success" : "text-muted"}`}>
            {trauma}
          </span>
        </div>

        <div className="resource-row">
          <span className="res-lbl">ICU Beds</span>
          <span className="res-val text-light">{icuBeds}</span>
        </div>

        <div className="resource-row">
          <span className="res-lbl">Oxygen Supply</span>
          <span className="res-val text-primary font-mono">{oxygen}</span>
        </div>
      </div>

      <div className="hosp-card-footer">
        <div className="status-label-group">
          {isReady ? (
            <CheckCircle size={12} className="text-success" />
          ) : (
            <AlertTriangle size={12} className="text-warning" />
          )}
          <span className="status-label-text" style={{ color }}>
            EMERGENCY {emergencyStatus}
          </span>
        </div>
        <div className="simulated-label font-mono">SIMULATED DATA</div>
      </div>
    </div>
  );
};

export default HospitalCard;
