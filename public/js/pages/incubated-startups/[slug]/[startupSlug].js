import { html } from '../../../lib/html.js';

export const title = 'Startup';

// Route: /incubated-startups/[slug]/[startupSlug]
export default function page({ params }) {
  return html`
    <section class="page">
      <h1>Startup</h1>
      <dl class="muted">
        <dt>slug</dt><dd><code>${params.slug}</code></dd>
        <dt>startupSlug</dt><dd><code>${params.startupSlug}</code></dd>
      </dl>
    </section>`;
}
