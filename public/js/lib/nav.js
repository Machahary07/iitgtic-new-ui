import { raw } from './html.js';

export function isActive(path, href, exact = false) {
  if (exact || href === '/') return path === href;
  return path === href || path.startsWith(`${href}/`);
}

// Attribute snippet for nav links: `<a href="/x"${current(path, '/x')}>`.
export const current = (path, href, exact) => (isActive(path, href, exact) ? raw(' aria-current="page"') : '');
