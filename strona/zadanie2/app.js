/**
 * Zadanie 2 – CyberStore (DOM-based XSS - trudniejsze, naiwny filtr)
 */
setupXssExercise({
  taskId: 2,
  expectedArg: 2,
  flag: 'FLAG{DOM_XSS_HARD_FILTER_BYPASS}',
  taskName: 'Zadanie 2: CyberStore – Inteligentna wyszukiwarka',
  nextTaskUrl: '../zadanie3/index.html'
});

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('search-form');
  const input = document.getElementById('search-query');
  const resultsContainer = document.getElementById('results-container');

  function executeSearch(query) {
    if (!query || query.trim() === '') {
      resultsContainer.innerHTML = 'Brak aktywnych filtrów wyszukiwania. Wprowadź zapytanie.';
      return;
    }

    // PODATNOŚĆ (Bypassable Filter): Naiwne, jednokrotne usunięcie wyłącznie "<script>"
    // Wpisanie np. "<scr<script>ipt>alert(2)</script>" spowoduje wycięcie wewnętrznego tagu i sklei zewnętrzny!
    const filteredQuery = query.replace("<script>", "");

    const html = `
      <p style="margin-bottom: 0.5rem; font-size: 1rem; color: var(--text-main);">
        Wyniki wyszukiwania dla: <strong>${filteredQuery}</strong>
      </p>
      <p style="color: var(--text-muted); font-size: 0.875rem;">
        Brak pasujących podzespołów w katalogu CyberStore.
      </p>
    `;

    setInnerHTMLWithScripts(resultsContainer, html);
  }

  if (form && input && resultsContainer) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = input.value;

      try {
        const url = new URL(window.location);
        url.searchParams.set('q', query);
        window.history.pushState({}, '', url);
      } catch (err) {}

      executeSearch(query);
    });

    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q');
    if (initialQuery !== null) {
      input.value = initialQuery;
      executeSearch(initialQuery);
    }
  }
});
