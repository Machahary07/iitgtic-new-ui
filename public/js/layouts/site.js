import { html } from '../lib/html.js';
import { current, isActive } from '../lib/nav.js';

// Top navigation: every public page lives under one of three dropdowns.
const NAV = [
  {
    label: 'About',
    links: [
      ['/about', 'About TIC'],
      ['/about/what-happens', 'What happens at TIC'],
      ['/about/team', 'Team'],
      ['/about/governing-body', 'Governing body'],
      ['/about/committee-of-management', 'Committee of management'],
      ['/about/tic-coordinators', 'TIC coordinators'],
      ['/about/mentors', 'Mentors'],
      ['/partners', 'Partners'],
      ['/contact', 'Contact'],
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
      ['/events', 'Events'],
      ['/about/blog', 'Blog'],
      ['/about/faq', 'FAQ'],
    ],
  },
];

const FOOTER_LINKS = [
  ['/about/faq', 'FAQ'],
  ['/privacy', 'Privacy'],
  ['/terms', 'Terms'],
  ['/cookies', 'Cookies'],
  ['/refund', 'Refund policy'],
  ['/status', 'Status'],
];

// Desktop dropdowns are pure CSS hover. On phones the "Menu" button opens a
// full-screen menu and each group button expands its links in place.
// Navigating re-renders the layout, which resets all of this.
const phone = window.matchMedia('(max-width: 900px)');

function setMenuOpen(header, open) {
  header.toggleAttribute('data-menu-open', open);
  const toggle = header.querySelector('.site-menu-toggle');
  toggle.setAttribute('aria-expanded', String(open));
  toggle.textContent = open ? 'Close' : 'Menu';
}

document.addEventListener('click', (event) => {
  const toggle = event.target.closest?.('.site-menu-toggle');
  if (toggle) {
    const header = toggle.closest('.site-header');
    return setMenuOpen(header, !header.hasAttribute('data-menu-open'));
  }

  const trigger = event.target.closest?.('.nav-menu__trigger');
  if (!trigger || !phone.matches) return;
  const expand = trigger.getAttribute('aria-expanded') !== 'true';
  for (const other of document.querySelectorAll('.nav-menu__trigger')) other.setAttribute('aria-expanded', 'false');
  trigger.setAttribute('aria-expanded', String(expand));
});

document.addEventListener('keydown', (event) => {
  const header = document.querySelector('.site-header[data-menu-open]');
  if (event.key === 'Escape' && header) setMenuOpen(header, false);
});

const navMenu = ({ label, links }, path, i) => {
  const active = links.some(([href]) => isActive(path, href, true));
  return html`
    <div class="nav-menu">
      <button class="nav-menu__trigger" type="button" aria-expanded="false" aria-controls="nav-menu-${i}"${active ? html` data-active` : ''}>${label}</button>
      <div class="nav-menu__panel" id="nav-menu-${i}">
        <ul class="nav-menu__card">
          ${links.map(([href, text]) => html`<li><a href="${href}"${current(path, href, true)}>${text}</a></li>`)}
        </ul>
      </div>
    </div>`;
};

export default function siteLayout(content, { path }) {
  // On the home page the header floats transparently over the dark hero.
  const overHero = path === '/';
  return html`
    <header class="site-header${overHero ? ' site-header--over' : ''}">
      <div class="site-header__inner">
        <a class="site-logo" href="/"><img src="/img/${overHero ? 'tic-logo-on-dark' : 'tic-logo'}.svg" alt="IITG Technology Incubation Centre" width="250" height="64" /></a>
        <nav class="site-nav" id="site-nav" aria-label="Main">
          ${NAV.map((group, i) => navMenu(group, path, i))}
        </nav>
        <a class="btn site-header__apply" href="/apply">Apply</a>
        <button class="site-menu-toggle" type="button" aria-expanded="false" aria-controls="site-nav">Menu</button>
      </div>
    </header>
    <main class="site-main container" data-outlet>${content}</main>
    <footer class="site-footer">
      <div class="container site-footer__inner">
        <span>© ${new Date().getFullYear()} IITG Technology Incubation Centre</span>
        <nav aria-label="Footer">
          ${FOOTER_LINKS.map(([href, label]) => html`<a href="${href}">${label}</a>`)}
        </nav>
      </div>
    </footer>`;
}
