import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Cloud } from 'lucide-react';

interface GoogleDriveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  customFilename: string;
  onCustomFilenameChange: (filename: string) => void;
  saveCount: number;
  driveFiles: any[];
  isLoadingFiles: boolean;
  isGDriveLoading: boolean;
  onGoogleDriveAuth: () => Promise<void>;
  onSaveNewBackup: () => Promise<void>;
  onLoadBackup: (fileId: string) => Promise<void>;
  onDeleteBackup: (fileId: string) => Promise<void>;
  onSignOut: () => Promise<void>;
}

export const GoogleDriveDialog = ({
  open,
  onOpenChange,
  isAuthenticated,
  isAuthenticating,
  customFilename,
  onCustomFilenameChange,
  saveCount,
  driveFiles,
  isLoadingFiles,
  isGDriveLoading,
  onGoogleDriveAuth,
  onSaveNewBackup,
  onLoadBackup,
  onDeleteBackup,
  onSignOut,
}: GoogleDriveDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                onClick={onGoogleDriveAuth}
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
                    onChange={(e) => onCustomFilenameChange(e.target.value)}
                    placeholder="my-backup (optional)"
                    className="flex-1 px-3 py-2 border border-input rounded-md bg-background text-sm"
                  />
                  <Button 
                    onClick={onSaveNewBackup} 
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
                            onClick={() => onLoadBackup(file.id)}
                            disabled={isGDriveLoading}
                          >
                            Load
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onDeleteBackup(file.id)}
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
                onClick={onSignOut}
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Sign Out of Google Drive
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
