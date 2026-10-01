import { html } from '../lib/html.js';
import { applyCta } from './apply-cta.js';
import { mountBoard } from '../lib/board-slider.js';

// Pages that used to sit under /about (team, governing body, committee,
// coordinators, mentors, FAQ) on warm off-white: each group of people as a
// board slider (lib/board-slider.js) — one big pinned
// portrait with the person's details, the others in a snaking path of small
// photos — then the Apply CTA. On phones a board is just a square grid with
// names on the pictures. Copy comes from content.json; styles in
// css/people.css.

const TONES = ['green', 'blue', 'mint', 'sky'];
const initials = (name) =>
  name
    .replace(/^(Dr|Prof|Mr|Ms|Mrs)\.?\s+/i, '')
    .split(/\s+/)
    .filter((w) => /^[A-Za-z]/.test(w))
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

// A photo, or initials on a brand colour when there isn't one.
const picture = (person, i) =>
  person.photo
    ? html`<img class="pic" src="${person.photo}" alt="" loading="lazy" />`
    : html`<span class="pic pic--initials pic--${TONES[i % TONES.length]}" aria-hidden="true">${initials(person.name)}</span>`;

// One person's details, shown beside the big portrait.
const info = (person, i) => html`
  <div class="board__panel" data-info="${i}">
    <h3 class="board__name">${person.name}</h3>
    ${person.role ? html`<p class="board__role">${person.role}</p>` : ''}
    ${person.affiliation || person.department ? html`<p class="board__meta">${person.affiliation || person.department}</p>` : ''}
    ${person.expertise ? html`<ul class="board__chips">${person.expertise.map((e) => html`<li>${e}</li>`)}</ul>` : ''}
    ${person.bio ? html`<p class="board__bio">${person.bio}</p>` : ''}
    ${person.email ? html`<a class="board__email" href="mailto:${person.email}">${person.email}</a>` : ''}
  </div>`;

// Phone tile: the picture with the name (and role) on it.
const tile = (person, i) => html`
  <li class="board__tile">
    ${picture(person, i)}
    <span class="board__caption">
      <span class="board__caption-name">${person.name}</span>
      ${person.role && !/^(Member|Mentor), IITG-TIC$/.test(person.role) ? html`<span class="board__caption-role">${person.role}</span>` : ''}
    </span>
  </li>`;

const board = ({ heading, tagline, note, people }) => html`
  <section class="board" data-board>
    <div class="board__label">
      <h2 class="board__title">${heading}</h2>
      ${tagline ? html`<p class="board__tagline">${tagline}</p>` : ''}
    </div>
    ${note ? html`<p class="board__note">${note}</p>` : ''}
    <div class="board__stage" data-stage>
      <div class="board__info">${people.map(info)}</div>
      ${people.map(
        (person, i) => html`<button class="board__slide" type="button" data-slide="${i}" aria-label="Show ${person.name}">${picture(person, i)}</button>`,
      )}
    </div>
    <ul class="board__grid">${people.map(tile)}</ul>
  </section>`;

const head = ({ title, intro }, eyebrow) => html`
  <header class="people__head">
    <p class="people__eyebrow">${eyebrow}</p>
    <h1 class="people__title">${title}</h1>
    <p class="people__intro">${intro}</p>
  </header>`;

// variant 'dark': over a backdrop of the featured person's photo (boards);
// 'list': plain dark page for the roster tables.
const shell = (body, variant = '') => html`
  <div class="people-page${variant ? ` people-page--${variant}` : ''}">
    ${variant === 'dark' ? html`<div class="people-backdrop" aria-hidden="true"><div class="people-backdrop__frame" data-backdrop></div></div>` : ''}
    <article class="people">${body}</article>
  </div>
  ${applyCta()}`;

const pageTitle = (eyebrow) => html`<h1 class="people__sr">${eyebrow.replace(/^About · /, '')}</h1>`;

// sections: [{ heading, tagline?, note?, people }]. No visible header: the boards'
// titles lead the page; the page title stays for screen readers.
export const peoplePage = (page, eyebrow, sections) => shell(html`${pageTitle(eyebrow)}${sections.map(board)}`, 'dark');

