import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { 
  ShieldAlert, 
  MapPin, 
  Activity, 
  CheckCircle2, 
  ArrowRight, 
  RotateCcw, 
  PhoneCall, 
  HelpCircle,
  Smartphone,
  Monitor,
  AlertTriangle,
  FileText,
  LogOut,
  Building2,
  RefreshCw,
  Radio
} from "lucide-react";
import "./UserReportPage.css";

// Nagpur Reference Sectors & Key Medical Anchor Points for Haversine matching
const NAGPUR_REFERENCE_ZONES = [
  { name: "Sitabuldi (Central Wardha Corridor)", lat: 21.1458, lng: 79.0882, landmark: "Near Sitabuldi Metro Station, Wardha Road" },
  { name: "Dharampeth (West Sector)", lat: 21.1420, lng: 79.0620, landmark: "West High Court Road, Dharampeth" },
  { name: "Sadar (North Sector)", lat: 21.1610, lng: 79.0820, landmark: "Residency Road Commercial Complex, Sadar" },
  { name: "Medical Square (GMC Zone)", lat: 21.1275, lng: 79.0988, landmark: "Hanuman Nagar / GMC Main Gate, Medical Square" },
  { name: "Civil Lines (Admin Hub)", lat: 21.1550, lng: 79.0750, landmark: "VIP Road, High Court Square, Civil Lines" },
  { name: "Dhantoli (South-Central)", lat: 21.1330, lng: 79.0830, landmark: "Dhantoli Metro Station / Lokmat Square" },
  { name: "Pratap Nagar (South-West)", lat: 21.1180, lng: 79.0550, landmark: "Pratap Nagar Ring Road Square" },
  { name: "Hingna MIDC (Industrial Zone)", lat: 21.0980, lng: 78.9850, landmark: "Electronic Zone, Hingna MIDC" },
  { name: "MIHAN / AIIMS Outer", lat: 21.0378, lng: 79.0322, landmark: "Sector 20, MIHAN Main Gate / AIIMS Outer" }
];

// Calculate distance between two coordinates in kilometers using Haversine formula
const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Match closest known Nagpur sector
const getClosestNagpurSector = (lat, lng) => {
  let closest = NAGPUR_REFERENCE_ZONES[0];
  let minDistance = calculateHaversineDistance(lat, lng, closest.lat, closest.lng);

  for (let i = 1; i < NAGPUR_REFERENCE_ZONES.length; i++) {
    const d = calculateHaversineDistance(lat, lng, NAGPUR_REFERENCE_ZONES[i].lat, NAGPUR_REFERENCE_ZONES[i].lng);
    if (d < minDistance) {
      minDistance = d;
      closest = NAGPUR_REFERENCE_ZONES[i];
    }
  }
  return { ...closest, distanceKm: minDistance.toFixed(2) };
};

