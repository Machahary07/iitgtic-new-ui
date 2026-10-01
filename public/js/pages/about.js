import { html } from '../lib/html.js';
import { applyCta } from '../components/apply-cta.js';
import { createLineObject } from '../lib/line-objects.js';
import { CONTENT } from '../data/content.js';

export const title = 'About';

const STATEMENT =
  'We help Northeast India’s DeepTech founders turn research into ventures, with the workspace, mentorship and seed funding to take them to global markets.';

// "Inside IITG-TIC" cards (content from the current site's About page), each
// with its own 3D line doodle (lib/line-objects.js).
const HAPPENS = [
  {
    chip: 'Who we are',
    title: 'A space where ideas become ventures.',
    text: 'A platform where budding entrepreneurs can start a venture with minimum risk, backed by mentors with multidisciplinary expertise.',
    cta: ['/team', 'Meet the TIC Team'],
    doodle: 'bulb',
  },
  {
    chip: 'Our mission',
    title: 'Encouraging entrepreneurship across the North-East.',
    text: 'For the IITG community and technical institutions of the North-East, with a focus on high-growth, knowledge-based businesses.',
    cta: ['/mentors', 'Meet our Mentors'],
    doodle: 'compass',
  },
  {
    chip: 'Infrastructure & support',
    title: '4,000 m² inside the Technology Complex.',
    text: 'Technical support, business mentoring and a soft-loan facility, subject to availability.',
    cta: ['/incubation', 'Explore Incubation'],
    doodle: 'building',
  },
  {
    chip: 'Funding & recognition',
    title: 'Backed by the Government of India.',
    text: 'Infrastructure and soft-loan funds from the Department of Information Technology; an MSME-approved incubator with TDB grant assistance.',
    cta: ['/schemes/funding', 'See Funding Schemes'],
    doodle: 'coins',
  },
  {
    chip: 'Governance',
    title: 'Directed by a Governing Body.',
    text: 'Chaired by the Director of IIT Guwahati, with the management team led by a Chief Executive Officer.',
    cta: ['/governing-body', 'Meet the Governing Body'],
    doodle: 'pillars',
  },
];

const happensCard = ({ chip, title, text, cta: [href, label], doodle }) => html`
  <li class="happens__card" data-magnetic="0">
    <span class="happens__chip">${chip}</span>
    <canvas class="happens__doodle" data-object="${doodle}" data-magnetic-inner="0.1" aria-hidden="true"></canvas>
    <div class="happens__body">
      <h3 class="happens__title">${title}</h3>
      <p class="happens__text">${text}</p>
      <a class="happens__cta" href="${href}">${label}</a>
    </div>
  </li>`;

const inside = () => html`
  <section class="happens" id="inside" aria-labelledby="happens-title">
    <div class="happens__blob happens__blob--bottom" aria-hidden="true"></div>
    <header class="happens__head">
      <h2 class="happens__heading" id="happens-title">Inside IITG&#8209;TIC</h2>
    </header>
    <ul class="happens__track" data-happens-track>
      ${HAPPENS.map(happensCard)}
    </ul>
    <div class="happens__nav">
      <button class="happens__arrow" type="button" data-happens-prev aria-label="Previous">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
      </button>
      <button class="happens__arrow" type="button" data-happens-next aria-label="Next">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
      </button>
    </div>
  </section>`;

// "In association with": plain tiles, one per partner (content.json).
const partners = () => html`
  <section class="partners" id="partners" aria-labelledby="partners-title">
    <header class="partners__head">
      <p class="partners__eyebrow">In association with</p>
      <h2 class="partners__title" id="partners-title">Who we build with.</h2>
      <p class="partners__intro">
        The centre's work is supported by a network across government, industry and academia, each contributing the capital,
        frameworks or recognition that make our incubation programmes possible.
      </p>
    </header>
    <ul class="partners__grid">
      ${CONTENT.partners.map(
        ({ name, short, logo }) => html`
          <li class="partners__card">
            <img class="partners__logo" src="${logo}" alt="" loading="lazy" decoding="async" />
            <span class="partners__name">${short ?? name}</span>
          </li>`,
      )}
    </ul>
  </section>`;

