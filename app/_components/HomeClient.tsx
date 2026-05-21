"use client";

import { useCallback, useEffect, useState } from "react";
import Header from "./Header";
import Hero from "./Hero";
import BookingSection from "./BookingSection";
import UpcomingTrips from "./UpcomingTrips";
import Services from "./Services";
import About from "./About";
import Gallery from "./Gallery";
import Footer from "./Footer";
import { type UpcomingTrip } from "./trips-data";

function scrollToId(id: string, block: "start" | "center" = "start") {
  const el = document.getElementById(id);
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const offset =
    block === "center"
      ? rect.top + window.scrollY - (window.innerHeight - rect.height) / 2
      : rect.top + window.scrollY - 70;
  window.scrollTo({ top: Math.max(0, offset), behavior: "smooth" });
}

export default function HomeClient() {
  const [joinTrip, setJoinTrip] = useState<UpcomingTrip | null>(null);

  const onBookClick = useCallback(() => scrollToId("book", "center"), []);

  const handleJoin = useCallback((trip: UpcomingTrip) => {
    setJoinTrip(trip);
    scrollToId("book", "center");
  }, []);

  const clearJoin = useCallback(() => setJoinTrip(null), []);

  // Smooth scroll for any in-page anchor clicks
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const a = (e.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute("href")!.slice(1);
      if (!document.getElementById(id)) return;
      e.preventDefault();
      scrollToId(id, id === "book" ? "center" : "start");
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  return (
    <div>
      <Header onBookClick={onBookClick} />
      <Hero onBookClick={onBookClick} />
      <BookingSection joinTrip={joinTrip} onClearJoin={clearJoin} />
      <Services />
      <UpcomingTrips onJoin={handleJoin} />
      <div aria-hidden="true" style={{ padding: "40px 0", display: "flex", justifyContent: "center" }}>
        <img src="/wave-divider.svg" alt="" style={{ width: "60%", maxWidth: 700, height: 60 }} />
      </div>
      <About />
      <Gallery />
      <Footer />
    </div>
  );
}
