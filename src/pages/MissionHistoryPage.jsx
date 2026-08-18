import React from "react";
import { History, ChevronRight, Inbox, ShieldCheck } from "lucide-react";
import "./MissionHistoryPage.css";

const MissionHistoryPage = ({ completedMissions = [], onViewHistoryDetails }) => {
  const hasHistory = completedMissions && completedMissions.length > 0;

  return (
    <div className="view-container animate-fade">
      <div className="history-header">
        <div>
          <h2 className="view-title">MISSION HISTORY</h2>
          <p className="view-subtitle font-mono">RESOLVED DISPATCH PROTOCOLS & PERFORMANCE AUDITS</p>
        </div>
        <div className="history-badge-count font-mono" style={{ backgroundColor: "rgba(59, 130, 246, 0.15)", color: "var(--primary)", borderColor: "rgba(59, 130, 246, 0.3)" }}>
          <span>{completedMissions.length} RECORDED</span>
        </div>
      </div>

      <div className="section-panel">
        <div className="section-header">
          <h3 className="section-title">
            <History size={16} className="text-primary" />
            <span>ITMS DATABASE ARCHIVE</span>
          </h3>
          <span className="prototype-badge" style={{ backgroundColor: "rgba(34, 197, 94, 0.15)", color: "var(--success)", borderColor: "rgba(34, 197, 94, 0.3)" }}>
            LIVE SESSION ARCHIVE
          </span>
        </div>

        {hasHistory ? (
          <div className="history-list-wrapper animate-fade">
            <div className="history-list-hdr font-mono">
              <span>MISSION ID</span>
              <span>TYPE & SECTOR</span>
              <span>RESOURCE & DESTINATION</span>
              <span>DURATION</span>
              <span>ROUTING</span>
              <span>ACTIONS</span>
            </div>

            {completedMissions.map((item) => (
              <div key={item.id} className="history-row-item">
                <span className="font-mono text-bold text-light">#{item.id}</span>
                
                <div className="type-loc-block">
                  <strong>{item.emergency?.type || "Critical Emergency"}</strong>
                  <span className="subtext">{item.emergency?.location || "Sitabuldi, Wardha Road"}</span>
                </div>

                <div className="resource-dest-block">
                  <span>🚑 {item.ambulance?.id || "A-104"} ({item.ambulance?.type || "ALS"})</span>
                  <span className="subtext">🏥 {item.hospital?.name || "GMCH Nagpur"}</span>
                </div>

                <div className="duration-block font-mono">
                  <strong>{item.duration || "07:18 mins"}</strong>
                  <span className="text-success text-bold" style={{ fontSize: "0.68rem" }}>
                    Saved 06:21 mins
                  </span>
                </div>

                <div>
                  {item.routeType?.includes("V2") || item.signals?.some(s => s.name?.includes("Bypass")) ? (
                    <span className="route-badge-h rerouted font-mono">🔄 REROUTED V2</span>
                  ) : (
                    <span className="route-badge-h primary font-mono">🟢 GREEN WAVE V1</span>
                  )}
                </div>

                <div>
                  <button 
                    className="btn-view-history-log font-mono" 
                    onClick={() => onViewHistoryDetails && onViewHistoryDetails(item)}
                    aria-label={`View log details for mission ${item.id}`}
                  >
                    <span>VIEW LOG</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Clean Empty State */
          <div className="font-mono animate-fade" style={{ padding: "48px 24px", textAlign: "center" }}>
            <div style={{ width: "50px", height: "50px", borderRadius: "50%", backgroundColor: "rgba(59, 130, 246, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
              <Inbox size={24} className="text-primary" />
            </div>
            <h4 style={{ fontSize: "1rem", fontWeight: "800", color: "var(--text-light)", marginBottom: "6px" }}>
              NO ARCHIVED DISPATCH LOGS IN DATABASE
            </h4>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.75rem", maxWidth: "480px", margin: "0 auto 16px" }}>
              All dummy historical logs have been cleared. Completed emergency journeys from citizens to hospitals will be archived here in real time.
            </p>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--success)", fontSize: "0.7rem" }}>
              <ShieldCheck size={14} />
              <span>Green Corridor protocol automatically armed for all incoming missions.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MissionHistoryPage;
