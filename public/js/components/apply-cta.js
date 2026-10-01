import { html } from '../lib/html.js';

// Incubation keywords that tumble into the pit above the pitch, as
// [word, shape, tone]. Shapes: pill, circle, square; tones are the
// .physics-shape--* colours in base.css.
const KEYWORDS = [
  ['Mentorship', 'pill', 'green'],
  ['Seed funding', 'pill', 'black'],
  ['IP', 'circle', 'blue'],
  ['Ideas', 'square', 'sand'],
  ['Prototyping', 'pill', 'mint'],
  ['Lab access', 'pill', 'sky'],
  ['DeepTech', 'pill', 'blue'],
  ['Grants', 'circle', 'green'],
  ['Investors', 'pill', 'sand'],
  ['Pitch', 'square', 'black'],
  ['Market access', 'pill', 'sky'],
  ['Co-working', 'pill', 'mint'],
  ['MVP', 'circle', 'sand'],
  ['Validation', 'pill', 'green'],
  ['Scale', 'square', 'blue'],
];

// One copy of the marquee's words; the track holds two so it loops seamlessly,
// and each copy is wider than any screen.
const THANKS = Array.from({ length: 6 }, () => html`<span>Thank You for Visiting!</span><i></i>`);

// "Apply for incubation" call to action: two crossing "thank
// you" marquees, a pit of
// draggable keyword shapes
// (lib/physics-pit.js), a two-line pitch and an Apply pill with a ↗ arrow,
// on white with rounded bottom corners (.apply-cta in base.css). The button
// is magnetic (lib/magnetic.js).
export const applyCta = () => html`
  <section class="apply-cta" aria-labelledby="apply-cta-title">
    <div class="apply-cta__thanks" role="marquee" aria-label="Thank You for Visiting!">
      ${['a', 'b'].map(
        (band) => html`
          <div class="apply-cta__band apply-cta__band--${band}" aria-hidden="true">
            <div class="apply-cta__thanks-track">${[0, 1].map(() => html`<span class="apply-cta__thanks-group">${THANKS}</span>`)}</div>
          </div>`,
      )}
    </div>
    <div class="physics-pit" data-physics-pit>
      ${KEYWORDS.map(([word, shape, tone]) => html`<span class="physics-shape physics-shape--${shape} physics-shape--${tone}" data-shape="${shape}">${word}</span>`)}
    </div>
    <h2 class="apply-cta__title" id="apply-cta-title">Building DeepTech?<br />Incubate it with us.</h2>
    <a class="apply-cta__button" href="/apply" data-magnetic>
      <span data-magnetic-inner>Apply</span>
      <span class="apply-cta__arrow" aria-hidden="true" data-magnetic-inner>
        <svg viewBox="0 0 24 24"><path d="M7 17 17 7M8 7h9v9" /></svg>
      </span>
    </a>
  </section>`;
