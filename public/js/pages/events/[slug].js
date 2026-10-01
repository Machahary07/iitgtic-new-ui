import { eventPage, mountDetail } from '../../components/opportunity-detail.js';

export const title = 'Event';

// Route: /events/[slug]
export default ({ params }) => eventPage(params.slug);
export const mount = mountDetail;
