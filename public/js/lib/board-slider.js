// People board slider (components/people-page.js), desktop and tablet.
//
// Every person has a slot on one path. Row 1 is: small, small, BIG, then four
// small (two on tablets). The big 3rd slot is the featured person, whose
// details sit above the small photos to its right. Anyone beyond row 1
// continues in rows below that
// snake back and forth: row 2 runs right to left from under row 1's end, row 3
// left to right, and so on. Clicking a photo moves everyone along the path,
// one slot at a time, until that photo reaches the big slot and grows into
// it. Clicking to the right of the big photo pulls row 1 left, row 2 right,
// row 3 left; clicking the one on its left does the opposite. Photos that run
// off either end of the path fade out and come back in at the other end.
// Phones show a plain grid instead (css/people.css), so nothing runs there.
import { loadGsap } from './gsap.js';

const GAP = 16;
const RATIO = 1.35; // photo height / width
const BIG = 2.4; // big photo width / small photo width
const STEP_S = 0.32; // seconds per slot travelled (capped overall)

const desktop = window.matchMedia('(min-width: 601px)');
const still = window.matchMedia('(prefers-reduced-motion: reduce)');

export function mountBoard(section) {
  const stage = section.querySelector('[data-stage]');
  const label = section.querySelector('.board__label'); // vertical title + tagline
  const title = label.querySelector('.board__title');
  const tagline = label.querySelector('.board__tagline');
  const infoBox = stage.querySelector('.board__info');
  const slides = [...stage.querySelectorAll('[data-slide]')];
  const panels = [...infoBox.querySelectorAll('[data-info]')];
  const n = slides.length;

  let gsap;
  let featured = 0;
  let slots = [];
  let animation;
  let alive = true;

  // Path position of person p. The featured person sits at F, the big slot
  // (3rd on the path, or earlier when there are fewer than three people);
  // the ones before them come before it, the ones after follow it.
  const F = Math.min(2, n - 1);
  const slotOf = (p, lead = featured) => (((p - lead + F) % n) + n) % n;

  const box = ({ x, y, w, h }) => ({ x, y, width: w, height: h });
  const put = (el, slot) => {
    if (gsap) return gsap.set(el, { ...box(slot), autoAlpha: 1, scale: 1 });
    Object.assign(el.style, { transform: `translate(${slot.x}px, ${slot.y}px)`, width: `${slot.w}px`, height: `${slot.h}px` });
  };

  const showPanel = (i) => {
    panels.forEach((panel, j) => {
      if (gsap) gsap.set(panel, { autoAlpha: j === i ? 1 : 0, y: 0 });
      else panel.style.visibility = j === i ? 'visible' : 'hidden';
    });
    slides.forEach((slide, j) => slide.toggleAttribute('aria-current', j === i));
  };

  function layout() {
    if (!desktop.matches || animation) return;
    const width = stage.clientWidth;
    const after = width >= 1000 ? 4 : 2; // small photos right of the big one
    const t = (width - (2 + after) * GAP) / (2 + after + BIG); // small photo width
    const b = t * BIG; // big photo width
    const th = t * RATIO;
    const bh = b * RATIO;

    // Details go above the small photos right of the big one; make room for
    // the tallest person's details.
    const infoW = after * t + (after - 1) * GAP;
    infoBox.style.width = `${infoW}px`;
    const infoH = Math.max(...panels.map((p) => p.offsetHeight));
    // The tagline sits beside the title above the two left photos: room for it too.
    label.style.width = `${2 * t + GAP}px`;
    const tagH = tagline?.offsetHeight ?? 0;
    const rowY = Math.max(bh - th, infoH + GAP, tagH + GAP); // top of row 1's small photos

    const small = (x) => ({ x, y: rowY, w: t, h: th });
    const big = { x: 2 * (t + GAP), y: 0, w: b, h: bh };
    const right = 2 * (t + GAP) + b + GAP; // first small photo right of the big one
    const row1 = [small(0), small(t + GAP), big, ...Array.from({ length: after }, (_, c) => small(right + c * (t + GAP)))];
    // With fewer than three people the path starts nearer the big slot.
    slots = n >= 3 ? row1 : n === 2 ? [row1[1], big] : [big];
    const cols = Math.max(2, Math.floor((width + GAP) / (t + GAP)));
    const step = (width - t) / (cols - 1); // columns spread flush to both edges
    const below = Math.max(bh, rowY + th) + GAP;
    for (let s = row1.length, row = 0; s < n; row++) {
      for (let c = 0; c < cols && s < n; c++, s++) {
        const fromRight = row % 2 === 0 ? c : cols - 1 - c; // snake: right→left, then left→right
        slots.push({ x: width - t - fromRight * step, y: below + row * (th + GAP), w: t, h: th });
      }
    }
    const used = slots.slice(0, n);
    stage.style.height = `${Math.max(...used.map((s) => s.y + s.h))}px`;
    Object.assign(infoBox.style, { left: `${right}px`, height: `${rowY - GAP}px` });

    // Vertical title with the tagline beside it, above the two small photos
    // left of the big one; a title too long for the column is scaled down.
    Object.assign(label.style, { top: `${stage.offsetTop}px`, left: `${stage.offsetLeft}px`, width: `${big.x - GAP}px`, height: `${rowY - GAP}px` });
    title.style.fontSize = '';
    const over = title.scrollHeight / title.clientHeight;
    if (over > 1) title.style.fontSize = `${parseFloat(getComputedStyle(title).fontSize) / over}px`;

    slides.forEach((slide, p) => put(slide, slots[slotOf(p)]));
    showPanel(featured);
    stage.setAttribute('data-ready', '');
  }

  function feature(target) {
    const lead = featured;
    const slot = slotOf(target);
    if (slot === F || animation) return;
    const dir = slot > F ? -1 : 1; // right of the big photo: everyone steps back along the path
    const steps = Math.abs(slot - F);
    featured = target;
    // Let the page follow along (people-page.js swaps its backdrop).
    section.dispatchEvent(new CustomEvent('board:feature', { bubbles: true, detail: { slide: slides[target] } }));

    if (!gsap || still.matches) return layout();

    const path = gsap.timeline({ paused: true });
    slides.forEach((slide, p) => {
      const moves = gsap.timeline();
      let at = slotOf(p, lead);
      for (let k = 0; k < steps; k++) {
        const next = at + dir;
        if (next < 0 || next >= n) {
          // Off one end of the path: fade out, reappear at the other end.
          at = (next + n) % n;
          moves
            .to(slide, { autoAlpha: 0, scale: 0.7, duration: 0.5, ease: 'none' })
            .set(slide, box(slots[at]))
            .to(slide, { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'none' });
        } else {
          at = next;
          moves.to(slide, { ...box(slots[at]), duration: 1, ease: 'none' });
        }
      }
      path.add(moves, 0);
    });
    gsap.set(slides[target], { zIndex: 2 });

    const duration = Math.min(0.35 + steps * STEP_S, 1.8);
    gsap.to(panels[lead], { autoAlpha: 0, y: -8, duration: 0.25 });
    gsap.fromTo(panels[target], { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.4, delay: duration * 0.65 });
    slides.forEach((slide, j) => slide.toggleAttribute('aria-current', j === target));

    animation = gsap.to(path, {
      progress: 1,
      duration,
      ease: 'power2.inOut',
      onComplete: () => {
        animation = undefined;
        path.kill();
        gsap.set(slides[target], { zIndex: '' });
        layout(); // settle exactly (and catch up on any resize meanwhile)
      },
    });
  }

  const onClick = (event) => {
    const slide = event.target.closest('[data-slide]');
    if (slide && desktop.matches) feature(Number(slide.dataset.slide));
  };
  stage.addEventListener('click', onClick);

  const resize = new ResizeObserver(() => layout());
  resize.observe(stage);
  desktop.addEventListener('change', layout);
  document.fonts?.ready.then(() => alive && layout());

  layout();
  loadGsap()
    .then((lib) => {
      if (!alive) return;
      gsap = lib.gsap;
      layout();
    })
    .catch((err) => console.error(err));

  return () => {
    alive = false;
    animation?.kill();
    stage.removeEventListener('click', onClick);
    resize.disconnect();
    desktop.removeEventListener('change', layout);
  };
}
