"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { QuickAddModal } from "@/components/transactions/QuickAddModal";
import { TransactionDetailModal } from "@/components/transactions/TransactionDetailModal";
import { DashboardProvider, useDashboard } from "@/components/providers/DashboardProvider";

function DashboardShell({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const {
    isQuickAddOpen,
    openQuickAdd,
    closeQuickAdd,
    selectedTransaction,
    openTransaction,
    closeTransaction,
    triggerRefresh,
  } = useDashboard();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading Family Finance...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <Sidebar onOpenQuickAdd={openQuickAdd} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header onOpenQuickAdd={openQuickAdd} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-safe-bottom">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <BottomNav onOpenQuickAdd={openQuickAdd} />
      </div>

      {/* Global Quick Add Modal */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={closeQuickAdd}
        onSuccess={triggerRefresh}
      />

      {/* Global Transaction Detail Modal */}
      <TransactionDetailModal
        transaction={selectedTransaction}
        isOpen={!!selectedTransaction}
        onClose={closeTransaction}
        onUpdated={triggerRefresh}
      />
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProvider>
      <DashboardShell>{children}</DashboardShell>
    </DashboardProvider>
  );
}
