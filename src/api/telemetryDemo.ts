import type {
  OpenF1Interval,
  OpenF1Pit,
  OpenF1Position,
  OpenF1Stint,
  ProcessedLapSummary,
  TelemetryDataPoint,
  TelemetryLapStats,
} from "../types/telemetry";

// Standard team colors mapping
export const TEAM_COLOURS: Record<string, string> = {
  mclaren: "#ff8000",
  "red bull": "#3671c6",
  "red bull racing": "#3671c6",
  ferrari: "#e8002d",
  mercedes: "#27f4d2",
  "aston martin": "#229971",
  alpine: "#ff87bc",
  "alpine f1 team": "#ff87bc",
  williams: "#64c4ff",
  haas: "#b6babd",
  "haas f1 team": "#b6babd",
  "rb f1 team": "#6692ff",
  rb: "#6692ff",
  sauber: "#52e252",
  audi: "#f50537",
  cadillac: "#d4af37",
};

export function getTeamColour(teamName: string, defaultColor = "#e10600"): string {
  const lower = teamName.toLowerCase();
  for (const [k, v] of Object.entries(TEAM_COLOURS)) {
    if (lower.includes(k)) return v;
  }
  return defaultColor;
}

// ---------------------------------------------------------------------------
// Comprehensive Driver Performance Profiles for Brazilian GP (Interlagos)
// P1 (The First: Max Verstappen #1) is distinctly separated and dominant
// Each driver from P1 to P20 has unique physics, braking points, apex speeds,
// top speeds, gear shifts, tyre degradation, and pit strategy.
// ---------------------------------------------------------------------------
export interface DriverPerformanceProfile {
  number: number;
  code: string;
  name: string;
  team: string;
  teamColor: string;
  nationality: string;
  headshot: string;
  finishPosition: number;
  startGrid: number;
  delta: number;
  baseLapTime: number; // in seconds (e.g. 70.540s for P1)
  fastestLapDisplay: string;
  avgLapTimeDisplay: string;
  topSpeedStraight: number; // km/h on Reta Oposta (e.g. 332.8 for P1, 321.0 for P20)
  speedTrap: number; // km/h at ~1550m trap
  turn1BrakingPointM: number; // where braking starts for Senna S (e.g. 330m for late P1 vs 280m for P20)
  turn1BrakePeak: number; // % brake force (100% down to 88%)
  turn1ApexSpeed: number; // km/h through T1 (114 for P1 vs 99 for P20)
  turn4BrakingPointM: number; // Descida do Lago (e.g. 1720m vs 1670m)
  turn4ApexSpeed: number; // km/h (142 for P1 vs 128 for P20)
  ferraduraApexSpeed: number; // Turn 6/7 sweeping right (188 for P1 vs 170 for P20)
  bicoDePatoHairpinApexSpeed: number; // Turn 10 tight hairpin (82 for P1 vs 72 for P20)
  juncaoExitThrottlePointM: number; // where 100% throttle is reached out of T12 (3380m for P1 vs 3450m for P20)
  fullThrottlePct: number; // % of lap at full throttle (68.5% for P1 vs 59.2% for P20)
  rpmRedline: number; // peak RPM (12200 for P1 vs 11600 for backmarkers)
  tyreDegMultiplier: number; // degradation rate multiplier (0.90 for P1 vs 1.25 for P20)
  stints: Array<{
    stint_number: number;
    lap_start: number;
    lap_end: number;
    compound: "SOFT" | "MEDIUM" | "HARD";
  }>;
  pitStops: Array<{
    lap_number: number;
    stop_duration: number;
    pit_duration: number;
  }>;
}

