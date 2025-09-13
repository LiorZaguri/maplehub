import { Button } from '@/components/ui/button';
import { Coffee } from 'lucide-react';
import { DiscordIcon } from '@/components/icons/DiscordIcon';
import { DataDropdown } from './DataDropdown';

interface NavigationFooterProps {
  className?: string;
  dataManagement?: {
    onExport: () => void;
    onImport: () => void;
    onGoogleDrive: () => void;
  };
}

export const NavigationFooter = ({ className = '', dataManagement }: NavigationFooterProps) => {
  return (
    <div className={`px-4 py-4 border-t border-border/50 mt-4 space-y-2 ${className}`}>
      {/* Data Management Button */}
      {dataManagement && (
        <div className="block">
          <DataDropdown
            onExport={dataManagement.onExport}
            onImport={dataManagement.onImport}
            onGoogleDrive={dataManagement.onGoogleDrive}
            className="w-full"
          />
        </div>
      )}
      
      <a
        href="https://discord.gg/DykSm9Pd9D"
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start space-x-2"
        >
          <DiscordIcon className="h-4 w-4" />
          <span>Join MapleHub Discord!</span>
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
          className="w-full justify-start space-x-2"
        >
          <Coffee className="h-4 w-4" />
          <span>Buy me a coffee</span>
        </Button>
      </a>
    </div>
  );
};
