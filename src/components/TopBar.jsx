import React, { useState } from "react";
import { 
  Menu, 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  HelpCircle, 
  Sun, 
  Moon,
  LogOut
} from "lucide-react";
import { DEMO_STEPS } from "../utils/simulation";
import "./TopBar.css";

const TopBar = ({ 
  onMenuToggle, 
  currentView,
  isDemoActive,
  demoStepIndex,
  demoElapsedTime,
  onStartDemo,
  onPauseDemo,
  onResetDemo,
  demoSpeed,
  onSetDemoSpeed,
  onOpenAbout,
  onLogout,
  isDarkMode,
  onToggleTheme
}) => {
  const [showDemoControlsMobile, setShowDemoControlsMobile] = useState(false);
  const activeStep = DEMO_STEPS[demoStepIndex] || DEMO_STEPS[0];

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getPageTitle = (view) => {
    switch (view) {
      case "dashboard": return "Command Control Dashboard";
      case "emergencies": return "Emergency Triage & Dispatches";
      case "new-emergency": return "AI Medical Dispatch Wizard";
      case "mission": return "Live Route Telemetry & Mission Control";
      case "corridor": return "ITMS Green Corridor Signal Board";
      case "driver": return "Ambulance Driver In-Cab Console";
      case "operator": return "ITMS Traffic Interception Terminal";
      case "analytics": return "Response Performance Auditing";
      case "history": return "Mission Archives & Records";
      case "completed": return "Mission Completion & Debrief";
      case "about": return "About Nagpur RESQ Platform";
      case "ambulances": return "Fleet Telemetry & Status";
      case "hospitals": return "Trauma Centers & ICU Capacity";
      default: return "Command Centre";
    }
  };

  return (
    <header className="topbar-wrapper">
      <div className="topbar-inner">
        {/* Left Side: Mobile Menu Hamburger & Page Title */}
        <div className="topbar-left">
          <button 
            className="btn-hamburger" 
            onClick={onMenuToggle}
            aria-label="Toggle navigation menu"
          >
            <Menu size={20} />
          </button>
          
          <div className="topbar-title-group">
            <h1 className="topbar-page-title">{getPageTitle(currentView)}</h1>
            <div className="topbar-live-tag">
              <span className="dot animate-pulse-slow"></span>
              <span className="tag-text font-mono">ITMS LIVE</span>
            </div>
          </div>
        </div>

        {/* Center: Docked 180s Automated Demo Controller (Desktop & Tablet) */}
        <div className="topbar-demo-controller desktop-only">
          <div className="demo-step-badge font-mono">
            <Sparkles size={13} className="text-warning animate-pulse-slow" />
            <span className="step-num">STEP {activeStep.id}/5:</span>
            <span className="step-name">{activeStep.title}</span>
            <span className="demo-timer">[{formatTime(demoElapsedTime)}/03:00]</span>
          </div>

          <div className="demo-actions">
            {!isDemoActive ? (
              <button 
                className="btn-demo-ctrl start font-mono" 
                onClick={onStartDemo}
                title="Start automated 180s scenario demo"
              >
                <Play size={13} fill="currentColor" />
                <span>DEMO</span>
              </button>
            ) : (
              <button 
                className="btn-demo-ctrl pause font-mono" 
                onClick={onPauseDemo}
                title="Pause automated simulation"
              >
                <Pause size={13} fill="currentColor" />
                <span>PAUSE</span>
              </button>
            )}

            <button 
              className="btn-demo-ctrl reset font-mono" 
              onClick={onResetDemo}
              title="Reset simulation to default state"
            >
              <RotateCcw size={13} />
            </button>

            <div className="demo-speed-pills font-mono">
              <button 
                className={`speed-pill ${demoSpeed === 1 ? "active" : ""}`}
                onClick={() => onSetDemoSpeed(1)}
              >
                1x
              </button>
              <button 
                className={`speed-pill ${demoSpeed === 2 ? "active" : ""}`}
                onClick={() => onSetDemoSpeed(2)}
              >
                2x
              </button>
              <button 
                className={`speed-pill ${demoSpeed === 4 ? "active" : ""}`}
                onClick={() => onSetDemoSpeed(4)}
              >
                4x
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Action Utilities (Mobile Demo Toggle, About, Theme, Logout) */}
        <div className="topbar-right">
          {/* Mobile Demo Toggle Trigger */}
          <button 
            className={`btn-topbar-tool mobile-only ${showDemoControlsMobile ? "active" : ""}`}
            onClick={() => setShowDemoControlsMobile(!showDemoControlsMobile)}
            title="Toggle simulation demo controls"
          >
            <Sparkles size={16} className="text-warning" />
          </button>

          {/* About Dialog Button */}
          {onOpenAbout && (
            <button 
              className="btn-topbar-tool about font-mono"
              onClick={onOpenAbout}
              title="Learn about Nagpur RESQ Platform"
            >
              <HelpCircle size={15} />
              <span className="desktop-text">ABOUT</span>
            </button>
          )}

          {/* Theme Toggle */}
          <button 
            className="btn-topbar-tool theme font-mono"
            onClick={onToggleTheme}
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* Logout Button */}
          {onLogout && (
            <button 
              className="btn-topbar-tool logout font-mono"
              onClick={onLogout}
              title="Log out of Admin Command Centre"
            >
              <LogOut size={15} />
              <span className="desktop-text">LOGOUT</span>
            </button>
          )}
        </div>
      </div>

      {/* Collapsible Mobile Demo Stepper Ribbon */}
      {showDemoControlsMobile && (
        <div className="mobile-demo-ribbon animate-fade">
          <div className="ribbon-step-info font-mono">
            <span className="step-lbl">STEP {activeStep.id}/5: {activeStep.title}</span>
            <span className="step-timer font-mono">[{formatTime(demoElapsedTime)}]</span>
          </div>

          <div className="ribbon-ctrls-row">
            {!isDemoActive ? (
              <button className="btn-demo-ctrl start font-mono" onClick={onStartDemo}>
                <Play size={12} fill="currentColor" />
                <span>START DEMO</span>
              </button>
            ) : (
              <button className="btn-demo-ctrl pause font-mono" onClick={onPauseDemo}>
                <Pause size={12} fill="currentColor" />
                <span>PAUSE</span>
              </button>
            )}

            <button className="btn-demo-ctrl reset font-mono" onClick={onResetDemo}>
              <RotateCcw size={12} />
              <span>RESET</span>
            </button>

            <div className="demo-speed-pills font-mono">
              <button className={`speed-pill ${demoSpeed === 1 ? "active" : ""}`} onClick={() => onSetDemoSpeed(1)}>1x</button>
              <button className={`speed-pill ${demoSpeed === 2 ? "active" : ""}`} onClick={() => onSetDemoSpeed(2)}>2x</button>
              <button className={`speed-pill ${demoSpeed === 4 ? "active" : ""}`} onClick={() => onSetDemoSpeed(4)}>4x</button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default TopBar;
