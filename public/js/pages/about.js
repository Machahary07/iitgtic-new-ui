import { html } from '../lib/html.js';

export const title = 'About';

// Route: /about
export default function page() {
  return html`
    <section class="page">
      <h1>About</h1>
    </section>`;
}
