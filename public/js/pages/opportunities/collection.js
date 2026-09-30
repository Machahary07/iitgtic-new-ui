import { html } from '../../lib/html.js';
import { CONTENT } from '../../data/content.js';
import { applyCta } from '../../components/apply-cta.js';

const OPPORTUNITIES = CONTENT.opportunities;

// Shared "collection" view behind /opportunities and its filters. Each filter
// is its own route, so the filters are plain links.
export const FILTERS = [
  { key: 'all', label: 'All', href: '/opportunities', empty: 'Nothing listed right now.' },
  { key: 'startup-job', label: 'Startup jobs', href: '/opportunities/startup-jobs', empty: 'No startup jobs open right now.' },
  { key: 'tic-job', label: 'TIC jobs', href: '/opportunities/tic-jobs', empty: 'No TIC jobs open right now.' },
  { key: 'event', label: 'Events', href: '/opportunities/events', empty: 'No events listed right now.' },
];

const TYPE_LABEL = { 'startup-job': 'Startup job', 'tic-job': 'TIC job', event: 'Event' };
const DENSE_KEY = 'opportunities-large';
const PAGE_SIZE = 8; // cards shown at first, and per "Load more"

const DAY = 24 * 60 * 60 * 1000;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const dateLabel = (d) => `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`; // "10 Sep 2026"
const ago = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

const day = (iso) => new Date(`${iso}T00:00:00`);
const startOfToday = () => new Date(new Date().toDateString());
const daysFromToday = (iso) => Math.round((day(iso) - startOfToday()) / DAY);

function postedAgo(iso) {
  const days = daysFromToday(iso);
  if (days > -7) return `Posted ${ago.format(days, 'day')}`;
  if (days > -30) return `Posted ${ago.format(Math.round(days / 7), 'week')}`;
  return `Posted ${ago.format(Math.round(days / 30), 'month')}`;
}

// Where an item stands today -> the pill's text and colour, and whether it
// is still "open" (counted on All opportunities).
//   Events: upcoming (green) / ongoing, date..endDate (blue) / past (grey)
//   Jobs:   open (green) / closing within a week of `deadline` (amber) /
//           closed after `deadline` (grey). No deadline = open.
export function status(item) {
  if (item.type === 'event') {
    const start = daysFromToday(item.date);
    const end = daysFromToday(item.endDate ?? item.date);
    if (start > 0) return { tone: 'green', open: true, text: `Upcoming · ${dateLabel(day(item.date))}` };
    if (end >= 0) {
      const text = item.endDate ? `Ongoing · till ${dateLabel(day(item.endDate))}` : 'Happening today';
      return { tone: 'blue', open: true, text };
    }
    return { tone: 'grey', open: false, text: dateLabel(day(item.endDate ?? item.date)) };
  }
  const left = item.deadline ? daysFromToday(item.deadline) : Infinity;
  if (left < 0) return { tone: 'grey', open: false, text: 'Closed' };
  if (left <= 7) {
    const text = left === 0 ? 'Closes today' : `Closes ${ago.format(left, 'day')}`;
    return { tone: 'amber', open: true, text };
  }
  return { tone: 'green', open: true, text: postedAgo(item.date) };
}

const card = (item, i) => html`
  <li class="collection__item"${i >= PAGE_SIZE ? html` hidden` : ''}>
    <a class="collection__card" href="${item.href}">
      ${(({ tone, text }) => html`<span class="collection__badge" data-tone="${tone}">${text}</span>`)(status(item))}
      ${item.logo
        ? html`<img class="collection__logo" src="${item.logo}" alt="" loading="lazy" decoding="async" />`
        : html`<img class="collection__thumb" src="${item.image}" alt="" loading="lazy" decoding="async" />`}
    </a>
    <p class="collection__name"><a href="${item.href}">${item.org ? `${item.title} · ${item.org}` : item.title}</a></p>
    <p class="collection__tags">${[TYPE_LABEL[item.type], ...item.tags].join(', ')}</p>
  </li>`;

export function renderCollection(filterKey) {
  const filter = FILTERS.find((f) => f.key === filterKey);
  const items = OPPORTUNITIES.filter((o) => filterKey === 'all' || o.type === filterKey).sort((a, b) =>
    b.date.localeCompare(a.date),
  );
  // All opportunities counts only what's still open (open or closing jobs,
  // upcoming or ongoing events); closed and past items are listed but not
  // counted. A filter counts everything in it.
  const count = filterKey === 'all' ? items.filter((o) => status(o).open).length : items.length;
  return html`
    <section class="collection">
      <header class="collection__head">
        <h1 class="collection__title">${filterKey === 'all' ? 'Opportunities' : filter.label}</h1>
        <p class="collection__count" aria-label="${count} ${filterKey === 'all' ? 'open' : 'listed'}">${count}</p>
      </header>

      <div class="collection__bar">
        <nav class="collection__filters" aria-label="Filter opportunities">
          ${FILTERS.map(
            (f) => html`<a class="collection__filter" href="${f.href}"${f.key === filterKey ? html` aria-current="page"` : ''}>${f.label}</a>`,
          )}
        </nav>
        <button class="collection__size" type="button" data-collection-size aria-pressed="false" aria-label="Larger cards">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6M20 4l-7 7M10 20H4v-6M4 20l7-7" /></svg>
        </button>
      </div>

      ${items.length
        ? html`<ul class="collection__grid">${items.map(card)}</ul>
            ${items.length > PAGE_SIZE ? html`<button class="collection__more" type="button" data-collection-more>Load more</button>` : ''}`
        : html`<p class="collection__empty">${filter.empty}</p>`}
    </section>
    ${applyCta()}`;
}

// The expand button toggles larger cards (fewer per row); remembered per
// browser. "Load more" reveals the next PAGE_SIZE hidden cards.
export function mountCollection(outlet) {
  const section = outlet.querySelector('.collection');
  section.querySelector('[data-collection-more]')?.addEventListener('click', (event) => {
    const hidden = [...section.querySelectorAll('.collection__item[hidden]')];
    for (const item of hidden.slice(0, PAGE_SIZE)) item.hidden = false;
    if (hidden.length <= PAGE_SIZE) event.currentTarget.remove();
  });
  const button = section.querySelector('[data-collection-size]');
  const apply = (large) => {
    section.toggleAttribute('data-large', large);
    button.setAttribute('aria-pressed', String(large));
  };
  try {
    apply(localStorage.getItem(DENSE_KEY) === '1');
  } catch {}
  button.addEventListener('click', () => {
    const large = !section.hasAttribute('data-large');
    apply(large);
    try {
      localStorage.setItem(DENSE_KEY, large ? '1' : '0');
    } catch {}
  });
}
