import { renderCollection, mountCollection } from './collection.js';

export const title = 'Startup Jobs';

// Route: /opportunities/startup-jobs
export default function page() {
  return renderCollection('startup-job');
}

export const mount = mountCollection;
