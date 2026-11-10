/**
 * Zadanie 4 – CyberForum (Stored XSS - trudniejsze, filtr rekursywny)
 */
setupXssExercise({
  taskId: 4,
  expectedArg: 4,
  flag: 'FLAG{STORED_XSS_IMG_ONERROR_BYPASS}',
  taskName: 'Zadanie 4: CyberForum – Dyskusja na żywo',
  nextTaskUrl: '../index.html'
});

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('comment-form');
  const authorInput = document.getElementById('author-input');
  const commentInput = document.getElementById('comment-input');
  const container = document.getElementById('comments-container');
  const clearBtn = document.getElementById('btn-clear-comments');
  const STORAGE_KEY = 'xss_forum_comments_zad4';

  const defaultComments = [
    { author: 'SecBot_9000', text: 'Tablica podlega automatycznej sanityzacji rekursywnej. Wszystkie tagi &lt;script&gt; są wycinane.' },
    { author: 'CyberNinja', text: 'Potwierdzam, wstrzyknięcie zagnieżdżonego tagu skryptu zostało uniemożliwione.' }
  ];

  // FILTR REKURSYWNY: usuwa wszystkie tagi <script> aż do momentu, gdy żaden nie pozostanie
  function recursiveFilter(text) {
    if (!text) return '';
    let prev;
    let str = text;
    do {
      prev = str;
      str = str.replace(/<script[^>]*>/gi, '').replace(/<\/script>/gi, '');
    } while (str !== prev);
    return str;
  }

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
      container.innerHTML = '<p style="color: var(--text-muted); font-size: 0.875rem;">Brak opublikowanych wpisów na tablicy.</p>';
      return;
    }

    // PODATNOŚĆ (Stored XSS): Choć tagi <script> są rekursywnie usuwane,
    // inne wektory HTML (np. <img src=x onerror=alert(4)>) pozostają nietknięte i wykonują JS!
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
      const rawAuthor = authorInput.value.trim() || 'CyberUser';
      const rawText = commentInput.value.trim();

      if (!rawText && !authorInput.value.trim()) {
        return;
      }

      // Filtr rekursywny filtruje tylko tagi <script>, ignorując inne wektory XSS (np. <img>, <svg>, <iframe>, on*=...)
      const filteredAuthor = recursiveFilter(rawAuthor);
      const filteredText = recursiveFilter(rawText);

      const comments = getComments();
      comments.push({ author: filteredAuthor, text: filteredText });
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

  // Renderowanie początkowe (wykonuje Stored XSS po odświeżeniu/ponownym wejściu)
  render();
});
