import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { ServerStatusIndicator } from './ServerStatusIndicator';
import { LayoutToggle } from './LayoutToggle';
import { useDataManagement } from '@/hooks/useDataManagement';
import { mainNavItems } from '@/data/navigation';
import { NavigationHeader } from './navigation/NavigationHeader';
import { NavigationItem } from './navigation/NavigationItem';
import { ToolsSection } from './navigation/ToolsSection';
import { NavigationFooter } from './navigation/NavigationFooter';
import { ExportDialog } from './navigation/ExportDialog';
import { ImportDialog } from './navigation/ImportDialog';
import { GoogleDriveDialog } from './navigation/GoogleDriveDialog';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dataManagement = useDataManagement();

  const NavContent = (
    <div className="flex flex-col h-full">
      <NavigationHeader />

      <div className="flex-1 space-y-2 pb-4">
        {/* Render first 3 items (Roster, Boss Tracker, Daily Tracker) */}
        {mainNavItems.slice(0, 3).map((item) => (
          <NavigationItem
              key={item.path}
            item={item}
            onClick={() => setIsOpen(false)}
              className="mx-2"
          />
        ))}

        {/* Tools Expandable Section */}
        <ToolsSection onItemClick={() => setIsOpen(false)} />

        {/* Render remaining items (Server Status) */}
        {mainNavItems.slice(3).map((item) => (
          <NavigationItem
              key={item.path}
            item={item}
            onClick={() => setIsOpen(false)}
              className="mx-2"
          />
        ))}
      </div>

      <NavigationFooter 
        dataManagement={{
          onExport: dataManagement.handleExport,
          onImport: () => dataManagement.setImportDialogOpen(true),
          onGoogleDrive: () => dataManagement.setDriveDialogOpen(true),
        }}
      />

        {/* Server Status Indicator - Integrated into sidebar flow */}
        <div className="hidden xl:block mt-auto">
          <ServerStatusIndicator />
        </div>
    </div>
  );

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden xl:block w-64 min-h-screen card-gaming fixed left-0 top-0 z-40">
        {NavContent}
      </nav>

      {/* Mobile Navigation */}
      <div className="xl:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border h-20">
        <div className="flex items-center justify-between p-3 sm:p-4 h-full">
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <img 
              src="./logo_leaf.png" 
              alt="MapleHub Logo" 
              className="h-5 w-5 sm:h-6 sm:w-6 object-contain"
            />
            <h1 className="logo-text">
              MapleHub
            </h1>
          </Link>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="p-2">
                <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 bg-card">
              {NavContent}
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Layout Toggle - Floating in top right, only for sidebar layout */}
      <div className="fixed top-4 right-4 z-50 hidden md:block">
        <LayoutToggle />
      </div>

      {/* Data Management Dialogs */}
      <ExportDialog
        open={dataManagement.exportDialogOpen}
        onOpenChange={dataManagement.setExportDialogOpen}
        exportData={dataManagement.exportData}
        onCopy={dataManagement.copyExportData}
      />
      
      <ImportDialog
        open={dataManagement.importDialogOpen}
        onOpenChange={dataManagement.setImportDialogOpen}
        importData={dataManagement.importData}
        onImportDataChange={dataManagement.setImportData}
        onImport={dataManagement.handleImport}
        isImporting={dataManagement.isImporting}
      />
      
      <GoogleDriveDialog
        open={dataManagement.driveDialogOpen}
        onOpenChange={dataManagement.setDriveDialogOpen}
        isAuthenticated={dataManagement.isAuthenticated}
        isAuthenticating={dataManagement.isAuthenticating}
        customFilename={dataManagement.customFilename}
        onCustomFilenameChange={dataManagement.setCustomFilename}
        saveCount={dataManagement.saveCount}
        driveFiles={dataManagement.driveFiles}
        isLoadingFiles={dataManagement.isLoadingFiles}
        isGDriveLoading={false}
        onGoogleDriveAuth={dataManagement.handleGoogleDriveAuth}
        onSaveNewBackup={dataManagement.handleSaveNewBackup}
        onLoadBackup={dataManagement.handleLoadBackup}
        onDeleteBackup={dataManagement.handleDeleteBackup}
        onSignOut={dataManagement.handleSignOut}
      />

    </>
  );
};

export default Navigation;
