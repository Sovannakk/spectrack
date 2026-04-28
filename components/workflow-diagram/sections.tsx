import type { Edge, Node } from "@xyflow/react";

/**
 * 9-section APILens workflow diagram, expressed as React Flow data.
 *
 * Routing strategy
 * ----------------
 * Every node exposes 8 handles (`t-src · t-tgt · r-src · r-tgt · b-src ·
 * b-tgt · l-src · l-tgt`). Edges specify `sourceHandle` / `targetHandle`
 * explicitly so we can avoid edges crossing through nearby nodes.
 *
 * The `e()` helper supports a `dir` shorthand for the most common cases:
 *
 *   "down"     → b-src → t-tgt   (default forward flow)
 *   "right"    → r-src → l-tgt   (sibling to the right)
 *   "left"     → l-src → r-tgt   (sibling to the left)
 *   "loop-r"   → r-src → r-tgt   (loop back, route via right side)
 *   "loop-l"   → l-src → l-tgt   (loop back, route via left side)
 *   "up-r"     → t-src → r-tgt   (return upward, target's right side)
 *   "up-l"     → t-src → l-tgt
 *   "down-r"   → b-src → l-tgt   (branch out + downward)
 *   "down-l"   → b-src → r-tgt
 */

export interface SectionData {
  id: string;
  label: string;
  width: number;
  height: number;
  nodes: Node[];
  edges: Edge[];
}

type NodeType = "web" | "action" | "feature" | "process" | "condition";

type Direction =
  | "down"
  | "up"
  | "right"
  | "left"
  | "loop-r"
  | "loop-l"
  | "up-r"
  | "up-l"
  | "down-r"
  | "down-l";

const HANDLES: Record<Direction, { src: string; tgt: string }> = {
  down: { src: "b-src", tgt: "t-tgt" },
  up: { src: "t-src", tgt: "b-tgt" },
  right: { src: "r-src", tgt: "l-tgt" },
  left: { src: "l-src", tgt: "r-tgt" },
  "loop-r": { src: "r-src", tgt: "r-tgt" },
  "loop-l": { src: "l-src", tgt: "l-tgt" },
  "up-r": { src: "t-src", tgt: "r-tgt" },
  "up-l": { src: "t-src", tgt: "l-tgt" },
  "down-r": { src: "b-src", tgt: "l-tgt" },
  "down-l": { src: "b-src", tgt: "r-tgt" },
};

function n(
  id: string,
  type: NodeType,
  label: string,
  position: { x: number; y: number },
): Node {
  return {
    id,
    type,
    position,
    data: { label },
    draggable: false,
    selectable: false,
  };
}

function e(
  id: string,
  source: string,
  target: string,
  options: {
    label?: string;
    dir?: Direction;
    sourceHandle?: string;
    targetHandle?: string;
    dashed?: boolean;
    type?: Edge["type"];
  } = {},
): Edge {
  const { src, tgt } = HANDLES[options.dir ?? "down"];
  return {
    id,
    source,
    target,
    sourceHandle: options.sourceHandle ?? src,
    targetHandle: options.targetHandle ?? tgt,
    type: options.type ?? "smoothstep",
    label: options.label,
    labelStyle: { fontSize: 11, fill: "#374151", fontWeight: 600 },
    labelBgStyle: { fill: "#FFFFFF", stroke: "#E5E7EB", strokeWidth: 1 },
    labelBgPadding: [6, 3],
    labelBgBorderRadius: 4,
    style: {
      stroke: "#9CA3AF",
      strokeWidth: 1.4,
      strokeDasharray: options.dashed ? "5 4" : undefined,
    },
    markerEnd: {
      type: "arrowclosed" as never,
      color: "#9CA3AF",
      width: 18,
      height: 18,
    },
  };
}

const ns = (sectionId: string, localId: string) => `${sectionId}:${localId}`;

// =====================================================================
// Section 1 — Authentication (3 sub-flows side-by-side)
// =====================================================================

