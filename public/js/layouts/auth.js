import { html } from '../lib/html.js';

export default function authLayout(content) {
  return html`
    <div class="auth">
      <a class="site-logo" href="/">IITG TIC</a>
      <main class="auth__card" data-outlet>${content}</main>
    </div>`;
}
