# APILens

Project-based API version management & collaboration platform — fully static Next.js frontend with hardcoded mock data.

## Tech stack

- Next.js 16 (App Router) + React 19
- Tailwind CSS v4
- Zustand for global state (mock data lives in memory)
- React Hook Form + Zod for forms & validation
- Lucide React for icons
- Sonner for toasts
- Custom shadcn-style UI primitives (Button, Card, Dialog, etc.)

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000 — you'll be redirected to `/projects`.

## Routes

- `/sign-up`, `/sign-in`, `/forgot-password`, `/verify-email` — fake auth (just navigate on submit)
- `/projects` — project list (create / open)
- `/projects/[id]/dashboard` — metrics, activity, role-specific panels
- `/projects/[id]/api-management` — file list (download / delete)
- `/projects/[id]/api-management/upload` — drag-drop or URL → version metadata
- `/projects/[id]/api-management/versions` — version table with status badges
- `/projects/[id]/api-management/versions/[versionId]` — endpoint detail + AI summary
- `/projects/[id]/compare` — diff viewer + AI explanation + Submit for review
- `/projects/[id]/workflow` — approval queue (role-aware actions)
- `/projects/[id]/workflow/[approvalId]` — approval detail with comments + approve/reject
- `/projects/[id]/notifications` — notification list with mark-as-read
- `/projects/[id]/settings` — owner-only project settings + delete
- `/projects/[id]/settings/members` — invite, change roles, remove
- `/projects/[id]/settings/history` — activity log + change history
- `/profile` — edit name, telegram toggle, change password

## Role switcher

Use the **Role** dropdown in the top nav (right side, before the bell) to switch between Owner / Contributor / Reviewer. The sidebar and page-level UI react instantly:

- **Owner** — full access including Settings + breaking-changes overview
- **Contributor** — Upload, Compare → Submit for review, see own submissions
- **Reviewer** — Pending approvals, Approve / Reject with reasons

## Data model

All mock data lives in `lib/mock-data.ts`. The Zustand store in `lib/store.ts` exposes mutators that:

- Update relevant slices (projects, versions, approvals, etc.)
- Append a new entry to `activities` for every mutation
- Trigger appropriate notifications when relevant
