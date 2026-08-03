/**
 * Q-Thoughts Engine v2.0
 * Moteur autonome de navigation cognitive et mémoire latérale.
 * Injecte automatiquement le CSS, le DOM et gère le state interactif.
 */

(function () {
  'use strict';

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
      --btn-hover: #263346;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
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

    .header-title-zone h1 {
      font-size: 1.4rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    p.subtitle {
      color: var(--text-muted);
      font-size: 0.825rem;
      margin-top: 0.2rem;
    }

    .toolbar-actions {
      display: flex;
      gap: 0.5rem;
      flex-wrap: nowrap;
      align-items: center;
      overflow-x: auto;
      padding-bottom: 0.2rem;
    }

    .view-toggle {
      display: flex;
      background-color: #0b0f19;
      border: 2px solid #38bdf8;
      border-radius: 10px;
      padding: 0.15rem;
      gap: 0.2rem;
      box-shadow: 0 0 10px rgba(56, 189, 248, 0.15);
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
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 0.35rem;
      white-space: nowrap;
    }

    .action-btn-header:hover {
      background-color: #0284c7;
      border-color: #38bdf8;
      color: #ffffff;
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
      transition: all 0.2s ease;
      white-space: nowrap;
    }

    .toggle-btn.active {
      background-color: #0284c7;
      color: #ffffff;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.5);
    }

    /* BARRE D'OBJECTIF STRATÉGIQUE */
    .objective-banner {
      background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%);
      border: 1px solid rgba(99, 102, 241, 0.4);
      border-radius: 12px;
      padding: 1rem 1.25rem;
      margin-bottom: 1.25rem;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      position: relative;
      cursor: pointer;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }

    .objective-banner:hover {
      border-color: rgba(99, 102, 241, 0.8);
      box-shadow: 0 4px 25px rgba(99, 102, 241, 0.2);
    }

    .objective-info h2 {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--accent-objective);
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.25rem;
    }

    .objective-desc {
      font-size: 0.85rem;
      color: var(--text-main);
      max-width: 800px;
    }

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
      animation: fadeIn 0.3s ease-out;
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
      transition: background-color 0.15s ease;
      white-space: nowrap;
    }

    .reactivation-btn:hover {
      background-color: #d97706;
      color: #fff;
    }

    /* GRILLE ET COLONNES COGNITIVES */
    .board {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.25rem;
      align-items: start;
    }

    .column {
      background-color: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 1.1rem;
    }

    .column-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid transparent;
    }

    .column-hypotheses .column-header { border-color: var(--accent-hypotheses); }
    .column-todiscuss .column-header { border-color: var(--accent-todiscuss); }
    .column-discussed .column-header { border-color: var(--accent-discussed); }
    .column-pruned .column-header { border-color: var(--accent-pruned); }

    .column-title {
      font-size: 0.875rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .badge {
      background-color: var(--card-border);
      color: var(--text-main);
      font-size: 0.725rem;
      padding: 0.1rem 0.5rem;
      border-radius: 9999px;
      font-weight: 600;
    }

    .card-list {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }

    .card {
      background-color: rgba(11, 15, 25, 0.7);
      border: 1px solid var(--card-border);
      border-radius: 8px;
      padding: 0.9rem;
      transition: all 0.2s ease;
      position: relative;
    }

    .card:hover {
      border-color: var(--text-muted);
    }

    .card.highlighted {
      border-color: #38bdf8 !important;
      box-shadow: 0 0 12px rgba(56, 189, 248, 0.4);
    }

    .card-title {
      font-size: 0.875rem;
      font-weight: 600;
      margin-bottom: 0.4rem;
      color: var(--text-main);
      line-height: 1.35;
    }

    .card-field {
      font-size: 0.775rem;
      color: var(--text-muted);
      margin-bottom: 0.35rem;
      line-height: 1.4;
    }

    .card-field strong {
      color: #cbd5e1;
      font-weight: 600;
    }

    .card-relations {
      display: flex;
      flex-wrap: wrap;
      gap: 0.3rem;
      margin-top: 0.5rem;
      margin-bottom: 0.6rem;
    }

    .relation-tag {
      background-color: rgba(99, 102, 241, 0.15);
      border: 1px solid rgba(99, 102, 241, 0.3);
      color: #a5b4fc;
      font-size: 0.675rem;
      padding: 0.1rem 0.4rem;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .relation-tag:hover {
      background-color: #6366f1;
      color: #fff;
    }

    .card-action {
      width: 100%;
      background-color: transparent;
      border: 1px solid var(--card-border);
      color: var(--text-main);
      padding: 0.45rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      transition: background-color 0.15s ease, border-color 0.15s ease;
      margin-top: 0.4rem;
    }

    .card-action:hover {
      background-color: var(--btn-hover);
      border-color: var(--text-muted);
    }

    .compact-mode .card {
      padding: 0.6rem 0.85rem;
      position: relative;
    }

    .compact-mode .card-field,
    .compact-mode .card-relations,
    .compact-mode .card-action {
      display: none !important;
    }

    .compact-mode .card-title {
      margin-bottom: 0;
      font-size: 0.825rem;
      cursor: pointer;
    }

    .column-title-wrap {
      position: relative;
      display: inline-flex;
      align-items: center;
      cursor: help;
    }

    .category-tooltip {
      position: absolute;
      top: calc(100% + 8px);
      left: 0;
      width: 250px;
      background-color: #0b0f19;
      border: 1px solid var(--card-border);
      color: var(--text-muted);
      font-size: 0.75rem;
      font-weight: normal;
      padding: 0.65rem 0.8rem;
      border-radius: 8px;
      box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.8);
      z-index: 100;
      opacity: 0;
      visibility: hidden;
      transform: translateY(-4px);
      transition: all 0.2s ease;
      pointer-events: none;
      line-height: 1.4;
    }

    .column-title-wrap:hover .category-tooltip {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    .card-hover-detail {
      display: none;
    }

    .card-hover-detail-title {
      font-size: 0.675rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--accent-todiscuss);
      margin-bottom: 0.35rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 0.3rem;
    }

    .column-hypotheses .card-hover-detail-title { color: var(--accent-hypotheses); }
    .column-discussed .card-hover-detail-title { color: var(--accent-discussed); }
    .column-pruned .card-hover-detail-title { color: var(--accent-pruned); }

    .compact-mode .card:hover .card-hover-detail {
      display: block;
      position: absolute;
      bottom: calc(100% + 8px);
      left: 12px;
      width: calc(100% + 16px);
      min-width: 250px;
      background-color: #070a12;
      border: 1px solid var(--accent-todiscuss);
      color: var(--text-main);
      border-radius: 8px;
      padding: 0.85rem;
      box-shadow: 0 16px 32px -4px rgba(0, 0, 0, 0.9), 0 0 12px rgba(56, 189, 248, 0.2);
      z-index: 999;
      font-size: 0.775rem;
      line-height: 1.45;
      animation: fadeIn 0.15s ease-out;
      pointer-events: none;
    }

    .compact-mode .column-hypotheses .card:hover .card-hover-detail {
      border-color: var(--accent-hypotheses);
      box-shadow: 0 16px 32px -4px rgba(0, 0, 0, 0.9), 0 0 12px rgba(245, 158, 11, 0.2);
    }

    .compact-mode .column-discussed .card:hover .card-hover-detail {
      border-color: var(--accent-discussed);
      box-shadow: 0 16px 32px -4px rgba(0, 0, 0, 0.9), 0 0 12px rgba(34, 197, 94, 0.2);
    }

    .compact-mode .column-pruned .card:hover .card-hover-detail {
      border-color: var(--accent-pruned);
      box-shadow: 0 16px 32px -4px rgba(0, 0, 0, 0.9), 0 0 12px rgba(168, 85, 247, 0.2);
    }

    .modal-overlay {
      position: fixed;
      inset: 0;
      background-color: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(4px);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.15s ease-out;
    }

    .modal-overlay.active {
      display: flex;
    }

    .modal-card {
      background-color: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 1.5rem;
      max-width: 520px;
      width: 90%;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.6);
    }

    .modal-textarea {
      width: 100%;
      height: 120px;
      background-color: rgba(11, 15, 25, 0.9);
      border: 1px solid var(--card-border);
      border-radius: 6px;
      color: var(--text-main);
      padding: 0.75rem;
      font-family: monospace;
      font-size: 0.775rem;
      resize: vertical;
      margin-bottom: 1rem;
    }

    .modal-textarea:focus {
      outline: none;
      border-color: var(--accent-todiscuss);
    }

    .modal-title {
      font-size: 1.1rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      color: var(--text-main);
    }

    .modal-desc {
      font-size: 0.85rem;
      color: var(--text-muted);
      margin-bottom: 1.25rem;
    }

    .modal-item-preview {
      background-color: rgba(11, 15, 25, 0.8);
      border: 1px solid var(--card-border);
      padding: 0.75rem;
      border-radius: 6px;
      font-weight: 600;
      font-size: 0.85rem;
      margin-bottom: 1.25rem;
      color: var(--accent-todiscuss);
    }

    .modal-buttons {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .modal-btn {
      padding: 0.6rem 1rem;
      border-radius: 6px;
      border: 1px solid var(--card-border);
      font-size: 0.825rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
      text-align: center;
    }

    .modal-btn-primary {
      background-color: #0284c7;
      color: #fff;
      border-color: #0369a1;
    }

    .modal-btn-primary:hover {
      background-color: #0369a1;
    }

    .modal-btn-secondary {
      background-color: rgba(255, 255, 255, 0.05);
      color: var(--text-main);
    }

    .modal-btn-secondary:hover {
      background-color: var(--card-border);
    }

    .modal-btn-cancel {
      background: transparent;
      border-color: transparent;
      color: var(--text-muted);
    }

    .modal-btn-cancel:hover {
      color: var(--text-main);
    }

    .toast {
      position: fixed;
      bottom: 1.5rem;
      right: 1.5rem;
      background-color: #22c55e;
      color: #000;
      font-weight: 600;
      padding: 0.75rem 1.25rem;
      border-radius: 8px;
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.4);
      display: none;
      align-items: center;
      gap: 0.5rem;
      animation: fadeIn 0.2s ease-in-out;
      z-index: 1100;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
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
          <p class="subtitle">Mémoire latérale du raisonnement & navigation cognitive</p>
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

      <div class="objective-banner" id="objective-banner" title="Cliquer pour modifier l'objectif">
        <div class="objective-info">
          <h2 id="obj-title">🎯 Objectif : Cadrage de Q-Thoughts</h2>
          <p class="objective-desc" id="obj-desc">Développer une interface autonome de navigation cognitive...</p>
        </div>
      </div>

      <div id="reactivation-alert" class="reactivation-alert-banner" style="display: none;">
        <span>⚠️ <strong>Réactivation potentielle :</strong> <span id="reactivation-count">0</span> piste(s) précédemment abandonnée(s) redeviennent pertinente(s).</span>
        <button class="reactivation-btn" id="btn-filter-reactivations">Examiner la piste</button>
      </div>

      <main class="board" id="app"></main>

      <!-- MODALES -->
      <div id="objective-modal" class="modal-overlay">
        <div class="modal-card">
          <h3 class="modal-title">🎯 Objectif courant du raisonnement</h3>
          <p class="modal-desc">Modifiez ou précisez la cible stratégique de cette session :</p>
          <input type="text" id="input-obj-title" class="modal-textarea" style="height: 40px; font-weight: bold; margin-bottom: 0.5rem;" placeholder="Titre de l'objectif...">
          <textarea id="input-obj-desc" class="modal-textarea" placeholder="Description détaillée du problème à résoudre..."></textarea>
          <div class="modal-buttons">
            <button class="modal-btn modal-btn-primary" id="btn-save-objective">💾 Sauvegarder l'objectif</button>
            <button class="modal-btn modal-btn-cancel" data-close="objective-modal">Fermer</button>
          </div>
        </div>
      </div>

      <div id="validation-modal" class="modal-overlay">
        <div class="modal-card">
          <h3 class="modal-title">Validation et conservation du choix</h3>
          <p class="modal-desc">Voulez-vous valider et transférer cet élément vers <strong>Points discutés et conservés</strong> ?</p>
          <div id="modal-item-title" class="modal-item-preview">Titre de l'élément</div>
          <div class="modal-buttons">
            <button class="modal-btn modal-btn-primary" id="btn-confirm-val-prompt">
              📋 Conserver + Copier la mise à jour cognitive
            </button>
            <button class="modal-btn modal-btn-secondary" id="btn-confirm-val-silent">
              ✅ Conserver silencieusement
            </button>
            <button class="modal-btn modal-btn-cancel" data-close="validation-modal">
              Annuler
            </button>
          </div>
        </div>
      </div>

      <div id="summary-modal" class="modal-overlay">
        <div class="modal-card">
          <h3 class="modal-title">📝 Synthèse stratégique de la session</h3>
          <p class="modal-desc">Vue d'ensemble haute-altitude (Objectif, Arbitrages, Cap) :</p>
          <div id="summary-content" class="modal-item-preview" style="white-space: pre-line; color: var(--text-main); background-color: rgba(11, 15, 25, 0.9); font-weight: normal; line-height: 1.6; max-height: 280px; overflow-y: auto;">
          </div>
          <div class="modal-buttons">
            <button class="modal-btn modal-btn-primary" id="btn-copy-summary">
              📋 Copier la synthèse (3 Piliers)
            </button>
            <button class="modal-btn modal-btn-cancel" data-close="summary-modal">
              Fermer
            </button>
          </div>
        </div>
      </div>

      <div id="import-modal" class="modal-overlay">
        <div class="modal-card">
          <h3 class="modal-title">📥 Importer une mémoire Q-Thoughts</h3>
          <p class="modal-desc">Collez un JSON d'exportation pour restaurer l'état exact du raisonnement :</p>

          <div id="import-step-input">
            <textarea id="import-json-textarea" class="modal-textarea" placeholder="Collez le contenu JSON ici..."></textarea>
            <div style="margin-bottom: 1rem;">
              <label style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 0.35rem;">Ou charger un fichier .json :</label>
              <input type="file" id="import-file-input" accept=".json" style="font-size: 0.8rem; color: var(--text-muted);">
            </div>
            <div class="modal-buttons">
              <button class="modal-btn modal-btn-primary" id="btn-process-import">
                ⚡ Restaurer la mémoire vive
              </button>
              <button class="modal-btn modal-btn-cancel" data-close="import-modal">
                Annuler
              </button>
            </div>
          </div>

          <div id="import-step-result" style="display: none;">
            <p class="modal-desc" style="color: var(--accent-discussed);">✓ Mémoire chargée avec succès ! Copiez le prompt de réalignement ci-dessous :</p>
            <textarea id="import-sync-prompt" class="modal-textarea" readonly></textarea>
            <div class="modal-buttons">
              <button class="modal-btn modal-btn-primary" id="btn-copy-sync-prompt">
                📋 Copier le prompt de synchro (Ctrl+V)
              </button>
              <button class="modal-btn modal-btn-cancel" data-close="import-modal">
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>

      <div id="toast" class="toast">✓ Action effectuée !</div>
    `;
  }

  let currentViewMode = 'expanded';
  let activeCardId = null;

  /**
   * Couche de normalisation défensive (RETEX Data Format)
   * Prévient tout plantage IHM, génère les IDs manquants et tolère les synonymes du LLM.
   */
  function normalizeQThoughtsData(raw) {
    const src = raw || {};

    const cleanCard = (card, defaultPrefix) => {
      if (!card || typeof card !== 'object') return null;
      return {
        id: String(card.id || (defaultPrefix + '_' + Math.random().toString(36).substring(2, 7))),
        title: String(card.title || card.name || 'Sans titre'),
        reason: String(card.reason || card.why || card.justification || ''),
        consequence: String(card.consequence || card.impact || ''),
        condition: String(card.condition || card.reactivation_condition || card.when || ''),
        related_to: Array.isArray(card.related_to) 
          ? card.related_to.map(String) 
          : (card.related_to ? [String(card.related_to)] : [])
      };
    };

    const cleanList = (arr, prefix) => {
      if (!Array.isArray(arr)) return [];
      return arr.map(c => cleanCard(c, prefix)).filter(Boolean);
    };

    return {
      objective: {
        title: String(src.objective?.title || 'Objectif de la session'),
        description: String(src.objective?.description || '')
      },
      summary: String(src.summary || ''),
      hypotheses: cleanList(src.hypotheses || src.principles || src.assumptions, 'hyp'),
      toDiscuss: cleanList(src.toDiscuss || src.open_questions, 'td'),
      discussed: cleanList(src.discussed || src.conserved, 'dis'),
      pruned: cleanList(src.pruned || src.abandoned, 'pr'),
      pending_reactivations: Array.isArray(src.pending_reactivations) 
        ? src.pending_reactivations.map(String) 
        : []
    };
  }

  const DEFAULT_DATA = {
    objective: {
      title: "Navigation Cognitive Q-Thoughts",
      description: "Préservation active de l'état du raisonnement et réactivation des idées."
    },
    pending_reactivations: [],
    summary: "🎯 OBJECTIF : Initialiser la mémoire de session.",
    hypotheses: [],
    toDiscuss: [],
    discussed: [],
    pruned: []
  };

  let QTHOUGHTS_DATA = normalizeQThoughtsData(window.QTHOUGHTS_DATA || DEFAULT_DATA);

  function setViewMode(mode) {
    currentViewMode = mode;
    const boardElement = document.getElementById('app');
    
    document.getElementById('btn-expanded').classList.toggle('active', mode === 'expanded');
    document.getElementById('btn-compact').classList.toggle('active', mode === 'compact');

    if (mode === 'compact') {
      boardElement.classList.add('compact-mode');
    } else {
      boardElement.classList.remove('compact-mode');
    }
  }

  function openModal(id) { document.getElementById(id).classList.add('active'); }
  function closeModal(id) { document.getElementById(id).classList.remove('active'); }

  function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.style.display = 'flex';
    setTimeout(() => { toast.style.display = 'none'; }, 2500);
  }

  window.openValidationModal = function(cardId) {
    activeCardId = cardId;
    const item = QTHOUGHTS_DATA.toDiscuss.find(i => i.id === cardId);
    if (!item) return;

    document.getElementById('modal-item-title').textContent = item.title;
    openModal('validation-modal');
  };

  function confirmValidation(copyWithPrompt) {
    if (!activeCardId) return;

    const index = QTHOUGHTS_DATA.toDiscuss.findIndex(i => i.id === activeCardId);
    if (index !== -1) {
      const [movedItem] = QTHOUGHTS_DATA.toDiscuss.splice(index, 1);
      movedItem.status = "conserved";
      QTHOUGHTS_DATA.discussed.unshift(movedItem);

      const syncPrompt = `Nous venons de valider et conserver la décision suivante : "${movedItem.title}".\nMotif : ${movedItem.reason || "Validation lors de nos échanges"}.\nMerci de mettre à jour ton état interne.`;

      if (copyWithPrompt) {
        navigator.clipboard.writeText(syncPrompt).then(() => {
          showToast("✓ Conservé + Prompt de synchro copié !");
        });
      } else {
        showToast("✓ Conservé dans la mémoire !");
      }
    }

    closeModal('validation-modal');
    renderBoard();
  }

  window.moveToDiscuss = function(cardId, fromCategory) {
    let sourceList = fromCategory === 'pruned' ? QTHOUGHTS_DATA.pruned : QTHOUGHTS_DATA.discussed;
    const index = sourceList.findIndex(i => i.id === cardId);
    
    if (index !== -1) {
      const [movedItem] = sourceList.splice(index, 1);
      movedItem.status = "open";
      QTHOUGHTS_DATA.toDiscuss.unshift(movedItem);
      
      const promptText = `Réactivons dans "Points à discuter" l'élément suivant : "${movedItem.title}".\nReprenons la réflexion sur ce point.`;
      navigator.clipboard.writeText(promptText).then(() => {
        showToast("📌 Remis à discuter + Prompt copié !");
      });

      renderBoard();
    }
  };

  window.highlightRelation = function(relId) {
    document.querySelectorAll('.card').forEach(c => c.classList.remove('highlighted'));
    const targetCard = document.getElementById(`card-${relId}`);
    if (targetCard) {
      targetCard.classList.add('highlighted');
      targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      showToast(`🔗 Lien vers la pensée #${relId}`);
    } else {
      showToast(`⚠️ Pensée #${relId} introuvable ou déplacée`);
    }
  };

  function exportSession() {
    const jsonString = JSON.stringify(QTHOUGHTS_DATA, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `qthoughts_memory_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("📤 Mémoire cognitive exportée en JSON !");
  }

  function processImport() {
    const rawText = document.getElementById('import-json-textarea').value.trim();
    if (!rawText) return;

    try {
      const parsed = JSON.parse(rawText);
      QTHOUGHTS_DATA = normalizeQThoughtsData(parsed);
      renderBoard();

      const syncPrompt = `Nous venons de restaurer notre mémoire cognitive Q-Thoughts. Voici l'état actuel de notre raisonnement (QTHOUGHTS_DATA) à prendre en compte :\n\n\`\`\`json\n${JSON.stringify(QTHOUGHTS_DATA, null, 2)}\n\`\`\``;

      document.getElementById('import-sync-prompt').value = syncPrompt;
      document.getElementById('import-step-input').style.display = 'none';
      document.getElementById('import-step-result').style.display = 'block';

    } catch (err) {
      alert("Structure JSON invalide : " + err.message);
    }
  }

  function renderBoard() {
    // 1. Mise à jour de la bannière d'objectif
    document.getElementById('obj-title').textContent = "🎯 Objectif : " + (QTHOUGHTS_DATA.objective?.title || "En cours");
    document.getElementById('obj-desc').textContent = QTHOUGHTS_DATA.objective?.description || "Aucune description fournie.";

    // 2. Gestion du bandeau de réactivation
    const pendingReactivations = QTHOUGHTS_DATA.pending_reactivations || [];
    const reactAlert = document.getElementById('reactivation-alert');
    if (pendingReactivations.length > 0) {
      document.getElementById('reactivation-count').textContent = pendingReactivations.length;
      reactAlert.style.display = 'flex';
    } else {
      reactAlert.style.display = 'none';
    }

    // 3. Rendu de la grille
    const app = document.getElementById('app');

    app.innerHTML = `
      <!-- COLONNE : HYPOTHÈSES IMPLICITES FAITES PAR L'IA -->
      <section class="column column-hypotheses">
        <div class="column-header">
          <div class="column-title-wrap">
            <h2 class="column-title">🔮 Hypothèses implicites faites par l'IA</h2>
            <div class="category-tooltip">Suppositions et prérequis identifiés dans la réflexion.</div>
          </div>
          <span class="badge">${(QTHOUGHTS_DATA.hypotheses || []).length}</span>
        </div>
        <div class="card-list">
          ${(QTHOUGHTS_DATA.hypotheses || []).map(item => `
            <article class="card" id="card-${item.id}">
              <div class="card-title">${item.title}</div>
              ${item.reason ? `<div class="card-field"><strong>Motif :</strong> ${item.reason}</div>` : ''}
              ${item.consequence ? `<div class="card-field"><strong>Conséquence :</strong> ${item.consequence}</div>` : ''}
              ${(item.related_to || []).length > 0 ? `
                <div class="card-relations">
                  ${item.related_to.map(rel => `<span class="relation-tag" onclick="window.highlightRelation('${rel}')">🔗 #${rel}</span>`).join('')}
                </div>
              ` : ''}
              <div class="card-hover-detail">
                <div class="card-hover-detail-title">💡 Aperçu détaillé</div>
                <strong>Motif :</strong> ${item.reason || "Non spécifié"}
              </div>
            </article>
          `).join('')}
        </div>
      </section>

      <!-- COLONNE : POINTS À DISCUTER -->
      <section class="column column-todiscuss">
        <div class="column-header">
          <div class="column-title-wrap">
            <h2 class="column-title">📌 Points à discuter</h2>
            <div class="category-tooltip">Questions ouvertes et pistes restant à explorer.</div>
          </div>
          <span class="badge">${(QTHOUGHTS_DATA.toDiscuss || []).length}</span>
        </div>
        <div class="card-list">
          ${(QTHOUGHTS_DATA.toDiscuss || []).map(item => `
            <article class="card" id="card-${item.id}">
              <div class="card-title" onclick="window.openValidationModal('${item.id}')">${item.title}</div>
              ${item.reason ? `<div class="card-field"><strong>Pourquoi :</strong> ${item.reason}</div>` : ''}
              ${item.consequence ? `<div class="card-field"><strong>Impact :</strong> ${item.consequence}</div>` : ''}
              ${(item.related_to || []).length > 0 ? `
                <div class="card-relations">
                  ${item.related_to.map(rel => `<span class="relation-tag" onclick="window.highlightRelation('${rel}')">🔗 #${rel}</span>`).join('')}
                </div>
              ` : ''}
              <div class="card-hover-detail">
                <div class="card-hover-detail-title">💡 Aperçu détaillé</div>
                <strong>Pourquoi :</strong> ${item.reason || item.title}
              </div>
              <button class="card-action" onclick="window.openValidationModal('${item.id}')">
                ✅ Valider et conserver
              </button>
            </article>
          `).join('')}
        </div>
      </section>

      <!-- COLONNE : POINTS DISCUTÉS ET CONSERVÉS -->
      <section class="column column-discussed">
        <div class="column-header">
          <div class="column-title-wrap">
            <h2 class="column-title">✅ Points discutés et conservés</h2>
            <div class="category-tooltip">Décisions et arbitrages fermement validés.</div>
          </div>
          <span class="badge">${(QTHOUGHTS_DATA.discussed || []).length}</span>
        </div>
        <div class="card-list">
          ${(QTHOUGHTS_DATA.discussed || []).map(item => `
            <article class="card" id="card-${item.id}">
              <div class="card-title">${item.title}</div>
              ${item.reason ? `<div class="card-field"><strong>Justification :</strong> ${item.reason}</div>` : ''}
              ${item.consequence ? `<div class="card-field"><strong>Acquis :</strong> ${item.consequence}</div>` : ''}
              ${(item.related_to || []).length > 0 ? `
                <div class="card-relations">
                  ${item.related_to.map(rel => `<span class="relation-tag" onclick="window.highlightRelation('${rel}')">🔗 #${rel}</span>`).join('')}
                </div>
              ` : ''}
              <div class="card-hover-detail">
                <div class="card-hover-detail-title">💡 Aperçu détaillé</div>
                <strong>Justification :</strong> ${item.reason || item.title}
              </div>
              <button class="card-action" onclick="window.moveToDiscuss('${item.id}', 'discussed')">
                📌 Remettre à discuter
              </button>
            </article>
          `).join('')}
        </div>
      </section>

      <!-- COLONNE : POINTS DISCUTÉS ET ABANDONNÉS -->
      <section class="column column-pruned">
        <div class="column-header">
          <div class="column-title-wrap">
            <h2 class="column-title">🌱 Points discutés et abandonnés</h2>
            <div class="category-tooltip">Pistes délibérément écartées avec conditions de réactivation.</div>
          </div>
          <span class="badge">${(QTHOUGHTS_DATA.pruned || []).length}</span>
        </div>
        <div class="card-list">
          ${(QTHOUGHTS_DATA.pruned || []).map(item => `
            <article class="card" id="card-${item.id}">
              <div class="card-title">${item.title}</div>
              ${item.reason ? `<div class="card-field"><strong>Raison du rejet :</strong> ${item.reason}</div>` : ''}
              <div class="card-field" style="color: #fde68a;"><strong>Condition :</strong> ${item.condition || item.reactivation_condition || 'Non spécifiée'}</div>
              ${(item.related_to || []).length > 0 ? `
                <div class="card-relations">
                  ${item.related_to.map(rel => `<span class="relation-tag" onclick="window.highlightRelation('${rel}')">🔗 #${rel}</span>`).join('')}
                </div>
              ` : ''}
              <div class="card-hover-detail">
                <div class="card-hover-detail-title">💡 Aperçu détaillé</div>
                <strong>Condition :</strong> ${item.condition || item.reactivation_condition || "Aucune"}
              </div>
              <button class="card-action" onclick="window.moveToDiscuss('${item.id}', 'pruned')">
                📌 Remettre à discuter
              </button>
            </article>
          `).join('')}
        </div>
      </section>
    `;

    setViewMode(currentViewMode);
  }

  function attachEvents() {
    document.getElementById('btn-expanded').addEventListener('click', () => setViewMode('expanded'));
    document.getElementById('btn-compact').addEventListener('click', () => setViewMode('compact'));

    document.getElementById('objective-banner').addEventListener('click', () => {
      document.getElementById('input-obj-title').value = QTHOUGHTS_DATA.objective?.title || '';
      document.getElementById('input-obj-desc').value = QTHOUGHTS_DATA.objective?.description || '';
      openModal('objective-modal');
    });

    document.getElementById('btn-save-objective').addEventListener('click', () => {
      QTHOUGHTS_DATA.objective.title = document.getElementById('input-obj-title').value.trim() || "Objectif";
      QTHOUGHTS_DATA.objective.description = document.getElementById('input-obj-desc').value.trim() || "";
      closeModal('objective-modal');
      renderBoard();
      showToast("🎯 Objectif mis à jour !");
    });

    document.getElementById('btn-open-summary').addEventListener('click', () => {
      document.getElementById('summary-content').textContent = QTHOUGHTS_DATA.summary || "Aucune synthèse disponible.";
      openModal('summary-modal');
    });

    document.getElementById('btn-copy-summary').addEventListener('click', () => {
      navigator.clipboard.writeText(QTHOUGHTS_DATA.summary || "").then(() => {
        showToast("📋 Synthèse copiée !");
        closeModal('summary-modal');
      });
    });

    document.getElementById('btn-export-json').addEventListener('click', exportSession);

    document.getElementById('btn-open-import').addEventListener('click', () => {
      document.getElementById('import-json-textarea').value = '';
      document.getElementById('import-step-input').style.display = 'block';
      document.getElementById('import-step-result').style.display = 'none';
      openModal('import-modal');
    });

    document.getElementById('btn-process-import').addEventListener('click', processImport);

    document.getElementById('import-file-input').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        document.getElementById('import-json-textarea').value = evt.target.result;
      };
      reader.readAsText(file);
    });

    document.getElementById('btn-copy-sync-prompt').addEventListener('click', () => {
      const text = document.getElementById('import-sync-prompt').value;
      navigator.clipboard.writeText(text).then(() => {
        showToast("📋 Prompt de synchronisation copié !");
        closeModal('import-modal');
      });
    });

    document.getElementById('btn-confirm-val-prompt').addEventListener('click', () => confirmValidation(true));
    document.getElementById('btn-confirm-val-silent').addEventListener('click', () => confirmValidation(false));

    document.querySelectorAll('[data-close]').forEach(btn => {
      btn.addEventListener('click', (e) => closeModal(e.target.getAttribute('data-close')));
    });

    document.getElementById('btn-filter-reactivations').addEventListener('click', () => {
      if (QTHOUGHTS_DATA.pending_reactivations && QTHOUGHTS_DATA.pending_reactivations.length > 0) {
        window.highlightRelation(QTHOUGHTS_DATA.pending_reactivations[0]);
      }
    });
  }

  function init() {
    injectStyles();
    buildDOM();
    attachEvents();
    renderBoard();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();