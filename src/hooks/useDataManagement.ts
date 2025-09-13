import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useGoogleDrive } from '@/hooks/useGoogleDrive';
import { googleDriveService } from '@/services/googleDriveService';
import LZString from 'lz-string';

export interface DataManagementState {
  // Export/Import states
  importDialogOpen: boolean;
  importData: string;
  exportDialogOpen: boolean;
  exportData: string;
  isImporting: boolean;
  exportInfoExpanded: boolean;
  importInfoExpanded: boolean;
  
  // Google Drive states
  driveDialogOpen: boolean;
  customFilename: string;
  saveCount: number;
  driveFiles: any[];
  isLoadingFiles: boolean;
  isAuthenticated: boolean;
  isAuthenticating: boolean;
}

export interface DataManagementActions {
  // Export/Import actions
  setImportDialogOpen: (open: boolean) => void;
  setImportData: (data: string) => void;
  setExportDialogOpen: (open: boolean) => void;
  setExportData: (data: string) => void;
  setExportInfoExpanded: (expanded: boolean) => void;
  setImportInfoExpanded: (expanded: boolean) => void;
  handleExport: () => void;
  handleImport: () => Promise<void>;
  copyExportData: () => void;
  
  // Google Drive actions
  setDriveDialogOpen: (open: boolean) => void;
  setCustomFilename: (filename: string) => void;
  handleGoogleDriveAuth: () => Promise<void>;
  handleSaveNewBackup: () => Promise<void>;
  handleLoadBackup: (fileId: string) => Promise<void>;
  handleDeleteBackup: (fileId: string) => Promise<void>;
  handleSignOut: () => Promise<void>;
  loadDriveFiles: () => Promise<void>;
}

