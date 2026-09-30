// Site content from /content.json, fetched once. Top-level await means any
// page importing this only renders after the content has arrived (the router
// awaits the page module's import).
//
// Opportunities: `type` is 'startup-job', 'tic-job' or 'event'. Dates are ISO
// (YYYY-MM-DD): events have `date` (start) and optional `endDate`; jobs have
// `date` (posted) and optional `deadline`. `dummy: true` marks sample entries
// to replace with real ones.
const res = await fetch('/content.json');
if (!res.ok) throw new Error(`content.json: ${res.status} ${res.statusText}`);

export const CONTENT = await res.json();
