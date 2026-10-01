// "Thank you" marquee bands on the Apply CTA (components/apply-cta.js): GSAP
// drives the loop so it can follow the scroll. While the page is being
// scrolled (ScrollTrigger) the bands speed up with the scroll speed, then ease
// back to normal once it stops. Scrolling down runs each band its own way;
// scrolling back up turns both round.
// Until GSAP arrives (or with reduced motion) the CSS animation in base.css
// does the plain loop.
import { loadScrollTrigger } from './gsap.js';

const LOOP_S = 30; // seconds per loop, same as the CSS fallback
const MAX_BOOST = 8; // fastest scroll-driven speed, as a multiple of normal
const SETTLE_S = 0.15; // quiet time after the last scroll before slowing down
const still = window.matchMedia('(prefers-reduced-motion: reduce)');

async function createMarquee(thanks) {
  const { gsap, ScrollTrigger } = await loadScrollTrigger();
  if (!thanks.isConnected) return;

  thanks.setAttribute('data-marquee-js', ''); // switches the CSS loop off
  const tweens = [...thanks.querySelectorAll('.apply-cta__thanks-track')].map((track, i) =>
    // Band A moves left, band B right (from -50% back to 0).
    i === 0
      ? gsap.fromTo(track, { xPercent: 0 }, { xPercent: -50, duration: LOOP_S, ease: 'none', repeat: -1 })
      : gsap.fromTo(track, { xPercent: -50 }, { xPercent: 0, duration: LOOP_S, ease: 'none', repeat: -1 }),
  );
  // Start deep into the endless loop, so running backwards never hits time 0.
  for (const tween of tweens) tween.totalTime(LOOP_S * 1000);

  let direction = 1;
  const speed = (timeScale, duration, ease) => {
    for (const tween of tweens) gsap.to(tween, { timeScale, duration, ease, overwrite: true });
  };
  const settle = gsap.delayedCall(SETTLE_S, () => speed(direction, 1.2, 'power2.out')).pause();

  const trigger = ScrollTrigger.create({
    trigger: thanks,
    start: 'top bottom',
    end: 'bottom top',
    onUpdate: (self) => {
      if (!thanks.isConnected) return destroy();
      direction = self.direction;
      const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 250, MAX_BOOST - 1);
      speed(direction * boost, 0.3, 'power1.out');
      settle.restart(true);
    },
  });

  // The page re-rendered without this CTA: stop the loops.
  const gone = new MutationObserver(() => !thanks.isConnected && destroy());
  gone.observe(document.body, { childList: true, subtree: true });

  function destroy() {
    gone.disconnect();
    trigger.kill();
    settle.kill();
    for (const tween of tweens) tween.kill();
  }
}

const found = new WeakSet();
function scan() {
  if (still.matches) return;
  for (const thanks of document.querySelectorAll('.apply-cta__thanks')) {
    if (found.has(thanks)) continue;
    found.add(thanks);
    createMarquee(thanks).catch((err) => console.error(err));
  }
}
new MutationObserver(scan).observe(document.body, { childList: true, subtree: true });
scan();
