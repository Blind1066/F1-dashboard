export interface OpenF1Session {
  session_key: number;
  session_name: string;
  session_type: string;
  date_start: string;
  date_end: string;
  gmt_offset: string;
  meeting_key: number;
  country_key?: number;
  country_code?: string;
  country_name: string;
  circuit_key?: number;
  circuit_short_name: string;
  location: string;
  year: number;
}

export interface OpenF1Meeting {
  meeting_key: number;
  meeting_name: string;
  meeting_official_name: string;
  location: string;
  country_key: number;
  country_code: string;
  country_name: string;
  circuit_key: number;
  circuit_short_name: string;
  date_start: string;
  gmt_offset: string;
  year: number;
}

export interface OpenF1Driver {
  session_key: number;
  meeting_key: number;
  broadcast_name?: string;
  country_code?: string;
  driver_number: number;
  first_name?: string;
  full_name: string;
  headshot_url?: string;
  last_name?: string;
  name_acronym: string;
  team_colour?: string;
  team_name: string;
}

export interface OpenF1Lap {
  meeting_key: number;
  session_key: number;
  driver_number: number;
  lap_number: number;
  date_start: string;
  duration_sector_1?: number | null;
  duration_sector_2?: number | null;
  duration_sector_3?: number | null;
  i1_speed?: number | null;
  i2_speed?: number | null;
  st_speed?: number | null; // Speed Trap
  is_pit_out_lap: boolean;
  lap_duration?: number | null;
  segments_sector_1?: number[];
  segments_sector_2?: number[];
  segments_sector_3?: number[];
}

export interface OpenF1CarDataRaw {
  meeting_key: number;
  session_key: number;
  driver_number: number;
  date: string;
  speed: number;
  throttle: number;
  brake: number;
  rpm: number;
  n_gear: number;
  drs: number;
}

export interface OpenF1Stint {
  meeting_key: number;
  session_key: number;
  stint_number: number;
  driver_number: number;
  lap_start: number;
  lap_end: number;
  compound: "SOFT" | "MEDIUM" | "HARD" | "INTERMEDIATE" | "WET" | string;
  tyre_age_at_start: number;
}

export interface OpenF1Interval {
  meeting_key: number;
  session_key: number;
  driver_number: number;
  date: string;
  gap_to_leader?: number | null;
  interval?: number | null;
}

export interface OpenF1Position {
  session_key: number;
  meeting_key: number;
  driver_number: number;
  date: string;
  position: number;
}

export interface OpenF1Pit {
  session_key: number;
  meeting_key: number;
  driver_number: number;
  date: string;
  lap_number: number;
  pit_duration?: number | null;
  stop_duration?: number | null;
  lane_duration?: number | null;
}

export interface OpenF1RaceControl {
  session_key: number;
  meeting_key: number;
  date: string;
  lap_number?: number | null;
  category: string;
  flag?: string | null;
  scope?: string | null;
  sector?: number | null;
  message: string;
}

export interface OpenF1Weather {
  session_key: number;
  meeting_key: number;
  date: string;
  air_temperature: number;
  track_temperature: number;
  humidity: number;
  pressure: number;
  wind_direction: number;
  wind_speed: number;
  rainfall: number;
}

export interface OpenF1Location {
  session_key: number;
  meeting_key: number;
  driver_number: number;
  date: string;
  x: number;
  y: number;
  z: number;
}

// Normalized Processed Telemetry Point for Distance-based Synchronized Charts
export interface TelemetryDataPoint {
  distance: number; // in meters from lap start
  timeSec: number; // time in seconds into the lap
  speed: number; // km/h
  throttle: number; // 0-100%
  brake: number; // 0 or 100% (or percentage)
  gear: number; // 1-8
  rpm: number;
  drs: boolean;
  // Compare values when Driver B is active
  compareSpeed?: number;
  compareThrottle?: number;
  compareBrake?: number;
  compareGear?: number;
  compareRpm?: number;
  delta?: number; // time delta in seconds (Driver A vs Driver B)
}

export interface TelemetryResult {
  data: TelemetryDataPoint[];
  source: "live" | "simulated";
  error?: string;
}

export interface ProcessedLapSummary {
  lapNumber: number;
  lapDuration: number;
  lapDurationDisplay: string;
  s1?: number | null;
  s2?: number | null;
  s3?: number | null;
  speedTrap?: number | null;
  i1Speed?: number | null;
  i2Speed?: number | null;
  compound: string;
  tyreAge: number;
  isPitOut: boolean;
  isPersonalBest: boolean;
  isOverallFastest: boolean;
  deltaToWinner?: number;
}

export interface TelemetryLapStats {
  maxSpeed: number;
  minSpeed: number;
  avgSpeed: number;
  speedTrap: number;
  fullThrottlePct: number;
  timeAcceleratingSec: number;
  brakeEventsCount: number;
  totalBrakingSec: number;
  avgDeceleration: number;
  gearChangesCount: number;
  topGear: number;
}

export interface DriverComparisonMetrics {
  driverAName: string;
  driverBName: string;
  driverAColour: string;
  driverBColour: string;
  lapNumber: number;
  lapTimeDelta: number; // A - B (negative means A is faster)
  avgSpeedDiff: number; // A - B
  topSpeedDiff: number; // A - B
  s1Advantage: "A" | "B" | "EQUAL";
  s1Delta: number;
  s2Advantage: "A" | "B" | "EQUAL";
  s2Delta: number;
  s3Advantage: "A" | "B" | "EQUAL";
  s3Delta: number;
  brakingAdvantage: string;
  tractionAdvantage: string;
  aiInsightsSummary: string[];
}

