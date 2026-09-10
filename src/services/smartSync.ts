// Smart Catch-Up Sync Service
// Automatically synchronizes stock prices at market open (9:30 AM ET) and close (4:00 PM ET)
// without requiring persistent backend infrastructure.
import { store } from "../state";

const LAST_SYNC_KEY = "marketpulse_last_sync_timestamp";

export function getLastSyncTimestamp(): number | null {
  try {
    const raw = localStorage.getItem(LAST_SYNC_KEY);
    if (!raw) return null;
    const ts = parseInt(raw, 10);
    return isNaN(ts) ? null : ts;
  } catch {
    return null;
  }
}

export function setLastSyncTimestamp(ts: number = Date.now()): void {
  try {
    localStorage.setItem(LAST_SYNC_KEY, String(ts));
  } catch {}
}

export type EtTimeInfo = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  weekday: string;
  isWeekday: boolean;
  minutesSinceMidnight: number;
};

export function getEtTimeInfo(date: Date = new Date()): EtTimeInfo {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(date);

  const map: Record<string, string> = {};
  for (const p of parts) map[p.type] = p.value;

  const year = parseInt(map.year, 10);
  const month = parseInt(map.month, 10);
  const day = parseInt(map.day, 10);
  const hour = parseInt(map.hour, 10);
  const minute = parseInt(map.minute, 10);
  const weekday = map.weekday || "";
  const isWeekday = !["Sat", "Sun"].includes(weekday);
  const minutesSinceMidnight = hour * 60 + minute;

  return { year, month, day, hour, minute, weekday, isWeekday, minutesSinceMidnight };
}

/**
 * Determines whether market open (9:30 AM ET = 570 mins) or market close (4:00 PM ET = 960 mins)
 * has occurred since the last sync.
 */
export function isCatchUpSyncDue(lastSync: number | null): boolean {
  if (!lastSync) return true;

  const now = new Date();
  const lastDate = new Date(lastSync);
  const nowMs = now.getTime();
  const lastMs = lastDate.getTime();

  // If clock moved backwards, don't trigger
  if (nowMs < lastMs) return false;

  const nowEt = getEtTimeInfo(now);
  const lastEt = getEtTimeInfo(lastDate);

  const OPEN_MINUTES = 570; // 9:30 AM ET
  const CLOSE_MINUTES = 960; // 4:00 PM ET

  // Dynamic In-Session Live Polling:
  // If the market is currently OPEN (regular session on weekdays), poll every 20 seconds
  if (
    nowEt.isWeekday &&
    nowEt.minutesSinceMidnight >= OPEN_MINUTES &&
    nowEt.minutesSinceMidnight < CLOSE_MINUTES
  ) {
    return nowMs - lastMs >= 20 * 1000;
  }

  // Outside market hours:
  // Avoid spamming if synced within the last 5 minutes
  if (nowMs - lastMs < 5 * 60 * 1000) return false;

  // If more than 7 days ago, definitely due
  if (nowMs - lastMs > 7 * 24 * 60 * 60 * 1000) return true;

  // Case 1: Same calendar day in Eastern Time
  if (nowEt.year === lastEt.year && nowEt.month === lastEt.month && nowEt.day === lastEt.day) {
    if (!nowEt.isWeekday) return false; // Weekend - no intra-day market milestones

    // Crossed 9:30 AM market open today
    if (lastEt.minutesSinceMidnight < OPEN_MINUTES && nowEt.minutesSinceMidnight >= OPEN_MINUTES) {
      return true;
    }
    // Crossed 4:00 PM market close today
    if (lastEt.minutesSinceMidnight < CLOSE_MINUTES && nowEt.minutesSinceMidnight >= CLOSE_MINUTES) {
      return true;
    }
    return false;
  }

  // Case 2: Different calendar days
  // If last sync was on a weekday before that day's 4:00 PM close, the close happened -> due
  if (lastEt.isWeekday && lastEt.minutesSinceMidnight < CLOSE_MINUTES) {
    return true;
  }

  // If today is a weekday and we are past today's 9:30 AM open -> due
  if (nowEt.isWeekday && nowEt.minutesSinceMidnight >= OPEN_MINUTES) {
    return true;
  }

  // If there was any full weekday between lastSync and now -> due
  const dayDiff = Math.floor((nowMs - lastMs) / (24 * 60 * 60 * 1000));
  if (dayDiff >= 2) {
    return true;
  }

  return false;
}

/**
 * Evaluates sync state and triggers automatic batch sync if a market milestone has passed
 * or if dynamic live updates are due during market hours.
 */
export async function checkAndTriggerCatchUpSync(): Promise<boolean> {
  if (store.stocks.value.length === 0) return false;
  if (store.isSyncingAll.value) return false;

  const lastSync = getLastSyncTimestamp();
  if (!isCatchUpSyncDue(lastSync)) return false;

  await store.syncAllStocks(true);
  return true;
}

/**
 * Initializes automatic background listeners for catch-up syncing and live in-session updates.
 */
export function initSmartCatchUpSync(): () => void {
  // 1. Initial check when app loads
  checkAndTriggerCatchUpSync();

  // 2. Check whenever user switches back to this tab/window
  const handleVisibilityChange = () => {
    if (document.visibilityState === "visible") {
      checkAndTriggerCatchUpSync();
    }
  };
  const handleFocus = () => {
    checkAndTriggerCatchUpSync();
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);
  window.addEventListener("focus", handleFocus);

  // 3. Periodic check every 15 seconds while tab remains open
  const intervalId = setInterval(() => {
    if (document.visibilityState === "visible") {
      checkAndTriggerCatchUpSync();
    }
  }, 15 * 1000);

  return () => {
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    window.removeEventListener("focus", handleFocus);
    clearInterval(intervalId);
  };
}