function buildSection1(): SectionData {
  const id = "section-authentication";
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Wider columns so loop-back arrows have side breathing room.
  const COL_A = 80;
  const COL_B = 720;
  const COL_C = 1320;

  // Vertical step between rows
  const ROW = 110;
  const COND_ROW = 150; // extra room after a condition

  // ---------- Sub-flow A: Sign Up ----------
  const A = (k: string) => ns(id, `A:${k}`);
  let yA = 0;
  nodes.push(
    n(A("signup"), "web", "Sign Up Page", { x: COL_A, y: yA }),
  );
  yA += ROW;
  nodes.push(n(A("form"), "action", "Show sign up form", { x: COL_A, y: yA }));
  yA += ROW;
  nodes.push(
    n(
      A("input"),
      "action",
      "Input full name, email, password, confirm",
      { x: COL_A, y: yA },
    ),
  );
  yA += ROW;
  nodes.push(n(A("submit"), "action", "Submit credentials", { x: COL_A, y: yA }));
  yA += ROW;
  nodes.push(n(A("sendOtp"), "web", "Send OTP", { x: COL_A, y: yA }));
  yA += ROW;
  nodes.push(n(A("verify"), "action", "Verify OTP", { x: COL_A, y: yA }));
  yA += ROW;
  nodes.push(n(A("valid"), "condition", "Is OTP valid?", { x: COL_A + 10, y: yA }));
  yA += COND_ROW;
  nodes.push(n(A("expired"), "condition", "Is OTP expired?", { x: COL_A + 10, y: yA }));
  yA += COND_ROW;
  nodes.push(n(A("done"), "web", "Sign In Page", { x: COL_A, y: yA }));

  edges.push(
    e(A("e1"), A("signup"), A("form")),
    e(A("e2"), A("form"), A("input")),
    e(A("e3"), A("input"), A("submit")),
    e(A("e4"), A("submit"), A("sendOtp")),
    e(A("e5"), A("sendOtp"), A("verify")),
    e(A("e6"), A("verify"), A("valid")),
    // No → loop back to Verify (left side)
    e(A("e7-no"), A("valid"), A("verify"), {
      label: "No",
      dir: "loop-l",
      dashed: true,
    }),
    e(A("e7-yes"), A("valid"), A("expired"), { label: "Yes" }),
    // Yes (expired) → loop back to Send OTP (right side)
    e(A("e8-yes"), A("expired"), A("sendOtp"), {
      label: "Yes",
      dir: "loop-r",
      dashed: true,
    }),
    e(A("e8-no"), A("expired"), A("done"), { label: "No" }),
  );
  const aHeight = yA + 80;

  // ---------- Sub-flow B: Sign In ----------
  const B = (k: string) => ns(id, `B:${k}`);
  let yB = 0;
  nodes.push(n(B("landing"), "web", "Landing Page", { x: COL_B, y: yB }));
  yB += ROW;
  nodes.push(n(B("isSigned"), "condition", "Is signed in?", { x: COL_B + 10, y: yB }));
  yB += COND_ROW;
  nodes.push(n(B("signin"), "web", "Sign In Page", { x: COL_B, y: yB }));
  yB += ROW;
  nodes.push(n(B("hasAcct"), "condition", "Having an account?", { x: COL_B + 10, y: yB }));
  yB += COND_ROW;
  // Side branch: Sign Up Page (left of column B)
  nodes.push(n(B("signup"), "web", "Sign Up Page", { x: COL_B - 300, y: yB - 40 }));
  nodes.push(n(B("oauth"), "condition", "Sign in via Google / GitHub?", { x: COL_B + 10, y: yB }));
  yB += COND_ROW;
  // Side branch: Project Page (right of column B)
  nodes.push(n(B("project1"), "web", "Project Page", { x: COL_B + 300, y: yB - 40 }));
  nodes.push(n(B("form"), "action", "Show sign in form", { x: COL_B, y: yB }));
  yB += ROW;
  nodes.push(n(B("creds"), "action", "Input email and password", { x: COL_B, y: yB }));
  yB += ROW;
  nodes.push(n(B("valid"), "condition", "Is valid?", { x: COL_B + 10, y: yB }));
  yB += COND_ROW;
  nodes.push(n(B("forgot?"), "condition", "Forgot password?", { x: COL_B + 10, y: yB }));
  yB += COND_ROW;
  nodes.push(n(B("forgot"), "web", "Forgot Password", { x: COL_B - 300, y: yB - 40 }));
  nodes.push(n(B("project2"), "web", "Project Page", { x: COL_B, y: yB }));

  edges.push(
    e(B("e1"), B("landing"), B("isSigned")),
    e(B("e2-yes"), B("isSigned"), B("signin"), { label: "Yes" }),
    e(B("e3"), B("signin"), B("hasAcct")),
    e(B("e4-no"), B("hasAcct"), B("signup"), { label: "No", dir: "left" }),
    e(B("e5-yes"), B("hasAcct"), B("oauth"), { label: "Yes" }),
    e(B("e6-yes"), B("oauth"), B("project1"), { label: "Yes", dir: "right" }),
    e(B("e6-no"), B("oauth"), B("form"), { label: "No" }),
    e(B("e7"), B("form"), B("creds")),
    e(B("e8"), B("creds"), B("valid")),
    e(B("e9-no"), B("valid"), B("creds"), {
      label: "No",
      dir: "loop-l",
      dashed: true,
    }),
    e(B("e9-yes"), B("valid"), B("forgot?"), { label: "Yes" }),
    e(B("e10-yes"), B("forgot?"), B("forgot"), { label: "Yes", dir: "left" }),
    e(B("e10-no"), B("forgot?"), B("project2"), { label: "No" }),
  );
  const bHeight = yB + 80;

  // ---------- Sub-flow C: Forgot Password ----------
  const C = (k: string) => ns(id, `C:${k}`);
  let yC = 0;
  nodes.push(n(C("fp"), "web", "Forgot Password Page", { x: COL_C, y: yC }));
  yC += ROW;
  nodes.push(n(C("email"), "action", "Input email", { x: COL_C, y: yC }));
  yC += ROW;
  nodes.push(n(C("send"), "action", "Send OTP verification", { x: COL_C, y: yC }));
  yC += ROW;
  nodes.push(n(C("verify"), "action", "Verify OTP", { x: COL_C, y: yC }));
  yC += ROW;
  nodes.push(n(C("valid"), "condition", "Is OTP valid?", { x: COL_C + 10, y: yC }));
  yC += COND_ROW;
  nodes.push(n(C("expired"), "condition", "Is OTP expired?", { x: COL_C + 10, y: yC }));
  // Side branch: Resend OTP (right of expired)
  nodes.push(n(C("resend"), "action", "Resend OTP", { x: COL_C + 300, y: yC + 35 }));
  yC += COND_ROW;
  nodes.push(n(C("setpwd"), "action", "Set new password & confirm", { x: COL_C, y: yC }));
  yC += ROW;
  nodes.push(n(C("signin"), "web", "Sign In Page", { x: COL_C, y: yC }));

  edges.push(
    e(C("e1"), C("fp"), C("email")),
    e(C("e2"), C("email"), C("send")),
    e(C("e3"), C("send"), C("verify")),
    e(C("e4"), C("verify"), C("valid")),
    e(C("e5-no"), C("valid"), C("verify"), {
      label: "No",
      dir: "loop-l",
      dashed: true,
    }),
    e(C("e5-yes"), C("valid"), C("expired"), { label: "Yes" }),
    e(C("e6-yes"), C("expired"), C("resend"), { label: "Yes", dir: "right" }),
    // Resend → Verify (going up): out the top of Resend, into the right of Verify
    e(C("e6-back"), C("resend"), C("verify"), {
      dir: "up-r",
      dashed: true,
    }),
    e(C("e6-no"), C("expired"), C("setpwd"), { label: "No" }),
    e(C("e7"), C("setpwd"), C("signin")),
  );
  const cHeight = yC + 80;

  // Resend OTP sits at COL_C + 300 (= 1620) and is 210 wide, so the section
  // strip must extend past 1830 to fully cover the content.
  return {
    id,
    label: "1 · Authentication",
    width: COL_C + 320 + 210 + 60,
    height: Math.max(aHeight, bHeight, cHeight),
    nodes,
    edges,
  };
}

