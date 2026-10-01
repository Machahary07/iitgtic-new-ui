import { legalPage, mountLegal } from '../components/legal-page.js';

export const title = 'Privacy Policy';

// Route: /privacy (copy in data/legal.js)
export default ({ path }) => legalPage('privacy', path);
export const mount = mountLegal;
