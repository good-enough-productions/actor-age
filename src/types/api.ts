export interface MovieData {
  imdbId: string;
  releaseDate: string | null;
  title: string;
}

export interface ActorData {
  name: string;
  dateOfBirth: string | null;
  id: number;
}

export interface AgeCalculationResult {
  age: number | null;
  error?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  cached?: boolean;
}

export interface TMDBMovieResult {
  movie_results: Array<{
    id: number;
    title: string;
    release_date: string;
  }>;
}

export interface TMDBPersonSearchResult {
  results: Array<{
    id: number;
    name: string;
    known_for_department: string;
  }>;
}

export interface TMDBPersonDetails {
  id: number;
  name: string;
  birthday: string | null;
  deathday: string | null;
  biography: string;
}