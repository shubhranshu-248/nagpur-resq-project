import React from "react";
import { AlertTriangle, Truck, Building2, Clock, Zap } from "lucide-react";
import "./KpiCard.css";

const KpiIcon = ({ name, color }) => {
  const size = 22;
  switch (name) {
    case "AlertTriangle":
      return <AlertTriangle size={size} style={{ color }} />;
    case "Truck":
      return <Truck size={size} style={{ color }} />;
    case "Building2":
      return <Building2 size={size} style={{ color }} />;
    case "Clock":
      return <Clock size={size} style={{ color }} />;
    case "Zap":
      return <Zap size={size} style={{ color }} />;
    default:
      return <AlertTriangle size={size} style={{ color }} />;
  }
};

const KpiCard = ({ title, value, icon, color }) => {
  return (
    <div className="kpi-card" style={{ borderColor: `${color}33` }}>
      <div className="kpi-card-inner">
        <div className="kpi-info">
          <span className="kpi-title">{title}</span>
          <span className="kpi-value" style={{ color }}>{value}</span>
        </div>
        <div className="kpi-icon-wrapper" style={{ backgroundColor: `${color}15` }}>
          <KpiIcon name={icon} color={color} />
        </div>
      </div>
      <div className="kpi-glow" style={{ background: `linear-gradient(180deg, transparent 50%, ${color}08 100%)` }} />
    </div>
  );
};

export default KpiCard;
