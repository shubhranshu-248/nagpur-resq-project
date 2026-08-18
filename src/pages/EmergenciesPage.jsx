import React, { useState } from "react";
import { PlusCircle, Search, Filter, ShieldAlert } from "lucide-react";
import EmergencyCard from "../components/EmergencyCard";
import "./EmergenciesPage.css";

const EmergenciesPage = ({ emergencies, onCreateNewClick, onViewMission, onStartDispatch }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("ALL");

  // Filter based on search query and severity
  const filteredEmergencies = emergencies.filter((emergency) => {
    const matchesSearch = 
      emergency.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emergency.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emergency.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSeverity = 
      severityFilter === "ALL" || 
      emergency.severity.toUpperCase() === severityFilter.toUpperCase();

    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="view-container">
      <div className="emergencies-page-header">
        <div>
          <h2 className="view-title">Emergency Orchestration Center</h2>
          <p className="view-subtitle">Monitor and dispatch active incidents across the Nagpur municipal network.</p>
        </div>
        <button className="btn-create-emergency-trigger" onClick={onCreateNewClick}>
          <PlusCircle size={16} />
          <span>CREATE EMERGENCY</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="search-filter-controls">
        <div className="search-box-wrapper">
          <Search size={16} className="search-input-icon" />
          <input 
            type="text" 
            placeholder="Search by ID, type, or sector..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input-field"
          />
        </div>

        <div className="filter-group">
          <Filter size={14} className="filter-icon" />
          <button 
            className={`filter-tab ${severityFilter === "ALL" ? "active" : ""}`}
            onClick={() => setSeverityFilter("ALL")}
          >
            All
          </button>
          <button 
            className={`filter-tab ${severityFilter === "CRITICAL" ? "active" : ""}`}
            onClick={() => setSeverityFilter("CRITICAL")}
          >
            Critical
          </button>
          <button 
            className={`filter-tab ${severityFilter === "HIGH" ? "active" : ""}`}
            onClick={() => setSeverityFilter("HIGH")}
          >
            High
          </button>
          <button 
            className={`filter-tab ${severityFilter === "WARNING" ? "active" : ""}`}
            onClick={() => setSeverityFilter("WARNING")}
          >
            Warning
          </button>
        </div>
      </div>

      {/* Grid of Incidents */}
      {filteredEmergencies.length > 0 ? (
        <div className="grid-3-col">
          {filteredEmergencies.map((emergency) => (
            <EmergencyCard 
              key={emergency.id} 
              emergency={emergency} 
              onViewMission={onViewMission}
              onStartDispatch={onStartDispatch}
            />
          ))}
        </div>
      ) : (
        <div className="no-records-panel">
          <ShieldAlert size={36} className="no-records-icon" />
          <h3>No Incidents Found</h3>
          <p>Verify filters or check the system logs. Or create a new emergency ticket using the button above.</p>
        </div>
      )}
    </div>
  );
};

export default EmergenciesPage;
