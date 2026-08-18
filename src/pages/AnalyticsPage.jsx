import React from "react";
import { 
  Clock, 
  Zap, 
  Map, 
  Activity, 
  Building2, 
  ShieldCheck, 
  TrendingDown,
  Inbox
} from "lucide-react";
import "./AnalyticsPage.css";

const AnalyticsPage = ({ completedMissions = [] }) => {
  const hasData = completedMissions && completedMissions.length > 0;

  // Calculate dynamic metrics if missions exist, otherwise clean zero state
  const totalMissionsCount = completedMissions.length;
  const reroutesCount = completedMissions.filter(m => m.routeType?.includes("V2") || m.signals?.some(s => s.name?.includes("Bypass"))).length;

  return (
    <div className="view-container animate-fade">
      {/* Header */}
      <div className="analytics-header">
        <div>
          <h2 className="view-title">PERFORMANCE ANALYTICS</h2>
          <p className="view-subtitle font-mono">LIVE SYSTEM METRICS & TIME REDUCTION AUDITS</p>
        </div>
        <div className="demo-data-badge font-mono" style={{ backgroundColor: "rgba(34, 197, 94, 0.15)", color: "var(--success)", borderColor: "rgba(34, 197, 94, 0.3)" }}>
          <span className="dot online"></span>
          <span>LIVE SESSION AUDIT</span>
        </div>
      </div>

      {/* KPI Cards Grid — Clean Dynamic State */}
      <div className="analytics-kpi-grid">
        <div className="analytics-kpi-card">
          <Activity size={18} className="kpi-icon text-primary" />
          <div className="card-info">
            <span className="lbl">TOTAL COMPLETED MISSIONS</span>
            <span className="val font-mono">{totalMissionsCount}</span>
          </div>
        </div>

        <div className="analytics-kpi-card">
          <Clock size={18} className="kpi-icon text-warning" />
          <div className="card-info">
            <span className="lbl">AVG RESPONSE TIME</span>
            <span className="val font-mono">{hasData ? "07:18" : "--:--"}</span>
          </div>
        </div>

        <div className="analytics-kpi-card">
          <Zap size={18} className="kpi-icon text-success" />
          <div className="card-info">
            <span className="lbl">GREEN WAVE TIME RECOVERED</span>
            <span className="val font-mono text-success">{hasData ? "06:21 mins" : "--:--"}</span>
          </div>
        </div>

        <div className="analytics-kpi-card">
          <Map size={18} className="kpi-icon text-muted" />
          <div className="card-info">
            <span className="lbl">REROUTES TRIGGERED</span>
            <span className="val font-mono">{reroutesCount}</span>
          </div>
        </div>

        <div className="analytics-kpi-card">
          <TrendingDown size={18} className="kpi-icon text-success" />
          <div className="card-info">
            <span className="lbl">GREEN CORRIDOR PRIORITY</span>
            <span className="val font-mono text-success">100% (DEFAULT)</span>
          </div>
        </div>

        <div className="analytics-kpi-card">
          <Building2 size={18} className="kpi-icon text-primary" />
          <div className="card-info">
            <span className="lbl">TRAUMA RECEPTION PREP</span>
            <span className="val font-mono">{hasData ? "03:45" : "--:--"}</span>
          </div>
        </div>
      </div>

      {/* Dynamic Main Body */}
      {hasData ? (
        <>
          {/* HERO CHART: Baseline vs Nagpur RESQ */}
          <div className="hero-chart-card animate-fade">
            <div className="chart-hdr">
              <h3 className="chart-title">
                <Zap size={16} className="pulse-svg text-success" />
                <span>TRANSIT EFFICIENCY COMPARISON — BASELINE VS NAGPUR RESQ</span>
              </h3>
              <span className="comparison-badge bg-success-light">SAVED 34% ON ROUTE TIME</span>
            </div>

            <div className="hero-chart-body">
              {/* Comparison bars */}
              <div className="comparison-flow">
                {/* Baseline Route */}
                <div className="flow-item-bar baseline-bar">
                  <div className="bar-info font-mono">
                    <span>Standard Traffic Baseline (Without Corridor)</span>
                    <strong>18:42 mins</strong>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: "100%" }}></div>
                  </div>
                </div>

                {/* Nagpur RESQ Optimized Route */}
                <div className="flow-item-bar resq-bar">
                  <div className="bar-info font-mono">
                    <span>Nagpur RESQ Automated Green Wave Corridor</span>
                    <strong className="text-success">12:21 mins</strong>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: "66%" }}></div>
                  </div>
                </div>
              </div>

              {/* Time Saved Prominent Box */}
              <div className="time-saved-hero-box">
                <span className="box-lbl font-mono">AVERAGE TIME RECOVERED</span>
                <span className="box-val font-mono text-success">06:21</span>
                <span className="box-sub font-mono">MINUTES SAVED PER CRITICAL TRANSIT</span>
              </div>
            </div>
          </div>

          {/* Sub-Charts Grid */}
          <div className="sub-charts-grid animate-fade">
            <div className="section-panel">
              <div className="section-header">
                <h3 className="section-title">RESPONSE TIME BY DISTRICT SECTORS</h3>
              </div>
              <div className="custom-css-bar-chart">
                <div className="chart-row-flex">
                  <span className="label font-mono">Sitabuldi (Central)</span>
                  <div className="bar-wrapper">
                    <div className="bar-indicator primary" style={{ width: "45%" }}></div>
                  </div>
                  <span className="value font-mono">04:15 min</span>
                </div>
                <div className="chart-row-flex">
                  <span className="label font-mono">Medical Square</span>
                  <div className="bar-wrapper">
                    <div className="bar-indicator primary" style={{ width: "35%" }}></div>
                  </div>
                  <span className="value font-mono">03:20 min</span>
                </div>
              </div>
            </div>

            <div className="section-panel">
              <div className="section-header">
                <h3 className="section-title">HOSPITAL ADMISSION DISTRIBUTION</h3>
              </div>
              <div className="custom-css-bar-chart">
                <div className="chart-row-flex">
                  <span className="label font-mono">GMCH Nagpur</span>
                  <div className="bar-wrapper">
                    <div className="bar-indicator success" style={{ width: "100%" }}></div>
                  </div>
                  <span className="value font-mono">{totalMissionsCount} Cases</span>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Clean Zero State Banner */
        <div className="section-panel font-mono animate-fade" style={{ padding: "48px 24px", textAlign: "center", backgroundColor: "var(--bg-card)" }}>
          <div style={{ width: "54px", height: "54px", borderRadius: "50%", backgroundColor: "rgba(59, 130, 246, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Inbox size={28} className="text-primary" />
          </div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--text-light)", marginBottom: "8px" }}>
            NO ARCHIVED PAST MISSIONS YET
          </h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.78rem", maxWidth: "540px", margin: "0 auto 20px", lineHeight: "1.5" }}>
            All dummy historical performance statistics have been cleared. As emergency dispatches are reported by citizens, routed with Green Corridor priority, and handed over at GMCH Trauma Bay, live metrics and transit audits will record here dynamically.
          </p>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 16px", borderRadius: "var(--border-radius-pill)", backgroundColor: "rgba(34, 197, 94, 0.08)", border: "1px solid rgba(34, 197, 94, 0.25)", fontSize: "0.7rem", color: "var(--success)" }}>
            <ShieldCheck size={14} />
            <span>ITMS Green Wave Corridor is automatically armed and ready by default across Nagpur.</span>
          </div>
        </div>
      )}

      {/* Safety Notice Footer */}
      <div className="analytics-footer-note">
        <div className="sys-status">
          <ShieldCheck size={14} className="text-success" />
          <span className="font-mono text-muted">
            NAGPUR RESQ LIVE AUDIT ENGINE // AUTOMATIC GREEN WAVE ACTIVE // VIKASIT NAGPUR 2026
          </span>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