// =====================================================================
// Section 2 — Profile
// =====================================================================

function buildSection2(): SectionData {
  const id = "section-profile";
  const N = (k: string) => ns(id, k);
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const ROOT_X = 600;
  nodes.push(n(N("root"), "web", "Profile Page", { x: ROOT_X, y: 0 }));

  const colW = 320;
  const cols: {
    id: string;
    label: string;
    subs: { type: NodeType; label: string }[];
  }[] = [
    {
      id: "view",
      label: "View profile details",
      subs: [
        { type: "process", label: "Display full name, email, avatar, joinedDate" },
      ],
    },
    {
      id: "edit",
      label: "Edit profile information",
      subs: [
        { type: "action", label: "Update full name → Save" },
        { type: "action", label: "Update avatar → upload image → Save" },
        { type: "action", label: "Toggle Telegram notifications" },
        { type: "process", label: "Show connect / disconnect modal" },
        { type: "action", label: "Change password (current + new + confirm)" },
        { type: "process", label: "Validate → Save or show error" },
      ],
    },
    {
      id: "signout",
      label: "Sign out",
      subs: [
        { type: "process", label: "Clear session" },
        { type: "web", label: "→ Sign In Page" },
      ],
    },
  ];

  const FEATURE_Y = 120;
  cols.forEach((c, i) => {
    const x = i * colW + 100;
    nodes.push(n(N(c.id), "feature", c.label, { x, y: FEATURE_Y }));
    edges.push(e(N(`root-${c.id}`), N("root"), N(c.id)));
    c.subs.forEach((s, j) => {
      const subId = `${c.id}-${j}`;
      nodes.push(n(N(subId), s.type, s.label, { x, y: FEATURE_Y + 100 + j * 80 }));
      const prev = j === 0 ? c.id : `${c.id}-${j - 1}`;
      edges.push(e(N(`e-${subId}`), N(prev), N(subId)));
    });
  });

  const tallest = Math.max(...cols.map((c) => c.subs.length));
  return {
    id,
    label: "2 · Profile",
    width: 1100,
    height: FEATURE_Y + 100 + tallest * 80 + 80,
    nodes,
    edges,
  };
}

// =====================================================================
// Section 3 — Project Management
// =====================================================================

function buildSection3(): SectionData {
  const id = "section-project-management";
  const N = (k: string) => ns(id, k);
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Top row: List → Detail
  nodes.push(
    n(N("list"), "web", "Project List Page", { x: 60, y: 0 }),
    n(N("create"), "feature", "Create project (Owner)", { x: 60, y: 110 }),
    n(N("inputCreate"), "action", "Input name + description", { x: 60, y: 220 }),
    n(N("submitCreate"), "action", "Submit", { x: 60, y: 320 }),
    n(N("detail"), "web", "Project Detail Page", { x: 380, y: 0 }),
  );
  edges.push(
    e(N("e-list-create"), N("list"), N("create")),
    e(N("e-create-input"), N("create"), N("inputCreate")),
    e(N("e-input-submit"), N("inputCreate"), N("submitCreate")),
    e(N("e-submit-detail"), N("submitCreate"), N("detail"), {
      label: "Created",
      dir: "up-r",
    }),
    e(N("e-list-detail"), N("list"), N("detail"), {
      label: "Click card",
      dir: "right",
    }),
  );

  // 4 feature columns under Project Detail
  const FEATURE_Y = 130;
  const COL_W = 280;
  const COL_X0 = 380;

  // -------- Column 0: Project control (with Confirm? side branch) --------
  const c0x = COL_X0;
  nodes.push(
    n(N("ctrl"), "feature", "Project control (Owner)", { x: c0x, y: FEATURE_Y }),
    n(N("ctrl-edit"), "action", "Edit name / description → Save", {
      x: c0x,
      y: FEATURE_Y + 110,
    }),
    n(N("ctrl-delete"), "action", "Delete project", {
      x: c0x,
      y: FEATURE_Y + 220,
    }),
    n(N("ctrl-confirm"), "condition", "Confirm delete?", {
      x: c0x + 25,
      y: FEATURE_Y + 320,
    }),
    n(N("ctrl-yes"), "process", "Return to list", {
      x: c0x - 240,
      y: FEATURE_Y + 350,
    }),
  );
  edges.push(
    e(N("e-detail-ctrl"), N("detail"), N("ctrl")),
    e(N("e-ctrl-edit"), N("ctrl"), N("ctrl-edit")),
    e(N("e-ctrl-delete"), N("ctrl-edit"), N("ctrl-delete")),
    e(N("e-ctrl-confirm"), N("ctrl-delete"), N("ctrl-confirm")),
    e(N("e-ctrl-yes"), N("ctrl-confirm"), N("ctrl-yes"), {
      label: "Yes",
      dir: "left",
    }),
  );

  // -------- Columns 1-3: simple chains --------
  const cols: {
    id: string;
    label: string;
    subs: { type: NodeType; label: string }[];
  }[] = [
    {
      id: "team",
      label: "Team members (Owner)",
      subs: [
        { type: "action", label: "Invite by email + role" },
        { type: "process", label: "Email sent toast" },
        { type: "action", label: "Change member role" },
        { type: "action", label: "Remove member → confirm" },
      ],
    },
    {
      id: "roles",
      label: "Role & permissions",
      subs: [
        { type: "process", label: "Owner = full access" },
        { type: "process", label: "Contributor = edit APIs" },
        { type: "process", label: "Reviewer = review changes" },
      ],
    },
    {
      id: "log",
      label: "Activity log",
      subs: [
        { type: "process", label: "Track API updates" },
        { type: "process", label: "Track team changes" },
        { type: "process", label: "Edit history + timestamps" },
      ],
    },
  ];

  cols.forEach((c, i) => {
    const x = COL_X0 + (i + 1) * COL_W;
    nodes.push(n(N(c.id), "feature", c.label, { x, y: FEATURE_Y }));
    edges.push(e(N(`e-detail-${c.id}`), N("detail"), N(c.id)));
    c.subs.forEach((s, j) => {
      const subId = `${c.id}-${j}`;
      nodes.push(n(N(subId), s.type, s.label, { x, y: FEATURE_Y + 110 + j * 90 }));
      const prev = j === 0 ? c.id : `${c.id}-${j - 1}`;
      edges.push(e(N(`e-${subId}`), N(prev), N(subId)));
    });
  });

  return {
    id,
    label: "3 · Project Management",
    width: COL_X0 + 4 * COL_W + 80,
    height: 720,
    nodes,
    edges,
  };
}

