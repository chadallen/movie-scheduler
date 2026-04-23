const TMDB_BASE_URL = "https://api.themoviedb.org/3";

function getApiKey(): string {
  const key = process.env.TMDB_API_KEY;
  if (!key) {
    throw new Error("TMDB_API_KEY environment variable is not set");
  }
  return key;
}

// Shape returned to callers for search results
export interface TmdbMovie {
  tmdb_id: number;
  title: string;
  year: string;
  poster_path: string | null;
}

// Shape returned for full movie details
export interface TmdbMovieDetails extends TmdbMovie {
  runtime_minutes: number | null;
}

// Raw shape from TMDB /search/movie results array
interface TmdbSearchResult {
  id: number;
  title: string;
  release_date?: string;
  poster_path?: string | null;
}

// Raw shape from TMDB /movie/{id}
interface TmdbMovieRaw {
  id: number;
  title: string;
  release_date?: string;
  poster_path?: string | null;
  runtime?: number | null;
}

interface TmdbSearchResponse {
  results: TmdbSearchResult[];
}

export async function searchMovies(query: string): Promise<TmdbMovie[]> {
  const url = new URL(`${TMDB_BASE_URL}/search/movie`);
  url.searchParams.set("api_key", getApiKey());
  url.searchParams.set("query", query);

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`TMDB search failed: ${response.status} ${response.statusText}`);
  }

  const data: TmdbSearchResponse = await response.json();

  return data.results.map((movie) => ({
    tmdb_id: movie.id,
    title: movie.title,
    year: movie.release_date ? movie.release_date.slice(0, 4) : "",
    poster_path: movie.poster_path ?? null,
  }));
}

export async function getMovieDetails(tmdbId: number): Promise<TmdbMovieDetails> {
  const url = new URL(`${TMDB_BASE_URL}/movie/${tmdbId}`);
  url.searchParams.set("api_key", getApiKey());

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`TMDB movie details failed: ${response.status} ${response.statusText}`);
  }

  const movie: TmdbMovieRaw = await response.json();

  return {
    tmdb_id: movie.id,
    title: movie.title,
    year: movie.release_date ? movie.release_date.slice(0, 4) : "",
    poster_path: movie.poster_path ?? null,
    runtime_minutes: movie.runtime ?? null,
  };
}
