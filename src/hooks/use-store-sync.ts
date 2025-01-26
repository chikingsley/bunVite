import { useEffect, useState } from 'react';
import { store } from '@/utils/store-config';

export type SyncStatus = {
  isLoading: boolean;
  lastSynced: Date | null;
};

export function useStoreSync() {
  const [status, setStatus] = useState<SyncStatus>({
    isLoading: true,
    lastSynced: null,
  });

  useEffect(() => {
    // Listen for store changes
    const listenerId = store.addTablesListener(() => {
      setStatus(prev => ({
        ...prev,
        isLoading: false,
        lastSynced: new Date(),
      }));
    });

    return () => {
      store.delListener(listenerId);
    };
  }, []);

  return status;
} 