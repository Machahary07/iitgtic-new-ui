import { CONTENT } from '../data/content.js';
import { peoplePage, mountPeople } from '../components/people-page.js';

export const title = 'Committee of Management';

// Route: /committee-of-management (content.json)
export default () => peoplePage(CONTENT.committee, 'About · Committee of Management', [{ heading: 'The committee', tagline: CONTENT.committee.tagline, people: CONTENT.committee.people }]);
export const mount = mountPeople;
