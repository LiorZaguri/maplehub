import { useDataManagement } from '@/hooks/useDataManagement';
import { TopNavbarHeader } from './TopNavbarHeader';
import { TopNavbarNavigation } from './TopNavbarNavigation';
import { TopNavbarActions } from './TopNavbarActions';
import { ExportDialog } from './ExportDialog';
import { ImportDialog } from './ImportDialog';
import { GoogleDriveDialog } from './GoogleDriveDialog';

export const TopNavbar = () => {
  const dataManagement = useDataManagement();

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="grid grid-cols-3 items-center px-4 py-3 h-16">
          {/* Logo and Brand - Left Side */}
          <TopNavbarHeader />

          {/* Main Navigation Items - Center (hidden on mobile) */}
          <TopNavbarNavigation />

          {/* Right Side Actions */}
          <TopNavbarActions dataManagement={dataManagement} />
        </div>
      </nav>

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
