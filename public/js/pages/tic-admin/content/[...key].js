import { html } from '../../../lib/html.js';

export const title = 'Content';

// Route: /tic-admin/content/[...key]
export default function page({ params }) {
  return html`
    <section class="page">
      <h1>Content</h1>
      <dl class="muted">
        <dt>key</dt><dd><code>${params.key}</code></dd>
      </dl>
    </section>`;
}
