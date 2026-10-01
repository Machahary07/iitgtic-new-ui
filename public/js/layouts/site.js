import { html } from '../lib/html.js';
import { current, isActive } from '../lib/nav.js';
import '../lib/nav-roll.js';

// Top navigation: three dropdowns plus a direct Contact link. An entry with
// `href` (instead of `links`) is a plain link with no dropdown.
const NAV = [
  {
    label: 'About',
    links: [
      ['/about', 'About TIC'],
      ['/team', 'Team'],
      ['/governing-body', 'Governing body'],
      ['/committee-of-management', 'Committee of management'],
      ['/tic-coordinators', 'TIC coordinators'],
      ['/mentors', 'Mentors'],
      ['/about#partners', 'Partners'],
      ['/faq', 'FAQ'],
    ],
  },
  {
    label: 'Incubation',
    links: [
      ['/incubation', 'Incubation'],
      ['/programs', 'Programs'],
      ['/schemes', 'Schemes'],
      ['/schemes/funding', 'Funding schemes'],
      ['/incubated-startups', 'Incubated startups'],
      ['/login', 'Founder log in'],
    ],
  },
  {
    label: 'Opportunities',
    links: [
      ['/opportunities', 'All opportunities'],
      ['/opportunities/startup-jobs', 'Startup jobs'],
      ['/opportunities/tic-jobs', 'TIC jobs'],
      ['/opportunities/events', 'Events'],
    ],
  },
  { label: 'Contact', href: '/contact' },
];

// TODO: confirm the official LinkedIn page URL.
const LINKEDIN_URL = 'https://www.linkedin.com/company/tic-iitg/';
const EMAIL = 'tic@iitg.ac.in';

// Footer: explore links on top, legal links along the bottom.
const FOOTER_EXPLORE = [
  ['https://www.iitg.ac.in', 'IIT Guwahati'],
  ['/incubation', 'Incubation'],
  ['/incubated-startups', 'Startups'],
  ['/opportunities', 'Opportunities'],
  ['/contact', 'Contact'],
];

const FOOTER_LINKS = [
  ['/faq', 'FAQ'],
  ['/privacy', 'Privacy'],
  ['/terms', 'Terms'],
  ['/cookies', 'Cookies'],
  ['/refund', 'Refund policy'],
  ['/status', 'Status'],
];

// Desktop dropdowns are pure CSS hover. On phones the menu button opens a
// full-screen menu and each group button expands its links in place.
// Navigating re-renders the layout, which resets all of this.
const phone = window.matchMedia('(max-width: 900px)');

function setMenuOpen(header, open) {
  header.toggleAttribute('data-menu-open', open);
  const toggle = header.querySelector('.site-menu-toggle');
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  if (!open) for (const trigger of header.querySelectorAll('button.nav-menu__trigger')) trigger.setAttribute('aria-expanded', 'false');
}

document.addEventListener('click', (event) => {
  // Following a menu link (even to a #section on this page, which doesn't
  // re-render the layout) closes the phone menu.
  const header = document.querySelector('.site-header[data-menu-open]');
  if (header && event.target.closest?.('.site-nav a')) setMenuOpen(header, false);

  const toggle = event.target.closest?.('.site-menu-toggle');
  if (toggle) {
    const header = toggle.closest('.site-header');
    return setMenuOpen(header, !header.hasAttribute('data-menu-open'));
  }

  const trigger = event.target.closest?.('button.nav-menu__trigger');
  if (!trigger || !phone.matches) return;
  const expand = trigger.getAttribute('aria-expanded') !== 'true';
  for (const other of document.querySelectorAll('button.nav-menu__trigger')) other.setAttribute('aria-expanded', 'false');
  trigger.setAttribute('aria-expanded', String(expand));
});

document.addEventListener('keydown', (event) => {
  const header = document.querySelector('.site-header[data-menu-open]');
  if (event.key === 'Escape' && header) setMenuOpen(header, false);
});

// Footer parallax: --reveal goes 0 -> 1 as the page slides up off the
// footer; CSS uses it to let the footer's layers settle at different speeds.
const still = window.matchMedia('(prefers-reduced-motion: reduce)');
let revealFrame;
function updateReveal() {
  revealFrame = undefined;
  const footer = document.querySelector('.site-footer');
  const main = document.querySelector('.site-main');
  if (!footer || !main || still.matches) return;
  // The top --tuck px sit under the page (negative margin) and never show.
  const tuck = -parseFloat(getComputedStyle(footer).marginTop) || 0;
  const shown = window.innerHeight - main.getBoundingClientRect().bottom;
  const progress = Math.min(Math.max(shown / (footer.offsetHeight - tuck), 0), 1);
  footer.style.setProperty('--reveal', progress.toFixed(3));
}
const queueReveal = () => (revealFrame ??= requestAnimationFrame(updateReveal));
window.addEventListener('scroll', queueReveal, { passive: true });
window.addEventListener('resize', queueReveal);
new MutationObserver(queueReveal).observe(document.body, { childList: true, subtree: true });

