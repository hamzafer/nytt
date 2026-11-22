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
          html += `<button type="button" class="glossary-term" lang="nb" data-term="${escapeHtml(byLower.get(key))}">${escapeHtml(text)}</button>`;
        }
        last = match.index + text.length;
      }
      if (!used.size) return;
      host.innerHTML = html + escapeHtml(raw.slice(last));
    });

    initGlossaryPopover(glossary);
  }

  // Tap or click a term to show its meaning under it. Hovering shows it too on devices
  // with a mouse. Escape or a tap anywhere else closes it.
  function initGlossaryPopover(glossary) {
    const buttons = document.querySelectorAll('button.glossary-term');
    if (!buttons.length) return;

    if (!('showPopover' in HTMLElement.prototype)) {
      // Older browsers: fall back to the native tooltip.
      buttons.forEach((b) => (b.title = glossary[b.dataset.term] || ''));
      return;
    }

    const pop = document.createElement('div');
    pop.id = 'glossary-pop';
    pop.className = 'glossary-pop';
    pop.setAttribute('popover', 'manual');
    pop.setAttribute('aria-live', 'polite');
    document.body.appendChild(pop);

    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    let current = null;
    let pinned = false;

    function place(button) {
      const r = button.getBoundingClientRect();
      const gap = 6;
      const margin = 12;
      const w = pop.offsetWidth;
      const h = pop.offsetHeight;
      const left = Math.min(Math.max(margin, r.left), window.innerWidth - w - margin);
      const below = r.bottom + gap;
      const top = below + h > window.innerHeight - margin && r.top - gap - h > margin ? r.top - gap - h : below;
      pop.style.left = `${left}px`;
      pop.style.top = `${top}px`;
    }

    function show(button, pin) {
      const term = button.dataset.term;
      pop.innerHTML = `<strong lang="nb">${escapeHtml(term)}</strong> ${escapeHtml(glossary[term] || '')}`;
      if (current && current !== button) current.setAttribute('aria-expanded', 'false');
      current = button;
      pinned = pin;
      button.setAttribute('aria-expanded', 'true');
      if (!pop.matches(':popover-open')) pop.showPopover();
      place(button);
    }

    function hide() {
      if (current) current.setAttribute('aria-expanded', 'false');
      current = null;
      pinned = false;
      if (pop.matches(':popover-open')) pop.hidePopover();
    }

    document.addEventListener('pointerdown', (e) => {
      if (!current || pop.contains(e.target) || e.target.closest?.('button.glossary-term')) return;
      hide();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape' || !current) return;
      const button = current;
      hide();
      button.focus();
    });

    buttons.forEach((button) => {
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-controls', pop.id);
      button.addEventListener('click', () => {
        if (current === button && pinned) hide();
        else show(button, true);
      });
      if (canHover) {
        button.addEventListener('mouseenter', () => {
          if (!pinned) show(button, false);
        });
        button.addEventListener('mouseleave', () => {
          if (!pinned && current === button) hide();
        });
      }
    });

    // The popover is fixed to the viewport, so close it rather than let it drift on scroll.
    window.addEventListener('scroll', () => current && hide(), { passive: true });
    window.addEventListener('resize', () => current && hide());
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