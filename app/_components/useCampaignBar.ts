"use client";

import { useCallback, useEffect, useState } from "react";
import { isCampaignActive } from "./campaign-config";

const DISMISS_KEY = "campaignBarDismissed";

/**
 * Shared client-only visibility state for the campaign top bar. Both the bar
 * itself and every page's nav header call this so they agree on whether the
 * bar occupies space (and the nav needs to sit lower) without prop drilling
 * across the per-page header implementations.
 */
export function useCampaignBarVisible() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = window.localStorage.getItem(DISMISS_KEY) === "1";
    setVisible(isCampaignActive() && !dismissed);
  }, []);

  const dismiss = useCallback(() => {
    window.localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  }, []);

  return [visible, dismiss] as const;
}
