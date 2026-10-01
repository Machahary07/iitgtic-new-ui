import { CONTENT } from '../data/content.js';
import { html } from '../lib/html.js';
import { peopleList, mountRoster } from '../components/people-page.js';

export const title = 'TIC Coordinators';

const { coordinators } = CONTENT;

const columns = [
  ['Name', (p) => p.name],
  ['Role', (p) => p.role],
  ['Department', (p) => p.department ?? 'IITG-TIC'],
];

// Route: /tic-coordinators (content.json): the programme coordinator, then
// the faculty coordinators from each department, as rosters (no photos).
export default () =>
  peopleList('About · TIC Coordinators', [
    {
      heading: 'Coordinators',
      tagline: coordinators.staffTagline,
      columns,
      details: (p) => html`
        <p>The programme coordinator is the first person to write to when you are not sure where a question belongs.</p>
        ${p.email ? html`<a class="roster__email" href="mailto:${p.email}">${p.email}</a>` : ''}`,
      people: coordinators.staff,
    },
    {
      heading: coordinators.facultyTitle,
      tagline: coordinators.facultyTagline,
      columns,
      details: (p) => html`<p>Represents the ${p.department} at IITG-TIC. ${coordinators.facultyNote}</p>`,
      people: coordinators.faculty,
    },
  ]);
export const mount = mountRoster;
