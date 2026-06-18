# DNE Consultants — Website

Production-ready company website built with Laravel 12 + React (Inertia.js). Dynamic content managed from a built-in admin panel.

## Tech Stack

- **Backend:** Laravel 12, PHP 8.2+
- **Frontend:** React 18, Inertia.js, Tailwind CSS 3
- **Animations:** Framer Motion
- **UI Components:** shadcn/ui (Radix primitives)
- **Database:** SQLite (default), MySQL/PostgreSQL supported
- **Build:** Vite 7
- **Auth:** Laravel Breeze (session-based)

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
- **Default login:** `admin@dnetechnology.com` / `password`

### Admin Features

- Dashboard with stats and recent contacts
- Services management (CRUD)
- Team members management (CRUD)
- Contact form submissions (view, mark read, delete)
- Site settings (contact info, social links, footer)
- Tracking & Analytics (GA4, GTM, Meta Pixel, custom scripts)

## Project Structure

```
app/
├── Http/Controllers/
│   ├── PageController.php          # Public pages
│   ├── ContactFormController.php   # Contact form handler
│   └── Admin/                      # Admin CRUD controllers
├── Models/                         # Eloquent models
resources/
├── js/
│   ├── Components/                 # Shared React components
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   └── ui/                     # shadcn/ui components
│   ├── Layouts/                    # Page layouts
│   ├── Pages/                      # Inertia pages
│   │   ├── Home.jsx
│   │   ├── Services.jsx
│   │   ├── About.jsx
│   │   ├── Contact.jsx
│   │   └── Admin/                  # Admin panel pages
│   └── lib/utils.js                # Utility functions
├── css/app.css                     # Tailwind + theme
├── views/app.blade.php             # Root template + tracking
database/
├── migrations/                     # All table schemas
├── seeders/                        # Default content seeder
public/
├── favicon.ico                     # Browser icon
├── icon.png                        # App icon (192px)
├── logo.png                        # Full logo (OG/SEO)
├── logo-white.png                  # White logo (dark backgrounds)
├── logo.svg                        # Vector logo
docs/
├── MIGRATION_REPORT.md
├── DATABASE_SCHEMA.md
├── ADMIN_FEATURES.md
```

## Public Pages

| Route | Page |
|-------|------|
| `/` | Homepage — hero, capabilities, stats, services preview, CTA |
| `/services` | Services — detailed service sections with checklists |
| `/about` | About — story, values, team, stats |
| `/contact` | Contact — form (saves to DB), info, process steps |

## Dynamic Content

All content is database-driven and managed from the admin panel:
- Services (title, description, checklist, images, CTA)
- Team members (name, role, bio, photo)
- Site settings (email, location, social links, tagline)
- SEO metadata (per-page titles and descriptions)
- Tracking codes (GA4, GTM, Meta Pixel, custom scripts)
- Contact submissions (stored, viewable in admin)

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

# Testing
php artisan test         # Run PHPUnit tests
```

## Environment Variables

Key variables in `.env`:

```
APP_NAME="DNE Consultants"
APP_URL=http://localhost
DB_CONNECTION=sqlite
```

Tracking codes are managed from the admin panel (no env vars needed).

## License

Proprietary — DNE Technology Consultants.
