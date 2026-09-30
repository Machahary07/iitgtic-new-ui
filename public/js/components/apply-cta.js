import { html } from '../lib/html.js';

// "Apply for incubation" call to action: a two-line pitch and an Apply pill
// with a ↗ arrow, on white with rounded bottom corners (.apply-cta in
// base.css). The button is magnetic (lib/magnetic.js).
export const applyCta = () => html`
  <section class="apply-cta" aria-labelledby="apply-cta-title">
    <h2 class="apply-cta__title" id="apply-cta-title">Building DeepTech?<br />Incubate it with us.</h2>
    <a class="apply-cta__button" href="/apply" data-magnetic>
      <span data-magnetic-inner>Apply</span>
      <span class="apply-cta__arrow" aria-hidden="true" data-magnetic-inner>
        <svg viewBox="0 0 24 24"><path d="M7 17 17 7M8 7h9v9" /></svg>
      </span>
    </a>
  </section>`;
