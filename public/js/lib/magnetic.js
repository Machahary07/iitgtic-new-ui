// Magnetic hover: an element marked [data-magnetic] leans toward the pointer
// while it's over it, and its [data-magnetic-inner] children lean further, so
// the content pulls harder than the button around it. Released, both glide
// back (the easing lives in base.css). Desktop only: needs a mouse/trackpad
// AND a viewport wider than tablets (so phones, tablets, and tablets with a
// trackpad are all excluded); off for reduced motion too. Uses the `translate`
// property so it never fights transforms.
const OUTER = 0.25; // share of the pointer's offset from centre
const INNER = 0.5;

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
    el.style.translate = `${dx * OUTER}px ${dy * OUTER}px`;
    for (const inner of el.querySelectorAll('[data-magnetic-inner]')) {
      inner.style.translate = `${dx * (INNER - OUTER)}px ${dy * (INNER - OUTER)}px`; // on top of the button's own shift
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
