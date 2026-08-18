import React from "react";
import { 
  Smartphone, 
  Tv, 
  Cpu, 
  Navigation, 
  TrafficCone, 
  Terminal, 
  BarChart3,
  Heart
} from "lucide-react";
import "./AboutPage.css";

const AboutPage = () => {
  const services = [
    {
      icon: <Smartphone className="service-ico" size={24} />,
      title: "Citizen Emergency Portal",
      desc: "A mobile-first entry page enabling citizens under stress to quickly submit emergency requests. Directly links to device GPS to capture live high-precision GNSS coordinates (Latitude/Longitude, ±m accuracy), auto-resolves municipal sectors, patient count, note feeds, and equipment demands."
    },
    {
      icon: <Tv className="service-ico" size={24} />,
      title: "Command Control Centre",
      desc: "A multi-widget dashboard displaying dynamic KPI metrics, hospital trauma bed capacities, active dispatches, and a live Nagpur sector highway grid map overlay."
    },
    {
      icon: <Cpu className="service-ico" size={24} />,
      title: "AI Resource Dispatcher",
      desc: "Advanced clinical matching engine that filters and ranks fleet ambulances. Uses compatibility checklists to avoid dispatching Basic Life Support (BLS) units to critical ICU emergencies, providing explainable AI scorecards for dispatcher verification."
    },
    {
      icon: <Navigation className="service-ico" size={24} />,
      title: "Bypass Route Recalculator",
      desc: "Real-time traffic incident monitoring. When route disruptions are simulated, the system calculates alternative bypass routes (Route V2) to recover lost travel time, updating arrival estimates on the fly."
    },
    {
      icon: <TrafficCone className="service-ico" size={24} />,
      title: "ITMS Green Corridor",
      desc: "An intelligent traffic management system override board. Synchronizes priority traffic lights along active routes, shifting signals to green as the vehicle approaches municipal crossings."
    },
    {
      icon: <Terminal className="service-ico" size={24} />,
      title: "Driver HUD Console",
      desc: "Replicates driver cabin mobile dashboards showing active speeds and impending signals. Built with mock troubleshooting tools to simulate GPS signal staleness or network disconnects."
    },
    {
      icon: <Terminal className="service-ico" size={24} style={{ opacity: 0.7 }} />,
      title: "Operations Terminal",
      desc: "A raw monospace terminal feed displaying live municipal interception logs for data verification and technical debugging."
    },
    {
      icon: <BarChart3 className="service-ico" size={24} />,
      title: "Auditing Performance Analytics",
      desc: "Comparative custom graphs auditing emergency transit metrics. Renders baseline durations vs RESQ times to visualize critical time saved across sector lanes."
    }
  ];

  return (
    <div className="view-container about-page-wrapper animate-fade">
      <div className="about-header">
        <h2 className="view-title">About Nagpur RESQ Services</h2>
        <p className="view-subtitle">
          Nagpur RESQ is an integrated Emergency Response Orchestration platform designed to coordinate municipal emergency resources from the moment of report to clinical treatment.
        </p>
      </div>

      <div className="services-grid">
        {services.map((service, index) => (
          <div key={index} className="service-card">
            <div className="service-header-row">
              <div className="service-icon-wrapper">
                {service.icon}
              </div>
              <h4 className="service-card-title">{service.title}</h4>
            </div>
            <p className="service-card-desc">{service.desc}</p>
          </div>
        ))}
      </div>

      <div className="about-footer-panel">
        <div className="footer-tagline-group">
          <Heart size={20} className="text-critical animate-pulse-slow" />
          <h3 className="brand-tagline">"From Incident to Treatment — Every Second Coordinated."</h3>
        </div>
        <p className="footer-disclaimer font-mono">
          🟣 PROTOTYPE SIMULATION SYSTEM — Developed for educational purposes and hackathon demonstration testing.
        </p>
      </div>
    </div>
  );
};

export default AboutPage;
