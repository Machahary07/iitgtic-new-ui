import { legalPage, mountLegal } from '../components/legal-page.js';

export const title = 'Terms of Use';

// Route: /terms (copy in data/legal.js)
export default ({ path }) => legalPage('terms', path);
export const mount = mountLegal;
