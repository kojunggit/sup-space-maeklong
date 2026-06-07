export const GALLERY_CATEGORIES = [
  { id: "nature",  label: "พายกับธรรมชาติ",    icon: "🌿" },
  { id: "market",  label: "วิถีชีวิตและตลาดน้ำ", icon: "🛶" },
  { id: "friends", label: "พายกับเพื่อน",       icon: "👯" },
  { id: "pets",    label: "เพื่อนซี้ 4 ขา",     icon: "🐕" },
  { id: "spots",   label: "จุดแวะพักนักพาย",    icon: "☕" },
] as const;

export type CategoryId = typeof GALLERY_CATEGORIES[number]["id"];

export const VALID_CATEGORY_IDS = new Set<string>(
  GALLERY_CATEGORIES.map((c) => c.id),
);
