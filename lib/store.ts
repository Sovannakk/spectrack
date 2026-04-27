"use client";

import { create } from "zustand";
import {
  initialActivities,
  initialApiFiles,
  initialApprovals,
  initialComments,
  initialCurrentUser,
  initialDiffs,
  initialEndpoints,
  initialMembers,
  initialNotifications,
  initialProjects,
  initialSchemas,
  initialVersions,
} from "./mock-data";
import type {
  Activity,
  ActivityAction,
  ApiFile,
  ApiVersion,
  Approval,
  ApprovalStatus,
  Comment,
  Diff,
  Endpoint,
  FileFormat,
  Member,
  Notification,
  Project,
  Role,
  Schema,
  User,
  VersionStatus,
} from "./types";
import { nowIso, uid } from "./utils";

interface State {
  currentUser: User;
  projects: Project[];
  members: Member[];
  apiFiles: ApiFile[];
  versions: ApiVersion[];
  endpoints: Endpoint[];
  schemas: Schema[];
  diffs: Diff[];
  approvals: Approval[];
  comments: Comment[];
  notifications: Notification[];
  activities: Activity[];
  activeProjectId: string | null;

  setActiveProjectId: (id: string | null) => void;
  setRole: (role: Role) => void;
  updateCurrentUser: (patch: Partial<User>) => void;

  createProject: (input: { name: string; description: string }) => Project;
  updateProject: (
    id: string,
    patch: Partial<Pick<Project, "name" | "description">>,
  ) => void;
  deleteProject: (id: string) => void;

  inviteMember: (
    projectId: string,
    input: { email: string; role: Role },
  ) => Member;
  updateMemberRole: (memberId: string, role: Role) => void;
  removeMember: (memberId: string) => void;

  uploadApiFile: (
    projectId: string,
    input: {
      fileName: string;
      format: FileFormat;
      versionName: string;
      tags: string[];
    },
  ) => { file: ApiFile; version: ApiVersion };
  updateApiFile: (
    fileId: string,
    patch: { name?: string; replacementFileName?: string },
  ) => void;
  deleteApiFile: (fileId: string) => void;

  updateVersion: (
    versionId: string,
    patch: { name?: string; tags?: string[] },
  ) => void;
  resubmitVersion: (
    versionId: string,
    input: { fileName: string; format: FileFormat },
  ) => void;

  submitForReview: (
    projectId: string,
    fromVersion: string,
    toVersion: string,
  ) => Approval;
  approveApproval: (approvalId: string, comment?: string) => void;
  rejectApproval: (approvalId: string, reason: string) => void;

  addComment: (
    approvalId: string,
    input: { endpoint: string; endpointId?: string; text: string },
  ) => Comment;

  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: (projectId?: string) => void;

  logActivity: (
    projectId: string,
    action: ActivityAction,
    target: string,
  ) => void;
}

function makeFileUrl(projectId: string, fileName: string): string {
  return `https://storage.apilens.dev/projects/${projectId}/files/${fileName}`;
}

