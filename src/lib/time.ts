import {
  addWeeks,
  eachDayOfInterval,
  endOfWeek,
  format,
  startOfWeek,
} from "date-fns";

export const WEEK_STARTS_ON = 1 as const;

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y ?? 0, (m ?? 1) - 1, d ?? 1, 12, 0, 0);
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function today(): Date {
  return startOfDay(new Date());
}

export function dayRelation(
  date: Date,
  relativeTo: Date = today(),
): "past" | "today" | "future" {
  const a = startOfDay(date).getTime();
  const b = startOfDay(relativeTo).getTime();
  if (a < b) return "past";
  if (a > b) return "future";
  return "today";
}

export function getWeek(offset: number, weekStartsOn: 0 | 1 = WEEK_STARTS_ON) {
  const anchor = addWeeks(today(), offset);
  const start = startOfWeek(anchor, { weekStartsOn });
  const end = endOfWeek(anchor, { weekStartsOn });
  const days = eachDayOfInterval({ start, end });
  return { start, end, days };
}

export function weekLabel(start: Date, end: Date): string {
  const sameMonth = start.getMonth() === end.getMonth();
  if (sameMonth) {
    return `${format(start, "d")}\u2013${format(end, "d MMM yyyy")}`;
  }
  if (start.getFullYear() === end.getFullYear()) {
    return `${format(start, "d MMM")} \u2013 ${format(end, "d MMM yyyy")}`;
  }
  return `${format(start, "d MMM yyyy")} \u2013 ${format(end, "d MMM yyyy")}`;
}

export function clampMinutes(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(23 * 60 + 59, Math.round(value)));
}

export function splitMinutes(total: number): { hours: number; minutes: number } {
  const safe = clampMinutes(total);
  return { hours: Math.floor(safe / 60), minutes: safe % 60 };
}

export function joinMinutes(hours: number, minutes: number): number {
  return clampMinutes(hours * 60 + minutes);
}

export function formatDuration(totalMinutes: number): string {
  const sign = totalMinutes < 0 ? "\u2212" : "";
  const abs = Math.abs(Math.round(totalMinutes));
  const hours = Math.floor(abs / 60);
  const minutes = abs % 60;
  if (hours === 0) return `${sign}${minutes}m`;
  if (minutes === 0) return `${sign}${hours}h`;
  return `${sign}${hours}h ${minutes}m`;
}

export function formatDurationCompact(totalMinutes: number): string {
  const sign = totalMinutes < 0 ? "\u2212" : "";
  const abs = Math.abs(Math.round(totalMinutes));
  const hours = Math.floor(abs / 60);
  const minutes = abs % 60;
  if (hours === 0) return `${sign}${minutes}m`;
  if (minutes === 0) return `${sign}${hours}h`;
  return `${sign}${hours}h${String(minutes).padStart(2, "0")}`;
}

/** Parse "4h 12m", "4:12", "4 hours, 12 minutes", "4 ure 12 minut", or a minute count. */
export function parseDuration(input: string): number | null {
  const raw = input.trim().toLowerCase().replace(/,/g, " ").replace(/\s+/g, " ");
  if (!raw) return null;

  const colon = raw.match(/^(\d{1,2}):(\d{1,2})$/);
  if (colon) return joinMinutes(Number(colon[1]), Number(colon[2]));

  const hourMatch = raw.match(
    /(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h|ura|ure|ur)(?![a-z\u010d\u0161\u017e])/i,
  );
  const minMatch = raw.match(
    /(\d+)\s*(?:minutes?|mins?|minuta|minute|minut|m)(?![a-z\u010d\u0161\u017e])/i,
  );

  let hours = 0;
  let minutes = 0;
  let found = false;

  if (hourMatch) {
    const hourValue = Number(hourMatch[1]);
    hours = Math.floor(hourValue);
    minutes += Math.round((hourValue % 1) * 60);
    found = true;
  }

  if (minMatch) {
    minutes += Number(minMatch[1]);
    found = true;
  } else if (hourMatch) {
    const after = raw.slice((hourMatch.index ?? 0) + hourMatch[0].length).trim();
    const trailing = after.match(/^(\d{1,2})$/);
    if (trailing) {
      minutes += Number(trailing[1]);
      found = true;
    }
  }

  if (found) return clampMinutes(hours * 60 + minutes);

  if (/^\d{1,4}$/.test(raw)) return clampMinutes(Number(raw));

  return null;
}

export type DurationParts = {
  sign: string;
  hours: number;
  minutes: number;
  hasHours: boolean;
  hasMinutes: boolean;
};

export function durationParts(totalMinutes: number): DurationParts {
  const sign = totalMinutes < 0 ? "\u2212" : "";
  const abs = Math.abs(Math.round(totalMinutes));
  const hours = Math.floor(abs / 60);
  const minutes = abs % 60;
  return {
    sign,
    hours,
    minutes,
    hasHours: hours > 0,
    hasMinutes: minutes > 0 || hours === 0,
  };
}
