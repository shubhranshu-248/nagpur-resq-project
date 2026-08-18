import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Play, 
  Pause, 
  RotateCcw, 
  Smartphone, 
  Monitor, 
  Truck, 
  Building2, 
  Radio, 
  ChevronRight, 
  HelpCircle, 
  Zap, 
  LogOut 
} from "lucide-react";
import "./SimulationPanel.css";

const SimulationPanel = ({ onBackToHome, onLogout, onOpenAbout, showToast }) => {
  const [currentStep, setCurrentStep] = useState(1); // 1: Citizen, 2: Dispatcher, 3: Driver, 4: Hospital, 5: Summary
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const stepsData = [
    {
      id: 1,
      role: "Citizen Portal",
      title: "Citizen SOS Report & Triage",
      icon: <Smartphone size={18} className="text-critical" />,
      desc: "Distressed citizen at Sitabuldi triggers emergency alert. GPS coordinates locked (21.1458° N, 79.0882° E). Severity categorized as CRITICAL road accident.",
      kpis: { location: "Sitabuldi Metro", severity: "CRITICAL", patients: "1 Person", needs: "Trauma, ICU, O2" }
    },
    {
      id: 2,
      role: "Admin Command Centre",
      title: "AI Medical Matching & Corridor Generation",
      icon: <Monitor size={18} className="text-primary" />,
      desc: "Central Dispatcher AI scores fleet suitability (98/100). Dispatches ALS Ambulance A-104. Rerouting algorithms compute Route V1 along Wardha Road.",
      kpis: { unit: "A-104 (ALS)", suitability: "98% Score", destination: "GMC Hospital", eta: "08:42 mins" }
    },
    {
      id: 3,
      role: "Ambulance Driver",
      title: "Driver In-Cab Transit & Green Corridor",
      icon: <Truck size={18} className="text-warning" />,
      desc: "Driver Rahul Patil starts unit A-104. Approaching intersections automatically override to GREEN. Route V2 bypass bypasses congestion on Congress Nagar.",
      kpis: { speed: "62 km/h", corridor: "ACTIVE OVERRIDE", passedSignals: "4 Crossings", reroute: "Route V2 Bypass" }
    },
    {
      id: 4,
      role: "Hospital Trauma",
      title: "GMC Hospital Pre-Alert & Bed Reservation",
      icon: <Building2 size={18} className="text-success" />,
      desc: "GMC Emergency reception receives incoming patient telemetry countdown. Trauma team pre-activates and locks ICU Bed #04 in advance.",
      kpis: { beds: "ICU Bed #04 Locked", surgicalTeam: "Dr. Kulkarni Ready", oxygen: "100% Secured", handover: "CONFIRMED" }
    },
    {
      id: 5,
      role: "Performance Audit",
      title: "Mission Debrief & Time Saved Analysis",
      icon: <Zap size={18} className="text-warning" />,
      desc: "Mission completed in 12:21 mins vs 18:42 mins baseline. Recovered 06:21 critical minutes through ITMS Green Corridor orchestration.",
      kpis: { totalTime: "12:21 mins", baseline: "18:42 mins", timeSaved: "06:21 mins (34%)", result: "PATIENT SURVIVED" }
    }
  ];

  // Auto progression timer when playing
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setElapsedSeconds((prev) => {
        const next = prev + 1;
        if (next % 6 === 0) {
          setCurrentStep((s) => {
            if (s >= 5) {
              setIsPlaying(false);
              return 5;
            }
            return s + 1;
          });
        }
        return next;
      });
    }, 1000 / speed);

    return () => clearInterval(interval);
  }, [isPlaying, speed]);

  const handleStepClick = (stepId) => {
    setCurrentStep(stepId);
    if (showToast) {
      showToast(`Simulation moved to Step ${stepId}: ${stepsData[stepId - 1].role}`, "info");
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(1);
    setElapsedSeconds(0);
    if (showToast) {
      showToast("Simulation timeline reset to Step 1.", "success");
    }
  };

  const activeStepObj = stepsData[currentStep - 1];

  return (
    <div className="simulation-page-wrapper animate-fade">
      
      {/* Top Header Controls */}
      <div className="sim-top-nav-bar">
        <div className="nav-left">
          <button className="btn-sim-back font-mono" onClick={onLogout || onBackToHome}>
            <LogOut size={14} />
            <span>LOGOUT / EXIT</span>
          </button>
          
          <div className="sim-brand-pill font-mono">
            <Sparkles size={14} className="text-warning animate-pulse-slow" />
            <span>VIKASIT NAGPUR 2026 // MULTI-PORTAL PRESENTATION</span>
          </div>
        </div>

        <div className="nav-right">
          {onOpenAbout && (
            <button className="btn-sim-tool font-mono" onClick={onOpenAbout}>
              <HelpCircle size={14} />
              <span>ABOUT</span>
            </button>
          )}

          <div className="sim-ctrl-group font-mono">
            {!isPlaying ? (
              <button className="btn-sim-play" onClick={() => setIsPlaying(true)}>
                <Play size={13} fill="currentColor" />
                <span>AUTO PLAY</span>
              </button>
            ) : (
              <button className="btn-sim-pause" onClick={() => setIsPlaying(false)}>
                <Pause size={13} fill="currentColor" />
                <span>PAUSE</span>
              </button>
            )}

            <button className="btn-sim-reset" onClick={handleReset}>
              <RotateCcw size={13} />
            </button>

            <div className="speed-selector">
              <button className={speed === 1 ? "active" : ""} onClick={() => setSpeed(1)}>1x</button>
              <button className={speed === 2 ? "active" : ""} onClick={() => setSpeed(2)}>2x</button>
              <button className={speed === 4 ? "active" : ""} onClick={() => setSpeed(4)}>4x</button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Presentation Layout */}
      <div className="sim-main-container">
        
        {/* Step Flow Nodes (Horizontal Timeline) */}
        <div className="sim-timeline-flow font-mono">
          {stepsData.map((s) => {
            const isDone = s.id < currentStep;
            const isCurrent = s.id === currentStep;

            return (
              <button 
                key={s.id} 
                className={`timeline-step-btn ${isCurrent ? "current" : isDone ? "done" : ""}`}
                onClick={() => handleStepClick(s.id)}
              >
                <div className="step-badge">
                  {isDone ? "✓" : s.id}
                </div>
                <div className="step-label-group">
                  <span className="step-role">{s.role}</span>
                  <span className="step-title-short">{s.title.slice(0, 18)}...</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Dynamic Presentation Canvas for Active Step */}
        <div className="sim-presentation-card">
          
          <div className="sim-card-header">
            <div className="role-headline-wrap">
              <div className="role-icon-box">
                {activeStepObj.icon}
              </div>
              <div>
                <span className="step-index-tag font-mono">PHASE {activeStepObj.id} OF 5 // {activeStepObj.role.toUpperCase()}</span>
                <h2 className="step-main-title">{activeStepObj.title}</h2>
              </div>
            </div>

            <div className="step-status-tag font-mono">
              <span className="dot animate-pulse-slow"></span>
              <span>SYNCHRONIZED STATE</span>
            </div>
          </div>

          <div className="sim-card-body">
            <p className="step-narrative-text font-sans">
              {activeStepObj.desc}
            </p>

            {/* KPI Data Grid for current step */}
            <div className="step-kpi-grid">
              {Object.entries(activeStepObj.kpis).map(([k, v]) => (
                <div key={k} className="kpi-mini-box">
                  <span className="kpi-lbl font-mono">{k.toUpperCase()}</span>
                  <strong className="kpi-val font-mono">{v}</strong>
                </div>
              ))}
            </div>

            {/* Live Municipal Telemetry Feed for Step */}
            <div className="sim-terminal-feed font-mono">
              <div className="feed-hdr">
                <Radio size={13} className="text-primary animate-pulse-slow" />
                <span>NAGPUR ITMS CENTRAL LOG STREAM</span>
              </div>
              <div className="feed-lines">
                <p className="line text-muted">[18:02:14] ITMS Gateway: Initialized Node Sitabuldi-GMC Route query...</p>
                <p className="line text-success">[18:03:02] AI Clinical Engine: Fleet Unit A-104 (ALS) locked for dispatch.</p>
                <p className="line text-warning">[18:04:12] ITMS Signals: Green Corridor override confirmed along Wardha Road.</p>
                <p className="line text-primary">[18:05:48] GMC Trauma Reception: Pre-alert acknowledged & ICU Bed #04 reserved.</p>
              </div>
            </div>
          </div>

          {/* Step Navigation Actions */}
          <div className="sim-card-footer">
            <button 
              className="btn-sim-nav secondary font-mono"
              disabled={currentStep === 1}
              onClick={() => handleStepClick(Math.max(1, currentStep - 1))}
            >
              PREVIOUS PHASE
            </button>

            <span className="step-counter-text font-mono">
              STAGE {currentStep} OF 5
            </span>

            <button 
              className="btn-sim-nav primary font-mono"
              disabled={currentStep === 5}
              onClick={() => handleStepClick(Math.min(5, currentStep + 1))}
            >
              <span>NEXT PHASE</span>
              <ChevronRight size={15} />
            </button>
          </div>

        </div>

      </div>

      {/* Footer */}
      <footer className="sim-footer font-mono">
        <span>NAGPUR RESQ // VIKASIT NAGPUR HACKATHON 2026 JURY DEMONSTRATION ENGINE</span>
      </footer>

    </div>
  );
};

export default SimulationPanel;