// =====================================================================
// Section 4 — API Management & Versioning
// =====================================================================

function buildSection4(): SectionData {
  const id = "section-api-management";
  const N = (k: string) => ns(id, k);
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Top row — API Files + CRUD column to the right
  nodes.push(n(N("files"), "web", "API Files Page", { x: 60, y: 0 }));
  // CRUD column at x=580 (clears upload column completely)
  const CRUD_X = 580;
  nodes.push(
    n(N("read"), "action", "Read API file → Detail", { x: CRUD_X, y: 0 }),
    n(N("update"), "action", "Update / re-upload file", { x: CRUD_X, y: 110 }),
    n(N("delete"), "action", "Delete API file", { x: CRUD_X, y: 220 }),
    n(N("delConfirm"), "condition", "Confirm?", { x: CRUD_X + 25, y: 320 }),
  );
  edges.push(
    e(N("c0"), N("files"), N("read"), { dir: "right", label: "Click file" }),
    e(N("c1"), N("read"), N("update")),
    e(N("c2"), N("update"), N("delete")),
    e(N("c3"), N("delete"), N("delConfirm")),
  );

  // Upload column (x=60)
  const UP_X = 60;
  nodes.push(
    n(N("upload"), "feature", "Upload API (Owner / Contributor)", { x: UP_X, y: 120 }),
    n(N("drop"), "action", "Drag-drop file or URL", { x: UP_X, y: 230 }),
    n(N("valid"), "condition", "Valid format? (JSON / YAML)", { x: UP_X + 25, y: 330 }),
    n(N("error"), "process", "Show validation error", { x: 320, y: 360 }),
    n(N("extract"), "process", "Extract endpoints, params, schemas", { x: UP_X, y: 480 }),
    n(N("preview"), "action", "Show extracted preview", { x: UP_X, y: 590 }),
    n(N("meta"), "action", "Input version name + tags", { x: UP_X, y: 690 }),
    n(N("submit"), "action", "Submit", { x: UP_X, y: 790 }),
  );
  edges.push(
    e(N("u1"), N("files"), N("upload")),
    e(N("u2"), N("upload"), N("drop")),
    e(N("u3"), N("drop"), N("valid")),
    e(N("u4-no"), N("valid"), N("error"), { label: "No", dir: "right" }),
    e(N("u4-back"), N("error"), N("drop"), { dir: "up-l", dashed: true }),
    e(N("u4-yes"), N("valid"), N("extract"), { label: "Yes" }),
    e(N("u5"), N("extract"), N("preview")),
    e(N("u6"), N("preview"), N("meta")),
    e(N("u7"), N("meta"), N("submit")),
  );

  // Bottom row: Submit → Version List → Version Detail → docs/branches
  // Single horizontal row at y=790, then branches go DOWN below it.
  const ROW_Y = 790;
  nodes.push(
    n(N("vlist"), "web", "Version List Page", { x: 320, y: ROW_Y }),
    n(N("vdetail"), "web", "Version Detail Page", { x: 580, y: ROW_Y }),
    n(N("docs"), "feature", "View API docs (search + filter)", { x: 840, y: ROW_Y }),
    n(N("paramsResp"), "process", "Endpoints + params + req/resp", { x: 1100, y: ROW_Y }),
  );
  edges.push(
    e(N("u8"), N("submit"), N("vlist"), { dir: "right" }),
    e(N("v1"), N("vlist"), N("vdetail"), { label: "Click version", dir: "right" }),
    e(N("v2"), N("vdetail"), N("docs"), { dir: "right" }),
    e(N("v3"), N("docs"), N("paramsResp"), { dir: "right" }),
  );

  // Below Version Detail: Switch dropdown / Edit / Fix-resubmit branches
  const BR_Y = 920;
  nodes.push(
    n(N("switchVer"), "action", "Switch version dropdown", { x: 580, y: BR_Y }),
    n(N("editVer"), "action", "Edit version name / tags", { x: 580, y: BR_Y + 110 }),
    n(N("fix"), "feature", "Contributor: fix & resubmit", { x: 580, y: BR_Y + 220 }),
    n(N("uploadCorr"), "action", "Upload corrected file", { x: 840, y: BR_Y + 220 }),
    n(N("workflow"), "web", "Workflow Approvals", { x: 1100, y: BR_Y + 220 }),
    n(N("timeline"), "feature", "Version history timeline", { x: 320, y: BR_Y }),
  );
  edges.push(
    e(N("v4"), N("vdetail"), N("switchVer")),
    e(N("v5"), N("switchVer"), N("editVer")),
    e(N("v6"), N("editVer"), N("fix")),
    e(N("v7"), N("fix"), N("uploadCorr"), { dir: "right" }),
    e(N("v8"), N("uploadCorr"), N("workflow"), { dir: "right" }),
    e(N("v9"), N("vlist"), N("timeline"), { dir: "down" }),
  );

  return {
    id,
    label: "4 · API Management & Versioning",
    width: 1390,
    height: BR_Y + 220 + 80,
    nodes,
    edges,
  };
}

