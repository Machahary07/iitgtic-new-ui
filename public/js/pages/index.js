import { html } from '../lib/html.js';
import { loadGsap } from '../lib/gsap.js';
import { applyCta } from '../components/apply-cta.js';

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

const SLIDE_MS = 4500;

const ASSOCIATES = [
  ['iitguwahati_logo.jpg', 'IIT Guwahati'],
  ['meity_logo.jpg', 'Ministry of Electronics and Information Technology'],
  ['msme_logo.jpg', 'Ministry of Micro, Small and Medium Enterprises'],
  ['startupindia_logo.jpg', 'Startup India'],
  ['technologydevelopmentboard_logo.jpg', 'Technology Development Board'],
];

// Infinite logo marquee: two identical halves, the track slides by -50% and
// loops. Each half repeats the list so it's always wider than the window.
const associationMarquee = () => html`
  <section class="association" aria-label="In association with">
    <p class="association__eyebrow">In association with</p>
    <div class="association__window">
      <div class="association__track">
        ${[0, 1].map(
          (half) => html`
            <div class="association__group"${half ? html` aria-hidden="true"` : ''}>
              ${[...ASSOCIATES, ...ASSOCIATES].map(
                ([file, name], n) => html`
                  <div class="association__item">
                    <img src="/img/in-association-logos/${file}" alt="${half || n >= ASSOCIATES.length ? '' : name}" loading="lazy" decoding="async" />
                  </div>`,
              )}
            </div>`,
        )}
      </div>
    </div>
  </section>`;

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
    <section class="hero" data-fx-pending aria-roledescription="carousel" aria-label="Highlights" style="--slide-ms: ${SLIDE_MS}ms">
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
              <a class="btn hero__cta" href="${href}" data-magnetic><span class="hero__cta-label" data-magnetic-inner>${label}</span></a>
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
    </section>
    ${associationMarquee()}
    ${applyCta()}`;
}

// Min space between any two items, and around the text. Items orbit on a
// radius (16px, hero-orbit in home.css), so this must exceed two radii.
const GAP = 72;
const rand = (min, max) => min + Math.random() * (max - min);
const overlaps = (a, b, gap) =>
  a.x < b.x + b.w + gap && b.x < a.x + a.w + gap && a.y < b.y + b.h + gap && b.y < a.y + a.h + gap;

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
  const small = box.width < 700; // phones: fewer, larger photos with less spacing
  const gap = small ? 20 : GAP;
  const items = [
    ...cards.map((el) => ({ el, size: () => [el.offsetWidth, el.offsetHeight] })),
    ...photos.map((el) => {
      const ratio = el.getAttribute('height') / el.getAttribute('width');
      let w = (small ? rand(0.26, 0.34) : rand(0.08, 0.13)) * box.width;
      return { el, size: () => [w, w * ratio], shrink: () => (w *= 0.85) };
    }),
  ];

  for (const { el, size, shrink } of items) {
    let spot;
    for (let attempt = 0; attempt < 240 && !spot; attempt++) {
      if (shrink && attempt && attempt % 60 === 0) shrink();
      const [w, h] = size();
      const candidate = { x: rand(-0.2 * w, box.width - 0.8 * w), y: rand(-0.2 * h, box.height - 0.8 * h), w, h };
      if (!placed.some((p) => overlaps(candidate, p, gap))) spot = candidate;
    }
    el.hidden = !spot;
    if (!spot) continue;
    placed.push(spot);
    el.style.left = `${spot.x}px`;
    el.style.top = `${spot.y}px`;
    if (shrink) el.style.width = `${spot.w}px`;
  }
}

// Slide text transitions (GSAP SplitText). Leaving: title letters and tagline
// words drop away last-to-first, and the button's letters shrink from both
// ends to the middle while the button closes into a circle. Entering is the
// reverse: text rises first-to-last, the circle opens and its letters grow
// from the middle outwards.
function createTextFx(gsap, SplitText, slides) {
  const parts = slides.map((slide) => {
    const cta = slide.querySelector('.hero__cta');
    return {
      title: SplitText.create(slide.querySelector('.hero__title'), { type: 'words,chars' }),
      tagline: SplitText.create(slide.querySelector('.hero__tagline'), { type: 'words' }),
      cta,
      label: SplitText.create(cta.querySelector('.hero__cta-label'), { type: 'chars' }),
    };
  });

  // Button morph, pill <-> circle. The close is the open mirrored in time:
  // open  = circle widens (0-0.55s), letters grow from the centre out (0.2-0.75s)
  // close = letters shrink from the edges in (0-0.55s), circle closes (0.2-0.75s)
  // The label is centred in the button, so the sides clip it evenly.
  const MORPH = { width: 0.55, letters: 0.3, spread: 0.25, lag: 0.2 };

  function buttonShapes(cta) {
    const { paddingLeft, paddingRight } = getComputedStyle(cta);
    return {
      pill: { width: cta.offsetWidth, paddingLeft, paddingRight },
      circle: { width: cta.offsetHeight, paddingLeft: 0, paddingRight: 0 },
    };
  }

  function openButton(i) {
    const { cta, label } = parts[i];
    const { pill, circle } = buttonShapes(cta); // measured at rest
    gsap.set(cta, circle);
    gsap.set(label.chars, { scale: 0, opacity: 0 });
    return gsap
      .timeline()
      .to(cta, { ...pill, duration: MORPH.width, ease: 'power3.inOut' }, 0)
      .to(label.chars, { scale: 1, opacity: 1, duration: MORPH.letters, ease: 'power2.out', stagger: { amount: MORPH.spread, from: 'center' } }, MORPH.lag);
  }

  function closeButton(i) {
    const { cta, label } = parts[i];
    const { pill, circle } = buttonShapes(cta);
    gsap.set(cta, pill);
    return gsap
      .timeline()
      .to(label.chars, { scale: 0, opacity: 0, duration: MORPH.letters, ease: 'power2.in', stagger: { amount: MORPH.spread, from: 'edges' } }, 0)
      .to(cta, { ...circle, duration: MORPH.width, ease: 'power3.inOut' }, MORPH.lag);
  }

  const settle = (i) => gsap.set(parts[i].cta, { clearProps: 'width,paddingLeft,paddingRight' });

  function leave(i) {
    const { title, tagline } = parts[i];
    const tl = gsap
      .timeline()
      .to(title.chars, { yPercent: 60, opacity: 0, duration: 0.4, ease: 'power2.in', stagger: { each: 0.012, from: 'end' } }, 0)
      .to(tagline.words, { yPercent: 60, opacity: 0, duration: 0.35, ease: 'power2.in', stagger: { each: 0.015, from: 'end' } }, 0);
    return Promise.all([tl, closeButton(i)]);
  }

  // Puts a slide's text back at rest (so it can be measured).
  function reset(i) {
    const { title, tagline, label } = parts[i];
    // Clear only what the tweens set: SplitText keeps its own inline styles.
    gsap.set([...label.chars, ...title.chars, ...tagline.words], { clearProps: 'transform,opacity' });
    settle(i);
  }

  function enter(i) {
    const { title, tagline } = parts[i];
    reset(i);
    const button = openButton(i).delay(0.2);
    const tl = gsap
      .timeline()
      .from(title.chars, { yPercent: 60, opacity: 0, duration: 0.6, ease: 'power3.out', stagger: { each: 0.018, from: 'start' } }, 0)
      .from(tagline.words, { yPercent: 60, opacity: 0, duration: 0.5, ease: 'power3.out', stagger: { each: 0.03, from: 'start' } }, 0.15);
    return Promise.all([tl, button]).then(() => settle(i));
  }

  return {
    leave,
    reset,
    enter,
    kill: () => {
      gsap.killTweensOf('*');
      for (const p of parts) for (const split of [p.title, p.tagline, p.label]) split.revert();
    },
  };
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
  let fx; // text animations, once GSAP has loaded
  let busy = false;

  async function show(next) {
    if (busy) return;
    const from = index;
    index = (next + slides.length) % slides.length;
    if (index === from) return;
    dots.forEach((dot, i) => (i === index ? dot.setAttribute('aria-current', 'true') : dot.removeAttribute('aria-current')));
    restart();

    busy = true;
    if (fx) await fx.leave(from);
    slides.forEach((slide, i) => (slide.hidden = i !== index));
    fx?.reset(index);
    scatter(index, hero); // measure the text at rest, before it animates in
    // Swap backgrounds only once the new ones are placed.
    for (const set of hero.querySelectorAll('.hero__set[data-active]')) set.removeAttribute('data-active');
    for (const set of setsFor(index)) set.setAttribute('data-active', '');
    if (fx) await fx.enter(index);
    busy = false;
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
  const reveal = () => hero.removeAttribute('data-fx-pending');
  document.fonts.ready.then(async () => {
    if (gone) return;
    scatter(index, hero);
    for (const set of setsFor(index)) set.setAttribute('data-active', '');
    if (!autoplay) return reveal(); // reduced motion: no text animation
    // The text stays hidden until GSAP arrives; give up after 3s and show it.
    const fallback = setTimeout(reveal, 3000);
    try {
      const { gsap, SplitText } = await loadGsap();
      if (gone) return;
      fx = createTextFx(gsap, SplitText, slides);
      clearTimeout(fallback);
      reveal();
      busy = true;
      await fx.enter(index);
      busy = false;
    } catch (err) {
      console.error(err);
      reveal();
    }
  });
  restart();
  return () => {
    gone = true;
    fx?.kill();
    clearTimeout(timer);
    clearTimeout(resizeTimer);
    window.removeEventListener('resize', onResize);
  };
}
