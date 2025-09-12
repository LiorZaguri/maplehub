import { useState, useCallback } from 'react';
import { googleDriveService } from '@/services/googleDriveService';
import { useToast } from '@/hooks/use-toast';

export const useGoogleDrive = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const uploadToDrive = useCallback(async (data: string, filename: string) => {
    setIsLoading(true);
    try {
      const fileId = await googleDriveService.uploadFile(data, filename);
      if (fileId) {
        toast({
          title: "Upload successful!",
          description: "Your data has been saved to Google Drive.",
        });
        return fileId;
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload to Google Drive. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const downloadFromDrive = useCallback(async (fileId: string) => {
    setIsLoading(true);
    try {
      const data = await googleDriveService.downloadFile(fileId);
      if (data) {
        toast({
          title: "Download successful!",
          description: "Data downloaded from Google Drive.",
        });
        return data;
      } else {
        throw new Error('Download failed');
      }
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download from Google Drive. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const authenticate = useCallback(async () => {
    setIsLoading(true);
    try {
      const success = await googleDriveService.authenticate();
      if (success) {
        toast({
          title: "Authentication successful!",
          description: "You're now connected to Google Drive.",
        });
        return true;
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error) {
      toast({
        title: "Authentication failed",
        description: "Failed to connect to Google Drive. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const listFiles = useCallback(async () => {
    setIsLoading(true);
    try {
      const files = await googleDriveService.listFiles();
      return files;
    } catch (error) {
      toast({
        title: "Failed to list files",
        description: "Could not retrieve files from Google Drive.",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    isLoading,
    uploadToDrive,
    downloadFromDrive,
    authenticate,
    listFiles,
    isSignedIn: googleDriveService.isSignedIn(),
  };
};
