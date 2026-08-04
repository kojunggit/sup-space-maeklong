// ─── "พาย พาย พาย Dance Challenge" campaign layer ──────────────────────────────
// Single flag to disable the entire campaign layer (bar, ribbon, nav badge,
// footer link, social-proof line) without touching every file — flip
// CAMPAIGN_ENABLED to false, or just let CAMPAIGN_END_DATE pass.
// The /dance-challenge and /dance-challenge/rules pages stay reachable either
// way; they're just no longer promoted once the campaign is inactive.

export const CAMPAIGN_ENABLED = true;

// 2026-08-15 23:59 Asia/Bangkok (UTC+7, no DST)
export const CAMPAIGN_END_DATE = new Date("2026-08-15T23:59:00+07:00");

export const TOTAL_FREE_SLOTS = 30;

// Height of <CampaignBar/> in px — shared with every nav header so they can
// offset themselves by this exact amount while the bar is visible.
export const CAMPAIGN_BAR_HEIGHT = 40;

export const LINE_OA_URL = "https://line.me/R/ti/p/@256pyxrx";
export const LINE_OA_HANDLE = "@256pyxrx";

export const SONG_URL = "https://suno.com/s/RHmG3Xm6PhFoZSKu";

export function isCampaignActive(): boolean {
  return CAMPAIGN_ENABLED && Date.now() < CAMPAIGN_END_DATE.getTime();
}
