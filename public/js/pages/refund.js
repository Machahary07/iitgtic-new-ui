import { legalPage, mountLegal } from '../components/legal-page.js';

export const title = 'Fees & Refunds';

// Route: /refund (copy in data/legal.js)
export default ({ path }) => legalPage('refund', path);
export const mount = mountLegal;
