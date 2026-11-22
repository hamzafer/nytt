(function () {
  const storageKey = 'nytt-theme';

  function applyTheme(mode) {
    const root = document.documentElement;
    if (mode === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    const icon = document.querySelector('[data-theme-icon]');
    if (icon) icon.textContent = mode === 'dark' ? '🌙' : '☀️';
  }

  function initTheme() {
    const saved = localStorage.getItem(storageKey);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const mode = saved === 'dark' || saved === 'light' ? saved : prefersDark ? 'dark' : 'light';
    applyTheme(mode);
    document.getElementById('theme-toggle')?.addEventListener('click', () => {
      const next = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
      localStorage.setItem(storageKey, next);
      applyTheme(next);
    });
  }

  function escapeRegExp(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function initGlossary() {
    const el = document.getElementById('glossary-data');
    if (!el) return;
    let glossary;
    try {
      glossary = JSON.parse(el.textContent || '{}');
    } catch {
      return;
    }
    const terms = Object.keys(glossary).sort((a, b) => b.length - a.length);
    if (!terms.length) return;

    document.querySelectorAll('[data-glossary-text]').forEach((host) => {
      let html = host.textContent || '';
      const used = new Set();
      for (const term of terms) {
        if (used.has(term.toLowerCase())) continue;
        const re = new RegExp(`\\b(${escapeRegExp(term)})\\b`, 'i');
        if (!re.test(html)) continue;
        used.add(term.toLowerCase());
        const def = glossary[term];
        html = html.replace(re, (_, m) => {
          return `<abbr class="glossary-term" tabindex="0" title="${def.replace(/"/g, '&quot;')}" data-term="${term}">${m}</abbr>`;
        });
      }
      if (html !== host.textContent) host.innerHTML = html;
    });
  }

  async function initSearchPage() {
    const input = document.getElementById('search-input');
    const results = document.getElementById('search-results');
    const status = document.getElementById('search-status');
    if (!input || !results || !window.__NYTT_SEARCH_INDEX_URL__) return;

    let index = [];
    try {
      const res = await fetch(window.__NYTT_SEARCH_INDEX_URL__);
      index = await res.json();
    } catch {
      if (status) status.textContent = 'Could not load search index.';
      return;
    }

    const baseEl = document.getElementById('site-base');
    const base = baseEl ? JSON.parse(baseEl.textContent || '"/"') : '/';

    function render(matches) {
      results.innerHTML = '';
      if (!matches.length) {
        status.textContent = 'No matches. Try another word like “T-bane” or “Norgespris”.';
        return;
      }
      status.textContent = `${matches.length} result${matches.length === 1 ? '' : 's'}`;
      for (const row of matches) {
        const li = document.createElement('li');
        li.className = 'rounded-2xl border border-fjord-200 bg-white/80 p-4 dark:border-fjord-800 dark:bg-fjord-950/40';
        const dayUrl = `${base}day/${row.date}/`.replace(/\/+/g, '/').replace(':/', '://');
        li.innerHTML = `
          <p class="text-xs font-semibold uppercase tracking-wide text-coral-600">${row.categoryLabel} · ${row.date}</p>
          <p class="mt-1 text-lg">${row.emoji} ${row.text}</p>
          <a class="mt-2 inline-block text-sm font-medium text-fjord-700 underline dark:text-fjord-200" href="${dayUrl}">Open briefing</a>
        `;
        results.appendChild(li);
      }
    }

    function run() {
      const q = input.value.trim().toLowerCase();
      if (q.length < 2) {
        status.textContent = 'Type at least 2 characters.';
        results.innerHTML = '';
        return;
      }
      const matches = index.filter(
        (row) =>
          row.text.toLowerCase().includes(q) ||
          row.categoryLabel.toLowerCase().includes(q) ||
          (row.takeaway && row.takeaway.toLowerCase().includes(q)),
      );
      render(matches);
    }

    input.addEventListener('input', run);
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) {
      input.value = q;
      run();
    }
  }

  function initCategoryFilter() {
    const list = document.getElementById('category-items');
    if (!list) return;
    const items = list.querySelectorAll('[data-category-item]');
    if (!items.length) return;
  }

  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initGlossary();
    initSearchPage();
    initCategoryFilter();
  });
})();