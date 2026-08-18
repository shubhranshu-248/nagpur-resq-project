import React from "react";
import { CheckCircle2, Clock, Zap, ShieldCheck } from "lucide-react";
import "./MissionCompletedPage.css";

const MissionCompletedPage = ({ 
  missionData, 
  onResetDemo, 
  onViewMissionClick, 
  onViewAnalyticsClick 
}) => {
  // Use mock values or fallbacks if data is missing
  const id = missionData?.id || "RESQ-1042";
  const hospitalName = missionData?.hospital?.name || "Government Medical College";

  return (
    <div className="view-container animate-fade">
      <div className="completed-card-panel">
        
        {/* Giant check animation header */}
        <div className="completed-badge-icon">
          <div className="icon-pulse-gmc">
            <CheckCircle2 size={48} className="text-success-icon" />
          </div>
          <h2 className="headline font-mono">MISSION COMPLETED ✓</h2>
          <p className="subhead font-mono">ID: #{id} DISPATCH PROTOCOL RESOLVED</p>
        </div>

        {/* Dynamic Telemetry Stats Grid */}
        <div className="completed-stats-grid">
          <div className="stat-box-large duration">
            <Clock size={18} className="stat-icon" />
            <div className="box-inner">
              <span className="lbl">TOTAL TRANSIT TIME</span>
              <span className="val font-mono">12:21</span>
              <span className="unit">minutes</span>
            </div>
          </div>

          <div className="stat-box-large baseline">
            <div className="box-inner">
              <span className="lbl">BASELINE ESTIMATE</span>
              <span className="val font-mono">18:42</span>
              <span className="unit">minutes</span>
            </div>
          </div>

          <div className="stat-box-large saved">
            <Zap size={18} className="stat-icon" />
            <div className="box-inner">
              <span className="lbl">ITMS TIME SAVED</span>
              <span className="val font-mono text-success">06:21</span>
              <span className="unit text-success">minutes saved</span>
            </div>
          </div>
        </div>

        {/* Dispatch details summary debrief */}
        <div className="completed-summary-box">
          <h4 className="box-title">DISPATCH ORCHESTRATION LOG DEBRIEF</h4>
          
          <div className="debrief-flow-row">
            <div className="debrief-unit">
              <span className="lbl">Assigned Ambulance</span>
              <strong>A-104 (ALS)</strong>
            </div>

            <div className="debrief-unit">
              <span className="lbl">Trauma Destination</span>
              <strong>{hospitalName}</strong>
            </div>

            <div className="debrief-unit font-mono">
              <span className="lbl">Route Changes</span>
              <strong className="text-warning">1 (Reroute V2)</strong>
            </div>

            <div className="debrief-unit font-mono">
              <span className="lbl">Green Corridor</span>
              <strong className="text-success">ACTIVE</strong>
            </div>
          </div>
        </div>

        {/* System logs confirmation footer */}
        <div className="completed-system-footer">
          <div className="sys-status">
            <ShieldCheck size={14} className="text-success" />
            <span className="font-mono">ITMS PROTOCOLS CLEARED // SIGNAL SEQUENCES RESET</span>
          </div>
          <div className="simulated-label font-mono">HACKATHON RESULTS SCREEN</div>
        </div>

        {/* Action control buttons */}
        <div className="completed-actions-row">
          <button 
            className="btn-completed-nav mission-v" 
            onClick={onViewMissionClick}
            aria-label="View live transit route map log details"
          >
            🗺 VIEW MISSION ROUTE
          </button>
          
          <button 
            className="btn-completed-nav analytics-v" 
            onClick={onViewAnalyticsClick}
            aria-label="View system-wide performance analytics dashboard"
          >
            📊 VIEW ANALYTICS
          </button>
          
          <button 
            className="btn-completed-nav reset-v" 
            onClick={onResetDemo}
            aria-label="Reset simulation to default dispatcher state"
          >
            🔄 RESET SIMULATION
          </button>
        </div>

      </div>
    </div>
  );
};

export default MissionCompletedPage;