// =====================================================================
// Section 5 — Change Detection
// =====================================================================

function buildSection5(): SectionData {
  const id = "section-change-detection";
  const N = (k: string) => ns(id, k);
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Top: linear setup chain in column 1
  nodes.push(
    n(N("compare"), "web", "Compare / Diff Page", { x: 60, y: 0 }),
    n(N("select"), "action", "Select from + to versions", { x: 60, y: 110 }),
    n(N("auto"), "process", "Auto-compare versions", { x: 60, y: 220 }),
    n(N("engine"), "feature", "API comparison engine", { x: 60, y: 330 }),
  );
  edges.push(
    e(N("e1"), N("compare"), N("select")),
    e(N("e2"), N("select"), N("auto")),
    e(N("e3"), N("auto"), N("engine")),
  );

  // Two detection columns to the RIGHT of the setup chain
  const BREAK_X = 320;
  const NONBREAK_X = 580;
  nodes.push(
    n(N("breaking"), "feature", "Breaking change detection", { x: BREAK_X, y: 330 }),
    n(N("brk1"), "process", "Endpoint removed", { x: BREAK_X, y: 440 }),
    n(N("brk2"), "process", "Field renamed", { x: BREAK_X, y: 520 }),
    n(N("brk3"), "process", "Type changed", { x: BREAK_X, y: 600 }),
    n(N("brk4"), "process", "Optional → required", { x: BREAK_X, y: 680 }),
    n(N("brk5"), "process", "Response structure", { x: BREAK_X, y: 760 }),
    n(N("brk6"), "process", "HTTP method changed", { x: BREAK_X, y: 840 }),

    n(N("nonbreak"), "feature", "Non-breaking detection", { x: NONBREAK_X, y: 330 }),
    n(N("nb1"), "process", "New endpoint added", { x: NONBREAK_X, y: 440 }),
    n(N("nb2"), "process", "New optional field", { x: NONBREAK_X, y: 520 }),
    n(N("nb3"), "process", "New response data", { x: NONBREAK_X, y: 600 }),
    n(N("nb4"), "process", "New optional param", { x: NONBREAK_X, y: 680 }),
    n(N("nb5"), "process", "Expanded enum", { x: NONBREAK_X, y: 760 }),
  );
  edges.push(
    e(N("e4"), N("engine"), N("breaking"), { dir: "right" }),
    e(N("e5"), N("breaking"), N("nonbreak"), { dir: "right" }),
    e(N("e-brk1"), N("breaking"), N("brk1")),
    e(N("e-brk2"), N("brk1"), N("brk2")),
    e(N("e-brk3"), N("brk2"), N("brk3")),
    e(N("e-brk4"), N("brk3"), N("brk4")),
    e(N("e-brk5"), N("brk4"), N("brk5")),
    e(N("e-brk6"), N("brk5"), N("brk6")),
    e(N("e-nb1"), N("nonbreak"), N("nb1")),
    e(N("e-nb2"), N("nb1"), N("nb2")),
    e(N("e-nb3"), N("nb2"), N("nb3")),
    e(N("e-nb4"), N("nb3"), N("nb4")),
    e(N("e-nb5"), N("nb4"), N("nb5")),
  );

  // Below the detection columns: display chain + AI side-by-side
  // Both far below the brk/nb columns so no horizontal edges cross them.
  const DOWNSTREAM_Y = 970;
  nodes.push(
    n(N("display"), "process", "Display diff table", { x: 60, y: DOWNSTREAM_Y }),
    n(N("summary"), "process", "Diff summary bar (filter pills)", {
      x: 60,
      y: DOWNSTREAM_Y + 110,
    }),
    n(N("submit"), "feature", "Contributor: submit for review", {
      x: 60,
      y: DOWNSTREAM_Y + 220,
    }),
    n(N("confirmM"), "condition", "Confirm modal", {
      x: 85,
      y: DOWNSTREAM_Y + 320,
    }),
    n(N("approvals"), "web", "Approvals Page", { x: 60, y: DOWNSTREAM_Y + 460 }),

    // AI block to the RIGHT of display (same y, both below the detection columns)
    n(N("ai"), "feature", "AI change explanation", { x: 320, y: DOWNSTREAM_Y }),
    n(N("aiPart1"), "process", "Part 1: summary count", {
      x: 320,
      y: DOWNSTREAM_Y + 110,
    }),
    n(N("aiPart2"), "process", "Part 2: callout per change", {
      x: 320,
      y: DOWNSTREAM_Y + 220,
    }),
    n(N("aiPart3"), "process", "Part 3: plain-language summary", {
      x: 320,
      y: DOWNSTREAM_Y + 330,
    }),
    n(N("aiRegen"), "action", "Click 'Regenerate'", {
      x: 320,
      y: DOWNSTREAM_Y + 440,
    }),
  );
  edges.push(
    // Engine → Display: long vertical drop in col 1, no obstacles between
    e(N("e6"), N("engine"), N("display")),
    e(N("e7"), N("display"), N("summary")),
    e(N("e8"), N("summary"), N("submit")),
    e(N("e9"), N("submit"), N("confirmM")),
    e(N("e10"), N("confirmM"), N("approvals"), { label: "Yes" }),
    // Display → AI: short horizontal at the new lower row, no crossings
    e(N("e11"), N("display"), N("ai"), { dir: "right", label: "Explain" }),
    e(N("e12"), N("ai"), N("aiPart1")),
    e(N("e13"), N("aiPart1"), N("aiPart2")),
    e(N("e14"), N("aiPart2"), N("aiPart3")),
    e(N("e15"), N("aiPart3"), N("aiRegen")),
  );

  return {
    id,
    label: "5 · Change Detection",
    width: 870,
    height: DOWNSTREAM_Y + 530,
    nodes,
    edges,
  };
}