export const DRIVER_PERFORMANCE_PROFILES: Record<number, DriverPerformanceProfile> = {
  // P1: THE FIRST - Max Verstappen (Red Bull Racing) - Benchmark Dominant Performance
  1: {
    number: 1,
    code: "VER",
    name: "Max Verstappen",
    team: "Red Bull Racing",
    teamColor: "#3671c6",
    nationality: "NED",
    headshot: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/M/MAXVER01_Max_Verstappen/maxver01.png.transform/1col/image.png",
    finishPosition: 1,
    startGrid: 1,
    delta: 0,
    baseLapTime: 70.54, // 1:10.540 (Race Winner & Overall Fastest Lap)
    fastestLapDisplay: "1:10.540",
    avgLapTimeDisplay: "1:13.850",
    topSpeedStraight: 332.8,
    speedTrap: 331.2,
    turn1BrakingPointM: 330, // Ultra-late deep threshold braking
    turn1BrakePeak: 100,
    turn1ApexSpeed: 114,
    turn4BrakingPointM: 1720,
    turn4ApexSpeed: 142,
    ferraduraApexSpeed: 188,
    bicoDePatoHairpinApexSpeed: 82,
    juncaoExitThrottlePointM: 3380, // Immediate explosive exit traction
    fullThrottlePct: 68.5,
    rpmRedline: 12200,
    tyreDegMultiplier: 0.88,
    stints: [
      { stint_number: 1, lap_start: 1, lap_end: 28, compound: "MEDIUM" },
      { stint_number: 2, lap_start: 29, lap_end: 71, compound: "HARD" },
    ],
    pitStops: [
      { lap_number: 28, stop_duration: 2.2, pit_duration: 21.15 },
    ],
  },

  // P2: Lando Norris (McLaren) - Sector 2 High Downforce Maestro (+3.2s)
  4: {
    number: 4,
    code: "NOR",
    name: "Lando Norris",
    team: "McLaren",
    teamColor: "#ff8000",
    nationality: "GBR",
    headshot: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LANNOR01_Lando_Norris/lannor01.png.transform/1col/image.png",
    finishPosition: 2,
    startGrid: 2,
    delta: 0,
    baseLapTime: 70.79, // 1:10.790
    fastestLapDisplay: "1:10.680",
    avgLapTimeDisplay: "1:14.020",
    topSpeedStraight: 328.5, // Slightly lower top speed due to high downforce wing
    speedTrap: 327.0,
    turn1BrakingPointM: 318, // Brakes ~12m earlier than Verstappen
    turn1BrakePeak: 98,
    turn1ApexSpeed: 112,
    turn4BrakingPointM: 1710,
    turn4ApexSpeed: 140,
    ferraduraApexSpeed: 189, // Faster in Ferradura (+1 km/h) due to McLaren aero
    bicoDePatoHairpinApexSpeed: 81,
    juncaoExitThrottlePointM: 3395,
    fullThrottlePct: 66.8,
    rpmRedline: 12050,
    tyreDegMultiplier: 0.92,
    stints: [
      { stint_number: 1, lap_start: 1, lap_end: 27, compound: "MEDIUM" },
      { stint_number: 2, lap_start: 28, lap_end: 71, compound: "HARD" },
    ],
    pitStops: [
      { lap_number: 27, stop_duration: 2.4, pit_duration: 21.32 },
    ],
  },

  // P3: Charles Leclerc (Ferrari) - Aggressive Braking & Fast S1 (+8.7s)
  16: {
    number: 16,
    code: "LEC",
    name: "Charles Leclerc",
    team: "Ferrari",
    teamColor: "#e8002d",
    nationality: "MON",
    headshot: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CHALEC01_Charles_Leclerc/chalec01.png.transform/1col/image.png",
    finishPosition: 3,
    startGrid: 3,
    delta: 0,
    baseLapTime: 70.98,
    fastestLapDisplay: "1:10.810",
    avgLapTimeDisplay: "1:14.210",
    topSpeedStraight: 330.1,
    speedTrap: 328.8,
    turn1BrakingPointM: 314,
    turn1BrakePeak: 96,
    turn1ApexSpeed: 110,
    turn4BrakingPointM: 1705,
    turn4ApexSpeed: 138,
    ferraduraApexSpeed: 186,
    bicoDePatoHairpinApexSpeed: 80,
    juncaoExitThrottlePointM: 3405,
    fullThrottlePct: 65.9,
    rpmRedline: 12150,
    tyreDegMultiplier: 0.98,
    stints: [
      { stint_number: 1, lap_start: 1, lap_end: 25, compound: "MEDIUM" },
      { stint_number: 2, lap_start: 26, lap_end: 71, compound: "HARD" },
    ],
    pitStops: [
      { lap_number: 25, stop_duration: 2.5, pit_duration: 21.48 },
    ],
  },

  // P4: George Russell (Mercedes) - Smooth Balanced Race Pace (+14.5s)
  63: {
    number: 63,
    code: "RUS",
    name: "George Russell",
    team: "Mercedes",
    teamColor: "#27f4d2",
    nationality: "GBR",
    headshot: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/G/GEORUS01_George_Russell/georus01.png.transform/1col/image.png",
    finishPosition: 4,
    startGrid: 4,
    delta: 0,
    baseLapTime: 71.22,
    fastestLapDisplay: "1:10.990",
    avgLapTimeDisplay: "1:14.420",
    topSpeedStraight: 327.2,
    speedTrap: 325.8,
    turn1BrakingPointM: 310,
    turn1BrakePeak: 95,
    turn1ApexSpeed: 109,
    turn4BrakingPointM: 1698,
    turn4ApexSpeed: 136,
    ferraduraApexSpeed: 184,
    bicoDePatoHairpinApexSpeed: 79,
    juncaoExitThrottlePointM: 3412,
    fullThrottlePct: 65.2,
    rpmRedline: 11980,
    tyreDegMultiplier: 0.95,
    stints: [
      { stint_number: 1, lap_start: 1, lap_end: 26, compound: "MEDIUM" },
      { stint_number: 2, lap_start: 27, lap_end: 71, compound: "HARD" },
    ],
    pitStops: [
      { lap_number: 26, stop_duration: 2.6, pit_duration: 21.55 },
    ],
  },

  // P5: Oscar Piastri (McLaren) - Clean Steering Precision (+19.1s)
  81: {
    number: 81,
    code: "PIA",
    name: "Oscar Piastri",
    team: "McLaren",
    teamColor: "#ff8000",
    nationality: "AUS",
    headshot: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/O/OSCPIA01_Oscar_Piastri/oscpia01.png.transform/1col/image.png",
    finishPosition: 5,
    startGrid: 5,
    delta: 0,
    baseLapTime: 71.35,
    fastestLapDisplay: "1:11.050",
    avgLapTimeDisplay: "1:14.580",
    topSpeedStraight: 328.0,
    speedTrap: 326.4,
    turn1BrakingPointM: 308,
    turn1BrakePeak: 95,
    turn1ApexSpeed: 108,
    turn4BrakingPointM: 1695,
    turn4ApexSpeed: 135,
    ferraduraApexSpeed: 185,
    bicoDePatoHairpinApexSpeed: 78,
    juncaoExitThrottlePointM: 3418,
    fullThrottlePct: 64.8,
    rpmRedline: 12020,
    tyreDegMultiplier: 0.96,
    stints: [
      { stint_number: 1, lap_start: 1, lap_end: 28, compound: "MEDIUM" },
      { stint_number: 2, lap_start: 29, lap_end: 71, compound: "HARD" },
    ],
    pitStops: [
      { lap_number: 28, stop_duration: 2.3, pit_duration: 21.28 },
    ],
  },

  // P6: Lewis Hamilton (Ferrari/Mercedes) - Trail Braking Master (+24.3s)
  44: {
    number: 44,
    code: "HAM",
    name: "Lewis Hamilton",
    team: "Ferrari",
    teamColor: "#e8002d",
    nationality: "GBR",
    headshot: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LEWHAM01_Lewis_Hamilton/lewham01.png.transform/1col/image.png",
    finishPosition: 6,
    startGrid: 7,
    delta: 1,
    baseLapTime: 71.48,
    fastestLapDisplay: "1:11.140",
    avgLapTimeDisplay: "1:14.710",
    topSpeedStraight: 329.4,
    speedTrap: 328.0,
    turn1BrakingPointM: 316, // Late trail brake
    turn1BrakePeak: 97,
    turn1ApexSpeed: 109,
    turn4BrakingPointM: 1702,
    turn4ApexSpeed: 137,
    ferraduraApexSpeed: 185,
    bicoDePatoHairpinApexSpeed: 79,
    juncaoExitThrottlePointM: 3410,
    fullThrottlePct: 65.5,
    rpmRedline: 12100,
    tyreDegMultiplier: 0.93,
    stints: [
      { stint_number: 1, lap_start: 1, lap_end: 24, compound: "MEDIUM" },
      { stint_number: 2, lap_start: 25, lap_end: 71, compound: "HARD" },
    ],
    pitStops: [
      { lap_number: 24, stop_duration: 2.4, pit_duration: 21.36 },
    ],
  },

  // P7: Carlos Sainz (Williams) - Consistent Braking Stability (+33.8s)
  55: {
    number: 55,
    code: "SAI",
    name: "Carlos Sainz",
    team: "Williams",
    teamColor: "#64c4ff",
    nationality: "ESP",
    headshot: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CARSAI01_Carlos_Sainz/carsai01.png.transform/1col/image.png",
    finishPosition: 7,
    startGrid: 6,
    delta: -1,
    baseLapTime: 71.72,
    fastestLapDisplay: "1:11.380",
    avgLapTimeDisplay: "1:14.950",
    topSpeedStraight: 327.6,
    speedTrap: 326.2,
    turn1BrakingPointM: 304,
    turn1BrakePeak: 94,
    turn1ApexSpeed: 107,
    turn4BrakingPointM: 1690,
    turn4ApexSpeed: 134,
    ferraduraApexSpeed: 182,
    bicoDePatoHairpinApexSpeed: 77,
    juncaoExitThrottlePointM: 3425,
    fullThrottlePct: 64.2,
    rpmRedline: 11920,
    tyreDegMultiplier: 0.99,
    stints: [
      { stint_number: 1, lap_start: 1, lap_end: 29, compound: "MEDIUM" },
      { stint_number: 2, lap_start: 30, lap_end: 71, compound: "HARD" },
    ],
    pitStops: [
      { lap_number: 29, stop_duration: 2.7, pit_duration: 21.72 },
    ],
  },

  // P8: Fernando Alonso (Aston Martin) - V-Line Turn-In Specialist (+42.1s)
  14: {
    number: 14,
    code: "ALO",
    name: "Fernando Alonso",
    team: "Aston Martin",
    teamColor: "#229971",
    nationality: "ESP",
    headshot: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/F/FERALO01_Fernando_Alonso/feralo01.png.transform/1col/image.png",
    finishPosition: 8,
    startGrid: 9,
    delta: 1,
    baseLapTime: 71.89,
    fastestLapDisplay: "1:11.520",
    avgLapTimeDisplay: "1:15.120",
    topSpeedStraight: 326.5,
    speedTrap: 325.0,
    turn1BrakingPointM: 302,
    turn1BrakePeak: 95,
    turn1ApexSpeed: 107,
    turn4BrakingPointM: 1688,
    turn4ApexSpeed: 133,
    ferraduraApexSpeed: 181,
    bicoDePatoHairpinApexSpeed: 78,
    juncaoExitThrottlePointM: 3428,
    fullThrottlePct: 63.9,
    rpmRedline: 11950,
    tyreDegMultiplier: 1.01,
    stints: [
      { stint_number: 1, lap_start: 1, lap_end: 23, compound: "MEDIUM" },
      { stint_number: 2, lap_start: 24, lap_end: 50, compound: "HARD" },
      { stint_number: 3, lap_start: 51, lap_end: 71, compound: "SOFT" },
    ],
    pitStops: [
      { lap_number: 23, stop_duration: 2.5, pit_duration: 21.45 },
      { lap_number: 50, stop_duration: 2.3, pit_duration: 21.22 },
    ],
  },

  // P9: Pierre Gasly (Alpine) - Solid Midfield Operator (+51.4s)
  10: {
    number: 10,
    code: "GAS",
    name: "Pierre Gasly",
    team: "Alpine",
    teamColor: "#ff87bc",
    nationality: "FRA",
    headshot: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/P/PIEGAS01_Pierre_Gasly/piegas01.png.transform/1col/image.png",
    finishPosition: 9,
    startGrid: 10,
    delta: 1,
    baseLapTime: 72.15,
    fastestLapDisplay: "1:11.890",
    avgLapTimeDisplay: "1:15.380",
    topSpeedStraight: 324.0,
    speedTrap: 322.5,
    turn1BrakingPointM: 295,
    turn1BrakePeak: 92,
    turn1ApexSpeed: 105,
    turn4BrakingPointM: 1680,
    turn4ApexSpeed: 132,
    ferraduraApexSpeed: 179,
    bicoDePatoHairpinApexSpeed: 76,
    juncaoExitThrottlePointM: 3436,
    fullThrottlePct: 63.5,
    rpmRedline: 11880,
    tyreDegMultiplier: 1.04,
    stints: [
      { stint_number: 1, lap_start: 1, lap_end: 26, compound: "MEDIUM" },
      { stint_number: 2, lap_start: 27, lap_end: 71, compound: "HARD" },
    ],
    pitStops: [
      { lap_number: 26, stop_duration: 2.8, pit_duration: 21.80 },
    ],
  },

  // P10: Liam Lawson (RB) - Top 10 Points Finisher (+58.9s)
  30: {
    number: 30,
    code: "LAW",
    name: "Liam Lawson",
    team: "RB F1 Team",
    teamColor: "#6692ff",
    nationality: "NZL",
    headshot: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LIALAW01_Liam_Lawson/lialaw01.png.transform/1col/image.png",
    finishPosition: 10,
    startGrid: 12,
    delta: 2,
    baseLapTime: 72.31,
    fastestLapDisplay: "1:12.040",
    avgLapTimeDisplay: "1:15.540",
    topSpeedStraight: 325.0,
    speedTrap: 323.8,
    turn1BrakingPointM: 292,
    turn1BrakePeak: 91,
    turn1ApexSpeed: 104,
    turn4BrakingPointM: 1678,
    turn4ApexSpeed: 131,
    ferraduraApexSpeed: 178,
    bicoDePatoHairpinApexSpeed: 76,
    juncaoExitThrottlePointM: 3440,
    fullThrottlePct: 63.1,
    rpmRedline: 11850,
    tyreDegMultiplier: 1.05,
    stints: [
      { stint_number: 1, lap_start: 1, lap_end: 27, compound: "MEDIUM" },
      { stint_number: 2, lap_start: 28, lap_end: 71, compound: "HARD" },
    ],
    pitStops: [
      { lap_number: 27, stop_duration: 2.9, pit_duration: 21.95 },
    ],
  },

  // P11: Oliver Bearman (Haas) (+1 Lap)
  87: {
    number: 87,
    code: "BEA",
    name: "Oliver Bearman",
    team: "Haas",
    teamColor: "#b6babd",
    nationality: "GBR",
    headshot: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/O/OLIBEA01_Oliver_Bearman/olibea01.png.transform/1col/image.png",
    finishPosition: 11,
    startGrid: 13,
    delta: 2,
    baseLapTime: 72.54,
    fastestLapDisplay: "1:12.280",
    avgLapTimeDisplay: "1:15.780",
    topSpeedStraight: 323.5,
    speedTrap: 322.0,
    turn1BrakingPointM: 290,
    turn1BrakePeak: 90,
    turn1ApexSpeed: 103,
    turn4BrakingPointM: 1675,
    turn4ApexSpeed: 130,
    ferraduraApexSpeed: 176,
    bicoDePatoHairpinApexSpeed: 75,
    juncaoExitThrottlePointM: 3444,
    fullThrottlePct: 62.6,
    rpmRedline: 11800,
    tyreDegMultiplier: 1.08,
    stints: [
      { stint_number: 1, lap_start: 1, lap_end: 25, compound: "MEDIUM" },
      { stint_number: 2, lap_start: 26, lap_end: 70, compound: "HARD" },
    ],
    pitStops: [
      { lap_number: 25, stop_duration: 3.1, pit_duration: 22.20 },
    ],
  },

  // P12: Alexander Albon (Williams) - Straight-Line Missile, Slower in Turns (+1 Lap)
  23: {
    number: 23,
    code: "ALB",
    name: "Alexander Albon",
    team: "Williams",
    teamColor: "#64c4ff",
    nationality: "THA",
    headshot: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/A/ALEALB01_Alexander_Albon/alealb01.png.transform/1col/image.png",
    finishPosition: 12,
    startGrid: 11,
    delta: -1,
    baseLapTime: 72.68,
    fastestLapDisplay: "1:12.350",
    avgLapTimeDisplay: "1:15.920",
    topSpeedStraight: 331.0, // High top speed on straight
    speedTrap: 329.5,
    turn1BrakingPointM: 288,
    turn1BrakePeak: 89,
    turn1ApexSpeed: 102, // Lower apex speed
    turn4BrakingPointM: 1672,
    turn4ApexSpeed: 129,
    ferraduraApexSpeed: 175,
    bicoDePatoHairpinApexSpeed: 74,
    juncaoExitThrottlePointM: 3446,
    fullThrottlePct: 62.8,
    rpmRedline: 11820,
    tyreDegMultiplier: 1.10,
    stints: [
      { stint_number: 1, lap_start: 1, lap_end: 24, compound: "SOFT" },
      { stint_number: 2, lap_start: 25, lap_end: 70, compound: "HARD" },
    ],
    pitStops: [
      { lap_number: 24, stop_duration: 2.7, pit_duration: 21.65 },
    ],
  },

  // P13: Nico Hülkenberg (Audi) (+1 Lap)
  27: {
    number: 27,
    code: "HUL",
    name: "Nico Hülkenberg",
    team: "Audi",
    teamColor: "#f50537",
    nationality: "GER",
    headshot: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/N/NICHUL01_Nico_Hulkenberg/nichul01.png.transform/1col/image.png",
    finishPosition: 13,
    startGrid: 14,
    delta: 1,
    baseLapTime: 72.82,
    fastestLapDisplay: "1:12.490",
    avgLapTimeDisplay: "1:16.080",
    topSpeedStraight: 322.8,
    speedTrap: 321.4,
    turn1BrakingPointM: 287,
    turn1BrakePeak: 89,
    turn1ApexSpeed: 102,
    turn4BrakingPointM: 1670,
    turn4ApexSpeed: 129,
    ferraduraApexSpeed: 174,
    bicoDePatoHairpinApexSpeed: 74,
    juncaoExitThrottlePointM: 3448,
    fullThrottlePct: 62.1,
    rpmRedline: 11780,
    tyreDegMultiplier: 1.11,
    stints: [
      { stint_number: 1, lap_start: 1, lap_end: 28, compound: "MEDIUM" },
      { stint_number: 2, lap_start: 29, lap_end: 70, compound: "HARD" },
    ],
    pitStops: [
      { lap_number: 28, stop_duration: 3.0, pit_duration: 22.05 },
    ],
  },

  // P14: Esteban Ocon (Haas) (+1 Lap)
  31: {
    number: 31,
    code: "OCO",
    name: "Esteban Ocon",
    team: "Haas",
    teamColor: "#b6babd",
    nationality: "FRA",
    headshot: "/assets/headshots/ocon.jpg",
    finishPosition: 14,
    startGrid: 15,
    delta: 1,
    baseLapTime: 72.99,
    fastestLapDisplay: "1:12.650",
    avgLapTimeDisplay: "1:16.240",
    topSpeedStraight: 322.0,
    speedTrap: 320.6,
    turn1BrakingPointM: 285,
    turn1BrakePeak: 88,
    turn1ApexSpeed: 101,
    turn4BrakingPointM: 1668,
    turn4ApexSpeed: 128,
    ferraduraApexSpeed: 173,
    bicoDePatoHairpinApexSpeed: 73,
    juncaoExitThrottlePointM: 3450,
    fullThrottlePct: 61.8,
    rpmRedline: 11750,
    tyreDegMultiplier: 1.12,
    stints: [
      { stint_number: 1, lap_start: 1, lap_end: 27, compound: "MEDIUM" },
      { stint_number: 2, lap_start: 28, lap_end: 70, compound: "HARD" },
    ],
    pitStops: [
      { lap_number: 27, stop_duration: 3.2, pit_duration: 22.35 },
    ],
  },

  // P15: Franco Colapinto (Alpine) (+1 Lap)
  43: {
    number: 43,
    code: "COL",
    name: "Franco Colapinto",
    team: "Alpine",
    teamColor: "#ff87bc",
    nationality: "ARG",
    headshot: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/F/FRACOL01_Franco_Colapinto/fracol01.png.transform/1col/image.png",
    finishPosition: 15,
    startGrid: 16,
    delta: 1,
    baseLapTime: 73.15,
    fastestLapDisplay: "1:12.780",
    avgLapTimeDisplay: "1:16.420",
    topSpeedStraight: 323.2,
    speedTrap: 321.8,
    turn1BrakingPointM: 284,
    turn1BrakePeak: 88,
    turn1ApexSpeed: 101,
    turn4BrakingPointM: 1666,
    turn4ApexSpeed: 128,
    ferraduraApexSpeed: 172,
    bicoDePatoHairpinApexSpeed: 73,
    juncaoExitThrottlePointM: 3452,
    fullThrottlePct: 61.5,
    rpmRedline: 11720,
    tyreDegMultiplier: 1.14,
    stints: [
      { stint_number: 1, lap_start: 1, lap_end: 25, compound: "MEDIUM" },
      { stint_number: 2, lap_start: 26, lap_end: 70, compound: "HARD" },
    ],
    pitStops: [
      { lap_number: 25, stop_duration: 2.8, pit_duration: 21.88 },
    ],
  },

  // P16: Gabriel Bortoleto (Audi) - Home Race Rookie (+1 Lap)
  5: {
    number: 5,
    code: "BOR",
    name: "Gabriel Bortoleto",
    team: "Audi",
    teamColor: "#f50537",
    nationality: "BRA",
    headshot: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/G/GABBOR01_Gabriel_Bortoleto/gabbor01.png.transform/1col/image.png",
    finishPosition: 16,
    startGrid: 17,
    delta: 1,
    baseLapTime: 73.32,
    fastestLapDisplay: "1:12.920",
    avgLapTimeDisplay: "1:16.610",
    topSpeedStraight: 321.5,
    speedTrap: 320.1,
    turn1BrakingPointM: 283,
    turn1BrakePeak: 87,
    turn1ApexSpeed: 100,
    turn4BrakingPointM: 1664,
    turn4ApexSpeed: 127,
    ferraduraApexSpeed: 171,
    bicoDePatoHairpinApexSpeed: 73,
    juncaoExitThrottlePointM: 3454,
    fullThrottlePct: 61.0,
    rpmRedline: 11690,
    tyreDegMultiplier: 1.16,
    stints: [
      { stint_number: 1, lap_start: 1, lap_end: 23, compound: "MEDIUM" },
      { stint_number: 2, lap_start: 24, lap_end: 70, compound: "HARD" },
    ],
    pitStops: [
      { lap_number: 23, stop_duration: 3.3, pit_duration: 22.45 },
    ],
  },

  // P17: Yuki Tsunoda (RB) (+2 Laps)
  22: {
    number: 22,
    code: "TSU",
    name: "Yuki Tsunoda",
    team: "RB F1 Team",
    teamColor: "#6692ff",
    nationality: "JPN",
    headshot: "/assets/headshots/tsunoda.jpg",
    finishPosition: 17,
    startGrid: 8,
    delta: -9,
    baseLapTime: 73.51,
    fastestLapDisplay: "1:13.110",
    avgLapTimeDisplay: "1:16.820",
    topSpeedStraight: 324.5,
    speedTrap: 323.0,
    turn1BrakingPointM: 282,
    turn1BrakePeak: 87,
    turn1ApexSpeed: 100,
    turn4BrakingPointM: 1662,
    turn4ApexSpeed: 127,
    ferraduraApexSpeed: 171,
    bicoDePatoHairpinApexSpeed: 72,
    juncaoExitThrottlePointM: 3456,
    fullThrottlePct: 60.5,
    rpmRedline: 11680,
    tyreDegMultiplier: 1.18,
    stints: [
      { stint_number: 1, lap_start: 1, lap_end: 18, compound: "SOFT" },
      { stint_number: 2, lap_start: 19, lap_end: 45, compound: "MEDIUM" },
      { stint_number: 3, lap_start: 46, lap_end: 69, compound: "HARD" },
    ],
    pitStops: [
      { lap_number: 18, stop_duration: 3.4, pit_duration: 22.60 },
      { lap_number: 45, stop_duration: 3.1, pit_duration: 22.25 },
    ],
  },

  // P18: Lance Stroll (Aston Martin) (+2 Laps)
  18: {
    number: 18,
    code: "STR",
    name: "Lance Stroll",
    team: "Aston Martin",
    teamColor: "#229971",
    nationality: "CAN",
    headshot: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LANSTR01_Lance_Stroll/lanstr01.png.transform/1col/image.png",
    finishPosition: 18,
    startGrid: 18,
    delta: 0,
    baseLapTime: 73.72,
    fastestLapDisplay: "1:13.290",
    avgLapTimeDisplay: "1:17.050",
    topSpeedStraight: 323.0,
    speedTrap: 321.5,
    turn1BrakingPointM: 281,
    turn1BrakePeak: 86,
    turn1ApexSpeed: 99,
    turn4BrakingPointM: 1660,
    turn4ApexSpeed: 126,
    ferraduraApexSpeed: 170,
    bicoDePatoHairpinApexSpeed: 72,
    juncaoExitThrottlePointM: 3458,
    fullThrottlePct: 60.0,
    rpmRedline: 11650,
    tyreDegMultiplier: 1.20,
    stints: [
      { stint_number: 1, lap_start: 1, lap_end: 26, compound: "MEDIUM" },
      { stint_number: 2, lap_start: 27, lap_end: 69, compound: "HARD" },
    ],
    pitStops: [
      { lap_number: 26, stop_duration: 3.2, pit_duration: 22.38 },
    ],
  },

  // P19: Valtteri Bottas (Cadillac) (+2 Laps)
  77: {
    number: 77,
    code: "BOT",
    name: "Valtteri Bottas",
    team: "Cadillac F1 Team",
    teamColor: "#d4af37",
    nationality: "FIN",
    headshot: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/V/VALBOT01_Valtteri_Bottas/valbot01.png.transform/1col/image.png",
    finishPosition: 19,
    startGrid: 19,
    delta: 0,
    baseLapTime: 73.95,
    fastestLapDisplay: "1:13.550",
    avgLapTimeDisplay: "1:17.310",
    topSpeedStraight: 320.5,
    speedTrap: 319.2,
    turn1BrakingPointM: 280,
    turn1BrakePeak: 85,
    turn1ApexSpeed: 99,
    turn4BrakingPointM: 1658,
    turn4ApexSpeed: 125,
    ferraduraApexSpeed: 169,
    bicoDePatoHairpinApexSpeed: 71,
    juncaoExitThrottlePointM: 3462,
    fullThrottlePct: 59.5,
    rpmRedline: 11620,
    tyreDegMultiplier: 1.22,
    stints: [
      { stint_number: 1, lap_start: 1, lap_end: 22, compound: "MEDIUM" },
      { stint_number: 2, lap_start: 23, lap_end: 69, compound: "HARD" },
    ],
    pitStops: [
      { lap_number: 22, stop_duration: 3.5, pit_duration: 22.80 },
    ],
  },

  // P20: Sergio Pérez (Cadillac) (+2 Laps)
  11: {
    number: 11,
    code: "PER",
    name: "Sergio Pérez",
    team: "Cadillac F1 Team",
    teamColor: "#d4af37",
    nationality: "MEX",
    headshot: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/S/SERPER01_Sergio_Perez/serper01.png.transform/1col/image.png",
    finishPosition: 20,
    startGrid: 20,
    delta: 0,
    baseLapTime: 74.18,
    fastestLapDisplay: "1:13.720",
    avgLapTimeDisplay: "1:17.580",
    topSpeedStraight: 321.0,
    speedTrap: 319.6,
    turn1BrakingPointM: 279,
    turn1BrakePeak: 85,
    turn1ApexSpeed: 98,
    turn4BrakingPointM: 1655,
    turn4ApexSpeed: 124,
    ferraduraApexSpeed: 168,
    bicoDePatoHairpinApexSpeed: 71,
    juncaoExitThrottlePointM: 3465,
    fullThrottlePct: 59.2,
    rpmRedline: 11600,
    tyreDegMultiplier: 1.24,
    stints: [
      { stint_number: 1, lap_start: 1, lap_end: 20, compound: "HARD" },
      { stint_number: 2, lap_start: 21, lap_end: 69, compound: "MEDIUM" },
    ],
    pitStops: [
      { lap_number: 20, stop_duration: 3.6, pit_duration: 22.95 },
    ],
  },
};

