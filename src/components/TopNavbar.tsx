import { useState, useMemo, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useGoogleDrive } from '@/hooks/useGoogleDrive';
import { googleDriveService } from '@/services/googleDriveService';
import {
  Users,
  Sword,
  Server,
  CheckSquare,
  Calculator,
  Wrench,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Download,
  Upload,
  Cloud,
  Info,
  Bell,
} from 'lucide-react';
import LZString from 'lz-string';
import { useServerStatus } from '@/hooks/useServerStatus';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { LayoutToggle } from './LayoutToggle';

const TopNavbar = () => {
  const location = useLocation();
  const { toast } = useToast();
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importData, setImportData] = useState('');
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportData, setExportData] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [driveDialogOpen, setDriveDialogOpen] = useState(false);
  const [customFilename, setCustomFilename] = useState('');
  const [saveCount, setSaveCount] = useState(0);
  const [driveFiles, setDriveFiles] = useState<any[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [exportInfoExpanded, setExportInfoExpanded] = useState(false);
  const [importInfoExpanded, setImportInfoExpanded] = useState(false);
  const [canUseNotifications, setCanUseNotifications] = useState(false);
  const [notificationsAllowed, setNotificationsAllowed] = useState(false);
  
  const { uploadToDrive, downloadFromDrive, authenticate, isLoading: isGDriveLoading } = useGoogleDrive();
  const { data: serverStatus, loading: serverLoading, lastUpdate } = useServerStatus();

  // Check notification support and permission status
  useEffect(() => {
    if (typeof window === "undefined") return;
    const supported = "Notification" in window;
    setCanUseNotifications(supported);
    if (supported) {
      setNotificationsAllowed(Notification.permission === "granted");
    }
  }, []);

  const handleEnableNotifications = () => {
    if (!canUseNotifications) return;
    
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        setNotificationsAllowed(true);
        toast({
          title: "Notifications enabled",
          description: "You'll be notified when MapleStory servers come back online.",
        });
      } else {
        toast({
          title: "Notifications blocked",
          description: "Please enable notifications in your browser settings.",
          variant: "destructive",
        });
      }
    });
  };

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

  const navItems = useMemo(() => [
    { name: 'Roster', path: '/', icon: Users },
    { name: 'Boss Tracker', path: '/bosses', icon: Sword },
    { name: 'Daily Tracker', path: '/tasks', icon: CheckSquare },
    { name: 'Tools', path: null, icon: Wrench, isDropdown: true },
    { name: 'Server Status', path: '/server-status', icon: Server },
  ], []);

  const toolItems = useMemo(() => [
    { name: 'Liberation Calculator', path: '/liberation-calculator', icon: Calculator },
    { name: 'Fragment Calculator', path: '/fragment-calculator', icon: Calculator },
  ], []);

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

  // Download from Google Drive
  const handleDownloadFromDrive = async (fileId: string) => {
    const data = await downloadFromDrive(fileId);
    if (data) {
      setImportData(data);
      setImportDialogOpen(true);
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

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            <img 
              src="./logo_leaf.png" 
              alt="MapleHub Logo" 
              className="h-6 w-6 sm:h-8 sm:w-8 object-contain logo-themed"
            />
            <div>
              <h1 className="logo-text text-sm sm:text-lg">
                MapleHub
              </h1>
            </div>
          </div>

          {/* Main Navigation Items */}
          <div className="hidden md:flex items-center space-x-1 flex-1 justify-center">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              // Handle Tools dropdown
              if (item.isDropdown) {
                return (
                  <DropdownMenu key={item.name}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="space-x-2 hover:bg-card hover:text-primary"
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.name}</span>
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48" sideOffset={5} alignOffset={0}>
                      {toolItems.map((toolItem) => {
                        const ToolIcon = toolItem.icon;
                        const isToolActive = location.pathname === toolItem.path;

                        return (
                          <DropdownMenuItem key={toolItem.path} asChild>
                            <Link
                              to={toolItem.path}
                              className={`flex items-center space-x-2 ${
                                isToolActive ? 'bg-accent text-accent-foreground' : ''
                              }`}
                            >
                              <ToolIcon className="h-4 w-4" />
                              <span>{toolItem.name}</span>
                            </Link>
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              }

              // Handle regular navigation items
              return (
                <Link
                  key={item.path}
                  to={item.path}
                >
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={`space-x-2 ${
                      isActive
                        ? 'btn-hero shadow-[var(--shadow-button)]'
                        : 'hover:bg-card hover:text-primary'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Button>
                </Link>
              );
            })}

          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            {/* Data Management Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden xl:inline">Data</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48" sideOffset={5} alignOffset={0}>
                <DropdownMenuItem asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleExport}
                    className="w-full justify-start space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Export</span>
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setImportDialogOpen(true)}
                    className="w-full justify-start space-x-2"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Import</span>
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDriveDialogOpen(true)}
                    className="w-full justify-start space-x-2"
                  >
                    <Cloud className="h-4 w-4" />
                    <span>Google Drive</span>
                  </Button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Export Dialog */}
            <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
              <DialogTrigger asChild>
                <div className="hidden">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExport}
                    className="space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span className="hidden xl:inline">Export</span>
                  </Button>
                </div>
              </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Export Data</DialogTitle>
                    <DialogDescription>
                      Copy the compressed data below and share it with others. They can import it using the Import feature.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="mb-2 border rounded-lg">
                    <button
                      onClick={() => setExportInfoExpanded(!exportInfoExpanded)}
                      className="w-full p-4 text-left hover:bg-muted/50 transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <Info className="h-4 w-4 text-primary" />
                        <h4 className="font-semibold text-base">What will be exported</h4>
                      </div>
                      {exportInfoExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                    {exportInfoExpanded && (
                      <div className="px-4 pb-4">
                        <ul className="text-sm text-muted-foreground space-y-2">
                          <li>• <strong>Character Roster:</strong> All character info, levels, classes, and settings</li>
                          <li>• <strong>Boss Tracker:</strong> Progress, enabled bosses, party sizes, and reset timestamps</li>
                          <li>• <strong>Task Tracker:</strong> Task progress, enabled tasks, presets, and UI preferences</li>
                          <li>• <strong>Calculators:</strong> Fragment and Liberation calculator data and selections</li>
                          <li>• <strong>UI Settings:</strong> Navigation state, custom presets, and preferences</li>
                        </ul>
                      </div>
                    )}
                  </div>
                  <div className="grid gap-4 py-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Compressed Data Code</label>
                      <Textarea
                        value={exportData}
                        readOnly
                        className="min-h-[200px] font-mono text-xs scrollbar-hide"
                        placeholder="Generating export data..."
                      />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Data size: ~{Math.round(exportData.length / 1024)}KB • Includes: all localStorage data
                    </div>
                    <div className="flex justify-between gap-2">
                      <Button variant="outline" onClick={() => setExportDialogOpen(false)}>
                        Close
                      </Button>
                      <Button onClick={copyExportData}>
                        <Download className="h-4 w-4 mr-2" />
                        Copy to Clipboard
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Import Data</DialogTitle>
                    <DialogDescription>
                      Paste your exported data below (compressed or base64 code) and click Import to restore your settings.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="mb-2 border rounded-lg">
                    <button
                      onClick={() => setImportInfoExpanded(!importInfoExpanded)}
                      className="w-full p-4 text-left hover:bg-muted/50 transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <Info className="h-4 w-4 text-primary" />
                        <h4 className="font-semibold text-base">What will be imported</h4>
                      </div>
                      {importInfoExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                    {importInfoExpanded && (
                      <div className="px-4 pb-4">
                        <ul className="text-sm text-muted-foreground space-y-2">
                          <li>• <strong>Character Roster:</strong> All character info, levels, classes, and settings</li>
                          <li>• <strong>Boss Tracker:</strong> Progress, enabled bosses, party sizes, and reset timestamps</li>
                          <li>• <strong>Task Tracker:</strong> Task progress, enabled tasks, presets, and UI preferences</li>
                          <li>• <strong>Calculators:</strong> Fragment and Liberation calculator data and selections</li>
                          <li>• <strong>UI Settings:</strong> Navigation state, custom presets, and preferences</li>
                        </ul>
                        <p className="text-sm text-amber-600 mt-3 font-medium">
                          ⚠️ This will replace all your current data. The page will refresh after import.
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="grid gap-4 py-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Import Data</label>
                      <Textarea
                        placeholder="Paste your exported data here..."
                        value={importData}
                        onChange={(e) => setImportData(e.target.value)}
                        className="min-h-[200px] scrollbar-hide"
                      />
                    </div>
                    <div className="flex justify-between gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setImportDialogOpen(false)}
                        disabled={isImporting}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleImport} disabled={isImporting}>
                        {isImporting ? "Importing..." : "Import"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

            {/* Server Status - Compact */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden lg:flex items-center space-x-2 px-3 py-1 rounded-md bg-muted/50 hover:bg-muted/70"
                >
                  {serverLoading ? (
                    <div className="w-3 h-3 bg-muted animate-pulse rounded-full"></div>
                  ) : serverStatus?.maintenance ? (
                    <AlertTriangle className="w-3 h-3 text-orange-500" />
                  ) : (
                    <CheckCircle className="w-3 h-3 text-green-500" />
                  )}
                  <span className="text-xs text-muted-foreground">
                    {serverLoading ? 'Loading...' : serverStatus?.maintenance ? 'Maintenance' : 'Online'}
                  </span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64" sideOffset={5} alignOffset={0}>
                <div className="p-3 space-y-3">
                  {/* Status Display */}
                  <div className="flex items-center space-x-3">
                    {serverLoading ? (
                      <div className="w-4 h-4 bg-muted animate-pulse rounded-full"></div>
                    ) : serverStatus?.maintenance ? (
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                    <div>
                      <p className="font-medium text-sm">
                        {serverLoading ? 'Loading...' : serverStatus?.maintenance ? 'Maintenance' : 'Online'}
                      </p>
                      {lastUpdate && (
                        <p className="text-xs text-muted-foreground">
                          Last checked: {lastUpdate.toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Notification Settings */}
                  <div className="border-t pt-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Bell className="w-4 h-4" />
                        <span className="text-sm">Notifications</span>
                      </div>
                      {canUseNotifications && !notificationsAllowed && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleEnableNotifications}
                          className="h-7 px-2 text-xs"
                        >
                          Enable
                        </Button>
                      )}
                      {canUseNotifications && notificationsAllowed && (
                        <span className="text-xs text-green-600">Enabled</span>
                      )}
                      {!canUseNotifications && (
                        <span className="text-xs text-muted-foreground">Not supported</span>
                      )}
                    </div>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Layout Toggle */}
            <LayoutToggle />

            {/* Google Drive Dialog */}
            <Dialog open={driveDialogOpen} onOpenChange={async (open) => {
              setDriveDialogOpen(open);
              if (open) {
                // Check if user is already authenticated silently (no popup)
                try {
                  const isAlreadyAuthenticated = await googleDriveService.isAuthenticated();
                  updateAuthenticationState(isAlreadyAuthenticated);
                  if (isAlreadyAuthenticated) {
                    await loadDriveFiles();
                  }
                } catch (error) {
                  // If check fails, show login prompt
                  updateAuthenticationState(false);
                }
              } else {
                // Only reset authenticating state when dialog closes, keep authenticated state
                setIsAuthenticating(false);
              }
            }}>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Google Drive Backups</DialogTitle>
                  <DialogDescription>
                    {isAuthenticated 
                      ? "Manage your MapleHub data backups in Google Drive. You can save up to 3 backups."
                      : "Connect to Google Drive to save and load your MapleHub data backups."
                    }
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {!isAuthenticated ? (
                    /* Login Prompt */
                    <div className="text-center py-8 space-y-4">
                      <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                        <Cloud className="h-8 w-8 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium">Connect to Google Drive</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Sign in to Google Drive to save and load your MapleHub backups
                        </p>
                      </div>
                      <Button 
                        onClick={handleGoogleDriveAuth}
                        disabled={isAuthenticating}
                        className="w-full"
                      >
                        {isAuthenticating ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Connecting...
                          </>
                        ) : (
                          <>
                            <Cloud className="h-4 w-4 mr-2" />
                            Sign in with Google Drive
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    /* Backup Management Interface */
                    <>
                      {/* Save New Backup Section */}
                      <div className="border rounded-lg p-4 space-y-3">
                        <h3 className="font-medium text-sm">Save New Backup</h3>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={customFilename}
                            onChange={(e) => setCustomFilename(e.target.value)}
                            placeholder="my-backup (optional)"
                            className="flex-1 px-3 py-2 border border-input rounded-md bg-background text-sm"
                          />
                          <Button 
                            onClick={handleSaveNewBackup} 
                            disabled={isGDriveLoading || saveCount >= 3}
                            size="sm"
                          >
                            {isGDriveLoading ? "Saving..." : "Save"}
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Saves used: {saveCount}/3
                        </p>
                      </div>

                      {/* Existing Backups Section */}
                      <div className="border rounded-lg p-4 space-y-3">
                        <h3 className="font-medium text-sm">Existing Backups</h3>
                        {isLoadingFiles ? (
                          <div className="text-center py-4 text-muted-foreground">Loading backups...</div>
                        ) : driveFiles.length === 0 ? (
                          <div className="text-center py-4 text-muted-foreground">No backups found</div>
                        ) : (
                          <div className="space-y-2">
                            {driveFiles.map((file) => (
                              <div key={file.id} className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
                                <div className="flex-1">
                                  <p className="font-medium text-sm">{file.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(file.createdTime).toLocaleDateString()} at {new Date(file.createdTime).toLocaleTimeString()}
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleLoadBackup(file.id)}
                                    disabled={isGDriveLoading}
                                  >
                                    Load
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDeleteBackup(file.id)}
                                    disabled={isGDriveLoading}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                  
                  {/* Sign Out Button - Only show when authenticated */}
                  {isAuthenticated && (
                    <div className="pt-4 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSignOut}
                        className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Sign Out of Google Drive
                      </Button>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            {/* Mobile Menu Button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <span className="sr-only">Open menu</span>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;

                  return (
                    <DropdownMenuItem key={item.path} asChild>
                      <Link
                        to={item.path}
                        className={`flex items-center space-x-2 ${
                          isActive ? 'bg-accent text-accent-foreground' : ''
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
                <DropdownMenuItem asChild>
                  <div className="flex items-center space-x-2">
                    <Wrench className="h-4 w-4" />
                    <span>Tools</span>
                    <ChevronDown className="h-3 w-3 ml-auto" />
                  </div>
                </DropdownMenuItem>
                {toolItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;

                  return (
                    <DropdownMenuItem key={item.path} asChild>
                      <Link
                        to={item.path}
                        className={`flex items-center space-x-2 ml-4 ${
                          isActive ? 'bg-accent text-accent-foreground' : ''
                        }`}
                      >
                        <Icon className="h-3 w-3" />
                        <span className="text-sm">{item.name}</span>
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
                <DropdownMenuItem asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExport}
                    className="w-full justify-start space-x-2 mt-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Export</span>
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setImportDialogOpen(true)}
                    className="w-full justify-start space-x-2"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Import</span>
                  </Button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>


    </>
  );
};

export default TopNavbar;
