export const CLOSED_TRIPS_SETTING_KEY = "closedTripKeys";

export function regularTripKey(dateIso: string, timeSlot: string, routeId: string): string {
  return `regular|${dateIso}|${timeSlot}|${routeId}`;
}

export function specialTripKey(specialTripId: string): string {
  return `special|${specialTripId}`;
}

export function parseClosedTripKeys(value: string | null | undefined): Set<string> {
  if (!value) return new Set();
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((key): key is string => typeof key === "string"));
  } catch {
    return new Set();
  }
}
