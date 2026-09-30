// Loads GSAP + SplitText from the CDN on first use (only pages that animate
// pay for it). Resolves to { gsap, SplitText }; a failed load can be retried.
const CDN = 'https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/';

let loading;

const script = (src) =>
  new Promise((resolve, reject) => {
    const el = document.createElement('script');
    el.src = src;
    el.onload = resolve;
    el.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.append(el);
  });

export function loadGsap() {
  loading ??= script(`${CDN}gsap.min.js`)
    .then(() => script(`${CDN}SplitText.min.js`))
    .then(() => {
      window.gsap.registerPlugin(window.SplitText);
      return { gsap: window.gsap, SplitText: window.SplitText };
    })
    .catch((err) => {
      loading = undefined;
      throw err;
    });
  return loading;
}
