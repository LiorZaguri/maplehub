import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Download, Upload, Cloud, Database } from 'lucide-react';

interface DataDropdownProps {
  onExport: () => void;
  onImport: () => void;
  onGoogleDrive: () => void;
  className?: string;
  size?: 'default' | 'sm';
  showLabel?: boolean;
}

export const DataDropdown = ({ 
  onExport, 
  onImport, 
  onGoogleDrive, 
  className = '',
  size = 'sm',
  showLabel = true
}: DataDropdownProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size={size}
          className={`justify-start space-x-2 ${className}`}
        >
          <Download className="h-4 w-4" />
          {showLabel && <span>Data</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48" sideOffset={5} alignOffset={0}>
        <DropdownMenuItem asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={onExport}
            className="w-full justify-start space-x-2 hover:bg-card hover:text-primary"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={onImport}
            className="w-full justify-start space-x-2 hover:bg-card hover:text-primary"
          >
            <Upload className="h-4 w-4" />
            <span>Import</span>
          </Button>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={onGoogleDrive}
            className="w-full justify-start space-x-2 hover:bg-card hover:text-primary"
          >
            <Cloud className="h-4 w-4" />
            <span>Google Drive</span>
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
