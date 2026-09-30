import { html } from '../lib/html.js';
import { current } from '../lib/nav.js';

function dashboardLayout({ label, root, nav }) {
  return (content, { path }) => html`
    <div class="dash">
      <aside class="dash__sidebar">
        <a class="dash__brand" href="${root}">IITG TIC <span>${label}</span></a>
        <nav class="dash__nav" aria-label="${label}">
          ${nav.map(([href, text]) => html`<a href="${href}"${current(path, href, href === root)}>${text}</a>`)}
        </nav>
        <a class="dash__back" href="/">← Back to site</a>
      </aside>
      <main class="dash__main" data-outlet>${content}</main>
    </div>`;
}

export const founderLayout = dashboardLayout({
  label: 'Founder',
  root: '/founder',
  nav: [
    ['/founder', 'Overview'],
    ['/founder/application', 'Application'],
    ['/founder/companies', 'Companies'],
    ['/founder/jobs', 'Jobs'],
    ['/founder/applicants', 'Applicants'],
    ['/founder/users', 'Users'],
    ['/founder/activity', 'Activity'],
    ['/founder/support', 'Support'],
    ['/founder/settings', 'Settings'],
  ],
});

export const adminLayout = dashboardLayout({
  label: 'Admin',
  root: '/tic-admin',
  nav: [
    ['/tic-admin', 'Dashboard'],
    ['/tic-admin/applications', 'Applications'],
    ['/tic-admin/approvals', 'Approvals'],
    ['/tic-admin/companies', 'Companies'],
    ['/tic-admin/jobs', 'Jobs'],
    ['/tic-admin/job-applications', 'Job applications'],
    ['/tic-admin/users', 'Users'],
    ['/tic-admin/roles', 'Roles'],
    ['/tic-admin/content', 'Content'],
    ['/tic-admin/email', 'Email'],
    ['/tic-admin/storage', 'Storage'],
    ['/tic-admin/support', 'Support'],
    ['/tic-admin/activity', 'Activity'],
  ],
});
