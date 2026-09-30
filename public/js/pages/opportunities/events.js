import { renderCollection, mountCollection } from './collection.js';

export const title = 'Events';

// Route: /opportunities/events (/events redirects here)
export default function page() {
  return renderCollection('event');
}

export const mount = mountCollection;
