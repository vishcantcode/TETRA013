import React, { createContext, useContext, useState, useEffect } from 'react';

interface OfflineContextType {
  isOnline: boolean;
  pendingSyncCount: number;
  toggleSimulatedOffline: () => void;
  triggerSync: () => void;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export const OfflineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const toggleSimulatedOffline = () => {
    setIsOnline(prev => {
      if (prev) setPendingSyncCount(3);
      return !prev;
    });
  };

  const triggerSync = () => {
    setPendingSyncCount(0);
    setIsOnline(true);
  };

  return (
    <OfflineContext.Provider value={{ isOnline, pendingSyncCount, toggleSimulatedOffline, triggerSync }}>
      {children}
    </OfflineContext.Provider>
  );
};

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
};
