import React from "react";
import { AlertCircle, MapPin, Users, HeartHandshake, Eye } from "lucide-react";
import "./EmergencyCard.css";

const EmergencyCard = ({ emergency, onViewMission, onStartDispatch }) => {
  if (!emergency) return null;

  const {
    id,
    type,
    severity,
    location,
    patients,
    requirements,
    status,
    timeReported,
    notes
  } = emergency;

  const isCritical = severity === "CRITICAL";

  return (
    <div className={`emergency-card ${isCritical ? "critical-border" : "warning-border"}`}>
      <div className="emergency-card-header">
        <div className="severity-badge-row">
          <span className={`severity-badge ${isCritical ? "critical" : "warning"}`}>
            <AlertCircle size={12} />
            <span>{severity}</span>
          </span>
          <span className="emergency-id font-mono">{id}</span>
        </div>
        <span className="time-ago">{timeReported}</span>
      </div>

      <div className="emergency-card-body">
        <h4 className="emergency-type">{type}</h4>
        
        <div className="info-meta-row">
          <div className="info-meta-item">
            <MapPin size={14} className="meta-icon" />
            <span>{location}</span>
          </div>
          <div className="info-meta-item">
            <Users size={14} className="meta-icon" />
            <span>{patients} Patient{patients > 1 ? "s" : ""}</span>
          </div>
        </div>

        <div className="requirements-section">
          <span className="section-label-tiny">EQUIPMENT REQUIRED:</span>
          <div className="tags-container">
            {requirements.map((req, i) => (
              <span key={i} className="requirement-tag">
                {req}
              </span>
            ))}
          </div>
        </div>

        {notes && (
          <p className="emergency-notes">
            {notes}
          </p>
        )}
      </div>

      <div className="emergency-card-footer">
        <div className="status-container">
          <span className={`status-pulse-dot ${status.replace(/\s+/g, '-').toLowerCase()}`}></span>
          <span className="dispatch-status">{status}</span>
        </div>
        {status === "AMBULANCE EN ROUTE" || status === "ARRIVED" || status === "RESOLVED" ? (
          <button 
            className="btn-view-mission"
            onClick={() => onViewMission(emergency)}
          >
            <Eye size={14} />
            <span>VIEW MISSION</span>
          </button>
        ) : (
          <button 
            className="btn-view-mission start-dispatch-btn"
            style={{ backgroundColor: "var(--primary)", borderColor: "var(--primary)" }}
            onClick={() => onStartDispatch && onStartDispatch(emergency)}
          >
            <HeartHandshake size={14} />
            <span>START DISPATCH</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default EmergencyCard;