// =====================================================================
// Section 6 — Workflow & Collaboration
// =====================================================================

function buildSection6(): SectionData {
  const id = "section-workflow";
  const N = (k: string) => ns(id, k);
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Column layout — wide enough that no two columns visually conflict.
  const COL_CONTRIB = 60;
  const COL_STATUS = 340; // side branch from "Already submitted?"
  const COL_REVIEWER = 620;
  const COL_APPROVE = 980;
  const COL_BANNER = 1280; // safe banner / review carefully (Approve side branches)
  const COL_REJECT = 1560;

  // ---------- Contributor flow ----------
  nodes.push(
    n(N("approvals"), "web", "Approvals Page", { x: COL_CONTRIB, y: 0 }),
    n(N("propose"), "feature", "Contributor: propose new version", {
      x: COL_CONTRIB,
      y: 110,
    }),
    n(N("submitted"), "condition", "Already submitted?", {
      x: COL_CONTRIB + 25,
      y: 220,
    }),
    n(N("status"), "process", "Show status (stay)", {
      x: COL_STATUS,
      y: 250,
    }),
    n(N("create"), "process", "Create approval (status: pending)", {
      x: COL_CONTRIB,
      y: 370,
    }),
    n(N("notifReviewers"), "process", "Notify reviewers (email + in-app)", {
      x: COL_CONTRIB,
      y: 480,
    }),
  );
  edges.push(
    e(N("a1"), N("approvals"), N("propose")),
    e(N("a2"), N("propose"), N("submitted")),
    e(N("a3-yes"), N("submitted"), N("status"), { label: "Yes", dir: "right" }),
    e(N("a3-no"), N("submitted"), N("create"), { label: "No" }),
    e(N("a4"), N("create"), N("notifReviewers")),
  );

  // ---------- Reviewer chain ----------
  nodes.push(
    n(N("review"), "feature", "Reviewer: review", { x: COL_REVIEWER, y: 0 }),
    n(N("detail"), "web", "Approval Detail Page", { x: COL_REVIEWER, y: 110 }),
    n(N("viewDiff"), "action", "View diff between versions", {
      x: COL_REVIEWER,
      y: 220,
    }),
    n(N("comments"), "action", "Leave comments on endpoints", {
      x: COL_REVIEWER,
      y: 330,
    }),
    n(N("mention"), "action", "@mention support", { x: COL_REVIEWER, y: 440 }),
    n(N("notifyMention"), "process", "Notify mentioned user", {
      x: COL_REVIEWER,
      y: 550,
    }),
  );
  edges.push(
    e(N("r1"), N("review"), N("detail")),
    e(N("r2"), N("detail"), N("viewDiff")),
    e(N("r3"), N("viewDiff"), N("comments")),
    e(N("r4"), N("comments"), N("mention")),
    e(N("r5"), N("mention"), N("notifyMention")),
  );

  // ---------- Approve chain ----------
  nodes.push(
    n(N("decApprove"), "feature", "Decision: Approve", {
      x: COL_APPROVE,
      y: 110,
    }),
    n(N("optFeedback"), "action", "Optional feedback", {
      x: COL_APPROVE,
      y: 220,
    }),
    n(N("safeCheck"), "condition", "Zero breaking changes?", {
      x: COL_APPROVE + 25,
      y: 330,
    }),
    // Yes branch (right): safe-to-approve banner
    n(N("safeBanner"), "process", "Safe to approve banner", {
      x: COL_BANNER,
      y: 340,
    }),
    // No branch (right, below safeBanner): review carefully warning
    n(N("reviewCarefully"), "process", "Review carefully (warning)", {
      x: COL_BANNER,
      y: 430,
    }),
    n(N("updateApproved"), "process", "Update status: approved", {
      x: COL_APPROVE,
      y: 490,
    }),
    n(N("notifyContrib"), "process", "Email + in-app + Telegram", {
      x: COL_APPROVE,
      y: 600,
    }),
  );
  edges.push(
    e(N("ap1"), N("detail"), N("decApprove"), { dir: "right" }),
    e(N("ap2"), N("decApprove"), N("optFeedback")),
    e(N("ap3"), N("optFeedback"), N("safeCheck")),
    e(N("ap4-yes"), N("safeCheck"), N("safeBanner"), {
      label: "Yes",
      dir: "right",
    }),
    e(N("ap4-no"), N("safeCheck"), N("reviewCarefully"), {
      label: "No",
      dir: "right",
    }),
    e(N("ap5"), N("safeCheck"), N("updateApproved")),
    e(N("ap6"), N("updateApproved"), N("notifyContrib")),
  );

  // ---------- Reject chain ----------
  nodes.push(
    n(N("decReject"), "feature", "Decision: Reject", { x: COL_REJECT, y: 110 }),
    n(N("reqReason"), "action", "Required reason", { x: COL_REJECT, y: 220 }),
    n(N("updateRejected"), "process", "Update status: rejected", {
      x: COL_REJECT,
      y: 330,
    }),
    n(N("notifyReject"), "process", "Notify contributor", {
      x: COL_REJECT,
      y: 440,
    }),
    n(N("inlineRej"), "process", "Inline rejection on Version List", {
      x: COL_REJECT,
      y: 550,
    }),
  );
  edges.push(
    e(N("rj1"), N("decApprove"), N("decReject"), { dir: "right" }),
    e(N("rj2"), N("decReject"), N("reqReason")),
    e(N("rj3"), N("reqReason"), N("updateRejected")),
    e(N("rj4"), N("updateRejected"), N("notifyReject")),
    e(N("rj5"), N("notifyReject"), N("inlineRej")),
  );

  // ---------- Notifications branch (well below the rest) ----------
  const NOTIF_Y = 750;
  nodes.push(
    n(N("notif"), "feature", "Notifications", { x: COL_CONTRIB, y: NOTIF_Y }),
    n(N("bell"), "action", "Bell dropdown: latest 5", {
      x: COL_CONTRIB,
      y: NOTIF_Y + 110,
    }),
    n(N("markRead"), "action", "Mark as read → update count", {
      x: COL_CONTRIB,
      y: NOTIF_Y + 220,
    }),
    n(N("allNotifs"), "web", "Notifications Page", {
      x: COL_STATUS,
      y: NOTIF_Y + 220,
    }),
    n(N("markAllRead"), "action", "Mark all read → badge clears", {
      x: COL_STATUS,
      y: NOTIF_Y + 330,
    }),
  );
  edges.push(
    e(N("n1"), N("notif"), N("bell")),
    e(N("n2"), N("bell"), N("markRead")),
    e(N("n3"), N("markRead"), N("allNotifs"), {
      label: "View all",
      dir: "right",
    }),
    e(N("n4"), N("allNotifs"), N("markAllRead")),
  );

  return {
    id,
    label: "6 · Workflow & Collaboration",
    width: COL_REJECT + 210 + 80,
    height: NOTIF_Y + 410,
    nodes,
    edges,
  };
}

