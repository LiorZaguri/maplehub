interface GoogleDriveFile {
  id: string;
  name: string;
  createdTime: string;
}

// Type declarations for Google APIs
declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

// Suppress Google OAuth warnings globally as soon as this module loads
(function() {
  const originalWarn = console.warn;
  const originalError = console.error;
  
  console.warn = (...args) => {
    const message = args[0]?.toString() || '';
    if (message.includes('Cross-Origin-Opener-Policy') || 
        message.includes('window.opener call') ||
        message.includes('cb=gapi.loaded') ||
        message.includes('fedcm_migration_mod')) {
      return; // Suppress Google OAuth warnings
    }
    originalWarn.apply(console, args);
  };
  
  console.error = (...args) => {
    const message = args[0]?.toString() || '';
    if (message.includes('Cross-Origin-Opener-Policy') || 
        message.includes('window.opener call') ||
        message.includes('cb=gapi.loaded') ||
        message.includes('fedcm_migration_mod')) {
      return; // Suppress Google OAuth errors
    }
    originalError.apply(console, args);
  };
})();

class GoogleDriveService {
  private clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  private scope = 'https://www.googleapis.com/auth/drive.file';
  private discoveryDocs = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];
  private gapi: any = null;
  private tokenClient: any = null;

  async initialize(): Promise<boolean> {
    try {
      if (!this.clientId) {
        console.error('Google Drive client ID not found. Please set VITE_GOOGLE_CLIENT_ID in your .env file');
        return false;
      }
      
      // Suppress Google OAuth COOP warnings globally
      this.suppressGoogleWarnings();
      
      // Load Google API script if not already loaded
      if (!window.gapi) {
        await this.loadGoogleAPI();
      }

      // Load Google Identity Services
      await this.loadGoogleIdentityServices();

      // Wait for gapi to be available
      await new Promise((resolve) => {
        window.gapi.load('client', resolve);
      });

      // Initialize the client
      await window.gapi.client.init({
        discoveryDocs: this.discoveryDocs,
      });

      // Initialize the token client
      this.tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: this.clientId,
        scope: this.scope,
        callback: (response: any) => {
          // Token received
        },
      });

      this.gapi = window.gapi;
      return true;
    } catch (error) {
      console.error('Failed to initialize Google Drive:', error);
      return false;
    }
  }

  private loadGoogleAPI(): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google API'));
      document.head.appendChild(script);
    });
  }

  private loadGoogleIdentityServices(): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
      document.head.appendChild(script);
    });
  }

  private suppressGoogleWarnings(): void {
    // Store original console methods
    const originalWarn = console.warn;
    const originalError = console.error;
    
    // Override console.warn
    console.warn = (...args) => {
      const message = args[0]?.toString() || '';
      if (message.includes('Cross-Origin-Opener-Policy') || 
          message.includes('window.opener call') ||
          message.includes('cb=gapi.loaded') ||
          message.includes('fedcm_migration_mod')) {
        return; // Suppress Google OAuth warnings
      }
      originalWarn.apply(console, args);
    };
    
    // Override console.error
    console.error = (...args) => {
      const message = args[0]?.toString() || '';
      if (message.includes('Cross-Origin-Opener-Policy') || 
          message.includes('window.opener call') ||
          message.includes('cb=gapi.loaded') ||
          message.includes('fedcm_migration_mod')) {
        return; // Suppress Google OAuth errors
      }
      originalError.apply(console, args);
    };
  }

  async authenticate(): Promise<boolean> {
    try {
      if (!this.gapi || !this.tokenClient) {
        const initialized = await this.initialize();
        if (!initialized) return false;
      }

      // Check if we already have a valid token
      const existingToken = this.gapi.client.getToken();
      if (existingToken && existingToken.access_token) {
        // Check if token is still valid (not expired)
        const now = Date.now();
        if (existingToken.expires_at && now < existingToken.expires_at) {
          return true; // Token is still valid
        }
      }

      return new Promise((resolve) => {
        this.tokenClient.callback = (response: any) => {
          if (response.error) {
            console.error('Authentication failed:', response.error);
            resolve(false);
            return;
          }
          
          // Set the access token for gapi
          this.gapi.client.setToken(response);
          resolve(true);
        };

        // Request access token
        this.tokenClient.requestAccessToken();
      });
    } catch (error) {
      console.error('Authentication failed:', error);
      return false;
    }
  }

  // Silent authentication check that doesn't trigger popup
  async isAuthenticated(): Promise<boolean> {
    try {
      if (!this.gapi || !this.tokenClient) {
        const initialized = await this.initialize();
        if (!initialized) return false;
      }

      // Check if we already have a valid token
      const existingToken = this.gapi.client.getToken();
      if (existingToken && existingToken.access_token) {
        // Check if token is still valid (not expired)
        const now = Date.now();
        if (existingToken.expires_at && now < existingToken.expires_at) {
          return true; // Token is still valid
        }
      }

      return false; // No valid token found
    } catch (error) {
      return false;
    }
  }

  async uploadFile(data: string, filename: string): Promise<string | null> {
    try {
      if (!this.gapi) {
        const authenticated = await this.authenticate();
        if (!authenticated) return null;
      }

      const fileMetadata = {
        name: filename,
        mimeType: 'application/json',
      };

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' }));
      form.append('file', new Blob([data], { type: 'application/json' }));

      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.gapi.client.getToken().access_token}`,
        },
        body: form,
      });

      const result = await response.json();
      return result.id;
    } catch (error) {
      console.error('Upload failed:', error);
      return null;
    }
  }

  async downloadFile(fileId: string): Promise<string | null> {
    try {
      if (!this.gapi) {
        const authenticated = await this.authenticate();
        if (!authenticated) return null;
      }

      const response = await this.gapi.client.drive.files.get({
        fileId: fileId,
        alt: 'media',
      });

      return response.body;
    } catch (error) {
      console.error('Download failed:', error);
      return null;
    }
  }

  async listFiles(): Promise<GoogleDriveFile[]> {
    try {
      if (!this.gapi) {
        const authenticated = await this.authenticate();
        if (!authenticated) return [];
      }

      // First try to find all JSON files in root folder
      let response = await this.gapi.client.drive.files.list({
        q: "mimeType='application/json' and trashed=false",
        fields: 'files(id,name,createdTime,parents)',
        orderBy: 'createdTime desc',
      });

      let files = response.result.files || [];

      // Filter for MapleHub related files
      const mapleHubFiles = files.filter((file: any) => 
        file.name.includes('maplehub') || 
        file.name.includes('backup') || 
        file.name.includes('Untitled')
      );

      // If no files found, try appDataFolder (for old files)
      if (mapleHubFiles.length === 0) {
        response = await this.gapi.client.drive.files.list({
          q: "mimeType='application/json' and parents in 'appDataFolder' and trashed=false",
          fields: 'files(id,name,createdTime,parents)',
          orderBy: 'createdTime desc',
        });
        const appDataFiles = response.result.files || [];
        
        const appDataMapleHubFiles = appDataFiles.filter((file: any) => 
          file.name.includes('maplehub') || 
          file.name.includes('backup') || 
          file.name.includes('Untitled')
        );
        
        // If still no files, return all JSON files for debugging
        if (appDataMapleHubFiles.length === 0) {
          return files.slice(0, 10); // Limit to 10 most recent files
        }
        
        return appDataMapleHubFiles;
      }

      return mapleHubFiles;
    } catch (error) {
      console.error('List files failed:', error);
      return [];
    }
  }

  async deleteFile(fileId: string): Promise<boolean> {
    try {
      if (!this.gapi) {
        const authenticated = await this.authenticate();
        if (!authenticated) return false;
      }

      await this.gapi.client.drive.files.delete({
        fileId: fileId,
      });

      return true;
    } catch (error) {
      console.error('Delete failed:', error);
      return false;
    }
  }

  async signOut(): Promise<void> {
    try {
      if (this.gapi) {
        const token = this.gapi.client.getToken();
        if (token !== null) {
          this.gapi.client.setToken('');
        }
      }
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  }

  isSignedIn(): boolean {
    try {
      if (!this.gapi) return false;
      const token = this.gapi.client.getToken();
      return token !== null;
    } catch {
      return false;
    }
  }
}

export const googleDriveService = new GoogleDriveService();