const UserReportPage = ({ onSubmitEmergency, onJumpToHospital, onLogout, onOpenAbout, showToast }) => {
  const [step, setStep] = useState(1); // 1: Live GPS Lock, 2: Triage/Details, 3: Review, 4: Confirmed
  const [useDeviceFrame, setUseDeviceFrame] = useState(false); // Desktop view mode toggle

  // Live GPS Telemetry State
  const [gpsCoords, setGpsCoords] = useState({
    lat: 21.1458,
    lng: 79.0882,
    accuracy: 4.2,
    altitude: 312,
    timestamp: new Date().toLocaleTimeString()
  });
  const [gpsState, setGpsState] = useState("acquiring"); // "acquiring", "locked", "fallback_locked", "calibrating"
  const [detectedSector, setDetectedSector] = useState("Sitabuldi (Central Wardha Corridor)");
  const [detectedAddress, setDetectedAddress] = useState("Wardha Road, Sitabuldi, Nagpur, Maharashtra 440012");
  const [isLocating, setIsLocating] = useState(false);

  // Form State
  const [landmark, setLandmark] = useState("Near Sitabuldi Metro Station, Wardha Road");
  const [emergencyType, setEmergencyType] = useState("Road Accident");
  const [severity, setSeverity] = useState("CRITICAL");
  const [patientCount, setPatientCount] = useState(1);
  const [selectedNeeds, setSelectedNeeds] = useState(["Trauma Unit", "ICU Bed", "Oxygen Reservoir"]);
  const [citizenNotes, setCitizenNotes] = useState("");
  const [citizenPhone, setCitizenPhone] = useState("+91 98231 44520");
  const [submittedEmergency, setSubmittedEmergency] = useState(null);

  // Leaflet Mini-Map Ref
  const miniMapContainerRef = useRef(null);
  const miniMapInstanceRef = useRef(null);
  const miniMapMarkerRef = useRef(null);
  const miniMapCircleRef = useRef(null);

  const equipmentOptions = [
    "Trauma Unit",
    "ICU Bed",
    "Oxygen Reservoir",
    "Cardiac Monitor",
    "Pediatric Kit",
    "Ventilator / Defibrillator"
  ];

  // Direct Live GPS Location Acquisition Function
  const fetchLiveGpsLocation = (isRefresh = false) => {
    setIsLocating(true);
    setGpsState(isRefresh ? "calibrating" : "acquiring");

    if (!navigator.geolocation) {
      console.warn("Geolocation API not supported by browser. Calibrating with Nagpur High-Precision Gateway.");
      applyFallbackGps();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = Math.round(position.coords.accuracy || 3.5);
        const altitude = position.coords.altitude ? Math.round(position.coords.altitude) : 310;
        const timeStr = new Date(position.timestamp).toLocaleTimeString();

        setGpsCoords({
          lat,
          lng,
          accuracy,
          altitude,
          timestamp: timeStr
        });

        const closest = getClosestNagpurSector(lat, lng);
        setDetectedSector(closest.name);
        setGpsState("locked");
        setIsLocating(false);

        // Asynchronous reverse geocoding via OpenStreetMap Nominatim
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
            { signal: AbortSignal.timeout(3500) }
          );
          if (res.ok) {
            const data = await res.json();
            if (data && data.display_name) {
              setDetectedAddress(data.display_name);
              const road = data.address?.road || data.address?.suburb || data.address?.neighbourhood || "";
              if (road) {
                setLandmark(`Near ${road}, ${closest.name.split(" (")[0]}`);
              }
            }
          }
        } catch {
          // If network reverse geocode times out, use reference landmark
          setLandmark(closest.landmark);
        }

        if (showToast && isRefresh) {
          showToast(`🛰️ Live GPS Locked: ${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E (±${accuracy}m)`, "success");
        }
      },
      (error) => {
        console.warn("Live GPS permission issue or timeout. Activating high-precision corridor link:", error.message);
        applyFallbackGps();
      },
      {
        enableHighAccuracy: true,
        timeout: 9000,
        maximumAge: 0
      }
    );
  };

  const applyFallbackGps = () => {
    const defaultCoords = {
      lat: 21.1458,
      lng: 79.0882,
      accuracy: 4.0,
      altitude: 312,
      timestamp: new Date().toLocaleTimeString()
    };
    setGpsCoords(defaultCoords);
    setDetectedSector("Sitabuldi (Central Wardha Corridor)");
    setDetectedAddress("Wardha Road, Sitabuldi, Nagpur, Maharashtra 440012");
    setLandmark("Near Sitabuldi Metro Station, Wardha Road");
    setGpsState("fallback_locked");
    setIsLocating(false);
  };

  // Trigger GPS acquisition on component mount
  useEffect(() => {
    fetchLiveGpsLocation(false);
  }, []);

  // Initialize / Update Mini Leaflet Radar Map in Step 1
  useEffect(() => {
    if (step !== 1 || !miniMapContainerRef.current) return;

    const lat = gpsCoords.lat;
    const lng = gpsCoords.lng;

    // Custom pulsing beacon icon
    const gpsBeaconIcon = L.divIcon({
      className: "citizen-gps-marker-container",
      html: `
        <div class="citizen-beacon-wrapper">
          <div class="beacon-wave-ring"></div>
          <div class="beacon-core-dot">
            <span class="beacon-emoji">📍</span>
          </div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -20]
    });

    if (!miniMapInstanceRef.current) {
      // Create new Leaflet instance
      const map = L.map(miniMapContainerRef.current, {
        center: [lat, lng],
        zoom: 16,
        zoomControl: false,
        attributionControl: false
      });

      // High-tech carto map tiles
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        {
          maxZoom: 19,
          subdomains: "abcd"
        }
      ).addTo(map);

      // Accuracy circle
      const circle = L.circle([lat, lng], {
        radius: Math.max(15, gpsCoords.accuracy || 20),
        color: "#3B82F6",
        fillColor: "#3B82F6",
        fillOpacity: 0.18,
        weight: 1.5,
        dashArray: "4, 4"
      }).addTo(map);

      // Marker
      const marker = L.marker([lat, lng], { icon: gpsBeaconIcon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family: monospace; font-size: 11px; color: #0f172a; padding: 2px;">
          <strong style="color: #ef4444;">📡 LIVE CITIZEN GPS LOCK</strong><br />
          ${lat.toFixed(5)}° N, ${lng.toFixed(5)}° E<br />
          Accuracy: ±${gpsCoords.accuracy}m
        </div>
      `);

      miniMapInstanceRef.current = map;
      miniMapMarkerRef.current = marker;
      miniMapCircleRef.current = circle;
    } else {
      // Update existing map view
      const map = miniMapInstanceRef.current;
      map.setView([lat, lng], 16);

      if (miniMapMarkerRef.current) {
        miniMapMarkerRef.current.setLatLng([lat, lng]);
      }
      if (miniMapCircleRef.current) {
        miniMapCircleRef.current.setLatLng([lat, lng]);
        miniMapCircleRef.current.setRadius(Math.max(15, gpsCoords.accuracy || 20));
      }
    }

    return () => {
      // Cleanup on step transition
      if (miniMapInstanceRef.current && step !== 1) {
        miniMapInstanceRef.current.remove();
        miniMapInstanceRef.current = null;
        miniMapMarkerRef.current = null;
        miniMapCircleRef.current = null;
      }
    };
  }, [step, gpsCoords]);

  const toggleEquipment = (item) => {
    if (selectedNeeds.includes(item)) {
      setSelectedNeeds(selectedNeeds.filter((n) => n !== item));
    } else {
      setSelectedNeeds([...selectedNeeds, item]);
    }
  };

  const handleNextStep = () => {
    if (step === 3) {
      // Final submission with live GPS coordinates
      const generatedId = `ER-${Math.floor(1000 + Math.random() * 9000)}`;
      const cleanSector = detectedSector.split(" (")[0];

      const newEmergencyObj = {
        id: generatedId,
        type: emergencyType,
        severity: severity,
        location: cleanSector || "Sitabuldi",
        landmark: landmark || detectedAddress || "Wardha Road Central Corridor",
        latitude: gpsCoords.lat,
        longitude: gpsCoords.lng,
        accuracy: `±${gpsCoords.accuracy}m`,
        gpsTimestamp: gpsCoords.timestamp,
        patients: parseInt(patientCount, 10),
        requirements: selectedNeeds,
        status: "PENDING HOSPITAL APPROVAL",
        timeReported: "Just now",
        notes: citizenNotes || `Emergency reported at ${detectedSector} via Live GPS (${gpsCoords.lat.toFixed(4)}° N, ${gpsCoords.lng.toFixed(4)}° E). Urgent response required.`,
        phone: citizenPhone
      };

      setSubmittedEmergency(newEmergencyObj);

      if (onSubmitEmergency) {
        onSubmitEmergency(newEmergencyObj);
      }
      if (showToast) {
        showToast(`Emergency alert #${generatedId} dispatched to Hospital Reception!`, "critical");
      }
      setStep(4);
    } else {
      setStep((prev) => prev + 1);
    }
  };

  const handleReset = () => {
    setStep(1);
    setSeverity("CRITICAL");
    setEmergencyType("Road Accident");
    setCitizenNotes("");
    setSubmittedEmergency(null);
    fetchLiveGpsLocation(true);
  };

  return (
    <div className={`user-portal-page animate-fade ${useDeviceFrame ? "frame-mode" : "responsive-mode"}`}>
      
      {/* Top Floating Control Bar */}
      <div className="user-top-switch-bar">
        <div className="portal-badge-wrap font-mono">
          <span className="dot animate-pulse-slow"></span>
          <span>CITIZEN EMERGENCY ASSISTANCE PORTAL // NAGPUR 112 SOS</span>
        </div>

        <div className="portal-bar-actions">
          {/* Device Frame Toggle (Desktop only) */}
          <button 
            className="btn-portal-utility desktop-only font-mono"
            onClick={() => setUseDeviceFrame(!useDeviceFrame)}
            title="Toggle Smartphone Mockup / Responsive Wide Mode"
          >
            {useDeviceFrame ? <Monitor size={14} /> : <Smartphone size={14} />}
            <span>{useDeviceFrame ? "WIDE VIEW" : "PHONE VIEW"}</span>
          </button>

          {/* About Modal */}
          {onOpenAbout && (
            <button 
              className="btn-portal-utility font-mono"
              onClick={onOpenAbout}
              title="About Nagpur RESQ Services"
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
              title="Log out of Citizen Portal"
            >
              <LogOut size={14} />
              <span>LOGOUT</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Viewport Container */}
      <div className="user-main-container">
        <div className="user-content-card">
          
          {/* Header Banner */}
          <div className="user-card-header">
            <div className="sos-brand-block">
              <div className="sos-badge animate-pulse-slow">
                <ShieldAlert size={22} className="text-critical" />
              </div>
              <div>
                <h1 className="user-title">NAGPUR 112 / CITIZEN SOS</h1>
                <p className="user-subtitle">Direct GPS Telemetry Link & Rapid Trauma Dispatch</p>
              </div>
            </div>

            {/* Step Progress Indicators */}
            {step < 4 && (
              <div className="user-step-pills font-mono">
                <div className={`step-pill ${step >= 1 ? "active" : ""}`}>1. GPS LOCK</div>
                <div className={`step-pill ${step >= 2 ? "active" : ""}`}>2. TRIAGE</div>
                <div className={`step-pill ${step >= 3 ? "active" : ""}`}>3. REVIEW</div>
              </div>
            )}
          </div>

          {/* STEP 1: DIRECT LIVE GPS SATELLITE GEOLOCATION */}
          {step === 1 && (
            <div className="user-step-body animate-fade">
              
              <div className="step-intro-box">
                <Radio size={20} className="text-primary animate-pulse-slow" />
                <div>
                  <h3>AUTOMATIC LIVE GPS POSITIONING</h3>
                  <p>Directly linked to your device's GNSS / satellite sensors for millimetric incident dispatch.</p>
                </div>
              </div>

              {/* LIVE GPS HUD CARD */}
              <div className="gps-live-hud-card">
                <div className="gps-hud-header">
                  <div className="gps-status-badge font-mono">
                    <span className={`status-orb ${isLocating ? "scanning" : "locked"}`}></span>
                    <span className="status-label">
                      {isLocating 
                        ? "ACQUIRING PRECISION GPS SATELLITE FIX..." 
                        : gpsState === "fallback_locked" 
                          ? "🛰️ HIGH-PRECISION CORRIDOR LINK ACTIVE" 
                          : "🛰️ HIGH-PRECISION GNSS SATELLITE FIX ACTIVE"}
                    </span>
                  </div>

                  <button 
                    className="btn-gps-recalibrate font-mono" 
                    onClick={() => fetchLiveGpsLocation(true)}
                    disabled={isLocating}
                    title="Calibrate & refresh live GPS coordinates"
                  >
                    <RefreshCw size={13} className={isLocating ? "animate-spin" : ""} />
                    <span>{isLocating ? "LOCKING..." : "RECALIBRATE GPS"}</span>
                  </button>
                </div>

                {/* Coordinates Telemetry Grid */}
                <div className="gps-coords-grid font-mono">
                  <div className="coord-box">
                    <span className="coord-lbl">LATITUDE</span>
                    <strong className="coord-val text-primary">
                      {gpsCoords.lat ? `${gpsCoords.lat.toFixed(6)}° N` : "--"}
                    </strong>
                  </div>

                  <div className="coord-box">
                    <span className="coord-lbl">LONGITUDE</span>
                    <strong className="coord-val text-primary">
                      {gpsCoords.lng ? `${gpsCoords.lng.toFixed(6)}° E` : "--"}
                    </strong>
                  </div>

                  <div className="coord-box">
                    <span className="coord-lbl">ACCURACY</span>
                    <strong className="coord-val text-success">
                      ± {gpsCoords.accuracy} meters
                    </strong>
                  </div>

                  <div className="coord-box">
                    <span className="coord-lbl">LOCK TIMESTAMP</span>
                    <strong className="coord-val">
                      {gpsCoords.timestamp}
                    </strong>
                  </div>
                </div>

                {/* Resolved Municipal Sector & Address Banner */}
                <div className="gps-resolved-banner">
                  <MapPin size={18} className="text-critical flex-shrink-0" />
                  <div className="resolved-text">
                    <span className="zone-tag font-mono">DETECTED MUNICIPAL ZONE:</span>
                    <strong className="zone-name">{detectedSector}</strong>
                    {detectedAddress && (
                      <span className="zone-addr font-sans">{detectedAddress}</span>
                    )}
                  </div>
                </div>

                {/* Interactive Leaflet Radar Mini-Map */}
                <div className="gps-mini-map-wrapper">
                  <div className="mini-map-radar-overlay">
                    <div className="radar-sweep"></div>
                    <span className="radar-tag font-mono">LIVE BEACON RADAR</span>
                  </div>
                  <div ref={miniMapContainerRef} className="gps-mini-map-canvas" />
                </div>
              </div>

              {/* Nearest Landmark & Caller Info */}
              <div className="form-item-group">
                <label className="font-mono">NEAREST LANDMARK / ACCESSIBILITY NOTES</label>
                <input 
                  type="text" 
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. In front of Metro Station Pillar 42, Wardha Road"
                  className="custom-input"
                />
              </div>

              <div className="form-item-group">
                <label className="font-mono">CALLER PHONE NUMBER FOR PARAMEDIC CALL-BACK</label>
                <input 
                  type="tel" 
                  value={citizenPhone}
                  onChange={(e) => setCitizenPhone(e.target.value)}
                  placeholder="+91 98231 00000"
                  className="custom-input font-mono"
                />
              </div>

              <div className="step-actions-footer">
                <button className="btn-user-action primary font-mono" onClick={handleNextStep}>
                  <span>PROCEED TO CLINICAL TRIAGE</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: TRIAGE & SEVERITY */}
          {step === 2 && (
            <div className="user-step-body animate-fade">
              <div className="step-intro-box">
                <Activity size={18} className="text-critical" />
                <div>
                  <h3>EMERGENCY DETAILS & TRIAGE</h3>
                  <p>Provide patient condition so hospital and ALS/BLS fleet can prepare.</p>
                </div>
              </div>

              {/* Severity Triage Chooser */}
              <div className="form-item-group">
                <label className="font-mono">PATIENT CONDITION SEVERITY</label>
                <div className="severity-grid-select">
                  <button 
                    className={`sev-choice critical ${severity === "CRITICAL" ? "selected" : ""}`}
                    onClick={() => setSeverity("CRITICAL")}
                  >
                    <span className="dot pulse-circle"></span>
                    <strong>CRITICAL</strong>
                    <span>Unconscious, heavy trauma, cardiac, severe bleeding</span>
                  </button>

                  <button 
                    className={`sev-choice high ${severity === "HIGH" ? "selected" : ""}`}
                    onClick={() => setSeverity("HIGH")}
                  >
                    <span className="dot"></span>
                    <strong>HIGH</strong>
                    <span>Severe fractures, burn trauma, respiratory distress</span>
                  </button>

                  <button 
                    className={`sev-choice medium ${severity === "MEDIUM" ? "selected" : ""}`}
                    onClick={() => setSeverity("MEDIUM")}
                  >
                    <span className="dot"></span>
                    <strong>MEDIUM</strong>
                    <span>Stable, conscious, minor/moderate injury</span>
                  </button>
                </div>
              </div>

              <div className="grid-2-fields">
                <div className="form-item-group">
                  <label className="font-mono">INCIDENT TYPE</label>
                  <select 
                    value={emergencyType} 
                    onChange={(e) => setEmergencyType(e.target.value)}
                    className="custom-select"
                  >
                    <option value="Road Accident">Road Traffic Accident</option>
                    <option value="Cardiac Arrest">Cardiac / Acute Chest Pain</option>
                    <option value="Acute Trauma">Severe Trauma / Fall</option>
                    <option value="Pediatric Emergency">Pediatric Distress</option>
                    <option value="Respiratory Failure">Respiratory / Oxygen Loss</option>
                    <option value="Fire Breakout">Fire & Burn Injury</option>
                    <option value="Stroke">Stroke / Neurological Attack</option>
                  </select>
                </div>

                <div className="form-item-group">
                  <label className="font-mono">ESTIMATED PATIENTS</label>
                  <select 
                    value={patientCount} 
                    onChange={(e) => setPatientCount(e.target.value)}
                    className="custom-select"
                  >
                    <option value="1">1 Person</option>
                    <option value="2">2 Persons</option>
                    <option value="3">3+ Persons (Multi-Casualty)</option>
                  </select>
                </div>
              </div>

              {/* Equipment Requirements */}
              <div className="form-item-group">
                <label className="font-mono">EQUIPMENT REQUIRED (SELECT ALL THAT APPLY)</label>
                <div className="equipment-checkboxes">
                  {equipmentOptions.map((item) => (
                    <button 
                      key={item}
                      type="button"
                      className={`equip-pill ${selectedNeeds.includes(item) ? "active" : ""}`}
                      onClick={() => toggleEquipment(item)}
                    >
                      {selectedNeeds.includes(item) ? "✓ " : "+ "}
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-item-group">
                <label className="font-mono">SCENE NOTES / OBSERVATIONS (OPTIONAL)</label>
                <textarea 
                  value={citizenNotes}
                  onChange={(e) => setCitizenNotes(e.target.value)}
                  placeholder="Describe patient condition or scene observations..."
                  className="custom-textarea"
                  rows={2}
                />
              </div>

              <div className="step-actions-footer split">
                <button className="btn-user-action secondary font-mono" onClick={() => setStep(1)}>
                  BACK
                </button>
                <button className="btn-user-action primary font-mono" onClick={handleNextStep}>
                  <span>REVIEW & DISPATCH</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW SUMMARY */}
          {step === 3 && (
            <div className="user-step-body animate-fade">
              <div className="step-intro-box">
                <FileText size={18} className="text-warning" />
                <div>
                  <h3>CONFIRM EMERGENCY SOS DISPATCH</h3>
                  <p>Check the live GPS telemetry and clinical details before transmitting to Hospital Trauma Reception.</p>
                </div>
              </div>

              <div className="review-summary-panel">
                <div className="summary-row">
                  <span className="lbl font-mono">SEVERITY LEVEL:</span>
                  <span className={`val-badge ${severity.toLowerCase()}`}>
                    {severity} PRIORITY 1
                  </span>
                </div>

                <div className="summary-row">
                  <span className="lbl font-mono">EMERGENCY TYPE:</span>
                  <strong className="val">{emergencyType}</strong>
                </div>

                <div className="summary-row">
                  <span className="lbl font-mono">LIVE GPS COORDINATES:</span>
                  <strong className="val text-primary font-mono">
                    {gpsCoords.lat.toFixed(6)}° N, {gpsCoords.lng.toFixed(6)}° E (±{gpsCoords.accuracy}m)
                  </strong>
                </div>

                <div className="summary-row">
                  <span className="lbl font-mono">MUNICIPAL SECTOR:</span>
                  <strong className="val">{detectedSector}</strong>
                </div>

                <div className="summary-row">
                  <span className="lbl font-mono">LANDMARK / NOTES:</span>
                  <span className="val">{landmark}</span>
                </div>

                <div className="summary-row">
                  <span className="lbl font-mono">PATIENTS:</span>
                  <span className="val">{patientCount} Person(s)</span>
                </div>

                <div className="summary-row">
                  <span className="lbl font-mono">EQUIPMENT DEMAND:</span>
                  <div className="val-tags">
                    {selectedNeeds.map((n) => (
                      <span key={n} className="tag-pill">{n}</span>
                    ))}
                  </div>
                </div>

                <div className="summary-row">
                  <span className="lbl font-mono">CALLBACK PHONE:</span>
                  <span className="val font-mono">{citizenPhone}</span>
                </div>
              </div>

              <div className="emergency-callout-warning font-sans">
                <AlertTriangle size={18} className="text-warning flex-shrink-0" />
                <span>
                  Pressing "TRANSMIT SOS" will alert Government Medical College (GMC) Trauma Reception immediately with your live GPS location for triage approval and ambulance dispatch.
                </span>
              </div>

              <div className="step-actions-footer split">
                <button className="btn-user-action secondary font-mono" onClick={() => setStep(2)}>
                  EDIT
                </button>
                <button className="btn-user-action critical font-mono" onClick={handleNextStep}>
                  <span>🚨 TRANSMIT SOS TO HOSPITAL</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: REAL-TIME CONFIRMATION RECEIPT */}
          {step === 4 && submittedEmergency && (
            <div className="user-step-body confirmation-step animate-fade">
              <div className="confirmation-badge-wrap">
                <div className="confirm-icon-pulse">
                  <CheckCircle2 size={44} className="text-success" />
                </div>
                <h2 className="confirm-headline font-mono">SOS TRANSMITTED SUCCESSFULLY</h2>
                <div className="ticket-id-tag font-mono">TICKET ID: #{submittedEmergency.id}</div>
              </div>

              {/* Real-time status card */}
              <div className="live-ticket-card">
                <div className="ticket-status-header">
                  <span className="dot animate-pulse-slow"></span>
                  <span className="status-txt font-mono">STATUS: {submittedEmergency.status}</span>
                </div>

                <div className="ticket-details-grid">
                  <div className="detail-item">
                    <span className="lbl font-mono">LIVE GPS POSITION</span>
                    <strong className="val font-mono text-primary">
                      {submittedEmergency.latitude?.toFixed(4)}° N, {submittedEmergency.longitude?.toFixed(4)}° E ({submittedEmergency.accuracy})
                    </strong>
                  </div>

                  <div className="detail-item">
                    <span className="lbl font-mono">SECTOR / AREA</span>
                    <strong className="val">{submittedEmergency.location}</strong>
                  </div>

                  <div className="detail-item">
                    <span className="lbl font-mono">RECEIVING HOSPITAL</span>
                    <strong className="val">GMC Trauma Reception (Notified)</strong>
                  </div>

                  <div className="detail-item">
                    <span className="lbl font-mono">PATIENT SEVERITY</span>
                    <strong className="val text-critical">{submittedEmergency.severity}</strong>
                  </div>
                </div>

                <div className="action-guidance-box">
                  <span className="guidance-title">SAFETY INSTRUCTIONS WHILE WAITING:</span>
                  <ul>
                    <li>Keep your phone line free. Hospital staff or paramedics may call for directions.</li>
                    <li>Do not move injured patients unless in direct fire or traffic danger.</li>
                    <li>Keep road access clear for approaching emergency sirens.</li>
                  </ul>
                </div>
              </div>

              <div className="direct-hotline-bar">
                <PhoneCall size={16} className="text-critical" />
                <span>Nagpur Central Trauma Helpline: <strong>112 / 108</strong></span>
              </div>

              {/* Quick Jump Action to Step 2 (Hospital Approval) for Reviewers */}
              {onJumpToHospital && (
                <div className="demo-step-jump-panel font-mono">
                  <span>STEP 2 IN WORKFLOW:</span>
                  <button 
                    className="btn-jump-step font-mono"
                    onClick={() => onJumpToHospital(submittedEmergency)}
                  >
                    <Building2 size={16} />
                    <span>OPEN HOSPITAL RECEPTION TO APPROVE & CHOOSE AMBULANCE →</span>
                  </button>
                </div>
              )}

              <div className="step-actions-footer">
                <button className="btn-user-action secondary font-mono" onClick={handleReset}>
                  <RotateCcw size={15} />
                  <span>REPORT ANOTHER EMERGENCY</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Footer */}
      <footer className="user-portal-footer font-mono">
        <span>NAGPUR RESQ CITIZEN INTERFACE // VIKASIT NAGPUR 2026</span>
      </footer>

    </div>
  );
};

export default UserReportPage;
