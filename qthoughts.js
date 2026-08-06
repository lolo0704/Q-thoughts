/**
 * Moteur Q-Thoughts v5.2 (100% Français)
 * Moteur de rendu autonome pour la mémoire latérale cognitive.
 */

(function () {
  const styles = `
    :root {
      --fond: #0f1115;
      --surface: #1a1d24;
      --surface-2: #242831;
      --bordure: #2e333d;
      --texte: #e6e8ec;
      --texte-atténué: #9ba1ad;
      --accent: #6c9eff;
      --accent-doux: rgba(108, 158, 255, 0.15);
      --vert: #4ade80;
      --orange: #fbbf24;
      --rouge: #f87171;
      --rayon: 10px;
      --largeur-barre: 320px;
      --police-principale: 14px;
      --police-petite: 13px;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      background: var(--fond);
      color: var(--texte);
      line-height: 1.55;
      height: 100vh;
      display: flex;
      overflow: hidden;
    }

    .qt-barre-laterale {
      width: var(--largeur-barre);
      min-width: var(--largeur-barre);
      background: var(--surface);
      border-right: 1px solid var(--bordure);
      display: flex;
      flex-direction: column;
      height: 100vh;
    }

    .qt-barre-entete {
      padding: 18px 20px 14px;
      border-bottom: 1px solid var(--bordure);
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.03em;
      text-transform: uppercase;
      color: var(--texte-atténué);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .qt-barre-entete .qt-compteur {
      background: rgba(251, 191, 36, 0.15);
      color: var(--orange);
      font-size: 12px;
      padding: 2px 8px;
      border-radius: 999px;
      font-weight: 600;
    }

    .qt-accordeon-liste {
      flex: 1;
      overflow-y: auto;
      padding: 12px;
    }

    .qt-accordeon-element {
      background: var(--surface-2);
      border: 1px solid var(--bordure);
      border-radius: var(--rayon);
      margin-bottom: 10px;
      overflow: hidden;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }

    .qt-accordeon-element.ouvert {
      border-color: var(--accent);
      box-shadow: 0 4px 12px rgba(0,0,0,0.25);
    }

    .qt-accordeon-entete {
      padding: 12px 14px;
      cursor: pointer;
      display: flex;
      align-items: flex-start;
      gap: 10px;
      user-select: none;
    }

    .qt-accordeon-entete:hover {
      background: rgba(255,255,255,0.03);
    }

    .qt-accordeon-identifiant {
      font-family: ui-monospace, monospace;
      font-size: 11.5px;
      color: var(--orange);
      background: rgba(251, 191, 36, 0.15);
      padding: 2px 6px;
      border-radius: 4px;
      flex-shrink: 0;
      margin-top: 1px;
    }

    .qt-accordeon-titre {
      font-size: var(--police-petite);
      font-weight: 500;
      color: var(--texte);
      flex: 1;
    }

    .qt-accordeon-chevron {
      color: var(--texte-atténué);
      font-size: 11px;
      transition: transform 0.2s;
      margin-top: 3px;
    }

    .qt-accordeon-element.ouvert .qt-accordeon-chevron {
      transform: rotate(90deg);
    }

    .qt-accordeon-corps {
      display: none;
      padding: 12px 14px 14px 14px;
      border-top: 1px solid var(--bordure);
      font-size: var(--police-petite);
      color: var(--texte-atténué);
      background: rgba(0,0,0,0.1);
    }

    .qt-accordeon-element.ouvert .qt-accordeon-corps {
      display: block;
    }

    .qt-accordeon-corps p {
      margin-top: 8px;
    }

    .qt-accordeon-corps strong {
      color: var(--texte);
      font-weight: 500;
    }

    .qt-lie-a {
      margin-top: 10px;
      font-size: 11.5px;
    }

    .qt-lie-a span {
      display: inline-block;
      background: var(--surface);
      border: 1px solid var(--bordure);
      padding: 1px 6px;
      border-radius: 4px;
      margin-right: 4px;
      font-family: ui-monospace, monospace;
      color: var(--texte-atténué);
      cursor: help;
    }

    .qt-principal {
      flex: 1;
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
    }

    .qt-principal-entete {
      padding: 20px 32px 16px;
      border-bottom: 1px solid var(--bordure);
      background: var(--surface);
    }

    .qt-principal-entete h1 {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 6px;
      color: var(--texte);
    }

    .qt-description-objectif {
      font-size: var(--police-principale);
      color: var(--texte-atténué);
      max-width: 800px;
      line-height: 1.6;
    }

    .qt-contenu {
      flex: 1;
      overflow-y: auto;
      padding: 24px 32px 48px;
    }

    .qt-synthese {
      max-width: 800px;
    }

    .qt-synthese h2 {
      font-size: 12px;
      font-weight: 600;
      color: var(--texte-atténué);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 16px;
    }

    .qt-synthese-corps {
      font-size: var(--police-principale);
      line-height: 1.7;
      color: #d1d5db;
    }

    .qt-synthese-corps p {
      margin-bottom: 16px;
      font-size: var(--police-principale);
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

    .qt-tag-hyp { background: rgba(74, 222, 128, 0.15); color: var(--vert); }
    .qt-tag-dis { background: rgba(108, 158, 255, 0.15); color: var(--accent); }
    .qt-tag-ad  { background: rgba(251, 191, 36, 0.15); color: var(--orange); }
    .qt-tag-ab  { background: rgba(248, 113, 113, 0.15); color: var(--rouge); }

    .qt-abandonne-section {
      margin-top: 36px;
      padding-top: 20px;
      border-top: 1px dashed var(--bordure);
    }

    .qt-abandonne-section h3 {
      font-size: 12px;
      font-weight: 600;
      color: var(--texte-atténué);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 14px;
    }

    .qt-abandonne-item {
      background: var(--surface);
      border: 1px solid var(--bordure);
      border-radius: var(--rayon);
      padding: 14px 16px;
      margin-bottom: 10px;
      font-size: var(--police-principale);
    }

    .qt-abandonne-details {
      color: var(--texte-atténué);
      font-size: var(--police-petite);
      margin-top: 6px;
      line-height: 1.6;
    }

    .qt-abandonne-vide {
      color: var(--texte-atténué);
      font-size: var(--police-principale);
      font-style: italic;
    }

    .qt-cap {
      display: block;
      width: fit-content;
      max-width: 100%;
      background: var(--accent-doux);
      color: var(--accent);
      font-size: var(--police-petite);
      padding: 8px 14px;
      border-radius: 8px;
      margin-top: 14px;
      font-weight: 500;
      border: 1px solid rgba(108, 158, 255, 0.25);
      line-height: 1.6;
    }
  `;

  function obtenirInfobulleTag(id) {
    if (!id) return '';
    const correspondance = id.match(/^([a-zA-Z]+)(\d+)$/);
    if (!correspondance) return id;

    const prefixe = correspondance[1].toLowerCase();
    const numero = correspondance[2];

    if (prefixe === 'hyp') return `Hypothèse ${numero}`;
    if (prefixe === 'dis') return `Point discuté ${numero}`;
    if (prefixe === 'ad') return `Point à discuter ${numero}`;
    if (prefixe === 'ab') return `Point abandonné ${numero}`;
    return id;
  }

  function genererTagHTML(id) {
    const correspondance = id.match(/^([a-zA-Z]+)(\d+)$/);
    const prefixe = correspondance ? correspondance[1].toLowerCase() : id;

    let classeCss = 'qt-tag-ad';
    if (prefixe === 'hyp') classeCss = 'qt-tag-hyp';
    else if (prefixe === 'dis') classeCss = 'qt-tag-dis';
    else if (prefixe === 'ab') classeCss = 'qt-tag-ab';

    const infobulle = obtenirInfobulleTag(id);
    return `<span class="qt-tag ${classeCss}" title="${infobulle}">[${id}]</span>`;
  }

  function analyserTexteFormate(texte) {
    if (!texte) return '';
    return texte.replace(/\[([a-zA-Z0-9]+)\]/g, (match, tagId) => genererTagHTML(tagId));
  }

  function injecterDisposition() {
    const elementStyle = document.createElement('style');
    elementStyle.textContent = styles;
    document.head.appendChild(elementStyle);

    document.body.innerHTML = `
      <aside class="qt-barre-laterale">
        <div class="qt-barre-entete">
          <span>Points à discuter</span>
          <span class="qt-compteur" id="qt-ad-compteur">0</span>
        </div>
        <div class="qt-accordeon-liste" id="qt-accordeon-liste"></div>
      </aside>

      <main class="qt-principal">
        <header class="qt-principal-entete">
          <h1 id="qt-objectif-titre">Chargement…</h1>
          <p class="qt-description-objectif" id="qt-objectif-description"></p>
          <div class="qt-cap" id="qt-cap-actuel">🚀 Cap actuel : Initialisation...</div>
        </header>

        <div class="qt-contenu">
          <div class="qt-synthese">
            <h2>Synthèse cognitive du raisonnement</h2>
            <div class="qt-synthese-corps" id="qt-synthese-corps"></div>

            <div class="qt-abandonne-section">
              <h3>Pistes écartées (Abandonnées) & Conditions de réactivation</h3>
              <div id="qt-abandonne-liste">
                <p class="qt-abandonne-vide">Aucun point abandonné pour le moment.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    `;
  }

  function afficherBarreLaterale(donnees) {
    const listeEl = document.getElementById('qt-accordeon-liste');
    const compteurEl = document.getElementById('qt-ad-compteur');
    
    const aDiscuter = donnees.aDiscuter || [];

    compteurEl.textContent = aDiscuter.length;
    listeEl.innerHTML = '';

    aDiscuter.forEach((element, index) => {
      const div = document.createElement('div');
      div.className = 'qt-accordeon-element' + (index === 0 ? ' ouvert' : '');
      div.dataset.id = element.id;

      const titre = element.titre || '';
      const raison = element.raison || '';
      const consequence = element.consequence || '';
      const lieA = element.lie_a || [];

      div.innerHTML = `
        <div class="qt-accordeon-entete">
          <span class="qt-accordeon-identifiant" title="${obtenirInfobulleTag(element.id)}">${element.id}</span>
          <span class="qt-accordeon-titre">${titre}</span>
          <span class="qt-accordeon-chevron">▶</span>
        </div>
        <div class="qt-accordeon-corps">
          <p><strong>Pourquoi :</strong> ${raison}</p>
          <p><strong>Conséquence :</strong> ${consequence}</p>
          ${lieA && lieA.length
            ? `<div class="qt-lie-a">Lié à : ${lieA.map(r => `<span title="${obtenirInfobulleTag(r)}">${r}</span>`).join('')}</div>`
            : ''}
        </div>
      `;

      div.querySelector('.qt-accordeon-entete').addEventListener('click', () => {
        document.querySelectorAll('.qt-accordeon-element').forEach(el => {
          if (el !== div) el.classList.remove('ouvert');
        });
        div.classList.toggle('ouvert');
      });

      listeEl.appendChild(div);
    });
  }

  function afficherSynthese(donnees) {
    const obj = donnees.objectif;
    if (obj) {
      document.getElementById('qt-objectif-titre').textContent = obj.titre || 'Sans titre';
      document.getElementById('qt-objectif-description').textContent = obj.description || '';
    }

    const resume = donnees.resume || '';
    const ligneCap = resume.split('\n').find(l => l.includes('CAP ACTUEL')) || '🚀 CAP ACTUEL : En attente...';
    document.getElementById('qt-cap-actuel').innerHTML = analyserTexteFormate(ligneCap);

    const corpsEl = document.getElementById('qt-synthese-corps');
    let html = '';

    const discute = donnees.discute || [];
    const hypotheses = donnees.hypotheses || [];
    const aDiscuter = donnees.aDiscuter || [];

    if (discute.length > 0) {
      discute.forEach(dis => {
        const titre = dis.titre || '';
        const raison = dis.raison || '';
        const consequence = dis.consequence || '';
        html += `<p>Nous avons validé ${genererTagHTML(dis.id)} <strong>${titre}</strong> ${genererTagHTML(dis.id)}. ${raison} <em>Conséquence :</em> ${consequence}</p>`;
      });
    }

    if (hypotheses.length > 0) {
      hypotheses.forEach(hyp => {
        const titre = hyp.titre || '';
        const raison = hyp.raison || '';
        html += `<p>Nous appuyons notre raisonnement sur ${genererTagHTML(hyp.id)} <strong>${titre}</strong> ${genererTagHTML(hyp.id)}. ${raison}</p>`;
      });
    }

    if (aDiscuter.length > 0) {
      html += `<p><strong>Prochaines pistes à explorer :</strong></p>`;
      aDiscuter.forEach(ad => {
        const titre = ad.titre || '';
        const raison = ad.raison || '';
        html += `<p>• ${genererTagHTML(ad.id)} <strong>${titre}</strong> ${genererTagHTML(ad.id)} : ${raison}</p>`;
      });
    }

    corpsEl.innerHTML = html || '<p>Initialisation de la réflexion en cours...</p>';

    const listeAbandonneesEl = document.getElementById('qt-abandonne-liste');
    const abandonne = donnees.abandonne || [];

    if (abandonne.length === 0) {
      listeAbandonneesEl.innerHTML = '<p class="qt-abandonne-vide">Aucun point abandonné pour le moment.</p>';
    } else {
      listeAbandonneesEl.innerHTML = abandonne.map(p => {
        const titre = p.titre || '';
        const raison = p.raison || 'Non précisé';
        const condition = p.condition || '—';
        return `
          <div class="qt-abandonne-item">
            <div>${genererTagHTML(p.id)} <strong>${titre}</strong> ${genererTagHTML(p.id)}</div>
            <div class="qt-abandonne-details">
              <strong>Pourquoi écarté :</strong> ${raison}<br>
              <strong>Condition de réactivation :</strong> ${condition}
            </div>
          </div>
        `;
      }).join('');
    }
  }

  function initialiser() {
    const donnees = window.QTHOUGHTS_DATA;
    if (!donnees) {
      console.warn('Q-Thoughts: window.QTHOUGHTS_DATA introuvable.');
      return;
    }

    injecterDisposition();
    afficherBarreLaterale(donnees);
    afficherSynthese(donnees);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialiser);
  } else {
    initialiser();
  }
})();
