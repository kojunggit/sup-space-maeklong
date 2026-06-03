// Phone number helpers — used for member lookup (phone is the membership ID).
// Canonical form is a Thai local number starting with 0, e.g. "0812345678".

/**
 * Normalize a raw phone string to canonical Thai local form ("0xxxxxxxxx").
 * Strips spaces/dashes/parentheses and converts +66 / 66 country-code prefixes
 * back to a leading 0. Returns digits only; does not validate.
 */
export function normalizePhone(raw: string): string {
  let s = (raw ?? "").trim();
  // keep only digits and a leading +
  s = s.replace(/[^\d+]/g, "");
  // +66… or 66… (full length) → 0…
  if (s.startsWith("+66")) s = "0" + s.slice(3);
  else if (s.startsWith("66") && s.length >= 11) s = "0" + s.slice(2);
  // drop any remaining +
  s = s.replace(/\+/g, "");
  return s;
}

/** Thai mobile/landline: leading 0 followed by 8–9 digits. */
export function isValidPhone(p: string): boolean {
  return /^0\d{8,9}$/.test(p);
}

/** Display form "081-234-5678" (mobile) or "02-123-4567" (landline). Falls back to input. */
export function formatPhone(p: string): string {
  if (/^0\d{9}$/.test(p)) return `${p.slice(0, 3)}-${p.slice(3, 6)}-${p.slice(6)}`;
  if (/^0\d{8}$/.test(p)) return `${p.slice(0, 2)}-${p.slice(2, 5)}-${p.slice(5)}`;
  return p;
}