// Route: /about
// A statement over two soft shapes (a circle and a tilted rounded rectangle)
// that each drift within their own radius. Where a shape passes behind the
// text, the text takes that shape's ink: two copies of the statement sit on
// top of the base one, each clipped (per frame) to one shape's outline.
export default function page() {
  // Both sections share one background (.about-page) so their shapes can
  // drift across the boundary instead of being cut off at it.
  return html`
    <div class="about-page">
    <section class="about">
      <div class="about__shape about__shape--circle" aria-hidden="true"></div>
      <div class="about__shape about__shape--rect" aria-hidden="true"></div>
      <div class="about__copy">
        <img class="about__logo" src="/img/tic-symbol.svg" alt="" width="72" height="72" />
        <p class="about__eyebrow">About IITG-TIC</p>
        <div class="about__stack">
          <h1 class="about__statement">${STATEMENT}</h1>
          <p class="about__statement about__statement--on-circle" aria-hidden="true">${STATEMENT}</p>
          <p class="about__statement about__statement--on-rect" aria-hidden="true">${STATEMENT}</p>
        </div>
        <p class="about__governed">
          Directed by the <a href="/governing-body">Governing Body</a> and the
          <a href="/committee-of-management">Committee of Management</a> of IITG,<br />
          run day to day by the <a href="/team">TIC Team</a> and
          <a href="/tic-coordinators">TIC Coordinators</a>,<br />
          with incubatees guided by our <a href="/mentors">Mentors</a>.
        </p>
      </div>
    </section>
    ${inside()}
    ${partners()}
    </div>
    ${applyCta()}`;
}

// Shape geometry as fractions of the section, plus how far each may wander.
const SHAPES = {
  circle: { cx: 0.08, cy: 0.02, size: 0.34, drift: 70, speed: [0.23, 0.17] },
  rect: { cx: 0.92, cy: 0.9, w: 0.46, aspect: 1.29, radius: 120, angle: -9, drift: 80, speed: [0.19, 0.29] },
};
// Sizes scale with the section width but never below this, and the rectangle
// keeps a fixed aspect, so on phones the shapes keep their desktop look
// instead of shrinking into a tall sliver.
const MIN_BASE = 900;

// Clip path for a rounded rectangle rotated about its centre (px, relative to
// the element being clipped).
function roundedRectPath(cx, cy, w, h, r, deg) {
  const a = (deg * Math.PI) / 180;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  const pt = (x, y) => `${(cx + x * cos - y * sin).toFixed(1)} ${(cy + x * sin + y * cos).toFixed(1)}`;
  const x = w / 2;
  const y = h / 2;
  const arc = (px, py) => `A ${r} ${r} 0 0 1 ${pt(px, py)}`;
  return `path('M ${pt(-x + r, -y)} L ${pt(x - r, -y)} ${arc(x, -y + r)} L ${pt(x, y - r)} ${arc(x - r, y)} L ${pt(-x + r, y)} ${arc(-x, y - r)} L ${pt(-x, -y + r)} ${arc(-x + r, -y)} Z')`;
}

