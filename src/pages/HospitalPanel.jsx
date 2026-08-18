import React, { useState } from "react";
import { 
  Building2, 
  Bed, 
  Activity, 
  CheckCircle2, 
  Clock, 
  HelpCircle,
  Stethoscope,
  Plus,
  Minus,
  LogOut,
  Truck,
  AlertTriangle,
  Check
} from "lucide-react";
import { AMBULANCES } from "../data/mockData";
import MapSection from "../components/MapSection";
import "./HospitalPanel.css";

const HospitalPanel = ({ 
  activeMission, 
  pendingEmergency = null,
  driverIssue = null,
  onApproveEmergency,
  onAssignReplacementAmbulance,
  onConfirmReadiness, 
  onConfirmPatientReceived, 
  onJumpToDriver,
  onLogout, 
  onOpenAbout,
  showToast 
}) => {
  const [activeTab, setActiveTab] = useState("inbound"); // 'inbound', 'pending', 'readiness', 'history', 'analytics'
  const [icuBedsAvailable, setIcuBedsAvailable] = useState(4);
  const [traumaBedsAvailable, setTraumaBedsAvailable] = useState(2);
  const [oxygenStatus] = useState("100% SECURED");
  const [readinessConfirmed, setReadinessConfirmed] = useState(false);
  const [patientAdmitted, setPatientAdmitted] = useState(false);

  // Ambulance selection modal state for pending emergency or mechanical breakdown
  const [isSelectingAmbulance, setIsSelectingAmbulance] = useState(false);
  const [selectedAmbulanceForDispatch, setSelectedAmbulanceForDispatch] = useState(null);
  const [isReplacementMode, setIsReplacementMode] = useState(false);

  // Admission log state
  const [admissionLogs, setAdmissionLogs] = useState([
    { id: "RESQ-1042", type: "Road Accident Trauma", amb: "A-104 (ALS)", time: "12:21 mins", ward: "ICU Bed #02", status: "ADMITTED" },
    { id: "RESQ-1039", type: "Pediatric Distress", amb: "A-120 (Neonatal)", time: "08:12 mins", ward: "Pediatric ICU #01", status: "ADMITTED" },
    { id: "RESQ-1035", type: "Cardiac Failure", amb: "A-118 (Cardiac MCU)", time: "14:05 mins", ward: "Cardiac ICCU #04", status: "ADMITTED" }
  ]);

  const handleConfirmReadinessClick = () => {
    setReadinessConfirmed(true);
    if (onConfirmReadiness) {
      onConfirmReadiness();
    }
    if (showToast) {
      showToast("Trauma team readiness confirmed & ICU Bed #04 reserved!", "success");
    }
  };

  const handlePatientReceivedClick = () => {
    setPatientAdmitted(true);
    
    // Add to admission log
    const missionId = activeMission?.id || `RESQ-${Math.floor(1000 + Math.random() * 9000)}`;
    const newLogEntry = {
      id: missionId,
      type: activeMission?.emergency?.type || "Emergency Trauma",
      amb: `${activeMission?.ambulance?.id || "A-104"} (${activeMission?.ambulance?.type || "ALS"})`,
      time: activeMission?.telemetry?.eta ? "Just now" : "11:42 mins",
      ward: "Trauma ICU Bed #04",
      status: "ADMITTED"
    };
    setAdmissionLogs([newLogEntry, ...admissionLogs]);

    if (onConfirmPatientReceived) {
      onConfirmPatientReceived();
    }
    if (showToast) {
      showToast("Patient safely admitted to GMC Emergency Trauma Care.", "success");
    }
  };

  const handleOpenAmbulanceSelector = (isReplacement = false) => {
    setIsReplacementMode(isReplacement);
    setSelectedAmbulanceForDispatch(AMBULANCES[0]); // default to A-104 (ALS)
    setIsSelectingAmbulance(true);
  };

  const handleConfirmDispatchAmbulance = () => {
    if (!selectedAmbulanceForDispatch) {
      if (showToast) showToast("Please select an ambulance first.", "warning");
      return;
    }

    if (isReplacementMode) {
      if (onAssignReplacementAmbulance) {
        onAssignReplacementAmbulance(selectedAmbulanceForDispatch);
      }
      if (showToast) {
        showToast(`Replacement Ambulance ${selectedAmbulanceForDispatch.id} dispatched!`, "success");
      }
    } else {
      if (onApproveEmergency) {
        onApproveEmergency(selectedAmbulanceForDispatch);
      }
      if (showToast) {
        showToast(`Emergency Approved! Ambulance ${selectedAmbulanceForDispatch.id} dispatched with Green Corridor.`, "success");
      }
    }

    setIsSelectingAmbulance(false);
    setActiveTab("inbound");
  };

  // Determine if mechanical breakdown was reported by driver
  const isMechanicalBreakdown = driverIssue?.type?.toLowerCase().includes("mechanical") || driverIssue?.type?.toLowerCase().includes("defect");
  const isTrafficIssue = driverIssue && !isMechanicalBreakdown;

  return (
    <div className="hospital-portal-page animate-fade">
      
      {/* Top Floating Control Bar */}
      <div className="hospital-top-switch-bar">
        <div className="portal-badge-wrap font-mono">
          <span className="dot animate-pulse-slow"></span>
          <span>GOVERNMENT MEDICAL COLLEGE (GMC) // TRAUMA RECEPTION NODE</span>
        </div>

        <div className="portal-bar-actions">
          {onJumpToDriver && activeMission && (
            <button 
              className="btn-portal-utility font-mono desktop-only"
              onClick={onJumpToDriver}
              title="Jump to Ambulance Driver In-Cab Console"
              style={{ color: "var(--warning)", borderColor: "rgba(245, 158, 11, 0.4)" }}
            >
              <Truck size={14} />
              <span>DRIVER CONSOLE →</span>
            </button>
          )}

          {onOpenAbout && (
            <button 
              className="btn-portal-utility font-mono"
              onClick={onOpenAbout}
              title="About Nagpur Trauma Network"
            >
              <HelpCircle size={14} />
              <span>ABOUT</span>
            </button>
          )}

          {/* Logout Button */}
          {onLogout && (
            <button 
              className="btn-portal-utility logout font-mono" 
              onClick={onLogout}
              title="Log out of Hospital Reception Portal"
            >
              <LogOut size={14} />
              <span>LOGOUT</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Container */}
      <div className="hospital-main-container">
        <div className="hospital-content-layout">
          
          {/* Header Banner */}
          <div className="hospital-header-card">
            <div className="hosp-brand-group">
              <div className="hosp-avatar-icon">
                <Building2 size={24} className="text-success" />
              </div>
              <div>
                <h1 className="hosp-main-title">GMC HOSPITAL TRAUMA RECEPTION</h1>
                <p className="hosp-main-sub">Medical Square, Nagpur — Level 1 Apex Trauma Center</p>
              </div>
            </div>

            <div className="hosp-status-pill font-mono">
              <span className="dot online"></span>
              <span>RECEPTION LIVE // GREEN CORRIDOR SYNCED</span>
            </div>
          </div>

          {/* DRIVER HAZARD ALERT BANNERS */}
          {isMechanicalBreakdown && (
            <div className="anomaly-alert-card critical-flash animate-fade" style={{ margin: "0 0 10px 0" }}>
              <div className="alert-hdr">
                <AlertTriangle className="text-critical animate-pulse-slow" size={24} />
                <div>
                  <h4 className="text-critical font-mono">🚨 MECHANICAL BREAKDOWN REPORTED BY DRIVER</h4>
                  <p className="subtext">
                    Ambulance {activeMission?.ambulance?.id || "A-104"} reported vehicle failure: "{driverIssue?.notes || "Engine defect"}". 
                    <strong> Hospital is authorized to assign a new replacement ambulance!</strong>
                  </p>
                </div>
              </div>
              <div className="recalc-stats font-mono" style={{ justifyContent: "flex-end" }}>
                <button 
                  className="btn-submit-flow font-mono"
                  style={{ backgroundColor: "var(--critical)", color: "white" }}
                  onClick={() => handleOpenAmbulanceSelector(true)}
                >
                  <Truck size={14} />
                  <span>ASSIGN REPLACEMENT AMBULANCE NOW</span>
                </button>
              </div>
            </div>
          )}

          {isTrafficIssue && (
            <div className="anomaly-alert-card warning-flash animate-fade" style={{ margin: "0 0 10px 0" }}>
              <div className="alert-hdr">
                <AlertTriangle className="text-warning animate-pulse-slow" size={24} />
                <div>
                  <h4 className="text-warning font-mono">⚠️ TRAFFIC CONGESTION REPORTED BY DRIVER</h4>
                  <p className="subtext">
                    Driver reported: "{driverIssue?.type} — {driverIssue?.notes || "Road bottleneck"}". 
                    <strong> Note: Rerouting to Route V2 Bypass is automatically in effect. Vehicle reassignment is not permitted for traffic delays.</strong>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* PENDING CITIZEN EMERGENCY ALERT BANNER (If not yet approved) */}
          {pendingEmergency && !activeMission && (
            <div className="anomaly-alert-card critical-flash animate-fade" style={{ margin: "0 0 10px 0", borderLeft: "4px solid var(--critical)" }}>
              <div className="alert-hdr">
                <AlertTriangle className="text-critical animate-pulse-slow" size={26} />
                <div>
                  <h4 className="text-critical font-mono">🚨 INCOMING EMERGENCY SOS — PENDING HOSPITAL APPROVAL</h4>
                  <p className="subtext">
                    Incident #{pendingEmergency.id} at <strong>{pendingEmergency.location}</strong> ({pendingEmergency.type} - {pendingEmergency.severity}).
                  </p>
                </div>
              </div>

              <div className="patient-triage-panel" style={{ marginTop: "10px" }}>
                <div className="triage-type-row">
                  <span className="type-tag text-critical font-mono">{pendingEmergency.type}</span>
                  <span className="sector-tag font-mono">📍 {pendingEmergency.location} ({pendingEmergency.latitude?.toFixed(4)}° N, {pendingEmergency.longitude?.toFixed(4)}° E)</span>
                </div>
                <p className="clinical-notes">{pendingEmergency.notes}</p>
                <div className="reqs-row">
                  <span className="font-mono text-muted">REQUIRED GEAR:</span>
                  <div className="req-pills">
                    {pendingEmergency.requirements?.map((r) => (
                      <span key={r} className="req-pill font-mono">✓ {r}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="recalc-stats font-mono" style={{ justifyContent: "flex-end", marginTop: "12px" }}>
                <button 
                  className="btn-hosp-action confirm font-mono"
                  style={{ width: "auto", padding: "10px 20px" }}
                  onClick={() => handleOpenAmbulanceSelector(false)}
                >
                  <CheckCircle2 size={16} />
                  <span>APPROVE EMERGENCY & CHOOSE NEAREST AMBULANCE</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab Navigation Pills */}
          <div className="hospital-tab-pills font-mono">
            <button 
              className={`tab-pill ${activeTab === "inbound" ? "active" : ""}`}
              onClick={() => setActiveTab("inbound")}
            >
              🚨 {activeMission ? "INBOUND AMBULANCE (1 ACTIVE)" : "INBOUND RADAR"}
            </button>

            <button 
              className={`tab-pill ${activeTab === "readiness" ? "active" : ""}`}
              onClick={() => setActiveTab("readiness")}
            >
              🏥 TRAUMA ROOM & ICU CAPACITY
            </button>

            <button 
              className={`tab-pill ${activeTab === "history" ? "active" : ""}`}
              onClick={() => setActiveTab("history")}
            >
              📋 ADMISSION LOGS ({admissionLogs.length})
            </button>

            <button 
              className={`tab-pill ${activeTab === "analytics" ? "active" : ""}`}
              onClick={() => setActiveTab("analytics")}
            >
              📊 HOSPITAL ANALYTICS
            </button>
          </div>

          {/* TAB 1: INBOUND AMBULANCES */}
          {activeTab === "inbound" && (
            <div className="hospital-tab-body animate-fade">
              
              {activeMission ? (
                /* Inbound Alert Hero Card */
                <div className="inbound-hero-card">
                  <div className="inbound-hero-header">
                    <div className="badge-critical font-mono">
                      <span className="dot pulse-circle"></span>
                      <span>INCOMING CRITICAL TRANSIT #{activeMission.id}</span>
                    </div>
                    <span className="font-mono text-muted">Ambulance: {activeMission.ambulance?.id} ({activeMission.ambulance?.type})</span>
                  </div>

                  <div className="inbound-grid-metrics">
                    {/* Countdown Big Box */}
                    <div className="eta-countdown-box">
                      <Clock size={28} className="text-warning animate-pulse-slow" />
                      <div className="countdown-text">
                        <span className="countdown-val font-mono text-warning">
                          {activeMission.telemetry?.eta || "07:18"}
                        </span>
                        <span className="countdown-lbl font-mono">ESTIMATED ARRIVAL AT GMC GATE</span>
                      </div>
                    </div>

                    {/* Telemetry info */}
                    <div className="inbound-telemetry-summary">
                      <div className="summary-item font-mono">
                        <span className="lbl">TRANSIT DISTANCE:</span>
                        <strong className="val">{activeMission.telemetry?.distance || "4.8"} km remaining</strong>
                      </div>
                      <div className="summary-item font-mono">
                        <span className="lbl">CORRIDOR STATUS:</span>
                        <strong className="val text-success">🟢 ITMS Green Corridor: Active by Default</strong>
                      </div>
                      <div className="summary-item font-mono">
                        <span className="lbl">PARAMEDIC CONTACT:</span>
                        <strong className="val">{activeMission.ambulance?.driver || "Sanjay Deshmukh"} ({activeMission.ambulance?.contact || "+91 98231 10004"})</strong>
                      </div>
                    </div>
                  </div>

                  {/* Patient Triage Details */}
                  <div className="patient-triage-panel">
                    <h4 className="font-mono">PATIENT CLINICAL TRIAGE REPORT:</h4>
                    <div className="triage-type-row">
                      <span className="type-tag text-critical font-mono">{activeMission.emergency?.type}</span>
                      <span className="sector-tag font-mono">📍 {activeMission.emergency?.location}</span>
                    </div>
                    <p className="clinical-notes">{activeMission.emergency?.notes}</p>

                    <div className="reqs-row">
                      <span className="font-mono text-muted">MANDATORY PRE-REQUISITES:</span>
                      <div className="req-pills">
                        {activeMission.emergency?.requirements?.map((r) => (
                          <span key={r} className="req-pill font-mono">✓ {r}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action Confirmation Bar */}
                  <div className="hospital-actions-bar">
                    {!readinessConfirmed ? (
                      <button 
                        className="btn-hosp-action confirm font-mono"
                        onClick={handleConfirmReadinessClick}
                      >
                        <CheckCircle2 size={18} />
                        <span>CONFIRM TRAUMA READINESS & LOCK ICU BED #04</span>
                      </button>
                    ) : !patientAdmitted ? (
                      <button 
                        className="btn-hosp-action receive font-mono"
                        onClick={handlePatientReceivedClick}
                      >
                        <Stethoscope size={18} />
                        <span>✓ CONFIRM PATIENT ARRIVAL & CLINICAL HANDOVER</span>
                      </button>
                    ) : (
                      <div className="hosp-admitted-banner font-mono">
                        <CheckCircle2 size={20} className="text-success" />
                        <span>✓ PATIENT SAFELY ADMITTED TO GMC TRAUMA WARD</span>
                      </div>
                    )}
                  </div>

                </div>
              ) : (
                <div className="section-panel font-mono" style={{ padding: "28px 20px", textAlign: "center", marginBottom: "16px" }}>
                  <Building2 size={32} className="text-muted" style={{ margin: "0 auto 10px" }} />
                  <h3 style={{ fontSize: "1rem" }}>HOSPITAL TRAUMA RECEPTION STANDBY</h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.75rem", maxWidth: "480px", margin: "6px auto 0" }}>
                    GMCH Apex Trauma Center is connected to the ITMS Green Wave grid. Live telemetry and incoming ambulance countdown will activate automatically when a dispatch starts.
                  </p>
                </div>
              )}

              {/* LIVE RADAR MAP SECTION FOR HOSPITAL DESK */}
              <div className="hospital-live-map-section" style={{ marginTop: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }} className="font-mono">
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", fontWeight: "800" }}>
                    <span className="dot online"></span>
                    <span>LIVE INBOUND AMBULANCE RADAR MAP // GMCH APEX TRAUMA</span>
                  </div>
                  <span className="text-success" style={{ fontSize: "0.68rem" }}>🟢 GREEN CORRIDOR SYNCED BY DEFAULT</span>
                </div>
                <MapSection activeMission={activeMission} />
              </div>

            </div>
          )}

          {/* TAB 2: CAPACITY & BED MANAGEMENT */}
          {activeTab === "readiness" && (
            <div className="hospital-tab-body animate-fade">
              <div className="capacity-grid-cards">
                {/* ICU Beds Stepper Card */}
                <div className="capacity-manage-card">
                  <div className="cap-hdr">
                    <Bed size={20} className="text-primary" />
                    <div>
                      <h3 className="font-mono">ICU CRITICAL BEDS</h3>
                      <span className="sub">Ventilator & multi-parameter equipped</span>
                    </div>
                  </div>

                  <div className="stepper-counter-row">
                    <button 
                      className="btn-stepper"
                      onClick={() => setIcuBedsAvailable(Math.max(0, icuBedsAvailable - 1))}
                    >
                      <Minus size={16} />
                    </button>
                    <div className="stepper-val font-mono">
                      <span className="num">{icuBedsAvailable}</span>
                      <span className="total">/ 08 VACANT</span>
                    </div>
                    <button 
                      className="btn-stepper"
                      onClick={() => setIcuBedsAvailable(Math.min(8, icuBedsAvailable + 1))}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {/* Trauma Emergency Beds Card */}
                <div className="capacity-manage-card">
                  <div className="cap-hdr">
                    <Activity size={20} className="text-critical" />
                    <div>
                      <h3 className="font-mono">TRAUMA EMERGENCY BAYS</h3>
                      <span className="sub">Immediate resuscitation bay</span>
                    </div>
                  </div>

                  <div className="stepper-counter-row">
                    <button 
                      className="btn-stepper"
                      onClick={() => setTraumaBedsAvailable(Math.max(0, traumaBedsAvailable - 1))}
                    >
                      <Minus size={16} />
                    </button>
                    <div className="stepper-val font-mono">
                      <span className="num">{traumaBedsAvailable}</span>
                      <span className="total">/ 04 VACANT</span>
                    </div>
                    <button 
                      className="btn-stepper"
                      onClick={() => setTraumaBedsAvailable(Math.min(4, traumaBedsAvailable + 1))}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Oxygen & Infrastructure */}
              <div className="infra-status-panel font-mono">
                <div className="infra-row">
                  <span>CENTRAL OXYGEN PIPELINE PRESSURE:</span>
                  <strong className="text-success">{oxygenStatus}</strong>
                </div>
                <div className="infra-row">
                  <span>ON-DUTY SURGICAL TEAM:</span>
                  <strong>DR. RAJESH SWARNKAR (Apex Trauma Chief)</strong>
                </div>
                <div className="infra-row">
                  <span>BLOOD BANK O-NEGATIVE UNITS:</span>
                  <strong>14 UNITS READY</strong>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ADMISSION LOGS */}
          {activeTab === "history" && (
            <div className="hospital-tab-body animate-fade">
              <div className="admission-logs-table-wrap">
                <table className="admission-logs-table font-mono">
                  <thead>
                    <tr>
                      <th>DISPATCH ID</th>
                      <th>EMERGENCY TYPE</th>
                      <th>AMBULANCE</th>
                      <th>ADMISSION WARD</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admissionLogs.map((log, idx) => (
                      <tr key={idx}>
                        <td>#{log.id}</td>
                        <td>{log.type}</td>
                        <td>{log.amb}</td>
                        <td>{log.ward}</td>
                        <td><span className="badge-admitted">✓ {log.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: HOSPITAL PERFORMANCE ANALYTICS */}
          {activeTab === "analytics" && (
            <div className="hospital-tab-body animate-fade">
              <div className="capacity-grid-cards">
                <div className="capacity-manage-card">
                  <span className="lbl font-mono">TOTAL EMERGENCY ADMISSIONS TODAY</span>
                  <strong className="num font-mono text-primary" style={{ fontSize: "1.8rem" }}>28 Patients</strong>
                  <span className="sub font-mono">100% successful clinical pre-alert reception</span>
                </div>
                <div className="capacity-manage-card">
                  <span className="lbl font-mono">AVERAGE PRE-ALERT LEAD TIME</span>
                  <strong className="num font-mono text-success" style={{ fontSize: "1.8rem" }}>07:18 mins</strong>
                  <span className="sub font-mono">Allows surgical prep before ambulance arrives</span>
                </div>
              </div>

              <div className="infra-status-panel font-mono">
                <div className="infra-row">
                  <span>TRAUMA VS CARDIAC ADMISSIONS:</span>
                  <strong>62% Trauma / 38% Cardiac</strong>
                </div>
                <div className="infra-row">
                  <span>GREEN CORRIDOR ARRIVAL TIME REDUCTION:</span>
                  <strong className="text-success">-34% Average Minutes Saved</strong>
                </div>
                <div className="infra-row">
                  <span>ICU ADMISSION TIME TO TREATMENT:</span>
                  <strong>&lt; 3.2 Minutes from ambulance bay</strong>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* AMBULANCE SELECTION MODAL (For Step 2 Approval or Step 4 Replacement) */}
      {isSelectingAmbulance && (
        <div className="mission-modal-overlay animate-fade" onClick={() => setIsSelectingAmbulance(false)}>
          <div className="mission-modal animate-fade" style={{ maxWidth: "680px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <Truck size={20} className="text-primary" />
                <h3 className="font-mono">
                  {isReplacementMode ? "ASSIGN REPLACEMENT AMBULANCE" : "CHOOSE NEAREST SUITABLE AMBULANCE"}
                </h3>
              </div>
              <button className="modal-close" onClick={() => setIsSelectingAmbulance(false)}>✕</button>
            </div>

            <div className="modal-body">
              <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "14px" }}>
                Select an ambulance from the Nagpur fleet ranked by proximity and medical capabilities:
              </p>

              <div className="ranked-list" style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "360px", overflowY: "auto" }}>
                {AMBULANCES.map((amb) => {
                  const isSelected = selectedAmbulanceForDispatch?.id === amb.id;
                  const isBusy = amb.status === "TRANSPORTING";

                  return (
                    <div 
                      key={amb.id}
                      className={`ranked-item-row ${isSelected ? "selected" : ""} ${isBusy ? "disabled" : ""}`}
                      onClick={() => !isBusy && setSelectedAmbulanceForDispatch(amb)}
                      style={{
                        padding: "12px 14px",
                        backgroundColor: isSelected ? "rgba(59, 130, 246, 0.15)" : "var(--bg-card-inner)",
                        border: isSelected ? "2px solid var(--primary)" : "1px solid var(--panel-border)",
                        borderRadius: "8px",
                        cursor: isBusy ? "not-allowed" : "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span className="font-mono" style={{ fontWeight: "800", color: "var(--text-light)" }}>{amb.id}</span>
                          <span className={`card-badge-type ${amb.type.toLowerCase()}`} style={{ fontSize: "0.62rem", padding: "2px 6px" }}>{amb.type}</span>
                          <span className="font-mono" style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>{amb.typeName}</span>
                        </div>
                        <div className="font-mono" style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>
                          <span>Dist: <strong>{amb.distance}</strong></span> • <span>ETA: <strong>{amb.eta}</strong></span> • <span>Base: {amb.baseLocation}</span>
                        </div>
                        <div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>
                          Equipped: {amb.equipment.slice(0, 3).join(", ")}
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div className="font-mono" style={{ textAlign: "right" }}>
                          <span style={{ fontSize: "0.75rem", fontWeight: "800", color: amb.score > 80 ? "var(--success)" : "var(--warning)" }}>
                            Score: {amb.score}/100
                          </span>
                        </div>
                        <input 
                          type="radio" 
                          name="amb-select" 
                          checked={isSelected} 
                          onChange={() => setSelectedAmbulanceForDispatch(amb)}
                          disabled={isBusy}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="modal-footer" style={{ display: "flex", justifyContent: "space-between" }}>
              <button className="btn-close-modal font-mono" onClick={() => setIsSelectingAmbulance(false)}>
                CANCEL
              </button>
              <button 
                className="btn-submit-flow font-mono" 
                style={{ backgroundColor: "var(--success)", color: "#060D18", padding: "8px 18px" }}
                onClick={handleConfirmDispatchAmbulance}
              >
                <Check size={14} />
                <span>CONFIRM & DISPATCH {selectedAmbulanceForDispatch?.id}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="hospital-portal-footer font-mono">
        <span>NAGPUR RESQ HOSPITAL RECEPTION INTERFACE // VIKASIT NAGPUR 2026</span>
      </footer>

    </div>
  );
};

export default HospitalPanel;
