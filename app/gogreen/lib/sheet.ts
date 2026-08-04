// Reads the "GoGreen" event registrant list live from a public Google Sheet
// (Google Form responses, shared as "anyone with the link can view").
// Read-only — the app never writes back to the Sheet; check-in state lives
// in the local DB instead (see app/actions/gogreen.ts).

import { normalizePhone } from "@/app/lib/phone";

const SHEET_ID = "1VJLM11YB4jFg4LizAeDTBJ0YedStmHQaYYym1spTb_Q";
const SHEET_GID = "0";
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=${SHEET_GID}`;

export type BoatCategory = "own" | "kayak1" | "kayak2" | "sup" | "none" | "other";
export type GroupType = "paddle" | "event";

export interface GoGreenSheetRow {
  timestamp: string;
  name: string;
  phone: string;
  boatTypeRaw: string;
  boatCategory: BoatCategory;
}

export const BOAT_CATEGORY_LABEL: Record<BoatCategory, string> = {
  own: "นำเรือมาเอง",
  kayak1: "เช่า Kayak 1 ที่นั่ง",
  kayak2: "เช่า Kayak 2 ที่นั่ง",
  sup: "เช่า SUP",
  none: "ไม่ได้พายเรือ",
  other: "อื่น ๆ",
};

export const GROUP_TYPE_LABEL: Record<GroupType, string> = {
  paddle: "ร่วมพายเรือ",
  event: "ผู้ร่วมงาน",
};

/** Boat categories a kayak number gets auto-assigned to at check-in, and their starting number. */
export const BOAT_NUMBER_START: Partial<Record<BoatCategory, number>> = {
  kayak1: 101,
  kayak2: 201,
};

/** Selectable boat options for a walk-in who is joining the paddle group. */
export const WALKIN_BOAT_OPTIONS: BoatCategory[] = ["own", "kayak1", "kayak2"];

function categorizeBoat(raw: string): BoatCategory {
  const s = raw.trim();
  if (!s) return "other";
  if (/kayak\s*1/i.test(s)) return "kayak1";
  if (/kayak\s*2/i.test(s)) return "kayak2";
  if (/sup/i.test(s)) return "sup";
  if (/นำเรือมาเอง/.test(s)) return "own";
  return "other";
}

/** Minimal RFC4180 CSV parser — handles quoted fields with embedded commas/newlines/quotes. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

/**
 * Fetches and parses the registrant list. Always fetched fresh (no cache)
 * so the dashboard/list/register pages reflect new Google Form submissions
 * without a redeploy.
 */
export async function fetchGoGreenSheet(): Promise<GoGreenSheetRow[]> {
  const res = await fetch(CSV_URL, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to fetch GoGreen sheet: ${res.status}`);
  }
  const text = await res.text();
  const rows = parseCsv(text);
  if (rows.length === 0) return [];

  const [, ...dataRows] = rows; // first row is the header
  const seenPhones = new Set<string>();
  const out: GoGreenSheetRow[] = [];
  for (const r of dataRows) {
    const name = (r[1] ?? "").trim();
    const phoneRaw = (r[2] ?? "").trim();
    if (!name || !phoneRaw) continue;
    const phone = normalizePhone(phoneRaw);
    // A person may appear twice if they re-submitted the Google Form —
    // keep only their latest entry (rows are in submission order).
    if (seenPhones.has(phone)) {
      const idx = out.findIndex((x) => x.phone === phone);
      if (idx !== -1) out.splice(idx, 1);
    }
    seenPhones.add(phone);
    const boatTypeRaw = (r[10] ?? "").trim();
    out.push({
      timestamp: (r[0] ?? "").trim(),
      name,
      phone,
      boatTypeRaw,
      boatCategory: categorizeBoat(boatTypeRaw),
    });
  }
  return out;
}
