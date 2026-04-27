export type Role = "owner" | "contributor" | "reviewer";

export type FileFormat = "JSON" | "YAML";
export type VersionStatus = "draft" | "pending" | "approved" | "rejected";
export type ApprovalStatus = "pending" | "approved" | "rejected";
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
export type ChangeType = "breaking" | "non-breaking";
export type NotificationType = "approval" | "comment" | "rejection";
export type ImpactLevel = "high" | "medium" | "low";

export type DiffSubType =
  // breaking
  | "endpoint_removed"
  | "field_renamed"
  | "type_changed"
  | "optional_to_required"
  | "response_structure"
  | "method_changed"
  // non-breaking
  | "endpoint_added"
  | "optional_field_added"
  | "response_data_added"
  | "optional_param_added"
  | "enum_expanded";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: Role;
  joinedAt: string;
  telegramEnabled?: boolean;
  telegramHandle?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  apiCount: number;
  versionCount: number;
  createdAt: string;
}

export interface Member {
  id: string;
  projectId: string;
  name: string;
  email: string;
  role: Role;
  avatar: string | null;
  joinedAt: string;
  invited?: boolean;
}

export interface ApiFile {
  id: string;
  projectId: string;
  name: string;
  format: FileFormat;
  uploadedBy: string;
  uploadedAt: string;
  fileUrl: string;
}

export interface ApiVersion {
  id: string;
  projectId: string;
  name: string;
  tags: string[];
  status: VersionStatus;
  createdBy: string;
  createdAt: string;
  fileId: string;
}

export interface EndpointParameter {
  name: string;
  in: "path" | "query" | "header" | "body";
  required: boolean;
  type: string;
  description?: string;
  example?: string;
}

export interface SchemaField {
  name: string;
  type: string;
  required: boolean;
  example?: string;
  description?: string;
}

export interface EndpointResponse {
  status: string;
  description: string;
  schemaName?: string;
  fields?: SchemaField[];
}

export interface Endpoint {
  id: string;
  projectId: string;
  versionId: string;
  method: HttpMethod;
  path: string;
  summary: string;
  description?: string;
  parameters: EndpointParameter[];
  requestBody?: SchemaField[];
  responses: EndpointResponse[];
}

export interface Schema {
  id: string;
  projectId: string;
  versionId: string;
  name: string;
  fields: SchemaField[];
}

export interface Diff {
  id: string;
  projectId: string;
  fromVersion: string;
  toVersion: string;
  endpoint: string;
  changeType: ChangeType;
  subType: DiffSubType;
  description: string;
  oldValue: string;
  newValue: string;
  impactLevel: ImpactLevel;
  /** plain-language explanation for non-technical users */
  plainExplanation: string;
}

export interface Approval {
  id: string;
  projectId: string;
  fromVersion: string;
  toVersion: string;
  submittedBy: string;
  submittedAt: string;
  status: ApprovalStatus;
  reviewerComment: string | null;
}

export interface Comment {
  id: string;
  approvalId: string;
  endpointId?: string;
  endpoint: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  projectId: string;
  type: NotificationType;
  message: string;
  read: boolean;
  createdAt: string;
  href?: string;
}

export type ActivityAction =
  | "Uploaded"
  | "Created"
  | "Updated"
  | "Deleted"
  | "Submitted"
  | "Resubmitted"
  | "Commented"
  | "Approved"
  | "Rejected"
  | "Invited"
  | "Removed";

export interface Activity {
  id: string;
  projectId: string;
  user: string;
  action: ActivityAction;
  target: string;
  timestamp: string;
}
