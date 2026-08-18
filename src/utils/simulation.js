// Nagpur Resq - Hackathon Simulation Timelines Configuration
// Easy to read and adapt for B.Tech CSE students

export const DEMO_STEPS = [
  {
    stepNum: 1,
    timeLabel: "0 sec",
    title: "Emergency Appears",
    desc: "Critical incident (Road Accident at Sitabuldi) registered on Dispatch dashboard.",
    elapsedSeconds: 0
  },
  {
    stepNum: 2,
    timeLabel: "10 sec",
    title: "AI Assessment",
    desc: "AI engines parse coordinates and assess patient severity (CRITICAL status).",
    elapsedSeconds: 10
  },
  {
    stepNum: 3,
    timeLabel: "20 sec",
    title: "Ambulances Ranked",
    desc: "ITMS queries active fleet and ranks units by proximity and support gears.",
    elapsedSeconds: 20
  },
  {
    stepNum: 4,
    timeLabel: "30 sec",
    title: "Nearest Rejected",
    desc: "Ambulance A-109 (BLS) flagged: Nearest but unsuitable due to lack of ICU.",
    elapsedSeconds: 30
  },
  {
    stepNum: 5,
    timeLabel: "40 sec",
    title: "Explainable AI Match",
    desc: "Dispatcher inspects A-104 (ALS) scorecard details (Score: 92/100).",
    elapsedSeconds: 40
  },
  {
    stepNum: 6,
    timeLabel: "50 sec",
    title: "Hospital Selected",
    desc: "GMC Hospital Level 1 Trauma Center selected (Clinical Match: 98%).",
    elapsedSeconds: 50
  },
  {
    stepNum: 7,
    timeLabel: "60 sec",
    title: "Route Generated",
    desc: "Route V1 calculated along Wardha Road. Corridor overridden.",
    elapsedSeconds: 60
  },
  {
    stepNum: 8,
    timeLabel: "75 sec",
    title: "Green Corridor Active",
    desc: "Municipal signals synched. Dispatcher clicks 'Start Mission'.",
    elapsedSeconds: 75
  },
  {
    stepNum: 9,
    timeLabel: "90 sec",
    title: "Ambulance Moving",
    desc: "Ambulance A-104 en route. Live ETA: 08:42, Dist: 6.4 km, Speed: 54 km/h.",
    elapsedSeconds: 90
  },
  {
    stepNum: 10,
    timeLabel: "110 sec",
    title: "Traffic Blockage Anomaly",
    desc: "Disruption detected ahead. ETA jumps to 12:16. Status: RECALCULATING...",
    elapsedSeconds: 110
  },
  {
    stepNum: 11,
    timeLabel: "120 sec",
    title: "Route Recalculated",
    desc: "New bypass path generated. ETA reduced to 09:18 (2 mins 58 secs recovered).",
    elapsedSeconds: 120
  },
  {
    stepNum: 12,
    timeLabel: "130 sec",
    title: "Route V2 Activated",
    desc: "Alternative bypass accepted. GMC Hospital notified. Toast: 'Hospital ETA updated.'",
    elapsedSeconds: 130
  },
  {
    stepNum: 13,
    timeLabel: "140 sec",
    title: "New Corridor Overrides",
    desc: "Corridor path V2 overrides active (Signal 04, 05, 06 overridden).",
    elapsedSeconds: 140
  },
  {
    stepNum: 14,
    timeLabel: "150 sec",
    title: "Junctions Passed",
    desc: "Ambulance transit log: passing bypass junctions. Distance down to 1.2 km.",
    elapsedSeconds: 150
  },
  {
    stepNum: 15,
    timeLabel: "160 sec",
    title: "Hospital pre-alert",
    desc: "GMC trauma staff acknowledged incoming patient status.",
    elapsedSeconds: 160
  },
  {
    stepNum: 16,
    timeLabel: "175 sec",
    title: "Arrival GMC Hospital",
    desc: "Ambulance safely reached destination. Status: ARRIVED.",
    elapsedSeconds: 175
  },
  {
    stepNum: 17,
    timeLabel: "180 sec",
    title: "Mission Completed",
    desc: "Redirecting to final Analytics overview showing 06:21 mins saved.",
    elapsedSeconds: 180
  }
];

// Helper to determine active step based on elapsed seconds
export const getActiveStepIndex = (seconds) => {
  let activeIndex = 0;
  for (let i = 0; i < DEMO_STEPS.length; i++) {
    if (seconds >= DEMO_STEPS[i].elapsedSeconds) {
      activeIndex = i;
    } else {
      break;
    }
  }
  return activeIndex;
};
