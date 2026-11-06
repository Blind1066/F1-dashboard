import type { ScheduleRace } from "../types";

/**
 * Utility to resolve high-resolution track/circuit photo backdrops for each 2026 Grand Prix round.
 */

const ROUND_FOLDER_MAP: Record<number, string> = {
  1: "01_Australia",
  2: "02_China",
  3: "03_Japan",
  4: "04_Miami",
  5: "05_Canada",
  6: "06_Monaco",
  7: "07_Spain_Barcelona",
  8: "08_Austria",
  9: "09_Great_Britain",
  10: "10_Belgium",
  11: "11_Hungary",
  12: "12_Netherlands",
  13: "13_Italy",
  14: "14_Spain_Madrid",
  15: "15_Azerbaijan",
  16: "16_Malaysia",
  17: "17_Singapore",
  18: "18_United_States",
  19: "19_Mexico",
  20: "20_Brazil",
  21: "21_Las_Vegas",
  22: "22_Qatar",
  23: "23_Abu_Dhabi",
};

const CIRCUIT_ID_MAP: Record<string, string> = {
  albert_park: "01_Australia",
  australia: "01_Australia",
  shanghai: "02_China",
  china: "02_China",
  suzuka: "03_Japan",
  japan: "03_Japan",
  miami: "04_Miami",
  villeneuve: "05_Canada",
  canada: "05_Canada",
  monaco: "06_Monaco",
  catalunya: "07_Spain_Barcelona",
  barcelona: "07_Spain_Barcelona",
  red_bull_ring: "08_Austria",
  austria: "08_Austria",
  silverstone: "09_Great_Britain",
  britain: "09_Great_Britain",
  uk: "09_Great_Britain",
  spa: "10_Belgium",
  belgium: "10_Belgium",
  hungaroring: "11_Hungary",
  hungary: "11_Hungary",
  zandvoort: "12_Netherlands",
  netherlands: "12_Netherlands",
  monza: "13_Italy",
  italy: "13_Italy",
  madrid: "14_Spain_Madrid",
  baku: "15_Azerbaijan",
  azerbaijan: "15_Azerbaijan",
  sepang: "16_Malaysia",
  malaysia: "16_Malaysia",
  marina_bay: "17_Singapore",
  singapore: "17_Singapore",
  americas: "18_United_States",
  cota: "18_United_States",
  usa: "18_United_States",
  rodriguez: "19_Mexico",
  mexico: "19_Mexico",
  interlagos: "20_Brazil",
  brazil: "20_Brazil",
  pace: "20_Brazil",
  vegas: "21_Las_Vegas",
  las_vegas: "21_Las_Vegas",
  losail: "22_Qatar",
  qatar: "22_Qatar",
  yas_marina: "23_Abu_Dhabi",
  abu_dhabi: "23_Abu_Dhabi",
  uae: "23_Abu_Dhabi",
};

/**
 * Returns the track photo URL for a given round or circuit ID / country name.
 * Defaults to Brazil Senna backdrop if not found.
 */
export function getTrackPhoto(
  round?: number | null,
  circuitId?: string | null,
  country?: string | null
): string {
  let folder: string | undefined;

  if (round && ROUND_FOLDER_MAP[round]) {
    folder = ROUND_FOLDER_MAP[round];
  } else if (circuitId) {
    const key = circuitId.toLowerCase().replace(/[^a-z0-9]/g, "_");
    folder = CIRCUIT_ID_MAP[key] || CIRCUIT_ID_MAP[circuitId.toLowerCase()];
  }

  if (!folder && country) {
    const cKey = country.toLowerCase().trim();
    for (const [k, v] of Object.entries(CIRCUIT_ID_MAP)) {
      if (cKey.includes(k) || k.includes(cKey)) {
        folder = v;
        break;
      }
    }
  }

  if (!folder) {
    folder = "20_Brazil";
  }

  return `/assets/track_photos/${folder}/track_photo.jpg`;
}

/**
 * Formats the weekend date range (e.g. "06 - 08 NOV") matching official F1 hero banners.
 */
export function formatWeekendRange(race: ScheduleRace): string {
  try {
    if (race.sessions && race.sessions.length > 0) {
      const firstSess = race.sessions[0];
      const start = new Date(firstSess.times?.date || firstSess.times?.iso || race.raceTimes.date);
      const end = new Date(race.raceTimes.date || race.raceTimes.iso);

      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        const startDay = String(start.getDate()).padStart(2, "0");
        const endDay = String(end.getDate()).padStart(2, "0");
        const month = end.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
        if (start.getMonth() === end.getMonth()) {
          return `${startDay} - ${endDay} ${month}`;
        }
        const startMonth = start.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
        return `${startDay} ${startMonth} - ${endDay} ${month}`;
      }
    }

    const end = new Date(race.raceTimes.date || race.raceTimes.iso);
    if (!isNaN(end.getTime())) {
      const day = String(end.getDate()).padStart(2, "0");
      const month = end.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
      return `${day} ${month}`;
    }
  } catch {
    // fallback
  }

  return race.raceTimes.localDate || "";
}
