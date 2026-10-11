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
    <div className="d-flex flex-column gap-4">
      {/* Header */}
      <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3">
        <div>
          <h1 className="h4 fw-bold text-dark mb-1">
            Family Management
          </h1>
          <p className="small text-secondary mb-0">
            Manage household members and access roles
          </p>
        </div>
        {isAdmin && (
          <Button
            size="md"
            onClick={() => setIsAddMemberOpen(true)}
            className="fw-semibold shadow-sm gap-2"
          >
            <UserPlus style={{ width: "16px", height: "16px" }} />
            <span>Add Member</span>
          </Button>
        )}
      </div>

      {/* Family Info Banner */}
      {family && (
        <div className="card rounded-card border border-primary-subtle bg-primary-subtle p-3 p-sm-4 shadow-sm">
          <div className="d-flex align-items-start justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded-circle bg-primary text-white fw-bold d-flex align-items-center justify-content-center flex-shrink-0"
                style={{ width: "40px", height: "40px", fontSize: "18px" }}
              >
                {family.name.charAt(0)}
              </div>
              <div>
                <h3 className="h6 fw-bold text-dark mb-0">{family.name}</h3>
                <p className="small text-secondary mb-0" style={{ fontSize: "11px" }}>
                  {members.length} active member{members.length !== 1 ? "s" : ""} •{" "}
                  {family._count?.transactions || 0} total transactions
                </p>
              </div>
            </div>
            <Badge variant="income" className="flex-shrink-0">
              Active
            </Badge>
          </div>

          {isAdmin && (
            <div className="mt-3 pt-2 border-top border-primary-subtle">
              <p className="small text-primary fw-medium mb-0" style={{ fontSize: "11px" }}>
                Invite Code:{" "}
                <span className="font-monospace fw-bold bg-white px-2 py-0.5 rounded border border-primary-subtle text-dark">
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
          <div className="d-flex flex-column gap-3">
            {[1, 2].map((i) => (
              <div key={i} className="card rounded-card border p-3 bg-light placeholder-glow" style={{ height: "70px" }}>
                <span className="placeholder col-6"></span>
              </div>
            ))}
          </div>
        ) : members.length === 0 ? (
          <div className="py-4 text-center small text-secondary">
            <Users className="text-secondary mx-auto mb-2" style={{ width: "32px", height: "32px" }} />
            No family members yet.
          </div>
        ) : (
          <div className="d-flex flex-column gap-2">
            {members.map((m) => {
              const isSelf = m.userId === currentUser?.id;
              const isAdminRole = m.role === "ADMIN";

              return (
                <div
                  key={m.id}
                  className="rounded-card border bg-surface-muted p-3 d-flex flex-row align-items-center justify-content-between gap-3 shadow-xs hover-lift transition"
                >
                  <div className="d-flex align-items-center gap-3 overflow-hidden">
                    {/* Avatar */}
                    <div
                      className="rounded-3 bg-primary-soft text-primary fw-bold d-flex align-items-center justify-content-center flex-shrink-0 small shadow-xs"
                      style={{ width: "40px", height: "40px", fontSize: "15px" }}
                    >
                      {m.user.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="overflow-hidden">
                      <div className="d-flex align-items-center gap-2 flex-wrap">
                        <span className="small fw-bold text-dark text-truncate">
                          {m.user.name}
                        </span>
                        {isSelf && (
                          <Badge variant="info" style={{ fontSize: "10px" }}>
                            You
                          </Badge>
                        )}
                      </div>
                      <p className="small text-secondary mb-0 text-truncate" style={{ fontSize: "11px" }}>
                        {m.user.email} •{" "}
                        <span className={isAdminRole ? "text-primary fw-bold" : ""}>
                          {isAdminRole ? "Family Admin" : "Member"}
                        </span>
                      </p>
                      <p className="small text-secondary mb-0 text-truncate" style={{ fontSize: "10px" }}>
                        Joined {formatShortDate(m.joinedAt)} •{" "}
                        {m._count?.transactions || 0} transactions
                      </p>
                    </div>
                  </div>

                  {/* Actions (Admin only, not on self for safety) */}
                  {isAdmin && !isSelf && (
                    <div className="d-flex align-items-center gap-1 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleRoleToggle(m.id, m.role)}
                        title={isAdminRole ? "Remove Admin" : "Make Admin"}
                        className="btn btn-sm btn-link text-secondary p-1 text-decoration-none"
                      >
                        <Crown style={{ width: "16px", height: "16px" }} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeactivate(m.id, m.user.name)}
                        title="Deactivate Member"
                        className="btn btn-sm btn-link text-danger p-1 text-decoration-none"
                      >
                        <UserMinus style={{ width: "16px", height: "16px" }} />
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
          <form onSubmit={handleAddMember} className="d-flex flex-column gap-3 pt-2">
            <div>
              <label className="form-label small fw-semibold text-dark mb-1">
                Full Name *
              </label>
              <input
                required
                value={newMember.name}
                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                placeholder="e.g. Priya Sharma"
                className="form-control rounded-input py-2"
              />
            </div>

            <div>
              <label className="form-label small fw-semibold text-dark mb-1">
                Email Address *
              </label>
              <input
                required
                type="email"
                value={newMember.email}
                onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                placeholder="priya@family.local"
                className="form-control rounded-input py-2"
              />
            </div>

            <div>
              <label className="form-label small fw-semibold text-dark mb-1">
                Temporary Password *
              </label>
              <input
                required
                type="password"
                value={newMember.password}
                onChange={(e) => setNewMember({ ...newMember, password: e.target.value })}
                placeholder="Min 6 characters"
                className="form-control rounded-input py-2"
              />
              <p className="small text-secondary mt-1 mb-0" style={{ fontSize: "11px" }}>
                They can change their password later from Settings.
              </p>
            </div>

            <div>
              <label className="form-label small fw-semibold text-dark mb-1">
                Access Role
              </label>
              <div className="row g-2">
                <div className="col-6">
                  <button
                    type="button"
                    onClick={() => setNewMember({ ...newMember, role: "MEMBER" })}
                    className={`btn btn-sm w-100 p-2.5 rounded-btn border text-start transition ${
                      newMember.role === "MEMBER"
                        ? "btn-primary text-white shadow-sm"
                        : "btn-light border text-dark"
                    }`}
                  >
                    <Users style={{ width: "16px", height: "16px" }} className="mb-1" />
                    <p className="small fw-bold mb-0">Member</p>
                    <p className="small opacity-75 mb-0" style={{ fontSize: "10px" }}>
                      Add transactions, view reports
                    </p>
                  </button>
                </div>

                <div className="col-6">
                  <button
                    type="button"
                    onClick={() => setNewMember({ ...newMember, role: "ADMIN" })}
                    className={`btn btn-sm w-100 p-2.5 rounded-btn border text-start transition ${
                      newMember.role === "ADMIN"
                        ? "btn-primary text-white shadow-sm"
                        : "btn-light border text-dark"
                    }`}
                  >
                    <Shield style={{ width: "16px", height: "16px" }} className="mb-1" />
                    <p className="small fw-bold mb-0">Admin</p>
                    <p className="small opacity-75 mb-0" style={{ fontSize: "10px" }}>
                      Full control, manage family
                    </p>
                  </button>
                </div>
              </div>
            </div>

            <div className="d-flex align-items-center justify-content-end gap-2 pt-2 border-top mt-2">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setIsAddMemberOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={submitting}
                className="fw-bold px-4"
              >
                Add to Family
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