export function mount(outlet) {
  const section = outlet.querySelector('.about');
  const stack = section.querySelector('.about__stack');
  const circle = section.querySelector('.about__shape--circle');
  const rect = section.querySelector('.about__shape--rect');
  const onCircle = section.querySelector('.about__statement--on-circle');
  const onRect = section.querySelector('.about__statement--on-rect');
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let box = section.getBoundingClientRect();
  let stackBox = stack.getBoundingClientRect();
  const measure = () => {
    box = section.getBoundingClientRect();
    stackBox = stack.getBoundingClientRect();
  };
  const resize = new ResizeObserver(() => {
    measure();
    draw(time());
  });
  resize.observe(section);

  // Wander: a Lissajous path whose offset never exceeds `drift` px.
  const wander = ({ drift, speed: [sx, sy] }, t) => [
    drift * 0.7 * Math.sin(t * sx) + drift * 0.3 * Math.sin(t * sx * 2.3 + 1),
    drift * 0.7 * Math.sin(t * sy + 2) + drift * 0.3 * Math.cos(t * sy * 1.7),
  ];

  function draw(t) {
    const W = box.width;
    const H = box.height;
    // Offsets of the text stack inside the section, to clip in its own coords.
    const ox = stackBox.left - box.left;
    const oy = stackBox.top - box.top;

    const c = SHAPES.circle;
    const base = Math.max(W, MIN_BASE);
    const d = Math.min(c.size * base, 640);
    const [cdx, cdy] = wander(c, t);
    const ccx = c.cx * W + cdx;
    const ccy = c.cy * H + cdy;
    circle.style.cssText = `width:${d}px;height:${d}px;translate:${ccx - d / 2}px ${ccy - d / 2}px`;
    onCircle.style.clipPath = `circle(${d / 2}px at ${ccx - ox}px ${ccy - oy}px)`;

    const r = SHAPES.rect;
    const w = r.w * base;
    const h = w * r.aspect;
    const [rdx, rdy] = wander(r, t);
    const angle = r.angle + 3 * Math.sin(t * 0.21);
    const rcx = r.cx * W + rdx;
    const rcy = r.cy * H + rdy;
    rect.style.cssText = `width:${w}px;height:${h}px;border-radius:${r.radius}px;translate:${rcx - w / 2}px ${rcy - h / 2}px;rotate:${angle}deg`;
    onRect.style.clipPath = roundedRectPath(rcx - ox, rcy - oy, w, h, r.radius, angle);
  }

  const t0 = performance.now();
  const time = () => (still ? 0 : (performance.now() - t0) / 1000);
  let frame;
  const loop = () => {
    draw(time());
    frame = requestAnimationFrame(loop);
  };
  draw(0);
  if (!still) frame = requestAnimationFrame(loop);

  const stopHappens = mountHappens(section.parentElement.querySelector('.happens'));

  return () => {
    cancelAnimationFrame(frame);
    resize.disconnect();
    stopHappens();
  };
}

// Cards carousel: arrows scroll one card. Each doodle is created when its
// card first comes into view and stays assembled until hovered: over the
// card it explodes and tilts toward the pointer (and, via magnetic.js,
// drifts toward it); leaving puts it back together.
function mountHappens(section) {
  const track = section.querySelector('[data-happens-track]');
  const step = () => {
    const card = track.querySelector('.happens__card');
    return card.offsetWidth + parseFloat(getComputedStyle(track).columnGap || 0);
  };
  section.querySelector('[data-happens-prev]').addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
  section.querySelector('[data-happens-next]').addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));

  const doodles = new Map(); // canvas -> promise of controller
  const seen = new IntersectionObserver(
    (entries) => {
      for (const { target, isIntersecting } of entries) {
        if (!doodles.has(target)) {
          if (!isIntersecting) continue;
          doodles.set(
            target,
            createLineObject(target, target.dataset.object, { interactive: true }).catch((err) => {
              console.error(err);
              target.remove();
            }),
          );
        }
      }
    },
    { rootMargin: '0px 200px' },
  );
  for (const canvas of section.querySelectorAll('.happens__doodle')) seen.observe(canvas);

  const doodleOf = (card) => doodles.get(card.querySelector('.happens__doodle'));
  for (const card of section.querySelectorAll('.happens__card')) {
    card.addEventListener('pointerenter', () => doodleOf(card)?.then((o) => o?.explode(true)));
    card.addEventListener('pointerleave', () =>
      doodleOf(card)?.then((o) => {
        o?.explode(false);
        o?.tilt(0, 0);
      }),
    );
    card.addEventListener('pointermove', (event) => {
      const r = card.getBoundingClientRect();
      const x = ((event.clientX - r.left) / r.width) * 2 - 1;
      const y = ((event.clientY - r.top) / r.height) * 2 - 1;
      doodleOf(card)?.then((o) => o?.tilt(x, y));
    });
  }

  return () => {
    seen.disconnect();
    for (const pending of doodles.values()) pending.then((o) => o?.dispose());
  };
}