export function getDriverPerformanceProfile(driverNumber: number): DriverPerformanceProfile {
  return DRIVER_PERFORMANCE_PROFILES[driverNumber] || DRIVER_PERFORMANCE_PROFILES[1];
}

export function getAllDriverProfiles(): DriverPerformanceProfile[] {
  return Object.values(DRIVER_PERFORMANCE_PROFILES).sort((a, b) => a.finishPosition - b.finishPosition);
}

// Generate high-resolution physics-consistent telemetry for Interlagos / Grand Prix lap
// Every driver has distinct braking points, apex speeds, top speeds, gear maps, and throttle application
export function generateRealisticLapTelemetry(
  driverNumber: number,
  lapNumber: number,
  lapDurationSec: number,
  circuitLengthM = 4309,
  sampleCount = 200,
  _isDriverB = false
): TelemetryDataPoint[] {
  const points: TelemetryDataPoint[] = [];
  const prof = getDriverPerformanceProfile(driverNumber);

  // Driver-specific physics targets
  const topSpeed = prof.topSpeedStraight;
  const t1BrakeM = prof.turn1BrakingPointM;
  const t1Apex = prof.turn1ApexSpeed;
  const t1BrakePk = prof.turn1BrakePeak;
  const t4BrakeM = prof.turn4BrakingPointM;
  const t4Apex = prof.turn4ApexSpeed;
  const ferraduraApex = prof.ferraduraApexSpeed;
  const hairpinApex = prof.bicoDePatoHairpinApexSpeed;
  const juncaoExitM = prof.juncaoExitThrottlePointM;
  const redline = prof.rpmRedline;

  // Lap progression degradation effect
  const tyreWearFactor = Math.min(1.05, 1.0 + (lapNumber / 71) * 0.03 * prof.tyreDegMultiplier);

  for (let i = 0; i <= sampleCount; i++) {
    const fraction = i / sampleCount;
    const distance = Math.round(fraction * circuitLengthM);
    const timeSec = Number((fraction * lapDurationSec).toFixed(3));

    let speed = 280;
    let throttle = 100;
    let brake = 0;
    let gear = 7;
    let rpm = Math.round(redline * 0.9);
    let drs = false;

    // 1. Approaching Turn 1 Senna S (distance 0 to ~580m)
    // Straight speed building to ~325-333 km/h
    if (distance < t1BrakeM) {
      const p = distance / Math.max(1, t1BrakeM);
      speed = Math.round(290 + p * (topSpeed - 290) * 0.98);
      throttle = 100;
      brake = 0;
      gear = 8;
      rpm = Math.round(redline * 0.94 + p * (redline * 0.05));
    }
    // Turn 1-2 Braking Zone (Senna S entry: t1BrakeM to ~430m)
    else if (distance >= t1BrakeM && distance < 430) {
      const p = (distance - t1BrakeM) / Math.max(1, 430 - t1BrakeM);
      speed = Math.round(topSpeed - p * (topSpeed - t1Apex));
      brake = Math.round(t1BrakePk * (1 - p * 0.35));
      throttle = 0;
      gear = Math.max(3, Math.round(8 - p * 5));
      rpm = Math.round(redline * 0.95 - p * 2400);
    }
    // Turn 2 transition to Turn 3 (Curva do Sol: 430m to 580m)
    else if (distance >= 430 && distance < 580) {
      const p = (distance - 430) / 150;
      speed = Math.round(t1Apex + p * 115);
      brake = 0;
      throttle = Math.min(100, Math.round(p * 105));
      gear = Math.min(5, Math.round(3 + p * 2));
      rpm = Math.round(8800 + p * 2100);
    }
    // Turn 3 Curva do Sol (580m to 900m) - Accelerating through fast left
    else if (distance >= 580 && distance < 900) {
      const p = (distance - 580) / 320;
      speed = Math.round(225 + p * 80);
      throttle = Math.min(100, Math.round(88 + p * 12));
      brake = 0;
      gear = Math.min(7, Math.round(5 + p * 2));
      rpm = Math.round(10200 + p * 1200);
    }
    // Reta Oposta Back Straight (900m to t4BrakeM) - DRS Zone 1 & Top Speed
    else if (distance >= 900 && distance < t4BrakeM) {
      const p = (distance - 900) / Math.max(1, t4BrakeM - 900);
      speed = Math.round(305 + p * (topSpeed - 305));
      throttle = 100;
      brake = 0;
      gear = 8;
      rpm = Math.round(redline * 0.92 + p * (redline * 0.07));
      drs = true;
    }
    // Turn 4 Descida do Lago Braking (t4BrakeM to 1790m)
    else if (distance >= t4BrakeM && distance < 1790) {
      const p = (distance - t4BrakeM) / Math.max(1, 1790 - t4BrakeM);
      speed = Math.round(topSpeed - p * (topSpeed - t4Apex));
      brake = Math.round(96 * (1 - p * 0.4));
      throttle = 0;
      gear = Math.max(4, Math.round(8 - p * 4));
      rpm = Math.round(redline * 0.94 - p * 2300);
    }
    // Turn 5 Exit (1790m to 1950m)
    else if (distance >= 1790 && distance < 1950) {
      const p = (distance - 1790) / 160;
      speed = Math.round(t4Apex + p * 75);
      throttle = Math.min(100, Math.round(p * 98));
      brake = 0;
      gear = 4;
      rpm = Math.round(9200 + p * 1600);
    }
    // Turn 6-7 Ferradura Long Fast Double-Right (1950m to 2400m)
    else if (distance >= 1950 && distance < 2400) {
      const p = (distance - 1950) / 450;
      speed = Math.round(ferraduraApex + Math.sin(p * Math.PI) * 18);
      throttle = Math.round(62 + Math.cos(p * Math.PI) * 28);
      brake = p > 0.15 && p < 0.35 ? 28 : 0;
      gear = 5;
      rpm = Math.round(9800 + Math.sin(p * Math.PI) * 1100);
    }
    // Turn 8 Laranjinha (2400m to 2680m)
    else if (distance >= 2400 && distance < 2680) {
      const p = (distance - 2400) / 280;
      speed = Math.round(195 - p * 38);
      throttle = 52;
      brake = p > 0.45 ? 36 : 0;
      gear = 4;
      rpm = 9500;
    }
    // Turn 9 Pinheirinho (2680m to 2900m)
    else if (distance >= 2680 && distance < 2900) {
      const p = (distance - 2680) / 220;
      speed = Math.round(155 - p * 45);
      brake = p > 0.35 ? 65 : 0;
      throttle = p < 0.35 ? 55 : 0;
      gear = 3;
      rpm = 9100;
    }
    // Turn 10 Bico de Pato Slowest Hairpin (2900m to 3050m)
    else if (distance >= 2900 && distance < 3050) {
      const p = (distance - 2900) / 150;
      speed = Math.round(110 - p * (110 - hairpinApex));
      brake = p < 0.6 ? 85 : 15;
      throttle = 0;
      gear = 2;
      rpm = 8600;
    }
    // Exit of Hairpin to Mergulho (3050m to 3200m)
    else if (distance >= 3050 && distance < 3200) {
      const p = (distance - 3050) / 150;
      speed = Math.round(hairpinApex + p * 125);
      brake = 0;
      throttle = Math.min(100, Math.round(p * 115));
      gear = Math.min(5, Math.round(2 + p * 3));
      rpm = Math.round(9000 + p * 2100);
    }
    // Turn 11 Mergulho into Turn 12 Junção (3200m to 3380m)
    else if (distance >= 3200 && distance < 3380) {
      const p = (distance - 3200) / 180;
      speed = Math.round(210 - p * 86);
      brake = p > 0.3 ? 72 : 0;
      throttle = p < 0.3 ? 65 : 0;
      gear = 3;
      rpm = 9300;
    }
    // Turn 12 Junção Exit onto uphill straight (3380m to juncaoExitM)
    else if (distance >= 3380 && distance < juncaoExitM) {
      const p = (distance - 3380) / Math.max(1, juncaoExitM - 3380);
      speed = Math.round(124 + p * 60);
      brake = 0;
      throttle = Math.min(100, Math.round(40 + p * 60));
      gear = 4;
      rpm = Math.round(9400 + p * 1400);
    }
    // Subida dos Boxes, Curva do Café, Arquibancadas & Start/Finish (juncaoExitM to 4309m) - DRS Zone 2
    else {
      const p = (distance - juncaoExitM) / Math.max(1, circuitLengthM - juncaoExitM);
      speed = Math.round(185 + p * (topSpeed * 0.97 - 185));
      throttle = 100;
      brake = 0;
      gear = Math.min(8, Math.round(4 + p * 4));
      rpm = Math.round(10200 + p * (redline * 0.95 - 10200));
      if (distance > 3880) drs = true;
    }

    // Apply driver tyre wear adjustment on late race laps
    if (lapNumber > 20) {
      speed = Math.round(speed / (1 + (tyreWearFactor - 1) * 0.3));
    }

    // Slight distinctive driver frequency vibration (not generic random)
    const microJitter = Math.sin((i * 1.7) + (driverNumber * 3.1)) * 0.8;
    speed = Math.max(60, Math.round(speed + microJitter));
    rpm = Math.max(7200, Math.min(redline + 200, Math.round(rpm + microJitter * 12)));

    points.push({
      distance,
      timeSec,
      speed,
      throttle: Math.max(0, Math.min(100, throttle)),
      brake: Math.max(0, Math.min(100, brake)),
      gear: Math.max(1, Math.min(8, gear)),
      rpm,
      drs,
    });
  }

  return points;
}

