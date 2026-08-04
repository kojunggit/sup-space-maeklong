"use client";

import { useEffect, useState } from "react";

export function useCountdown(target: Date) {
  const [msLeft, setMsLeft] = useState(() => target.getTime() - Date.now());

  useEffect(() => {
    const id = setInterval(() => setMsLeft(target.getTime() - Date.now()), 1000);
    return () => clearInterval(id);
  }, [target]);

  const ended = msLeft <= 0;
  const total = Math.max(0, msLeft);
  const days    = Math.floor(total / (24 * 60 * 60 * 1000));
  const hours   = Math.floor((total / (60 * 60 * 1000)) % 24);
  const minutes = Math.floor((total / (60 * 1000)) % 60);
  const seconds = Math.floor((total / 1000) % 60);
  return { ended, days, hours, minutes, seconds };
}
