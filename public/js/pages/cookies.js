import { legalPage, mountLegal } from '../components/legal-page.js';

export const title = 'Cookie Policy';

// Route: /cookies (copy in data/legal.js)
export default ({ path }) => legalPage('cookies', path);
export const mount = mountLegal;
