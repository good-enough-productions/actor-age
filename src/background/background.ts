import { ApiService } from '../services/ApiService.js';

/**
 * Modern Chrome extension background script using Manifest V3
 */
class BackgroundService {
  constructor() {
    this.initializeListeners();
  }

  private initializeListeners(): void {
    // Listen for tab updates to detect IMDb full credits pages
    chrome.tabs.onUpdated.addListener(this.handleTabUpdate.bind(this));
    
    // Listen for messages from content scripts
    chrome.runtime.onMessage.addListener(this.handleMessage.bind(this));
  }

  private handleTabUpdate(
    tabId: number, 
    changeInfo: chrome.tabs.TabChangeInfo, 
    tab: chrome.tabs.Tab
  ): void {
    if (
      changeInfo.status === 'complete' &&
      tab.url?.includes('fullcredits')
    ) {
      console.log('Detected IMDb Full Cast and Crew page');
      chrome.tabs.sendMessage(tabId, { action: 'modifyIMDb' }).catch(console.error);
    }
  }

  private handleMessage(
    request: any,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: any) => void
  ): boolean {
    switch (request.action) {
      case 'getMovieReleaseDate':
        this.handleMovieRequest(request.imdbId, sendResponse);
        return true;
      
      case 'getActorDOB':
        this.handleActorRequest(request.actorName, sendResponse);
        return true;
      
      default:
        sendResponse({ success: false, error: 'Unknown action' });
        return false;
    }
  }

  private async handleMovieRequest(imdbId: string, sendResponse: (response: any) => void): Promise<void> {
    try {
      const result = await ApiService.getMovieReleaseDate(imdbId);
      sendResponse(result);
    } catch (error) {
      console.error('Error handling movie request:', error);
      sendResponse({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  private async handleActorRequest(actorName: string, sendResponse: (response: any) => void): Promise<void> {
    try {
      const result = await ApiService.getActorDateOfBirth(actorName);
      sendResponse(result);
    } catch (error) {
      console.error('Error handling actor request:', error);
      sendResponse({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }
}

// Initialize the background service
new BackgroundService();