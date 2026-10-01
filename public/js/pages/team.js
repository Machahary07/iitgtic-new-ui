import { CONTENT } from '../data/content.js';
import { peoplePage, mountPeople } from '../components/people-page.js';

export const title = 'Team';

// Route: /team (content.json)
export default () => peoplePage(CONTENT.team, 'About · TIC Team', [{ heading: 'The team', tagline: CONTENT.team.tagline, people: CONTENT.team.people }]);
export const mount = mountPeople;
