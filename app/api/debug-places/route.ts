import { NextResponse } from "next/server";
import { isAdminRequest } from "@/app/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  // Debug endpoint — exposes env/config status, so gate behind admin auth.
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const placeId = process.env.GOOGLE_PLACE_ID;
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  // Step 1: check env vars
  if (!placeId || !apiKey) {
    return NextResponse.json({
      ok: false,
      step: "env",
      GOOGLE_PLACE_ID: placeId ? "✅ set" : "❌ missing",
      GOOGLE_PLACES_API_KEY: apiKey ? "✅ set" : "❌ missing",
    });
  }

  // Step 2: call Places API
  let rawStatus: number | null = null;
  let rawBody: unknown = null;

  try {
    const res = await fetch(
      `https://places.googleapis.com/v1/places/${placeId}?languageCode=th`,
      {
        headers: {
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "rating,userRatingCount,reviews",
        },
        cache: "no-store",
      }
    );

    rawStatus = res.status;
    rawBody = await res.json();

    if (!res.ok) {
      return NextResponse.json({
        ok: false,
        step: "api_call",
        GOOGLE_PLACE_ID: "✅ set",
        GOOGLE_PLACES_API_KEY: "✅ set",
        httpStatus: rawStatus,
        apiError: rawBody,
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = rawBody as any;
    const reviews = (data.reviews ?? []) as Array<{ rating: number }>;

    return NextResponse.json({
      ok: true,
      GOOGLE_PLACE_ID: "✅ set",
      GOOGLE_PLACES_API_KEY: "✅ set",
      httpStatus: rawStatus,
      rating: data.rating,
      userRatingCount: data.userRatingCount,
      reviewsReturned: reviews.length,
      fiveStarCount: reviews.filter((r) => r.rating === 5).length,
    });
  } catch (err) {
    return NextResponse.json({
      ok: false,
      step: "fetch_error",
      error: String(err),
      httpStatus: rawStatus,
    });
  }
}
