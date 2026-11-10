/**
 * Zadanie 1 – TechShop (DOM-based XSS - łatwiejsze)
 */
setupXssExercise({
  taskId: 1,
  expectedArg: 1,
  flag: 'FLAG{DOM_XSS_EASY_SEARCH_PWNED}',
  taskName: 'Zadanie 1: TechShop – Wyszukiwarka',
  nextTaskUrl: '../zadanie2/index.html'
});

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('search-form');
  const input = document.getElementById('search-query');
  const resultsContainer = document.getElementById('results-container');

  function executeSearch(query) {
    if (!query || query.trim() === '') {
      resultsContainer.innerHTML = 'Brak wyszukiwania. Wpisz frazę powyżej, aby przeszukać asortyment.';
      return;
    }

    // PODATNOŚĆ (DOM-based XSS): Wstrzyknięcie zawartości bez sanityzacji bezpośrednio do innerHTML
    const html = `
      <p style="margin-bottom: 0.5rem; font-size: 1rem; color: var(--text-main);">
        Wyniki wyszukiwania dla: <strong>${query}</strong>
      </p>
      <p style="color: var(--text-muted); font-size: 0.875rem;">
        Nie znaleziono produktów spełniających podane kryteria w asortymencie sklepu.
      </p>
    `;

    setInnerHTMLWithScripts(resultsContainer, html);
  }

  if (form && input && resultsContainer) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = input.value;

      // Aktualizacja parametru w adresie URL bez przeładowania strony
      try {
        const url = new URL(window.location);
        url.searchParams.set('q', query);
        window.history.pushState({}, '', url);
      } catch (err) {}

      executeSearch(query);
    });

    // Obsługa parametru GET z URL przy załadowaniu strony (?q=...)
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q');
    if (initialQuery !== null) {
      input.value = initialQuery;
      executeSearch(initialQuery);
    }
  }
});
