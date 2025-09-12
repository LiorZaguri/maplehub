import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useGoogleDrive } from '@/hooks/useGoogleDrive';
import { Calendar, Download } from 'lucide-react';

interface GoogleDriveFileSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFileSelect: (fileId: string) => void;
}

export const GoogleDriveFileSelector = ({ open, onOpenChange, onFileSelect }: GoogleDriveFileSelectorProps) => {
  const [files, setFiles] = useState<any[]>([]);
  const { listFiles, isLoading } = useGoogleDrive();

  useEffect(() => {
    if (open) {
      loadFiles();
    }
  }, [open]);

  const loadFiles = async () => {
    const fileList = await listFiles();
    setFiles(fileList);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Select Backup from Google Drive</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-4">Loading files...</div>
          ) : files.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No MapleHub backups found in Google Drive.
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{file.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(file.createdTime)}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      onFileSelect(file.id);
                      onOpenChange(false);
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