// Compute statistics across distance-based telemetry
export function computeTelemetryStats(data: TelemetryDataPoint[]): TelemetryLapStats {
  if (!data.length) {
    return {
      maxSpeed: 0,
      minSpeed: 0,
      avgSpeed: 0,
      speedTrap: 0,
      fullThrottlePct: 0,
      timeAcceleratingSec: 0,
      brakeEventsCount: 0,
      totalBrakingSec: 0,
      avgDeceleration: 0,
      gearChangesCount: 0,
      topGear: 8,
    };
  }

  const speeds = data.map((d) => d.speed);
  const maxSpeed = Math.max(...speeds);
  const minSpeed = Math.min(...speeds);
  const avgSpeed = Math.round(speeds.reduce((a, b) => a + b, 0) / speeds.length);

  // Speed trap around 1550m on Reta Oposta
  const stPt = data.find((d) => d.distance >= 1500 && d.distance <= 1650) || data[Math.floor(data.length * 0.35)];
  const speedTrap = stPt ? stPt.speed : maxSpeed;

  let fullThrottleCount = 0;
  let acceleratingCount = 0;
  let brakingCount = 0;
  let gearChanges = 0;
  let prevGear = data[0].gear;
  let brakeEvents = 0;
  let inBrakeZone = false;

  for (const pt of data) {
    if (pt.throttle >= 98) fullThrottleCount++;
    if (pt.throttle > 5) acceleratingCount++;
    if (pt.brake > 10) {
      brakingCount++;
      if (!inBrakeZone) {
        brakeEvents++;
        inBrakeZone = true;
      }
    } else {
      inBrakeZone = false;
    }

    if (pt.gear !== prevGear) {
      gearChanges++;
      prevGear = pt.gear;
    }
  }

  const totalTime = data[data.length - 1].timeSec || 70.54;
  const fullThrottlePct = Number(((fullThrottleCount / data.length) * 100).toFixed(1));
  const timeAcceleratingSec = Number(((acceleratingCount / data.length) * totalTime).toFixed(1));
  const totalBrakingSec = Number(((brakingCount / data.length) * totalTime).toFixed(1));

  return {
    maxSpeed,
    minSpeed,
    avgSpeed,
    speedTrap,
    fullThrottlePct,
    timeAcceleratingSec,
    brakeEventsCount: Math.max(brakeEvents, 6),
    totalBrakingSec,
    avgDeceleration: 5.1,
    gearChangesCount: Math.max(gearChanges, 44),
    topGear: Math.max(...data.map((d) => d.gear)),
  };
}

