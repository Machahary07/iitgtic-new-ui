import { html } from '../lib/html.js';
import { CONTENT } from '../data/content.js';
import { EVENT_DETAILS } from '../data/event-details.js';
import { applyCta } from './apply-cta.js';
import { mountLegal } from './legal-page.js';

const slug = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const date = (value) => new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`));
const events = CONTENT.opportunities.filter((item) => item.type === 'event').sort((a, b) => b.date.localeCompare(a.date));

const notFound = (kind, href) => html`
  <div class="legal-page"><div class="legal detail detail--missing">
    <h1 class="legal__title">${kind} not found</h1>
    <p>This listing is no longer available.</p>
    <a href="${href}">Back to ${kind === 'Event' ? 'events' : 'opportunities'} ↗</a>
  </div></div>`;

function renderSections(sections) {
  return sections.map(({ heading, body, image, imageAlt }, index) => html`
    <section class="legal__section" id="${slug(heading)}">
      <h2><span class="legal__num">${String(index + 1).padStart(2, '0')}</span>${heading}</h2>
      ${body.map((paragraph) => html`<p>${paragraph}</p>`)}
      ${image ? html`<figure class="detail__figure"><img src="${image}" alt="${imageAlt}" loading="lazy" decoding="async" /></figure>` : ''}
    </section>`);
}

function detailPage({ item, detail, type, backHref, backLabel, next }) {
  const sections = detail.sections ?? [];
  const dateRange = item.endDate && item.endDate !== item.date ? `${date(item.date)} – ${date(item.endDate)}` : date(item.date);
  return html`
    <div class="legal-page detail-page">
      <div class="detail__shapes" aria-hidden="true">
        <div class="detail__shapes-frame">
          <div class="detail__shape detail__shape--circle"></div>
          <div class="detail__shape detail__shape--rect"></div>
        </div>
      </div>
      <article class="legal detail">
        <nav class="legal__nav detail__nav" aria-label="On this page">
          <a class="collection__size detail__back" href="${backHref}" aria-label="Back to ${backLabel}" title="${backLabel}">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12H4m7-7-7 7 7 7" /></svg>
          </a>
          <div class="detail__nav-bottom">
            <p class="legal__nav-title">On this page</p>
            <ol>${sections.map(({ heading }) => html`<li><a href="#${slug(heading)}" data-topic="${slug(heading)}">${heading}</a></li>`)}</ol>
          </div>
        </nav>

        <div class="legal__sections detail__content">
          <header class="legal__head detail__head">
            <a class="collection__size detail__back detail__back--mobile" href="${backHref}" aria-label="Back to ${backLabel}" title="${backLabel}">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12H4m7-7-7 7 7 7" /></svg>
            </a>
            <p class="people__eyebrow detail__eyebrow">${type === 'event' ? 'Event / IITG-TIC' : type === 'tic-job' ? 'TIC job / IITG-TIC' : 'Startup job / IITG-TIC'}</p>
            <div class="detail__title-stack">
              <h1 class="people__title detail__title">${item.title}</h1>
              <p class="people__title detail__title detail__title--circle" aria-hidden="true">${item.title}</p>
              <p class="people__title detail__title detail__title--rect" aria-hidden="true">${item.title}</p>
            </div>
            <p class="people__intro detail__intro">${detail.intro}</p>
          </header>
            ${item.image ? html`<figure class="detail__hero"><img src="${item.image}" alt="${detail.imageAlt ?? ''}" decoding="async" /><figcaption>${detail.organiser ?? ''}</figcaption></figure>` : ''}
            ${item.logo ? html`<div class="detail__logo"><img src="${item.logo}" alt="${item.org ?? ''}" /></div>` : ''}
            ${renderSections(sections)}
        </div>

        <aside class="detail__aside" aria-label="${type === 'event' ? 'Event' : 'Role'} details">
            <div class="detail__facts">
              <p class="detail__aside-title">${type === 'event' ? 'Event details' : 'Role details'}</p>
              <dl>
                <div><dt>${type === 'event' ? 'Date' : 'Posted'}</dt><dd>${dateRange}</dd></div>
                ${detail.duration ? html`<div><dt>Duration</dt><dd>${detail.duration}</dd></div>` : ''}
                ${item.deadline ? html`<div><dt>Apply by</dt><dd>${date(item.deadline)}</dd></div>` : ''}
                ${detail.organiser || item.org ? html`<div><dt>${type === 'event' ? 'Organised by' : 'Organisation'}</dt><dd>${detail.organiser ?? item.org}</dd></div>` : ''}
              </dl>
              ${type !== 'event' && detail.applyUrl ? html`<a class="detail__apply" href="${detail.applyUrl}" target="_blank" rel="noopener noreferrer">Apply for this role ↗</a>` : ''}
            </div>
            ${next ? html`<a class="apply-cta__button detail__next" href="${next.href}" aria-label="View next event: ${next.title}" title="${next.title}" data-magnetic>
              <span data-magnetic-inner>View next event</span>
              <span class="apply-cta__arrow" aria-hidden="true" data-magnetic-inner><svg viewBox="0 0 24 24"><path d="M7 17 17 7M8 7h9v9" /></svg></span>
            </a>` : ''}
        </aside>
      </article>
    </div>
    ${applyCta()}`;
}

export function eventPage(slugValue) {
  const item = events.find((event) => event.href === `/events/${slugValue}`);
  const detail = EVENT_DETAILS[slugValue];
  if (!item || !detail) return notFound('Event', '/opportunities/events');
  const index = events.indexOf(item);
  return detailPage({ item, detail, type: 'event', backHref: '/opportunities/events', backLabel: 'All events', next: events[(index + 1) % events.length] });
}

export function jobPage(id) {
  const item = CONTENT.opportunities.find((entry) => entry.id === id && entry.type !== 'event');
  if (!item) return notFound('Role', '/opportunities');
  const detail = item.details ?? {
    intro: `${item.title} at ${item.org}.`,
    sections: [{ heading: 'About the role', body: ['More information about this role will be shared by the hiring team.'] }],
  };
  return detailPage({ item, detail, type: item.type, backHref: item.type === 'tic-job' ? '/opportunities/tic-jobs' : '/opportunities/startup-jobs', backLabel: 'All roles' });
}

export function mountDetail(el) {
  const heading = el.querySelector('.detail__title');
  if (heading) document.title = `${heading.textContent} · IITG TIC`;
  const stopNav = el.querySelector('[data-topic]') ? mountLegal(el) : undefined;
  const page = el.querySelector('.detail-page');
  if (!page) return stopNav;
  const stack = page.querySelector('.detail__title-stack');
  const frameElement = page.querySelector('.detail__shapes-frame');
  const circle = page.querySelector('.detail__shape--circle');
  const rect = page.querySelector('.detail__shape--rect');
  const circleInk = page.querySelector('.detail__title--circle');
  const rectInk = page.querySelector('.detail__title--rect');
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let frame;
  const start = performance.now();

  const roundedRect = (cx, cy, w, h, r, angle) => {
    const radians = angle * Math.PI / 180;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    const point = (x, y) => `${(cx + x * cos - y * sin).toFixed(1)} ${(cy + x * sin + y * cos).toFixed(1)}`;
    const x = w / 2;
    const y = h / 2;
    const arc = (px, py) => `A ${r} ${r} 0 0 1 ${point(px, py)}`;
    return `path('M ${point(-x + r, -y)} L ${point(x - r, -y)} ${arc(x, -y + r)} L ${point(x, y - r)} ${arc(x - r, y)} L ${point(-x + r, y)} ${arc(-x, y - r)} L ${point(-x, -y + r)} ${arc(-x + r, -y)} Z')`;
  };

  const draw = () => {
    const frameBox = frameElement.getBoundingClientRect();
    const stackBox = stack.getBoundingClientRect();
    const t = still ? 0 : (performance.now() - start) / 1000;
    const base = Math.max(frameBox.width, 900);
    const diameter = Math.min(base * 0.27, 410);
    const circleX = frameBox.width * 0.10 + 20 * Math.sin(t * 0.23);
    const circleY = 150 + 20 * Math.cos(t * 0.17);
    circle.style.cssText = `width:${diameter}px;height:${diameter}px;translate:${circleX - diameter / 2}px ${circleY - diameter / 2}px`;
    circleInk.style.clipPath = `circle(${diameter / 2}px at ${circleX + frameBox.left - stackBox.left}px ${circleY + frameBox.top - stackBox.top}px)`;

    const width = Math.min(base * 0.29, 430);
    const height = width * 1.05;
    const rectX = frameBox.width * 0.57 + 20 * Math.sin(t * 0.19 + 1);
    const rectY = 270 + 25 * Math.cos(t * 0.29);
    const angle = -9 + 3 * Math.sin(t * 0.21);
    rect.style.cssText = `width:${width}px;height:${height}px;translate:${rectX - width / 2}px ${rectY - height / 2}px;rotate:${angle}deg`;
    rectInk.style.clipPath = roundedRect(rectX + frameBox.left - stackBox.left, rectY + frameBox.top - stackBox.top, width, height, Math.min(120, width * .2), angle);
    if (!still) frame = requestAnimationFrame(draw);
  };
  const resize = new ResizeObserver(() => { if (still) draw(); });
  resize.observe(frameElement);
  draw();
  return () => {
    stopNav?.();
    cancelAnimationFrame(frame);
    resize.disconnect();
  };
}
