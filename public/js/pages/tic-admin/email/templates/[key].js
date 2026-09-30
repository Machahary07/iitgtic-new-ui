import { html } from '../../../../lib/html.js';

export const title = 'Email Template';

// Route: /tic-admin/email/templates/[key]
export default function page({ params }) {
  return html`
    <section class="page">
      <h1>Email Template</h1>
      <dl class="muted">
        <dt>key</dt><dd><code>${params.key}</code></dd>
      </dl>
    </section>`;
}
