/**
 * Q-Thoughts Engine - Renderer autonome v5.0
 * Moteur de rendu dynamique pour la mémoire latérale Q-Thoughts.
 */

(function () {
  // Styles CSS intégrés pour autonomie totale du CDN
  const styles = `
    :root {
      --bg: #0f1115;
      --surface: #1a1d24;
      --surface-2: #242831;
      --border: #2e333d;
      --text: #e6e8ec;
      --text-muted: #9ba1ad;
      --accent: #6c9eff;
      --accent-soft: rgba(108, 158, 255, 0.15);
      --green: #4ade80;
      --orange: #fbbf24;
      --red: #f87171;
      --radius: 10px;
      --sidebar-width: 320px;
      --font-main: 14px;
      --font-small: 13px;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.55;
      height: 100vh;
      display: flex;
      overflow: hidden;
    }

    .qt-sidebar {
      width: var(--sidebar-width);
      min-width: var(--sidebar-width);
      background: var(--surface);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      height: 100vh;
    }

    .qt-sidebar-header {
      padding: 18px 20px 14px;
      border-bottom: 1px solid var(--border);
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.03em;
      text-transform: uppercase;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .qt-sidebar-header .qt-count {
      background: rgba(251, 191, 36, 0.15);
      color: var(--orange);
      font-size: 12px;
      padding: 2px 8px;
      border-radius: 999px;
      font-weight: 600;
    }

    .qt-accordion-list {
      flex: 1;
      overflow-y: auto;
      padding: 12px;
    }

    .qt-accordion-item {
      background: var(--surface-2);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      margin-bottom: 10px;
      overflow: hidden;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }

    .qt-accordion-item.open {
      border-color: var(--accent);
      box-shadow: 0 4px 12px rgba(0,0,0,0.25);
    }

    .qt-accordion-header {
      padding: 12px 14px;
      cursor: pointer;
      display: flex;
      align-items: flex-start;
      gap: 10px;
      user-select: none;
    }

    .qt-accordion-header:hover {
      background: rgba(255,255,255,0.03);
    }

    .qt-accordion-id {
      font-family: ui-monospace, monospace;
      font-size: 11.5px;
      color: var(--orange);
      background: rgba(251, 191, 36, 0.15);
      padding: 2px 6px;
      border-radius: 4px;
      flex-shrink: 0;
      margin-top: 1px;
    }

    .qt-accordion-title {
      font-size: var(--font-small);
      font-weight: 500;
      color: var(--text);
      flex: 1;
    }

    .qt-accordion-chevron {
      color: var(--text-muted);
      font-size: 11px;
      transition: transform 0.2s;
      margin-top: 3px;
    }

    .qt-accordion-item.open .qt-accordion-chevron {
      transform: rotate(90deg);
    }

    .qt-accordion-body {
      display: none;
      padding: 12px 14px 14px 14px;
      border-top: 1px solid var(--border);
      font-size: var(--font-small);
      color: var(--text-muted);
      background: rgba(0,0,0,0.1);
    }

    .qt-accordion-item.open .qt-accordion-body {
      display: block;
    }

    .qt-accordion-body p {
      margin-top: 8px;
    }

    .qt-accordion-body strong {
      color: var(--text);
      font-weight: 500;
    }

    .qt-related {
      margin-top: 10px;
      font-size: 11.5px;
    }

    .qt-related span {
      display: inline-block;
      background: var(--surface);
      border: 1px solid var(--border);
      padding: 1px 6px;
      border-radius: 4px;
      margin-right: 4px;
      font-family: ui-monospace, monospace;
      color: var(--text-muted);
      cursor: help;
    }

    .qt-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
    }

    .qt-main-header {
      padding: 20px 32px 16px;
      border-bottom: 1px solid var(--border);
      background: var(--surface);
    }

    .qt-main-header h1 {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 6px;
      color: var(--text);
    }

    .qt-main-header .qt-objective-desc {
      font-size: var(--font-main);
      color: var(--text-muted);
      max-width: 800px;
      line-height: 1.6;
    }

    .qt-content {
      flex: 1;
      overflow-y: auto;
      padding: 24px 32px 48px;
    }

    .qt-synthesis {
      max-width: 800px;
    }

    .qt-synthesis h2 {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 16px;
    }

    .qt-synthesis-body {
      font-size: var(--font-main);
      line-height: 1.7;
      color: #d1d5db;
    }

    .qt-synthesis-body p {
      margin-bottom: 16px;
      font-size: var(--font-main);
    }

    .qt-tag {
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 11.5px;
      padding: 2px 6px;
      border-radius: 4px;
      margin: 0 3px;
      white-space: nowrap;
      font-weight: 600;
      display: inline-block;
      vertical-align: middle;
      cursor: help;
      transition: opacity 0.15s ease, transform 0.15s ease;
    }

    .qt-tag:hover {
      opacity: 0.85;
      transform: translateY(-1px);
    }

    .qt-tag-hyp { background: rgba(74, 222, 128, 0.15); color: var(--green); }
    .qt-tag-dis { background: rgba(108, 158, 255, 0.15); color: var(--accent); }
    .qt-tag-td, .qt-tag-ad  { background: rgba(251, 191, 36, 0.15); color: var(--orange); }
    .qt-tag-ab, .qt-tag-pr { background: rgba(248, 113, 113, 0.15); color: var(--red); }

    .qt-pruned-section {
      margin-top: 36px;
      padding-top: 20px;
      border-top: 1px dashed var(--border);
    }

    .qt-pruned-section h3 {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 14px;
    }

    .qt-pruned-item {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 14px 16px;
      margin-bottom: 10px;
      font-size: var(--font-main);
    }

    .qt-pruned-item .id {
      font-family: ui-monospace, monospace;
      color: var(--red);
      margin-right: 8px;
      font-weight: 600;
    }

    .qt-pruned-details {
      color: var(--text-muted);
      font-size: var(--font-small);
      margin-top: 6px;
      line-height: 1.6;
    }

    .qt-pruned-empty {
      color: var(--text-muted);
      font-size: var(--font-main);
      font-style: italic;
    }

    .qt-cap {
      display: block;
      width: fit-content;
      max-width: 100%;
      background: var(--accent-soft);
      color: var(--accent);
      font-size: var(--font-small);
      padding: 8px 14px;
      border-radius: 8px;
      margin-top: 14px;
      font-weight: 500;
      border: 1px solid rgba(108, 158, 255, 0.25);
      line-height: 1.6;
    }
  `;

  function getTagTooltip(id) {
    if (!id) return '';
    const match = id.match(/^([a-zA-Z]+)(\d+)$/);
    if (!match) return id;

    const prefix = match[1].toLowerCase();
    const num = match[2];

    if (prefix === 'hyp') return `Hypothèse ${num}`;
    if (prefix === 'dis') return `Point discuté ${num}`;
    if (prefix === 'ad' || prefix === 'td') return `Point à discuter ${num}`;
    if (prefix === 'ab' || prefix === 'pr') return `Point abandonné ${num}`;
    return id;
  }

  function renderTag(id) {
    const match = id.match(/^([a-zA-Z]+)(\d+)$/);
    const prefix = match ? match[1].toLowerCase() : id;

    let cls = 'qt-tag-ad';
    if (prefix === 'hyp') cls = 'qt-tag-hyp';
    else if (prefix === 'dis') cls = 'qt-tag-dis';
    else if (prefix === 'ab' || prefix === 'pr') cls = 'qt-tag-ab';

    const tooltip = getTagTooltip(id);
    return `<span class="qt-tag ${cls}" title="${tooltip}">[${id}]</span>`;
  }

  function parseFormattedText(text) {
    if (!text) return '';
    // Remplace les paires [tag] texte [tag] ou tags isolés [tag]
    return text.replace(/\[([a-zA-Z0-9]+)\]/g, (match, tagId) => renderTag(tagId));
  }

  function injectLayout() {
    const styleEl = document.createElement('style');
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);

    document.body.innerHTML = `
      <aside class="qt-sidebar">
        <div class="qt-sidebar-header">
          <span>Points à discuter</span>
          <span class="qt-count" id="qt-td-count">0</span>
        </div>
        <div class="qt-accordion-list" id="qt-accordion-list"></div>
      </aside>

      <main class="qt-main">
        <header class="qt-main-header">
          <h1 id="qt-obj-title">Chargement…</h1>
          <p class="qt-objective-desc" id="qt-obj-desc"></p>
          <div class="qt-cap" id="qt-cap-actuel">🚀 Cap actuel : Initialisation...</div>
        </header>

        <div class="qt-content">
          <div class="qt-synthesis">
            <h2>Synthèse cognitive du raisonnement</h2>
            <div class="qt-synthesis-body" id="qt-synthesis-body"></div>

            <div class="qt-pruned-section">
              <h3>Pistes écartées (Abandonnées) & Conditions de réactivation</h3>
              <div id="qt-pruned-list">
                <p class="qt-pruned-empty">Aucun point abandonné pour le moment.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    `;
  }

  function renderSidebar(data) {
    const list = document.getElementById('qt-accordion-list');
    const countEl = document.getElementById('qt-td-count');
    const toDiscuss = data.toDiscuss || [];

    countEl.textContent = toDiscuss.length;
    list.innerHTML = '';

    toDiscuss.forEach((item, index) => {
      const div = document.createElement('div');
      div.className = 'qt-accordion-item' + (index === 0 ? ' open' : '');
      div.dataset.id = item.id;

      div.innerHTML = `
        <div class="qt-accordion-header">
          <span class="qt-accordion-id" title="${getTagTooltip(item.id)}">${item.id}</span>
          <span class="qt-accordion-title">${item.title}</span>
          <span class="qt-accordion-chevron">▶</span>
        </div>
        <div class="qt-accordion-body">
          <p><strong>Pourquoi :</strong> ${item.reason || ''}</p>
          <p><strong>Conséquence :</strong> ${item.consequence || ''}</p>
          ${item.related_to && item.related_to.length
            ? `<div class="qt-related">Lié à : ${item.related_to.map(r => `<span title="${getTagTooltip(r)}">${r}</span>`).join('')}</div>`
            : ''}
        </div>
      `;

      div.querySelector('.qt-accordion-header').addEventListener('click', () => {
        document.querySelectorAll('.qt-accordion-item').forEach(el => {
          if (el !== div) el.classList.remove('open');
        });
        div.classList.toggle('open');
      });

      list.appendChild(div);
    });
  }

  function renderSynthesis(data) {
    if (data.objective) {
      document.getElementById('qt-obj-title').textContent = data.objective.title || 'Sans titre';
      document.getElementById('qt-obj-desc').textContent = data.objective.description || '';
    }

    // Gestion du cap actuel
    const summary = data.summary || '';
    const capLine = summary.split('\n').find(l => l.includes('CAP ACTUEL')) || '🚀 CAP ACTUEL : En attente...';
    document.getElementById('qt-cap-actuel').innerHTML = parseFormattedText(capLine);

    // Render de la synthèse
    const body = document.getElementById('qt-synthesis-body');
    let html = '';

    // Construction narrative basée sur les éléments validés et les hypothèses
    if (data.discussed && data.discussed.length > 0) {
      data.discussed.forEach(dis => {
        html += `<p>Nous avons validé ${renderTag(dis.id)} <strong>${dis.title}</strong> ${renderTag(dis.id)}. ${dis.reason || ''} <em>Conséquence :</em> ${dis.consequence || ''}</p>`;
      });
    }

    if (data.hypotheses && data.hypotheses.length > 0) {
      data.hypotheses.forEach(hyp => {
        html += `<p>Nous appuyons notre raisonnement sur ${renderTag(hyp.id)} <strong>${hyp.title}</strong> ${renderTag(hyp.id)}. ${hyp.reason || ''}</p>`;
      });
    }

    if (data.toDiscuss && data.toDiscuss.length > 0) {
      html += `<p><strong>Prochaines pistes à explorer :</strong></p>`;
      data.toDiscuss.forEach(td => {
        html += `<p>• ${renderTag(td.id)} <strong>${td.title}</strong> ${renderTag(td.id)} : ${td.reason || ''}</p>`;
      });
    }

    body.innerHTML = html || '<p>Initialisation de la réflexion en cours...</p>';

    // Section des pistes abandonnées
    const prunedList = document.getElementById('qt-pruned-list');
    const pruned = data.pruned || [];

    if (pruned.length === 0) {
      prunedList.innerHTML = '<p class="qt-pruned-empty">Aucun point abandonné pour le moment.</p>';
    } else {
      prunedList.innerHTML = pruned.map(p => `
        <div class="qt-pruned-item">
          <div>${renderTag(p.id)} <strong>${p.title}</strong> ${renderTag(p.id)}</div>
          <div class="qt-pruned-details">
            <strong>Pourquoi écarté :</strong> ${p.reason || 'Non précisé'}<br>
            <strong>Condition de réactivation :</strong> ${p.condition || '—'}
          </div>
        </div>
      `).join('');
    }
  }

  function init() {
    const data = window.QTHOUGHTS_DATA;
    if (!data) {
      console.warn('Q-Thoughts: window.QTHOUGHTS_DATA introuvable.');
      return;
    }

    injectLayout();
    renderSidebar(data);
    renderSynthesis(data);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
