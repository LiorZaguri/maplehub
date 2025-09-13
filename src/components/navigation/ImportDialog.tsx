import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Info, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  importData: string;
  onImportDataChange: (data: string) => void;
  onImport: () => Promise<void>;
  isImporting: boolean;
}

export const ImportDialog = ({ 
  open, 
  onOpenChange, 
  importData, 
  onImportDataChange, 
  onImport, 
  isImporting 
}: ImportDialogProps) => {
  const [importInfoExpanded, setImportInfoExpanded] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              onChange={(e) => onImportDataChange(e.target.value)}
              className="min-h-[200px] scrollbar-hide"
            />
          </div>
          <div className="flex justify-between gap-2">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isImporting}
            >
              Cancel
            </Button>
            <Button onClick={onImport} disabled={isImporting}>
              {isImporting ? "Importing..." : "Import"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
