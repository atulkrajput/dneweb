# DNE Consultants — Business Operating System

> A lightweight business OS built on top of the existing DNE Consultants website.  
> Transforms the admin panel into a full lead-to-payment pipeline for an IT consulting company.

---

## Tech Stack

- **Backend:** Laravel 12, PHP 8.2+
- **Frontend:** React 18, Inertia.js v2, Tailwind CSS 3
- **UI:** shadcn/ui (Radix primitives), Lucide icons, Framer Motion
- **Database:** SQLite (default), MySQL/PostgreSQL supported
- **Build:** Vite 7
- **Auth:** Laravel Breeze (session-based) + custom role system

---

## Business Workflow

```
Visitor → Lead → Qualified → Proposal → Client → Project → Tasks → Invoice → Payment → Completed
```

---

## Phases Overview

| # | Phase | Description |
|---|-------|-------------|
| 1 | Lead Management | Contact form → auto-lead, status pipeline, activity timeline |
| 2 | Campaign Tracking | UTM/GCLID/FBCLID capture, referrer, device, campaign analytics |
| 3 | Clients | Convert won leads, full client profiles |
| 4 | Projects | Client projects with budget, team, progress, deadlines |
| 5 | Tasks | Kanban board, assignees, checklists, comments, hours |
| 6 | Invoices & Payments | Line items, auto-totals, payment recording, auto-status |
| 7 | Proposals | Services, deliverables, pricing, accept → auto-create project |
| 8 | Internal Notes | Polymorphic notes on leads, clients, projects, tasks, invoices |
| 9 | Dashboard | Full business metrics, revenue chart, lead funnel, activity feed |
| 10 | Notifications | Database notifications, bell badge, deadline reminders |
| 11 | User Roles | 5 roles, policies, gated sidebar, user management |
| 12 | Reports | Leads, Revenue, Projects, Productivity + CSV export |

---

## Database Schema

### New Tables (Phases 1–12)

| Table | Purpose | Key Relations |
|-------|---------|---------------|
| `leads` | Lead pipeline with tracking data | → contacts, → clients |
| `lead_activities` | Activity timeline per lead | → leads, → users |
| `clients` | Client profiles | → leads, → projects |
| `projects` | Project management | → clients, → tasks |
| `tasks` | Task management with Kanban | → projects, → team_members |
| `task_comments` | Comments on tasks | → tasks, → users |
| `invoices` | Billing with line items | → clients, → projects, → payments |
| `payments` | Payment records | → invoices |
| `proposals` | Proposals with pricing | → leads, → clients |
| `notes` | Polymorphic internal notes | → any notable model, → users |
| `notifications` | Laravel notifications | → users |

### Modified Tables

| Table | Changes |
|-------|---------|
| `users` | Added `role` column (super_admin, sales, project_manager, developer, accountant) |

---

## Models & Relationships

### Lead
- `belongsTo` Contact
- `hasOne` Client
- `hasMany` LeadActivity
- `morphMany` Notes (via HasNotes trait)
- Statuses: new → contacted → qualified → proposal_sent → negotiation → won / lost
- Tracking fields: utm_source, utm_medium, utm_campaign, utm_content, utm_term, gclid, fbclid, msclkid, landing_url, referrer, browser, device, ip_address, first_visit_at, last_visit_at

### Client
- `belongsTo` Lead
- `hasMany` Projects
- `morphMany` Notes
- Statuses: active, inactive, churned

### Project
- `belongsTo` Client
- `hasMany` Tasks
- `morphMany` Notes
- Statuses: planning → in_progress → review → testing → completed / on_hold / cancelled
- Priorities: low, medium, high, urgent
- JSON fields: services, assigned_team, tags

### Task
- `belongsTo` Project
- `belongsTo` TeamMember (assignee)
- `hasMany` TaskComment
- `morphMany` Notes
- Statuses: todo → in_progress → review → done
- JSON field: checklist [{text, done}]

### Invoice
- `belongsTo` Client
- `belongsTo` Project (optional)
- `hasMany` Payments
- `morphMany` Notes
- Statuses: draft → sent → paid / overdue / cancelled
- Auto-number: INV-YYYY-NNNN
- JSON field: items [{description, qty, rate, amount}]
- Computed: paid_amount, outstanding

