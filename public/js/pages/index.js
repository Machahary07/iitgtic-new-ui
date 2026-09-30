import { html } from '../lib/html.js';

export const title = 'Home';

// Each slide brings its own background: photos (/img/hero/<photos>-N.jpg, with
// their pixel sizes for the aspect ratio) and three decorative text cards.
const SLIDES = [
  {
    title: 'IITG Technology Incubation Center',
    tagline: 'Where Northeast India’s DeepTech ideas become ventures for global markets.',
    cta: ['/apply', 'Apply'],
    photos: ['tic', [[675, 900], [675, 900], [900, 675], [900, 675], [900, 599], [900, 599]]],
    cards: {
      list: ['This week at TIC', ['Mentorship hours', 'Investor connect']],
      bubble: ['Seed funds', 'for early-stage DeepTech ventures'],
      checklist: ['Incubation support', ['Workspace and labs', 'Mentorship'], 'Seed funding'],
    },
  },
  {
    title: 'Incubation',
    tagline: 'Workspace, mentors and funding support for early-stage founders.',
    cta: ['/incubation', 'Explore incubation'],
    photos: ['incubation', [[900, 600], [900, 600], [900, 600], [900, 600], [900, 599], [900, 599]]],
    cards: {
      list: ['Incubation tracks', ['Pre-incubation', 'Incubation']],
      bubble: ['Mentorship', 'from faculty and industry experts'],
      checklist: ['What you get', ['Workspace and labs', 'Legal and IP support'], 'Seed funding'],
    },
  },
  {
    title: 'Startups',
    tagline: 'Meet the companies built with IITG TIC.',
    cta: ['/incubated-startups', 'View startups'],
    photos: ['startups', [[692, 900], [675, 900], [900, 675], [900, 643], [900, 643], [900, 599]]],
    cards: {
      list: ['Startup support', ['Market access', 'Investor network']],
      bubble: ['DeepTech ventures', 'from Northeast India, built for global markets'],
      checklist: ['Growth support', ['Product validation', 'Pilot partners'], 'Follow-on funding'],
    },
  },
  {
    title: 'Opportunities',
    tagline: 'Jobs at TIC and at our incubated startups.',
    cta: ['/opportunities', 'See openings'],
    photos: ['opportunities', [[900, 395], [802, 900], [900, 506], [900, 675], [900, 675], [900, 506]]],
    cards: {
      list: ['Open roles', ['Startup jobs', 'TIC jobs']],
      bubble: ['Hackathons', 'trainings and innovation challenges'],
      checklist: ['Get involved', ['Internships', 'Hackathons'], 'Mentor network'],
    },
  },
];

const SLIDE_MS = 6000;

// Photos sit below the shade layer and cards above it, each in its own
// per-slide set, so the shade never dims the cards (even mid-fade).
const photoSet = ({ photos: [name, sizes] }) => html`
  <div class="hero__set">
    ${sizes.map(([w, h], n) => html`<img src="/img/hero/${name}-${n + 1}.jpg" alt="" width="${w}" height="${h}" decoding="async" />`)}
  </div>`;

const cardSet = ({ cards: { list, bubble, checklist } }) => html`
  <div class="hero__set">
    <div class="hero__float hero__float--list">
      <p class="hero__float-title">${list[0]}</p>
      <ul>
        ${list[1].map((item, n) => html`<li><span class="hero__swatch hero__swatch--${n ? 'blue' : 'green'}"></span>${item}</li>`)}
      </ul>
    </div>
    <div class="hero__float hero__float--bubble">
      <span class="hero__avatar">TIC</span>
      <p><strong>${bubble[0]}</strong> ${bubble[1]}</p>
    </div>
    <div class="hero__float hero__float--card">
      <p class="hero__float-title">${checklist[0]}</p>
      <ul>
        ${checklist[1].map((item) => html`<li><span class="hero__check">✓</span>${item}</li>`)}
        <li><span class="hero__check hero__check--todo"></span>${checklist[2]}</li>
      </ul>
    </div>
  </div>`;

// Route: /
export default function page() {
  return html`
    <section class="hero" aria-roledescription="carousel" aria-label="Highlights" style="--slide-ms: ${SLIDE_MS}ms">
      <div class="hero__bg" aria-hidden="true">
        <div class="hero__layer" data-photos>${SLIDES.map(photoSet)}</div>
        <div class="hero__shade"></div>
        <div class="hero__layer" data-cards>${SLIDES.map(cardSet)}</div>
      </div>

      <div class="hero__slides">
        ${SLIDES.map(
          ({ title, tagline, cta: [href, label] }, i) => html`
            <div class="hero__slide" role="group" aria-roledescription="slide" aria-label="${i + 1} of ${SLIDES.length}"${i ? html` hidden` : ''}>
              <h1 class="hero__title">${title}</h1>
              <p class="tagline hero__tagline" style="--half: ${Math.ceil(tagline.length / 2) + 2}ch">${tagline}</p>
              <a class="btn hero__cta" href="${href}">${label}</a>
            </div>`,
        )}
      </div>

      <div class="hero__controls">
        <button class="hero__arrow" type="button" data-hero-prev aria-label="Previous slide">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
        </button>
        <div class="hero__dots">
          ${SLIDES.map(
            (_, i) => html`<button class="hero__dot" type="button" data-hero-dot="${i}" aria-label="Go to slide ${i + 1}"${i ? '' : html` aria-current="true"`}></button>`,
          )}
        </div>
        <button class="hero__arrow" type="button" data-hero-next aria-label="Next slide">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </section>`;
}

