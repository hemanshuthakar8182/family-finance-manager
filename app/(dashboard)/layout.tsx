"use client";

import React from "react";
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
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-body">
        <div className="d-flex flex-column align-items-center gap-3">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="small fw-semibold text-secondary">Loading Family Finance...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  return (
    <div className="vh-100 vw-100 d-flex bg-body overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar onOpenQuickAdd={openQuickAdd} />

      {/* Main Content Area */}
      <div className="flex-grow-1 d-flex flex-column h-100 overflow-hidden position-relative">
        <Header onOpenQuickAdd={openQuickAdd} />

        <main 
          className="container-xl flex-grow-1 p-3 p-sm-4 overflow-y-auto"
          style={{ paddingBottom: "calc(5.5rem + env(safe-area-inset-bottom, 16px))" }}
        >
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
        onDeleted={triggerRefresh}
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
