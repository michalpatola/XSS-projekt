/**
 * Zadanie 3 – Forum Sprzętowe (Stored XSS - łatwiejsze)
 */
setupXssExercise({
  taskId: 3,
  expectedArg: 3,
  flag: 'FLAG{STORED_XSS_LOCALSTORAGE_PWNED}',
  taskName: 'Zadanie 3: Forum Sprzętowe – Komentarze',
  nextTaskUrl: '../zadanie4/index.html'
});

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('comment-form');
  const authorInput = document.getElementById('author-input');
  const commentInput = document.getElementById('comment-input');
  const container = document.getElementById('comments-container');
  const clearBtn = document.getElementById('btn-clear-comments');
  const STORAGE_KEY = 'xss_forum_comments_zad3';

  const defaultComments = [
    { author: 'HardwarePro', text: 'Znakomity wątek! Czy ktoś testował stabilność przy napięciu 1.35V?' },
    { author: 'Moderator', text: 'Przypominam o netykiecie i merytorycznych wypowiedziach.' }
  ];

  function getComments() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultComments));
      return defaultComments.slice();
    }
    try {
      return JSON.parse(raw);
    } catch (e) {
      return defaultComments.slice();
    }
  }

  function saveComments(comments) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(comments));
    } catch (e) {
      console.error('Błąd zapisu do localStorage:', e);
    }
  }

  function render() {
    const comments = getComments();
    container.innerHTML = '';

    if (!comments || comments.length === 0) {
      container.innerHTML = '<p style="color: var(--text-muted); font-size: 0.875rem;">Brak opublikowanych komentarzy.</p>';
      return;
    }

    // PODATNOŚĆ (Stored XSS): Zawartość komentarzy i autorów wstawiana do DOM bez sanityzacji
    const html = comments.map(c => `
      <div class="comment-item">
        <div class="comment-author">${c.author}</div>
        <div class="comment-text">${c.text}</div>
      </div>
    `).join('');

    setInnerHTMLWithScripts(container, html);
  }

  if (form && authorInput && commentInput) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const author = authorInput.value.trim() || 'Anonim';
      const text = commentInput.value.trim();

      if (!text && !authorInput.value.trim()) {
        return;
      }

      const comments = getComments();
      comments.push({ author, text });
      saveComments(comments);

      commentInput.value = '';
      authorInput.value = '';
      render();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      localStorage.removeItem(STORAGE_KEY);
      render();
    });
  }

  // Renderowanie początkowe (wykonuje skrypty zapisane w localStorage przy załadowaniu/odświeżeniu strony)
  render();
});
