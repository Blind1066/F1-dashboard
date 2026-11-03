import type { OpenF1Driver, OpenF1Session } from "../types";

const OPENF1_BASE = "https://api.openf1.org/v1";

/**
 * Driver headshots come from OpenF1 (`headshot_url`, 2023+) at runtime.
 * Best-effort: any failure or timeout (5s) resolves to an empty map so standings are never blocked.
 */
export async function getHeadshots(year: number): Promise<Map<string, string>> {
  if (year < 2023) return new Map();

  const fetchWithTimeout = async <T>(path: string): Promise<T | null> => {
    const ctl = new AbortController();
    const timeoutId = setTimeout(() => ctl.abort(), 5000);
    try {
      const res = await fetch(`${OPENF1_BASE}/${path}`, { signal: ctl.signal });
      if (!res.ok) return null;
      return (await res.json()) as T;
    } catch {
      return null;
    } finally {
      clearTimeout(timeoutId);
    }
  };

  try {
    const sessions = await fetchWithTimeout<OpenF1Session[]>(`sessions?year=${year}&session_name=Race`);
    if (!sessions || !Array.isArray(sessions)) return new Map();

    const now = new Date();
    const started = sessions
      .filter((s) => new Date(s.date_start) <= now)
      .sort((a, b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime());

    if (!started.length) return new Map();

    const latestSession = started[started.length - 1];
    const drivers = await fetchWithTimeout<OpenF1Driver[]>(`drivers?session_key=${latestSession.session_key}`);
    if (!drivers || !Array.isArray(drivers)) return new Map();

    const faceMap = new Map<string, string>();
    for (const d of drivers) {
      if (d.name_acronym && d.headshot_url) {
        faceMap.set(d.name_acronym, d.headshot_url);
      }
    }
    return faceMap;
  } catch {
    return new Map();
  }
}

