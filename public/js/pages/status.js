import { html } from '../lib/html.js';
import { icon } from '../lib/icons.js';
import { CONTENT } from '../data/content.js';
import { getHealth } from '../api.js';

export const title = 'Status';

// Route: /status — how far the new website has come (content.json `status`).
// A dark pill track runs through the three stages (big circles) and their
// tasks (small circles); the lit bar reaches up to the first task still open.
// Below it, a breakdown per stage. States: 'done', 'progress', 'todo'.

const { status } = CONTENT;
const items = status.stages.flatMap((s) => s.items);
const done = items.filter((i) => i.state === 'done').length;
// Progress is weighted by size: a task covering several pages counts once
// per page, anything else once.
const weight = (i) => i.pages ?? 1;
const sum = (list) => list.reduce((n, i) => n + weight(i), 0);
const percent = (list) => Math.round((sum(list.filter((i) => i.state === 'done')) / sum(list)) * 100);
const stageState = ({ items }) => (items.every((i) => i.state === 'done') ? 'done' : items.some((i) => i.state !== 'todo') ? 'progress' : 'todo');
const STATE_LABEL = { done: 'Done', progress: 'In progress', todo: 'Up next' };
// Frontend tasks carry `pages`: how many routes in pages.md they cover.
const pageCount = (list) => list.reduce((n, i) => n + (i.pages ?? 0), 0);
const pagesBuilt = pageCount(items.filter((i) => i.state === 'done'));
const pagesTotal = pageCount(items);

// Track nodes in order: each stage, then its tasks.
const nodes = status.stages.flatMap((stage) => [{ ...stage, big: true, state: stageState(stage) }, ...stage.items]);

export default function page() {
  return html`
    <section class="status">
      <header class="status__head">
        <p class="status__eyebrow">Website status</p>
        <h1 class="status__title">${status.title}</h1>
        <p class="status__intro">${status.intro}</p>
      </header>

      <div class="status__card">
        <div class="status__card-head">
          <h2>${percent(items) === 100 ? 'All done' : 'On the way'}</h2>
          <p>${pagesBuilt} of ${pagesTotal} pages built, ${done} of ${items.length} tasks complete across frontend, backend and SEO.</p>
        </div>

        <div class="status__track" data-track>
          <span class="status__fill" aria-hidden="true"></span>
          <ol class="status__nodes">
            ${nodes.map(
              (node) => html`
                <li class="status__node status__node--${node.state}${node.big ? ' status__node--big' : ''}">
                  <span class="status__dot" title="${node.name}: ${STATE_LABEL[node.state]}">${icon(node.icon)}</span>
                  ${node.big
                    ? html`<span class="status__label"><span class="status__label-name">${node.name}</span><span class="status__label-percent">${percent(node.items)}%</span></span>`
                    : html`<span class="status__sr">${node.name}: ${STATE_LABEL[node.state]}</span>`}
                </li>`,
            )}
          </ol>
        </div>

        <div class="status__summary">
          <p>Overall progress</p>
          <strong class="status__percent">${percent(items)}<span>%</span></strong>
          <p class="status__server">Server <span class="status__badge" data-health>checking…</span></p>
        </div>
      </div>

      <div class="status__stages">
        ${status.stages.map(
          (stage) => html`
            <section class="status__stage">
              <div class="status__stage-head">
                <span class="status__dot status__dot--${stageState(stage)}">${icon(stage.icon)}</span>
                <h2>${stage.name}</h2>
                <span class="status__stage-percent">${percent(stage.items)}%</span>
              </div>
              <ul class="status__tasks">
                ${stage.items.map(
                  (item) => html`
                    <li class="status__task status__task--${item.state}">
                      <span class="status__dot status__dot--small status__dot--${item.state}">${icon(item.state === 'done' ? 'check' : item.icon)}</span>
                      <span class="status__task-name">${item.name}${item.pages ? html` <span class="status__task-pages">${item.pages} ${item.pages === 1 ? 'page' : 'pages'}</span>` : ''}</span>
                      <span class="status__task-state">${STATE_LABEL[item.state]}</span>
                    </li>`,
                )}
              </ul>
            </section>`,
        )}
      </div>
    </section>`;
}

// The lit bar runs from the first circle to the first task that isn't done
// (stopping at its centre), measured from the laid-out circles so it suits
// both the horizontal and the vertical (phone) track.
export function mount(el) {
  const track = el.querySelector('[data-track]');
  const dots = [...track.querySelectorAll('.status__node')];
  const stop = dots.find((d, i) => i > 0 && !d.classList.contains('status__node--big') && !d.classList.contains('status__node--done')) ?? dots.at(-1);
  const fill = () => {
    const box = track.getBoundingClientRect();
    const a = dots[0].querySelector('.status__dot').getBoundingClientRect();
    const b = stop.querySelector('.status__dot').getBoundingClientRect();
    const vertical = getComputedStyle(track).getPropertyValue('--vertical').trim() === '1';
    track.style.setProperty('--fill-start', `${vertical ? a.top - box.top : a.left - box.left}px`);
    track.style.setProperty('--fill-size', `${vertical ? b.top + b.height / 2 - a.top : b.left + b.width / 2 - a.left}px`);
  };
  const resize = new ResizeObserver(fill);
  resize.observe(track);
  fill();
  requestAnimationFrame(() => track.setAttribute('data-ready', ''));

  const badge = el.querySelector('[data-health]');
  getHealth()
    .then(({ status: s }) => {
      badge.textContent = s;
      badge.classList.add('status__badge--good');
    })
    .catch(() => {
      badge.textContent = 'unreachable';
      badge.classList.add('status__badge--bad');
    });

  return () => resize.disconnect();
}
