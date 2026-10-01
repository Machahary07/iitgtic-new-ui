// Paths that only redirect (server-only `+page.server.ts` files in the old app).
// Shared by server.js (HTTP 302) and the client router (history replace).
export const REDIRECTS = {
  // The About sub-pages became top-level pages.
  '/about/team': '/team',
  '/about/governing-body': '/governing-body',
  '/about/committee-of-management': '/committee-of-management',
  '/about/tic-coordinators': '/tic-coordinators',
  '/about/mentors': '/mentors',
  '/about/faq': '/faq',
  '/events': '/opportunities/events',
  '/partners': '/about#partners',
  '/tic-admin/ai': '/tic-admin?assistant=open',
  '/tic-admin/home-page': '/tic-admin/content/homeHero',
};
