import { html } from '../../../lib/html.js';

export const title = 'Blog post';

// Route: /about/blog/[slug]
export default function page({ params }) {
  return html`
    <section class="page">
      <h1>Blog post</h1>
      <dl class="muted">
        <dt>slug</dt><dd><code>${params.slug}</code></dd>
      </dl>
    </section>`;
}
