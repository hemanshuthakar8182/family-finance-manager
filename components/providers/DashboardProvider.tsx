"use client";

import React, { createContext, useContext, useState, useCallback, useMemo } from "react";

interface DashboardContextType {
  isQuickAddOpen: boolean;
  openQuickAdd: () => void;
  closeQuickAdd: () => void;
  selectedTransaction: any | null;
  openTransaction: (t: any) => void;
  closeTransaction: () => void;
  refreshTrigger: number;
  triggerRefresh: () => void;
}

const DashboardContext = createContext<DashboardContextType>({
  isQuickAddOpen: false,
  openQuickAdd: () => {},
  closeQuickAdd: () => {},
  selectedTransaction: null,
  openTransaction: () => {},
  closeTransaction: () => {},
  refreshTrigger: 0,
  triggerRefresh: () => {},
});

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const openQuickAdd = useCallback(() => setIsQuickAddOpen(true), []);
  const closeQuickAdd = useCallback(() => setIsQuickAddOpen(false), []);
  const openTransaction = useCallback((t: any) => setSelectedTransaction(t), []);
  const closeTransaction = useCallback(() => setSelectedTransaction(null), []);
  const triggerRefresh = useCallback(() => setRefreshTrigger((p) => p + 1), []);

  const value = useMemo(
    () => ({
      isQuickAddOpen,
      openQuickAdd,
      closeQuickAdd,
      selectedTransaction,
      openTransaction,
      closeTransaction,
      refreshTrigger,
      triggerRefresh,
    }),
    [
      isQuickAddOpen,
      openQuickAdd,
      closeQuickAdd,
      selectedTransaction,
      openTransaction,
      closeTransaction,
      refreshTrigger,
      triggerRefresh,
    ]
  );

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  return useContext(DashboardContext);
}
