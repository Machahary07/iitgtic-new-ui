import { html } from '../../lib/html.js';

export const title = 'Incubated Startups';

// Route: /incubated-startups/[slug]
export default function page({ params }) {
  return html`
    <section class="page">
      <h1>Incubated Startups</h1>
      <dl class="muted">
        <dt>slug</dt><dd><code>${params.slug}</code></dd>
      </dl>
    </section>`;
}