// People without photos (mentors, coordinators) as a roster table: three
// columns of [label, person => value], then a fourth with an arrow that opens
// the person's details under their row (details: person => content).
const chevron = html`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>`;
const roster = ({ heading, tagline, note, columns, details, people }, s) => html`
  <section class="roster">
    <div class="roster__head">
      <h2 class="roster__title">${heading}</h2>
      ${tagline ? html`<p class="roster__tagline">${tagline}</p>` : ''}
      ${note ? html`<p class="roster__note">${note}</p>` : ''}
    </div>
    <div class="roster__row roster__row--labels" aria-hidden="true">
      ${columns.map(([label]) => html`<span>${label}</span>`)}
      <span class="roster__end">Details</span>
    </div>
    <ul class="roster__list">
      ${people.map(
        (person, i) => html`
          <li class="roster__item">
            <div class="roster__row">
              ${columns.map(([label, value], c) => html`<span class="roster__cell roster__cell--${c}" data-label="${label}">${value(person)}</span>`)}
              <span class="roster__end">
                <button class="roster__toggle" type="button" aria-expanded="false" aria-controls="roster-${s}-${i}" aria-label="Details for ${person.name}">${chevron}</button>
              </span>
            </div>
            <div class="roster__detail" id="roster-${s}-${i}">
              <div class="roster__detail-inner"><div class="roster__detail-body">${details(person)}</div></div>
            </div>
          </li>`,
      )}
    </ul>
  </section>`;

export const peopleList = (eyebrow, sections) => shell(html`${pageTitle(eyebrow)}${sections.map(roster)}`, 'list');

// Arrows open and close their row's details.
export function mountRoster(el) {
  const onClick = (event) => {
    const toggle = event.target.closest('.roster__toggle');
    if (!toggle) return;
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    toggle.closest('.roster__item').toggleAttribute('data-open', open);
  };
  el.addEventListener('click', onClick);
  return () => el.removeEventListener('click', onClick);
}

const still = window.matchMedia('(prefers-reduced-motion: reduce)');

// The backdrop for a slide: its photo, or the colour of its initials tile.
const backdropOf = (slide) => {
  const img = slide.querySelector('img');
  return img ? `center top / cover no-repeat url("${img.getAttribute('src')}")` : getComputedStyle(slide.querySelector('.pic')).backgroundColor;
};

export function mountPeople(el) {
  const frame = el.querySelector('[data-backdrop]');
  // Each change fades a new darkened layer in over the old ones, which are
  // dropped once it's fully in.
  const show = (slide) => {
    if (!frame || !slide) return;
    const layer = document.createElement('div');
    layer.className = 'people-backdrop__layer';
    layer.style.background = backdropOf(slide);
    frame.append(layer);
    layer
      .animate([{ opacity: 0 }, { opacity: 1 }], { duration: still.matches ? 0 : 900, easing: 'ease', fill: 'forwards' })
      .finished.then(() => {
        while (frame.firstElementChild !== layer && layer.isConnected) frame.firstElementChild.remove();
      })
      .catch(() => {});
  };
  const onFeature = (event) => show(event.detail.slide);
  el.addEventListener('board:feature', onFeature);
  show(el.querySelector('[data-board] [data-slide="0"]'));

  const cleanups = [...el.querySelectorAll('[data-board]')].map(mountBoard);
  return () => {
    el.removeEventListener('board:feature', onFeature);
    cleanups.forEach((stop) => stop());
  };
}

// FAQ: numbered questions that open in place.
export function faqPage(page) {
  return shell(html`
    ${head(page, 'About · FAQ')}
    <section class="people__section">
      <div class="faq">
        ${page.items.map(
          ({ q, a }, i) => html`
            <details class="faq__item"${i === 0 ? html` open` : ''}>
              <summary><span class="faq__num">${String(i + 1).padStart(2, '0')}</span><span class="faq__q">${q}</span></summary>
              <p class="faq__a">${a}</p>
            </details>`,
        )}
      </div>
    </section>`);
}
