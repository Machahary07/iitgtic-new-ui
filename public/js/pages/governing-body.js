import { CONTENT } from '../data/content.js';
import { peoplePage, mountPeople } from '../components/people-page.js';

export const title = 'Governing Body';

// Route: /governing-body (content.json)
export default () => peoplePage(CONTENT.governingBody, 'About · Governing Body', [{ heading: 'The body', tagline: CONTENT.governingBody.tagline, people: CONTENT.governingBody.people }]);
export const mount = mountPeople;
