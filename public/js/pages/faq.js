import { CONTENT } from '../data/content.js';
import { faqPage } from '../components/people-page.js';

export const title = 'FAQ';

// Route: /faq (content.json)
export default () => faqPage(CONTENT.faq);
