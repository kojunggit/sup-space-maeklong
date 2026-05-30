export interface PlaceReview {
  rating: number;
  text: string;
  authorName: string;
  authorPhoto?: string;
  relativeTime: string;
}

export interface PlaceData {
  rating: number;
  reviewCount: number;
  fiveStarReviews: PlaceReview[];
}

const FALLBACK: PlaceData = {
  rating: 4.9,
  reviewCount: 312,
  fiveStarReviews: [],
};

export async function getPlaceData(): Promise<PlaceData> {
  const placeId = process.env.GOOGLE_PLACE_ID;
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!placeId || !apiKey) return FALLBACK;

  try {
    const res = await fetch(
      `https://places.googleapis.com/v1/places/${placeId}?languageCode=th`,
      {
        headers: {
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "rating,userRatingCount,reviews",
        },
        next: { revalidate: 21600 }, // re-fetch every 6 hours
      }
    );

    if (!res.ok) return FALLBACK;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await res.json();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fiveStarReviews: PlaceReview[] = (data.reviews ?? [])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((r: any) => r.rating === 5 && r.text?.text?.trim())
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((r: any) => ({
        rating: r.rating as number,
        text: (r.originalText?.text ?? r.text.text) as string,
        authorName: (r.authorAttribution?.displayName ?? "ผู้ใช้ Google") as string,
        authorPhoto: r.authorAttribution?.photoUri as string | undefined,
        relativeTime: (r.relativePublishTimeDescription ?? "") as string,
      }));

    return {
      rating: (data.rating as number) ?? FALLBACK.rating,
      reviewCount: (data.userRatingCount as number) ?? FALLBACK.reviewCount,
      fiveStarReviews,
    };
  } catch {
    return FALLBACK;
  }
}
