/**
 * Popup script for the Chrome extension
 */
class PopupController {
  private statusElement: HTMLElement | null = null;
  private statusTextElement: HTMLElement | null = null;

  constructor() {
    this.initializeElements();
    this.checkCurrentTab();
  }

  private initializeElements(): void {
    this.statusElement = document.getElementById('status');
    this.statusTextElement = document.getElementById('status-text');
  }

  private async checkCurrentTab(): Promise<void> {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (tab.url?.includes('imdb.com') && tab.url?.includes('fullcredits')) {
        this.setStatus('active', 'Extension is active on this page');
      } else if (tab.url?.includes('imdb.com')) {
        this.setStatus('inactive', 'Navigate to a "Full Cast and Crew" page');
      } else {
        this.setStatus('inactive', 'Visit IMDb to use this extension');
      }
    } catch (error) {
      console.error('Error checking tab:', error);
      this.setStatus('inactive', 'Unable to check current page');
    }
  }

  private setStatus(type: 'active' | 'inactive', message: string): void {
    if (this.statusElement && this.statusTextElement) {
      this.statusElement.className = `status ${type}`;
      this.statusTextElement.textContent = message;
    }
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PopupController();
});