import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import KpiCard from "./components/KpiCard";
import MapSection from "./components/MapSection";
import EmergencyCard from "./components/EmergencyCard";
import AmbulanceCard from "./components/AmbulanceCard";
import HospitalCard from "./components/HospitalCard";
import Toast from "./components/Toast";
import EmergenciesPage from "./pages/EmergenciesPage";
import NewEmergencyFlow from "./pages/NewEmergencyFlow";
import MissionPage from "./pages/MissionPage";
import GreenCorridorPage from "./pages/GreenCorridorPage";
import DriverView from "./pages/DriverView";
import TrafficOperatorView from "./pages/TrafficOperatorView";
import MissionCompletedPage from "./pages/MissionCompletedPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import MissionHistoryPage from "./pages/MissionHistoryPage";
import UserReportPage from "./pages/UserReportPage";
import AboutPage from "./pages/AboutPage";
import HospitalPanel from "./pages/HospitalPanel";
import DriverPanel from "./pages/DriverPanel";
import CommonLogin from "./components/CommonLogin";
import SimulationPanel from "./pages/SimulationPanel";

// Master Database Fixtures
import { 
  EMERGENCIES as initialEmergencies, 
  AMBULANCES as initialAmbulances, 
  HOSPITALS as initialHospitals,
  TRAFFIC_SIGNALS as initialTrafficSignals
} from "./data/mockData";
import { getActiveStepIndex } from "./utils/simulation";
import { 
  Shield, 
  Volume2, 
  Info, 
  CheckCircle2, 
  X, 
  Smartphone, 
  Truck, 
  Building2, 
  Monitor,
  AlertTriangle
} from "lucide-react";
import "./App.css";