### Proposal
- `belongsTo` Lead (optional)
- `belongsTo` Client (optional)
- Statuses: draft → sent → accepted / rejected
- Auto-number: PROP-YYYY-NNNN
- JSON fields: services, deliverables, pricing [{description, amount}]
- Accept action auto-creates Project

### Note (Polymorphic)
- `morphTo` notable (Lead, Client, Project, Task, Invoice)
- `belongsTo` User
- Reusable `HasNotes` trait applied to all notable models

### Payment
- `belongsTo` Invoice
- Methods: bank_transfer, card, paypal, cash, other

---

## User Roles & Permissions

| Role | Access |
|------|--------|
| **Super Admin** | Everything (bypasses all gates) |
| **Sales** | Leads, Clients, Proposals, Invoices, Campaigns |
| **Project Manager** | Leads, Clients, Proposals, Projects, Tasks, Services, Team |
| **Developer** | Projects, Tasks |
| **Accountant** | Clients, Invoices |

### Policies
- `LeadPolicy` — create/update (sales), delete (super_admin)
- `ClientPolicy` — view (sales, PM, accountant), create (sales), delete (super_admin)
- `ProjectPolicy` — view (PM, developer), create/update (PM), delete (super_admin)
- `ProposalPolicy` — create/update (sales, PM), delete (super_admin)
- `InvoicePolicy` — create/update (accountant, sales), delete (super_admin)

### Gate
- `manage-users` — super_admin only
- `Gate::before` — super_admin bypasses all checks

---

## Notifications

| Event | Notification | Channel |
|-------|-------------|---------|
| Contact form submitted | `NewLeadNotification` | database |
| Proposal accepted | `ProposalAcceptedNotification` | database |
| Invoice fully paid | `InvoicePaidNotification` | database |
| Project completed | `ProjectCompletedNotification` | database |
| Deadline tomorrow | `DeadlineTomorrowNotification` | database (scheduled) |
| Task assigned | `TaskAssignedNotification` | database (ready for use) |

### Scheduled Command
```bash
php artisan reminders:deadlines  # Run daily at 09:00
```

---

## Campaign Tracking

### Client-Side (JavaScript)
- `resources/js/lib/tracking.js` — auto-initializes on every page load
- Captures on first visit: landing URL, referrer, UTM params, click IDs, browser, device
- Stores in `sessionStorage`, attaches to contact form via Inertia `transform()`

### Server-Side
- IP address captured via `$request->ip()`
- All tracking fields stored on the Lead record
- Campaign Analytics page aggregates by source, medium, campaign, landing page, device, browser

---

## Reports & Export

| Report | URL | Metrics |
|--------|-----|---------|
| Leads | `/admin/reports/leads` | Total, by status, by source, date filter |
| Revenue | `/admin/reports/revenue` | Invoiced, paid, outstanding, by month, by client |
| Projects | `/admin/reports/projects` | Total, budget, progress, overdue, by status |
| Productivity | `/admin/reports/productivity` | Tasks, completion rate, hours, team performance |

### Export
- CSV export via `?export=csv` query parameter
- Streamed download (no temp files)
- Filename: `{report}_{date}.csv`

---

## Admin Sidebar Navigation

```
Dashboard
Leads
Clients
Proposals
Projects
Tasks
Invoices
Campaigns
Reports
Services
Team Members
Contacts
Users (super_admin only)
Settings (super_admin only)
─────────
🔔 Notifications (with unread badge)
Logout
← View Site
```

Navigation items are filtered per user role via `canAccess(module)`.

---

## Key Controllers

| Controller | Namespace | Purpose |
|-----------|-----------|---------|
| `DashboardController` | Admin | Business metrics dashboard |
| `LeadController` | Admin | Lead CRUD + search/filter |
| `ClientController` | Admin | Client CRUD + lead conversion |
| `ProjectController` | Admin | Project CRUD + completion notifications |
| `TaskController` | Admin | Kanban + CRUD + status updates + comments |
| `InvoiceController` | Admin | Invoice CRUD + payment recording |
| `ProposalController` | Admin | Proposal CRUD + accept → project |
| `CampaignController` | Admin | Campaign analytics |
| `ReportController` | Admin | Reports + CSV export |
| `NoteController` | Admin | Polymorphic notes CRUD |
| `NotificationController` | Admin | Notification list + mark read |
| `UserController` | Admin | User management (super_admin) |
| `ContactFormController` | Public | Contact form → lead + notification |

---

## Reusable Components

