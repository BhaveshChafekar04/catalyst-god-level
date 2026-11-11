/* ============================================================
   CATALYST — domain data layer
   ------------------------------------------------------------
   A single repository interface the UI talks to. Today every
   method resolves from a local seed set + browser store. To go
   live, replace the bodies with fetch() calls against the
   endpoints documented in BACKEND.md — the signatures and the
   returned shapes are deliberately API-shaped (async, paginated,
   error-throwing) so no view code has to change.
   ============================================================ */
(function () {
  "use strict";
  var C = window.CATALYST;

  var ASSET = "assets/img/evidence/";

  /* ----------------------------------------------------------
     SEED CHALLENGES
     ---------------------------------------------------------- */
  var CHALLENGES = [
    {
      id: "CH-2418",
      title: "Contaminated well water in Ward 14",
      slug: "contaminated-well-water-ward-14",
      category: "Water",
      domain: "Water & Sanitation",
      location: "Ward 14, Kolar District",
      city: "Kolar",
      state: "Karnataka",
      lat: 13.1357, lng: 78.1326,
      urgency: "Critical",
      status: "validated",
      stage: "validated",
      reported: "2026-09-12",
      reporter: "Meera Kulkarni · Ward 14 Residents' Association",
      reporterRole: "citizen",
      population: "3,400 residents across four streets",
      summary:
        "Two community wells show visible turbidity and a persistent metallic smell after the monsoon. Residents report stomach illness in children, and the nearest tested source is 2.6 km away.",
      background:
        "Ward 14 depends on four open wells and one borewell. The municipal supply reaches the ward for roughly 90 minutes on alternate days, so most households draw from the wells for cooking and washing. Residents say the water turned discoloured about three weeks after the first heavy rain, and that the taste changed at the same time. A local clinic reports a rise in paediatric gastroenteritis cases but has not linked them formally to the water source.",
      evidence: [
        { src: ASSET + "water-pipe.jpg", caption: "Standing water and seepage near the well head, 14 Sep 2026", kind: "photo" },
        { src: ASSET + "clinic.jpg", caption: "Ward clinic waiting area, morning queue, 15 Sep 2026", kind: "photo" }
      ],
      skills: ["Water quality testing", "Environmental engineering", "Epidemiology", "Community survey design"],
      disciplines: ["Civil Engineering", "Environmental Science", "Public Health", "Data Science"],
      equipment: ["Portable spectrophotometer", "Coliform test kits", "GPS mapping"],
      researchAreas: ["Groundwater contamination", "WASH behaviour change"],
      ai: {
        category: "Water & Sanitation",
        severity: "Critical",
        confidence: 84,
        impact: "3,400 residents",
        summary:
          "Report describes a probable biological and/or heavy-metal contamination event affecting a shared groundwater source. Symptoms pattern and timing suggest a point-source exposure after rainfall infiltration.",
        skills: ["Water chemistry", "Sanitation engineering", "Public health surveillance"],
        duplicates: ["CH-2391"],
        note: "AI-generated initial assessment requiring human validation."
      },
      progress: [
        { date: "2026-09-12", text: "Report submitted with two photographs." },
        { date: "2026-09-13", text: "Initial automated assessment generated and queued for review." },
        { date: "2026-09-18", text: "Validated by district health officer after a site visit." }
      ],
      related: ["CH-2391", "CH-2405"],
      recommendations: [
        { name: "National Institute of Technology — Civil Engineering", reason: "Existing groundwater laboratory and a WASH field programme within 40 km." },
        { name: "District Institute of Public Health", reason: "Paediatric surveillance data for the same catchment." }
      ],
      interest: 6,
      teamSize: 4,
      openRoles: ["Water quality researcher", "Field survey lead"],
      featured: true,
      demo: true
    },
    {
      id: "CH-2405",
      title: "Storm drains back up into homes every monsoon",
      slug: "storm-drains-back-up-monsoon",
      category: "Infrastructure",
      domain: "Infrastructure",
      location: "Anna Nagar West, Chennai",
      city: "Chennai",
      state: "Tamil Nadu",
      lat: 13.0827, lng: 80.2707,
      urgency: "High",
      status: "under_review",
      stage: "under_review",
      reported: "2026-09-28",
      reporter: "S. Iyer · Resident",
      reporterRole: "citizen",
      population: "≈1,100 households",
      summary:
        "A 400 m stretch floods to knee depth within 30 minutes of heavy rain. Two storm drains are blocked by silt and one has been built over by an illegal extension.",
      background:
        "The street slopes toward a storm channel that was last desilted, according to residents, more than four years ago. During the last two monsoon events, ground-floor homes took in water and several families lost bedding and appliances. Residents have submitted three written complaints; one drain has been partially covered by a shop extension.",
      evidence: [
        { src: ASSET + "flood.jpg", caption: "Street flooding after 45 minutes of rain, 26 Sep 2026", kind: "photo" },
        { src: ASSET + "waste.jpg", caption: "Silt and solid waste at the drain mouth", kind: "photo" }
      ],
      skills: ["Urban drainage design", "GIS mapping", "Municipal policy", "Hydraulic modelling"],
      disciplines: ["Civil Engineering", "Urban Planning", "Geoinformatics"],
      equipment: ["Flow meter", "Total station", "Drone survey"],
      researchAreas: ["Urban flood modelling", "Informal drainage obstruction"],
      ai: {
        category: "Infrastructure",
        severity: "High",
        confidence: 71,
        impact: "≈1,100 households",
        summary:
          "Localised urban flooding consistent with blocked drainage and reduced channel capacity. The described slope and 30-minute onset suggest a capacity problem rather than a riverine flood.",
        skills: ["Hydrology", "Drainage design", "Municipal engineering"],
        duplicates: [],
        note: "AI-generated initial assessment requiring human validation."
      },
      progress: [
        { date: "2026-09-28", text: "Report submitted with two photographs." },
        { date: "2026-09-29", text: "Automated assessment generated; awaiting municipal review." }
      ],
      related: ["CH-2418"],
      recommendations: [
        { name: "Anna University — Centre for Climate and Disaster Resilience", reason: "Urban flood modelling group working on the same catchment." }
      ],
      interest: 3,
      teamSize: 3,
      openRoles: ["Hydraulic modeller"],
      featured: true,
      demo: true
    },
    {
      id: "CH-2391",
      title: "Secondary school has no functional science lab",
      slug: "secondary-school-no-science-lab",
      category: "Education",
      domain: "Education",
      location: "Hosur Block, Krishnagiri",
      city: "Hosur",
      state: "Tamil Nadu",
      lat: 12.7409, lng: 77.8253,
      urgency: "Medium",
      status: "validated",
      stage: "university_matched",
      reported: "2026-08-30",
      reporter: "Government Higher Secondary School, Hosur Block",
      reporterRole: "citizen",
      population: "612 students, 14 teachers",
      summary:
        "The school has a lab room but no working gas lines, no glassware and no reagents. Practical science is taught from photographs, and 84% of students sit the board practical exam without ever handling apparatus.",
      background:
        "The laboratory was equipped in 2011. A leak in the gas line led to disconnection in 2019; since then the room has been used for storage. Teachers have improvised demonstrations but report that students cannot describe apparatus they have never used. The school serves eleven surrounding villages and has no nearby alternative facility.",
      evidence: [
        { src: ASSET + "school.jpg", caption: "Science room currently used for storage, 29 Aug 2026", kind: "photo" }
      ],
      skills: ["Science education", "Low-cost apparatus design", "Teacher training", "Procurement"],
      disciplines: ["Education", "Physics", "Chemistry", "Mechanical Engineering"],
      equipment: ["Basic glassware", "Gas line repair", "Storage shelving"],
      researchAreas: ["Low-resource science pedagogy", "Improvised apparatus"],
      ai: {
        category: "Education",
        severity: "Medium",
        confidence: 79,
        impact: "612 students",
        summary:
          "Report describes a resourcing gap affecting practical science instruction. Not an acute safety event; impact is educational and cumulative.",
        skills: ["Education research", "Lab design", "Training design"],
        duplicates: [],
        note: "AI-generated initial assessment requiring human validation."
      },
      progress: [
        { date: "2026-08-30", text: "Report submitted by school administration." },
        { date: "2026-09-02", text: "Validated by block education officer." },
        { date: "2026-09-15", text: "Discussed with NIT Civil Engineering outreach coordinator — pending formal acceptance." }
      ],
      related: ["CH-2418"],
      recommendations: [
        { name: "NIT — Department of Education & Outreach", reason: "Runs a low-cost apparatus programme in three neighbouring blocks." }
      ],
      interest: 11,
      teamSize: 5,
      openRoles: ["Apparatus designer", "Teacher training lead", "Documentation"],
      featured: true,
      demo: true
    },
    {
      id: "CH-2422",
      title: "Open dumping beside a residential colony",
      slug: "open-dumping-beside-colony",
      category: "Environment",
      domain: "Environment",
      location: "Sector 9, Faridabad",
      city: "Faridabad",
      state: "Haryana",
      lat: 28.4089, lng: 77.3178,
      urgency: "High",
      status: "submitted",
      stage: "submitted",
      reported: "2026-10-04",
      reporter: "Colony Welfare Association",
      reporterRole: "citizen",
      population: "≈2,000 residents, one primary school within 120 m",
      summary:
        "An unauthorised dumping site has grown to roughly half an acre directly upwind of a residential colony and a primary school. Residents report odour, flies and smoke from frequent burning.",
      background:
        "Waste collection in the sector stopped in July when a contractor's vehicle broke down. Residents began tipping at an empty plot, and commercial vehicles now add to it. Burning is common in the evenings. The school has kept children indoors during breaks on several days.",
      evidence: [
        { src: ASSET + "waste.jpg", caption: "Dumping area viewed from the colony boundary", kind: "photo" }
      ],
      skills: ["Solid waste management", "Air quality monitoring", "Public health", "Municipal planning"],
      disciplines: ["Environmental Engineering", "Public Health", "Urban Planning"],
      equipment: ["Air quality sensors", "Waste composition audit kit"],
      researchAreas: ["Decentralised waste systems", "Air quality and school exposure"],
      ai: {
        category: "Environment",
        severity: "High",
        confidence: 68,
        impact: "≈2,000 residents",
        summary:
          "Report describes an uncontrolled waste site with combustion and vector exposure near a school. Priority is driven by proximity to children and by sustained duration.",
        skills: ["Waste systems", "Air quality", "Environmental health"],
        duplicates: [],
        note: "AI-generated initial assessment requiring human validation."
      },
      progress: [{ date: "2026-10-04", text: "Report submitted; awaiting triage." }],
      related: ["CH-2405"],
      recommendations: [],
      interest: 2,
      teamSize: 3,
      openRoles: ["Waste audit lead"],
      featured: false,
      demo: true
    },
    {
      id: "CH-2412",
      title: "Farmers losing a third of the crop to unseasonal dry spells",
      slug: "farmers-unseasonal-dry-spells",
      category: "Agriculture",
      domain: "Agriculture",
      location: "Anantapur District",
      city: "Anantapur",
      state: "Andhra Pradesh",
      lat: 14.6819, lng: 77.6006,
      urgency: "High",
      status: "validated",
      stage: "team_formed",
      reported: "2026-08-18",
      reporter: "R. Reddy · Farmer Producer Organisation",
      reporterRole: "citizen",
      population: "260 smallholder farms",
      summary:
        "Groundnut and millet yields have fallen sharply across three consecutive dry spells. Farmers lack soil-moisture data and are irrigating on habit rather than measurement.",
      background:
        "The district receives most of its rain in a short window. Farmers describe two dry spells in the last season, each lasting 18–22 days, at flowering stage. Borewell depths have increased. The FPO has kept informal records of yield but no soil or moisture data.",
      evidence: [
        { src: ASSET + "drought.jpg", caption: "Cracked field after the second dry spell", kind: "photo" }
      ],
      skills: ["Agronomy", "Soil moisture sensing", "IoT prototyping", "Extension training"],
      disciplines: ["Agricultural Science", "Electronics", "Data Science", "Economics"],
      equipment: ["Soil moisture probes", "Weather station", "LoRa gateway"],
      researchAreas: ["Deficit irrigation", "Low-cost sensing for smallholders"],
      ai: {
        category: "Agriculture",
        severity: "High",
        confidence: 76,
        impact: "260 farms",
        summary:
          "Report describes yield loss linked to moisture stress at a sensitive crop stage. A sensing and advisory intervention is plausible and testable within one season.",
        skills: ["Agronomy", "Sensing", "Advisory design"],
        duplicates: [],
        note: "AI-generated initial assessment requiring human validation."
      },
      progress: [
        { date: "2026-08-18", text: "Report submitted by the FPO." },
        { date: "2026-08-24", text: "Validated by agricultural extension officer." },
        { date: "2026-09-10", text: "Team of four formed with two electronics students and one agronomy student." }
      ],
      related: [],
      recommendations: [
        { name: "Agricultural University — Dryland Farming Research Station", reason: "Existing moisture-trial plots in the same agro-climatic zone." }
      ],
      interest: 9,
      teamSize: 4,
      openRoles: ["Data analyst"],
      featured: true,
      demo: true
    },
    {
      id: "CH-2429",
      title: "Footbridge unsafe for children crossing to school",
      slug: "footbridge-unsafe-children-crossing",
      category: "Infrastructure",
      domain: "Public Safety",
      location: "Borkhola, Cachar District",
      city: "Silchar",
      state: "Assam",
      lat: 24.8333, lng: 92.7789,
      urgency: "Critical",
      status: "under_review",
      stage: "under_review",
      reported: "2026-10-01",
      reporter: "Village Education Committee",
      reporterRole: "citizen",
      population: "≈180 children, 40 households",
      summary:
        "A timber footbridge used by schoolchildren has four missing planks and a rotted stringer. During high water, families report children crossing in single file on the exposed frame.",
      background:
        "The bridge is the shortest route from three hamlets to the primary school. The alternative route adds 4.2 km. A panchayat inspection in 2024 noted repairs but no work was recorded. During the last flood, a section of railing was lost.",
      evidence: [
        { src: ASSET + "bridge.jpg", caption: "Missing deck planks on the approach span", kind: "photo" }
      ],
      skills: ["Structural assessment", "Timber design", "Cost estimation", "Community consultation"],
      disciplines: ["Civil Engineering", "Structural Engineering", "Architecture"],
      equipment: ["Rebound hammer", "Moisture meter", "Survey level"],
      researchAreas: ["Low-cost rural crossings", "Local material durability"],
      ai: {
        category: "Infrastructure",
        severity: "Critical",
        confidence: 81,
        impact: "≈180 children",
        summary:
          "Report describes a structural safety hazard on a route with no reasonable alternative. Child exposure raises urgency above typical infrastructure reports.",
        skills: ["Structural engineering", "Rural construction"],
        duplicates: [],
        note: "AI-generated initial assessment requiring human validation."
      },
      progress: [
        { date: "2026-10-01", text: "Report submitted with one photograph." },
        { date: "2026-10-02", text: "Automated assessment flagged as critical; awaiting engineering review." }
      ],
      related: ["CH-2405"],
      recommendations: [],
      interest: 4,
      teamSize: 3,
      openRoles: ["Structural assessor", "Cost estimator"],
      featured: true,
      demo: true
    },
    {
      id: "CH-2433",
      title: "Rooftop solar installed but never commissioned",
      slug: "rooftop-solar-never-commissioned",
      category: "Environment",
      domain: "Energy",
      location: "Government Girls' Hostel, Raichur",
      city: "Raichur",
      state: "Karnataka",
      lat: 16.2076, lng: 77.3463,
      urgency: "Medium",
      status: "validated",
      stage: "proposal",
      reported: "2026-07-22",
      reporter: "Hostel Warden",
      reporterRole: "citizen",
      population: "96 resident students",
      summary:
        "A 12 kW rooftop array was installed in 2023 but has never produced power because the net-metering application was never completed. The hostel still pays full tariff.",
      background:
        "The array and inverter appear physically intact. The installation agency has closed. No commissioning report, warranty documents or net-metering approval exist on site. The hostel spends roughly ₹28,000 a month on electricity.",
      evidence: [
        { src: ASSET + "solar.jpg", caption: "Rooftop array, panels appear undamaged", kind: "photo" }
      ],
      skills: ["Solar PV commissioning", "Electrical inspection", "Regulatory process", "Energy auditing"],
      disciplines: ["Electrical Engineering", "Energy Systems", "Public Administration"],
      equipment: ["IV curve tracer", "Insulation tester", "Energy logger"],
      researchAreas: ["Public building energy retrofits", "Net-metering bottlenecks"],
      ai: {
        category: "Environment",
        severity: "Medium",
        confidence: 74,
        impact: "96 residents",
        summary:
          "Report describes a stranded asset: installed capacity that is functionally offline due to administrative rather than technical failure.",
        skills: ["PV systems", "Regulatory navigation"],
        duplicates: [],
        note: "AI-generated initial assessment requiring human validation."
      },
      progress: [
        { date: "2026-07-22", text: "Report submitted." },
        { date: "2026-08-01", text: "Validated after a site visit by the energy officer." },
        { date: "2026-09-05", text: "Proposal drafted for inspection, documentation reconstruction and net-metering filing." }
      ],
      related: [],
      recommendations: [
        { name: "State Renewable Energy Agency", reason: "Net-metering approval authority for public institutions." }
      ],
      interest: 7,
      teamSize: 3,
      openRoles: ["Electrical inspector", "Policy researcher"],
      featured: false,
      demo: true
    },
    {
      id: "CH-2437",
      title: "No safe waiting area at the primary health centre",
      slug: "no-safe-waiting-area-phc",
      category: "Healthcare",
      domain: "Public Health",
      location: "Primary Health Centre, Barpeta",
      city: "Barpeta",
      state: "Assam",
      lat: 26.3220, lng: 91.0044,
      urgency: "Medium",
      status: "submitted",
      stage: "submitted",
      reported: "2026-10-08",
      reporter: "ASHA worker collective",
      reporterRole: "citizen",
      population: "≈14,000 catchment",
      summary:
        "Patients wait outdoors in monsoon rain because the covered veranda is used for storage. Pregnant women and infants queue without seating or shade.",
      background:
        "The PHC serves a catchment of roughly 14,000 across nine villages. The veranda was enclosed for a vaccination cold-chain store in 2022, leaving no sheltered waiting space. Attendance drops sharply on rainy days, according to staff.",
      evidence: [
        { src: ASSET + "clinic.jpg", caption: "Waiting area, mid-morning queue", kind: "photo" }
      ],
      skills: ["Health facility planning", "Architecture", "Public health operations"],
      disciplines: ["Architecture", "Public Health", "Civil Engineering"],
      equipment: ["Site survey", "Ergonomic assessment"],
      researchAreas: ["Facility design and care-seeking behaviour"],
      ai: {
        category: "Healthcare",
        severity: "Medium",
        confidence: 66,
        impact: "≈14,000 catchment",
        summary:
          "Report describes a facility design constraint suppressing attendance. Impact is indirect but affects maternal and infant care continuity.",
        skills: ["Facility planning", "Health operations"],
        duplicates: [],
        note: "AI-generated initial assessment requiring human validation."
      },
      progress: [{ date: "2026-10-08", text: "Report submitted; awaiting triage." }],
      related: [],
      recommendations: [],
      interest: 1,
      teamSize: 2,
      openRoles: ["Facility designer"],
      featured: false,
      demo: true
    },
    {
      id: "CH-2441",
      title: "Street lighting outage on the school route",
      slug: "street-lighting-outage-school-route",
      category: "Public Safety",
      domain: "Public Safety",
      location: "Ward 6, Nashik",
      city: "Nashik",
      state: "Maharashtra",
      lat: 19.9975, lng: 73.7898,
      urgency: "High",
      status: "validated",
      stage: "prototype",
      reported: "2026-06-14",
      reporter: "Ward 6 Safety Committee",
      reporterRole: "citizen",
      population: "≈700 students walking before 07:00",
      summary:
        "Eleven of nineteen street lights on a 1.4 km school route have been dark for seven months. Two minor accidents involving cyclists have been reported.",
      background:
        "The route is used by children from four settlements between 06:15 and 07:30. The feeder pillar was damaged during road works; the repair was budgeted but not executed. Residents have patched with private lights on two houses.",
      evidence: [
        { src: ASSET + "flood.jpg", caption: "Unlit section of the route at dusk", kind: "photo" }
      ],
      skills: ["Electrical distribution", "Street lighting design", "Costing", "Municipal process"],
      disciplines: ["Electrical Engineering", "Urban Planning"],
      equipment: ["Lux meter", "Cable tester"],
      researchAreas: ["Public lighting and pedestrian safety"],
      ai: {
        category: "Public Safety",
        severity: "High",
        confidence: 72,
        impact: "≈700 students",
        summary:
          "Report describes a lighting outage on a pedestrian route with vulnerable users. Technical cause appears to be a damaged feeder pillar.",
        skills: ["Electrical engineering", "Lighting design"],
        duplicates: [],
        note: "AI-generated initial assessment requiring human validation."
      },
      progress: [
        { date: "2026-06-14", text: "Report submitted." },
        { date: "2026-06-30", text: "Validated after municipal electrical inspection." },
        { date: "2026-08-12", text: "Team formed; lux measurements taken along the route." },
        { date: "2026-09-28", text: "Prototype: solar-hybrid luminaire mounted on two poles for trial." }
      ],
      related: ["CH-2405"],
      recommendations: [
        { name: "College of Engineering — Electrical Department", reason: "Ongoing work on off-grid lighting for peri-urban roads." }
      ],
      interest: 8,
      teamSize: 4,
      openRoles: ["Field measurement", "Cost analysis"],
      featured: false,
      demo: true
    },
    {
      id: "CH-2445",
      title: "Anganwadi roof leaks onto the learning corner",
      slug: "anganwadi-roof-leaks",
      category: "Education",
      domain: "Education",
      location: "Anganwadi Centre 3, Gaya",
      city: "Gaya",
      state: "Bihar",
      lat: 24.7955, lng: 85.0002,
      urgency: "Medium",
      status: "submitted",
      stage: "submitted",
      reported: "2026-10-11",
      reporter: "Anganwadi worker",
      reporterRole: "citizen",
      population: "38 children aged 3–6",
      summary:
        "The asbestos roof over the main room leaks across roughly a third of the ceiling. Learning materials stored in that corner are damaged each time it rains.",
      background:
        "The centre runs a morning session for 38 children. The roof was patched with tarpaulin in 2025; the fix lasted one season. Staff move the children to a smaller room on rainy days, which limits activities.",
      evidence: [
        { src: ASSET + "school.jpg", caption: "Interior showing water staining above the learning corner", kind: "photo" }
      ],
      skills: ["Roof repair", "Structural inspection", "Early childhood environments"],
      disciplines: ["Civil Engineering", "Architecture", "Education"],
      equipment: ["Moisture meter", "Site measurement"],
      researchAreas: ["Early childhood learning environments"],
      ai: {
        category: "Education",
        severity: "Medium",
        confidence: 63,
        impact: "38 children",
        summary:
          "Report describes a fabric defect causing recurrent displacement of early-childhood activities. Small scale, cheap to remedy, high continuity value.",
        skills: ["Building repair", "Facility assessment"],
        duplicates: [],
        note: "AI-generated initial assessment requiring human validation."
      },
      progress: [{ date: "2026-10-11", text: "Report submitted with one photograph." }],
      related: ["CH-2391"],
      recommendations: [],
      interest: 0,
      teamSize: 2,
      openRoles: ["Site assessor"],
      featured: false,
      demo: true
    }
  ];

  /* derived counters ---------------------------------------- */
  CHALLENGES.forEach(function (c) {
    c.stageIndex = C.stageIndex(c.stage);
    c.url = "problems/index.html?id=" + encodeURIComponent(c.slug);
    c.abs = null;
  });

  /* ----------------------------------------------------------
     SEED PROJECTS
     ---------------------------------------------------------- */
  var PROJECTS = [
    {
      id: "PR-1042", challengeId: "CH-2412",
      title: "Moisture-triggered irrigation advisory for groundnut",
      stage: "prototype",
      lead: "Aarav Menon", university: "NIT — Agricultural Engineering",
      mentor: "Dr. Priya Raghunathan",
      team: ["Aarav Menon", "Sneha Iyer", "Kabir Rao", "Divya Pillai"],
      start: "2026-08-26", next: "2026-10-30",
      summary: "Twelve soil-moisture nodes across four farms, with an SMS advisory at two thresholds.",
      milestones: [
        { title: "Site selection and farmer consent", date: "2026-09-02", status: "done" },
        { title: "Sensor calibration against gravimetric samples", date: "2026-09-20", status: "done" },
        { title: "Node enclosure build (IP65)", date: "2026-10-05", status: "done" },
        { title: "Field deployment — 12 nodes", date: "2026-10-28", status: "active" },
        { title: "First advisory cycle", date: "2026-11-12", status: "todo" }
      ],
      deliverables: [
        { name: "Calibration report", status: "reviewed", date: "2026-09-22" },
        { name: "Enclosure CAD + BOM", status: "submitted", date: "2026-10-06" }
      ],
      impact: { planned: "260 farms", verified: null, note: "No field season completed yet." },
      updates: [
        { date: "2026-10-06", author: "Kabir Rao", text: "Enclosure v2 passed a 40-minute spray test. Two nodes still need cable glands." },
        { date: "2026-09-22", author: "Dr. Priya Raghunathan", text: "Calibration looks sound. Please add a note on sensor drift across the season." }
      ],
      demo: true
    },
    {
      id: "PR-1039", challengeId: "CH-2441",
      title: "Solar-hybrid luminaire trial on the Ward 6 school route",
      stage: "field_testing",
      lead: "Neha Deshpande", university: "College of Engineering — Electrical",
      mentor: "Prof. S. Kulkarni",
      team: ["Neha Deshpande", "Imran Sheikh", "Riya Nair"],
      start: "2026-06-28", next: "2026-11-08",
      summary: "Two poles instrumented with a solar-hybrid luminaire and lux logging along 1.4 km.",
      milestones: [
        { title: "Lux baseline survey", date: "2026-08-12", status: "done" },
        { title: "Luminaire prototype build", date: "2026-09-15", status: "done" },
        { title: "Two-pole installation", date: "2026-09-28", status: "done" },
        { title: "Eight-week lux and failure logging", date: "2026-11-01", status: "active" },
        { title: "Municipal handover report", date: "2026-11-20", status: "todo" }
      ],
      deliverables: [
        { name: "Lux baseline dataset", status: "reviewed", date: "2026-08-18" },
        { name: "Installation safety method statement", status: "reviewed", date: "2026-09-24" }
      ],
      impact: { planned: "≈700 students", verified: null, note: "Trial in progress; no measured outcome yet." },
      updates: [
        { date: "2026-09-29", author: "Imran Sheikh", text: "Both poles live. Luminance at 06:30 averages 18 lux, up from 2 lux." }
      ],
      demo: true
    },
    {
      id: "PR-1031", challengeId: "CH-2433",
      title: "Re-commissioning the hostel rooftop array",
      stage: "proposal",
      lead: "Rohan Bhatia", university: "State Renewable Energy Agency (partner)",
      mentor: "—",
      team: ["Rohan Bhatia", "Ananya Bose"],
      start: "2026-09-08", next: "2026-11-15",
      summary: "Technical inspection, documentation reconstruction and net-metering filing.",
      milestones: [
        { title: "Inspection and IV curve trace", date: "2026-10-02", status: "done" },
        { title: "Documentation pack assembled", date: "2026-10-20", status: "active" },
        { title: "Net-metering application filed", date: "2026-11-05", status: "todo" }
      ],
      deliverables: [{ name: "Inspection report", status: "submitted", date: "2026-10-04" }],
      impact: { planned: "96 residents", verified: null, note: "Proposal stage." },
      updates: [],
      demo: true
    }
  ];

  /* ----------------------------------------------------------
     SEED PARTNERS
     ---------------------------------------------------------- */
  var PARTNERS = [
    { id: "PA-01", name: "National Institute of Technology", type: "University", city: "Tiruchirappalli", verified: true, focus: ["Water", "Infrastructure", "Education"], labs: ["Groundwater laboratory", "Materials testing"], status: "verified" },
    { id: "PA-02", name: "Anna University — Climate Resilience Centre", type: "University", city: "Chennai", verified: true, focus: ["Infrastructure", "Environment"], labs: ["Urban flood modelling"], status: "verified" },
    { id: "PA-03", name: "Agricultural University — Dryland Station", type: "University", city: "Anantapur", verified: true, focus: ["Agriculture"], labs: ["Moisture trial plots"], status: "verified" },
    { id: "PA-04", name: "Verdant Water Systems", type: "Industry", city: "Pune", verified: true, focus: ["Water"], labs: ["Membrane pilot line"], status: "verified" },
    { id: "PA-05", name: "Northline Precision Castings", type: "Industry", city: "Coimbatore", verified: false, focus: ["Infrastructure"], labs: [], status: "pending" },
    { id: "PA-06", name: "State Renewable Energy Agency", type: "Government", city: "Bengaluru", verified: true, focus: ["Environment"], labs: [], status: "verified" }
  ];

  /* ----------------------------------------------------------
     SEED TEAMS
     ---------------------------------------------------------- */
  var TEAMS = [
    {
      id: "TM-311", challengeId: "CH-2412", name: "Dryland Sensing",
      members: [
        { name: "Aarav Menon", role: "Lead · firmware", verified: true },
        { name: "Sneha Iyer", role: "Agronomy", verified: true },
        { name: "Kabir Rao", role: "Enclosure / hardware", verified: true },
        { name: "Divya Pillai", role: "Field surveys", verified: false }
      ],
      missing: ["Data analysis"],
      tasks: [
        { title: "Flash remaining 4 nodes", assignee: "Kabir Rao", due: "2026-10-22", status: "active" },
        { title: "Draft farmer advisory copy in Telugu", assignee: "Sneha Iyer", due: "2026-10-25", status: "todo" },
        { title: "Build calibration notebook", assignee: "Aarav Menon", due: "2026-10-18", status: "review" }
      ],
      demo: true
    },
    {
      id: "TM-308", challengeId: "CH-2441", name: "Route Light",
      members: [
        { name: "Neha Deshpande", role: "Lead · electrical", verified: true },
        { name: "Imran Sheikh", role: "Installation", verified: true },
        { name: "Riya Nair", role: "Data logging", verified: false }
      ],
      missing: ["Municipal liaison"],
      tasks: [
        { title: "Weekly lux export", assignee: "Riya Nair", due: "2026-10-19", status: "active" },
        { title: "Draft handover report outline", assignee: "Neha Deshpande", due: "2026-10-29", status: "todo" }
      ],
      demo: true
    }
  ];

  /* ----------------------------------------------------------
     ACTIVITIES (problem-solving tasks, not courses)
     ---------------------------------------------------------- */
  var ACTIVITIES = [
    { id: "AC-201", challengeId: "CH-2418", title: "Design a household water sampling protocol", type: "Field study", level: "Intermediate", effort: "8–10 hrs", skills: ["Sampling design", "Chain of custody"], deliverable: "Protocol document + labelled sample schedule", status: "open" },
    { id: "AC-202", challengeId: "CH-2418", title: "Map all water sources and usage points in Ward 14", type: "Field study", level: "Beginner", effort: "12 hrs over 1 week", skills: ["GPS mapping", "Community interviews"], deliverable: "Geo-referenced source inventory", status: "open" },
    { id: "AC-203", challengeId: "CH-2405", title: "Build a 1D hydraulic model of the 400 m stretch", type: "Software prototype", level: "Advanced", effort: "20–25 hrs", skills: ["Hydraulics", "SWMM", "GIS"], deliverable: "Model file + blockage scenario comparison", status: "open" },
    { id: "AC-204", challengeId: "CH-2391", title: "Prototype three low-cost science apparatus sets", type: "Hardware prototype", level: "Intermediate", effort: "15 hrs", skills: ["Mechanical design", "Low-cost fabrication"], deliverable: "Working prototypes + build instructions", status: "in_progress" },
    { id: "AC-205", challengeId: "CH-2412", title: "Analyse two seasons of FPO yield records", type: "Data analysis", level: "Intermediate", effort: "10 hrs", skills: ["Python", "Statistics", "Agronomy basics"], deliverable: "Notebook + short findings note", status: "open" },
    { id: "AC-206", challengeId: "CH-2441", title: "Conduct a dawn pedestrian count on the school route", type: "Field study", level: "Beginner", effort: "4 mornings", skills: ["Observation protocol", "Data entry"], deliverable: "Count dataset + route map", status: "open" },
    { id: "AC-207", challengeId: "CH-2433", title: "Reconstruct the missing commissioning documentation", type: "Documentation", level: "Intermediate", effort: "9 hrs", skills: ["Regulatory process", "Technical writing"], deliverable: "Document pack checklist + gap list", status: "open" },
    { id: "AC-208", challengeId: "CH-2422", title: "Run a waste composition audit over three days", type: "Field study", level: "Beginner", effort: "3 days", skills: ["Audit method", "Health and safety"], deliverable: "Composition table by mass and category", status: "open" },
    { id: "AC-209", challengeId: "CH-2429", title: "Condition survey of the timber footbridge", type: "Research", level: "Advanced", effort: "6 hrs on site", skills: ["Structural survey", "Timber grading"], deliverable: "Element-by-element condition rating", status: "open" }
  ];

  /* ----------------------------------------------------------
     REPOSITORY
     ---------------------------------------------------------- */
  function merged() {
    var s = C.store.read();
    var extra = (s.challenges || []).map(function (c) {
      c.url = "problems/index.html?id=" + encodeURIComponent(c.slug);
      c.stageIndex = C.stageIndex(c.stage);
      return c;
    });
    return extra.concat(CHALLENGES);
  }

  function delay(ms) { return new Promise(function (r) { setTimeout(r, ms == null ? 260 : ms); }); }

  C.Data = {
    /* ---- challenges ---- */
    listChallenges: function (q) {
      q = q || {};
      return delay().then(function () {
        var all = merged();
        var term = (q.q || "").trim().toLowerCase();
        var out = all.filter(function (c) {
          if (q.category && q.category !== "all" && c.category !== q.category) return false;
          if (q.urgency && q.urgency !== "all" && c.urgency !== q.urgency) return false;
          if (q.status && q.status !== "all" && c.status !== q.status) return false;
          if (q.location && q.location !== "all" && c.state !== q.location) return false;
          if (q.skill && q.skill !== "all" && c.skills.indexOf(q.skill) < 0) return false;
          if (term) {
            var hay = [c.title, c.summary, c.location, c.state, c.category, c.domain, c.skills.join(" "), c.disciplines.join(" ")].join(" ").toLowerCase();
            if (hay.indexOf(term) < 0) return false;
          }
          return true;
        });
        var order = { Critical: 0, High: 1, Medium: 2, Low: 3 };
        if (q.sort === "urgency") out.sort(function (a, b) { return order[a.urgency] - order[b.urgency]; });
        else if (q.sort === "newest") out.sort(function (a, b) { return a.reported < b.reported ? 1 : -1; });
        else out.sort(function (a, b) { return a.reported < b.reported ? 1 : -1; });

        var page = q.page || 1, per = q.per || 9;
        var total = out.length;
        return { items: out.slice((page - 1) * per, page * per), total: total, page: page, per: per, pages: Math.max(1, Math.ceil(total / per)) };
      });
    },
    getChallenge: function (idOrSlug) {
      return delay(180).then(function () {
        var all = merged();
        var c = all.filter(function (x) { return x.id === idOrSlug || x.slug === idOrSlug; })[0];
        if (!c) throw { code: "not_found", message: "That challenge could not be found." };
        return c;
      });
    },
    relatedTo: function (c) {
      return delay(120).then(function () {
        var all = merged();
        return all.filter(function (x) {
          if (x.id === c.id) return false;
          return c.related.indexOf(x.id) >= 0 || x.category === c.category;
        }).slice(0, 3);
      });
    },
    createChallenge: function (payload) {
      return delay(760).then(function () {
        var id = "CH-" + (2450 + Math.floor(Math.random() * 400));
        var stage = "ai_processed";
        var rec = {
          id: id,
          title: payload.title,
          slug: C.slug(payload.title).slice(0, 60) || "report-" + id.toLowerCase(),
          category: payload.category,
          domain: payload.category,
          location: [payload.district, payload.city].filter(Boolean).join(", ") || "Location not provided",
          city: payload.city || "", state: payload.district || "",
          urgency: payload.urgency || "Medium",
          status: "ai_processed",
          stage: stage,
          reported: new Date().toISOString().slice(0, 10),
          reporter: (C.Auth.currentUser() || {}).name || "Anonymous reporter",
          reporterRole: (C.Auth.currentUser() || {}).role || "citizen",
          population: payload.population || "Not stated",
          summary: payload.description.slice(0, 240),
          background: payload.description,
          evidence: (payload.photos || []).map(function (p, i) {
            return { src: p.dataUrl, caption: "Reporter evidence " + C.pad(i + 1) + (p.name ? " · " + p.name : ""), kind: "photo" };
          }),
          skills: payload.ai.skills,
          disciplines: payload.ai.skills,
          equipment: [],
          researchAreas: [],
          ai: payload.ai,
          progress: [{ date: new Date().toISOString().slice(0, 10), text: "Report submitted through Catalyst." }],
          related: [],
          recommendations: [],
          interest: 0,
          teamSize: 0,
          openRoles: [],
          featured: false,
          demo: true,
          coords: payload.coords || null
        };
        C.store.write(function (s) { s.challenges.unshift(rec); s.audit.unshift({ at: new Date().toISOString(), actor: rec.reporter, action: "Report created", target: id }); });
        return rec;
      });
    },
    saveChallenge: function (id, on) {
      var u = C.Auth.currentUser();
      if (!u) return Promise.reject({ code: "unauth", message: "Sign in to save challenges." });
      C.store.write(function (s) {
        if (!s.saved[u.id]) s.saved[u.id] = [];
        var arr = s.saved[u.id];
        var i = arr.indexOf(id);
        if (on && i < 0) arr.push(id);
        if (!on && i >= 0) arr.splice(i, 1);
      });
      return Promise.resolve({ ok: true });
    },
    savedIds: function () {
      var u = C.Auth.currentUser();
      if (!u) return [];
      var s = C.store.read();
      return (s.saved[u.id] || []).slice();
    },
    expressInterest: function (id, note) {
      var u = C.Auth.currentUser();
      if (!u) return Promise.reject({ code: "unauth", message: "Sign in to express interest." });
      return delay(500).then(function () {
        C.store.write(function (s) {
          s.applications[u.id + ":" + id] = { at: new Date().toISOString(), note: note || "", status: "submitted" };
          s.challenges = s.challenges.map(function (c) { if (c.id === id) c.interest = (c.interest || 0) + 1; return c; });
          s.audit.unshift({ at: new Date().toISOString(), actor: u.name, action: "Interest expressed", target: id });
        });
        return { ok: true, status: "submitted" };
      });
    },
    interestFor: function (id) {
      var u = C.Auth.currentUser();
      if (!u) return null;
      var s = C.store.read();
      return s.applications[u.id + ":" + id] || null;
    },

    /* ---- projects / teams ---- */
    listProjects: function () { return delay(200).then(function () { return PROJECTS.slice(); }); },
    getProject: function (id) { return delay(160).then(function () { return PROJECTS.filter(function (p) { return p.id === id; })[0] || null; }); },
    listTeams: function () { return delay(160).then(function () { return TEAMS.slice(); }); },
    listActivities: function (challengeId) {
      return delay(160).then(function () {
        return ACTIVITIES.filter(function (a) { return !challengeId || a.challengeId === challengeId; });
      });
    },
    listPartners: function (type) {
      return delay(160).then(function () { return PARTNERS.filter(function (p) { return !type || p.type === type; }); });
    },
    stats: function () {
      var all = merged();
      return {
        challenges: all.length,
        open: all.filter(function (c) { return c.status !== "completed"; }).length,
        states: Array.from(new Set(all.map(function (c) { return c.state; }).filter(Boolean))).length,
        interest: all.reduce(function (a, c) { return a + (c.interest || 0); }, 0)
      };
    },
    /* raw seeds for pages that need the full catalogue */
    allChallenges: function () { return merged(); }
  };
})();