// Light pages whose own background runs up behind a transparent header.
const CLEAR_PAGES = [
  '/about',
  '/faq',
  '/privacy',
  '/terms',
  '/cookies',
  '/refund',
];

const DARK_PAGES = [
  '/',
  '/opportunities',
  '/opportunities/startup-jobs',
  '/opportunities/tic-jobs',
  '/opportunities/events',
  // People pages: over a darkened photo backdrop.
  '/team',
  '/governing-body',
  '/committee-of-management',
  '/tic-coordinators',
  '/mentors',
  '/status',
];

const navMenu = ({ label, links, href }, path, i) => {
  if (href) {
    return html`
      <div class="nav-menu" style="--g: ${i}">
        <a class="nav-menu__trigger nav-menu__link" href="${href}"${current(path, href)}${isActive(path, href) ? html` data-active` : ''}>${label}</a>
      </div>`;
  }
  const active = links.some(([href]) => isActive(path, href, true));
  return html`
    <div class="nav-menu" style="--g: ${i}">
      <button class="nav-menu__trigger" type="button" aria-expanded="false" aria-controls="nav-menu-${i}"${active ? html` data-active` : ''}>${label}</button>
      <div class="nav-menu__panel" id="nav-menu-${i}">
        <ul class="nav-menu__card">
          ${links.map(
            ([href, text], n) => html`<li style="--i: ${n}"><a href="${href}"${current(path, href, true)}><span class="roll" data-roll><span class="roll__line">${text}</span><span class="roll__line" aria-hidden="true">${text}</span></span></a></li>`,
          )}
        </ul>
      </div>
    </div>`;
};

export default function siteLayout(content, { path }) {
  // On dark pages (home hero, opportunities collection) the header floats
  // transparently over the page with white text.
  const overHero = DARK_PAGES.includes(path);
  return html`
    <header class="site-header${overHero ? ' site-header--over' : ''}${CLEAR_PAGES.includes(path) ? ' site-header--clear' : ''}">
      <div class="site-header__inner">
        <a class="site-logo" href="/">
          <img class="site-logo__light" src="/img/tic-logo.svg" alt="IITG Technology Incubation Centre" width="250" height="64" />
          <img class="site-logo__dark" src="/img/tic-logo-on-dark.svg" alt="IITG Technology Incubation Centre" width="250" height="64" />
        </a>
        <nav class="site-nav" id="site-nav" aria-label="Main">
          ${NAV.map((group, i) => navMenu(group, path, i))}
          <div class="site-nav__extra" style="--g: ${NAV.length}">
            <div class="site-nav__social">
              <a href="${LINKEDIN_URL}" target="_blank" rel="noopener" aria-label="LinkedIn">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" /></svg>
              </a>
              <a href="mailto:${EMAIL}" aria-label="Email ${EMAIL}">
                <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3.5 6.5 8.5 6.5 8.5-6.5" /></svg>
              </a>
            </div>
            <p class="site-nav__legal">© ${new Date().getFullYear()} IITG Technology Incubation Centre · <a href="/privacy">Privacy</a></p>
          </div>
        </nav>
        <a class="btn site-header__apply" href="/apply" data-magnetic><span data-magnetic-inner>Apply</span><span class="site-header__apply-arrow" aria-hidden="true" data-magnetic-inner><svg viewBox="0 0 24 24"><path d="M7 17 17 7M8 7h9v9" /></svg></span></a>
        <button class="site-menu-toggle" type="button" aria-expanded="false" aria-controls="site-nav" aria-label="Open menu">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path class="site-menu-toggle__open" d="M4 8h16M4 16h16" /><path class="site-menu-toggle__close" d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      </div>
    </header>
    <main class="site-main" data-outlet>${content}</main>
    <footer class="site-footer">
      <div class="site-footer__inner">
        <div class="site-footer__top">
          <p class="site-footer__label">Technology Incubation Centre, IIT Guwahati</p>
          <nav class="site-footer__explore" aria-label="Explore">
            ${FOOTER_EXPLORE.map(([href, label]) => html`<a href="${href}"${href.startsWith('http') ? html` target="_blank" rel="noopener"` : ''}>${label}</a>`)}
          </nav>
        </div>
        <p class="site-footer__wordmark" aria-hidden="true">IITG-TIC</p>
        <div class="site-footer__bottom">
          <a class="site-footer__logo" href="/"><img src="/img/tic-logo-on-dark.svg" alt="IITG Technology Incubation Centre" width="250" height="64" /></a>
          <nav class="site-footer__legal" aria-label="Legal">
            ${FOOTER_LINKS.map(([href, label]) => html`<a href="${href}">${label}</a>`)}
          </nav>
          <p class="site-footer__copy">© ${new Date().getFullYear()} IITG-TIC</p>
        </div>
      </div>
    </footer>`;
}
