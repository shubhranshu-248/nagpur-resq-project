import React from "react";
import { Gauge, Clock, Phone, User } from "lucide-react";
import "./AmbulanceCard.css";

const AmbulanceCard = ({ ambulance }) => {
  if (!ambulance) return null;

  const {
    id,
    type,
    status,
    speed,
    eta,
    equipment,
    driver,
    contact
  } = ambulance;

  const getStatusClass = (statusStr) => {
    switch (statusStr.toUpperCase()) {
      case "AVAILABLE":
        return "status-avail";
      case "TRANSPORTING":
        return "status-transporting";
      case "EN ROUTE":
        return "status-enroute";
      default:
        return "";
    }
  };

  return (
    <div className="ambulance-card">
      <div className="amb-card-header">
        <div className="amb-title-row">
          <span className="amb-id">{id}</span>
          <span className={`amb-type-badge ${type === "ALS" ? "als" : "bls"}`}>
            {type}
          </span>
        </div>
        <span className={`amb-status-tag ${getStatusClass(status)}`}>
          {status}
        </span>
      </div>

      <div className="amb-card-body">
        <div className="amb-meta-grid">
          <div className="amb-meta-box">
            <Gauge size={13} className="amb-meta-icon" />
            <div className="meta-details">
              <span className="meta-lbl">SPEED</span>
              <span className="meta-val">{speed}</span>
            </div>
          </div>

          <div className="amb-meta-box">
            <Clock size={13} className="amb-meta-icon" />
            <div className="meta-details">
              <span className="meta-lbl">ETA</span>
              <span className="meta-val">{eta}</span>
            </div>
          </div>
        </div>

        <div className="equipment-rack">
          <span className="section-label-tiny">EQUIPPED:</span>
          <div className="equip-tags">
            {equipment.map((item, i) => (
              <span key={i} className="equip-tag">
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="driver-contact-footer">
          <div className="person-info">
            <User size={12} className="info-icon" />
            <span>{driver}</span>
          </div>
          <div className="person-info">
            <Phone size={12} className="info-icon" />
            <span>{contact}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AmbulanceCard;
