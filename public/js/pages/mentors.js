import { CONTENT } from '../data/content.js';
import { html } from '../lib/html.js';
import { peopleList, mountRoster } from '../components/people-page.js';

export const title = 'Mentors';

const { mentors } = CONTENT;

// Route: /mentors (content.json): a roster, since mentors have no photos.
export default () =>
  peopleList('About · Mentors', [
    {
      heading: 'The mentors',
      tagline: mentors.tagline,
      columns: [
        ['Mentor', (m) => m.name],
        ['Position', (m) => m.affiliation],
        ['Expertise', (m) => (m.expertise ?? []).join(', ')],
      ],
      details: (m) => html`
        <p>${m.bio || `Mentors founders on ${(m.expertise ?? []).join(', ').toLowerCase()}.`}</p>
        ${m.expertise ? html`<ul class="roster__chips">${m.expertise.map((e) => html`<li>${e}</li>`)}</ul>` : ''}`,
      people: mentors.people,
    },
  ]);
export const mount = mountRoster;
