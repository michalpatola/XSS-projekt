/**
 * Hub menu controller – śledzenie postępów i zdobytych flag
 */
document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'xss_lab_flags';
  let solved = {};
  try {
    solved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch (e) {
    solved = {};
  }

  const taskIds = [1, 2, 3, 4];
  let solvedCount = 0;

  taskIds.forEach(id => {
    const card = document.querySelector(`a[href*="zadanie${id}/"]`);
    if (card && solved[id]) {
      solvedCount++;
      card.classList.add('is-solved');
      const meta = card.querySelector('.hub-card-meta');
      if (meta) {
        const flagBadge = document.createElement('span');
        flagBadge.className = 'badge badge-solved';
        flagBadge.textContent = '✓ Zaliczone';
        meta.appendChild(flagBadge);
      }
    }
  });

  const header = document.querySelector('.header');
  if (header) {
    const progressDiv = document.createElement('div');
    progressDiv.className = 'hub-progress-summary';
    progressDiv.innerHTML = `
      <div class="progress-bar-container">
        <div class="progress-bar-fill" style="width: ${(solvedCount / 4) * 100}%"></div>
      </div>
      <div class="progress-bar-text">
        <span>Postęp laboratorium: <strong>${solvedCount} / 4</strong> zaliczonych zadań</span>
        ${solvedCount > 0 ? '<button id="btn-reset-all" class="btn-reset-link" type="button">Zresetuj postęp</button>' : ''}
      </div>
    `;
    header.appendChild(progressDiv);

    const resetBtn = document.getElementById('btn-reset-all');
    if (resetBtn) {
      resetBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Czy na pewno chcesz zresetować zdobyte flagi oraz zapisaną historię komentarzy ze wszystkich zadań?')) {
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem('xss_forum_comments_zad3');
          localStorage.removeItem('xss_forum_comments_zad4');
          window.location.reload();
        }
      });
    }
  }
});
