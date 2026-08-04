"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getGoGreenData, type GoGreenData } from "@/app/actions/gogreen";

const POLL_INTERVAL_MS = 20_000;

export function useGoGreenData() {
  const [data, setData] = useState<GoGreenData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);

  const refresh = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      const result = await getGoGreenData();
      setData(result);
      setError(null);
    } catch (err) {
      console.error("useGoGreenData refresh error:", err);
      setError("ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [refresh]);

  return { data, loading, error, refresh };
}