// Format seconds into F1 standard M:SS.mmm
export function formatLapTime(seconds: number): string {
  if (!seconds || isNaN(seconds) || seconds <= 0) return "--:--.---";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds - Math.floor(seconds)) * 1000);
  return `${m}:${String(s).padStart(2, "0")}.${String(ms).padStart(3, "0")}`;
}

// Parse F1 string "1:10.540" to seconds
export function parseLapTimeToSeconds(timeStr: string): number {
  if (!timeStr) return 0;
  const clean = timeStr.trim().replace("+", "").replace("s", "");
  if (clean.includes(":")) {
    const [minPart, secPart] = clean.split(":");
    return Number(minPart) * 60 + Number(secPart);
  }
  return Number(clean);
}

// Generate realistic lap timing progression for 71-lap Brazilian Grand Prix
// Each driver receives their exact distinctive pace, tyre degradation slope, and strategy
export function generateRealisticLaps(
  driverNumber: number,
  _driverCode?: string,
  totalLaps = 71,
  overrideBaseLap?: number,
  overrideStints?: Array<{ start: number; end: number; compound: "SOFT" | "MEDIUM" | "HARD" }>
): ProcessedLapSummary[] {
  const prof = getDriverPerformanceProfile(driverNumber);
  const baseTime = overrideBaseLap || prof.baseLapTime;
  const driverStints = overrideStints || prof.stints.map((s) => ({
    start: s.lap_start,
    end: s.lap_end,
    compound: s.compound,
  }));

  const pitLapNumbers = new Set(prof.pitStops.map((p) => p.lap_number));
  const laps: ProcessedLapSummary[] = [];

  let overallFastestLap = 999;
  let overallFastestIdx = 24;

  for (let l = 1; l <= totalLaps; l++) {
    const currentStint = driverStints.find((s) => l >= s.start && l <= s.end) || driverStints[0];
    const tyreAge = l - currentStint.start;

    // Fuel weight burns off: -0.038s per lap (~105kg starting fuel)
    const fuelEffect = -0.038 * l;

    // Base tyre degradation rate by compound, scaled by driver's tyre saving skill
    const baseDegRate =
      currentStint.compound === "SOFT"
        ? 0.080
        : currentStint.compound === "MEDIUM"
        ? 0.062
        : 0.042;
    const tyreDeg = tyreAge * baseDegRate * prof.tyreDegMultiplier;
    const isPitOut = l === 1 || l === currentStint.start;

    let lapDuration = baseTime + fuelEffect + tyreDeg;

    // In-lap / Pit stop delay
    if (pitLapNumbers.has(l)) {
      const pitInfo = prof.pitStops.find((p) => p.lap_number === l);
      lapDuration += (pitInfo?.pit_duration || 21.5);
    }
    // Out-lap cold tyres delay
    if (isPitOut && l > 1) {
      lapDuration += 3.2;
    }

    // Driver-specific natural rhythm variations
    const rhythm = Math.sin(l * 0.45 + (driverNumber * 1.3)) * 0.22 + (l % 11 === 0 ? 0.35 : 0);
    lapDuration = Number((lapDuration + rhythm).toFixed(3));

    // Sector breakdown tailored to driver characteristics:
    // Sector 1: ~25.8% (Senna S, Curva do Sol, Reta Oposta)
    // Sector 2: ~48.2% (Descida do Lago, Infield, Bico de Pato, Mergulho)
    // Sector 3: ~26.0% (Junção, Subida dos Boxes, Arquibancadas)
    let s1Ratio = 0.258;
    let s2Ratio = 0.482;

    // Norris / McLaren slightly stronger in technical S2
    if (driverNumber === 4 || driverNumber === 81) {
      s2Ratio = 0.479;
      s1Ratio = 0.260;
    }
    // Albon / Williams slightly stronger in straight S1/S3
    if (driverNumber === 23 || driverNumber === 55) {
      s1Ratio = 0.255;
      s2Ratio = 0.485;
    }

    const s1 = Number((lapDuration * s1Ratio + Math.cos(l * 0.4 + driverNumber) * 0.08).toFixed(3));
    const s2 = Number((lapDuration * s2Ratio + Math.sin(l * 0.4 + driverNumber) * 0.12).toFixed(3));
    const s3 = Number((lapDuration - s1 - s2).toFixed(3));

    const speedTrap = Math.round(prof.speedTrap + Math.sin(l * 0.3) * 4);
    const i1Speed = Math.round(speedTrap * 0.97 + Math.cos(l * 0.4) * 3);
    const i2Speed = Math.round(speedTrap * 0.92 + Math.sin(l * 0.5) * 4);

    if (lapDuration < overallFastestLap && !isPitOut && !pitLapNumbers.has(l)) {
      overallFastestLap = lapDuration;
      overallFastestIdx = l;
    }

    laps.push({
      lapNumber: l,
      lapDuration,
      lapDurationDisplay: formatLapTime(lapDuration),
      s1,
      s2,
      s3,
      speedTrap,
      i1Speed,
      i2Speed,
      compound: currentStint.compound,
      tyreAge,
      isPitOut,
      isPersonalBest: false,
      isOverallFastest: false,
    });
  }

  // Calculate Personal Best progression
  let currentPB = 999;
  for (const lap of laps) {
    if (!lap.isPitOut && !pitLapNumbers.has(lap.lapNumber) && lap.lapDuration < currentPB) {
      currentPB = lap.lapDuration;
      lap.isPersonalBest = true;
    }
  }

  // Mark overall fastest lap (Verstappen P1 owns the official purple fastest lap)
  if (driverNumber === 1 && laps[overallFastestIdx - 1]) {
    laps[overallFastestIdx - 1].isOverallFastest = true;
  }

  return laps;
}

