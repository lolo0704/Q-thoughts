/**
 * Q-Thoughts Engine v3.8 (Pure Observer Mode - Accessibility & Focus Fixes)
 * Dépôt GitHub : https://github.com/lolo0704/Q-thoughts
 * CDN : https://cdn.jsdelivr.net/gh/lolo0704/Q-thoughts@main/qthoughts.js
 */

/* STREAMING_CHUNK:Defining utility functions for HTML escaping and ID hashing... */
(function () {
  'use strict';

  // Sécurisation HTML contre les failles XSS
  function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Générateur d'ID déterministe basé sur le hash du titre (PR-8)
  function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(36);
  }

  /* STREAMING_CHUNK:Implementing robust clipboard copy with error handling... */
  // Pressepapier universel avec fallback textarea et gestion d'erreur par défaut
  function copyTextToClipboard(text, onSuccess, onError) {
    const handleErr = onError || (() => showToast("⚠️ Échec de la copie"));
    
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(onSuccess).catch(handleErr);
    } else {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        if (successful) onSuccess();
        else handleErr();
      } catch (err) {
        handleErr(err);
      }
    }
  }

  /* STREAMING_CHUNK:Declaring custom CSS design tokens and focus-visible styles... */
  const STYLES = `
    :root {
      --bg-color: #0b0f19;
      --card-bg: #151d2a;
      --card-border: #263346;
      --text-main: #f1f5f9;
      --text-muted: #94a3b8;
      --accent-todiscuss: #38bdf8;
      --accent-discussed: #22c55e;
      --accent-pruned: #a855f7;
      --accent-hypotheses: #f59e0b;
      --accent-objective: #6366f1;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background-color: var(--bg-color);
      color: var(--text-main);
      padding: 1.25rem;
      line-height: 1.5;
    }

    header {
      margin-bottom: 1.25rem;
      border-bottom: 1px solid var(--card-border);
      padding-bottom: 1rem;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
    }

    .header-title-zone h1 { font-size: 1.4rem; font-weight: 700; }
    p.subtitle { color: var(--text-muted); font-size: 0.825rem; margin-top: 0.2rem; }

    .toolbar-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center; }

    .view-toggle {
      display: flex;
      background-color: #0b0f19;
      border: 2px solid #38bdf8;
      border-radius: 10px;
      padding: 0.15rem;
      gap: 0.2rem;
    }

    .action-btn-header {
      background-color: #151d2a;
      border: 1px solid #334155;
      color: var(--text-main);
      padding: 0.4rem 0.75rem;
      font-size: 0.775rem;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .action-btn-header:hover { 
      background-color: #0284c7; 
      color: #fff; 
    }

    .action-btn-header:focus-visible,
    .toggle-btn:focus-visible,
    .reactivation-btn:focus-visible,
    .modal-btn:focus-visible {
      outline: 2px solid #38bdf8;
      outline-offset: 2px;
    }

    .toggle-btn {
      background: transparent;
      border: none;
      color: #94a3b8;
      padding: 0.35rem 0.75rem;
      font-size: 0.775rem;
      font-weight: 600;
      border-radius: 7px;
      cursor: pointer;
    }

    .toggle-btn.active { background-color: #0284c7; color: #ffffff; }

    /* STREAMING_CHUNK:Styling layout banners and board columns... */
    .objective-banner {
      background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%);
      border: 1px solid rgba(99, 102, 241, 0.4);
      border-radius: 12px;
      padding: 1rem 1.25rem;
      margin-bottom: 1.25rem;
    }

    .objective-info h2 { font-size: 0.95rem; font-weight: 700; color: var(--accent-objective); margin-bottom: 0.25rem; }
    .objective-desc { font-size: 0.85rem; color: var(--text-main); }

    .reactivation-alert-banner {
      background: rgba(245, 158, 11, 0.1);
      border: 1px solid rgba(245, 158, 11, 0.4);
      color: #fde68a;
      padding: 0.65rem 1rem;
      border-radius: 8px;
      margin-bottom: 1.25rem;
      font-size: 0.825rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }

    .reactivation-btn {
      background-color: #f59e0b;
      color: #000;
      border: none;
      padding: 0.3rem 0.65rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 700;
      cursor: pointer;
      white-space: nowrap;
    }

    .board { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem; }

    .column {
      background-color: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 1.1rem;
    }

    .column-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid transparent; }
    .column-hypotheses .column-header { border-color: var(--accent-hypotheses); }
    .column-todiscuss .column-header { border-color: var(--accent-todiscuss); }
    .column-discussed .column-header { border-color: var(--accent-discussed); }
    .column-pruned .column-header { border-color: var(--accent-pruned); }

    .column-title { font-size: 0.875rem; font-weight: 600; }
    .badge { background-color: var(--card-border); color: var(--text-main); font-size: 0.725rem; padding: 0.1rem 0.5rem; border-radius: 9999px; }
    .card-list { display: flex; flex-direction: column; gap: 0.85rem; }

    /* STREAMING_CHUNK:Styling cards and relation tags with distinct focus indicator... */
    .card {
      background-color: rgba(11, 15, 25, 0.7);
      border: 1px solid var(--card-border);
      border-radius: 8px;
      padding: 0.9rem;
      transition: all 0.2s ease;
    }

    .card.highlighted { border-color: #38bdf8 !important; box-shadow: 0 0 12px rgba(56, 189, 248, 0.4); }

    .card-title { font-size: 0.875rem; font-weight: 600; margin-bottom: 0.4rem; color: var(--text-main); }
    .card-field { font-size: 0.775rem; color: var(--text-muted); margin-bottom: 0.35rem; }
    .card-field strong { color: #cbd5e1; }
    .card-relations { display: flex; flex-wrap: wrap; gap: 0.3rem; margin-top: 0.5rem; }

    .relation-tag {
      background-color: rgba(99, 102, 241, 0.15);
      border: 1px solid rgba(99, 102, 241, 0.3);
      color: #a5b4fc;
      font-size: 0.675rem;
      padding: 0.1rem 0.4rem;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.15s ease, border-color 0.15s ease;
    }

    .relation-tag:hover { 
      background-color: #6366f1; 
      color: #fff; 
    }

    .relation-tag:focus-visible {
      outline: 2px solid #38bdf8;
      outline-offset: 1px;
      background-color: #4f46e5;
      color: #fff;
    }

    .compact-mode .card { padding: 0.6rem 0.85rem; }
    .compact-mode .card-field, .compact-mode .card-relations { display: none !important; }

    .modal-overlay {
      position: fixed; inset: 0; background-color: rgba(0, 0, 0, 0.8); backdrop-filter: blur(5px); display: none; align-items: center; justify-content: center; z-index: 1000;
    }
    .modal-overlay.active { display: flex; }
    .modal-card { background-color: var(--card-bg); border: 1px solid var(--card-border); border-radius: 12px; padding: 1.5rem; max-width: 520px; width: 90%; }
    .modal-textarea { width: 100%; height: 120px; background-color: rgba(11, 15, 25, 0.9); border: 1px solid var(--card-border); border-radius: 6px; color: var(--text-main); padding: 0.75rem; font-family: monospace; font-size: 0.775rem; margin-bottom: 1rem; }
    .modal-title { font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem; }
    .modal-desc { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.25rem; }
    .modal-buttons { display: flex; flex-direction: column; gap: 0.5rem; }
    .modal-btn { padding: 0.6rem 1rem; border-radius: 6px; border: 1px solid var(--card-border); font-size: 0.825rem; font-weight: 600; cursor: pointer; text-align: center; }
    .modal-btn-primary { background-color: #0284c7; color: #fff; border-color: #0369a1; }
    .modal-btn-cancel { background: transparent; border-color: transparent; color: var(--text-muted); }

    .toast { position: fixed; bottom: 1.5rem; right: 1.5rem; background-color: #22c55e; color: #000; font-weight: 600; padding: 0.75rem 1.25rem; border-radius: 8px; display: none; z-index: 1100; }
  `;

  function injectStyles() {
    const styleEl = document.createElement('style');
    styleEl.textContent = STYLES;
    document.head.appendChild(styleEl);
  }

  /* STREAMING_CHUNK:Building DOM structure with app content wrapper... */
  function buildDOM() {
    document.body.innerHTML = `
      <div id="app-content-wrapper">
        <header>
          <div class="header-title-zone">
            <h1>🧠 Q-Thoughts</h1>
            <p class="subtitle">Mémoire latérale du raisonnement (Mode Observateur Pur)</p>
          </div>
          <div class="toolbar-actions">
            <button class="action-btn-header" id="btn-open-summary">📝 Synthèse</button>
            <button class="action-btn-header" id="btn-export-json">📤 Exporter JSON</button>
            <button class="action-btn-header" id="btn-open-import">📥 Importer JSON</button>
            <div class="view-toggle">
              <button id="btn-expanded" class="toggle-btn active">📖 Vue Dépliée</button>
              <button id="btn-compact" class="toggle-btn">⚡ Vue Compacte</button>
            </div>
          </div>
        </header>

        <div class="objective-banner" id="objective-banner">
          <div class="objective-info">
            <h2 id="obj-title">🎯 Objectif</h2>
            <p class="objective-desc" id="obj-desc"></p>
          </div>
        </div>

        <div id="reactivation-alert" class="reactivation-alert-banner" style="display: none;">
          <span>⚠️ <strong>Réactivation potentielle :</strong> <span id="reactivation-count">0</span> piste(s).</span>
          <button class="reactivation-btn" id="btn-filter-reactivations">Examiner la piste</button>
        </div>

        <main class="board" id="app"></main>
      </div>

      <div id="summary-modal" class="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="summary-modal-title">
        <div class="modal-card">
          <h3 class="modal-title" id="summary-modal-title">📝 Synthèse stratégique</h3>
          <div id="summary-content" style="white-space: pre-line; color: var(--text-main); background: rgba(11, 15, 25, 0.9); padding: 0.85rem; border-radius: 6px; font-size: 0.8rem; margin-bottom: 1rem; border: 1px solid var(--card-border); max-height: 280px; overflow-y: auto;"></div>
          <div class="modal-buttons">
            <button class="modal-btn modal-btn-primary" id="btn-copy-summary">📋 Copier la synthèse</button>
            <button class="modal-btn modal-btn-cancel" data-close="summary-modal">Fermer</button>
          </div>
        </div>
      </div>

      <div id="import-modal" class="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="import-modal-title">
        <div class="modal-card">
          <h3 class="modal-title" id="import-modal-title">📥 Importer une mémoire Q-Thoughts</h3>
          <div id="import-step-input">
            <textarea id="import-json-textarea" class="modal-textarea" placeholder="Collez le contenu JSON ici..."></textarea>
            <div class="modal-buttons">
              <button class="modal-btn modal-btn-primary" id="btn-process-import">⚡ Restaurer</button>
              <button class="modal-btn modal-btn-cancel" data-close="import-modal">Annuler</button>
            </div>
          </div>
          <div id="import-step-result" style="display: none;">
            <p class="modal-desc" style="color: var(--accent-discussed);">✓ Mémoire chargée ! Copiez le prompt ci-dessous :</p>
            <textarea id="import-sync-prompt" class="modal-textarea" readonly></textarea>
            <div class="modal-buttons">
              <button class="modal-btn modal-btn-primary" id="btn-copy-sync-prompt">📋 Copier le prompt</button>
              <button class="modal-btn modal-btn-cancel" data-close="import-modal">Fermer</button>
            </div>
          </div>
        </div>
      </div>

      <div id="toast" class="toast">✓ Action effectuée !</div>
    `;
  }

  /* STREAMING_CHUNK:Implementing defensive JSON normalization... */
  function normalizeQThoughtsData(raw) {
    const src = raw || {};
    const cleanCard = (card, defaultPrefix) => {
      if (!card || typeof card !== 'object') return null;
      const rawTitle = String(card.title || card.name || 'Sans titre');
      const fallbackId = defaultPrefix + '_' + hashString(rawTitle);
      return {
        id: String(card.id || fallbackId),
        title: rawTitle,
        reason: String(card.reason || card.why || ''),
        consequence: String(card.consequence || card.impact || ''),
        condition: String(card.condition || card.reactivation_condition || ''),
        related_to: Array.isArray(card.related_to) ? card.related_to.map(String) : []
      };
    };

    const cleanList = (arr, prefix) => Array.isArray(arr) ? arr.map(c => cleanCard(c, prefix)).filter(Boolean) : [];

    return {
      objective: {
        title: String(src.objective?.title || 'Objectif de la session'),
        description: String(src.objective?.description || '')
      },
      summary: String(src.summary || ''),
      hypotheses: cleanList(src.hypotheses || src.principles, 'hyp'),
      toDiscuss: cleanList(src.toDiscuss || src.open_questions, 'td'),
      discussed: cleanList(src.discussed || src.conserved, 'dis'),
      pruned: cleanList(src.pruned || src.abandoned, 'pr'),
      pending_reactivations: Array.isArray(src.pending_reactivations) ? src.pending_reactivations.map(String) : []
    };
  }

  /* STREAMING_CHUNK:Initializing state variables and accessibility helpers... */
  let QTHOUGHTS_DATA = normalizeQThoughtsData(window.QTHOUGHTS_DATA);
  let currentViewMode = 'expanded';
  let currentReactivationIndex = 0;
  let lastFocusedElement = null;

  function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.style.display = 'block';
    setTimeout(() => { t.style.display = 'none'; }, 2500);
  }

  function highlightRelation(relId) {
    document.querySelectorAll('.card').forEach(c => c.classList.remove('highlighted'));
    const targetCard = document.getElementById(`card-${relId}`);
    if (targetCard) {
      targetCard.classList.add('highlighted');
      targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      showToast(`🔗 Lien vers #${relId}`);
    } else {
      showToast(`⚠️ Pensée #${relId} introuvable`);
    }
  }

  // Filtrage strict des éléments réellement visibles pour le focus trap
  function getVisibleFocusables(container) {
    if (!container) return [];
    const all = container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    return Array.from(all).filter(el => {
      return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length) && 
             window.getComputedStyle(el).visibility !== 'hidden';
    });
  }

  /* STREAMING_CHUNK:Managing modals with strict focus trapping and ARIA attributes... */
  function openModal(modalId, triggerEl) {
    lastFocusedElement = triggerEl || document.activeElement;
    const modal = document.getElementById(modalId);
    const appWrapper = document.getElementById('app-content-wrapper');

    if (modal) {
      modal.classList.add('active');
      if (appWrapper) appWrapper.setAttribute('aria-hidden', 'true');

      const focusables = getVisibleFocusables(modal);
      if (focusables.length > 0) focusables[0].focus();
    }
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    const appWrapper = document.getElementById('app-content-wrapper');

    if (modal) {
      modal.classList.remove('active');
      
      const remainingActiveModals = document.querySelectorAll('.modal-overlay.active');
      if (remainingActiveModals.length === 0 && appWrapper) {
        appWrapper.removeAttribute('aria-hidden');
      }

      if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
        lastFocusedElement.focus();
      }
    }
  }

  /* STREAMING_CHUNK:Rendering board columns with role="button" on relation tags... */
  function renderBoard() {
    document.getElementById('obj-title').innerHTML = "🎯 Objectif : " + escapeHtml(QTHOUGHTS_DATA.objective?.title || "");
    document.getElementById('obj-desc').textContent = QTHOUGHTS_DATA.objective?.description || "";

    const pending = QTHOUGHTS_DATA.pending_reactivations || [];
    document.getElementById('reactivation-alert').style.display = pending.length > 0 ? 'flex' : 'none';
    document.getElementById('reactivation-count').textContent = pending.length;

    const renderCardList = (list, colType) => {
      return (list || []).map(item => `
        <article class="card" id="card-${item.id}">
          <div class="card-title">${escapeHtml(item.title)}</div>
          ${item.reason ? `<div class="card-field"><strong>Motif :</strong> ${escapeHtml(item.reason)}</div>` : ''}
          ${item.consequence ? `<div class="card-field"><strong>Conséquence :</strong> ${escapeHtml(item.consequence)}</div>` : ''}
          ${colType === 'pruned' && item.condition ? `<div class="card-field" style="color: #fde68a;"><strong>Condition :</strong> ${escapeHtml(item.condition)}</div>` : ''}
          ${(item.related_to || []).length > 0 ? `
            <div class="card-relations">
              ${item.related_to.map(rel => `<span class="relation-tag" role="button" tabindex="0" data-rel-id="${escapeHtml(rel)}">🔗 #${escapeHtml(rel)}</span>`).join('')}
            </div>
          ` : ''}
        </article>
      `).join('');
    };

    const app = document.getElementById('app');
    app.innerHTML = `
      <section class="column column-hypotheses">
        <div class="column-header"><h2 class="column-title">🔮 Hypothèses</h2><span class="badge">${QTHOUGHTS_DATA.hypotheses.length}</span></div>
        <div class="card-list">${renderCardList(QTHOUGHTS_DATA.hypotheses, 'hypotheses')}</div>
      </section>
      <section class="column column-todiscuss">
        <div class="column-header"><h2 class="column-title">📌 Points à discuter</h2><span class="badge">${QTHOUGHTS_DATA.toDiscuss.length}</span></div>
        <div class="card-list">${renderCardList(QTHOUGHTS_DATA.toDiscuss, 'toDiscuss')}</div>
      </section>
      <section class="column column-discussed">
        <div class="column-header"><h2 class="column-title">✅ Points conservés</h2><span class="badge">${QTHOUGHTS_DATA.discussed.length}</span></div>
        <div class="card-list">${renderCardList(QTHOUGHTS_DATA.discussed, 'discussed')}</div>
      </section>
      <section class="column column-pruned">
        <div class="column-header"><h2 class="column-title">🌱 Points abandonnés</h2><span class="badge">${QTHOUGHTS_DATA.pruned.length}</span></div>
        <div class="card-list">${renderCardList(QTHOUGHTS_DATA.pruned, 'pruned')}</div>
      </section>
    `;

    if (currentViewMode === 'compact') {
      app.classList.add('compact-mode');
    } else {
      app.classList.remove('compact-mode');
    }

    document.querySelectorAll('.relation-tag').forEach(tag => {
      const handleRel = () => highlightRelation(tag.getAttribute('data-rel-id'));
      tag.addEventListener('click', handleRel);
      tag.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleRel();
        }
      });
    });
  }

  /* STREAMING_CHUNK:Attaching event listeners and keyboard accessibility handlers... */
  function init() {
    injectStyles();
    buildDOM();

    document.addEventListener('keydown', (e) => {
      const activeModal = document.querySelector('.modal-overlay.active');
      
      if (e.key === 'Escape' && activeModal) {
        closeModal(activeModal.id);
      }

      if (e.key === 'Tab' && activeModal) {
        const focusables = getVisibleFocusables(activeModal);
        if (focusables.length === 0) return;

        const firstEl = focusables[0];
        const lastEl = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstEl) {
            lastEl.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastEl) {
            firstEl.focus();
            e.preventDefault();
          }
        }
      }
    });

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          closeModal(overlay.id);
        }
      });
    });

    document.getElementById('btn-expanded').addEventListener('click', () => {
      currentViewMode = 'expanded';
      document.getElementById('app').classList.remove('compact-mode');
      document.getElementById('btn-expanded').classList.add('active');
      document.getElementById('btn-compact').classList.remove('active');
    });

    document.getElementById('btn-compact').addEventListener('click', () => {
      currentViewMode = 'compact';
      document.getElementById('app').classList.add('compact-mode');
      document.getElementById('btn-compact').classList.add('active');
      document.getElementById('btn-expanded').classList.remove('active');
    });

    document.getElementById('btn-open-summary').addEventListener('click', (e) => {
      document.getElementById('summary-content').textContent = QTHOUGHTS_DATA.summary || "Aucune synthèse.";
      openModal('summary-modal', e.currentTarget);
    });

    document.getElementById('btn-copy-summary').addEventListener('click', () => {
      const text = QTHOUGHTS_DATA.summary || "";
      copyTextToClipboard(text, () => {
        showToast("📋 Synthèse copiée !");
        closeModal('summary-modal');
      });
    });

    document.getElementById('btn-export-json').addEventListener('click', () => {
      const jsonString = JSON.stringify(QTHOUGHTS_DATA, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `qthoughts_memory_${new Date().toISOString().slice(0,10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("📤 Mémoire exportée en JSON !");
    });

    document.getElementById('btn-open-import').addEventListener('click', (e) => {
      document.getElementById('import-json-textarea').value = '';
      document.getElementById('import-step-input').style.display = 'block';
      document.getElementById('import-step-result').style.display = 'none';
      openModal('import-modal', e.currentTarget);
    });

    document.getElementById('btn-process-import').addEventListener('click', () => {
      const rawText = document.getElementById('import-json-textarea').value.trim();
      if (!rawText) return;
      try {
        const parsed = JSON.parse(rawText);
        QTHOUGHTS_DATA = normalizeQThoughtsData(parsed);
        window.QTHOUGHTS_DATA = QTHOUGHTS_DATA;
        currentReactivationIndex = 0;
        renderBoard();
        document.getElementById('import-sync-prompt').value = `Nous avons restauré Q-Thoughts :\n\`\`\`json\n${JSON.stringify(QTHOUGHTS_DATA, null, 2)}\n\`\`\``;
        document.getElementById('import-step-input').style.display = 'none';
        document.getElementById('import-step-result').style.display = 'block';
        
        // Re-placer le focus sur le bouton de copie du résultat maintenant visible
        const copyBtn = document.getElementById('btn-copy-sync-prompt');
        if (copyBtn) copyBtn.focus();
      } catch (err) {
        showToast("⚠️ JSON invalide : " + err.message);
      }
    });

    document.getElementById('btn-copy-sync-prompt').addEventListener('click', () => {
      const text = document.getElementById('import-sync-prompt').value;
      copyTextToClipboard(text, () => {
        showToast("📋 Prompt de synchronisation copié !");
        closeModal('import-modal');
      });
    });

    document.querySelectorAll('[data-close]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetModalId = e.target.getAttribute('data-close');
        closeModal(targetModalId);
      });
    });

    document.getElementById('btn-filter-reactivations').addEventListener('click', () => {
      const pending = QTHOUGHTS_DATA.pending_reactivations || [];
      if (pending.length > 0) {
        const targetId = pending[currentReactivationIndex % pending.length];
        highlightRelation(targetId);
        showToast(`🔍 Examen piste (${(currentReactivationIndex % pending.length) + 1}/${pending.length})`);
        currentReactivationIndex++;
      }
    });

    renderBoard();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
