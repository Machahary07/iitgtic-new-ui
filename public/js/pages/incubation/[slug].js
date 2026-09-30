import { html } from '../../lib/html.js';

export const title = 'Incubation';

// Route: /incubation/[slug]
export default function page({ params }) {
  return html`
    <section class="page">
      <h1>Incubation</h1>
      <dl class="muted">
        <dt>slug</dt><dd><code>${params.slug}</code></dd>
      </dl>
    </section>`;
}
