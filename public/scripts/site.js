(function () {
  const storageKey = 'nytt-theme';

  function initTheme() {
    const root = document.documentElement;
    const button = document.getElementById('theme-toggle');
    if (!button) return;
    const sync = () => button.setAttribute('aria-pressed', String(root.classList.contains('dark')));
    sync();
    button.addEventListener('click', () => {
      const dark = root.classList.toggle('dark');
      sync();
      try {
        localStorage.setItem(storageKey, dark ? 'dark' : 'light');
      } catch {
        // Storage blocked: the choice lasts for this page only.
      }
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
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

    // One pass over the raw text, escaping each piece as it is joined back, so story
    // text can't inject HTML and a term never matches inside an earlier tooltip.
    const pattern = new RegExp(`\\b(${terms.map(escapeRegExp).join('|')})\\b`, 'gi');
    const byLower = new Map(terms.map((t) => [t.toLowerCase(), t]));

    document.querySelectorAll('[data-glossary-text]').forEach((host) => {
      const raw = host.textContent || '';
      const used = new Set();
      let html = '';
      let last = 0;
      for (const match of raw.matchAll(pattern)) {
        const text = match[0];
        const key = text.toLowerCase();
        html += escapeHtml(raw.slice(last, match.index));
        if (used.has(key)) {
          html += escapeHtml(text);
        } else {
          used.add(key);
          const def = glossary[byLower.get(key)];
          html += `<abbr class="glossary-term" tabindex="0" title="${escapeHtml(def)}">${escapeHtml(text)}</abbr>`;
        }
        last = match.index + text.length;
      }
      if (!used.size) return;
      host.innerHTML = html + escapeHtml(raw.slice(last));
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
      if (status) status.textContent = 'Search couldn’t load. Reload the page to try again.';
      return;
    }

    const baseEl = document.getElementById('site-base');
    const base = baseEl ? JSON.parse(baseEl.textContent || '"/"') : '/';

    function render(matches) {
      results.innerHTML = '';
      if (!matches.length) {
        status.textContent = 'No stories match. Try a broader word, like “T-bane” or “Norgespris”.';
        return;
      }
      status.textContent = `${matches.length} ${matches.length === 1 ? 'story' : 'stories'}`;
      for (const row of matches) {
        const li = document.createElement('li');
        li.className = 'grid grid-cols-[1.75rem_minmax(0,1fr)] gap-x-3 py-5';
        const dayUrl = escapeHtml(`${base}day/${encodeURIComponent(row.date)}/`.replace(/\/+/g, '/'));
        const label = new Date(`${row.date}T12:00:00Z`).toLocaleDateString('en-GB', {
          weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
        }).replace(',', '');
        li.innerHTML = `
          <span class="pt-1 text-xl leading-none" aria-hidden="true">${escapeHtml(row.emoji)}</span>
          <div class="min-w-0 max-w-[64ch]">
            <p class="text-sm text-muted">${escapeHtml(row.categoryLabel)}, <a class="prose-link font-medium" href="${dayUrl}">${label}</a></p>
            <p class="mt-1 text-[1.0625rem] leading-relaxed">${escapeHtml(row.text)}</p>
          </div>`;
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


  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initGlossary();
    initSearchPage();
  });
})();