// Magnetic hover: an element marked [data-magnetic] leans toward the pointer
// while it's over it, and its [data-magnetic-inner] children lean further, so
// the content pulls harder than the button around it. Released, both glide
// back (the easing lives in base.css). Desktop only: needs a mouse/trackpad
// AND a viewport wider than tablets (so phones, tablets, and tablets with a
// trackpad are all excluded); off for reduced motion too. Uses the `translate`
// property so it never fights transforms.
// Share of the pointer's offset from centre. Override per element with a
// number: data-magnetic="0.05" (outer) / data-magnetic-inner="0.12" (total
// pull for that inner element), e.g. gentler for big cards.
const OUTER = 0.25;
const INNER = 0.5;
const strength = (value, fallback) => (value && !Number.isNaN(+value) ? +value : fallback);

const desktop = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 1025px)');
const still = window.matchMedia('(prefers-reduced-motion: reduce)');

let active;

function release(el) {
  el.removeAttribute('data-magnetic-active');
  el.style.translate = '';
  for (const inner of el.querySelectorAll('[data-magnetic-inner]')) inner.style.translate = '';
}

document.addEventListener(
  'pointermove',
  (event) => {
    const el = desktop.matches && !still.matches ? event.target.closest?.('[data-magnetic]') : null;
    if (active && active !== el) release(active);
    active = el;
    if (!el) return;

    const r = el.getBoundingClientRect();
    const dx = event.clientX - (r.left + r.width / 2);
    const dy = event.clientY - (r.top + r.height / 2);
    el.setAttribute('data-magnetic-active', '');
    const outer = strength(el.dataset.magnetic, OUTER);
    el.style.translate = `${dx * outer}px ${dy * outer}px`;
    for (const inner of el.querySelectorAll('[data-magnetic-inner]')) {
      const pull = strength(inner.dataset.magneticInner, INNER) - outer; // on top of the outer shift
      inner.style.translate = `${dx * pull}px ${dy * pull}px`;
    }
  },
  { passive: true },
);

document.addEventListener('pointerleave', () => active && release(active));
document.addEventListener('pointerout', (event) => {
  if (active && !event.relatedTarget?.closest?.('[data-magnetic]')) {
    release(active);
    active = undefined;
  }
});

// Resizing down to tablet width mid-hover: let go at once.
desktop.addEventListener('change', () => {
  if (active) release(active);
  active = undefined;
});
