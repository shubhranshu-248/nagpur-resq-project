import React from "react";
import { X, CheckCircle, Award } from "lucide-react";
import "./ExplainableDrawer.css";

const ExplainableDrawer = ({ isOpen, onClose, ambulance }) => {
  if (!isOpen || !ambulance) return null;

  const { id, type, score, whyRecommended } = ambulance;

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-container" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="drawer-title-group">
            <Award className="text-primary-icon" size={20} />
            <div>
              <h3 className="drawer-title-text">AI Recommendation Analysis</h3>
              <p className="drawer-subtitle">Why dispatch {id} ({type})?</p>
            </div>
          </div>
          <button className="drawer-close" onClick={onClose} aria-label="Close panel">
            <X size={20} />
          </button>
        </div>

        <div className="drawer-body">
          {/* Circular Score Badge */}
          <div className="score-summary-box">
            <div className="score-circle">
              <span className="score-num">{score}</span>
              <span className="score-total">/100</span>
            </div>
            <div className="score-label">
              <h4>Suitability Score</h4>
              <p>Highly matched capability and proximity metrics.</p>
            </div>
          </div>

          {/* Breakdown items */}
          {whyRecommended && (
            <div className="score-breakdown-section">
              <h4 className="section-title-small">METRICS BREAKDOWN</h4>
              <div className="breakdown-list">
                <div className="breakdown-item">
                  <div className="breakdown-lbl-group">
                    <span className="item-num">01</span>
                    <span>Estimated Arrival Time (ETA)</span>
                  </div>
                  <span className="breakdown-score font-mono">{whyRecommended.etaScore}</span>
                </div>

                <div className="breakdown-item">
                  <div className="breakdown-lbl-group">
                    <span className="item-num">02</span>
                    <span>Distance Proximity</span>
                  </div>
                  <span className="breakdown-score font-mono">{whyRecommended.distScore}</span>
                </div>

                <div className="breakdown-item">
                  <div className="breakdown-lbl-group">
                    <span className="item-num">03</span>
                    <span>Onboard Medical Equipment</span>
                  </div>
                  <span className="breakdown-score font-mono">{whyRecommended.equipScore}</span>
                </div>

                <div className="breakdown-item">
                  <div className="breakdown-lbl-group">
                    <span className="item-num">04</span>
                    <span>Staff Skill Suitability</span>
                  </div>
                  <span className="breakdown-score font-mono">{whyRecommended.capScore}</span>
                </div>

                <div className="breakdown-item">
                  <div className="breakdown-lbl-group">
                    <span className="item-num">05</span>
                    <span>Active Sector Availability</span>
                  </div>
                  <span className="breakdown-score font-mono">{whyRecommended.availScore}</span>
                </div>

                <div className="breakdown-item">
                  <div className="breakdown-lbl-group">
                    <span className="item-num">06</span>
                    <span>Traffic/Route Risk Assessment</span>
                  </div>
                  <span className="breakdown-score font-mono">{whyRecommended.routeScore}</span>
                </div>
              </div>
            </div>
          )}

          {/* Bullets */}
          {whyRecommended && whyRecommended.bullets && (
            <div className="ai-bullets-section">
              <h4 className="section-title-small">KEY SUITABILITY MATCHES</h4>
              <ul className="bullets-list">
                {whyRecommended.bullets.map((bullet, idx) => (
                  <li key={idx} className="bullet-item">
                    <CheckCircle className="bullet-success-icon" size={14} />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="drawer-footer">
          <button className="btn-drawer-dismiss" onClick={onClose}>
            Close Analysis
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExplainableDrawer;
