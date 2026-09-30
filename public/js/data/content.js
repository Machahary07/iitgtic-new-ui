// Site content from /content.json, fetched once. Top-level await means any
// page importing this only renders after the content has arrived (the router
// awaits the page module's import).
//
// Partners: { name, short?, logo }, shown in the home "In association with"
// marquee and the About page's partner cards.
//
// Opportunities: `type` is 'startup-job', 'tic-job' or 'event'. Dates are ISO
// (YYYY-MM-DD): events have `date` (start) and optional `endDate`; jobs have
// `date` (posted) and optional `deadline`. Events show an `image` (photo);
// jobs show a `logo` instead: TIC jobs use /img/tic-logo.svg, startup jobs the
// startup's logo (until one is added, /img/logos/startup-placeholder.svg, a
// grey circle). `dummy: true` marks sample entries to replace with real ones.
const res = await fetch('/content.json');
if (!res.ok) throw new Error(`content.json: ${res.status} ${res.statusText}`);

export const CONTENT = await res.json();