export const useAppStore = create<State>((set, get) => ({
  currentUser: initialCurrentUser,
  projects: initialProjects,
  members: initialMembers,
  apiFiles: initialApiFiles,
  versions: initialVersions,
  endpoints: initialEndpoints,
  schemas: initialSchemas,
  diffs: initialDiffs,
  approvals: initialApprovals,
  comments: initialComments,
  notifications: initialNotifications,
  activities: initialActivities,
  activeProjectId: null,

  setActiveProjectId: (id) => set({ activeProjectId: id }),

  setRole: (role) =>
    set((s) => ({ currentUser: { ...s.currentUser, role } })),

  updateCurrentUser: (patch) =>
    set((s) => ({ currentUser: { ...s.currentUser, ...patch } })),

  logActivity: (projectId, action, target) => {
    const { currentUser } = get();
    const entry: Activity = {
      id: uid("ac"),
      projectId,
      user: currentUser.name,
      action,
      target,
      timestamp: nowIso(),
    };
    set((s) => ({ activities: [entry, ...s.activities] }));
  },

  createProject: ({ name, description }) => {
    const project: Project = {
      id: uid("p"),
      name,
      description,
      memberCount: 1,
      apiCount: 0,
      versionCount: 0,
      createdAt: nowIso(),
    };
    const { currentUser } = get();
    const ownerMember: Member = {
      id: uid("u"),
      projectId: project.id,
      name: currentUser.name,
      email: currentUser.email,
      role: "owner",
      avatar: null,
      joinedAt: nowIso(),
    };
    set((s) => ({
      projects: [project, ...s.projects],
      members: [...s.members, ownerMember],
    }));
    get().logActivity(project.id, "Created", `project "${name}"`);
    return project;
  },

  updateProject: (id, patch) => {
    set((s) => ({
      projects: s.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }));
    get().logActivity(id, "Updated", "project settings");
  },

  deleteProject: (id) => {
    const project = get().projects.find((p) => p.id === id);
    set((s) => ({
      projects: s.projects.filter((p) => p.id !== id),
      members: s.members.filter((m) => m.projectId !== id),
      apiFiles: s.apiFiles.filter((f) => f.projectId !== id),
      versions: s.versions.filter((v) => v.projectId !== id),
      endpoints: s.endpoints.filter((e) => e.projectId !== id),
      schemas: s.schemas.filter((sc) => sc.projectId !== id),
      diffs: s.diffs.filter((d) => d.projectId !== id),
      approvals: s.approvals.filter((a) => a.projectId !== id),
      notifications: s.notifications.filter((n) => n.projectId !== id),
      activeProjectId: s.activeProjectId === id ? null : s.activeProjectId,
    }));
    if (project) {
      const entry: Activity = {
        id: uid("ac"),
        projectId: id,
        user: get().currentUser.name,
        action: "Deleted",
        target: `project "${project.name}"`,
        timestamp: nowIso(),
      };
      set((s) => ({ activities: [entry, ...s.activities] }));
    }
  },

  inviteMember: (projectId, { email, role }) => {
    const name = email.split("@")[0] ?? email;
    const member: Member = {
      id: uid("u"),
      projectId,
      name,
      email,
      role,
      avatar: null,
      joinedAt: nowIso(),
      invited: true,
    };
    set((s) => ({
      members: [...s.members, member],
      projects: s.projects.map((p) =>
        p.id === projectId ? { ...p, memberCount: p.memberCount + 1 } : p,
      ),
    }));
    get().logActivity(
      projectId,
      "Invited",
      `${name} as ${role[0].toUpperCase() + role.slice(1)}`,
    );
    return member;
  },

  updateMemberRole: (memberId, role) => {
    const member = get().members.find((m) => m.id === memberId);
    if (!member) return;
    set((s) => ({
      members: s.members.map((m) => (m.id === memberId ? { ...m, role } : m)),
    }));
    get().logActivity(
      member.projectId,
      "Updated",
      `${member.name}'s role to ${role}`,
    );
  },

  removeMember: (memberId) => {
    const member = get().members.find((m) => m.id === memberId);
    if (!member) return;
    set((s) => ({
      members: s.members.filter((m) => m.id !== memberId),
      projects: s.projects.map((p) =>
        p.id === member.projectId
          ? { ...p, memberCount: Math.max(0, p.memberCount - 1) }
          : p,
      ),
    }));
    get().logActivity(member.projectId, "Removed", `${member.name}`);
  },

  uploadApiFile: (
    projectId,
    { fileName, format, versionName, tags },
  ) => {
    const { currentUser } = get();
    const file: ApiFile = {
      id: uid("f"),
      projectId,
      name: fileName,
      format,
      uploadedBy: currentUser.name,
      uploadedAt: nowIso(),
      fileUrl: makeFileUrl(projectId, fileName),
    };
    const status: VersionStatus = "draft";
    const version: ApiVersion = {
      id: uid("v"),
      projectId,
      name: versionName,
      tags,
      status,
      createdBy: currentUser.name,
      createdAt: nowIso(),
      fileId: file.id,
    };
    set((s) => ({
      apiFiles: [file, ...s.apiFiles],
      versions: [version, ...s.versions],
      projects: s.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              apiCount: p.apiCount + 1,
              versionCount: p.versionCount + 1,
            }
          : p,
      ),
    }));
    get().logActivity(projectId, "Uploaded", fileName);
    get().logActivity(projectId, "Created", `version ${versionName}`);
    return { file, version };
  },

  updateApiFile: (fileId, { name, replacementFileName }) => {
    const file = get().apiFiles.find((f) => f.id === fileId);
    if (!file) return;
    const finalName = name ?? replacementFileName ?? file.name;
    set((s) => ({
      apiFiles: s.apiFiles.map((f) =>
        f.id === fileId
          ? {
              ...f,
              name: finalName,
              fileUrl: makeFileUrl(f.projectId, finalName),
              uploadedAt: replacementFileName ? nowIso() : f.uploadedAt,
              uploadedBy: replacementFileName
                ? get().currentUser.name
                : f.uploadedBy,
            }
          : f,
      ),
    }));
    get().logActivity(file.projectId, "Updated", `file ${finalName}`);
  },

  deleteApiFile: (fileId) => {
    const file = get().apiFiles.find((f) => f.id === fileId);
    if (!file) return;
    set((s) => ({
      apiFiles: s.apiFiles.filter((f) => f.id !== fileId),
      projects: s.projects.map((p) =>
        p.id === file.projectId
          ? { ...p, apiCount: Math.max(0, p.apiCount - 1) }
          : p,
      ),
    }));
    get().logActivity(file.projectId, "Deleted", file.name);
  },

  updateVersion: (versionId, patch) => {
    const version = get().versions.find((v) => v.id === versionId);
    if (!version) return;
    set((s) => ({
      versions: s.versions.map((v) =>
        v.id === versionId ? { ...v, ...patch } : v,
      ),
    }));
    get().logActivity(
      version.projectId,
      "Updated",
      `version ${patch.name ?? version.name}`,
    );
  },

  resubmitVersion: (versionId, { fileName, format }) => {
    const version = get().versions.find((v) => v.id === versionId);
    if (!version) return;
    const newFile: ApiFile = {
      id: uid("f"),
      projectId: version.projectId,
      name: fileName,
      format,
      uploadedBy: get().currentUser.name,
      uploadedAt: nowIso(),
      fileUrl: makeFileUrl(version.projectId, fileName),
    };
    const pending: VersionStatus = "pending";
    const pendingApproval: ApprovalStatus = "pending";
    set((s) => ({
      apiFiles: [newFile, ...s.apiFiles],
      versions: s.versions.map((v) =>
        v.id === versionId
          ? { ...v, status: pending, fileId: newFile.id }
          : v,
      ),
      approvals: s.approvals.map((a) =>
        a.projectId === version.projectId && a.toVersion === version.name
          ? {
              ...a,
              status: pendingApproval,
              reviewerComment: a.reviewerComment,
              submittedAt: nowIso(),
              submittedBy: get().currentUser.name,
            }
          : a,
      ),
      projects: s.projects.map((p) =>
        p.id === version.projectId ? { ...p, apiCount: p.apiCount + 1 } : p,
      ),
    }));
    get().logActivity(
      version.projectId,
      "Resubmitted",
      `version ${version.name}`,
    );
  },

  submitForReview: (projectId, fromVersion, toVersion) => {
    const { currentUser } = get();
    const approval: Approval = {
      id: uid("a"),
      projectId,
      fromVersion,
      toVersion,
      submittedBy: currentUser.name,
      submittedAt: nowIso(),
      status: "pending",
      reviewerComment: null,
    };
    const notification: Notification = {
      id: uid("n"),
      projectId,
      type: "approval",
      message: `${currentUser.name} submitted ${toVersion} for review`,
      read: false,
      createdAt: nowIso(),
      href: `/projects/${projectId}/workflow/${approval.id}`,
    };
    set((s) => ({
      approvals: [approval, ...s.approvals],
      notifications: [notification, ...s.notifications],
      versions: s.versions.map((v) =>
        v.projectId === projectId && v.name === toVersion
          ? { ...v, status: "pending" as VersionStatus }
          : v,
      ),
    }));
    get().logActivity(
      projectId,
      "Submitted",
      `${toVersion} for review`,
    );
    return approval;
  },

  approveApproval: (approvalId, comment) => {
    const approval = get().approvals.find((a) => a.id === approvalId);
    if (!approval) return;
    const status: ApprovalStatus = "approved";
    set((s) => ({
      approvals: s.approvals.map((a) =>
        a.id === approvalId
          ? { ...a, status, reviewerComment: comment ?? a.reviewerComment }
          : a,
      ),
      versions: s.versions.map((v) =>
        v.projectId === approval.projectId && v.name === approval.toVersion
          ? { ...v, status: "approved" as VersionStatus }
          : v,
      ),
      notifications: [
        {
          id: uid("n"),
          projectId: approval.projectId,
          type: "approval",
          message: `${approval.toVersion} was approved by ${get().currentUser.name}`,
          read: false,
          createdAt: nowIso(),
          href: `/projects/${approval.projectId}/workflow/${approval.id}`,
        },
        ...s.notifications,
      ],
    }));
    get().logActivity(
      approval.projectId,
      "Approved",
      `${approval.toVersion}`,
    );
  },

  rejectApproval: (approvalId, reason) => {
    const approval = get().approvals.find((a) => a.id === approvalId);
    if (!approval) return;
    const status: ApprovalStatus = "rejected";
    set((s) => ({
      approvals: s.approvals.map((a) =>
        a.id === approvalId ? { ...a, status, reviewerComment: reason } : a,
      ),
      versions: s.versions.map((v) =>
        v.projectId === approval.projectId && v.name === approval.toVersion
          ? { ...v, status: "rejected" as VersionStatus }
          : v,
      ),
      notifications: [
        {
          id: uid("n"),
          projectId: approval.projectId,
          type: "rejection",
          message: `${approval.toVersion} was rejected by ${get().currentUser.name}`,
          read: false,
          createdAt: nowIso(),
          href: `/projects/${approval.projectId}/workflow/${approval.id}`,
        },
        ...s.notifications,
      ],
    }));
    get().logActivity(
      approval.projectId,
      "Rejected",
      `${approval.toVersion}`,
    );
  },

  addComment: (approvalId, { endpoint, endpointId, text }) => {
    const approval = get().approvals.find((a) => a.id === approvalId);
    const { currentUser } = get();
    const comment: Comment = {
      id: uid("c"),
      approvalId,
      endpoint,
      endpointId,
      author: currentUser.name,
      text,
      createdAt: nowIso(),
    };
    let extraNotifications: Notification[] = [];
    if (approval) {
      // WORK-02: notify all other project members about the comment
      const otherMembers = get().members.filter(
        (m) =>
          m.projectId === approval.projectId && m.email !== currentUser.email,
      );
      const baseMsg = `${currentUser.name} commented on ${endpoint} in ${approval.fromVersion} → ${approval.toVersion}`;
      // we keep one notification (a single feed) — the spec says "for all other members"
      // since this is a single feed, we add a single notification entry tied to the project.
      // (Each member sees the same shared feed.)
      if (otherMembers.length > 0) {
        extraNotifications = [
          {
            id: uid("n"),
            projectId: approval.projectId,
            type: "comment",
            message: baseMsg,
            read: false,
            createdAt: nowIso(),
            href: `/projects/${approval.projectId}/workflow/${approval.id}`,
          },
        ];
      }
    }
    set((s) => ({
      comments: [...s.comments, comment],
      notifications: approval
        ? [...extraNotifications, ...s.notifications]
        : s.notifications,
    }));
    if (approval) {
      get().logActivity(approval.projectId, "Commented", endpoint);
    }
    return comment;
  },

  markNotificationRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n,
      ),
    })),

  markAllNotificationsRead: (projectId) =>
    set((s) => ({
      notifications: s.notifications.map((n) =>
        !projectId || n.projectId === projectId ? { ...n, read: true } : n,
      ),
    })),
}));

export function useUnreadCount(projectId?: string | null) {
  return useAppStore((s) =>
    s.notifications.filter(
      (n) => !n.read && (!projectId || n.projectId === projectId),
    ).length,
  );
}
