# DNE Consultants — Website & Business OS

Production-ready company website with a full-featured admin panel (CRM, project management, invoicing, proposals, and more). Built with Laravel 12 + React (Inertia.js).

## Tech Stack

- **Backend:** Laravel 12, PHP 8.2+
- **Frontend:** React 18, Inertia.js, Tailwind CSS 3
- **Animations:** Framer Motion
- **UI Components:** shadcn/ui (Radix primitives)
- **Database:** MySQL (default), SQLite/PostgreSQL supported
- **Build:** Vite 7
- **Auth:** Laravel Breeze (session-based)
- **Email:** Resend API (transactional emails with branded templates)
- **Captcha:** Google reCAPTCHA v3 (invisible bot protection)

## Homepage Hero Animation

The landing page features an interactive tech-network globe animation built with SVG + Framer Motion:

- **3D wireframe globe** at the center with rotating meridians, latitude lines, and orbiting data particles
- **8 floating tech nodes** (AI, Automation, Cloud, Web, Security, Data, Code, Compute) arranged in a circle around the globe
- **Twinkling star field** background for a modern space/tech aesthetic
- **"DNE — Connecting Your Ecosystem"** text centered inside the globe
- Fully responsive and works in both **light and dark mode** using CSS custom properties
- No canvas — pure SVG + HTML for reliable cross-browser centering and scaling

The animation component lives at `resources/js/Components/TechNetworkAnimation.jsx`.

## Quick Start

```bash
# Install PHP dependencies
composer install

# Install JS dependencies
npm install

# Setup environment
cp .env.example .env
php artisan key:generate

# Run migrations and seed default content
php artisan migrate --seed

# Build frontend assets
npm run build

# Start development server
php artisan serve
```

For concurrent dev (server + vite HMR + queue + logs):
```bash
composer dev
```

## Admin Panel

- **URL:** `/admin`
- **Default login:** `admin@dneconsultants.com` / `password`

---

## Admin Features

### Dashboard
- Pipeline overview (new leads, qualified, won)
- Monthly revenue stats
- Recent activity feed
- Quick-access navigation to all modules

### Lead Management (CRM)
- Full lead pipeline: **New → Contacted → Qualified → Proposal Sent → Negotiation → Won / Lost**
- One-click status transitions with action buttons:
  - New: "Approve & Contact" or "Reject"
  - Contacted: "Qualified" or "Lost"
  - Qualified: "Proposal Sent" or "Lost"
  - Proposal Sent: "Negotiation" or "Lost"
  - Negotiation: "Won" or "Lost"
- Lead activity timeline with full audit trail
- Campaign tracking (UTM source, medium, campaign, landing page, referrer, device, IP)
- Internal notes (polymorphic)
- Convert won leads to clients
- Search and filter by status
- Manual lead creation

### Client Management
- Client profiles with company details
- Linked leads and projects
- Active/inactive status
- Contact history

### Proposals
- Create proposals linked to leads or clients
- Pricing breakdown with line items
- Services, deliverables, timeline, terms
- Auto-generated proposal numbers (PROP-YYYY-XXXX)
- **Send proposal via email** (branded template with full details)
- **Accept button in email** (signed URL — client accepts without logging in)
- Auto-creates project on acceptance
- Status flow: Draft → Sent → Accepted / Rejected
- Only shows eligible leads (Contacted, Qualified, Proposal Sent)

### Project Management
- Project creation (manual or from accepted proposals)
- Client-linked projects
- Sprint management (create, start, complete)
- Budget tracking
- Status: Planning → Active → On Hold → Completed → Cancelled
- Priority levels

### Task Management
- Task board with status tracking
- Assignee management (team members)
- Task comments
- Sprint-linked tasks
- Status updates (quick patch)

### Invoicing
- Invoice creation linked to clients
- Payment tracking (partial/full)
- Status: Draft → Sent → Paid → Overdue → Cancelled
- Invoice line items

### Campaign Analytics
- UTM tracking across all leads
- Source/medium/campaign breakdown
- Landing page and referrer data
- Device and browser analytics

### Reports
- Lead reports (pipeline, conversion rates)
- Revenue reports (monthly, by client)
- Project reports (status, budget utilization)
- Productivity reports (tasks, team performance)

### Services Management
- CRUD for service offerings
- Service details: title, description, checklist, callout, image, CTA
- Icon selection, sort ordering
- Active/inactive toggle

### Team Members
- Full CRUD with photo upload
- Role-based access: Super Admin, Sales, Project Manager, Developer, Accountant
- **Send welcome email option** (branded email with login credentials on creation)
- Bio, position, sort order, active status