function App() {
  const [activeView, setActiveView] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedMission, setSelectedMission] = useState(null);
  const [appRole, setAppRole] = useState(null); // 'user', 'driver', 'hospital', 'admin', 'simulation'
  const [currentUser, setCurrentUser] = useState(null);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  
  // Base Clean Dynamic Lists (Starts with 0 pre-assumed emergencies!)
  const [emergencies, setEmergencies] = useState(initialEmergencies);
  const [ambulances, setAmbulances] = useState(initialAmbulances);
  const [hospitals, setHospitals] = useState(initialHospitals);
  const [toast, setToast] = useState(null);

  // Live Mission & Pending Emergency trackers
  const [activeMission, setActiveMission] = useState(null);
  const [pendingEmergency, setPendingEmergency] = useState(null);
  const [driverIssue, setDriverIssue] = useState(null);
  const [dispatchEmergency, setDispatchEmergency] = useState(null);
  const [completedMissions, setCompletedMissions] = useState([]);

  // Theme states
  const [isDarkMode, setIsDarkMode] = useState(true);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const nextMode = !prev;
      if (nextMode) {
        document.body.classList.remove("light-theme");
      } else {
        document.body.classList.add("light-theme");
      }
      return nextMode;
    });
  };

  const handleStartDispatch = (emergency) => {
    setDispatchEmergency(emergency);
    setActiveView("new-emergency");
  };

  // Blockage and Rerouting states
  const [blockageState, setBlockageState] = useState("none"); // none, active, updated, accepted

  // Demo Mode States
  const [isDemoActive, setIsDemoActive] = useState(false);
  const [demoElapsedTime, setDemoElapsedTime] = useState(0);
  const [demoSpeed, setDemoSpeed] = useState(1);
  const [demoStepIndex, setDemoStepIndex] = useState(0);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleViewMission = (emergency) => {
    if (activeMission && emergency.id === activeMission.emergency?.id) {
      setActiveView("mission");
    } else {
      setSelectedMission(emergency);
    }
  };

  const closeMissionModal = () => {
    setSelectedMission(null);
  };

  // STEP 1: Citizen SOS Submission Handler
  const handleSubmitCitizenEmergency = (newEmergency) => {
    setEmergencies((prev) => {
      const filtered = prev.filter((item) => item.id !== newEmergency.id);
      return [newEmergency, ...filtered];
    });
    setPendingEmergency(newEmergency);
    showToast(`Emergency alert #${newEmergency.id} logged. Transmitted to Hospital Reception!`, "critical");
  };

  // STEP 2: Hospital Approval & Ambulance Selection Handler
  const handleApproveHospitalEmergency = (selectedAmbulance) => {
    if (!pendingEmergency) return;

    // Use Government Medical College (GMC) or matching hospital
    const destinationHospital = hospitals[0] || initialHospitals[0];

    handleStartMission({
      emergency: pendingEmergency,
      ambulance: selectedAmbulance,
      hospital: destinationHospital
    });

    setPendingEmergency(null);
    showToast(`Emergency approved by Hospital. Ambulance ${selectedAmbulance.id} dispatched!`, "success");
  };

  // STEP 3: Situation Reporting & Strict Reassignment vs Rerouting Rule
  const handleDriverReportIssue = (issueObj) => {
    setDriverIssue(issueObj);

    setActiveMission((prev) => {
      if (!prev) return null;
      const updatedTimeline = [...prev.timeline];
      updatedTimeline.push({ time: "18:05", event: `⚠ Driver reported: ${issueObj.type} - ${issueObj.notes || "No extra notes"}` });
      return {
        ...prev,
        timeline: updatedTimeline
      };
    });

    if (issueObj.type.toLowerCase().includes("mechanical") || issueObj.type.toLowerCase().includes("defect")) {
      showToast(`Mechanical failure alert on Ambulance. Hospital authorized for replacement assignment.`, "critical");
    } else {
      // Traffic or road barrier -> Initiate Route V2 Reroute ONLY
      showToast(`Traffic congestion reported. Rerouting to Route V2 Bypass.`, "warning");
      triggerBlockage();
    }
  };

  // Hospital Replacement Ambulance Assignment (Authorized ONLY for Mechanical Problems)
  const handleAssignReplacementAmbulance = (newAmbulance) => {
    if (!activeMission) return;

    setActiveMission((prev) => {
      if (!prev) return null;
      const updatedTimeline = [...prev.timeline];
      updatedTimeline.push({ time: "18:06", event: `🔧 Hospital authorized replacement: Unit ${newAmbulance.id} assigned to mission` });

      return {
        ...prev,
        ambulance: newAmbulance,
        timeline: updatedTimeline
      };
    });

    // Update fleet statuses
    setAmbulances((prev) =>
      prev.map((a) => {
        if (a.id === newAmbulance.id) {
          return { ...a, status: "EN ROUTE", speed: "58 km/h" };
        }
        if (a.id === activeMission.ambulance.id) {
          return { ...a, status: "MECHANICAL DEFECT", speed: "0 km/h" };
        }
        return a;
      })
    );

    setDriverIssue(null);
    showToast(`Ambulance ${newAmbulance.id} deployed as replacement.`, "success");
  };

  const handleAcknowledgeHospital = () => {
    setActiveMission((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        hospitalAlertAcknowledged: true
      };
    });
    showToast("Hospital Pre-Alert Acknowledged by GMC medical staff.", "success");
  };

  const handleConfirmHospitalReadiness = () => {
    setActiveMission((prev) => {
      if (!prev) return null;
      const updatedTimeline = [...prev.timeline];
      updatedTimeline.push({ time: "18:04", event: "🏥 GMC Hospital: Trauma team ready & ICU Bed #04 reserved" });
      return {
        ...prev,
        hospitalReady: true,
        timeline: updatedTimeline
      };
    });
    showToast("Hospital readiness confirmed by GMC staff.", "success");
  };

  const handleConfirmPatientReceived = () => {
    setActiveMission((prev) => {
      if (!prev) return null;
      const updatedTimeline = [...prev.timeline];
      updatedTimeline.push({ time: "18:10", event: "✓ Patient safely admitted to GMC Trauma Ward" });
      const finished = {
        ...prev,
        duration: "07:18 mins",
        savedTime: "06:21 mins",
        patientReceived: true,
        telemetry: {
          ...prev.telemetry,
          status: "RESOLVED",
          distance: "0.0",
          speed: "0 km/h"
        },
        timeline: updatedTimeline
      };

      setCompletedMissions((cPrev) => [finished, ...cPrev]);
      return finished;
    });
    showToast("Patient received. Mission successfully resolved and admitted.", "success");
  };

  const handleDriverUpdateStatus = (nextStatus) => {
    setActiveMission((prev) => {
      if (!prev) return null;
      const updatedTimeline = [...prev.timeline];
      let telemetryStatus = prev.telemetry.status;

      if (nextStatus === "ACCEPTED") {
        updatedTimeline.push({ time: "18:03", event: `Mission accepted by driver ${prev.ambulance?.driver || "Rahul Patil"}` });
      } else if (nextStatus === "EN ROUTE TO PATIENT") {
        updatedTimeline.push({ time: "18:04", event: "Journey started to incident pickup point" });
      } else if (nextStatus === "ARRIVED AT INCIDENT") {
        updatedTimeline.push({ time: "18:05", event: "Arrived at incident scene" });
      } else if (nextStatus === "PATIENT ONBOARD") {
        updatedTimeline.push({ time: "18:06", event: `✓ Patient onboard ${prev.ambulance?.id || "A-104"}` });
      } else if (nextStatus === "EN ROUTE TO HOSPITAL") {
        updatedTimeline.push({ time: "18:07", event: "En route to GMC Hospital under Green Corridor" });
      } else if (nextStatus === "ARRIVED AT HOSPITAL") {
        updatedTimeline.push({ time: "18:09", event: "Arrived at GMC Hospital trauma bay" });
        telemetryStatus = "ARRIVED";
      }

      return {
        ...prev,
        telemetry: {
          ...prev.telemetry,
          status: telemetryStatus
        },
        timeline: updatedTimeline
      };
    });
  };

  const handleDriverHandover = () => {
    handleConfirmPatientReceived();
  };

  // Dispatch flow: Start the mission, update lists, initialize activeMission state
  const handleStartMission = ({ emergency, ambulance, hospital }) => {
    const updatedEmergency = {
      ...emergency,
      status: "AMBULANCE EN ROUTE"
    };

    setEmergencies((prev) => {
      const filtered = prev.filter((item) => item.id !== emergency.id);
      return [updatedEmergency, ...filtered];
    });

    setAmbulances((prev) => 
      prev.map((amb) => 
        amb.id === ambulance.id 
          ? { 
              ...amb, 
              status: "EN ROUTE", 
              speed: "58 km/h", 
              eta: "07:18", 
              location: emergency.location 
            }
          : amb
      )
    );

    if (hospital) {
      setHospitals((prev) =>
        prev.map((hosp) =>
          hosp.id === hospital.id
            ? { ...hosp, icuBeds: hosp.icuBeds ? hosp.icuBeds.replace(/(\d+) \/ (\d+)/, (m, av, tot) => `${Math.max(0, parseInt(av) - 1).toString().padStart(2, '0')} / ${tot}`) : "14 / 20 Available" }
            : hosp
        )
      );
    }

    const initialMission = {
      id: emergency.id ? emergency.id.replace("ER-", "RESQ-") : `RESQ-${Math.floor(1000 + Math.random() * 9000)}`,
      emergency: updatedEmergency,
      ambulance: ambulance,
      hospital: hospital || hospitals[0],
      hospitalAlertAcknowledged: false,
      hospitalReady: false,
      patientReceived: false,
      telemetry: {
        eta: "07:18",
        distance: "4.8",
        speed: "58 km/h",
        status: "EN ROUTE"
      },
      signals: [
        { id: "SIGNAL 01", name: "Sitabuldi Interchange", status: "🟢 PRIORITY ACTIVE", eta: "00:32" },
        { id: "SIGNAL 02", name: "Wardha Road Crossing", status: "🟡 PRIORITY READY", eta: "01:14" },
        { id: "SIGNAL 03", name: "Congress Nagar Junction", status: "⚪ NORMAL", eta: "02:02" },
        { id: "SIGNAL 04", name: "GMC Hospital Square", status: "🟢 PRIORITY ACTIVE", eta: "03:10" }
      ],
      timeline: [
        { time: "18:02", event: `Emergency reported at ${emergency.location}` },
        { time: "18:02", event: `${emergency.severity} severity triage approved by Hospital` },
        { time: "18:02", event: `Ambulance ${ambulance.id} (${ambulance.type}) selected from fleet` },
        { time: "18:03", event: `GMC Hospital Level 1 Trauma Reception assigned` },
        { time: "18:03", event: `Route V1 generated (Wardha Road Corridor)` },
        { time: "18:04", event: `Green corridor activated across 4 municipal signals` },
        { time: "18:05", event: `Ambulance moving with siren override` }
      ]
    };

    setActiveMission(initialMission);
    setBlockageState("none");
    showToast(`Mission started. Ambulance ${ambulance.id} dispatched to ${emergency.location}.`, "success");
  };

  // Dynamic calculations synchronizer
  const getSynchronizedAmbulances = () => {
    return ambulances.map((amb) => {
      if (activeMission && amb.id === activeMission.ambulance?.id) {
        const isArrived = activeMission.telemetry.status === "ARRIVED" || activeMission.telemetry.status === "RESOLVED";
        return {
          ...amb,
          status: isArrived ? "AVAILABLE" : activeMission.telemetry.status,
          speed: isArrived ? "0 km/h" : activeMission.telemetry.speed,
          eta: isArrived ? "--" : activeMission.telemetry.eta,
          location: activeMission.emergency?.location || amb.location
        };
      }
      return amb;
    });
  };

  const getSynchronizedEmergencies = () => {
    return emergencies.map((e) => {
      if (activeMission && e.id === activeMission.emergency?.id) {
        const isArrived = activeMission.telemetry.status === "ARRIVED" || activeMission.telemetry.status === "RESOLVED";
        return {
          ...e,
          status: isArrived ? "RESOLVED" : "AMBULANCE EN ROUTE"
        };
      }
      return e;
    });
  };

  const getDynamicKpis = () => {
    const activeEmergenciesCount = getSynchronizedEmergencies().filter(e => e.status !== "RESOLVED").length;
    const dispatchedAmbulancesCount = getSynchronizedAmbulances().filter(a => a.status === "EN ROUTE" || a.status === "TRANSPORTING").length;
    const readyHospitalsCount = hospitals.filter(h => h.emergencyStatus === "READY").length;

    return [
      {
        title: "ACTIVE EMERGENCIES",
        value: activeEmergenciesCount.toString().padStart(2, "0"),
        icon: "AlertTriangle",
        color: "var(--critical)"
      },
      {
        title: "AMBULANCES ACTIVE",
        value: (6 + dispatchedAmbulancesCount).toString().padStart(2, "0"),
        icon: "Truck",
        color: "var(--primary)"
      },
      {
        title: "HOSPITALS READY",
        value: readyHospitalsCount.toString().padStart(2, "0"),
        icon: "Building2",
        color: "var(--success)"
      },
      {
        title: "AVG RESPONSE",
        value: activeMission && activeMission.telemetry.status === "RESOLVED" ? "10:35" : "11:42",
        icon: "Clock",
        color: "var(--text-light)"
      },
      {
        title: "TIME SAVED",
        value: activeMission && activeMission.telemetry.status === "RESOLVED" ? "06:21" : "04:32",
        icon: "Zap",
        color: "var(--warning)"
      }
    ];
  };

  // Blockage Simulation
  const triggerBlockage = () => {
    if (!activeMission) return;
    setBlockageState("active");
    
    setActiveMission((prev) => {
      if (!prev) return null;
      const updatedTimeline = [...prev.timeline];
      updatedTimeline.push({ time: "18:05", event: "⚠ Traffic bottleneck detected on Wardha Rd" });
      updatedTimeline.push({ time: "18:05", event: "Dynamic route recalculation started" });
      
      return {
        ...prev,
        telemetry: {
          ...prev.telemetry,
          speed: "12 km/h",
          eta: "11:15"
        },
        timeline: updatedTimeline
      };
    });

    setTimeout(() => {
      setBlockageState("updated");
      reroute();
    }, 2000);
  };

  const reroute = () => {
    if (!activeMission) return;
    setBlockageState("accepted");
    showToast("Route V2 Congress Nagar Bypass activated.", "warning");

    setActiveMission((prev) => {
      if (!prev) return null;

      const updatedTimeline = [...prev.timeline];
      updatedTimeline.push({ time: "18:05", event: "Route V2 bypass activated" });
      updatedTimeline.push({ time: "18:06", event: "Green corridor signals updated to bypass" });
      updatedTimeline.push({ time: "18:06", event: "Hospital ETA updated" });

      const newSignals = [
        { id: "SIGNAL 04", name: "Congress Nagar Bypass Junction", status: "🟢 PRIORITY ACTIVE", eta: "00:48" },
        { id: "SIGNAL 05", name: "Rahate Colony Crossing", status: "🟡 READY", eta: "01:25" },
        { id: "SIGNAL 06", name: "GMC Hospital Back Gate", status: "🟢 PRIORITY ACTIVE", eta: "02:10" }
      ];

      return {
        ...prev,
        telemetry: {
          ...prev.telemetry,
          eta: "08:15",
          speed: "62 km/h"
        },
        signals: newSignals,
        timeline: updatedTimeline
      };
    });
  };

  // Manual Mission Telemetry Interval Ticker (Moves ambulance live along route)
  useEffect(() => {
    if (!activeMission || isDemoActive) return;
    if (parseFloat(activeMission.telemetry.distance) <= 0) return;
    if (blockageState === "active") return;

    const interval = setInterval(() => {
      setActiveMission((prev) => {
        if (!prev) return null;

        const currentDistance = parseFloat(prev.telemetry.distance);
        
        if (currentDistance <= 0.15) {
          clearInterval(interval);
          showToast(`Ambulance ${prev.ambulance?.id || "A-104"} arrived at GMC Hospital.`, "success");
          
          const finalTimeline = [...prev.timeline];
          finalTimeline.push({ time: "18:09", event: "Arrived at GMC Hospital trauma bay" });

          return {
            ...prev,
            telemetry: {
              ...prev.telemetry,
              distance: "0.0",
              speed: "0 km/h",
              status: "ARRIVED"
            },
            timeline: finalTimeline
          };
        }

        const nextDistanceVal = Math.max(0, currentDistance - 0.15);
        const nextDistance = nextDistanceVal.toFixed(2);

        const baseSpeed = prev.telemetry.speed.includes("12") ? 12 : 58;
        const speedFluctuation = baseSpeed === 12 ? 0 : Math.floor(Math.random() * 6) - 3;
        const speedStr = `${baseSpeed + speedFluctuation} km/h`;

        const totalSeconds = Math.round(nextDistanceVal * 80);
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        const etaStr = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

        const signalsUpdated = prev.signals ? prev.signals.map((sig, idx) => {
          let status = "NORMAL operation";
          let etaSecs = Math.max(0, Math.round(nextDistanceVal * 80 - (4.8 - nextDistanceVal) * 8 - idx * 45));
          const sigMin = Math.floor(etaSecs / 60);
          const sigSec = etaSecs % 60;
          const sigEtaStr = `${sigMin.toString().padStart(2, '0')}:${sigSec.toString().padStart(2, '0')}`;

          if (blockageState === "accepted") {
            if (idx === 0) {
              if (nextDistanceVal > 2.5) status = "🟢 PRIORITY ACTIVE";
              else status = "⚪ AMBULANCE PASSED";
            } else if (idx === 1) {
              if (nextDistanceVal <= 2.5 && nextDistanceVal > 1.2) status = "🟢 PRIORITY ACTIVE";
              else if (nextDistanceVal <= 1.2) status = "⚪ AMBULANCE PASSED";
              else status = "🟡 READY";
            } else if (idx === 2) {
              if (nextDistanceVal <= 1.2 && nextDistanceVal > 0) status = "🟢 PRIORITY ACTIVE";
              else if (nextDistanceVal === 0) status = "⚪ AMBULANCE PASSED";
              else status = "🟡 READY";
            }
          } else {
            if (idx === 0) {
              if (nextDistanceVal > 3.6) status = "🟢 PRIORITY ACTIVE";
              else status = "⚪ AMBULANCE PASSED";
            } else if (idx === 1) {
              if (nextDistanceVal <= 3.6 && nextDistanceVal > 2.4) status = "🟢 PRIORITY ACTIVE";
              else if (nextDistanceVal <= 2.4) status = "⚪ AMBULANCE PASSED";
              else status = "🟡 READY";
            } else if (idx === 2) {
              if (nextDistanceVal <= 2.4 && nextDistanceVal > 1.0) status = "🟢 PRIORITY ACTIVE";
              else if (nextDistanceVal <= 1.0) status = "⚪ AMBULANCE PASSED";
              else status = "🟡 READY";
            } else if (idx === 3) {
              if (nextDistanceVal <= 1.0 && nextDistanceVal > 0) status = "🟢 PRIORITY ACTIVE";
              else if (nextDistanceVal === 0) status = "⚪ AMBULANCE PASSED";
              else status = "🟡 READY";
            }
          }

          return { ...sig, status, eta: sigEtaStr };
        }) : [];

        return {
          ...prev,
          telemetry: {
            ...prev.telemetry,
            distance: nextDistance,
            speed: speedStr,
            eta: etaStr
          },
          signals: signalsUpdated
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeMission, blockageState, isDemoActive]);

  const resetAll = () => {
    setIsDemoActive(false);
    setDemoElapsedTime(0);
    setDemoStepIndex(0);
    setBlockageState("none");
    setActiveMission(null);
    setPendingEmergency(null);
    setDriverIssue(null);
    setEmergencies([]);
    setAmbulances(initialAmbulances);
    setHospitals(initialHospitals);
    setActiveView("dashboard");
    showToast("System reset to clean fresh state with 0 active emergencies.", "success");
  };

  // Render view router for Admin Command Centre
  const renderAdminViewContent = () => {
    switch (activeView) {
      case "dashboard":
        return (
          <div className="dashboard-viewport animate-fade">
            <div className="kpi-grid">
              {getDynamicKpis().map((kpi, idx) => (
                <KpiCard
                  key={idx}
                  title={kpi.title}
                  value={kpi.value}
                  icon={kpi.icon}
                  color={kpi.color}
                />
              ))}
            </div>

            <div className="dashboard-grid">
              <div className="grid-column">
                <MapSection activeMission={activeMission} />
                
                <div className="section-panel">
                  <div className="section-header">
                    <h3 className="section-title">
                      <span className="status-dot status-online animate-pulse-slow"></span>
                      <span>ACTIVE FLEET TELEMETRY</span>
                    </h3>
                    <span className="simulated-label">REAL-TIME GPS</span>
                  </div>
                  <div className="cards-list" style={{ flexDirection: "row", flexWrap: "wrap", gap: "16px", maxHeight: "none" }}>
                    {getSynchronizedAmbulances().map((amb) => (
                      <div key={amb.id} style={{ flex: "1 1 calc(50% - 16px)", minWidth: "280px" }}>
                        <AmbulanceCard ambulance={amb} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid-column">
                {/* Emergency Alert Section */}
                <div className="section-panel">
                  <div className="section-header">
                    <h3 className="section-title text-critical">
                      <span className="status-dot status-critical animate-pulse-slow"></span>
                      <span>ACTIVE EMERGENCY ALERT</span>
                    </h3>
                    <span className="simulated-label">PRIORITY 1</span>
                  </div>
                  
                  {getSynchronizedEmergencies().length > 0 ? (
                    <EmergencyCard 
                      emergency={getSynchronizedEmergencies()[0]} 
                      onViewMission={handleViewMission} 
                      onStartDispatch={handleStartDispatch}
                    />
                  ) : (
                    <div style={{ textAlign: "center", padding: "28px 16px", color: "var(--text-secondary)" }}>
                      <AlertTriangle size={28} className="text-muted" style={{ margin: "0 auto 8px" }} />
                      <p className="font-mono" style={{ fontSize: "0.8rem", color: "var(--text-light)" }}>NO ACTIVE EMERGENCIES</p>
                      <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", margin: "4px auto 14px", maxWidth: "280px" }}>
                        Report a new incident from the Citizen SOS Portal to initiate response.
                      </p>
                      <button 
                        className="btn-view-mission font-mono" 
                        style={{ margin: "0 auto", padding: "6px 14px", fontSize: "0.72rem" }}
                        onClick={() => setActiveView("citizen-report")}
                      >
                        REPORT CITIZEN SOS →
                      </button>
                    </div>
                  )}
                </div>

                <div className="section-panel">
                  <div className="section-header">
                    <h3 className="section-title">
                      <span>🏥 NAGPUR HOSPITAL NETWORK</span>
                    </h3>
                    <span className="simulated-label">15 HUBS</span>
                  </div>
                  <div className="cards-list">
                    {hospitals.map((hosp) => (
                      <HospitalCard key={hosp.id} hospital={hosp} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "citizen-report":
        return (
          <UserReportPage 
            onSubmitEmergency={handleSubmitCitizenEmergency}
            onJumpToHospital={() => setActiveView("hospital-panel")}
            onLogout={() => {
              setCurrentUser(null);
              setAppRole(null);
            }}
            onOpenAbout={() => setIsAboutModalOpen(true)}
            showToast={showToast}
          />
        );

      case "hospital-panel":
        return (
          <HospitalPanel
            activeMission={activeMission}
            pendingEmergency={pendingEmergency}
            driverIssue={driverIssue}
            onApproveEmergency={handleApproveHospitalEmergency}
            onAssignReplacementAmbulance={handleAssignReplacementAmbulance}
            onConfirmReadiness={handleConfirmHospitalReadiness}
            onConfirmPatientReceived={handleConfirmPatientReceived}
            onJumpToDriver={() => setActiveView("driver-panel")}
            onLogout={() => {
              setCurrentUser(null);
              setAppRole(null);
            }}
            onOpenAbout={() => setIsAboutModalOpen(true)}
            showToast={showToast}
          />
        );

      case "driver-panel":
        return (
          <DriverPanel
            activeMission={activeMission}
            onDriverUpdateStatus={handleDriverUpdateStatus}
            onDriverReportIssue={handleDriverReportIssue}
            onDriverHandover={handleDriverHandover}
            onJumpToHospital={() => setActiveView("hospital-panel")}
            onLogout={() => {
              setCurrentUser(null);
              setAppRole(null);
            }}
            onOpenAbout={() => setIsAboutModalOpen(true)}
            showToast={showToast}
          />
        );

      case "emergencies":
        return (
          <EmergenciesPage 
            emergencies={getSynchronizedEmergencies()} 
            onCreateNewClick={() => {
              setDispatchEmergency(null);
              setActiveView("new-emergency");
            }}
            onViewMission={handleViewMission}
            onStartDispatch={handleStartDispatch}
          />
        );

      case "new-emergency":
        return (
          <NewEmergencyFlow 
            onCancel={() => {
              setDispatchEmergency(null);
              setActiveView("emergencies");
            }}
            onStartMission={handleStartMission}
            showToast={showToast}
            preSelectedEmergency={dispatchEmergency}
          />
        );

      case "mission":
        return (
          <MissionPage 
            missionData={activeMission} 
            onAcknowledgeHospital={handleAcknowledgeHospital}
            blockageState={blockageState}
            onTriggerBlockage={triggerBlockage}
            onAcceptReroute={reroute}
          />
        );

      case "corridor":
        return <GreenCorridorPage missionData={activeMission} />;

      case "driver":
        return <DriverView missionData={activeMission} />;

      case "operator":
        return <TrafficOperatorView missionData={activeMission} />;

      case "completed":
        return (
          <MissionCompletedPage 
            missionData={activeMission} 
            onResetDemo={resetAll} 
            onViewMissionClick={() => setActiveView("mission")}
            onViewAnalyticsClick={() => setActiveView("analytics")}
          />
        );

      case "analytics":
        return <AnalyticsPage completedMissions={completedMissions} />;

      case "history":
        return (
          <MissionHistoryPage 
            completedMissions={completedMissions}
            onViewHistoryDetails={(selected) => setSelectedMission(selected)} 
          />
        );

      case "about":
        return <AboutPage />;

      case "ambulances":
        return (
          <div className="view-container animate-fade">
            <div className="view-header">
              <h2 className="view-title">Nagpur RESQ Ambulance Fleet</h2>
              <p className="view-subtitle">Live telemetry, status signals, and specialized onboard equipment lists.</p>
            </div>
            <div className="grid-3-col">
              {getSynchronizedAmbulances().map((amb) => (
                <AmbulanceCard key={amb.id} ambulance={amb} />
              ))}
            </div>
          </div>
        );

      case "hospitals":
        return (
          <div className="view-container animate-fade">
            <div className="view-header">
              <h2 className="view-title">Nagpur Medical Network Centers</h2>
              <p className="view-subtitle">Live capacity indicators, trauma level statuses, and oxygen reservoirs.</p>
            </div>
            <div className="grid-3-col">
              {hospitals.map((hosp) => (
                <HospitalCard key={hosp.id} hospital={hosp} />
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="view-container animate-fade">
            <div className="section-panel" style={{ padding: "30px", textAlign: "center" }}>
              <Info size={32} style={{ color: "var(--primary)", marginBottom: "12px" }} />
              <h3>{activeView.toUpperCase()} Portal</h3>
              <button className="btn-view-mission" style={{ margin: "0 auto" }} onClick={() => setActiveView("dashboard")}>
                Return to Command Centre
              </button>
            </div>
          </div>
        );
    }
  };

  // Render Universal About Modal
  const renderAboutModal = () => {
    if (!isAboutModalOpen) return null;

    return (
      <div className="mission-modal-overlay" onClick={() => setIsAboutModalOpen(false)}>
        <div className="mission-modal about-modal-dialog animate-fade" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <div className="modal-title-group">
              <Shield size={20} className="text-primary" />
              <h3>About NAGPUR RESQ Ecosystem</h3>
            </div>
            <button className="modal-close" onClick={() => setIsAboutModalOpen(false)}>
              <X size={18} />
            </button>
          </div>

          <div className="modal-body">
            <div style={{ textAlign: "center", padding: "10px 0" }}>
              <div style={{ fontSize: "2rem", marginBottom: "6px" }}>🚨</div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: "800", color: "var(--text-light)" }}>
                "From Incident to Treatment — Every Second Coordinated."
              </h3>
              <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", maxWidth: "520px", margin: "6px auto 0" }}>
                NAGPUR RESQ is an integrated Emergency Response Orchestration platform designed for the Vikasit Nagpur Hackathon 2026. It synchronizes 4 interconnected nodes in real time.
              </p>
            </div>

            <div className="about-modal-services-grid">
              <div className="about-modal-service-card">
                <div className="svc-title">
                  <Smartphone size={16} className="text-primary" />
                  <span>1. Citizen SOS Portal</span>
                </div>
                <p className="svc-desc">
                  Instant geolocation lock, triage severity selection, equipment demand request, and real-time cellular ticket sync.
                </p>
              </div>

              <div className="about-modal-service-card">
                <div className="svc-title">
                  <Monitor size={16} className="text-critical" />
                  <span>2. Admin Command Room</span>
                </div>
                <p className="svc-desc">
                  Live Leaflet radar map tracking, AI triage matching, explainable DRA scorecards, and Route V2 congestion rerouting.
                </p>
              </div>

              <div className="about-modal-service-card">
                <div className="svc-title">
                  <Truck size={16} className="text-warning" />
                  <span>3. Driver In-Cab Console</span>
                </div>
                <p className="svc-desc">
                  Real-time speedometer HUD, detailed satellite road map, turn-by-turn navigation, and green corridor override countdowns.
                </p>
              </div>

              <div className="about-modal-service-card">
                <div className="svc-title">
                  <Building2 size={16} className="text-success" />
                  <span>4. Hospital Reception</span>
                </div>
                <p className="svc-desc">
                  Apex Level 1 Trauma reception at GMC Nagpur, nearest ambulance selection, live inbound countdown, and ICU bed reservations.
                </p>
              </div>
            </div>

            <div className="about-modal-footer">
              <span className="font-mono">PROJECT TEAM // NAGPUR RESQ // VIKASIT NAGPUR 2026</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // COMMON LOGIN / GATEWAY VIEW (When not logged in)
  if (!currentUser) {
    return (
      <div className="app-container" style={{ flexDirection: "column" }}>
        <CommonLogin 
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            setAppRole(user.role);
            if (user.role === "user") {
              setActiveView("citizen-report");
            } else if (user.role === "hospital") {
              setActiveView("hospital-panel");
            } else if (user.role === "driver") {
              setActiveView("driver-panel");
            } else {
              setActiveView("dashboard");
            }
          }}
          onOpenAbout={() => setIsAboutModalOpen(true)}
          showToast={showToast}
        />
        {renderAboutModal()}
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}
      </div>
    );
  }

  // PORTAL 5: SIMULATION PRESENTATION PANEL
  if (appRole === "simulation" || currentUser?.role === "simulation") {
    return (
      <div className="app-container" style={{ flexDirection: "column" }}>
        <SimulationPanel 
          onBackToHome={() => {
            setCurrentUser(null);
            setAppRole(null);
          }} 
          onLogout={() => {
            setCurrentUser(null);
            setAppRole(null);
          }}
          onOpenAbout={() => setIsAboutModalOpen(true)}
          showToast={showToast} 
        />
        {renderAboutModal()}
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}
      </div>
    );
  }

  // PORTAL 1: CITIZEN EMERGENCY REPORTING PORTAL
  if (appRole === "user" || currentUser?.role === "user") {
    return (
      <div className="app-container user-mode">
        <UserReportPage 
          onSubmitEmergency={handleSubmitCitizenEmergency}
          onJumpToHospital={() => {
            setCurrentUser({ role: "hospital", isAuthenticated: true });
            setAppRole("hospital");
          }}
          onLogout={() => {
            setCurrentUser(null);
            setAppRole(null);
          }}
          onOpenAbout={() => setIsAboutModalOpen(true)}
          showToast={showToast}
        />
        {renderAboutModal()}
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}
      </div>
    );
  }

  // PORTAL 4: HOSPITAL TRAUMA RECEPTION PORTAL
  if (appRole === "hospital" || currentUser?.role === "hospital") {
    return (
      <div className="app-container hospital-mode">
        <HospitalPanel
          activeMission={activeMission}
          pendingEmergency={pendingEmergency}
          driverIssue={driverIssue}
          onApproveEmergency={handleApproveHospitalEmergency}
          onAssignReplacementAmbulance={handleAssignReplacementAmbulance}
          onConfirmReadiness={handleConfirmHospitalReadiness}
          onConfirmPatientReceived={handleConfirmPatientReceived}
          onJumpToDriver={() => {
            setCurrentUser({ role: "driver", isAuthenticated: true });
            setAppRole("driver");
          }}
          onLogout={() => {
            setCurrentUser(null);
            setAppRole(null);
          }}
          onOpenAbout={() => setIsAboutModalOpen(true)}
          showToast={showToast}
        />
        {renderAboutModal()}
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}
      </div>
    );
  }

  // PORTAL 3: AMBULANCE DRIVER IN-CAB CONSOLE
  if (appRole === "driver" || currentUser?.role === "driver") {
    return (
      <div className="app-container driver-mode">
        <DriverPanel
          activeMission={activeMission}
          onDriverUpdateStatus={handleDriverUpdateStatus}
          onDriverReportIssue={handleDriverReportIssue}
          onDriverHandover={handleDriverHandover}
          onJumpToHospital={() => {
            setCurrentUser({ role: "hospital", isAuthenticated: true });
            setAppRole("hospital");
          }}
          onLogout={() => {
            setCurrentUser(null);
            setAppRole(null);
          }}
          onOpenAbout={() => setIsAboutModalOpen(true)}
          showToast={showToast}
        />
        {renderAboutModal()}
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}
      </div>
    );
  }

  // PORTAL 2: ADMIN COMMAND CENTRE DISPATCHER (Default)
  return (
    <div className="app-container" style={{ flexDirection: "column" }}>
      <div style={{ display: "flex", flex: 1, minHeight: "100vh" }}>
        {/* Navigation Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeView={activeView}
          onViewChange={(viewId) => setActiveView(viewId)}
          activeMission={activeMission}
          onLogout={() => {
            setCurrentUser(null);
            setAppRole(null);
          }}
          onOpenAbout={() => setIsAboutModalOpen(true)}
          isDarkMode={isDarkMode}
          onToggleTheme={toggleTheme}
        />

        {/* Mobile Sidebar click overlay */}
        <div 
          className={`mobile-sidebar-overlay ${sidebarOpen ? "active" : ""}`}
          onClick={() => setSidebarOpen(false)}
        />

        {/* Main viewport area */}
        <div className="main-content">
          <TopBar 
            onMenuToggle={toggleSidebar} 
            currentView={activeView} 
            isDemoActive={isDemoActive}
            demoStepIndex={demoStepIndex}
            demoElapsedTime={demoElapsedTime}
            onStartDemo={() => setIsDemoActive(true)}
            onPauseDemo={() => setIsDemoActive(false)}
            onResetDemo={resetAll}
            demoSpeed={demoSpeed}
            onSetDemoSpeed={setSpeed => setDemoSpeed(setSpeed)}
            onOpenAbout={() => setIsAboutModalOpen(true)}
            onLogout={() => {
              setCurrentUser(null);
              setAppRole(null);
            }}
            isDarkMode={isDarkMode}
            onToggleTheme={toggleTheme}
          />
          {renderAdminViewContent()}
        </div>
      </div>

      {/* Universal About Modal */}
      {renderAboutModal()}

      {/* Toast alert banners */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* Mission details modal */}
      {selectedMission && (
        <div className="mission-modal-overlay" onClick={closeMissionModal}>
          <div className="mission-modal animate-fade" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <Volume2 className="pulse-svg text-critical" size={20} />
                <h3>Mission Orchestration Log</h3>
              </div>
              <button className="modal-close" onClick={closeMissionModal}>
                <X size={18} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="mission-overview">
                <div className="overview-item">
                  <span className="lbl">Incident ID</span>
                  <span className="val font-mono">{selectedMission.id}</span>
                </div>
                <div className="overview-item">
                  <span className="lbl">Type</span>
                  <span className="val text-critical">{selectedMission.type}</span>
                </div>
                <div className="overview-item">
                  <span className="lbl">Sector</span>
                  <span className="val">{selectedMission.location}</span>
                </div>
              </div>

              <div className="log-timeline">
                <h4 className="timeline-title">Real-Time Dispatch Feed</h4>
                <div className="timeline-items">
                  <div className="timeline-step">
                    <div className="step-dot active"></div>
                    <div className="step-content">
                      <span className="step-time">Feed Start</span>
                      <p className="step-txt">Emergency Incident {selectedMission.id} registered by Dispatcher.</p>
                    </div>
                  </div>
                  <div className="timeline-step">
                    <div className="step-dot active"></div>
                    <div className="step-content">
                      <span className="step-time">Assessment Complete</span>
                      <p className="step-txt">Trauma and ICU facilities queried and match criteria calculated.</p>
                    </div>
                  </div>
                  <div className="timeline-step">
                    <div className="step-dot active highlight"></div>
                    <div className="step-content">
                      <span className="step-time">Telemetry Logged</span>
                      <p className="step-txt text-warning">Dispatcher action status: {selectedMission.status}.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="action-panel-modal">
                <div className="protocol-alert">
                  <CheckCircle2 size={16} className="text-success" />
                  <span>Dispatcher confirmation matches priority clinical routing.</span>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <span className="simulated-label">PROTOTYPE SIMULATOR CONTROL</span>
              <button className="btn-close-modal" onClick={closeMissionModal}>
                Dismiss Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
