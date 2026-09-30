import { loadGsap } from './gsap.js';

// Desktop dropdown links: on hover the label rolls up word by word (GSAP
// SplitText) while an identical copy rolls in from below. It plays once per
// hover and always finishes, even if the pointer leaves mid-roll; once done
// and not hovered it snaps back to the start, which is invisible because both
// copies read the same. Markup (layouts/site.js):
//   <span class="roll" data-roll><span class="roll__line">Team</span><span class="roll__line" aria-hidden="true">Team</span></span>
// .roll clips to one line, so without JS only the first line shows. Set up
// lazily on a link's first hover; desktop only, off for reduced motion.
const desktop = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 901px)');
const still = window.matchMedia('(prefers-reduced-motion: reduce)');
const rolls = new WeakMap(); // link -> promise of { tl }

async function setUp(link) {
  const { gsap, SplitText } = await loadGsap();
  const lines = link.querySelectorAll('.roll__line');
  const words = [...lines].map((line) => SplitText.create(line, { type: 'words' }).words);
  // Each word moves up by its own height (one line), first word first.
  // Wrapped in an object: a GSAP timeline is thenable, so awaiting a promise
  // of the bare (paused) timeline would wait for it to finish, i.e. forever.
  const tl = gsap
    .timeline({ paused: true, onComplete: () => !link.matches(':hover') && tl.pause(0) })
    .to(words[0], { yPercent: -100, duration: 0.45, ease: 'power3.inOut', stagger: 0.06 }, 0)
    .to(words[1], { yPercent: -100, duration: 0.45, ease: 'power3.inOut', stagger: 0.06 }, 0);
  return { tl };
}

async function roll(link, forward) {
  if (!rolls.has(link)) rolls.set(link, setUp(link));
  try {
    const { tl } = await rolls.get(link);
    if (tl.isActive()) return; // mid-roll: let it finish (onComplete resets if left)
    if (forward) tl.restart();
    else tl.pause(0);
  } catch (err) {
    console.error(err); // GSAP failed to load: links still work, just no roll
  }
}

document.addEventListener('pointerover', (event) => {
  if (!desktop.matches || still.matches) return;
  const link = event.target.closest?.('.nav-menu__card a');
  if (!link || link.contains(event.relatedTarget)) return;
  roll(link, true);
  link.addEventListener('pointerleave', () => roll(link, false), { once: true });
});
