import { NextRequest, NextResponse } from "next/server";
import { searchMovies } from "@/lib/tmdb";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";

  if (!query) {
    return NextResponse.json([]);
  }

  try {
    const movies = await searchMovies(query);
    return NextResponse.json(movies);
  } catch (error) {
    console.error("[/api/search] TMDB error:", error);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}