// =====================================================================
// Section 7 — Visualization & Dashboard
// =====================================================================

function buildSection7(): SectionData {
  const id = "section-dashboard";
  const N = (k: string) => ns(id, k);
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  nodes.push(n(N("dash"), "web", "Dashboard Page", { x: 660, y: 0 }));
  const cols: {
    id: string;
    label: string;
    items: { type: NodeType; label: string }[];
  }[] = [
    {
      id: "all",
      label: "All roles",
      items: [
        { type: "process", label: "Metric cards (APIs · versions · members)" },
        { type: "process", label: "Diff preview widget" },
        { type: "action", label: "Click 'View full diff' → Compare" },
        { type: "process", label: "Recent activity feed" },
      ],
    },
    {
      id: "owner",
      label: "Owner",
      items: [
        { type: "process", label: "Breaking change stats chart" },
        { type: "process", label: "Full activity logs" },
      ],
    },
    {
      id: "contrib",
      label: "Contributor",
      items: [{ type: "process", label: "Track own submission statuses" }],
    },
    {
      id: "reviewer",
      label: "Reviewer",
      items: [
        { type: "feature", label: "Pending review panel" },
        { type: "action", label: "Approve directly from dashboard" },
        { type: "action", label: "Click 'Review' → Approval Detail" },
      ],
    },
  ];

  cols.forEach((c, i) => {
    const x = 60 + i * 320;
    nodes.push(n(N(c.id), "feature", c.label, { x, y: 130 }));
    edges.push(e(N(`e-dash-${c.id}`), N("dash"), N(c.id)));
    c.items.forEach((it, j) => {
      const subId = `${c.id}-${j}`;
      nodes.push(n(N(subId), it.type, it.label, { x, y: 230 + j * 90 }));
      const prev = j === 0 ? c.id : `${c.id}-${j - 1}`;
      edges.push(e(N(`e-${subId}`), N(prev), N(subId)));
    });
  });

  // Evolution timeline lives in a 5th column on the right, same y as Dashboard
  // so it reads as a peer flow rather than floating below all the role columns.
  const EVOL_X = 60 + 4 * 320; // = 1340
  nodes.push(
    n(N("evol"), "feature", "API Evolution Timeline", { x: EVOL_X, y: 130 }),
    n(N("evolTimeline"), "process", "All versions chronologically", {
      x: EVOL_X,
      y: 230,
    }),
    n(N("vd"), "web", "Version Detail Page", { x: EVOL_X, y: 320 }),
  );
  edges.push(
    e(N("e-evol-tl"), N("evol"), N("evolTimeline")),
    e(N("e-evol-vd"), N("evolTimeline"), N("vd"), { label: "Click version" }),
  );

  return {
    id,
    label: "7 · Visualization & Dashboard",
    width: EVOL_X + 210 + 80,
    height: 620,
    nodes,
    edges,
  };
}

// =====================================================================
// Section 8 — Additional Features
// =====================================================================

