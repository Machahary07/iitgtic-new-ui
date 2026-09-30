import { html } from '../../../lib/html.js';

export const title = 'Job Application';

// Route: /tic-admin/job-applications/[id]
export default function page({ params }) {
  return html`
    <section class="page">
      <h1>Job Application</h1>
      <dl class="muted">
        <dt>id</dt><dd><code>${params.id}</code></dd>
      </dl>
    </section>`;
}
