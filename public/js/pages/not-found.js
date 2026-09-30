import { html } from '../lib/html.js';

export const title = 'Page not found';

export default function page({ path }) {
  return html`
    <section class="page">
      <h1>Page not found</h1>
      <p class="muted">Nothing lives at <code>${path}</code>.</p>
      <p><a href="/">Go to the home page</a></p>
    </section>`;
}
