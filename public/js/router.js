import { routes } from './routes.js';
import { REDIRECTS } from './redirects.js';
import { layouts } from './layouts/index.js';
import { html } from './lib/html.js';
import * as notFoundPage from './pages/not-found.js';

const SITE_NAME = 'IITG TIC';

// `[param]` matches one segment, `[...param]` matches the rest of the path.
function compile(route) {
  const keys = [];
  const pattern = route.path
    .split('/')
    .map((segment) => {
      const match = segment.match(/^\[(\.\.\.)?(\w+)\]$/);
      if (!match) return segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      keys.push(match[2]);
      return match[1] ? '(.+)' : '([^/]+)';
    })
    .join('/');
  return { ...route, keys, regex: new RegExp(`^${pattern}$`) };
}

const compiled = routes.map(compile);
const staticRoutes = new Map(compiled.filter((r) => !r.keys.length).map((r) => [r.path, r]));
const dynamicRoutes = compiled.filter((r) => r.keys.length);

function matchRoute(pathname) {
  const exact = staticRoutes.get(pathname);
  if (exact) return { route: exact, params: {} };
  for (const route of dynamicRoutes) {
    const m = pathname.match(route.regex);
    if (m) {
      const params = Object.fromEntries(route.keys.map((key, i) => [key, decodeURIComponent(m[i + 1])]));
      return { route, params };
    }
  }
  return null;
}

let root;
let navId = 0;
let cleanup;

async function render(url) {
  const id = ++navId;
  const { pathname, searchParams } = url;

  if (REDIRECTS[pathname]) return navigate(REDIRECTS[pathname], { replace: true });
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return navigate(pathname.replace(/\/+$/, '') + url.search + url.hash, { replace: true });
  }

  const match = matchRoute(pathname);
  const ctx = { path: pathname, params: match?.params ?? {}, query: searchParams };
  let page = notFoundPage;
  try {
    if (match) page = await match.route.load();
  } catch (err) {
    console.error(err);
    page = {
      title: 'Error',
      default: () => html`<section class="page"><h1>Something went wrong</h1><p class="muted">${err.message}</p></section>`,
    };
  }
  if (id !== navId) return; // a newer navigation started while this page was loading

  cleanup?.();
  cleanup = undefined;

  const layout = layouts[match?.route.layout ?? 'site'];
  root.innerHTML = String(layout(page.default(ctx), ctx));
  document.title = page.title ? `${page.title} · ${SITE_NAME}` : SITE_NAME;

  const outlet = root.querySelector('[data-outlet]') ?? root;
  // `mount` may return a cleanup function, run before the next page renders.
  const result = page.mount?.(outlet, ctx);
  if (typeof result === 'function') cleanup = result;
}

export function navigate(to, { replace = false } = {}) {
  const url = new URL(to, location.href);
  history[replace ? 'replaceState' : 'pushState'](null, '', url);
  const done = render(url);
  if (!replace) window.scrollTo(0, 0);
  return done;
}

function onLinkClick(event) {
  if (event.defaultPrevented || event.button !== 0) return;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const link = event.target.closest('a[href]');
  if (!link || link.target || link.hasAttribute('download') || link.dataset.external != null) return;
  const url = new URL(link.href);
  if (url.origin !== location.origin) return;
  if (url.pathname === location.pathname && url.search === location.search && url.hash) return; // in-page anchor
  event.preventDefault();
  navigate(url.href);
}

export function startRouter(element) {
  root = element;
  document.addEventListener('click', onLinkClick);
  window.addEventListener('popstate', () => render(new URL(location.href)));
  return render(new URL(location.href));
}
