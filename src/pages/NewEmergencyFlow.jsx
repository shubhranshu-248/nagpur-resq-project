import React, { useState, useEffect } from "react";
import { 
  Check, 
  Loader2, 
  BrainCircuit, 
  AlertTriangle, 
  Building2, 
  Truck, 
  ShieldAlert
} from "lucide-react";
import ExplainableDrawer from "../components/ExplainableDrawer";
import { AMBULANCES, HOSPITALS } from "../data/mockData";
import "./NewEmergencyFlow.css";

const NewEmergencyFlow = ({ 
  onCancel, 
  onStartMission, 
  showToast,
  preSelectedEmergency = null,
  demoStepOverride = null,
  demoDrawerOverride = false,
  demoAmbulanceOverride = null,
  demoHospitalOverride = null
}) => {
  const [step, setStep] = useState("form"); // form, loading, assessment, hospital, summary

  // Form State
  const [emergencyType, setEmergencyType] = useState("Road Accident");
  const [severity, setSeverity] = useState("Critical");
  const [patientCount, setPatientCount] = useState(1);
  const [location, setLocation] = useState("Sitabuldi");
  const [notes, setNotes] = useState("");
  const [requirements, setRequirements] = useState({
    Trauma: true,
    Oxygen: true,
    ICU: true,
    Ventilator: false,
    Cardiac: false
  });

  // Pre-populate if starting dispatch on an existing citizen incident
  useEffect(() => {
    if (preSelectedEmergency) {
      setEmergencyType(preSelectedEmergency.type || "Road Accident");
      
      const severityStr = preSelectedEmergency.severity || "Critical";
      const formattedSeverity = severityStr.charAt(0).toUpperCase() + severityStr.slice(1).toLowerCase();
      setSeverity(formattedSeverity);
      
      setPatientCount(preSelectedEmergency.patients || 1);
      setLocation(preSelectedEmergency.location || "Sitabuldi");
      setNotes(preSelectedEmergency.notes || "");
      
      const reqList = preSelectedEmergency.requirements || [];
      setRequirements({
        Trauma: reqList.includes("Trauma"),
        Oxygen: reqList.includes("Oxygen"),
        ICU: reqList.includes("ICU"),
        Ventilator: reqList.includes("Ventilator"),
        Cardiac: reqList.includes("Cardiac")
      });
    }
  }, [preSelectedEmergency]);

  // Flow State
  const [loadingTicks, setLoadingTicks] = useState(0);
  const [selectedAmbulance, setSelectedAmbulance] = useState(null);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerAmbulance, setDrawerAmbulance] = useState(null);

  // Sync Demo Overrides
  useEffect(() => {
    if (demoStepOverride) {
      setStep(demoStepOverride);
    }
  }, [demoStepOverride]);

  useEffect(() => {
    if (demoDrawerOverride && demoAmbulanceOverride) {
      setDrawerAmbulance(demoAmbulanceOverride);
      setDrawerOpen(true);
    } else {
      setDrawerOpen(false);
    }
  }, [demoDrawerOverride, demoAmbulanceOverride]);

  useEffect(() => {
    if (demoAmbulanceOverride) {
      setSelectedAmbulance(demoAmbulanceOverride);
    }
  }, [demoAmbulanceOverride]);

  useEffect(() => {
    if (demoHospitalOverride) {
      setSelectedHospital(demoHospitalOverride);
    }
  }, [demoHospitalOverride]);

  // Loading Ticks effect
  useEffect(() => {
    if (step !== "loading") return;
    if (demoStepOverride) {
      setLoadingTicks(5);
      return;
    }

    const interval = setInterval(() => {
      setLoadingTicks((prev) => {
        if (prev >= 5) {
          clearInterval(interval);
          setTimeout(() => {
            setStep("assessment");
          }, 800);
          return 5;
        }
        return prev + 1;
      });
    }, 650);

    return () => clearInterval(interval);
  }, [step, demoStepOverride]);

  const handleCheckboxChange = (name) => {
    setRequirements((prev) => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!location.trim()) {
      alert("Please provide a valid sector location.");
      return;
    }
    setLoadingTicks(0);
    setStep("loading");
  };

  const handleAssignAmbulance = (amb) => {
    setSelectedAmbulance(amb);
    showToast(`Ambulance ${amb.id} assigned.`, "success");
    setStep("hospital");
  };

  const handleSelectHospital = (hosp) => {
    setSelectedHospital(hosp);
    setStep("summary");
  };

  const handleTriggerStartMission = () => {
    // Pack current data
    const activeReqs = Object.keys(requirements).filter(key => requirements[key]);
    const mockId = preSelectedEmergency ? preSelectedEmergency.id : `ER-${Math.floor(1000 + Math.random() * 9000)}`;
    
    const newIncident = {
      id: mockId,
      type: emergencyType,
      severity: severity.toUpperCase(),
      location: location,
      patients: parseInt(patientCount),
      requirements: activeReqs,
      status: "AMBULANCE EN ROUTE",
      timeReported: preSelectedEmergency ? preSelectedEmergency.timeReported : "Just now",
      notes: notes || "No additional notes provided."
    };

    onStartMission({
      emergency: newIncident,
      ambulance: selectedAmbulance,
      hospital: selectedHospital
    });
  };

  const handleOpenDrawer = (amb) => {
    setDrawerAmbulance(amb);
    setDrawerOpen(true);
  };

  // Get active requirements labels
  const getActiveReqLabels = () => {
    return Object.keys(requirements).filter(k => requirements[k]);
  };

  return (
    <div className="flow-viewport-container">
      {/* Wizard Steps indicator */}
      <div className="flow-wizard-steps">
        <div className={`wizard-step ${step === "form" ? "active" : ""} ${step !== "form" ? "completed" : ""}`}>
          <span className="step-badge">{step !== "form" ? <Check size={12} /> : "1"}</span>
          <span className="step-lbl">Incident Details</span>
        </div>
        <div className={`wizard-step ${step === "loading" ? "active" : ""} ${step === "assessment" || step === "hospital" || step === "summary" ? "completed" : ""}`}>
          <span className="step-badge">{step === "hospital" || step === "summary" ? <Check size={12} /> : "2"}</span>
          <span className="step-lbl">AI Assessment</span>
        </div>
        <div className={`wizard-step ${step === "hospital" ? "active" : ""} ${step === "summary" ? "completed" : ""}`}>
          <span className="step-badge">{step === "summary" ? <Check size={12} /> : "3"}</span>
          <span className="step-lbl">Hospital Routing</span>
        </div>
        <div className={`wizard-step ${step === "summary" ? "active" : ""}`}>
          <span className="step-badge">4</span>
          <span className="step-lbl">Start Mission</span>
        </div>
      </div>

      {/* RENDER STEP: FORM */}
      {step === "form" && (
        <div className="flow-card-panel animate-fade">
          <div className="flow-card-header">
            <h3 className="flow-card-title">
              <BrainCircuit className="text-primary-icon" size={18} />
              <span>Log Emergency Incident</span>
            </h3>
            <span className="simulated-label">DISPATCH OVERRIDE</span>
          </div>

          <form className="emergency-creation-form" onSubmit={handleFormSubmit}>
            <div className="form-row-grid">
              <div className="form-group-box">
                <label className="form-label">Emergency Type</label>
                <select 
                  className="form-select-field" 
                  value={emergencyType}
                  onChange={(e) => setEmergencyType(e.target.value)}
                >
                  <option value="Road Accident">Road Accident</option>
                  <option value="Cardiac Emergency">Cardiac Emergency</option>
                  <option value="Trauma">Trauma</option>
                  <option value="Fire Breakout">Fire Breakout</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group-box">
                <label className="form-label">Severity Level</label>
                <select 
                  className="form-select-field" 
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>

            <div className="form-row-grid">
              <div className="form-group-box">
                <label className="form-label">Patient Count</label>
                <input 
                  type="number" 
                  className="form-input-field" 
                  min="1" 
                  value={patientCount}
                  onChange={(e) => setPatientCount(e.target.value)}
                />
              </div>

              <div className="form-group-box">
                <label className="form-label">Location / Sector</label>
                <input 
                  type="text" 
                  className="form-input-field" 
                  placeholder="e.g. Sitabuldi"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group-box">
              <label className="form-label">Required Capabilities</label>
              <div className="checkbox-wrap-grid">
                {Object.keys(requirements).map((req) => (
                  <label key={req} className="checkbox-card-item">
                    <input 
                      type="checkbox" 
                      className="checkbox-input-hidden"
                      checked={requirements[req]}
                      onChange={() => handleCheckboxChange(req)}
                    />
                    <div className="checkbox-custom-box">
                      {requirements[req] && <Check size={10} />}
                    </div>
                    <span>{req} Support</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group-box">
              <label className="form-label">Additional Dispatch Notes</label>
              <textarea 
                className="form-textarea-field" 
                rows="3" 
                placeholder="Describe current vital parameters or accident severity..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="form-buttons-footer">
              <button type="button" className="btn-cancel-flow" onClick={onCancel}>
                CANCEL
              </button>
              <button type="submit" className="btn-submit-flow">
                CREATE EMERGENCY
              </button>
            </div>
          </form>
        </div>
      )}

      {/* RENDER STEP: LOADING ANALYSIS */}
      {step === "loading" && (
        <div className="flow-card-panel text-center animate-fade" style={{ padding: "40px" }}>
          <div className="ai-loader-pulsing">
            <Loader2 className="spinner-ai" size={48} />
            <BrainCircuit className="brain-overlay-icon" size={20} />
          </div>
          <h3 className="loading-headline">ANALYSING EMERGENCY</h3>
          <p className="loading-subline">Orchestrating Nagpur municipal network and clinical capacities...</p>

          <div className="loading-timeline-checks">
            <div className={`check-row ${loadingTicks >= 0 ? "tick" : ""}`}>
              <div className="dot-circle">{loadingTicks > 0 ? <Check size={10} /> : null}</div>
              <span>Location identified ({location})</span>
            </div>
            <div className={`check-row ${loadingTicks >= 1 ? "tick" : ""}`}>
              <div className="dot-circle">{loadingTicks > 1 ? <Check size={10} /> : null}</div>
              <span>Severity assessed ({severity.toUpperCase()})</span>
            </div>
            <div className={`check-row ${loadingTicks >= 2 ? "tick" : ""}`}>
              <div className="dot-circle">{loadingTicks > 2 ? <Check size={10} /> : null}</div>
              <span>Medical requirements identified ({getActiveReqLabels().join(", ")})</span>
            </div>
            <div className={`check-row ${loadingTicks >= 3 ? "tick" : ""}`}>
              <div className="dot-circle">{loadingTicks > 3 ? <Check size={10} /> : null}</div>
              <span>Available ambulances searched</span>
            </div>
            <div className={`check-row ${loadingTicks >= 4 ? "tick" : ""}`}>
              <div className="dot-circle">{loadingTicks > 4 ? <Check size={10} /> : null}</div>
              <span>Hospitals filtered</span>
            </div>
            <div className={`check-row active ${loadingTicks === 5 ? "pulse" : ""}`}>
              <div className="dot-circle"></div>
              <span>Calculating recommendation...</span>
            </div>
          </div>
        </div>
      )}

      {/* RENDER STEP: AI ASSESSMENT & AMBULANCE RANKING */}
      {step === "assessment" && (
        <div className="split-layout-flow animate-fade">
          {/* Left panel: AI Analysis Report */}
          <div className="flow-card-panel flex-1">
            <div className="flow-card-header">
              <h3 className="flow-card-title text-primary">
                <BrainCircuit size={18} />
                <span>AI ASSESSMENT</span>
              </h3>
              <span className="prototype-badge" style={{ backgroundColor: "rgba(168, 85, 247, 0.1)", color: "#A855F7", borderColor: "rgba(168, 85, 247, 0.2)" }}>
                CONFIDENCE: 94%
              </span>
            </div>

            <div className="assessment-report-body">
              <div className="report-box-grid">
                <div className="report-metric">
                  <span className="lbl">ASSESSED SEVERITY</span>
                  <span className="val text-critical font-bold">{severity.toUpperCase()}</span>
                </div>
                <div className="report-metric">
                  <span className="lbl">PATIENTS LOGGED</span>
                  <span className="val font-mono">{patientCount}</span>
                </div>
              </div>

              <div className="report-requirements">
                <span className="lbl-small">REQUIRED SUPPORT CAPABILITIES:</span>
                <div className="tags-container">
                  {getActiveReqLabels().map((req, i) => (
                    <span key={i} className="requirement-tag active">
                      {req.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>

              <div className="approval-warning-alert">
                <ShieldAlert size={16} className="text-warning-icon" />
                <span>AI RECOMMENDATION — DISPATCHER APPROVAL REQUIRED</span>
              </div>
            </div>
          </div>

          {/* Right panel: Ambulance ranking list */}
          <div className="flow-card-panel flex-2">
            <div className="flow-card-header">
              <h3 className="flow-card-title">
                <Truck size={18} />
                <span>Ranked Available Fleet</span>
              </h3>
              <span className="simulated-label">Score Ordered</span>
            </div>

            <div className="ranked-list">
              {AMBULANCES.map((amb) => {
                // Determine if this ambulance matches requirements
                // For demonstration: A-109 is BLS and lacks ICU. Let's explicitly trigger the rejection block for A-109
                const isRejected = amb.id === "A-109";
                const isTransporting = amb.status === "TRANSPORTING";

                return (
                  <div key={amb.id} className={`ranked-item-row ${isRejected ? "rejected" : ""} ${isTransporting ? "disabled" : ""}`}>
                    <div className="ranked-card-main">
                      <div className="card-column-details">
                        <div className="card-top-header">
                          <span className="card-badge-id font-mono">{amb.id}</span>
                          <span className={`card-badge-type ${amb.type === "ALS" ? "als" : "bls"}`}>{amb.type}</span>
                          {!isRejected && !isTransporting && (
                            <span className="score-badge-small font-mono">Score: {amb.score}/100</span>
                          )}
                        </div>

                        <div className="card-meta-line">
                          <span>ETA: <strong className="font-mono">{amb.eta}</strong></span>
                          <span className="divider-dot"></span>
                          <span>Dist: <strong className="font-mono">{amb.distance}</strong></span>
                        </div>

                        <div className="card-equipments">
                          <span>Equipped: </span>
                          <strong>{amb.equipment.slice(0, 3).join(" ✓ ")} ✓</strong>
                        </div>
                      </div>

                      {/* Controls */}
                      {!isRejected && !isTransporting ? (
                        <div className="card-actions">
                          <button 
                            type="button" 
                            className="btn-view-why"
                            onClick={() => handleOpenDrawer(amb)}
                          >
                            WHY {amb.id}?
                          </button>
                          <button 
                            type="button" 
                            className="btn-assign-amb"
                            onClick={() => handleAssignAmbulance(amb)}
                          >
                            ASSIGN
                          </button>
                        </div>
                      ) : isRejected ? (
                        <div className="rejection-alert-badge">
                          <div className="rejection-tag">
                            <AlertTriangle size={12} />
                            <span>NEAREST BUT NOT SUITABLE</span>
                          </div>
                          <span className="rejection-reason">{amb.rejectionReason}</span>
                          <span className="rejection-not">NOT RECOMMENDED</span>
                        </div>
                      ) : (
                        <div className="status-label-disabled">
                          <span>UNIT BUSY</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* RENDER STEP: HOSPITAL SELECTION */}
      {step === "hospital" && (
        <div className="flow-card-panel animate-fade">
          <div className="flow-card-header">
            <h3 className="flow-card-title">
              <Building2 className="text-primary-icon" size={18} />
              <span>Select Hospital Destination</span>
            </h3>
            <span className="simulated-label">Clinically Ranked</span>
          </div>

          <div className="ranked-list">
            {HOSPITALS.map((hosp) => {
              // Hospital B has trauma = false, let's reject it for trauma requests
              const isRejected = hosp.id === "H-203";

              return (
                <div key={hosp.id} className={`ranked-item-row ${isRejected ? "rejected" : ""}`}>
                  <div className="ranked-card-main">
                    <div className="card-column-details">
                      <div className="card-top-header">
                        <span className="card-name-label">{hosp.name}</span>
                        {!isRejected && (
                          <span className="match-badge font-mono">Clinical Match: {hosp.clinicalMatch}%</span>
                        )}
                      </div>

                      <div className="card-meta-line">
                        <span>ETA: <strong className="font-mono">{hosp.eta}</strong></span>
                        <span className="divider-dot"></span>
                        <span>Dist: <strong className="font-mono">{hosp.distance}</strong></span>
                        <span className="divider-dot"></span>
                        <span>Readiness: <strong style={{ color: hosp.color }}>{hosp.readiness}</strong></span>
                      </div>

                      <div className="card-equipments">
                        <span>Trauma: <strong>{hosp.trauma}</strong></span>
                        <span className="divider-dot"></span>
                        <span>Oxygen: <strong>{hosp.oxygen}</strong></span>
                        <span className="divider-dot"></span>
                        <span>ICU: <strong>{hosp.icuBeds}</strong></span>
                      </div>
                    </div>

                    {!isRejected ? (
                      <div className="card-actions">
                        <button 
                          className="btn-submit-flow" 
                          onClick={() => handleSelectHospital(hosp)}
                        >
                          SELECT HOSPITAL
                        </button>
                      </div>
                    ) : (
                      <div className="rejection-alert-badge">
                        <div className="rejection-tag">
                          <AlertTriangle size={12} />
                          <span>NOT RECOMMENDED</span>
                        </div>
                        <span className="rejection-reason">{hosp.rejectionReason}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* RENDER STEP: FINAL MISSION SUMMARY */}
      {step === "summary" && (
        <div className="flow-card-panel animate-fade" style={{ borderLeft: "4px solid var(--success)" }}>
          <div className="flow-card-header">
            <h3 className="flow-card-title text-success">
              <Check className="status-dot status-online animate-pulse-slow" size={16} />
              <span>Orchestration Summary</span>
            </h3>
            <span className="simulated-label text-success" style={{ backgroundColor: "rgba(34, 197, 94, 0.1)", borderColor: "rgba(34, 197, 94, 0.2)" }}>
              MISSION READY
            </span>
          </div>

          <div className="mission-summary-details">
            <div className="summary-section-box">
              <h4 className="summary-box-title">Incident Telemetry</h4>
              <div className="summary-meta-grid">
                <div className="summary-meta-item">
                  <span className="lbl">TYPE</span>
                  <span className="val text-critical">{emergencyType}</span>
                </div>
                <div className="summary-meta-item">
                  <span className="lbl">LOCATION</span>
                  <span className="val">{location}</span>
                </div>
                <div className="summary-meta-item">
                  <span className="lbl">SEVERITY</span>
                  <span className="val">{severity.toUpperCase()}</span>
                </div>
              </div>
            </div>

            <div className="split-summary-cards">
              {/* Ambulance selected */}
              <div className="summary-unit-card">
                <div className="unit-card-hdr">
                  <Truck size={14} className="text-primary-icon" />
                  <span>Ambulance Unit</span>
                </div>
                <div className="unit-card-body">
                  <span className="unit-id font-mono">{selectedAmbulance?.id}</span>
                  <span className="unit-type">{selectedAmbulance?.type} Support</span>
                  <span className="unit-meta">ETA: {selectedAmbulance?.eta}</span>
                </div>
              </div>

              {/* Hospital selected */}
              <div className="summary-unit-card">
                <div className="unit-card-hdr">
                  <Building2 size={14} className="text-success" />
                  <span>Hospital Destination</span>
                </div>
                <div className="unit-card-body">
                  <span className="unit-id font-sans" style={{ fontSize: "0.95rem" }}>{selectedHospital?.name}</span>
                  <span className="unit-type">Clinical Match: {selectedHospital?.clinicalMatch}%</span>
                  <span className="unit-meta">ETA: {selectedHospital?.eta}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="form-buttons-footer" style={{ borderTop: "1px solid var(--panel-border)", paddingTop: "20px" }}>
            <button className="btn-cancel-flow" onClick={() => setStep("hospital")}>
              BACK
            </button>
            <button className="btn-submit-flow" style={{ backgroundColor: "var(--success)" }} onClick={handleTriggerStartMission}>
              START MISSION
            </button>
          </div>
        </div>
      )}

      {/* Sliding Explainable AI Drawer */}
      <ExplainableDrawer 
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        ambulance={drawerAmbulance}
      />
    </div>
  );
};

export default NewEmergencyFlow;
