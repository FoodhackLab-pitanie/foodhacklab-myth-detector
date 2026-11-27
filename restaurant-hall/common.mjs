export const $ = (selector, root = document) => root.querySelector(selector);
export const main = $('#main');
const images = {
  briefing: '<rect x="5" y="5" width="14" height="16" rx="2"/><path d="M9 4h6v4H9zM8 12h8m-8 4h6"/>',
  air: '<path d="M3 8h11a2.5 2.5 0 1 0-2.5-2.5M3 12h15a2.5 2.5 0 1 1-2.5 2.5M3 16h7a2 2 0 1 1-2 2"/>',
  clean: '<path d="m14 13 6-8-2-2-6 8m-3 1c-3 1-2 5-6 6 3 3 9 2 11-2l-1-3-2-2zM10 16l2 2"/>',
  furniture: '<path d="M3 10h18M5 14h14M6 14v6m12-6v6M4 6h16l1 4H3z"/>',
  supplies: '<path d="M3 9l9-4 9 4-9 4zM3 9v8l9 4 9-4V9m-9 4v8M7.5 7l9 4"/>',
  polish: '<path d="m13 3 1.6 5.4L20 10l-5.4 1.6L13 17l-1.6-5.4L6 10l5.4-1.6L13 3zM5 15v6m-3-3h6m11-3v4m-2-2h4"/>',
  station: '<rect x="4" y="5" width="16" height="14" rx="2"/><path d="M4 12h16m-8 0v7M6 19v2m12-2v2m-8-10h4m-7 4h2m6 0h2"/>',
  linen: '<path d="m3 7 9-3 9 3v10l-9 3-9-3V7zm0 0 9 3 9-3m-9 3v10"/>',
  setting: '<circle cx="12" cy="12" r="4"/><path d="M4 4v6m2-6v4a2 2 0 0 1-4 0V4m2 6v10m16-16c-2 2-2 6-2 9h2m0-9v16"/>',
  final: '<path d="M20 11v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9m-6 7 3 3 8-9"/>',
  award: '<circle cx="12" cy="8" r="5"/><path d="m8 12-2 9 6-3 6 3-2-9"/>',
  steps: '<path d="M7 5h14M7 12h14M7 19h14M3 5h.01M3 12h.01M3 19h.01"/>',
  check: '<path d="m5 12 5 5L20 7"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 1 1 8 0v4m-4 4v2"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  restart: '<path d="M4 10a8 8 0 1 1 2 8M4 5v5h5"/>',
  user: '<circle cx="12" cy="8" r="3"/><path d="M5 20v-2a7 7 0 0 1 14 0v2"/>',
  download: '<path d="M12 3v12m-4-4 4 4 4-4M4 17v4h16v-4"/>',
};
export const icon = (name, extra = '') => `<svg class="icon ${extra}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${images[name] || ''}</svg>`;
export const esc = value => String(value ?? '').replace(/[&<>"']/gu, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

export function setMain(html, focus = false) {
  main.innerHTML = html;
  if (focus) {
    const heading = $('h1, h2', main);
    heading?.setAttribute('tabindex', '-1');
    heading?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }
}

export function flash(message, selector = '#error') {
  const region = $(selector);
  if (region) region.textContent = message;
}

export const labelFor = (rows, id) => rows?.find(row => row[0] === id)?.[1] ?? id;
