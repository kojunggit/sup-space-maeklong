"use client";

import { createContext, useContext, useState, useEffect } from "react";

export type Lang = "th" | "en";

interface LangContextValue {
  lang: Lang;
  toggleLang: () => void;
}

const LangContext = createContext<LangContextValue>({ lang: "th", toggleLang: () => {} });

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("th");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("sup-lang") as Lang | null;
      if (saved === "en") setLang("en");
    } catch {}
  }, []);

  const toggleLang = () => {
    setLang((l) => {
      const next = l === "th" ? "en" : "th";
      try { localStorage.setItem("sup-lang", next); } catch {}
      return next;
    });
  };

  return <LangContext.Provider value={{ lang, toggleLang }}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}
