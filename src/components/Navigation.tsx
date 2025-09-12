import { useState, useMemo, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
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
  Menu,
  TrendingUp,
  Server,
  CheckSquare,
  Coffee,
  Calculator,
  Wrench,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Download,
  Upload,
  Cloud,
  CloudDownload
} from 'lucide-react';
import LZString from 'lz-string';
import { ServerStatusIndicator } from './ServerStatusIndicator';

const Navigation = () => {
  const location = useLocation();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importData, setImportData] = useState('');
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportData, setExportData] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [fileSelectorOpen, setFileSelectorOpen] = useState(false);
  const [driveDialogOpen, setDriveDialogOpen] = useState(false);
  const [customFilename, setCustomFilename] = useState('');
  const [saveCount, setSaveCount] = useState(0);
  const [driveFiles, setDriveFiles] = useState<any[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  
  const { uploadToDrive, downloadFromDrive, authenticate, isLoading: isGDriveLoading } = useGoogleDrive();

  // Check for existing authentication on component mount
  useEffect(() => {
    const checkExistingAuth = async () => {
      try {
        const isAlreadyAuthenticated = await googleDriveService.isAuthenticated();
        if (isAlreadyAuthenticated) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        // If check fails, user is not authenticated
        setIsAuthenticated(false);
      }
    };

    checkExistingAuth();
  }, []);

  const navItems = useMemo(() => [
    { name: 'Roster', path: '/', icon: Users },
    { name: 'Boss Tracker', path: '/bosses', icon: Sword },
    { name: 'Daily Tracker', path: '/tasks', icon: CheckSquare },
    { name: 'Server Status', path: '/server-status', icon: Server },
  ], []);

  const toolItems = useMemo(() => [
    { name: 'Liberation Calculator', path: '/liberation-calculator', icon: Calculator },
    { name: 'Fragment Calculator', path: '/fragment-calculator', icon: Calculator },
  ], []);

  const [toolsExpanded, setToolsExpanded] = useState(() => {
    // Load saved state from localStorage on initialization
    const saved = localStorage.getItem('navigation-tools-expanded');
    return saved ? JSON.parse(saved) : false;
  });

  // Auto-expand Tools section if a tool page is active
  const isToolActive = toolItems.some(item => location.pathname === item.path);
  useEffect(() => {
    if (isToolActive) {
      setToolsExpanded(true);
    }
  }, [isToolActive]);

  // Save tools expansion state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('navigation-tools-expanded', JSON.stringify(toolsExpanded));
  }, [toolsExpanded]);

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

  // Upload to Google Drive
  const handleUploadToDrive = async () => {
    const filename = `maplehub-backup-${new Date().toISOString().split('T')[0]}.json`;
    await uploadToDrive(exportData, filename);
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
        setIsAuthenticated(true);
        await loadDriveFiles();
        toast({
          title: "Connected to Google Drive",
          description: "You can now manage your backups.",
        });
      } else {
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
      setIsAuthenticated(false);
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

  const NavContent = useMemo(() => (
    <div className="flex flex-col h-full">
      <div className="px-4 py-2 mb-4">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            MapleHub
          </h1>
        </div>
      </div>

      <div className="flex-1 space-y-2 pb-4">
        {/* Render first 3 items (Roster, Boss Tracker, Daily Tracker) */}
        {navItems.slice(0, 3).map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className="mx-2"
              onClick={() => setIsOpen(false)}
            >
              <Button
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start space-x-2 ${
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

        {/* Tools Expandable Section */}
        <div>
          <Button
            variant="ghost"
            className="w-full justify-start space-x-2 hover:bg-card hover:text-primary mx-2"
            onClick={() => setToolsExpanded(!toolsExpanded)}
          >
            <Wrench className="h-4 w-4" />
            <span>Tools</span>
            {toolsExpanded ? (
              <ChevronUp className="h-4 w-4 ml-auto" />
            ) : (
              <ChevronDown className="h-4 w-4 ml-auto" />
            )}
          </Button>

          {toolsExpanded && (
            <div className="space-y-1 ml-2">
                {toolItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="block"
                    onClick={() => setIsOpen(false)}
                  >
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={`w-full justify-start space-x-2 ml-4 ${
                        isActive
                          ? 'btn-hero shadow-[var(--shadow-button)]'
                          : 'hover:bg-card hover:text-primary'
                      }`}
                      size="sm"
                    >
                      <Icon className="h-3 w-3" />
                      <span className="text-sm">{item.name}</span>
                    </Button>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Render remaining items (Server Status) */}
        {navItems.slice(3).map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className="mx-2"
              onClick={() => setIsOpen(false)}
            >
              <Button
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start space-x-2 ${
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

      {/* Export/Import Section */}
      <div className="px-4 py-4 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="w-full justify-start space-x-2 hover:bg-card hover:text-primary"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Export Data</DialogTitle>
                <DialogDescription>
                  Copy the compressed data below and share it with others. They can import it using the Import feature.
                </DialogDescription>
              </DialogHeader>
              <div className="mb-4 p-4 bg-muted/50 rounded-lg border">
                <h4 className="font-semibold text-base mb-3">What will be exported:</h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• <strong>Character Roster:</strong> All character info, levels, classes, and settings</li>
                  <li>• <strong>Boss Tracker:</strong> Progress, enabled bosses, party sizes, and reset timestamps</li>
                  <li>• <strong>Task Tracker:</strong> Task progress, enabled tasks, presets, and UI preferences</li>
                  <li>• <strong>Calculators:</strong> Fragment and Liberation calculator data and selections</li>
                  <li>• <strong>UI Settings:</strong> Navigation state, custom presets, and preferences</li>
                </ul>
              </div>
              <div className="grid gap-4 py-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Compressed Data Code</label>
                  <Textarea
                    value={exportData}
                    readOnly
                    className="min-h-[200px] font-mono text-xs"
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
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={handleUploadToDrive}
                      disabled={isGDriveLoading}
                    >
                      <Cloud className="h-4 w-4 mr-2" />
                      {isGDriveLoading ? "Uploading..." : "Save to Drive"}
                    </Button>
                    <Button onClick={copyExportData}>
                      <Download className="h-4 w-4 mr-2" />
                      Copy to Clipboard
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start space-x-2 hover:bg-card hover:text-primary"
              >
                <Upload className="h-4 w-4" />
                <span>Import</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Import Data</DialogTitle>
                <DialogDescription>
                  Paste your exported data below (compressed or base64 code) and click Import to restore your settings.
                </DialogDescription>
              </DialogHeader>
              <div className="mb-4 p-4 bg-muted/50 rounded-lg border">
                <h4 className="font-semibold text-base mb-3">What will be imported:</h4>
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
              <div className="grid gap-4 py-4">
                <Textarea
                  placeholder="Paste your exported data here..."
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  className="min-h-[200px]"
                />
                <div className="flex justify-between gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setImportDialogOpen(false)}
                    disabled={isImporting}
                  >
                    Cancel
                  </Button>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setFileSelectorOpen(true)}
                      disabled={isGDriveLoading}
                    >
                      <CloudDownload className="h-4 w-4 mr-2" />
                      {isGDriveLoading ? "Loading..." : "Load from Drive"}
                    </Button>
                    <Button onClick={handleImport} disabled={isImporting}>
                      {isImporting ? "Importing..." : "Import"}
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Unified Google Drive Button */}
        <Dialog open={driveDialogOpen} onOpenChange={async (open) => {
          setDriveDialogOpen(open);
          if (open) {
            // Check if user is already authenticated silently (no popup)
            try {
              const isAlreadyAuthenticated = await googleDriveService.isAuthenticated();
              if (isAlreadyAuthenticated) {
                setIsAuthenticated(true);
                await loadDriveFiles();
              }
            } catch (error) {
              // If check fails, show login prompt
              setIsAuthenticated(false);
            }
          } else {
            // Only reset authenticating state when dialog closes, keep authenticated state
            setIsAuthenticating(false);
          }
        }}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-center space-x-2"
            >
              <Cloud className="h-4 w-4" />
              <span>Google Drive</span>
            </Button>
          </DialogTrigger>
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
      </div>

      <div className="px-4 py-4 border-t border-border/50 mt-4 space-y-2">
        <a
          href="https://discord.gg/DykSm9Pd9D"
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <Button
            variant="outline"
            size="sm"
            className="w-full bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 border-indigo-200 hover:border-indigo-300 text-indigo-800 hover:text-indigo-900 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Join MapleHub Discord!
          </Button>
        </a>
        <a
          href="https://buymeacoffee.com/lzaguri10a"
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <Button
            variant="outline"
            size="sm"
            className="w-full bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border-amber-200 hover:border-amber-300 text-amber-800 hover:text-amber-900 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <Coffee className="h-4 w-4 mr-2" />
            Buy me a coffee
          </Button>
        </a>
        </div>
    </div>
  ), [navItems, location.pathname, setIsOpen, toolsExpanded, handleExport, handleImport, importDialogOpen, importData, exportDialogOpen, exportData, copyExportData, isImporting, handleUploadToDrive, handleDownloadFromDrive, isGDriveLoading, driveDialogOpen, customFilename, saveCount, isAuthenticated, isAuthenticating, handleGoogleDriveAuth, loadDriveFiles, handleSaveNewBackup, handleLoadBackup, handleDeleteBackup, handleSignOut]);

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden xl:block w-64 min-h-screen card-gaming fixed left-0 top-0 z-40">
        {NavContent}
      </nav>

      {/* Mobile Navigation */}
      <div className="xl:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border h-20">
        <div className="flex items-center justify-between p-3 sm:p-4 h-full">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <h1 className="text-base sm:text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              MapleHub
            </h1>
          </div>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="p-2">
                <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 bg-card">
              <div className="flex flex-col h-full">
                <div className="px-4 py-2 mb-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-6 w-6 text-primary" />
                    <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      MapleHub
                    </h1>
                  </div>
                </div>
                <div className="sr-only">
                  <h2>Navigation Menu</h2>
                </div>

                <div className="flex-1 space-y-2 pb-4">
                  {/* Render first 3 items (Roster, Boss Tracker, Daily Tracker) */}
                  {navItems.slice(0, 3).map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;

                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className="mx-2"
                        onClick={() => setIsOpen(false)}
                      >
                        <Button
                          variant={isActive ? "default" : "ghost"}
                          className={`w-full justify-start space-x-2 ${
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

                  {/* Mobile Tools Expandable Section */}
                  <div>
                    <Button
                      variant="ghost"
                      className="w-full justify-start space-x-2 hover:bg-card hover:text-primary mx-2"
                      onClick={() => setToolsExpanded(!toolsExpanded)}
                    >
                      <Wrench className="h-4 w-4" />
                      <span>Tools</span>
                      {toolsExpanded ? (
                        <ChevronUp className="h-4 w-4 ml-auto" />
                      ) : (
                        <ChevronDown className="h-4 w-4 ml-auto" />
                      )}
                    </Button>

                    {toolsExpanded && (
                      <div className="space-y-1 ml-2">
                          {toolItems.map((item) => {
                          const Icon = item.icon;
                          const isActive = location.pathname === item.path;

                          return (
                            <Link
                              key={item.path}
                              to={item.path}
                              className="block"
                              onClick={() => setIsOpen(false)}
                            >
                              <Button
                                variant={isActive ? "default" : "ghost"}
                                className={`w-full justify-start space-x-2 ml-4 ${
                                  isActive
                                    ? 'btn-hero shadow-[var(--shadow-button)]'
                                    : 'hover:bg-card hover:text-primary'
                                }`}
                                size="sm"
                              >
                                <Icon className="h-3 w-3" />
                                <span className="text-sm">{item.name}</span>
                              </Button>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Render remaining items (Server Status) */}
                  {navItems.slice(3).map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;

                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className="mx-2"
                        onClick={() => setIsOpen(false)}
                      >
                        <Button
                          variant={isActive ? "default" : "ghost"}
                          className={`w-full justify-start space-x-2 ${
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

                {/* Mobile Export/Import Section */}
                <div className="px-4 py-4 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleExport}
                          className="w-full justify-start space-x-2 hover:bg-card hover:text-primary"
                        >
                          <Download className="h-4 w-4" />
                          <span>Export</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                          <DialogTitle>Export Data</DialogTitle>
                          <DialogDescription>
                            Copy the compressed data below and share it with others. They can import it using the Import feature.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="mb-4 p-4 bg-muted/50 rounded-lg border">
                          <h4 className="font-semibold text-base mb-3">What will be exported:</h4>
                          <ul className="text-sm text-muted-foreground space-y-2">
                            <li>• <strong>Character Roster:</strong> All character info, levels, classes, and settings</li>
                            <li>• <strong>Boss Tracker:</strong> Progress, enabled bosses, party sizes, and reset timestamps</li>
                            <li>• <strong>Task Tracker:</strong> Task progress, enabled tasks, presets, and UI preferences</li>
                            <li>• <strong>Calculators:</strong> Fragment and Liberation calculator data and selections</li>
                            <li>• <strong>UI Settings:</strong> Navigation state, custom presets, and preferences</li>
                          </ul>
                        </div>
                        <div className="grid gap-4 py-4">
                          <div>
                            <label className="text-sm font-medium mb-2 block">Compressed Data Code</label>
                            <Textarea
                              value={exportData}
                              readOnly
                              className="min-h-[200px] font-mono text-xs"
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
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                onClick={handleUploadToDrive}
                                disabled={isGDriveLoading}
                              >
                                <Cloud className="h-4 w-4 mr-2" />
                                {isGDriveLoading ? "Uploading..." : "Save to Drive"}
                              </Button>
                              <Button onClick={copyExportData}>
                                <Download className="h-4 w-4 mr-2" />
                                Copy to Clipboard
                              </Button>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start space-x-2 hover:bg-card hover:text-primary"
                        >
                          <Upload className="h-4 w-4" />
                          <span>Import</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Import Data</DialogTitle>
                          <DialogDescription>
                            Paste your exported data below (compressed or base64 code) and click Import to restore your settings.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="mb-4 p-4 bg-muted/50 rounded-lg border">
                          <h4 className="font-semibold text-base mb-3">What will be imported:</h4>
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
                        <div className="grid gap-4 py-4">
                          <Textarea
                            placeholder="Paste your exported data here..."
                            value={importData}
                            onChange={(e) => setImportData(e.target.value)}
                            className="min-h-[200px]"
                          />
                          <div className="flex justify-between gap-2">
                            <Button 
                              variant="outline" 
                              onClick={() => setImportDialogOpen(false)}
                              disabled={isImporting}
                            >
                              Cancel
                            </Button>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                onClick={() => setFileSelectorOpen(true)}
                                disabled={isGDriveLoading}
                              >
                                <CloudDownload className="h-4 w-4 mr-2" />
                                {isGDriveLoading ? "Loading..." : "Load from Drive"}
                              </Button>
                              <Button onClick={handleImport} disabled={isImporting}>
                                {isImporting ? "Importing..." : "Import"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                {/* Mobile Unified Google Drive Button */}
                <Dialog open={driveDialogOpen} onOpenChange={async (open) => {
                  setDriveDialogOpen(open);
                  if (open) {
                    // Check if user is already authenticated silently (no popup)
                    try {
                      const isAlreadyAuthenticated = await googleDriveService.isAuthenticated();
                      if (isAlreadyAuthenticated) {
                        setIsAuthenticated(true);
                        await loadDriveFiles();
                      }
                    } catch (error) {
                      // If check fails, show login prompt
                      setIsAuthenticated(false);
                    }
                  } else {
                    // Only reset authenticating state when dialog closes, keep authenticated state
                    setIsAuthenticating(false);
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-center space-x-2"
                    >
                      <Cloud className="h-4 w-4" />
                      <span>Google Drive</span>
                    </Button>
                  </DialogTrigger>
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

              <div className="px-4 py-4 border-t border-border/50 mt-4 space-y-2">
                  <a
                    href="https://discord.gg/DykSm9Pd9D"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 border-indigo-200 hover:border-indigo-300 text-indigo-800 hover:text-indigo-900 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Join MapleHub Discord!
                    </Button>
                  </a>
                  <a
                    href="https://buymeacoffee.com/lzaguri10a"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border-amber-200 hover:border-amber-300 text-amber-800 hover:text-amber-900 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <Coffee className="h-4 w-4 mr-2" />
                      Buy me a coffee
                    </Button>
                  </a>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

    </>
  );
};

export default Navigation;
