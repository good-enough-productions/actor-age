import { ApiResponse, MovieData, ActorData } from '../types/api.js';

export class ApiService {
  private static readonly BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://your-cloud-run-service.run.app'
    : 'http://localhost:8080';

  private static readonly ENDPOINTS = {
    MOVIE: '/api/movie',
    ACTOR: '/api/actor'
  } as const;

  /**
   * Fetch movie release date from our API service
   */
  static async getMovieReleaseDate(imdbId: string): Promise<ApiResponse<MovieData>> {
    try {
      const response = await fetch(`${this.BASE_URL}${this.ENDPOINTS.MOVIE}/${imdbId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching movie data:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Fetch actor date of birth from our API service
   */
  static async getActorDateOfBirth(actorName: string): Promise<ApiResponse<ActorData>> {
    try {
      const encodedName = encodeURIComponent(actorName);
      const response = await fetch(`${this.BASE_URL}${this.ENDPOINTS.ACTOR}/${encodedName}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching actor data:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}