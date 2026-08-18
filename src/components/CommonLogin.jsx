import React, { useState } from "react";
import { 
  Smartphone, 
  Truck, 
  Building2, 
  Monitor, 
  ArrowLeft, 
  Lock, 
  User as UserIcon, 
  Sparkles, 
  Info,
  ChevronRight,
  Key,
  ShieldCheck,
  TrafficCone,
  Copy,
  Check
} from "lucide-react";
import { USER_CREDENTIALS } from "../data/mockData";
import "./CommonLogin.css";

const CommonLogin = ({ onLoginSuccess, onOpenAbout, showToast }) => {
  const [selectedRole, setSelectedRole] = useState(null); // null, 'driver', 'hospital', 'admin', 'traffic'
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [copiedKey, setCopiedKey] = useState(null);
  const [showCredentialsTable, setShowCredentialsTable] = useState(true);

  // Authenticated Portal Credentials Map
  const credentialsMap = {
    admin: { username: "admin", password: "admin123", label: "Admin Command Centre" },
    driver: { username: "driver", password: "driver123", label: "Ambulance Driver Portal" },
    hospital: { username: "hospital", password: "hospital123", label: "Hospital Reception Portal" },
    traffic: { username: "traffic", password: "traffic123", label: "ITMS Traffic Control" }
  };

  const handleRoleSelect = (role) => {
    if (role === "user") {
      // Direct frictionless emergency access for citizens — no login required
      if (showToast) {
        showToast("Accessing Citizen Emergency SOS Portal with live GPS...", "info");
      }
      onLoginSuccess({ role: "user", isAuthenticated: false });
    } else {
      setSelectedRole(role);
      const defaultCred = credentialsMap[role];
      if (defaultCred) {
        setUsername(defaultCred.username);
        setPassword(defaultCred.password);
      } else {
        setUsername("");
        setPassword("");
      }
      setErrorMessage("");
    }
  };

  const handleAutofill = (roleKey) => {
    setSelectedRole(roleKey);
    const cred = credentialsMap[roleKey];
    if (cred) {
      setUsername(cred.username);
      setPassword(cred.password);
      setErrorMessage("");
      if (showToast) {
        showToast(`Filled credentials for ${cred.label}`, "info");
      }
    }
  };

  const handleCopyCredentials = (u, p, key) => {
    navigator.clipboard?.writeText(`Username: ${u} | Password: ${p}`);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    if (showToast) {
      showToast(`Copied ${u}:${p} to clipboard!`, "success");
    }
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setErrorMessage("");

    const targetCreds = credentialsMap[selectedRole];
    // Check match against target role or any valid credential in USER_CREDENTIALS
    const matchedAccount = USER_CREDENTIALS.find(
      (c) => c.username === username.trim() && c.password === password.trim()
    );

    if ((targetCreds && username.trim() === targetCreds.username && password.trim() === targetCreds.password) || matchedAccount) {
      const activeRole = matchedAccount ? matchedAccount.role : selectedRole;
      if (showToast) {
        showToast(`Authenticated as ${username.toUpperCase()}. Welcome to Nagpur RESQ.`, "success");
      }
      onLoginSuccess({ role: activeRole === "traffic" ? "corridor" : activeRole, isAuthenticated: true, user: matchedAccount });
    } else {
      setErrorMessage("❌ Invalid username or password. Please verify credentials below and try again.");
    }
  };

  const handleBackToSelection = () => {
    setSelectedRole(null);
    setErrorMessage("");
  };

  if (!selectedRole) {
    return (
      <div className="login-wrapper animate-fade">
        <div className="login-card-container">
          
          {/* Header */}
          <div className="login-header-block">
            <div className="brand-badge-pill font-mono">
              <span className="dot animate-pulse-slow"></span>
              <span>VIKASIT NAGPUR 2026 // HACKATHON EDITION</span>
            </div>
            <div className="brand-title-wrap">
              <span className="brand-logo">🚨</span>
              <h1>NAGPUR RESQ</h1>
            </div>
            <p className="brand-tagline">AI-POWERED EMERGENCY RESPONSE & GREEN CORRIDOR ORCHESTRATION</p>
          </div>

          {/* Role Selection Section */}
          <div className="role-selection-section">
            <div className="selection-header-row">
              <div>
                <h2>SELECT ACCESS PORTAL</h2>
                <p className="selection-subtitle">Select your operating portal or click a role to enter</p>
              </div>
              {onOpenAbout && (
                <button 
                  className="btn-login-about font-mono"
                  onClick={onOpenAbout}
                  title="Learn more about Nagpur RESQ"
                >
                  <Info size={14} />
                  <span>ABOUT RESQ</span>
                </button>
              )}
            </div>

            <div className="role-grid">
              {/* CITIZEN PORTAL: 1-CLICK INSTANT ACCESS (NO LOGIN REQUIRED) */}
              <button className="role-btn-card citizen-card" onClick={() => handleRoleSelect("user")}>
                <div className="icon-wrapper user">
                  <Smartphone size={24} />
                </div>
                <div className="role-btn-text">
                  <h3>👤 1. CITIZEN (LIVE GPS SOS)</h3>
                  <p>Direct device GNSS positioning, clinical triage & real-time hospital SOS ticket transmission.</p>
                </div>
                <div className="role-card-badge font-mono direct">⚡ 1-CLICK INSTANT ACCESS (NO LOGIN)</div>
              </button>

              {/* ADMIN COMMAND CENTRE: AUTHENTICATED */}
              <button className="role-btn-card admin-card" onClick={() => handleRoleSelect("admin")}>
                <div className="icon-wrapper admin">
                  <Monitor size={24} />
                </div>
                <div className="role-btn-text">
                  <h3>🖥️ 2. ADMIN COMMAND CENTRE</h3>
                  <p>Central dispatcher room, dynamic KPI radar, AI fleet allocation & Route V2 bypass rerouting.</p>
                </div>
                <div className="role-card-badge font-mono">admin / admin123</div>
              </button>

              {/* AMBULANCE DRIVER: AUTHENTICATED */}
              <button className="role-btn-card driver-card" onClick={() => handleRoleSelect("driver")}>
                <div className="icon-wrapper driver">
                  <Truck size={24} />
                </div>
                <div className="role-btn-text">
                  <h3>🚑 3. DRIVER IN-CAB CONSOLE</h3>
                  <p>Ambulance A-104 cockpit HUD, turn-by-turn navigation, journey phases & incident reporting.</p>
                </div>
                <div className="role-card-badge font-mono">driver / driver123</div>
              </button>

              {/* HOSPITAL RECEPTION: AUTHENTICATED */}
              <button className="role-btn-card hospital-card" onClick={() => handleRoleSelect("hospital")}>
                <div className="icon-wrapper hospital">
                  <Building2 size={24} />
                </div>
                <div className="role-btn-text">
                  <h3>🏥 4. HOSPITAL RECEPTION</h3>
                  <p>GMCH Apex Trauma reception, incoming SOS approval, nearest ambulance dispatch & ICU beds.</p>
                </div>
                <div className="role-card-badge font-mono">hospital / hospital123</div>
              </button>

              {/* TRAFFIC ITMS OPERATOR: AUTHENTICATED */}
              <button className="role-btn-card traffic-card" onClick={() => handleRoleSelect("traffic")}>
                <div className="icon-wrapper traffic">
                  <TrafficCone size={24} />
                </div>
                <div className="role-btn-text">
                  <h3>🚦 5. ITMS GREEN CORRIDOR</h3>
                  <p>Municipal signal network override, real-time Green Wave light synchronization across junctions.</p>
                </div>
                <div className="role-card-badge font-mono">traffic / traffic123</div>
              </button>
            </div>

            {/* CREDENTIALS QUICK REFERENCE TABLE */}
            <div className="credentials-reference-card">
              <div className="cred-hdr-toggle" onClick={() => setShowCredentialsTable(!showCredentialsTable)}>
                <div className="cred-title-group">
                  <Key size={16} className="text-warning" />
                  <span className="font-mono">🔑 AUTHORIZED SYSTEM CREDENTIALS (CLICK TO AUTO-FILL)</span>
                </div>
                <span className="toggle-btn font-mono">{showCredentialsTable ? "▲ HIDE" : "▼ SHOW"}</span>
              </div>

              {showCredentialsTable && (
                <div className="credentials-table-wrapper animate-fade">
                  <table className="credentials-table font-mono">
                    <thead>
                      <tr>
                        <th>PORTAL / ROLE</th>
                        <th>USERNAME</th>
                        <th>PASSWORD</th>
                        <th>QUICK ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {USER_CREDENTIALS.map((cred) => (
                        <tr key={cred.role}>
                          <td>
                            <strong className="portal-name-tag">{cred.portalName}</strong>
                          </td>
                          <td>
                            <span className="cred-code">{cred.username}</span>
                          </td>
                          <td>
                            <span className="cred-code">{cred.password}</span>
                          </td>
                          <td>
                            <div className="btn-table-actions">
                              <button 
                                className="btn-autofill-row"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAutofill(cred.role);
                                }}
                                title="Autofill and open login"
                              >
                                AUTOFILL ➔
                              </button>
                              <button 
                                className="btn-copy-row"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopyCredentials(cred.username, cred.password, cred.role);
                                }}
                                title="Copy username & password"
                              >
                                {copiedKey === cred.role ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Fast Simulation / Demo Option */}
            <div className="demo-launch-box">
              <span className="demo-divider-text font-mono">OR RUN FULL DEMO PRESENTATION</span>
              <button 
                className="btn-launch-demo font-mono"
                onClick={() => onLoginSuccess({ role: "simulation", isAuthenticated: false })}
              >
                <div className="icon-wrapper sparkles">
                  <Sparkles size={18} className="animate-pulse-slow" />
                </div>
                <div className="btn-demo-content">
                  <div className="title-row">
                    <strong>🎬 LAUNCH MULTI-ROLE SIMULATION PANEL</strong>
                    <ChevronRight size={16} />
                  </div>
                  <p>Visually walk through all 4 role portals together step-by-step for hackathon judges.</p>
                </div>
              </button>
            </div>
          </div>

          <div className="login-footer font-mono">
            <span>"From Incident to Treatment — Every Second Coordinated."</span>
          </div>
        </div>
      </div>
    );
  }

  // Render role login form page for Admin, Driver, Hospital, Traffic
  const getRoleTitle = () => {
    if (selectedRole === "admin") return "ADMIN COMMAND CENTRE LOGIN";
    if (selectedRole === "driver") return "AMBULANCE DRIVER IN-CAB LOGIN";
    if (selectedRole === "hospital") return "HOSPITAL RECEPTION LOGIN";
    if (selectedRole === "traffic") return "ITMS TRAFFIC CONTROL LOGIN";
    return "PORTAL SECURE LOGIN";
  };

  const getRoleBadge = () => {
    const cred = USER_CREDENTIALS.find(c => c.role === selectedRole);
    return cred ? cred.portalName : `${selectedRole.toUpperCase()} NODE`;
  };

  return (
    <div className="login-wrapper animate-fade">
      <div className="login-card-container">
        
        <div className="login-top-nav">
          <button className="btn-back-selection font-mono" onClick={handleBackToSelection}>
            <ArrowLeft size={14} />
            <span>BACK TO ALL PORTALS</span>
          </button>
          
          {onOpenAbout && (
            <button className="btn-login-about font-mono" onClick={onOpenAbout}>
              <Info size={13} />
              <span>ABOUT</span>
            </button>
          )}
        </div>

        <div className="login-header-block text-center">
          <div className="brand-badge-pill font-mono">
            <ShieldCheck size={12} className="text-primary" />
            <span>{getRoleBadge()}</span>
          </div>
          <h1>{getRoleTitle()}</h1>
          <p className="brand-tagline">Enter authorized credentials to authenticate session</p>
        </div>

        <form className="login-form-block" onSubmit={handleLoginSubmit}>
          <div className="form-item-login">
            <label className="font-mono">USERNAME</label>
            <div className="input-with-icon">
              <UserIcon size={16} className="input-icon" />
              <input 
                type="text" 
                placeholder="Enter username (e.g. admin, driver, hospital, traffic)" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>

          <div className="form-item-login">
            <label className="font-mono">PASSWORD</label>
            <div className="input-with-icon">
              <Lock size={16} className="input-icon" />
              <input 
                type="password" 
                placeholder="Enter password (e.g. admin123, driver123, hospital123)" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Quick Credential Badge Helper */}
          <div className="login-preset-hint font-mono">
            <span>DEFAULT CREDENTIALS: </span>
            <strong>{credentialsMap[selectedRole]?.username || "admin"}</strong> / <strong>{credentialsMap[selectedRole]?.password || "admin123"}</strong>
          </div>

          {errorMessage && (
            <div className="error-alert-login font-sans" role="alert">
              <span>{errorMessage}</span>
            </div>
          )}

          <button type="submit" className="btn-login-submit font-mono">
            AUTHENTICATE & ENTER PORTAL
          </button>
        </form>

        <div className="login-footer font-mono">
          <span>SECURED TERMINAL CHANNEL // VIKASIT NAGPUR 2026</span>
        </div>
      </div>
    </div>
  );
};

export default CommonLogin;
