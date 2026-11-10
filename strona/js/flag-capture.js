/**
 * Flag Capture & XSS Runtime Helper
 * Intercepts window.alert() and manages flags for the XSS Laboratory.
 */
(function() {
  const _originalAlert = window.alert.bind(window);
  window._nativeAlert = _originalAlert;

  let currentConfig = {
    taskId: null,
    expectedArg: null,
    flag: null,
    taskName: '',
    nextTaskUrl: null
  };

  const STORAGE_KEY = 'xss_lab_flags';

  function getSolvedFlags() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch (e) {
      return {};
    }
  }

  function saveSolvedFlag(taskId, flag) {
    try {
      const flags = getSolvedFlags();
      flags[taskId] = {
        flag: flag,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(flags));
    } catch (e) {
      console.error('Failed to save flag to localStorage:', e);
    }
  }

  function getStoredFlag(taskId) {
    const flags = getSolvedFlags();
    return flags[taskId] ? flags[taskId].flag : null;
  }

  // Intercept window.alert
  window.alert = function(msg) {
    console.log(`[XSS INTERCEPTED] alert(${JSON.stringify(msg)}) in Task ${currentConfig.taskId}`);

    const passedStr = (msg !== undefined && msg !== null) ? String(msg).trim() : '';
    const expectedStr = (currentConfig.expectedArg !== null) ? String(currentConfig.expectedArg).trim() : null;

    // Check if the argument matches the expected alert(x)
    const isTarget = (expectedStr !== null && passedStr === expectedStr);

    if (isTarget && currentConfig.taskId) {
      saveSolvedFlag(currentConfig.taskId, currentConfig.flag);
      renderSolvedBanner();
    }

    showFlagModal({
      taskId: currentConfig.taskId,
      taskName: currentConfig.taskName,
      passedArg: msg,
      expectedArg: currentConfig.expectedArg,
      isSuccess: isTarget,
      flag: currentConfig.flag,
      nextTaskUrl: currentConfig.nextTaskUrl
    });
  };

  // Helper to execute script elements inserted into innerHTML
  window.setInnerHTMLWithScripts = function(container, html) {
    container.innerHTML = html;
    const scripts = Array.from(container.querySelectorAll('script'));
    scripts.forEach(oldScript => {
      const newScript = document.createElement('script');
      Array.from(oldScript.attributes).forEach(attr => {
        newScript.setAttribute(attr.name, attr.value);
      });
      newScript.textContent = oldScript.textContent;
      oldScript.parentNode.replaceChild(newScript, oldScript);
    });
  };

  function escapeHtml(str) {
    if (typeof str !== 'string') str = String(str);
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
  }

  function showFlagModal(data) {
    // Avoid piling up duplicate modals
    const existing = document.getElementById('xss-flag-modal-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'xss-flag-modal-overlay';
    overlay.className = 'flag-modal-overlay';

    const isSuccess = data.isSuccess;
    const modalTypeClass = isSuccess ? 'modal-success' : 'modal-warning';

    overlay.innerHTML = `
      <div class="flag-modal ${modalTypeClass}">
        <div class="flag-modal-header">
          <div class="flag-modal-badge">${isSuccess ? '🏆 Flaga Zdobyta!' : '⚡ Wykryto XSS'}</div>
          <button class="flag-modal-close-icon" id="flag-modal-x" title="Zamknij">&times;</button>
        </div>

        <div class="flag-modal-body">
          <h3 class="flag-modal-title">
            ${isSuccess ? '🎉 Gratulacje! Zadanie zaliczone!' : '⚠️ Kod JavaScript został wykonany!'}
          </h3>
          <p class="flag-modal-desc">
            ${isSuccess
              ? `Podatność XSS została pomyślnie zrealizowana w <strong>${escapeHtml(data.taskName || 'tym zadaniu')}</strong>.`
              : `Twój skrypt zadziałał i wywołał funkcję <code>alert()</code>, jednak jej zawartość nie spełnia warunku zaliczenia zadania.`}
          </p>

          <div class="flag-intercept-box">
            <span class="flag-intercept-label">Przechwycono:</span>
            <code>alert(${escapeHtml(JSON.stringify(data.passedArg))})</code>
          </div>

          ${isSuccess ? `
            <div class="flag-award-section">
              <span class="flag-award-label">Twoja flaga:</span>
              <div class="flag-code-container">
                <code class="flag-code-value" id="flag-value-text">${escapeHtml(data.flag)}</code>
                <button class="btn btn-sm btn-copy" id="btn-copy-flag">Kopiuj</button>
              </div>
            </div>
          ` : `
            <div class="flag-hint-box">
              <p>Wskazówka: Zgodnie z instrukcją ćwiczenia, należy wywołać funkcję z argumentem <strong>${escapeHtml(String(data.expectedArg))}</strong>, np.:</p>
              <code>alert(${escapeHtml(String(data.expectedArg))})</code>
            </div>
          `}
        </div>

        <div class="flag-modal-footer">
          <button class="btn btn-secondary" id="btn-close-modal">Zamknij</button>
          ${isSuccess && data.nextTaskUrl ? `
            <a href="${data.nextTaskUrl}" class="btn btn-primary" style="text-decoration:none;">Następne zadanie &rarr;</a>
          ` : ''}
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const closeModal = () => overlay.remove();
    document.getElementById('flag-modal-x').addEventListener('click', closeModal);
    document.getElementById('btn-close-modal').addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });

    if (isSuccess) {
      const copyBtn = document.getElementById('btn-copy-flag');
      if (copyBtn) {
        copyBtn.addEventListener('click', () => {
          const doCopy = () => {
            copyBtn.textContent = 'Skopiowano! ✓';
            setTimeout(() => { copyBtn.textContent = 'Kopiuj'; }, 2000);
          };
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(data.flag).then(doCopy).catch(() => {
              fallbackCopy(data.flag, doCopy);
            });
          } else {
            fallbackCopy(data.flag, doCopy);
          }
        });
      }
    }
  }

  function fallbackCopy(text, callback) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      if (callback) callback();
    } catch (e) {
      console.error('Copy fallback failed', e);
    }
    document.body.removeChild(textArea);
  }

  function renderSolvedBanner() {
    if (!currentConfig.taskId) return;
    const stored = getStoredFlag(currentConfig.taskId);
    if (!stored) return;

    let banner = document.getElementById('xss-solved-banner');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'xss-solved-banner';
      banner.className = 'solved-banner';
      const container = document.querySelector('.container');
      const card = document.querySelector('.card');
      if (container && card) {
        container.insertBefore(banner, card);
      }
    }

    banner.innerHTML = `
      <div class="solved-banner-inner">
        <span class="solved-badge">✓ ZALICZONE</span>
        <span class="solved-text">Zdobyta flaga: <code>${escapeHtml(stored)}</code></span>
        <button class="btn btn-sm btn-outline" id="btn-banner-copy">Kopiuj flagę</button>
      </div>
    `;

    const bannerCopy = document.getElementById('btn-banner-copy');
    if (bannerCopy) {
      bannerCopy.addEventListener('click', () => {
        const doCopy = () => {
          bannerCopy.textContent = 'Skopiowano! ✓';
          setTimeout(() => { bannerCopy.textContent = 'Kopiuj flagę'; }, 2000);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(stored).then(doCopy).catch(() => {
            fallbackCopy(stored, doCopy);
          });
        } else {
          fallbackCopy(stored, doCopy);
        }
      });
    }
  }

  let isConfigured = false;
  window.setupXssExercise = function(config) {
    if (isConfigured) return;
    isConfigured = true;
    currentConfig = Object.freeze(Object.assign({}, config));
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        renderSolvedBanner();
      });
    } else {
      renderSolvedBanner();
    }
  };

  window.XssLab = {
    getSolvedFlags,
    STORAGE_KEY
  };
})();
