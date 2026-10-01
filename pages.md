# Page routes

These 63 routes come from `src/routes/**/+page.svelte`. Bracketed segments are dynamic parameters; `[...key]` matches the remaining path segments.

```text
/
/about
/apply
/auth/callback
/auth/reset-password
/committee-of-management
/contact
/cookies
/events/[slug]
/faq
/founder
/founder/activity
/founder/applicants
/founder/application
/founder/companies
/founder/jobs
/founder/jobs/[id]
/founder/settings
/founder/support
/founder/users
/governing-body
/incubated-startups
/incubated-startups/[slug]
/incubated-startups/[slug]/[startupSlug]
/incubation
/incubation/[slug]
/login
/mentors
/opportunities
/opportunities/[id]
/opportunities/events
/opportunities/startup-jobs
/opportunities/tic-jobs
/privacy
/programs
/refund
/schemes
/schemes/funding
/status
/team
/terms
/tic-admin
/tic-admin/activity
/tic-admin/applications
/tic-admin/applications/[id]
/tic-admin/approvals
/tic-admin/companies
/tic-admin/content
/tic-admin/content/[...key]
/tic-admin/email
/tic-admin/email/templates
/tic-admin/email/templates/[key]
/tic-admin/job-applications
/tic-admin/job-applications/[id]
/tic-admin/jobs
/tic-admin/login
/tic-admin/roles
/tic-admin/storage
/tic-admin/support
/tic-admin/users
/tic-coordinators
/unsubscribe
/verify-email
```

## Server-only page files

These paths have a `+page.server.ts` redirect file but no matching `+page.svelte`. They are excluded from the page count above:

- `/tic-admin/ai` → `/tic-admin?assistant=open`
- `/tic-admin/home-page` → `/tic-admin/content/homeHero`

`/partners` now redirects to `/about#partners`: partners are a section of the About page.

The former About sub-pages are now top-level pages: `/about/team`, `/about/governing-body`, `/about/committee-of-management`, `/about/tic-coordinators`, `/about/mentors` and `/about/faq` redirect to `/team`, `/governing-body`, `/committee-of-management`, `/tic-coordinators`, `/mentors` and `/faq`.

`/events` now also redirects to `/opportunities/events`: the events list is a filter of Opportunities, alongside `/opportunities/startup-jobs` and `/opportunities/tic-jobs`. Event detail pages stay at `/events/[slug]`.

API endpoints (`+server.ts`) and `/sitemap.xml` are not page routes, so they are not listed here.

## Colors

The shared design tokens are defined in `src/lib/styles/_variables.scss` and exposed as CSS variables in `src/lib/styles/app.scss`.

| Use | Color |
| --- | --- |
| Page background / white | `#FFFFFF` |
| Main text / black | `#000000` |
| Primary green | `#00B451` |
| Accent blue | `#004EBC` |
| Brand charcoal | `#231F20` |
| Brand gray | `#686A74` |
| Muted text | black at 60% opacity |
| Subtle fill | black at 8% opacity |
| Border | black at 12% opacity |

The founder and TIC admin dashboards also use the palette in `src/lib/styles/_admin.scss`:

| Use | Color |
| --- | --- |
| Dashboard background | `#F1F2F5` |
| Card surface | `#FFFFFF` |
| Sunken surface | `#F4F5F8` |
| Field border | `#CDD2DA` |
| Main ink | `#14171A` |
| Secondary ink | `#4D545C` |
| Tertiary ink | `#878E97` |
| Dashboard accent | `#2050D4` |

Dashboard status colors (background / text): good `#E3F7EA` / `#0B6B36`; warning `#FDF1DA` / `#7A5405`; bad `#FDE7E7` / `#9A201F`; info `#E6EDFD` / `#1D3F96`; violet `#EEE9FD` / `#4B2F9E`; neutral `#EEF0F4` / `#454B54`. Individual components also contain local color values for specific UI states.

## Fonts

`src/app.html` loads **Open Sans**, **Mukta**, and **Anek** from Google Fonts.

| Use | Font stack |
| --- | --- |
| Default body and UI | Open Sans → Mukta → system sans-serif fallbacks |
| Hero headings and selected prose | Anek → Mukta → Open Sans → sans-serif |
| IDs, code, and technical labels | System monospace → SF Mono / Menlo / Consolas → monospace |

The named `$font-family-serif` token uses Anek, which is a sans-serif typeface.