// Min space between any two items, and around the text. Items orbit on a
// radius (16px, hero-orbit in home.css), so this must exceed two radii.
const GAP = 40;
const rand = (min, max) => min + Math.random() * (max - min);
const overlaps = (a, b) =>
  a.x < b.x + b.w + GAP && b.x < a.x + a.w + GAP && a.y < b.y + b.h + GAP && b.y < a.y + a.h + GAP;

// Scatters a slide's cards and photos at random spots and sizes so that none
// of them overlap each other or the centred text/controls. Items may bleed a
// little off the hero's edges; one that can't fit even when shrunk is hidden.
function scatter(i, hero) {
  const cardSet = hero.querySelectorAll('[data-cards] > .hero__set')[i];
  const photoSet = hero.querySelectorAll('[data-photos] > .hero__set')[i];
  const box = hero.getBoundingClientRect();
  const rel = (el) => {
    const r = el.getBoundingClientRect();
    return { x: r.left - box.left, y: r.top - box.top, w: r.width, h: r.height };
  };
  // Block out the actual text lines, not the slide's box: the long first-slide
  // title makes its box span the full width, which left no room at the sides.
  const slide = hero.querySelector('.hero__slide:not([hidden])');
  const placed = [...slide.children].flatMap((child) => {
    const range = document.createRange();
    range.selectNodeContents(child);
    return [...range.getClientRects()].map((r) => ({ x: r.left - box.left, y: r.top - box.top, w: r.width, h: r.height }));
  });
  placed.push(rel(slide.querySelector('.hero__cta')), rel(hero.querySelector('.hero__controls')));

  // Unhide anything dropped last time so it can be measured and tried again.
  for (const el of [...cardSet.children, ...photoSet.children]) el.hidden = false;
  const cards = [...cardSet.children].filter((el) => el.offsetWidth); // 0 = hidden by CSS (phones)
  const photos = [...photoSet.children];
  const items = [
    ...cards.map((el) => ({ el, size: () => [el.offsetWidth, el.offsetHeight] })),
    ...photos.map((el) => {
      const ratio = el.getAttribute('height') / el.getAttribute('width');
      let w = rand(0.12, 0.2) * box.width;
      return { el, size: () => [w, w * ratio], shrink: () => (w *= 0.85) };
    }),
  ];

  for (const { el, size, shrink } of items) {
    let spot;
    for (let attempt = 0; attempt < 240 && !spot; attempt++) {
      if (shrink && attempt && attempt % 60 === 0) shrink();
      const [w, h] = size();
      const candidate = { x: rand(-0.2 * w, box.width - 0.8 * w), y: rand(-0.2 * h, box.height - 0.8 * h), w, h };
      if (!placed.some((p) => overlaps(candidate, p))) spot = candidate;
    }
    el.hidden = !spot;
    if (!spot) continue;
    placed.push(spot);
    el.style.left = `${spot.x}px`;
    el.style.top = `${spot.y}px`;
    if (shrink) el.style.width = `${spot.w}px`;
  }
}

// Auto-advances every SLIDE_MS (the active dot fills as a progress bar);
// arrows and dots jump. Paused while a keyboard user is focused inside,
// and off entirely for reduced motion.
export function mount(outlet) {
  const hero = outlet.querySelector('.hero');
  const slides = [...hero.querySelectorAll('.hero__slide')];
  const dots = [...hero.querySelectorAll('.hero__dot')];
  // Photo set i and card set i belong to slide i.
  const setsFor = (i) => hero.querySelectorAll(`.hero__layer > .hero__set:nth-child(${i + 1})`);
  const autoplay = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let index = 0;
  let timer;

  function show(next) {
    index = (next + slides.length) % slides.length;
    slides.forEach((slide, i) => (slide.hidden = i !== index));
    for (const set of hero.querySelectorAll('.hero__set[data-active]')) set.removeAttribute('data-active');
    for (const set of setsFor(index)) set.setAttribute('data-active', '');
    dots.forEach((dot, i) => (i === index ? dot.setAttribute('aria-current', 'true') : dot.removeAttribute('aria-current')));
    scatter(index, hero);
    restart();
  }

  function restart() {
    clearTimeout(timer);
    // Re-trigger the progress animation on the active dot.
    hero.removeAttribute('data-playing');
    void hero.offsetWidth;
    if (!autoplay || hero.querySelector(':focus-visible')) return;
    hero.setAttribute('data-playing', '');
    timer = setTimeout(() => show(index + 1), SLIDE_MS);
  }

  hero.addEventListener('click', (event) => {
    if (event.target.closest('[data-hero-prev]')) show(index - 1);
    else if (event.target.closest('[data-hero-next]')) show(index + 1);
    else {
      const dot = event.target.closest('[data-hero-dot]');
      if (dot) show(Number(dot.dataset.heroDot));
    }
  });
  hero.addEventListener('focusin', restart);
  hero.addEventListener('focusout', () => setTimeout(restart));

  let resizeTimer;
  const onResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => scatter(index, hero), 150);
  };
  window.addEventListener('resize', onResize);

  // Measure only once the web fonts are in: the fallback font sizes the title
  // differently, which put photos over the first slide's text.
  let gone = false;
  document.fonts.ready.then(() => {
    if (gone) return;
    scatter(index, hero);
    for (const set of setsFor(index)) set.setAttribute('data-active', '');
  });
  restart();
  return () => {
    gone = true;
    clearTimeout(timer);
    clearTimeout(resizeTimer);
    window.removeEventListener('resize', onResize);
  };
}
