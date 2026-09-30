# iitgtic-new-ui

Vanilla JavaScript frontend served by a zero-dependency Node.js server. No frameworks, no build step.

## Requirements

- Node.js >= 20
- pnpm

## Scripts

```sh
pnpm install   # nothing to install yet, but sets up the lockfile
pnpm dev       # start with auto-restart on file changes (node --watch)
pnpm start     # start the server
```

Open http://localhost:3000. Override with `PORT` / `HOST` env vars.

## Structure

```
server.js            Node http server: static files, JSON API under /api, redirects,
                     and SPA fallback (extensionless paths serve index.html)
pages.md             route list + design tokens this app is built from
public/
  index.html         SPA shell (fonts, stylesheets, #app)
  css/
    tokens.css       colors, fonts, dashboard status palette
    base.css         reset, typography, site + auth layouts
    dashboard.css    founder / tic-admin layout, status pills
  js/
    main.js          entry: starts the router
    router.js        history-API router, link interception, layouts
    routes.js        route table (67 routes from pages.md)
    redirects.js     redirect-only paths (shared by server + client)
    api.js           fetch helpers for /api
    lib/html.js      `html` tagged template (auto-escapes values)
    layouts/         site, auth, founder, admin
    pages/           one module per route, mirroring the URL
```

### Pages

Each route in `routes.js` lazy-loads a module from `pages/`, where the file path mirrors the URL
(`/about/blog/[slug]` → `pages/about/blog/[slug].js`, `/` → `pages/index.js`). A page module exports:

```js
export const title = 'Blog post';                 // document title
export default function page({ params, query, path }) {
  return html`<h1>${params.slug}</h1>`;          // rendered into the layout
}
export function mount(el, ctx) {                 // optional: wire up DOM after render
  return () => {};                               // optional cleanup
}
```

`[param]` matches one segment and `[...param]` matches the rest of the path. Static routes win over
dynamic ones (`/opportunities/tic-jobs` before `/opportunities/[id]`).

Add API routes in the `apiRoutes` map in `server.js`.
