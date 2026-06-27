# Database Schema

## Overview

SQLite database with 10 tables (3 from Laravel core, 7 custom application tables).

## Tables

### settings
Key-value store for all site configuration.

| Column | Type | Description |
|--------|------|-------------|
| id | integer (PK) | Auto-increment |
| group | string | Category: general, social, tracking, contact |
| key | string (unique) | Setting identifier |
| value | text (nullable) | Setting value |
| created_at | timestamp | |
| updated_at | timestamp | |

**Seeded Keys:**
- `contact_email` — Main contact email
- `company_location` — Company headquarters
- `facebook_url`, `instagram_url`, `linkedin_url`, `twitter_url` — Social links
- `footer_tagline` — Footer brand message
- `ga4_id` — Google Analytics 4 Measurement ID
- `gtm_id` — Google Tag Manager container ID
- `meta_pixel` — Meta/Facebook Pixel ID
- `header_scripts` — Custom scripts injected in `<head>`
- `footer_scripts` — Custom scripts injected before `</body>`

---

### services
Service offerings displayed on Services page and Home page preview.

| Column | Type | Description |
|--------|------|-------------|
| id | integer (PK) | Auto-increment |
| slug | string (unique) | URL-friendly identifier |
| tag | string | Section label (e.g., "01 / AUTOMATION-FIRST") |
| title | string | Service title |
| subtitle | string | Short subtitle |
| description | text | Full description |
| checklist | json (nullable) | Array of checklist items |
| callout | text (nullable) | "Who this is for" text |
| image | string (nullable) | Image URL |
| button_text | string | CTA button text |
| button_link | string | CTA button link |
| icon | string (nullable) | Lucide icon name |
| sort_order | integer | Display order |
| is_active | boolean | Visibility toggle |
| created_at | timestamp | |
| updated_at | timestamp | |

---

### team_members
Team members displayed on the About page.

| Column | Type | Description |
|--------|------|-------------|
| id | integer (PK) | Auto-increment |
| name | string | Full name |
| role | string | Job title |
| bio | text (nullable) | Short biography |
| photo | string (nullable) | Photo URL/path |
| sort_order | integer | Display order |
| is_active | boolean | Visibility toggle |
| created_at | timestamp | |
| updated_at | timestamp | |

---

### testimonials
Client testimonials (ready for future use).

| Column | Type | Description |
|--------|------|-------------|
| id | integer (PK) | Auto-increment |
| author | string | Author name |
| company | string (nullable) | Company name |
| role | string (nullable) | Author role |
| quote | text | Testimonial text |
| rating | tinyint | 1-5 star rating |
| photo | string (nullable) | Author photo |
| sort_order | integer | Display order |
| is_active | boolean | Visibility toggle |
| created_at | timestamp | |
| updated_at | timestamp | |

---

### faqs
Frequently asked questions (ready for future use).

| Column | Type | Description |
|--------|------|-------------|
| id | integer (PK) | Auto-increment |
| question | string | FAQ question |
| answer | text | FAQ answer |
| category | string | Category grouping |
| sort_order | integer | Display order |
| is_active | boolean | Visibility toggle |
| created_at | timestamp | |
| updated_at | timestamp | |

---

### pages
Per-page SEO metadata and flexible content storage.

| Column | Type | Description |
|--------|------|-------------|
| id | integer (PK) | Auto-increment |
| slug | string (unique) | Page identifier (home, services, about, contact) |
| meta_title | string (nullable) | SEO title tag |
| meta_description | text (nullable) | SEO meta description |
| og_image | string (nullable) | Open Graph image URL |
| content | json (nullable) | Flexible page-specific content |
| created_at | timestamp | |
| updated_at | timestamp | |

---

### contacts
Contact form submissions.

| Column | Type | Description |
|--------|------|-------------|
| id | integer (PK) | Auto-increment |
| full_name | string | Submitter name |
| email | string | Submitter email |
| company | string (nullable) | Company name |
| inquiry_type | string | Service category of interest |
| message | text (nullable) | Message content |
| is_read | boolean | Read status for admin |
| created_at | timestamp | |
| updated_at | timestamp | |

---

## Laravel Core Tables

- **users** — Admin authentication (email: admin@dneconsultants.com, password: password)
- **cache** — Framework cache
- **jobs** / **job_batches** / **failed_jobs** — Queue system

## Relationships

The schema is intentionally flat with no foreign key relationships between content tables, keeping it simple for a content-managed website. Settings use a key-value pattern for maximum flexibility.