export function useDataManagement(): DataManagementState & DataManagementActions {
  const { toast } = useToast();
  const { uploadToDrive, downloadFromDrive, authenticate, isLoading: isGDriveLoading } = useGoogleDrive();

  // Export/Import states
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importData, setImportData] = useState('');
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportData, setExportData] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [exportInfoExpanded, setExportInfoExpanded] = useState(false);
  const [importInfoExpanded, setImportInfoExpanded] = useState(false);
  
  // Google Drive states
  const [driveDialogOpen, setDriveDialogOpen] = useState(false);
  const [customFilename, setCustomFilename] = useState('');
  const [saveCount, setSaveCount] = useState(0);
  const [driveFiles, setDriveFiles] = useState<any[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Helper function to update authentication state
  const updateAuthenticationState = (authenticated: boolean) => {
    setIsAuthenticated(authenticated);
  };

  // Check for existing authentication on component mount
  useEffect(() => {
    const checkExistingAuth = async () => {
      try {
        // Clean up old authentication key if it exists
        localStorage.removeItem('google-drive-authenticated');
        
        const isAlreadyAuthenticated = await googleDriveService.isAuthenticated();
        console.log('Google Drive authentication check result:', isAlreadyAuthenticated);
        updateAuthenticationState(isAlreadyAuthenticated);
        
        // If authenticated, load the drive files
        if (isAlreadyAuthenticated) {
          await loadDriveFiles();
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        // If check fails, user is not authenticated
        updateAuthenticationState(false);
      }
    };

    checkExistingAuth();
  }, []);

  // Export localStorage data
  const handleExport = () => {
    const data: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        try {
          data[key] = JSON.parse(localStorage.getItem(key) || '');
        } catch {
          data[key] = localStorage.getItem(key);
        }
      }
    }
    
    const jsonString = JSON.stringify(data);
    // Use LZ-string compression for much smaller export codes
    const compressedString = LZString.compressToEncodedURIComponent(jsonString);
    setExportData(compressedString);
    setExportDialogOpen(true);
  };

  // Copy export data to clipboard
  const copyExportData = () => {
    navigator.clipboard.writeText(exportData).then(() => {
      toast({
        title: "Copied to clipboard!",
        description: "Your export data has been copied to the clipboard.",
      });
    });
  };

  // Load files from Google Drive
  const loadDriveFiles = async () => {
    setIsLoadingFiles(true);
    try {
      const files = await googleDriveService.listFiles();
      setDriveFiles(files);
      setSaveCount(files.length);
    } catch (error) {
      console.error('Failed to load files:', error);
      toast({
        title: "Failed to load files",
        description: "Could not retrieve files from Google Drive.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingFiles(false);
    }
  };

  // Handle Google Drive authentication
  const handleGoogleDriveAuth = async () => {
    setIsAuthenticating(true);
    try {
      // Check if user is already authenticated (this will check existing tokens silently)
      const isAlreadyAuthenticated = await authenticate();
      if (isAlreadyAuthenticated) {
        updateAuthenticationState(true);
        await loadDriveFiles();
        toast({
          title: "Connected to Google Drive",
          description: "You can now manage your backups.",
        });
      } else {
        updateAuthenticationState(false);
        toast({
          title: "Authentication failed",
          description: "Could not connect to Google Drive. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Authentication failed",
        description: "Could not connect to Google Drive. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Save new backup to Drive
  const handleSaveNewBackup = async () => {
    if (saveCount >= 3) {
      toast({
        title: "Save limit reached",
        description: "You can only save 3 backups to Google Drive. Please delete old backups first.",
        variant: "destructive",
      });
      return;
    }

    const data: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        try {
          data[key] = JSON.parse(localStorage.getItem(key) || '');
        } catch {
          data[key] = localStorage.getItem(key);
        }
      }
    }
    
    const jsonString = JSON.stringify(data);
    const base64String = btoa(encodeURIComponent(jsonString));
    
    const filename = customFilename.trim() || `maplehub-backup-${new Date().toISOString().split('T')[0]}`;
    const fullFilename = filename.endsWith('.json') ? filename : `${filename}.json`;
    
    const fileId = await uploadToDrive(base64String, fullFilename);
    if (fileId) {
      setCustomFilename('');
      await loadDriveFiles(); // Refresh the file list
      toast({
        title: "Backup saved!",
        description: "Your data has been saved to Google Drive.",
      });
    }
  };

  // Load backup from Drive
  const handleLoadBackup = async (fileId: string) => {
    const data = await downloadFromDrive(fileId);
    if (data) {
      try {
        let parsedData;
        
        // Try to parse as base64 first, then as regular JSON
        try {
          const decodedString = atob(data);
          try {
            parsedData = JSON.parse(decodeURIComponent(decodedString));
          } catch {
            parsedData = JSON.parse(decodedString);
          }
        } catch {
          parsedData = JSON.parse(data);
        }
        
        Object.entries(parsedData).forEach(([key, value]) => {
          localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
        });
        
        toast({
          title: "Data loaded successfully!",
          description: "Your data has been loaded from Google Drive. Refreshing the page...",
        });
        
        setDriveDialogOpen(false);
        
        // Auto-refresh after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 1500);
        
      } catch (error) {
        toast({
          title: "Load failed",
          description: "Failed to load data from Google Drive. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  // Delete backup from Drive
  const handleDeleteBackup = async (fileId: string) => {
    try {
      await googleDriveService.deleteFile(fileId);
      await loadDriveFiles(); // Refresh the file list
      toast({
        title: "Backup deleted",
        description: "The backup has been removed from Google Drive.",
      });
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "Failed to delete the backup. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Sign out from Google Drive
  const handleSignOut = async () => {
    try {
      await googleDriveService.signOut();
      updateAuthenticationState(false);
      setDriveFiles([]);
      setSaveCount(0);
      toast({
        title: "Signed out",
        description: "You have been signed out of Google Drive.",
      });
    } catch (error) {
      toast({
        title: "Sign out failed",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Import localStorage data from pasted text
  const handleImport = async () => {
    if (!importData.trim()) {
      toast({
        title: "No data to import",
        description: "Please paste your export data first.",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    
    try {
      let data;
      
      // Try LZ-string decompression first (new format)
      try {
        const decompressedString = LZString.decompressFromEncodedURIComponent(importData);
        if (decompressedString) {
          data = JSON.parse(decompressedString);
        } else {
          throw new Error('LZ-string decompression failed');
        }
      } catch {
        // Fallback to base64 (old format)
        try {
          const decodedString = atob(importData);
          // Try to decode as URI component first (new format), then as regular string (old format)
          try {
            data = JSON.parse(decodeURIComponent(decodedString));
          } catch {
            data = JSON.parse(decodedString);
          }
        } catch {
          // If base64 fails, try regular JSON
          data = JSON.parse(importData);
        }
      }
      
      // Simulate a small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      Object.entries(data).forEach(([key, value]) => {
        localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
      });
      
      toast({
        title: "Import successful!",
        description: "Your data has been imported. Refreshing the page...",
      });
      
      setImportDialogOpen(false);
      setImportData('');
      
      // Auto-refresh after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error) {
      toast({
        title: "Import failed",
        description: "Please check the format of your data and try again.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return {
    // States
    importDialogOpen,
    importData,
    exportDialogOpen,
    exportData,
    isImporting,
    exportInfoExpanded,
    importInfoExpanded,
    driveDialogOpen,
    customFilename,
    saveCount,
    driveFiles,
    isLoadingFiles,
    isAuthenticated,
    isAuthenticating,
    
    // Actions
    setImportDialogOpen,
    setImportData,
    setExportDialogOpen,
    setExportData,
    setExportInfoExpanded,
    setImportInfoExpanded,
    handleExport,
    handleImport,
    copyExportData,
    setDriveDialogOpen,
    setCustomFilename,
    handleGoogleDriveAuth,
    handleSaveNewBackup,
    handleLoadBackup,
    handleDeleteBackup,
    handleSignOut,
    loadDriveFiles,
  };
}