// Driver Stints helper
export function getDriverStints(driverNumber: number): OpenF1Stint[] {
  const prof = getDriverPerformanceProfile(driverNumber);
  return prof.stints.map((s) => ({
    meeting_key: 1252,
    session_key: 9636,
    stint_number: s.stint_number,
    driver_number: driverNumber,
    lap_start: s.lap_start,
    lap_end: s.lap_end,
    compound: s.compound,
    tyre_age_at_start: 0,
  }));
}

// Driver Pit Stops helper
export function getDriverPitStops(driverNumber: number): OpenF1Pit[] {
  const prof = getDriverPerformanceProfile(driverNumber);
  return prof.pitStops.map((p) => ({
    meeting_key: 1252,
    session_key: 9636,
    driver_number: driverNumber,
    date: `2024-11-03T14:${20 + p.lap_number}:00Z`,
    lap_number: p.lap_number,
    stop_duration: p.stop_duration,
    lane_duration: p.pit_duration,
    pit_duration: p.pit_duration,
  }));
}

// Driver Position Progression helper
export function getDriverPositions(driverNumber: number, totalLaps = 71): OpenF1Position[] {
  const prof = getDriverPerformanceProfile(driverNumber);
  const positions: OpenF1Position[] = [];
  const start = prof.startGrid;
  const finish = prof.finishPosition;

  for (let l = 1; l <= totalLaps; l++) {
    let pos = start;
    if (l > 30) {
      pos = Math.round(start + (finish - start) * ((l - 30) / 41));
    } else if (l > 5) {
      pos = Math.round(start + (finish - start) * 0.4);
    }

    positions.push({
      session_key: 9636,
      meeting_key: 1252,
      driver_number: driverNumber,
      date: `2024-11-03T14:${l}:00Z`,
      position: pos,
    });
  }

  return positions;
}

// Driver Intervals helper (Gap to leader and gap to car ahead)
export function getDriverIntervals(driverNumber: number, totalLaps = 71): OpenF1Interval[] {
  const prof = getDriverPerformanceProfile(driverNumber);
  const intervals: OpenF1Interval[] = [];

  // P1 has 0.000 gap
  const isP1 = prof.finishPosition === 1;
  const finalGap = isP1 ? 0 : (prof.finishPosition - 1) * 3.8 + (prof.finishPosition > 10 ? 30 : 0);

  for (let l = 1; l <= totalLaps; l++) {
    const fraction = l / totalLaps;
    const gapToLeader = isP1 ? 0 : Number((fraction * finalGap + (Math.sin(l * 0.3) * 0.4)).toFixed(3));
    const intervalToAhead = isP1 ? 0 : Number((Math.max(0.4, (gapToLeader / (prof.finishPosition || 1)))).toFixed(3));

    intervals.push({
      session_key: 9636,
      meeting_key: 1252,
      driver_number: driverNumber,
      date: `2024-11-03T14:${l}:00Z`,
      gap_to_leader: gapToLeader,
      interval: intervalToAhead,
    });
  }

  return intervals;
}
