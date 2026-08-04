/**
 * Q-Thoughts Engine v3.5 (Pure Observer Mode)
 * Dépôt GitHub : https://github.com/lolo0704/Q-thoughts
 * CDN : https://cdn.jsdelivr.net/gh/lolo0704/Q-thoughts@main/qthoughts.js
 */

(function () {
  'use strict';

  function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(36);
  }

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
    }

    .action-btn-header:hover { background-color: #0284c7; color: #fff; }

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
    }

    .relation-tag:hover { background-color: #6366f1; color: #fff; }

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

  function buildDOM() {
    document.body.innerHTML = `
      <header>
        <div class="header-title-zone">
          <h1>🧠 Q-Thoughts</h1>
          <p class="subtitle">Mémoire latérale du raisonnement (Mode Observateur Pure)</p>
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

      <div id="summary-modal" class="modal-overlay">
        <div class="modal-card">
          <h3 class="modal-title">📝 Synthèse stratégique</h3>
          <div id="summary-content" style="white-space: pre-line; color: var(--text-main); background: rgba(11, 15, 25, 0.9); padding: 0.85rem; border-radius: 6px; font-size: 0.8rem; margin-bottom: 1rem; border: 1px solid var(--card-border); max-height: 280px; overflow-y: auto;"></div>
          <div class="modal-buttons">
            <button class="modal-btn modal-btn-primary" id="btn-copy-summary">📋 Copier la synthèse</button>
            <button class="modal-btn modal-btn-cancel" data-close="summary-modal">Fermer</button>
          </div>
        </div>
      </div>

      <div id="import-modal" class="modal-overlay">
        <div class="modal-card">
          <h3 class="modal-title">📥 Importer une mémoire Q-Thoughts</h3>
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

  let QTHOUGHTS_DATA = normalizeQThoughtsData(window.QTHOUGHTS_DATA);
  let currentViewMode = 'expanded';

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

  function renderBoard() {
    document.getElementById('obj-title').innerHTML = "🎯 Objectif : " + escapeHtml(QTHOUGHTS_DATA.objective?.title || "");
    document.getElementById('obj-desc').textContent = QTHOUGHTS_DATA.objective?.description || "";

    const pending = QTHOUGHTS_DATA.pending_reactivations || [];
    document.getElementById('reactivation-alert').style.display = pending.length > 0 ? 'flex' : 'none';
    document.getElementById('reactivation-count').textContent = pending.length;

    /* RENDU STRICT : AUCUN BOUTON D'ACTION DANS LES CARTES */
    const renderCardList = (list, colType) => {
      return (list || []).map(item => `
        <article class="card" id="card-${item.id}">
          <div class="card-title">${escapeHtml(item.title)}</div>
          ${item.reason ? `<div class="card-field"><strong>Motif :</strong> ${escapeHtml(item.reason)}</div>` : ''}
          ${item.consequence ? `<div class="card-field"><strong>Conséquence :</strong> ${escapeHtml(item.consequence)}</div>` : ''}
          ${colType === 'pruned' && item.condition ? `<div class="card-field" style="color: #fde68a;"><strong>Condition :</strong> ${escapeHtml(item.condition)}</div>` : ''}
          ${(item.related_to || []).length > 0 ? `
            <div class="card-relations">
              ${item.related_to.map(rel => `<span class="relation-tag" data-rel-id="${escapeHtml(rel)}">🔗 #${escapeHtml(rel)}</span>`).join('')}
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

    document.querySelectorAll('.relation-tag').forEach(tag => {
      tag.addEventListener('click', (e) => highlightRelation(e.target.getAttribute('data-rel-id')));
    });
  }

  function init() {
    injectStyles();
    buildDOM();

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

    document.getElementById('btn-open-summary').addEventListener('click', () => {
      document.getElementById('summary-content').textContent = QTHOUGHTS_DATA.summary || "Aucune synthèse.";
      document.getElementById('summary-modal').classList.add('active');
    });

    document.getElementById('btn-copy-summary').addEventListener('click', () => {
      const text = QTHOUGHTS_DATA.summary || "";
      if (navigator.clipboard) navigator.clipboard.writeText(text);
      else document.execCommand('copy');
      showToast("📋 Synthèse copiée !");
      document.getElementById('summary-modal').classList.remove('active');
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

    document.getElementById('btn-open-import').addEventListener('click', () => {
      document.getElementById('import-json-textarea').value = '';
      document.getElementById('import-step-input').style.display = 'block';
      document.getElementById('import-step-result').style.display = 'none';
      document.getElementById('import-modal').classList.add('active');
    });

    document.getElementById('btn-process-import').addEventListener('click', () => {
      const rawText = document.getElementById('import-json-textarea').value.trim();
      if (!rawText) return;
      try {
        const parsed = JSON.parse(rawText);
        QTHOUGHTS_DATA = normalizeQThoughtsData(parsed);
        window.QTHOUGHTS_DATA = QTHOUGHTS_DATA;
        renderBoard();
        document.getElementById('import-sync-prompt').value = `Nous avons restaurer Q-Thoughts :\n\`\`\`json\n${JSON.stringify(QTHOUGHTS_DATA, null, 2)}\n\`\`\``;
        document.getElementById('import-step-input').style.display = 'none';
        document.getElementById('import-step-result').style.display = 'block';
      } catch (err) {
        showToast("⚠️ JSON invalide : " + err.message);
      }
    });

    document.getElementById('btn-copy-sync-prompt').addEventListener('click', () => {
      const text = document.getElementById('import-sync-prompt').value;
      if (navigator.clipboard) navigator.clipboard.writeText(text);
      else document.execCommand('copy');
      showToast("📋 Prompt de synchronisation copié !");
      document.getElementById('import-modal').classList.remove('active');
    });

    document.querySelectorAll('[data-close]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetModalId = e.target.getAttribute('data-close');
        document.getElementById(targetModalId).classList.remove('active');
      });
    });

    document.getElementById('btn-filter-reactivations').addEventListener('click', () => {
      if (QTHOUGHTS_DATA.pending_reactivations && QTHOUGHTS_DATA.pending_reactivations.length > 0) {
        highlightRelation(QTHOUGHTS_DATA.pending_reactivations[0]);
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
