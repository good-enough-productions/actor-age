import { DateUtils } from '../utils/dateUtils.js';
import { ApiService } from '../services/ApiService.js';

/**
 * Content script for modifying IMDb pages
 */
class IMDbModifier {
  private movieReleaseDate: string | null = null;
  private readonly TOP_ACTORS_COUNT = 10;

  constructor() {
    this.initializeListeners();
  }

  private initializeListeners(): void {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'modifyIMDb') {
        this.modifyIMDbPage().catch(console.error);
      }
    });
  }

  /**
   * Main function to modify the IMDb page
   */
  private async modifyIMDbPage(): Promise<void> {
    console.log('Starting IMDb page modification...');

    try {
      // Fetch movie release date first
      await this.fetchMovieReleaseDate();
      
      // Add age column header
      this.addAgeColumnHeader();
      
      // Process cast rows
      await this.processCastRows();
      
      console.log('IMDb page modification completed');
    } catch (error) {
      console.error('Error modifying IMDb page:', error);
    }
  }

  /**
   * Fetch movie release date from API
   */
  private async fetchMovieReleaseDate(): Promise<void> {
    const imdbId = this.extractImdbId();
    if (!imdbId) {
      throw new Error('Could not extract IMDb ID from URL');
    }

    const response = await ApiService.getMovieReleaseDate(imdbId);
    if (response.success && response.data) {
      this.movieReleaseDate = response.data.releaseDate;
      console.log('Movie release date:', this.movieReleaseDate);
    } else {
      console.warn('Could not fetch movie release date:', response.error);
    }
  }

  /**
   * Extract IMDb ID from current URL
   */
  private extractImdbId(): string | null {
    const pathParts = window.location.pathname.split('/');
    return pathParts.length > 2 ? pathParts[2] : null;
  }

  /**
   * Add 'Age at Release' column header
   */
  private addAgeColumnHeader(): void {
    const headerRow = document.querySelector('.cast_list tr');
    if (headerRow) {
      const ageHeader = document.createElement('th');
      ageHeader.textContent = 'Age at Release';
      ageHeader.style.textAlign = 'center';
      headerRow.appendChild(ageHeader);
      console.log('Added age column header');
    } else {
      console.warn('Could not find header row');
    }
  }

  /**
   * Process all cast rows
   */
  private async processCastRows(): Promise<void> {
    const rows = document.querySelectorAll('.cast_list tr');
    console.log(`Found ${rows.length} cast rows`);

    const promises: Promise<void>[] = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const actorNameElement = row.querySelector('td:nth-child(2) a') as HTMLAnchorElement;
      
      if (actorNameElement) {
        const actorName = actorNameElement.textContent?.trim();
        if (actorName) {
          if (i <= this.TOP_ACTORS_COUNT) {
            // Process top actors immediately
            promises.push(this.addActorAge(row, actorName));
          } else {
            // Add button for other actors
            this.addGetAgeButton(row, actorName);
          }
        }
      }
    }

    // Wait for all top actor ages to be processed
    await Promise.allSettled(promises);
  }

  /**
   * Add age cell for an actor
   */
  private async addActorAge(row: Element, actorName: string): Promise<void> {
    const ageCell = document.createElement('td');
    ageCell.style.textAlign = 'center';
    ageCell.textContent = 'Loading...';
    row.appendChild(ageCell);

    try {
      const age = await this.fetchActorAge(actorName);
      ageCell.textContent = age !== null ? age.toString() : 'N/A';
    } catch (error) {
      console.error(`Error fetching age for ${actorName}:`, error);
      ageCell.textContent = 'Error';
    }
  }

  /**
   * Add "Get Age" button for an actor
   */
  private addGetAgeButton(row: Element, actorName: string): void {
    const ageCell = document.createElement('td');
    ageCell.style.textAlign = 'center';
    
    const button = document.createElement('button');
    button.textContent = 'Get Age';
    button.className = 'imdb-age-button';
    button.style.cssText = `
      padding: 4px 8px;
      background-color: #f5c518;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      font-weight: bold;
    `;

    button.addEventListener('click', async () => {
      button.disabled = true;
      button.textContent = 'Loading...';
      
      try {
        const age = await this.fetchActorAge(actorName);
        ageCell.textContent = age !== null ? age.toString() : 'N/A';
      } catch (error) {
        console.error(`Error fetching age for ${actorName}:`, error);
        ageCell.textContent = 'Error';
      }
    });

    ageCell.appendChild(button);
    row.appendChild(ageCell);
  }

  /**
   * Fetch actor's age at movie release
   */
  private async fetchActorAge(actorName: string): Promise<number | null> {
    if (!this.movieReleaseDate) {
      console.warn('Movie release date not available');
      return null;
    }

    const response = await ApiService.getActorDateOfBirth(actorName);
    if (response.success && response.data?.dateOfBirth) {
      return DateUtils.calculateAge(response.data.dateOfBirth, this.movieReleaseDate);
    }

    return null;
  }
}

// Initialize the IMDb modifier
new IMDbModifier();