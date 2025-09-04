import { useQuery } from '@tanstack/react-query';
import { ServerStatusResponse } from '@/types/server';

const fetchServerStatus = async (): Promise<ServerStatusResponse> => {
  const response = await fetch(`${import.meta.env.VITE_SERVER_STATUS_SUPABASE_URL}/functions/v1/server-status`);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export const useServerStatus = () => {
  const {
    data,
    isLoading: loading,
    error,
    refetch,
    dataUpdatedAt
  } = useQuery({
    queryKey: ['server-status'],
    queryFn: fetchServerStatus,
    refetchInterval: 60000, // Auto-refresh every 60 seconds
    staleTime: 30000, // Consider data fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
  });

  const lastUpdate = dataUpdatedAt ? new Date(dataUpdatedAt) : null;

  return {
    data,
    loading,
    error: error?.message || null,
    lastUpdate,
    refetch
  };
};
