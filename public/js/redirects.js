// Paths that only redirect (server-only `+page.server.ts` files in the old app).
// Shared by server.js (HTTP 302) and the client router (history replace).
export const REDIRECTS = {
  '/events': '/opportunities/events',
  '/partners': '/about#partners',
  '/tic-admin/ai': '/tic-admin?assistant=open',
  '/tic-admin/home-page': '/tic-admin/content/homeHero',
};
