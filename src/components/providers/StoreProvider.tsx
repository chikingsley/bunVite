import { Store, createStore } from 'tinybase';
import { createContext, useContext, useEffect, useState } from 'react';

// Create context for the store
const StoreContext = createContext<Store | null>(null);

// Hook to use the store
export function useAppStore() {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useAppStore must be used within StoreProvider');
  return store;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [store] = useState(() => {
    const store = createStore();
    // Initialize tables
    store.setTables({
      users: {},
      sessions: {},
      messages: {}
    });
    return store;
  });

  useEffect(() => {
    // Log when store is ready
    console.log('Store initialized:', {
      users: store.getTable('users'),
      sessions: store.getTable('sessions'),
      messages: store.getTable('messages')
    });

    // Add listener for changes
    const listenerId = store.addTablesListener(() => {
      console.log('Store updated:', {
        users: store.getTable('users'),
        sessions: store.getTable('sessions'),
        messages: store.getTable('messages')
      });
    });

    return () => {
      store.delListener(listenerId);
    };
  }, [store]);

  return (
    <StoreContext.Provider value={store}>
      {children}
    </StoreContext.Provider>
  );
} 