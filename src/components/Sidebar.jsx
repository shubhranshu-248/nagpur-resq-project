import React from "react";
import { 
  NAV_ITEMS 
} from "../data/mockData";
import { 
  X, 
  ShieldAlert, 
  Activity, 
  Radio, 
  LogOut, 
  HelpCircle, 
  ChevronRight,
  HeartHandshake,
  Navigation,
  Compass,
  Building2,
  Truck,
  Layers
} from "lucide-react";
import "./Sidebar.css";

// Helper icon resolver
const getNavIcon = (iconName, size = 18) => {
  switch (iconName) {
    case "LayoutDashboard": return <Activity size={size} />;
    case "AlertCircle": return <ShieldAlert size={size} />;
    case "PlusCircle": return <HeartHandshake size={size} />;
    case "Compass": return <Compass size={size} />;
    case "TrafficCone": return <Navigation size={size} />;
    case "Truck": return <Truck size={size} />;
    case "Hospital": return <Building2 size={size} />;
    case "BarChart2": return <Activity size={size} />;
    case "History": return <Layers size={size} />;
    case "Info": return <HelpCircle size={size} />;
    case "Terminal": return <Radio size={size} />;
    default: return <Activity size={size} />;
  }
};

const Sidebar = ({ 
  isOpen, 
  onClose, 
  activeView, 
  onViewChange, 
  activeMission,
  onLogout,
  onOpenAbout
}) => {
  const handleNavClick = (viewId) => {
    onViewChange(viewId);
    if (window.innerWidth <= 768) {
      onClose();
    }
  };

  return (
    <aside className={`sidebar-container ${isOpen ? "open" : ""}`}>
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="sidebar-brand-group">
          <span className="brand-symbol">🚨</span>
          <div>
            <h2 className="brand-name">NAGPUR RESQ</h2>
            <p className="brand-subtitle font-mono">COMMAND CENTRE</p>
          </div>
        </div>
        <button 
          className="btn-sidebar-close" 
          onClick={onClose} 
          aria-label="Close menu drawer"
        >
          <X size={18} />
        </button>
      </div>

      {/* Live Mission Quick Tracker Widget */}
      {activeMission && (
        <div 
          className="sidebar-active-mission-pill animate-fade"
          onClick={() => handleNavClick("mission")}
          title="Click to view live mission telemetry"
        >
          <div className="pill-top">
            <span className="pulse-dot"></span>
            <span className="mission-title font-mono">ACTIVE DISPATCH #{activeMission.id}</span>
          </div>
          <div className="pill-bottom">
            <span>Ambulance {activeMission.ambulance.id} ➔ {activeMission.telemetry.eta} ETA</span>
            <ChevronRight size={14} />
          </div>
        </div>
      )}

      {/* Navigation Links Grouped */}
      <nav className="sidebar-nav">
        <div className="nav-group-label font-mono">DISPATCH & OPERATIONS</div>
        {NAV_ITEMS.slice(0, 5).map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              className={`nav-link-btn ${isActive ? "active" : ""}`}
              onClick={() => handleNavClick(item.id)}
            >
              <div className="nav-icon-box">
                {getNavIcon(item.icon)}
              </div>
              <span className="nav-label">{item.label}</span>
              {item.id === "mission" && activeMission && (
                <span className="nav-badge live font-mono">LIVE</span>
              )}
            </button>
          );
        })}

        <div className="nav-group-label font-mono" style={{ marginTop: "12px" }}>
          TELEMETRY & FLEET
        </div>
        {NAV_ITEMS.slice(5, 10).map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              className={`nav-link-btn ${isActive ? "active" : ""}`}
              onClick={() => handleNavClick(item.id)}
            >
              <div className="nav-icon-box">
                {getNavIcon(item.icon)}
              </div>
              <span className="nav-label">{item.label}</span>
            </button>
          );
        })}

        <div className="nav-group-label font-mono" style={{ marginTop: "12px" }}>
          SYSTEM & RECORDS
        </div>
        {NAV_ITEMS.slice(10).map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              className={`nav-link-btn ${isActive ? "active" : ""}`}
              onClick={() => handleNavClick(item.id)}
            >
              <div className="nav-icon-box">
                {getNavIcon(item.icon)}
              </div>
              <span className="nav-label">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Controls */}
      <div className="sidebar-footer">
        <div className="sidebar-user-block">
          <div className="user-avatar font-mono">AD</div>
          <div className="user-info">
            <span className="user-name">Dispatcher Control</span>
            <span className="user-role font-mono">Sitabuldi ITMS Node</span>
          </div>
        </div>

        <div className="sidebar-footer-actions">
          {onOpenAbout && (
            <button 
              className="btn-sidebar-tool"
              onClick={() => {
                onOpenAbout();
                if (window.innerWidth <= 768) onClose();
              }}
              title="About Nagpur RESQ Platform"
            >
              <HelpCircle size={15} />
              <span>About</span>
            </button>
          )}

          <button 
            className="btn-sidebar-tool logout"
            onClick={onLogout}
            title="Log out and return to role gateway"
          >
            <LogOut size={15} />
            <span>Exit</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
