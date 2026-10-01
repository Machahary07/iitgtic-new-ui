import { jobPage, mountDetail } from '../../components/opportunity-detail.js';

export const title = 'Opportunity';

// Route: /opportunities/[id]
export default ({ params }) => jobPage(params.id);
export const mount = mountDetail;
