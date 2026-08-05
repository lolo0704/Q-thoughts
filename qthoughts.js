/**
 * Q-Thoughts Engine v4.0 (Pure Observer Mode - No more cards)
 * Dépôt GitHub : https://github.com/lolo0704/Q-thoughts
 * CDN : https://cdn.jsdelivr.net/gh/lolo0704/Q-thoughts@main/qthoughts.js
 */

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

  const STYLES = `
    :root {
      --bg-color: #0b0f19;          /* Fond principal sombre */
      --col-bg: #151e2e;           /* Fond des colonnes */
      --card-bg: #e2e8f0;          /* Fond clair adouci (gris ardoise) */
      --card-text: #0f172a;        /* Texte principal des cartes (très foncé) */
      --card-muted: #475569;       /* Texte secondaire des cartes */
      --text-main: #f8fafc;        /* Texte principal de l'interface */
      --text-muted: #94a3b8;       /* Texte secondaire de l'interface */
      
      --accent-hypotheses: #d97706; /* Orange */
      --accent-todiscuss: #0284c7;  /* Bleu ciel */
      --accent-discussed: #16a34a;  /* Vert */
      --accent-pruned: #9333ea;     /* Violet */
      --accent-objective: #6366f1;  /* Indigo */
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: system-ui, -apple-system, sans-serif;
      background-color: var(--bg-color);
      color: var(--text-main);
      padding: 1.5rem;
      line-height: 1.5;
    }

    header {
      margin-bottom: 1.5rem;
      border-bottom: 1px solid #334155;
      padding-bottom: 1rem;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
    }

    .header-title-zone h1 { font-size: 1.5rem; font-weight: 800; color: #f8fafc; }
    p.subtitle { color: #94a3b8; font-size: 0.85rem; margin-top: 0.2rem; }

    .toolbar-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center; }

    .view-toggle {
      display: flex;
      background-color: #0f172a;
      border: 1px solid #334155;
      border-radius: 8px;
      padding: 0.2rem;
      gap: 0.2rem;
    }

    .action-btn-header {
      background-color: #334155;
      border: none;
      color: #ffffff;
      padding: 0.45rem 0.85rem;
      font-size: 0.8rem;
      font-weight: 600;
      border-radius: 6px;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .action-btn-header:hover { background-color: #0284c7; }

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
      border-radius: 6px;
      cursor: pointer;
    }

    .toggle-btn.active { background-color: #0284c7; color: #ffffff; }

    .objective-banner {
      background-color: #151e2e;
      border-left: 5px solid var(--accent-objective);
      border-radius: 8px;
      padding: 1rem 1.25rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
    }

    .objective-info h2 { font-size: 0.95rem; font-weight: 700; color: #818cf8; margin-bottom: 0.25rem; }
    .objective-desc { font-size: 0.875rem; color: #cbd5e1; }

    .reactivation-alert-banner {
      background-color: rgba(245, 158, 11, 0.15);
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
      padding: 0.35rem 0.75rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 700;
      cursor: pointer;
    }

    .board { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem; }

    .column {
      background-color: var(--col-bg);
      border: 1px solid #28374d;
      border-radius: 12px;
      padding: 1rem;
    }

    .column-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 3px solid transparent; }
    .column-hypotheses .column-header { border-color: var(--accent-hypotheses); }
    .column-todiscuss .column-header { border-color: var(--accent-todiscuss); }
    .column-discussed .column-header { border-color: var(--accent-discussed); }
    .column-pruned .column-header { border-color: var(--accent-pruned); }

    .column-title { font-size: 0.9rem; font-weight: 700; color: #f8fafc; }
    .badge-count { background-color: #334155; color: #f8fafc; font-size: 0.75rem; font-weight: 700; padding: 0.15rem 0.6rem; border-radius: 9999px; }

    .card-list { display: flex; flex-direction: column; gap: 1rem; }

    /* CARTE EN FOND CLAIR ADOUCI (GRIS ARDOISE CLAIR) AVEC DÉTACHEMENT NET */
    .card {
      background-color: var(--card-bg);
      color: var(--card-text);
      border-radius: 10px;
      padding: 1rem;
      box-shadow: 0 10px 18px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3);
      border: 1px solid #cbd5e1;
      border-left: 6px solid #64748b;
      transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
    }

    .column-hypotheses .card { border-left-color: var(--accent-hypotheses); }
    .column-todiscuss .card { border-left-color: var(--accent-todiscuss); }
    .column-discussed .card { border-left-color: var(--accent-discussed); }
    .column-pruned .card { border-left-color: var(--accent-pruned); }

    .card:hover {
      transform: translateY(-3px);
      box-shadow: 0 14px 24px -4px rgba(0, 0, 0, 0.65);
    }

    .card.highlighted { 
      border-color: #0284c7 !important; 
      box-shadow: 0 0 0 4px #38bdf8, 0 10px 20px -3px rgba(0, 0, 0, 0.6); 
    }

    /* BADGE ID EN DÉBUT DE CARTE */
    .card-id-badge {
      display: inline-block;
      background-color: #0f172a;
      color: #38bdf8;
      font-family: monospace;
      font-size: 0.75rem;
      font-weight: 800;
      padding: 0.15rem 0.5rem;
      border-radius: 5px;
      margin-right: 0.5rem;
      vertical-align: middle;
    }

    .card-title {
      font-size: 0.925rem;
      font-weight: 700;
      color: var(--card-text);
      margin-bottom: 0.5rem;
      line-height: 1.35;
    }

    .card-field {
      font-size: 0.8rem;
      color: var(--card-muted);
      margin-top: 0.4rem;
      padding-top: 0.4rem;
      border-top: 1px dashed #cbd5e1;
    }

    .card-field strong { color: #0f172a; }

    .card-relations { display: flex; flex-wrap: wrap; gap: 0.35rem; margin-top: 0.6rem; }

    .relation-tag {
      background-color: #0f172a;
      border: 1px solid #334155;
      color: #38bdf8;
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
      cursor: pointer;
    }

    .relation-tag:hover { background-color: #0284c7; color: #ffffff; }

    .relation-tag:focus-visible {
      outline: 2px solid #38bdf8;
      outline-offset: 1px;
    }

    .compact-mode .card { padding: 0.65rem 0.85rem; }
    .compact-mode .card-field, .compact-mode .card-relations { display: none !important; }

    .modal-overlay {
      position: fixed; inset: 0; background-color: rgba(0, 0, 0, 0.8); backdrop-filter: blur(5px); display: none; align-items: center; justify-content: center; z-index: 1000;
    }
    .modal-overlay.active { display: flex; }
    .modal-card { background-color: var(--col-bg); border: 1px solid #334155; border-radius: 12px; padding: 1.5rem; max-width: 520px; width: 90%; }
    .modal-textarea { width: 100%; height: 120px; background-color: #0b0f19; border: 1px solid #334155; border-radius: 6px; color: var(--text-main); padding: 0.75rem; font-family: monospace; font-size: 0.775rem; margin-bottom: 1rem; }
    .modal-title { font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem; }
    .modal-desc { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.25rem; }
    .modal-buttons { display: flex; flex-direction: column; gap: 0.5rem; }
    .modal-btn { padding: 0.6rem 1rem; border-radius: 6px; border: 1px solid #334155; font-size: 0.825rem; font-weight: 600; cursor: pointer; text-align: center; }
    .modal-btn-primary { background-color: #0284c7; color: #fff; border-color: #0369a1; }
    .modal-btn-cancel { background: transparent; border-color: transparent; color: var(--text-muted); }

    .toast { position: fixed; bottom: 1.5rem; right: 1.5rem; background-color: #22c55e; color: #000; font-weight: 700; padding: 0.75rem 1.25rem; border-radius: 8px; display: none; z-index: 1100; }
  `;

  function injectStyles() {
    const styleEl = document.createElement('style');
    styleEl.textContent = STYLES;
    document.head.appendChild(styleEl);
  }

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
          <div id="summary-content" style="white-space: pre-line; color: var(--text-main); background: #0b0f19; padding: 0.85rem; border-radius: 6px; font-size: 0.8rem; margin-bottom: 1rem; border: 1px solid #334155; max-height: 280px; overflow-y: auto;"></div>
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

  function normalizeQThoughtsData(raw) {
    const src = raw || {};
    const cleanCard = (card, defaultPrefix, index) => {
      if (!card || typeof card !== 'object') return null;
      const rawTitle = String(card.title || card.name || 'Sans titre');
      const fallbackId = `${defaultPrefix}_${index + 1}`;
      return {
        id: String(card.id || fallbackId),
        title: rawTitle,
        reason: String(card.reason || card.why || ''),
        consequence: String(card.consequence || card.impact || ''),
        condition: String(card.condition || card.reactivation_condition || ''),
        related_to: Array.isArray(card.related_to) ? card.related_to.map(String) : []
      };
    };

    const cleanList = (arr, prefix) => Array.isArray(arr) ? arr.map((c, idx) => cleanCard(c, prefix, idx)).filter(Boolean) : [];

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

  function getVisibleFocusables(container) {
    if (!container) return [];
    const all = container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    return Array.from(all).filter(el => {
      return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length) && 
             window.getComputedStyle(el).visibility !== 'hidden';
    });
  }

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

  function renderBoard() {
    document.getElementById('obj-title').innerHTML = "🎯 Objectif : " + escapeHtml(QTHOUGHTS_DATA.objective?.title || "");
    document.getElementById('obj-desc').textContent = QTHOUGHTS_DATA.objective?.description || "";

    const pending = QTHOUGHTS_DATA.pending_reactivations || [];
    document.getElementById('reactivation-alert').style.display = pending.length > 0 ? 'flex' : 'none';
    document.getElementById('reactivation-count').textContent = pending.length;

    const renderCardList = (list, colType) => {
      return (list || []).map(item => `
        <article class="card" id="card-${escapeHtml(item.id)}">
          <div class="card-title">
            <span class="card-id-badge">#${escapeHtml(item.id)}</span>
            ${escapeHtml(item.title)}
          </div>
          ${item.reason ? `<div class="card-field"><strong>Motif :</strong> ${escapeHtml(item.reason)}</div>` : ''}
          ${item.consequence ? `<div class="card-field"><strong>Conséquence :</strong> ${escapeHtml(item.consequence)}</div>` : ''}
          ${colType === 'pruned' && item.condition ? `<div class="card-field" style="color: #7c2d12;"><strong>Condition :</strong> ${escapeHtml(item.condition)}</div>` : ''}
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
        <div class="column-header"><h2 class="column-title">🔮 Hypothèses</h2><span class="badge-count">${QTHOUGHTS_DATA.hypotheses.length}</span></div>
        <div class="card-list">${renderCardList(QTHOUGHTS_DATA.hypotheses, 'hypotheses')}</div>
      </section>
      <section class="column column-todiscuss">
        <div class="column-header"><h2 class="column-title">📌 Points à discuter</h2><span class="badge-count">${QTHOUGHTS_DATA.toDiscuss.length}</span></div>
        <div class="card-list">${renderCardList(QTHOUGHTS_DATA.toDiscuss, 'toDiscuss')}</div>
      </section>
      <section class="column column-discussed">
        <div class="column-header"><h2 class="column-title">✅ Points conservés</h2><span class="badge-count">${QTHOUGHTS_DATA.discussed.length}</span></div>
        <div class="card-list">${renderCardList(QTHOUGHTS_DATA.discussed, 'discussed')}</div>
      </section>
      <section class="column column-pruned">
        <div class="column-header"><h2 class="column-title">🌱 Points abandonnés</h2><span class="badge-count">${QTHOUGHTS_DATA.pruned.length}</span></div>
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
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleRel(); }
      });
    });
  }

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
      copyTextToClipboard(QTHOUGHTS_DATA.summary || "", () => {
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
        closeModal(e.target.getAttribute('data-close'));
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
