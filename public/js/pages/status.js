import { html } from '../lib/html.js';
import { getHealth } from '../api.js';

export const title = 'Status';

// Route: /status
export default function page() {
  return html`
    <section class="page">
      <h1>Status</h1>
      <p>Server: <span class="pill" data-status>checking…</span></p>
    </section>`;
}

export async function mount(el) {
  const badge = el.querySelector('[data-status]');
  try {
    const { status } = await getHealth();
    badge.textContent = status;
    badge.classList.add('pill--good');
  } catch {
    badge.textContent = 'unreachable';
    badge.classList.add('pill--bad');
  }
}
