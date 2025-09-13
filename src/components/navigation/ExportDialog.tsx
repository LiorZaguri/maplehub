import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Download, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exportData: string;
  onCopy: () => void;
}

export const ExportDialog = ({ open, onOpenChange, exportData, onCopy }: ExportDialogProps) => {
  const [exportInfoExpanded, setExportInfoExpanded] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button onClick={onCopy}>
              <Download className="h-4 w-4 mr-2" />
              Copy to Clipboard
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
