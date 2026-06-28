"use client";

import { useCallback, useEffect, useState } from "react";
import { LangProvider } from "./lang-context";
import Header from "./Header";
import Hero from "./Hero";
import BookingSection from "./BookingSection";
import UpcomingTrips from "./UpcomingTrips";
import Services from "./Services";
import About from "./About";
import Gallery from "./Gallery";
import Reviews from "./Reviews";
import Footer from "./Footer";
import { type UpcomingTrip } from "./trips-data";
import type { PlaceData } from "@/app/lib/google-places";
import type { GalleryPhoto } from "@/app/actions/gallery";
import type { DBRoute } from "@/app/actions/routes";

interface HomeClientProps {
  initialTrips: UpcomingTrip[];
  placeData: PlaceData;
  initialGallery: GalleryPhoto[];
  initialRoutes: DBRoute[];
}

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

export default function HomeClient({ initialTrips, placeData, initialGallery, initialRoutes }: HomeClientProps) {
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
    <LangProvider>
    <div>
      <Header onBookClick={onBookClick} />
      <Hero onBookClick={onBookClick} rating={placeData.rating} reviewCount={placeData.reviewCount} />
      <BookingSection joinTrip={joinTrip} onClearJoin={clearJoin} routes={initialRoutes} />
      <Services />
      <UpcomingTrips trips={initialTrips} onJoin={handleJoin} />
      <div aria-hidden="true" style={{ padding: "40px 0", display: "flex", justifyContent: "center" }}>
        <img src="/wave-divider.svg" alt="" style={{ width: "60%", maxWidth: 700, height: 60 }} />
      </div>
      <About rating={placeData.rating} reviewCount={placeData.reviewCount} />
      <Gallery shots={initialGallery} />
      <Reviews reviews={placeData.fiveStarReviews} rating={placeData.rating} reviewCount={placeData.reviewCount} />
      <Footer />
    </div>
    </LangProvider>
  );
}