### Partners Management
- Partner logos and details
- Sort ordering

### Testimonials
- Client testimonials with photos
- Company, role, rating

### Products / SaaS Showcase
- Product pages with features, screenshots, pricing
- Product interest tracking (visitor sign-ups)

### Legal Pages
- Privacy Policy, Terms of Service (rich text editor)
- SEO metadata per page

### Notifications
- In-app notification center
- Notification types: New Lead, Task Assigned, Invoice Paid, Project Completed, Proposal Accepted, Deadline Reminders
- Mark as read / mark all read

### Settings (Super Admin only)
- Contact info (email, location)
- Social links (Facebook, Instagram, LinkedIn, X)
- Footer tagline
- Page toggles (show/hide team on About)
- Tracking & Analytics (GA4, GTM, Meta Pixel, custom header/footer scripts)

### Maintenance (Super Admin only)
- **Clear Cache** — config, route, view, and general cache (one click)
- **Error Log** — view size, last modified, download, or clear

---

## Email System (Resend API)

All emails use branded HTML templates with:
- DNE logo header (dark background)
- Clean, responsive body
- Footer with social links, address (Vancouver, BC, Canada), contact email, copyright

### Email Templates

| Email | Trigger | Recipient |
|-------|---------|-----------|
| Contact Thank You | Contact form submission | User |
| Contact Admin Notification | Contact form submission | letsbuild@dneconsultants.com |
| Proposal | Admin sends proposal | Lead/Client |
| Team Welcome | New team member created (optional) | Team member |
| Password Reset | Forgot password | User |

---

## Security

- **reCAPTCHA v3** on contact form (invisible, score-based bot filtering)
- **Signed URLs** for proposal acceptance (tamper-proof, no auth required)
- Role-based access control (5 roles with module-level permissions)
- Super Admin-only access to Settings and Maintenance
- Laravel CSRF protection on all forms
- Input validation on all endpoints

---

## Role-Based Access

| Module | Super Admin | Sales | Project Manager | Developer | Accountant |
|--------|:-----------:|:-----:|:---------------:|:---------:|:----------:|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| Leads | ✅ | ✅ | ✅ | — | — |
| Clients | ✅ | ✅ | ✅ | — | ✅ |
| Proposals | ✅ | ✅ | ✅ | — | — |
| Projects | ✅ | — | ✅ | ✅ | — |
| Tasks | ✅ | — | ✅ | ✅ | — |
| Invoices | ✅ | ✅ | — | — | ✅ |
| Campaigns | ✅ | ✅ | — | — | — |
| Reports | ✅ | ✅ | ✅ | ✅ | ✅ |
| Services | ✅ | — | ✅ | — | — |
| Team | ✅ | — | ✅ | — | — |
| Settings | ✅ | — | — | — | — |
| Maintenance | ✅ | — | — | — | — |

---

## Public Pages

| Route | Page |
|-------|------|
| `/` | Homepage — tech-network globe animation, capabilities, stats, services preview, CTA |
| `/services` | Services — detailed service sections with checklists |
| `/about` | About — story, values, team, stats |
| `/contact` | Contact — form with reCAPTCHA, info, process steps |
| `/products` | Products — SaaS product showcase |
| `/products/{slug}` | Product detail page |
| `/page/{slug}` | Legal pages (privacy, terms) |
| `/sitemap.xml` | Auto-generated sitemap |

---

## Environment Variables

Key variables in `.env`:

```env
APP_NAME="DNE Consultants"
APP_URL=https://dneconsultants.com

# Database
DB_CONNECTION=mysql
DB_DATABASE=dne

# Mail (Resend)
MAIL_MAILER=resend
MAIL_FROM_ADDRESS="noreply@email.dneconsultants.com"
RESEND_API_KEY=re_xxxxxxxxxxxxx

# reCAPTCHA v3
RECAPTCHA_SITE_KEY=6Lc...
RECAPTCHA_SECRET_KEY=6Lc...
```

---

## Commands

```bash
# Development
npm run dev              # Vite dev server with HMR
php artisan serve        # Laravel dev server
composer dev             # All services concurrently

# Production
npm run build            # Build optimized assets
php artisan migrate      # Run migrations
php artisan db:seed      # Seed default content
php artisan config:cache # Cache configuration
php artisan route:cache  # Cache routes

# Email Testing
php artisan mail:test-contact email@example.com   # Send test contact emails

# Maintenance (also available in admin panel)
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# Testing
php artisan test         # Run PHPUnit tests
```

---

## License

Proprietary — DNE Technology Consultants.
