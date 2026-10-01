import { html } from '../lib/html.js';
import { current } from '../lib/nav.js';
import { LEGAL, LEGAL_NAV } from '../data/legal.js';
import { applyCta } from './apply-cta.js';

const EMAIL = 'tic@iitg.ac.in';
const slug = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// One legal page (data/legal.js): a small header with a switcher between the
// legal pages, then the numbered topics beside a sticky topic navigator
// (desktop only) that follows the reading position, and the Apply CTA.
// Styles in css/legal.css.
export function legalPage(key, path) {
  const { title, intro, sections, contact } = LEGAL[key];
  const topics = [...sections.map(({ heading }) => heading), 'Contact'];
  return html`
    <div class="legal-page">
      <article class="legal">
        <header class="legal__head">
          <nav class="legal__switch" aria-label="Legal pages">
            ${LEGAL_NAV.map(([href, label]) => html`<a href="${href}"${current(path, href, true)}>${label}</a>`)}
          </nav>
          <h1 class="legal__title">${title}</h1>
          <p class="legal__intro">${intro}</p>
        </header>

        <div class="legal__body">
          <nav class="legal__nav" aria-label="Topics">
            <p class="legal__nav-title">Topics</p>
            <ol>
              ${topics.map((topic) => html`<li><a href="#${slug(topic)}" data-topic="${slug(topic)}">${topic}</a></li>`)}
            </ol>
          </nav>

          <div class="legal__sections">
            ${sections.map(
              ({ heading, body }, i) => html`
                <section class="legal__section" id="${slug(heading)}">
                  <h2><span class="legal__num">${String(i + 1).padStart(2, '0')}</span>${heading}</h2>
                  ${body.map((part) => (Array.isArray(part) ? html`<ul>${part.map((item) => html`<li>${item}</li>`)}</ul>` : html`<p>${part}</p>`))}
                </section>`,
            )}

            <section class="legal__section" id="contact">
              <h2><span class="legal__num">${String(sections.length + 1).padStart(2, '0')}</span>Contact</h2>
              <p>${contact.lead}</p>
              <address class="legal__card">
                ${contact.address.map((line, i) => (i === 0 ? html`<strong>${line}</strong>` : html`<span>${line}</span>`))}
                <a href="mailto:${EMAIL}">${EMAIL}</a>
                ${contact.phone ? html`<a href="tel:+913612583194">${contact.phone}</a>` : ''}
              </address>
            </section>
          </div>
        </div>
      </article>
    </div>
    ${applyCta()}`;
}

// Navigator: a topic becomes current once its title has scrolled up near the
// top of the page (TOP px), and stays current until the next one does. The
// last topic is the exception: it may be too short to ever reach the top, so
// it becomes current as soon as the end of the article is in view.
const TOP = 140;

export function mountLegal(el) {
  const links = [...el.querySelectorAll('[data-topic]')];
  const headings = links.map((link) => el.querySelector(`#${link.dataset.topic} h2`));
  const end = el.querySelector('.legal__sections');
  let frame;

  const update = () => {
    frame = undefined;
    let active = 0;
    headings.forEach((h, i) => {
      if (h.getBoundingClientRect().top <= TOP) active = i;
    });
    // Once the reader has scrolled, reaching the end of the article selects the last topic.
    if (window.scrollY > 0 && end.getBoundingClientRect().bottom <= window.innerHeight) active = headings.length - 1;
    links.forEach((link, i) => link.toggleAttribute('data-current', i === active));
  };
  const queue = () => (frame ??= requestAnimationFrame(update));

  update();
  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', queue);
  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener('scroll', queue);
    window.removeEventListener('resize', queue);
  };
}
