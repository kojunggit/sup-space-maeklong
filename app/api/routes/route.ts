import { NextResponse } from "next/server";
import { getRoutes } from "@/app/actions/routes";
import { CATEGORIES } from "@/app/_components/trips-data";

export async function GET() {
  const routes = await getRoutes();
  return NextResponse.json(
    { routes, categories: CATEGORIES },
    { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } },
  );
}
