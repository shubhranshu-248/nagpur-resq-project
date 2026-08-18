import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";
import { Layers, Globe, Eye } from "lucide-react";
import { AMBULANCES, HOSPITALS, TRAFFIC_SIGNALS } from "../data/mockData";
import "leaflet/dist/leaflet.css";
import "./MapSection.css";

// Fix standard Leaflet default icon asset paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom HTML DivIcon constructor for vehicle & location pins
const createCustomIcon = (emoji, color, isPulse = false) => {
  return L.divIcon({
    className: "custom-map-icon-container",
    html: `
      <div class="custom-map-marker ${isPulse ? 'pulse-marker' : ''}" style="border-color: ${color}; box-shadow: 0 0 12px ${color}88;">
        <span class="marker-emoji">${emoji}</span>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20]
  });
};

const MapSection = ({ activeMission }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const activeAmbulanceMarkerRef = useRef(null);
  const fleetMarkersRef = useRef([]);
  const incidentMarkerRef = useRef(null);
  const hospitalMarkerRef = useRef(null);
  const polylineV1Ref = useRef(null);
  const polylineV2Ref = useRef(null);
  const streetLayerRef = useRef(null);
  const satelliteLayerRef = useRef(null);

  const [mapLayer, setMapLayer] = useState("satellite"); // 'satellite' | 'streets'
  const [showLegendMobile, setShowLegendMobile] = useState(false);

  // Nagpur center coordinates (Sitabuldi - Wardha Road Corridor)
  const nagpurCenter = [21.1458, 79.0882];

  // Default corridor key waypoints
  const defaultPoints = {
    sitabuldi: [21.1458, 79.0882],
    wardhaCrossing: [21.1370, 79.0830],
    congressNagar: [21.1310, 79.0860],
    rahateColony: [21.1250, 79.0780],
    gmcHospital: [21.1275, 79.0988],
    aiimsNagpur: [21.0378, 79.0322]
  };

  // Compute dynamic primary and bypass routes based on active mission coordinates
  const getMissionRoutes = () => {
    if (!activeMission) {
      return {
        primary: [
          defaultPoints.sitabuldi,
          defaultPoints.wardhaCrossing,
          defaultPoints.congressNagar,
          defaultPoints.gmcHospital
        ],
        bypass: [
          defaultPoints.sitabuldi,
          [21.1420, 79.0790],
          [21.1300, 79.0820],
          defaultPoints.congressNagar,
          defaultPoints.gmcHospital
        ]
      };
    }

    const start = [
      activeMission.ambulance?.latitude || defaultPoints.sitabuldi[0],
      activeMission.ambulance?.longitude || defaultPoints.sitabuldi[1]
    ];
    const incident = [
      activeMission.emergency?.latitude || defaultPoints.sitabuldi[0],
      activeMission.emergency?.longitude || defaultPoints.sitabuldi[1]
    ];
    const destination = [
      activeMission.hospital?.latitude || defaultPoints.gmcHospital[0],
      activeMission.hospital?.longitude || defaultPoints.gmcHospital[1]
    ];

    const primary = [
      start,
      incident,
      defaultPoints.wardhaCrossing,
      defaultPoints.congressNagar,
      destination
    ];

    const bypass = [
      start,
      incident,
      [21.1420, 79.0790],
      defaultPoints.rahateColony,
      destination
    ];

    return { primary, bypass };
  };

  // Interpolate ambulance live position along the route
  const getAmbulancePosition = () => {
    if (!activeMission) {
      return [AMBULANCES[0]?.latitude || 21.1458, AMBULANCES[0]?.longitude || 79.0882];
    }

    const { primary, bypass } = getMissionRoutes();
    const isRerouted = activeMission.signals?.some(s => s.name && s.name.includes("Bypass"));
    const currentRoute = isRerouted ? bypass : primary;

    const distanceNum = parseFloat(activeMission.telemetry?.distance || "0");
    const totalDist = 4.8;
    // Progress from 0 (at start) to 1 (at hospital arrival)
    const progress = Math.max(0, Math.min(1, (totalDist - distanceNum) / totalDist));

    if (currentRoute.length < 2) return currentRoute[0];

    const segCount = currentRoute.length - 1;
    const segIdx = Math.min(Math.floor(progress * segCount), segCount - 1);
    const segProgress = (progress * segCount) - segIdx;

    const startPt = currentRoute[segIdx];
    const endPt = currentRoute[segIdx + 1];

    const lat = startPt[0] + (endPt[0] - startPt[0]) * segProgress;
    const lng = startPt[1] + (endPt[1] - startPt[1]) * segProgress;

    return [lat, lng];
  };

  const isRerouted = activeMission?.signals?.some(s => s.name && s.name.includes("Bypass"));

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: nagpurCenter,
        zoom: 13,
        scrollWheelZoom: true
      });

      // Street Layer
      const streetLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap'
      });
      streetLayerRef.current = streetLayer;

      // Satellite Layer (Esri World Imagery)
      const satelliteLayer = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        { attribution: '&copy; Esri, Maxar, Earthstar Geographics' }
      );
      satelliteLayerRef.current = satelliteLayer;

      // Default to satellite layer
      satelliteLayer.addTo(map);

      // Add Top Nagpur Hospitals Markers
      HOSPITALS.slice(0, 6).forEach((hosp) => {
        const hMarker = L.marker([hosp.latitude, hosp.longitude], {
          icon: createCustomIcon("🏥", "var(--success)")
        }).addTo(map);

        hMarker.bindPopup(`
          <div style="font-family: monospace; font-size: 11px; color: #0f172a; padding: 2px;">
            <strong style="color: #16a34a;">${hosp.name}</strong><br />
            Sector: ${hosp.sector} | Trauma: ${hosp.traumaLevel}<br />
            ICU Beds: ${hosp.icuBeds} | O2: ${hosp.oxygen}
          </div>
        `);
      });

      // Add ITMS Traffic Signal Waypoints
      TRAFFIC_SIGNALS.slice(0, 5).forEach((sig) => {
        L.circleMarker([sig.latitude, sig.longitude], {
          radius: 6,
          color: "#22C55E",
          fillColor: "#22C55E",
          fillOpacity: 0.85,
          weight: 2
        }).addTo(map).bindPopup(`
          <div style="font-family: monospace; font-size: 11px; color: #0f172a;">
            <strong>🚦 ${sig.id}: ${sig.name}</strong><br/>
            ITMS Green Corridor Override Ready
          </div>
        `);
      });

      // Emergency Incident Marker
      const incidentPos = [
        activeMission?.emergency?.latitude || defaultPoints.sitabuldi[0],
        activeMission?.emergency?.longitude || defaultPoints.sitabuldi[1]
      ];
      const incidentMarker = L.marker(incidentPos, {
        icon: createCustomIcon("🚨", "var(--critical)", true)
      }).addTo(map);

      incidentMarker.bindPopup(`
        <div style="font-family: monospace; font-size: 11px; color: #0f172a;">
          <strong style="color: #dc2626;">🚨 Emergency Incident Pickup Location</strong><br />
          ${activeMission?.emergency?.location || "Sitabuldi Metro Station"}<br />
          Live GPS: ${incidentPos[0].toFixed(4)}° N, ${incidentPos[1].toFixed(4)}° E
        </div>
      `);
      incidentMarkerRef.current = incidentMarker;

      // Routes Polylines
      const { primary, bypass } = getMissionRoutes();

      const polyV1 = L.polyline(primary, {
        color: "#3B82F6",
        weight: 6,
        opacity: 0.85
      }).addTo(map);
      polylineV1Ref.current = polyV1;

      const polyV2 = L.polyline(bypass, {
        color: "#22C55E",
        weight: 6,
        opacity: 0.0
      }).addTo(map);
      polylineV2Ref.current = polyV2;

      // Active Ambulance Moving Marker
      const initialAmbPos = getAmbulancePosition();
      const ambMarker = L.marker(initialAmbPos, {
        icon: createCustomIcon("🚑", "var(--warning)", true)
      }).addTo(map);

      ambMarker.bindPopup(`
        <div style="font-family: monospace; font-size: 11px; color: #0f172a;">
          <strong style="color: #d97706;">Ambulance Unit ${activeMission?.ambulance?.id || "A-104"} (${activeMission?.ambulance?.type || "ALS"})</strong><br />
          Driver: ${activeMission?.ambulance?.driver || "Sanjay Deshmukh"}<br />
          Telemetry: ${activeMission?.telemetry?.speed || "58 km/h"} | Status: ${activeMission?.telemetry?.status || "EN ROUTE"}
        </div>
      `);
      activeAmbulanceMarkerRef.current = ambMarker;

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update ambulance position, polylines, and popups on every telemetry tick
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const newPos = getAmbulancePosition();

    // Update active moving ambulance marker
    if (activeAmbulanceMarkerRef.current) {
      activeAmbulanceMarkerRef.current.setLatLng(newPos);

      if (activeMission) {
        activeAmbulanceMarkerRef.current.setPopupContent(`
          <div style="font-family: monospace; font-size: 11px; color: #0f172a;">
            <strong style="color: #d97706;">🚑 Ambulance ${activeMission.ambulance?.id || "A-104"}</strong><br />
            Speed: ${activeMission.telemetry?.speed || "58 km/h"} | ETA: ${activeMission.telemetry?.eta || "07:18"}<br/>
            Distance Left: ${activeMission.telemetry?.distance || "4.8"} km<br/>
            Status: <span style="color: #2563eb; font-weight: bold;">${activeMission.telemetry?.status || "EN ROUTE"}</span>
          </div>
        `);
      }
    }

    // Update incident marker position if custom GPS coords
    if (incidentMarkerRef.current && activeMission?.emergency) {
      const incPos = [
        activeMission.emergency.latitude || defaultPoints.sitabuldi[0],
        activeMission.emergency.longitude || defaultPoints.sitabuldi[1]
      ];
      incidentMarkerRef.current.setLatLng(incPos);
    }

    // Update routes and style
    const { primary, bypass } = getMissionRoutes();

    if (polylineV1Ref.current) {
      polylineV1Ref.current.setLatLngs(primary);
      if (isRerouted) {
        polylineV1Ref.current.setStyle({ opacity: 0.25, dashArray: "6, 8" });
      } else {
        polylineV1Ref.current.setStyle({ opacity: 0.9, dashArray: "" });
      }
    }

    if (polylineV2Ref.current) {
      polylineV2Ref.current.setLatLngs(bypass);
      if (isRerouted) {
        polylineV2Ref.current.setStyle({ opacity: 0.95 });
      } else {
        polylineV2Ref.current.setStyle({ opacity: 0.0 });
      }
    }
  }, [activeMission?.telemetry?.distance, activeMission?.telemetry?.speed, isRerouted]);

  // Handle Layer Toggle (Satellite vs Street)
  const toggleMapLayer = (layerType) => {
    if (!mapInstanceRef.current) return;
    setMapLayer(layerType);

    if (layerType === "satellite") {
      if (streetLayerRef.current) mapInstanceRef.current.removeLayer(streetLayerRef.current);
      if (satelliteLayerRef.current) satelliteLayerRef.current.addTo(mapInstanceRef.current);
    } else {
      if (satelliteLayerRef.current) mapInstanceRef.current.removeLayer(satelliteLayerRef.current);
      if (streetLayerRef.current) streetLayerRef.current.addTo(mapInstanceRef.current);
    }
  };

  return (
    <div className="map-container">
      {/* Map Header */}
      <div className="map-header">
        <div className="map-title font-mono">
          <span className="dot animate-pulse-slow"></span>
          <span>NAGPUR DETAILED SATELLITE & ITMS RADAR</span>
        </div>

        <div className="map-header-tools">
          {/* Satellite / Street Layer Switcher */}
          <div className="map-layer-switch font-mono">
            <button 
              className={`layer-btn ${mapLayer === "satellite" ? "active" : ""}`}
              onClick={() => toggleMapLayer("satellite")}
              title="High-Resolution Satellite Imagery"
            >
              <Globe size={12} />
              <span>SATELLITE</span>
            </button>
            <button 
              className={`layer-btn ${mapLayer === "streets" ? "active" : ""}`}
              onClick={() => toggleMapLayer("streets")}
              title="Street Map View"
            >
              <Eye size={12} />
              <span>STREETS</span>
            </button>
          </div>

          <button 
            className="btn-map-tool mobile-only font-mono"
            onClick={() => setShowLegendMobile(!showLegendMobile)}
          >
            <Layers size={13} />
            <span>LEGEND {showLegendMobile ? "▲" : "▼"}</span>
          </button>

          <div className="map-legend desktop-only font-mono">
            <div className="legend-item">
              <span className="legend-dot amb"></span>
              <span>Ambulance</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot hosp"></span>
              <span>Hospitals</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot inc"></span>
              <span>Incident</span>
            </div>
            <div className="legend-item">
              <span className="legend-line v1"></span>
              <span>Route V1</span>
            </div>
            <div className="legend-item">
              <span className="legend-line v2"></span>
              <span>Route V2 Bypass</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Collapsible Legend Drawer */}
      {showLegendMobile && (
        <div className="mobile-map-legend-drawer font-mono animate-fade">
          <div className="legend-item"><span className="legend-dot amb"></span><span>Ambulance</span></div>
          <div className="legend-item"><span className="legend-dot hosp"></span><span>GMCH / AIIMS Hospitals</span></div>
          <div className="legend-item"><span className="legend-dot inc"></span><span>Incident Point</span></div>
          <div className="legend-item"><span className="legend-line v1"></span><span>Route V1 (Wardha Rd)</span></div>
          <div className="legend-item"><span className="legend-line v2"></span><span>Route V2 (Bypass)</span></div>
        </div>
      )}

      {/* Leaflet Map Canvas */}
      <div className="map-canvas-wrapper">
        <div ref={mapContainerRef} className="leaflet-map-canvas" />

        {/* Live Floating Telemetry Overlay on Map */}
        {activeMission && (
          <div className="map-floating-telemetry-badge font-mono animate-fade">
            <div className="tel-line">
              <span className="lbl">UNIT:</span>
              <strong className="val text-warning">{activeMission.ambulance?.id || "A-104"} ({activeMission.ambulance?.type || "ALS"})</strong>
            </div>
            <div className="tel-line">
              <span className="lbl">ETA:</span>
              <strong className="val text-primary">{activeMission.telemetry?.eta || "07:18"}</strong>
            </div>
            <div className="tel-line">
              <span className="lbl">DIST:</span>
              <strong className="val">{activeMission.telemetry?.distance || "4.8"} km</strong>
            </div>
            <div className="tel-line">
              <span className="lbl">ROUTE:</span>
              <strong className="val text-success">{isRerouted ? "V2 Bypass" : "V1 Primary"}</strong>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default MapSection;
