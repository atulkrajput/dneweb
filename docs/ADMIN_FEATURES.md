# Admin Panel Features

## Access

- **URL:** `/admin`
- **Login:** `/login`
- **Default Credentials:** admin@dneconsultants.com / password
- **Auth:** Laravel Breeze session-based authentication
- **Protection:** `auth` + `verified` middleware on all admin routes

## Dashboard (`/admin`)

- Total contacts count
- Unread messages count
- Total services count
- Total team members count
- Recent 5 contact submissions with quick view links
- Unread indicator (orange dot) on new messages

## Services Management (`/admin/services`)

- **List view:** Table with sort order, title, subtitle, active status
- **Create:** Full form with all fields
- **Edit:** Pre-populated form
- **Delete:** Confirmation dialog

### Fields:
- Slug (unique URL identifier)
- Tag (section label, e.g., "01 / AUTOMATION-FIRST")
- Title, Subtitle, Description
- Checklist (dynamic add/remove items)
- Callout text
- Image URL
- Button text and link
- Icon name (Lucide icon)
- Sort order
- Active/Inactive toggle

## Team Members (`/admin/team`)

- **Grid view:** Card layout with photo, name, role, bio
- **Create/Edit:** Form with all fields
- **Delete:** Confirmation dialog

### Fields:
- Name, Role, Bio
- Photo URL
- Sort order
- Active/Inactive toggle

## Contacts (`/admin/contacts`)

- **List view:** Table with name, email, inquiry type, date
- Unread messages highlighted with primary background
- Unread dot indicator
- **Detail view:** Full message display with all fields
- **Delete:** Confirmation dialog
- Pagination (20 per page)
- Auto-marks as read when viewed

## Site Settings (`/admin/settings`)

Tabbed interface with 4 sections:

### General Tab
- Footer tagline

### Contact Tab
- Contact email address
- Company location

### Social Media Tab
- Facebook URL
- Instagram URL
- LinkedIn URL
- Twitter/X URL

### Tracking & Analytics Tab
- Google Analytics 4 Measurement ID (G-XXXXXXXXXX)
- Google Tag Manager container ID (GTM-XXXXXXX)
- Meta/Facebook Pixel ID
- Custom Header Scripts (injected in `<head>`)
- Custom Footer Scripts (injected before `</body>`)

## Tracking Script Injection

Scripts are injected globally via the Blade template (`app.blade.php`):
- GA4: Async tag + config script
- GTM: Container script in head + noscript iframe in body
- Meta Pixel: fbevents.js initialization
- Custom scripts: Raw HTML injection (header/footer)

**No code deployment needed** — all tracking changes are immediate from admin panel.

## Navigation

Sidebar navigation with:
- Dashboard
- Services
- Team Members
- Contacts
- Settings
- Logout
- "View Site" link to homepage

Mobile-responsive with hamburger menu toggle.

## Admin UI

- Uses same dark theme as public site
- Consistent form styling (.form-input, .form-label)
- Card-based layouts
- Toast notifications for success/error states
- Loading states on form submissions
