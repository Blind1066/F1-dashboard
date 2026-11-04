export interface DriverStanding {
  position: number;
  delta: number;
  points: number;
  gained: number;
  wins: number;
  number: string | number;
  name: string;
  acronym: string;
  team: string;
  teamId: string;
  colour: string;
  logo: string;
  headshot: string;
}

export interface TeamStanding {
  position: number;
  delta: number;
  points: number;
  gained: number;
  wins: number;
  name: string;
  constructorId: string;
  colour: string;
  logo: string;
}

export interface StandingsData {
  drivers: DriverStanding[];
  teams: TeamStanding[];
}

export interface Race {
  round: number;
  name: string;
  country: string;
  date: string;
  time?: string;
}

export interface JolpicaSessionRaw {
  date: string;
  time?: string;
}

export interface JolpicaResultRaw {
  number?: string;
  position: string;
  positionText?: string;
  points?: string;
  grid?: string;
  laps?: string;
  status?: string;
  Driver: {
    driverId: string;
    permanentNumber?: string;
    code?: string;
    givenName: string;
    familyName: string;
    nationality?: string;
  };
  Constructor: {
    constructorId: string;
    name: string;
  };
  Time?: {
    millis?: string;
    time?: string;
  };
  FastestLap?: {
    rank?: string;
    lap?: string;
    Time?: {
      time?: string;
    };
  };
}

export interface JolpicaQualifyingResultRaw {
  number?: string;
  position: string;
  Driver: {
    driverId: string;
    permanentNumber?: string;
    code?: string;
    givenName: string;
    familyName: string;
  };
  Constructor: {
    constructorId: string;
    name: string;
  };
  Q1?: string;
  Q2?: string;
  Q3?: string;
}

export interface JolpicaRace {
  round: string;
  raceName: string;
  date: string;
  time?: string;
  Circuit?: {
    circuitId?: string;
    circuitName?: string;
    Location?: {
      country?: string;
      locality?: string;
    };
  };
  FirstPractice?: JolpicaSessionRaw;
  SecondPractice?: JolpicaSessionRaw;
  ThirdPractice?: JolpicaSessionRaw;
  Qualifying?: JolpicaSessionRaw;
  Sprint?: JolpicaSessionRaw;
  SprintQualifying?: JolpicaSessionRaw;
  Results?: JolpicaResultRaw[];
  QualifyingResults?: JolpicaQualifyingResultRaw[];
  SprintResults?: JolpicaResultRaw[];
}

export interface JolpicaDriverStandingRaw {
  position: string;
  positionText?: string;
  points: string;
  wins: string;
  Driver: {
    driverId: string;
    permanentNumber?: string;
    code?: string;
    givenName: string;
    familyName: string;
  };
  Constructors: Array<{
    constructorId: string;
    name: string;
  }>;
}

export interface JolpicaConstructorStandingRaw {
  position: string;
  positionText?: string;
  points: string;
  wins: string;
  Constructor: {
    constructorId: string;
    name: string;
  };
}

export interface JolpicaMRData<T> {
  MRData: T;
}

export interface OpenF1Driver {
  session_key?: number;
  driver_number?: number;
  name_acronym?: string;
  headshot_url?: string;
}

export interface OpenF1Session {
  session_key: number;
  session_name: string;
  date_start: string;
}

export interface SessionTiming {
  iso: string;
  date: Date;
  localDate: string;
  localTime: string;
  localTzName: string;
  trackDate: string;
  trackTime: string;
  trackTzName: string;
  localDisplay: string;
  trackDisplay: string;
}

export interface RaceSession {
  name: string;
  type: "fp" | "sprint_qual" | "sprint" | "qual" | "race";
  isMain?: boolean;
  times: SessionTiming;
}

export interface RaceWinner {
  driver: string;
  code: string;
  team: string;
  time: string;
  colour: string;
  logo: string;
}

export interface RaceCircuit {
  id: string;
  name: string;
  city: string;
  country: string;
  timezone: string;
  flag: string;
  flagUrl: string;
}

export interface ScheduleRace {
  round: number;
  name: string;
  circuit: RaceCircuit;
  date: string;
  time?: string;
  raceTimes: SessionTiming;
  diffText: string;
  isCompleted: boolean;
  winner: RaceWinner | null;
  sessions: RaceSession[];
}

export interface FastestLapInfo {
  rank: number;
  lap: number;
  time: string;
}

export interface RaceResultRow {
  position: number;
  positionText: string;
  points: number;
  grid: number;
  delta: number; // grid - pos (positive means gained positions)
  laps: number;
  status: string;
  time: string;
  fastestLap?: FastestLapInfo;
  driver: {
    id: string;
    code: string;
    number: string;
    name: string;
    headshot: string;
    nationality: string;
  };
  team: {
    id: string;
    name: string;
    colour: string;
    logo: string;
  };
}

export interface QualifyingResultRow {
  position: number;
  driver: {
    id: string;
    code: string;
    number: string;
    name: string;
    headshot: string;
  };
  team: {
    id: string;
    name: string;
    colour: string;
    logo: string;
  };
  q1?: string;
  q2?: string;
  q3?: string;
}

export interface FullRaceDetails {
  round: number;
  raceName: string;
  circuitName: string;
  locality: string;
  country: string;
  date: string;
  flagUrl: string;
  results: RaceResultRow[];
  qualifying?: QualifyingResultRow[];
  sprint?: RaceResultRow[];
}



export interface LiveDriverTiming {
  position: number;
  delta: number;
  number: string;
  code: string;
  name: string;
  team: string;
  teamId: string;
  colour: string;
  headshot: string;
  gap: string;
  interval: string;
  lastLap: string;
  fastestLap: string;
  isFastestLap: boolean;
  tyre: "soft" | "medium" | "hard" | "intermediate" | "wet";
  tyreAge: number;
  pitStops: number;
  status: "active" | "in_pit" | "out";
  sector1: string;
  sector2: string;
  sector3: string;
}

export interface LiveRaceSessionState {
  round: number;
  raceName: string;
  circuitName: string;
  currentLap: number;
  totalLaps: number;
  status: "GREEN FLAG" | "YELLOW FLAG" | "SAFETY CAR" | "VSC" | "RED FLAG" | "CHEQUERED FLAG";
  fastestLapDriver: string;
  fastestLapTime: string;
  fastestLapLap: number;
  trackTemp: string;
  airTemp: string;
  humidity: string;
  drivers: LiveDriverTiming[];
}
