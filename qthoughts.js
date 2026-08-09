/**
 * Moteur Q-Thoughts v5.6 (100% Français)
 * Moteur de rendu autonome pour la mémoire latérale cognitive.
 *
 * Changements v5.6 :
 * - Barre latérale repliable
 * - Mode réduit : affichage des seuls identifiants
 * - Survol d'un identifiant : affichage du titre du sujet
 * - Bouton de bascule largeur normale / réduite
 * - Conservation du fonctionnement de l'accordéon
 *
 * Changements v5.3 :
 * - Les hypothèses sont sorties de la synthèse narrative et placées dans une section dédiée en bas
 * - Sections Synthèse / Hypothèses / Pistes écartées mieux différenciées visuellement
 * - Synthèse allégée : un seul tag par point + liste ; plus de liste des prochaines pistes
 * - Hypothèses et pistes écartées : même style de liste que les points validés
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
      --largeur-barre-reduite: 58px;
      --police-principale: 14px;
      --police-petite: 13px;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      background: var(--fond);
      color: var(--texte);
      line-height: 1.55;
      height: 100vh;
      display: flex;
      overflow: hidden;
    }

    /* =========================================================
       BARRE LATÉRALE
       ========================================================= */

    .qt-barre-laterale {
      width: var(--largeur-barre);
      min-width: var(--largeur-barre);
      background: var(--surface);
      border-right: 1px solid var(--bordure);
      display: flex;
      flex-direction: column;
      height: 100vh;
      transition:
        width 0.2s ease,
        min-width 0.2s ease;
      overflow: hidden;
      position: relative;
      z-index: 10;
    }

    .qt-barre-laterale.repliee {
      width: var(--largeur-barre-reduite);
      min-width: var(--largeur-barre-reduite);
    }

    /* =========================================================
       ENTÊTE
       ========================================================= */

    .qt-barre-entete {
      min-height: 55px;
      padding: 14px 16px;
      border-bottom: 1px solid var(--bordure);
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.03em;
      text-transform: uppercase;
      color: var(--texte-atténué);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      flex-shrink: 0;
    }

    .qt-barre-entete-contenu {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
      overflow: hidden;
      white-space: nowrap;
    }

    .qt-barre-entete-titre {
      overflow: hidden;
      text-overflow: ellipsis;
      transition: opacity 0.15s ease;
    }

    .qt-barre-entete .qt-compteur {
      background: rgba(251, 191, 36, 0.15);
      color: var(--orange);
      font-size: 12px;
      padding: 2px 8px;
      border-radius: 999px;
      font-weight: 600;
      flex-shrink: 0;
      transition: opacity 0.15s ease;
    }

    .qt-bouton-repli {
      width: 26px;
      height: 26px;
      border: 1px solid var(--bordure);
      border-radius: 6px;
      background: var(--surface-2);
      color: var(--texte-atténué);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      line-height: 1;
      flex-shrink: 0;
      transition:
        background 0.15s ease,
        color 0.15s ease;
    }

    .qt-bouton-repli:hover {
      background: rgba(255,255,255,0.07);
      color: var(--texte);
    }

    /* Mode réduit : on ne conserve visuellement que le bouton */
    .qt-barre-laterale.repliee .qt-barre-entete {
      padding: 14px 16px;
      justify-content: center;
    }

    .qt-barre-laterale.repliee .qt-barre-entete-contenu {
      display: none;
    }

    .qt-barre-laterale.repliee .qt-bouton-repli {
      transform: none;
    }

    /* =========================================================
       LISTE ACCORDÉON
       ========================================================= */

    .qt-accordeon-liste {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 12px;
    }

    .qt-barre-laterale.repliee .qt-accordeon-liste {
      padding: 10px 8px;
    }

    .qt-accordeon-element {
      background: var(--surface-2);
      border: 1px solid var(--bordure);
      border-radius: var(--rayon);
      margin-bottom: 10px;
      overflow: visible;
      transition:
        border-color 0.2s ease,
        box-shadow 0.2s ease,
        background 0.2s ease;
      position: relative;
    }

    .qt-accordeon-element.ouvert {
      border-color: var(--accent);
      box-shadow: 0 4px 12px rgba(0,0,0,0.25);
    }

    /* =========================================================
       ENTÊTE D'UN ÉLÉMENT
       ========================================================= */

    .qt-accordeon-entete {
      min-height: 44px;
      padding: 10px 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 10px;
      user-select: none;
      position: relative;
    }

    .qt-accordeon-entete:hover {
      background: rgba(255,255,255,0.03);
    }

    .qt-accordeon-identifiant {
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 11px;
      font-weight: 700;
      color: var(--orange);
      background: rgba(251, 191, 36, 0.12);
      padding: 3px 6px;
      border-radius: 4px;
      flex-shrink: 0;
      white-space: nowrap;
      cursor: pointer;
    }

    .qt-accordeon-titre {
      flex: 1;
      font-size: 13.5px;
      font-weight: 500;
      line-height: 1.4;
      min-width: 0;
    }

    .qt-accordeon-chevron {
      font-size: 10px;
      color: var(--texte-atténué);
      transition: transform 0.2s ease;
      flex-shrink: 0;
    }

    .qt-accordeon-element.ouvert .qt-accordeon-chevron {
      transform: rotate(90deg);
    }

    /* =========================================================
       CORPS ACCORDÉON
       ========================================================= */

    .qt-accordeon-corps {
      display: none;
      padding: 0 14px 14px 14px;
      font-size: var(--police-petite);
      color: var(--texte-atténué);
      line-height: 1.6;
      border-top: 1px solid var(--bordure);
    }

    .qt-accordeon-element.ouvert .qt-accordeon-corps {
      display: block;
    }

    .qt-accordeon-corps p {
      margin-top: 10px;
    }

    /* =========================================================
       MODE BARRE RÉDUITE
       ========================================================= */

    .qt-barre-laterale.repliee .qt-accordeon-element {
      margin-bottom: 8px;
      border-radius: 7px;
      overflow: visible;
    }

    .qt-barre-laterale.repliee .qt-accordeon-entete {
      min-height: 38px;
      height: 38px;
      padding: 5px;
      justify-content: center;
      gap: 0;
    }

    .qt-barre-laterale.repliee .qt-accordeon-identifiant {
      font-size: 10px;
      padding: 4px 3px;
      width: 100%;
      text-align: center;
    }

    .qt-barre-laterale.repliee .qt-accordeon-titre,
    .qt-barre-laterale.repliee .qt-accordeon-chevron,
    .qt-barre-laterale.repliee .qt-accordeon-corps {
      display: none;
    }

    /*
     * Infobulle personnalisée.
     * Elle contient le titre du sujet et apparaît au survol de l'ID.
     */
    .qt-barre-laterale.repliee
    .qt-accordeon-identifiant[data-tooltip]::after {
      content: attr(data-tooltip);
      position: absolute;
      left: calc(100% + 10px);
      top: 50%;
      transform: translateY(-50%);
      width: max-content;
      max-width: 280px;
      padding: 8px 11px;
      border-radius: 7px;
      border: 1px solid var(--bordure);
      background: #20242c;
      color: var(--texte);
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      font-size: 12px;
      font-weight: 400;
      line-height: 1.45;
      text-align: left;
      white-space: normal;
      box-shadow: 0 8px 24px rgba(0,0,0,0.35);
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
      z-index: 1000;
      transition:
        opacity 0.12s ease,
        visibility 0.12s ease;
    }

    .qt-barre-laterale.repliee
    .qt-accordeon-identifiant[data-tooltip]:hover::after {
      opacity: 1;
      visibility: visible;
    }

    /*
     * Petite flèche de l'infobulle.
     */
    .qt-barre-laterale.repliee
    .qt-accordeon-identifiant[data-tooltip]::before {
      content: '';
      position: absolute;
      left: calc(100% + 4px);
      top: 50%;
      width: 8px;
      height: 8px;
      background: #20242c;
      border-left: 1px solid var(--bordure);
      border-bottom: 1px solid var(--bordure);
      transform: translateY(-50%) rotate(45deg);
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
      z-index: 1001;
    }

    .qt-barre-laterale.repliee
    .qt-accordeon-identifiant[data-tooltip]:hover::before {
      opacity: 1;
      visibility: visible;
    }

    /* =========================================================
       ZONE PRINCIPALE
       ========================================================= */

    .qt-principal {
      flex: 1;
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
      min-width: 0;
    }

    .qt-principal-entete {
      padding: 10px 12px 8px;
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
      padding: 8px 10px 20px;
    }

    .qt-synthese {
      max-width: none;
      width: 100%;
    }

    /* =========================================================
       SECTIONS
       ========================================================= */

    .qt-section {
      border-radius: 8px;
      padding: 10px 12px;
      margin-bottom: 10px;
      border: 1px solid var(--bordure);
    }

    .qt-section h2 {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .qt-section-synthese {
      background: rgba(108, 158, 255, 0.06);
      border-color: rgba(108, 158, 255, 0.18);
    }

    .qt-section-synthese h2 {
      color: var(--accent);
    }

    .qt-section-hypotheses {
      background: rgba(74, 222, 128, 0.06);
      border-color: rgba(74, 222, 128, 0.18);
    }

    .qt-section-hypotheses h2 {
      color: var(--vert);
    }

    .qt-section-abandonne {
      background: rgba(248, 113, 113, 0.06);
      border-color: rgba(248, 113, 113, 0.18);
    }

    .qt-section-abandonne h2 {
      color: var(--rouge);
    }

    .qt-synthese-corps {
      font-size: var(--police-principale);
      line-height: 1.7;
      color: #d1d5db;
    }

    .qt-synthese-corps p {
      margin-bottom: 14px;
    }

    /* =========================================================
       TAGS
       ========================================================= */

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
      transition:
        opacity 0.15s ease,
        transform 0.15s ease;
    }

    .qt-tag:hover {
      opacity: 0.85;
      transform: translateY(-1px);
    }

    .qt-tag-hyp {
      background: rgba(74, 222, 128, 0.15);
      color: var(--vert);
    }

    .qt-tag-dis {
      background: rgba(108, 158, 255, 0.15);
      color: var(--accent);
    }

    .qt-tag-ad {
      background: rgba(251, 191, 36, 0.15);
      color: var(--orange);
    }

    .qt-tag-ab {
      background: rgba(248, 113, 113, 0.15);
      color: var(--rouge);
    }

    /* =========================================================
       CARTES
       ========================================================= */

    .qt-item-carte {
      background: rgba(0,0,0,0.18);
      border: 1px solid var(--bordure);
      border-radius: 8px;
      padding: 12px 14px;
      margin-bottom: 10px;
      font-size: var(--police-principale);
    }

    .qt-item-carte:last-child {
      margin-bottom: 0;
    }

    .qt-item-details {
      color: var(--texte-atténué);
      font-size: var(--police-petite);
      margin-top: 6px;
      line-height: 1.55;
    }

    .qt-vide {
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

  function echapperHTML(texte) {
    return String(texte || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function genererTagHTML(id) {
    if (!id) return '';

    const prefixe = id.replace(/[0-9]/g, '').toLowerCase();

    let classe = 'qt-tag';

    if (prefixe === 'hyp') classe += ' qt-tag-hyp';
    else if (prefixe === 'dis') classe += ' qt-tag-dis';
    else if (prefixe === 'ad') classe += ' qt-tag-ad';
    else if (prefixe === 'ab') classe += ' qt-tag-ab';

    return `<span class="${classe}" title="${echapperHTML(obtenirInfobulleTag(id))}">${echapperHTML(id)}</span>`;
  }

  function injecterDisposition() {
    const elementStyle = document.createElement('style');

    elementStyle.textContent = styles;

    document.head.appendChild(elementStyle);

    document.body.innerHTML = `
      <aside class="qt-barre-laterale" id="qt-barre-laterale">

        <div class="qt-barre-entete">

          <div class="qt-barre-entete-contenu">
            <span class="qt-barre-entete-titre">
              Points à discuter
            </span>

            <span
              class="qt-compteur"
              id="qt-ad-compteur"
            >
              0
            </span>
          </div>

          <button
            class="qt-bouton-repli"
            id="qt-bouton-repli"
            type="button"
            aria-label="Réduire la barre latérale"
            title="Réduire la barre latérale"
          >
            ‹
          </button>

        </div>

        <div
          class="qt-accordeon-liste"
          id="qt-accordeon-liste"
        ></div>

      </aside>

      <main class="qt-principal">

        <header class="qt-principal-entete">

          <h1 id="qt-objectif-titre">
            Chargement…
          </h1>

          <p
            class="qt-description-objectif"
            id="qt-objectif-description"
          ></p>

          <div
            class="qt-cap"
            id="qt-cap-actuel"
          >
            🚀 Cap actuel : Initialisation...
          </div>

        </header>

        <div class="qt-contenu">

          <div class="qt-synthese">

            <!-- SYNTHÈSE -->
            <div class="qt-section qt-section-synthese">

              <h2>
                Synthèse cognitive
              </h2>

              <div
                class="qt-synthese-corps"
                id="qt-synthese-corps"
              ></div>

            </div>

            <!-- HYPOTHÈSES -->
            <div class="qt-section qt-section-hypotheses">

              <h2>
                Hypothèses actives
              </h2>

              <div id="qt-hypotheses-liste">
                <p class="qt-vide">
                  Aucune hypothèse pour le moment.
                </p>
              </div>

            </div>

            <!-- PISTES ÉCARTÉES -->
            <div class="qt-section qt-section-abandonne">

              <h2>
                Pistes écartées & conditions de réactivation
              </h2>

              <div id="qt-abandonne-liste">
                <p class="qt-vide">
                  Aucun point abandonné pour le moment.
                </p>
              </div>

            </div>

          </div>

        </div>

      </main>
    `;

    initialiserBoutonRepli();
  }

  function initialiserBoutonRepli() {
    const barre = document.getElementById('qt-barre-laterale');
    const bouton = document.getElementById('qt-bouton-repli');

    if (!barre || !bouton) return;

    bouton.addEventListener('click', () => {

      const estRepliee = barre.classList.toggle('repliee');

      if (estRepliee) {

        bouton.textContent = '›';

        bouton.setAttribute(
          'aria-label',
          'Développer la barre latérale'
        );

        bouton.setAttribute(
          'title',
          'Développer la barre latérale'
        );

      } else {

        bouton.textContent = '‹';

        bouton.setAttribute(
          'aria-label',
          'Réduire la barre latérale'
        );

        bouton.setAttribute(
          'title',
          'Réduire la barre latérale'
        );
      }
    });
  }

  function afficherBarreLaterale(donnees) {
    const listeEl = document.getElementById('qt-accordeon-liste');
    const compteurEl = document.getElementById('qt-ad-compteur');

    const aDiscuter = donnees.aDiscuter || [];

    compteurEl.textContent = aDiscuter.length;

    listeEl.innerHTML = '';

    aDiscuter.forEach((element, index) => {

      const div = document.createElement('div');

      div.className =
        'qt-accordeon-element' +
        (index === 0 ? ' ouvert' : '');

      div.dataset.id = element.id;

      const titre = element.titre || '';
      const raison = element.raison || '';
      const consequence = element.consequence || '';

      const identifiant = echapperHTML(element.id);
      const titreHTML = echapperHTML(titre);
      const raisonHTML = echapperHTML(raison);
      const consequenceHTML = echapperHTML(consequence);

      div.innerHTML = `
        <div class="qt-accordeon-entete">

          <span
            class="qt-accordeon-identifiant"
            title="${echapperHTML(obtenirInfobulleTag(element.id))}"
            data-tooltip="${titreHTML}"
          >
            ${identifiant}
          </span>

          <span class="qt-accordeon-titre">
            ${titreHTML}
          </span>

          <span class="qt-accordeon-chevron">
            ▶
          </span>

        </div>

        <div class="qt-accordeon-corps">

          <p>
            <strong>Pourquoi :</strong>
            ${raisonHTML}
          </p>

          <p>
            <strong>Conséquence :</strong>
            ${consequenceHTML}
          </p>

        </div>
      `;

      const entete =
        div.querySelector('.qt-accordeon-entete');

      entete.addEventListener('click', () => {
        div.classList.toggle('ouvert');
      });

      listeEl.appendChild(div);
    });
  }

  function afficherSynthese(donnees) {

    // =========================================================
    // OBJECTIF
    // =========================================================

    document.getElementById('qt-objectif-titre').textContent =
      (donnees.objectif && donnees.objectif.titre) ||
      'Sans titre';

    document.getElementById('qt-objectif-description').textContent =
      (donnees.objectif && donnees.objectif.description) ||
      '';

    // =========================================================
    // CAP ACTUEL
    // =========================================================

    const resume = donnees.resume || '';

    const lignes = resume.split(/\n/);

    const ligneCap =
      lignes.find(l => l.includes('CAP ACTUEL')) ||
      '🚀 CAP ACTUEL : En attente...';

    document.getElementById('qt-cap-actuel').textContent =
      ligneCap;

    // =========================================================
    // SYNTHÈSE
    // =========================================================

    const corpsEl =
      document.getElementById('qt-synthese-corps');

    let html = '';

    const discute = donnees.discute || [];

    if (discute.length > 0) {

      html += `
        <p>
          <strong>Points validés :</strong>
        </p>
      `;

      discute.forEach(dis => {

        const titre = dis.titre || '';
        const raison = dis.raison || '';
        const consequence = dis.consequence || '';

        html += `
          <p>
            • ${genererTagHTML(dis.id)}
            <strong>${echapperHTML(titre)}</strong>.
            ${echapperHTML(raison)}
            <em>Conséquence :</em>
            ${echapperHTML(consequence)}
          </p>
        `;
      });
    }

    corpsEl.innerHTML =
      html ||
      '<p class="qt-vide">Initialisation de la réflexion en cours...</p>';

    // =========================================================
    // HYPOTHÈSES
    // =========================================================

    const listeHypEl =
      document.getElementById('qt-hypotheses-liste');

    const hypotheses =
      donnees.hypotheses || [];

    if (hypotheses.length === 0) {

      listeHypEl.innerHTML =
        '<p class="qt-vide">Aucune hypothèse pour le moment.</p>';

    } else {

      let htmlHyp = '';

      hypotheses.forEach(h => {

        const titre = h.titre || '';
        const raison = h.raison || '—';
        const consequence = h.consequence || '—';

        htmlHyp += `
          <p>
            • ${genererTagHTML(h.id)}
            <strong>${echapperHTML(titre)}</strong>.
            ${echapperHTML(raison)}
            <em>Si faux :</em>
            ${echapperHTML(consequence)}
          </p>
        `;
      });

      listeHypEl.innerHTML = htmlHyp;
    }

    // =========================================================
    // PISTES ÉCARTÉES
    // =========================================================

    const listeAbandonneesEl =
      document.getElementById('qt-abandonne-liste');

    const abandonne =
      donnees.abandonne || [];

    if (abandonne.length === 0) {

      listeAbandonneesEl.innerHTML =
        '<p class="qt-vide">Aucun point abandonné pour le moment.</p>';

    } else {

      let htmlAb = '';

      abandonne.forEach(p => {

        const titre = p.titre || '';
        const raison = p.raison || 'Non précisé';
        const condition = p.condition || '—';

        htmlAb += `
          <p>
            • ${genererTagHTML(p.id)}
            <strong>${echapperHTML(titre)}</strong>.
            ${echapperHTML(raison)}
            <em>Réactivation :</em>
            ${echapperHTML(condition)}
          </p>
        `;
      });

      listeAbandonneesEl.innerHTML = htmlAb;
    }
  }

  function initialiser() {

    const donnees =
      window.QTHOUGHTS_DATA;

    if (!donnees) {

      console.warn(
        'Q-Thoughts: window.QTHOUGHTS_DATA introuvable.'
      );

      return;
    }

    injecterDisposition();

    afficherBarreLaterale(donnees);

    afficherSynthese(donnees);
  }

  if (document.readyState === 'loading') {

    document.addEventListener(
      'DOMContentLoaded',
      initialiser
    );

  } else {

    initialiser();
  }

})();