| Component | Path | Usage |
|-----------|------|-------|
| `NotesSection` | `Components/NotesSection.jsx` | Embedded in Lead/Client/Project/Task/Invoice Show pages |
| `AdminLayout` | `Layouts/AdminLayout.jsx` | Admin shell with role-filtered sidebar + notification bell |
| `tracking.js` | `lib/tracking.js` | Auto-captures UTM/device data on all pages |

---

## Migrations (in order)

```
000030 - create_leads_table
000031 - create_lead_activities_table
000032 - add_tracking_fields_to_leads_table
000033 - create_clients_table
000034 - create_projects_table
000035 - create_tasks_table
000036 - create_task_comments_table
000037 - create_invoices_table
000038 - create_payments_table
000039 - create_proposals_table
000040 - create_notes_table
000041 - add_role_to_users_table
(auto)  - create_notifications_table
```

---

## Commands

```bash
# Development
composer dev                    # All services (server + queue + logs + vite)
php artisan serve               # Laravel server only
npm run dev                     # Vite HMR

# Production
npm run build                   # Build frontend
php artisan migrate             # Run migrations
php artisan config:cache        # Cache config
php artisan route:cache         # Cache routes

# Scheduled Tasks
php artisan reminders:deadlines # Deadline notifications (run daily)

# Testing
php artisan test                # Run test suite
```

---

## File Structure (New/Modified)

```
app/
├── Console/Commands/
│   └── SendDeadlineReminders.php
├── Http/Controllers/
│   ├── ContactFormController.php (modified)
│   └── Admin/
│       ├── CampaignController.php
│       ├── ClientController.php
│       ├── DashboardController.php (modified)
│       ├── InvoiceController.php
│       ├── LeadController.php
│       ├── NoteController.php
│       ├── NotificationController.php
│       ├── ProjectController.php
│       ├── ProposalController.php
│       ├── ReportController.php
│       ├── TaskController.php
│       └── UserController.php
├── Models/
│   ├── Client.php
│   ├── Concerns/HasNotes.php
│   ├── Invoice.php
│   ├── Lead.php
│   ├── LeadActivity.php
│   ├── Note.php
│   ├── Payment.php
│   ├── Project.php
│   ├── Proposal.php
│   ├── Task.php
│   ├── TaskComment.php
│   └── User.php (modified)
├── Notifications/
│   ├── DeadlineTomorrowNotification.php
│   ├── InvoicePaidNotification.php
│   ├── NewLeadNotification.php
│   ├── ProjectCompletedNotification.php
│   ├── ProposalAcceptedNotification.php
│   └── TaskAssignedNotification.php
├── Policies/
│   ├── ClientPolicy.php
│   ├── InvoicePolicy.php
│   ├── LeadPolicy.php
│   ├── ProjectPolicy.php
│   └── ProposalPolicy.php
└── Providers/
    └── AppServiceProvider.php (modified)

resources/js/
├── Components/
│   └── NotesSection.jsx
├── Layouts/
│   └── AdminLayout.jsx (modified)
├── Pages/Admin/
│   ├── Campaigns/Index.jsx
│   ├── Clients/{Index,Create,Show}.jsx
│   ├── Dashboard.jsx (rebuilt)
│   ├── Invoices/{Index,Create,Show}.jsx
│   ├── Leads/{Index,Create,Show}.jsx
│   ├── Notifications/Index.jsx
│   ├── Projects/{Index,Create,Show}.jsx
│   ├── Proposals/{Index,Create,Show}.jsx
│   ├── Reports/{Index,Leads,Revenue,Projects,Productivity}.jsx
│   ├── Tasks/{Index,Show}.jsx
│   └── Users/Index.jsx
├── lib/
│   └── tracking.js
└── app.jsx (modified)
```

---

## Default Credentials

- **URL:** `/admin`
- **Email:** `admin@dneconsultants.com`
- **Password:** `password`
- **Role:** Super Admin

---

## Future Considerations

- Email notifications (add `mail` channel to notification classes)
- PDF invoice generation (add `barryvdh/laravel-dompdf`)
- File attachments on tasks/projects (add `spatie/laravel-medialibrary`)
- API endpoints for mobile app
- Two-factor authentication
- Audit log (model observer for all changes)
- Client portal (read-only view for clients)
- Time tracking (real-time timer on tasks)
- Recurring invoices
- Email templates for proposals/invoices
