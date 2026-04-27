"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAppStore } from "@/lib/store";
import { usePageLoader } from "@/components/page-loader";
import { OwnerGuard } from "@/components/owner-guard";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { Select } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input, Label } from "@/components/ui/input";
import { ConfirmModal } from "@/components/confirm-modal";
import { RoleBadge } from "@/components/role-badge";
import { PageHeader } from "@/components/page-header";
import { fireAlerts } from "@/lib/alerts";
import { z } from "zod";
import type { Role } from "@/lib/types";

const inviteSchema = z.object({
  email: z.string().email("Enter a valid email"),
  role: z.enum(["contributor", "reviewer"]),
});

export default function MembersPage() {
  return (
    <OwnerGuard>
      <Inner />
    </OwnerGuard>
  );
}

function Inner() {
  const { projectId } = useParams<{ projectId: string }>();
  const loading = usePageLoader();
  const me = useAppStore((s) => s.currentUser);
  const allMembers = useAppStore((s) => s.members);
  const members = React.useMemo(
    () => allMembers.filter((m) => m.projectId === projectId),
    [allMembers, projectId],
  );
  const inviteMember = useAppStore((s) => s.inviteMember);
  const updateMemberRole = useAppStore((s) => s.updateMemberRole);
  const removeMember = useAppStore((s) => s.removeMember);

  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState<"contributor" | "reviewer">(
    "contributor",
  );
  const [errs, setErrs] = React.useState<{ email?: string }>({});

  const [removeId, setRemoveId] = React.useState<string | null>(null);
  const removeTarget = members.find((m) => m.id === removeId);

  if (loading) return <Skeleton className="h-64" />;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Team members"
        description="Invite teammates and manage their access roles."
        actions={
          <Button onClick={() => setInviteOpen(true)}>
            <Plus className="h-4 w-4" /> Invite member
          </Button>
        }
      />

      <Table>
        <THead>
          <TR>
            <TH>Member</TH>
            <TH>Email</TH>
            <TH className="w-44">Role</TH>
            <TH>Joined</TH>
            <TH className="w-24 text-right">Actions</TH>
          </TR>
        </THead>
        <TBody>
          {members.map((m) => {
            const isMe = m.email === me.email;
            return (
              <TR key={m.id}>
                <TD>
                  <div className="flex items-center gap-2">
                    <Avatar name={m.name} size="sm" />
                    <div>
                      <div className="font-medium text-stone-900 dark:text-stone-100">
                        {m.name}{" "}
                        {isMe && (
                          <span className="text-xs font-normal text-stone-500">
                            (you)
                          </span>
                        )}
                      </div>
                      {m.invited && (
                        <div className="text-xs text-amber-600">
                          Invitation pending
                        </div>
                      )}
                    </div>
                  </div>
                </TD>
                <TD className="text-stone-600 dark:text-stone-300">{m.email}</TD>
                <TD>
                  {isMe ? (
                    <RoleBadge role={m.role} />
                  ) : (
                    <Select
                      value={m.role}
                      options={[
                        { value: "owner", label: "Owner" },
                        { value: "contributor", label: "Contributor" },
                        { value: "reviewer", label: "Reviewer" },
                      ]}
                      onValueChange={(r) => {
                        updateMemberRole(m.id, r as Role);
                        toast.success(`${m.name} is now ${r}`);
                      }}
                    />
                  )}
                </TD>
                <TD>{new Date(m.joinedAt).toLocaleDateString()}</TD>
                <TD className="text-right">
                  {!isMe && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setRemoveId(m.id)}
                      title="Remove"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </TD>
              </TR>
            );
          })}
        </TBody>
      </Table>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite member</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const result = inviteSchema.safeParse({ email, role });
              if (!result.success) {
                const map: { email?: string } = {};
                for (const issue of result.error.issues) {
                  if (issue.path[0] === "email") map.email = issue.message;
                }
                setErrs(map);
                return;
              }
              setErrs({});
              inviteMember(projectId, { email, role });
              toast.success("Invitation sent (expires in 3 days)");
              fireAlerts(
                `Invitation email sent to ${email}`,
                `Telegram alert: invitation sent to ${email}`,
              );
              setInviteOpen(false);
              setEmail("");
              setRole("contributor");
            }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teammate@email.com"
              />
              {errs.email && (
                <p className="text-xs text-red-500">{errs.email}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="role">Role</Label>
              <Select
                id="role"
                options={[
                  { value: "contributor", label: "Contributor" },
                  { value: "reviewer", label: "Reviewer" },
                ]}
                value={role}
                onValueChange={(v) =>
                  setRole(v as "contributor" | "reviewer")
                }
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => setInviteOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Send invitation</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmModal
        open={!!removeId}
        onOpenChange={(v) => !v && setRemoveId(null)}
        title={`Remove ${removeTarget?.name ?? "member"}?`}
        description="They will lose access to this project immediately."
        confirmLabel="Remove"
        destructive
        onConfirm={() => {
          if (!removeId) return;
          removeMember(removeId);
          toast.success("Member removed");
        }}
      />
    </div>
  );
}