function buildSection8(): SectionData {
  const id = "section-additional";
  const N = (k: string) => ns(id, k);
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const cols: {
    id: string;
    label: string;
    chain: { type: NodeType; label: string }[];
  }[] = [
    {
      id: "hist",
      label: "Change history tracking",
      chain: [
        { type: "web", label: "Settings / History Page" },
        { type: "action", label: "Tab: Activity log" },
        { type: "process", label: "Filter by action type" },
        { type: "action", label: "Tab: Change history" },
        { type: "process", label: "Filter: breaking / non-breaking" },
        { type: "action", label: "Export as CSV" },
      ],
    },
    {
      id: "doc",
      label: "Centralized documentation",
      chain: [
        { type: "web", label: "Documentation Browser" },
        { type: "action", label: "Select version" },
        { type: "action", label: "Browse endpoints" },
        { type: "action", label: "Search by path / name" },
        { type: "action", label: "Download spec → file download" },
      ],
    },
    {
      id: "cloud",
      label: "Cloud file storage",
      chain: [
        { type: "process", label: "Generate fake file URL" },
        { type: "action", label: "Show URL in success state" },
        { type: "action", label: "Copy URL → toast" },
        { type: "action", label: "Download original (Blob)" },
      ],
    },
  ];

  cols.forEach((c, i) => {
    const x = 80 + i * 360;
    nodes.push(n(N(c.id), "feature", c.label, { x, y: 0 }));
    let prev = c.id;
    c.chain.forEach((s, j) => {
      const subId = `${c.id}-${j}`;
      nodes.push(n(N(subId), s.type, s.label, { x, y: 110 + j * 85 }));
      edges.push(e(N(`e-${subId}`), N(prev), N(subId)));
      prev = subId;
    });
  });

  const tallest = Math.max(...cols.map((c) => c.chain.length));
  return {
    id,
    label: "8 · Additional Features",
    width: 1240,
    height: 110 + tallest * 85 + 80,
    nodes,
    edges,
  };
}

// =====================================================================
// Section 9 — AI Integration
// =====================================================================

function buildSection9(): SectionData {
  const id = "section-ai";
  const N = (k: string) => ns(id, k);
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const cols: {
    id: string;
    label: string;
    chain: { type: NodeType; label: string }[];
  }[] = [
    {
      id: "summarize",
      label: "AI: Summarize API docs",
      chain: [
        { type: "web", label: "Version Detail Page" },
        { type: "process", label: "Part 1: What this API does" },
        { type: "process", label: "Part 2: Key endpoints list" },
        { type: "process", label: "Part 3: Changes from previous" },
        { type: "action", label: "Click 'Regenerate'" },
        { type: "process", label: "1s loading → same content" },
      ],
    },
    {
      id: "explain",
      label: "AI: Explain API changes",
      chain: [
        { type: "web", label: "Compare / Diff Page" },
        { type: "process", label: "Most impactful change (amber)" },
        { type: "process", label: "Part 1: Summary count" },
        { type: "process", label: "Part 2: Per-change callouts" },
        { type: "process", label: "Impact dot (high/med/low)" },
        { type: "process", label: "Part 3: Plain-language summary" },
        { type: "action", label: "Click 'Regenerate'" },
      ],
    },
  ];

  cols.forEach((c, i) => {
    const x = 100 + i * 400;
    nodes.push(n(N(c.id), "feature", c.label, { x, y: 0 }));
    let prev = c.id;
    c.chain.forEach((s, j) => {
      const subId = `${c.id}-${j}`;
      nodes.push(n(N(subId), s.type, s.label, { x, y: 110 + j * 85 }));
      edges.push(e(N(`e-${subId}`), N(prev), N(subId)));
      prev = subId;
    });
  });

  const tallest = Math.max(...cols.map((c) => c.chain.length));
  return {
    id,
    label: "9 · AI Integration",
    width: 900,
    height: 110 + tallest * 85 + 80,
    nodes,
    edges,
  };
}

// =====================================================================
// Public API
// =====================================================================

export const SECTIONS: SectionData[] = [
  buildSection1(),
  buildSection2(),
  buildSection3(),
  buildSection4(),
  buildSection5(),
  buildSection6(),
  buildSection7(),
  buildSection8(),
  buildSection9(),
];

const SECTION_HEADER_OFFSET = 60;
const SECTION_GAP = 140;

export function buildDiagram(): {
  nodes: Node[];
  edges: Edge[];
  sectionAnchors: { id: string; label: string; y: number; height: number }[];
  totalHeight: number;
  totalWidth: number;
} {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const sectionAnchors: {
    id: string;
    label: string;
    y: number;
    height: number;
  }[] = [];
  let cursorY = 0;
  let totalWidth = 0;

  for (const s of SECTIONS) {
    const sectionTopY = cursorY;
    sectionAnchors.push({
      id: s.id,
      label: s.label,
      y: sectionTopY,
      height: s.height,
    });

    nodes.push({
      id: `${s.id}:__header`,
      type: "section",
      position: { x: 0, y: sectionTopY },
      data: { label: s.label, width: s.width },
      draggable: false,
      selectable: false,
    });

    const yShift = sectionTopY + SECTION_HEADER_OFFSET;
    for (const sn of s.nodes) {
      nodes.push({
        ...sn,
        position: { x: sn.position.x, y: sn.position.y + yShift },
      });
    }
    edges.push(...s.edges);

    cursorY = sectionTopY + SECTION_HEADER_OFFSET + s.height + SECTION_GAP;
    if (s.width > totalWidth) totalWidth = s.width;
  }

  return {
    nodes,
    edges,
    sectionAnchors,
    totalHeight: cursorY,
    totalWidth,
  };
}
