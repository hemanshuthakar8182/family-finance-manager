"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { formatShortDate } from "@/lib/utils/formatters";
import { Users, Shield, UserMinus, UserPlus, Crown, MoreVertical } from "lucide-react";

export default function FamilyPage() {
  const { data: session } = useSession();
  const currentUser = session?.user as any;
  const { showToast } = useToast();

  const [family, setFamily] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    password: "",
    role: "MEMBER",
  });

  const fetchData = () => {
    setIsLoading(true);
    Promise.all([
      fetch("/api/family").then((r) => r.json()),
      fetch("/api/family/members").then((r) => r.json()),
    ])
      .then(([familyData, membersData]) => {
        setFamily(familyData);
        if (Array.isArray(membersData)) setMembers(membersData);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();

    setSubmitting(true);
    try {
      const res = await fetch("/api/family/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMember),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add member");

      showToast({
        type: "success",
        title: "Member Added",
        message: `${newMember.name} has joined the family.`,
      });
      setNewMember({ name: "", email: "", password: "", role: "MEMBER" });
      setIsAddMemberOpen(false);
      fetchData();
    } catch (err: any) {
      showToast({ type: "error", title: "Error", message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (memberId: string, memberName: string) => {
    if (!confirm(`Deactivate ${memberName}? They will no longer be able to access the family account.`))
      return;

    try {
      const res = await fetch(`/api/family/members/${memberId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to deactivate member");

      showToast({ type: "success", title: "Member Deactivated", message: memberName });
      fetchData();
    } catch (err: any) {
      showToast({ type: "error", title: "Error", message: err.message });
    }
  };

  const handleRoleToggle = async (memberId: string, currentRole: string) => {
    const newRole = currentRole === "ADMIN" ? "MEMBER" : "ADMIN";

    try {
      const res = await fetch(`/api/family/members/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update role");

      showToast({ type: "success", title: "Role Updated", message: `Changed to ${newRole}` });
      fetchData();
    } catch (err: any) {
      showToast({ type: "error", title: "Error", message: err.message });
    }
  };

  const isAdmin = currentUser?.role === "ADMIN";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Family Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage household members and access roles
          </p>
        </div>
        {isAdmin && (
          <Button
            size="md"
            onClick={() => setIsAddMemberOpen(true)}
            className="font-semibold shadow-sm"
          >
            <UserPlus className="w-4 h-4 mr-1.5" />
            Add Member
          </Button>
        )}
      </div>

      {/* Family Info Banner */}
      {family && (
        <div className="p-5 rounded-card bg-primary/10 border border-primary/20">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground font-bold text-base flex items-center justify-center">
                  {family.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{family.name}</h3>
                  <p className="text-[11px] text-slate-500">
                    {members.length} active member{members.length !== 1 ? "s" : ""} •{" "}
                    {family._count?.transactions || 0} total transactions
                  </p>
                </div>
              </div>
            </div>
            <Badge variant="income" className="shrink-0">
              Active
            </Badge>
          </div>

          {isAdmin && (
            <div className="mt-3 pt-3 border-t border-primary/20">
              <p className="text-[11px] text-primary font-medium">
                Invite Code:{" "}
                <span className="font-mono font-bold text-teal-900 bg-white/70 px-2 py-0.5 rounded">
                  {family.inviteCode}
                </span>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Members List */}
      <Card>
        <CardHeader>
          <CardTitle>Family Members</CardTitle>
          <Badge variant="secondary">{members.length}</Badge>
        </CardHeader>

        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 bg-slate-200 rounded-card" />
            ))}
          </div>
        ) : members.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            No family members yet.
          </div>
        ) : (
          <div className="space-y-3">
            {members.map((m) => {
              const isSelf = m.userId === currentUser?.id;
              const isAdminRole = m.role === "ADMIN";

              return (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-3.5 rounded-card border border-border bg-surface hover:bg-slate-50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm border-2 border-surface shadow-sm">
                      {m.user.name.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">
                          {m.user.name}
                        </span>
                        {isSelf && (
                          <Badge variant="info" className="text-[10px] py-0 px-1.5">
                            You
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {m.user.email} •{" "}
                        <span className={isAdminRole ? "text-primary font-semibold" : ""}>
                          {isAdminRole ? "Family Admin" : "Member"}
                        </span>
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Joined {formatShortDate(m.joinedAt)} •{" "}
                        {m._count?.transactions || 0} transactions
                      </p>
                    </div>
                  </div>

                  {/* Actions (Admin only, not on self for safety) */}
                  {isAdmin && !isSelf && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleRoleToggle(m.id, m.role)}
                        title={isAdminRole ? "Remove Admin" : "Make Admin"}
                        className="p-1.5 rounded-btn text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                      >
                        <Crown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeactivate(m.id, m.user.name)}
                        title="Deactivate Member"
                        className="p-1.5 rounded-btn text-slate-400 hover:bg-red-50 hover:text-expense transition-colors"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Add Member Modal (Admin Only) */}
      {isAdmin && (
        <Modal
          isOpen={isAddMemberOpen}
          onClose={() => setIsAddMemberOpen(false)}
          title="Add Family Member"
          description="Create a new login for a family member"
        >
          <form onSubmit={handleAddMember} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name *
              </label>
              <input
                required
                value={newMember.name}
                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                placeholder="e.g. Priya Sharma"
                className="w-full h-11 px-3 rounded-input border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address *
              </label>
              <input
                required
                type="email"
                value={newMember.email}
                onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                placeholder="priya@family.local"
                className="w-full h-11 px-3 rounded-input border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Temporary Password *
              </label>
              <input
                required
                type="password"
                value={newMember.password}
                onChange={(e) => setNewMember({ ...newMember, password: e.target.value })}
                placeholder="Min 6 characters"
                className="w-full h-11 px-3 rounded-input border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                They can change their password later from Settings.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Access Role
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setNewMember({ ...newMember, role: "MEMBER" })}
                  className={`p-3 rounded-btn border text-left transition-all ${
                    newMember.role === "MEMBER"
                      ? "border-primary bg-primary/10"
                      : "border-border bg-surface hover:bg-surface-muted"
                  }`}
                >
                  <Users className="w-4 h-4 text-slate-500 mb-1" />
                  <p className="text-xs font-bold text-slate-900">Member</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Add transactions, view reports
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setNewMember({ ...newMember, role: "ADMIN" })}
                  className={`p-3 rounded-btn border text-left transition-all ${
                    newMember.role === "ADMIN"
                      ? "border-primary bg-primary/10"
                      : "border-border bg-surface hover:bg-surface-muted"
                  }`}
                >
                  <Shield className="w-4 h-4 text-primary mb-1" />
                  <p className="text-xs font-bold text-slate-900">Admin</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Full control, manage family
                  </p>
                </button>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={submitting}
                className="flex-1 font-bold"
              >
                Add to Family
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => setIsAddMemberOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
