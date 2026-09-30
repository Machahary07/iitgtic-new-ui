import { renderCollection, mountCollection } from './opportunities/collection.js';

export const title = 'Opportunities';

// Route: /opportunities
export default function page() {
  return renderCollection('all');
}

export const mount = mountCollection;
