/**
 * Moteur Q-Thoughts v5.7 (100% Français)
 *
 * Principes :
 * - Les données de QTHOUGHTS_DATA sont considérées comme non fiables.
 * - Aucun contenu provenant des données n'est injecté avec innerHTML.
 * - Les éléments DOM sont construits explicitement.
 * - La barre latérale peut être réduite à l'affichage des IDs.
 * - Le titre d'un sujet apparaît dans un tooltip flottant.
 * - Les IDs restent immuables et servent de repères historiques.
 */

(function () {
  'use strict';

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
       ENTÊTE SIDEBAR
       ========================================================= */

    .qt-barre-entete {
      min-height: 55px;

      padding: 14px 16px;

      border-bottom: 1px solid var(--bordure);

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
      font-size: 13px;
      font-weight: 600;

      letter-spacing: 0.03em;
      text-transform: uppercase;

      color: var(--texte-atténué);

      overflow: hidden;
      text-overflow: ellipsis;
    }

    .qt-compteur {
      background: rgba(251, 191, 36, 0.15);
      color: var(--orange);

      font-size: 12px;
      padding: 2px 8px;

      border-radius: 999px;

      font-weight: 600;

      flex-shrink: 0;
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

    .qt-barre-laterale.repliee .qt-barre-entete {
      padding: 14px 16px;
      justify-content: center;
    }

    .qt-barre-laterale.repliee .qt-barre-entete-contenu {
      display: none;
    }

    /* =========================================================
       LISTE
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

    /* =========================================================
       ELEMENT ACCORDEON
       ========================================================= */

    .qt-accordeon-element {
      background: var(--surface-2);

      border: 1px solid var(--bordure);
      border-radius: var(--rayon);

      margin-bottom: 10px;

      overflow: hidden;

      transition:
        border-color 0.2s ease,
        box-shadow 0.2s ease;
    }

    .qt-accordeon-element.ouvert {
      border-color: var(--accent);

      box-shadow:
        0 4px 12px rgba(0,0,0,0.25);
    }

    .qt-accordeon-entete {
      min-height: 44px;

      padding: 10px 12px;

      cursor: pointer;

      display: flex;
      align-items: center;

      gap: 10px;

      user-select: none;
    }

    .qt-accordeon-entete:hover {
      background: rgba(255,255,255,0.03);
    }

    /* =========================================================
       ID
       ========================================================= */

    .qt-accordeon-identifiant {
      font-family:
        ui-monospace,
        SFMono-Regular,
        Menlo,
        monospace;

      font-size: 11px;
      font-weight: 700;

      color: var(--orange);

      background:
        rgba(251, 191, 36, 0.12);

      padding: 3px 6px;

      border-radius: 4px;

      flex-shrink: 0;

      white-space: nowrap;
    }

    .qt-accordeon-titre {
      flex: 1;

      min-width: 0;

      font-size: 13.5px;
      font-weight: 500;

      line-height: 1.4;
    }

    .qt-accordeon-chevron {
      font-size: 10px;

      color: var(--texte-atténué);

      transition:
        transform 0.2s ease;

      flex-shrink: 0;
    }

    .qt-accordeon-element.ouvert
    .qt-accordeon-chevron {
      transform: rotate(90deg);
    }

    /* =========================================================
       CORPS
       ========================================================= */

    .qt-accordeon-corps {
      display: none;

      padding: 0 14px 14px;

      font-size: var(--police-petite);

      color: var(--texte-atténué);

      line-height: 1.6;

      border-top: 1px solid var(--bordure);
    }

    .qt-accordeon-element.ouvert
    .qt-accordeon-corps {
      display: block;
    }

    .qt-accordeon-corps p {
      margin-top: 10px;
    }

    /* =========================================================
       MODE REDUIT
       ========================================================= */

    .qt-barre-laterale.repliee
    .qt-accordeon-element {
      margin-bottom: 8px;

      border-radius: 7px;
    }

    .qt-barre-laterale.repliee
    .qt-accordeon-entete {
      min-height: 38px;
      height: 38px;

      padding: 5px;

      justify-content: center;
    }

    .qt-barre-laterale.repliee
    .qt-accordeon-identifiant {
      width: 100%;

      padding: 4px 3px;

      text-align: center;

      font-size: 10px;

      cursor: default;
    }

    .qt-barre-laterale.repliee
    .qt-accordeon-titre,

    .qt-barre-laterale.repliee
    .qt-accordeon-chevron,

    .qt-barre-laterale.repliee
    .qt-accordeon-corps {
      display: none;
    }

    /* =========================================================
       TOOLTIP FLOTTANT
       ========================================================= */

    .qt-tooltip {
      position: fixed;

      max-width: 320px;

      padding: 8px 11px;

      border:
        1px solid var(--bordure);

      border-radius: 7px;

      background: #20242c;
      color: var(--texte);

      font-family:
        'Inter',
        system-ui,
        -apple-system,
        sans-serif;

      font-size: 12px;

      line-height: 1.45;

      box-shadow:
        0 8px 24px rgba(0,0,0,0.35);

      pointer-events: none;

      opacity: 0;

      visibility: hidden;

      z-index: 10000;

      transition:
        opacity 0.12s ease,
        visibility 0.12s ease;
    }

    .qt-tooltip.visible {
      opacity: 1;
      visibility: visible;
    }

    /* =========================================================
       ZONE PRINCIPALE
       ========================================================= */

    .qt-principal {
      flex: 1;

      min-width: 0;

      display: flex;
      flex-direction: column;

      height: 100vh;

      overflow: hidden;
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
      background:
        rgba(108, 158, 255, 0.06);

      border-color:
        rgba(108, 158, 255, 0.18);
    }

    .qt-section-synthese h2 {
      color: var(--accent);
    }

    .qt-section-hypotheses {
      background:
        rgba(74, 222, 128, 0.06);

      border-color:
        rgba(74, 222, 128, 0.18);
    }

    .qt-section-hypotheses h2 {
      color: var(--vert);
    }

    .qt-section-abandonne {
      background:
        rgba(248, 113, 113, 0.06);

      border-color:
        rgba(248, 113, 113, 0.18);
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
      font-family:
        ui-monospace,
        SFMono-Regular,
        Menlo,
        monospace;

      font-size: 11.5px;

      padding: 2px 6px;

      border-radius: 4px;

      margin: 0 3px;

      white-space: nowrap;

      font-weight: 600;

      display: inline-block;

      vertical-align: middle;

      cursor: help;
    }

    .qt-tag-hyp {
      background:
        rgba(74, 222, 128, 0.15);

      color: var(--vert);
    }

    .qt-tag-dis {
      background:
        rgba(108, 158, 255, 0.15);

      color: var(--accent);
    }

    .qt-tag-ad {
      background:
        rgba(251, 191, 36, 0.15);

      color: var(--orange);
    }

    .qt-tag-ab {
      background:
        rgba(248, 113, 113, 0.15);

      color: var(--rouge);
    }

    /* =========================================================
       ELEMENTS
       ========================================================= */

    .qt-vide {
      color: var(--texte-atténué);

      font-size: var(--police-principale);

      font-style: italic;
    }

    .qt-cap {
      display: block;

      width: fit-content;
      max-width: 100%;

      background:
        var(--accent-doux);

      color: var(--accent);

      font-size: var(--police-petite);

      padding: 8px 14px;

      border-radius: 8px;

      margin-top: 14px;

      font-weight: 500;

      border:
        1px solid rgba(108, 158, 255, 0.25);

      line-height: 1.6;
    }
  `;

  /* ===========================================================
     OUTILS DE DONNÉES
     =========================================================== */

  function valeurTexte(valeur, valeurParDefaut) {
    if (
      typeof valeur === 'string' ||
      typeof valeur === 'number'
    ) {
      return String(valeur);
    }

    return valeurParDefaut || '';
  }

  function tableauSecurise(valeur) {
    return Array.isArray(valeur) ? valeur : [];
  }

  function objetSecurise(valeur) {
    if (
      valeur &&
      typeof valeur === 'object' &&
      !Array.isArray(valeur)
    ) {
      return valeur;
    }

    return {};
  }

  /* ===========================================================
     OUTILS DOM
     =========================================================== */

  function creerElement(tag, classe, texte) {
    const element = document.createElement(tag);

    if (classe) {
      element.className = classe;
    }

    if (texte !== undefined && texte !== null) {
      element.textContent = String(texte);
    }

    return element;
  }

  function ajouterTexteAvecEmphase(parent, texteAvant, texteEmphase, texteApres) {
    if (texteAvant) {
      parent.appendChild(
        document.createTextNode(texteAvant)
      );
    }

    if (texteEmphase) {
      const strong = document.createElement('strong');
      strong.textContent = texteEmphase;
      parent.appendChild(strong);
    }

    if (texteApres) {
      parent.appendChild(
        document.createTextNode(texteApres)
      );
    }
  }

  /* ===========================================================
     IDS / TAGS
     =========================================================== */

  function obtenirInfobulleTag(id) {
    const texte = valeurTexte(id, '');

    if (!texte) {
      return '';
    }

    const correspondance =
      texte.match(/^([a-zA-Z]+)(\\d+)$/);

    if (!correspondance) {
      return texte;
    }

    const prefixe =
      correspondance[1].toLowerCase();

    const numero =
      correspondance[2];

    if (prefixe === 'hyp') {
      return `Hypothèse ${numero}`;
    }

    if (prefixe === 'dis') {
      return `Point discuté ${numero}`;
    }

    if (prefixe === 'ad') {
      return `Point à discuter ${numero}`;
    }

    if (prefixe === 'ab') {
      return `Point abandonné ${numero}`;
    }

    return texte;
  }

  function genererTagDOM(id) {
    const texteId = valeurTexte(id, '');

    const tag =
      creerElement(
        'span',
        'qt-tag',
        texteId
      );

    const prefixe =
      texteId
        .replace(/[0-9]/g, '')
        .toLowerCase();

    if (prefixe === 'hyp') {
      tag.classList.add('qt-tag-hyp');
    }

    else if (prefixe === 'dis') {
      tag.classList.add('qt-tag-dis');
    }

    else if (prefixe === 'ad') {
      tag.classList.add('qt-tag-ad');
    }

    else if (prefixe === 'ab') {
      tag.classList.add('qt-tag-ab');
    }

    tag.title =
      obtenirInfobulleTag(texteId);

    return tag;
  }

  /* ===========================================================
     TOOLTIP FLOTTANT
     =========================================================== */

  let tooltip = null;

  function creerTooltip() {
    if (tooltip) {
      return tooltip;
    }

    tooltip =
      creerElement(
        'div',
        'qt-tooltip'
      );

    tooltip.setAttribute(
      'role',
      'tooltip'
    );

    document.body.appendChild(tooltip);

    return tooltip;
  }

  function afficherTooltip(cible, texte) {
    if (!cible || !texte) {
      return;
    }

    const tip = creerTooltip();

    tip.textContent = texte;

    tip.classList.add('visible');

    const rect =
      cible.getBoundingClientRect();

    const marge = 10;

    /*
     * Position initiale à droite de la cible.
     */
    let left =
      rect.right + marge;

    let top =
      rect.top + (rect.height / 2);

    tip.style.left = `${left}px`;
    tip.style.top = `${top}px`;

    /*
     * On mesure après insertion pour éviter
     * que le tooltip sorte de l'écran.
     */
    const tipRect =
      tip.getBoundingClientRect();

    if (
      left + tipRect.width >
      window.innerWidth - marge
    ) {
      left =
        rect.left -
        tipRect.width -
        marge;
    }

    top =
      rect.top +
      (rect.height / 2) -
      (tipRect.height / 2);

    if (
      top + tipRect.height >
      window.innerHeight - marge
    ) {
      top =
        window.innerHeight -
        tipRect.height -
        marge;
    }

    if (top < marge) {
      top = marge;
    }

    if (left < marge) {
      left = marge;
    }

    tip.style.left = `${left}px`;
    tip.style.top = `${top}px`;
  }

  function masquerTooltip() {
    if (!tooltip) {
      return;
    }

    tooltip.classList.remove('visible');
  }

  /* ===========================================================
     DISPOSITION
     =========================================================== */

  function injecterDisposition() {
    const elementStyle =
      document.createElement('style');

    elementStyle.textContent = styles;

    document.head.appendChild(elementStyle);

    document.body.replaceChildren();

    const barre =
      creerElement(
        'aside',
        'qt-barre-laterale'
      );

    barre.id =
      'qt-barre-laterale';

    const entete =
      creerElement(
        'div',
        'qt-barre-entete'
      );

    const enteteContenu =
      creerElement(
        'div',
        'qt-barre-entete-contenu'
      );

    const enteteTitre =
      creerElement(
        'span',
        'qt-barre-entete-titre',
        'Points à discuter'
      );

    const compteur =
      creerElement(
        'span',
        'qt-compteur',
        '0'
      );

    compteur.id =
      'qt-ad-compteur';

    enteteContenu.appendChild(
      enteteTitre
    );

    enteteContenu.appendChild(
      compteur
    );

    const bouton =
      creerElement(
        'button',
        'qt-bouton-repli',
        '‹'
      );

    bouton.id =
      'qt-bouton-repli';

    bouton.type =
      'button';

    bouton.setAttribute(
      'aria-label',
      'Réduire la barre latérale'
    );

    bouton.title =
      'Réduire la barre latérale';

    entete.appendChild(
      enteteContenu
    );

    entete.appendChild(
      bouton
    );

    const liste =
      creerElement(
        'div',
        'qt-accordeon-liste'
      );

    liste.id =
      'qt-accordeon-liste';

    barre.appendChild(entete);
    barre.appendChild(liste);

    /* =========================================================
       PRINCIPAL
       ========================================================= */

    const principal =
      creerElement(
        'main',
        'qt-principal'
      );

    const entetePrincipal =
      creerElement(
        'header',
        'qt-principal-entete'
      );

    const titreObjectif =
      creerElement(
        'h1',
        '',
        'Chargement…'
      );

    titreObjectif.id =
      'qt-objectif-titre';

    const description =
      creerElement(
        'p',
        'qt-description-objectif'
      );

    description.id =
      'qt-objectif-description';

    const cap =
      creerElement(
        'div',
        'qt-cap',
        '🚀 Cap actuel : Initialisation...'
      );

    cap.id =
      'qt-cap-actuel';

    entetePrincipal.appendChild(
      titreObjectif
    );

    entetePrincipal.appendChild(
      description
    );

    entetePrincipal.appendChild(
      cap
    );

    const contenu =
      creerElement(
        'div',
        'qt-contenu'
      );

    const synthese =
      creerElement(
        'div',
        'qt-synthese'
      );

    /* Synthèse */

    const sectionSynthese =
      creerElement(
        'div',
        'qt-section qt-section-synthese'
      );

    sectionSynthese.appendChild(
      creerElement(
        'h2',
        '',
        'Synthèse cognitive'
      )
    );

    const corpsSynthese =
      creerElement(
        'div',
        'qt-synthese-corps'
      );

    corpsSynthese.id =
      'qt-synthese-corps';

    sectionSynthese.appendChild(
      corpsSynthese
    );

    /* Hypothèses */

    const sectionHypotheses =
      creerElement(
        'div',
        'qt-section qt-section-hypotheses'
      );

    sectionHypotheses.appendChild(
      creerElement(
        'h2',
        '',
        'Hypothèses actives'
      )
    );

    const listeHypotheses =
      creerElement(
        'div'
      );

    listeHypotheses.id =
      'qt-hypotheses-liste';

    listeHypotheses.appendChild(
      creerElement(
        'p',
        'qt-vide',
        'Aucune hypothèse pour le moment.'
      )
    );

    sectionHypotheses.appendChild(
      listeHypotheses
    );

    /* Abandonnées */

    const sectionAbandonne =
      creerElement(
        'div',
        'qt-section qt-section-abandonne'
      );

    sectionAbandonne.appendChild(
      creerElement(
        'h2',
        '',
        'Pistes écartées & conditions de réactivation'
      )
    );

    const listeAbandonne =
      creerElement(
        'div'
      );

    listeAbandonne.id =
      'qt-abandonne-liste';

    listeAbandonne.appendChild(
      creerElement(
        'p',
        'qt-vide',
        'Aucun point abandonné pour le moment.'
      )
    );

    sectionAbandonne.appendChild(
      listeAbandonne
    );

    synthese.appendChild(
      sectionSynthese
    );

    synthese.appendChild(
      sectionHypotheses
    );

    synthese.appendChild(
      sectionAbandonne
    );

    contenu.appendChild(
      synthese
    );

    principal.appendChild(
      entetePrincipal
    );

    principal.appendChild(
      contenu
    );

    document.body.appendChild(barre);
    document.body.appendChild(principal);

    initialiserBoutonRepli();
  }

  /* ===========================================================
     BOUTON REPLI
     =========================================================== */

  function initialiserBoutonRepli() {
    const barre =
      document.getElementById(
        'qt-barre-laterale'
      );

    const bouton =
      document.getElementById(
        'qt-bouton-repli'
      );

    if (!barre || !bouton) {
      return;
    }

    bouton.addEventListener(
      'click',
      function () {

        const repliee =
          barre.classList.toggle(
            'repliee'
          );

        if (repliee) {

          bouton.textContent = '›';

          bouton.setAttribute(
            'aria-label',
            'Développer la barre latérale'
          );

          bouton.title =
            'Développer la barre latérale';

          masquerTooltip();

        } else {

          bouton.textContent = '‹';

          bouton.setAttribute(
            'aria-label',
            'Réduire la barre latérale'
          );

          bouton.title =
            'Réduire la barre latérale';
        }
      }
    );
  }

  /* ===========================================================
     SIDEBAR
     =========================================================== */

  function afficherBarreLaterale(donnees) {
    const liste =
      document.getElementById(
        'qt-accordeon-liste'
      );

    const compteur =
      document.getElementById(
        'qt-ad-compteur'
      );

    if (!liste || !compteur) {
      return;
    }

    const aDiscuter =
      tableauSecurise(
        donnees.aDiscuter
      );

    compteur.textContent =
      String(aDiscuter.length);

    liste.replaceChildren();

    aDiscuter.forEach(
      function (element, index) {

        const objet =
          objetSecurise(element);

        const id =
          valeurTexte(
            objet.id,
            `ad${index + 1}`
          );

        const titre =
          valeurTexte(
            objet.titre,
            'Sans titre'
          );

        const raison =
          valeurTexte(
            objet.raison,
            'Non précisé'
          );

        const consequence =
          valeurTexte(
            objet.consequence,
            'Non précisée'
          );

        const item =
          creerElement(
            'div',
            'qt-accordeon-element'
          );

        if (index === 0) {
          item.classList.add('ouvert');
        }

        /*
         * L'ID est conservé comme donnée textuelle.
         * Il n'est jamais utilisé comme HTML.
         */
        item.dataset.id = id;

        const entete =
          creerElement(
            'div',
            'qt-accordeon-entete'
          );

        const identifiant =
          creerElement(
            'span',
            'qt-accordeon-identifiant',
            id
          );

        identifiant.title =
          obtenirInfobulleTag(id);

        const titreElement =
          creerElement(
            'span',
            'qt-accordeon-titre',
            titre
          );

        const chevron =
          creerElement(
            'span',
            'qt-accordeon-chevron',
            '▶'
          );

        entete.appendChild(
          identifiant
        );

        entete.appendChild(
          titreElement
        );

        entete.appendChild(
          chevron
        );

        const corps =
          creerElement(
            'div',
            'qt-accordeon-corps'
          );

        const paragrapheRaison =
          document.createElement('p');

        const labelRaison =
          document.createElement('strong');

        labelRaison.textContent =
          'Pourquoi :';

        paragrapheRaison.appendChild(
          labelRaison
        );

        paragrapheRaison.appendChild(
          document.createTextNode(
            ` ${raison}`
          )
        );

        const paragrapheConsequence =
          document.createElement('p');

        const labelConsequence =
          document.createElement('strong');

        labelConsequence.textContent =
          'Conséquence :';

        paragrapheConsequence.appendChild(
          labelConsequence
        );

        paragrapheConsequence.appendChild(
          document.createTextNode(
            ` ${consequence}`
          )
        );

        corps.appendChild(
          paragrapheRaison
        );

        corps.appendChild(
          paragrapheConsequence
        );

        item.appendChild(
          entete
        );

        item.appendChild(
          corps
        );

        /* =====================================================
           ACCORDEON
           ===================================================== */

        entete.addEventListener(
          'click',
          function () {

            const barre =
              document.getElementById(
                'qt-barre-laterale'
              );

            /*
             * En mode réduit, le clic sur l'ID
             * n'ouvre pas visuellement l'accordéon.
             * On ne modifie donc pas l'état.
             */
            if (
              barre &&
              barre.classList.contains('repliee')
            ) {
              return;
            }

            item.classList.toggle(
              'ouvert'
            );
          }
        );

        /* =====================================================
           TOOLTIP EN MODE RÉDUIT
           ===================================================== */

        identifiant.addEventListener(
          'mouseenter',
          function () {

            const barre =
              document.getElementById(
                'qt-barre-laterale'
              );

            if (
              !barre ||
              !barre.classList.contains('repliee')
            ) {
              return;
            }

            afficherTooltip(
              identifiant,
              titre
            );
          }
        );

        identifiant.addEventListener(
          'mouseleave',
          masquerTooltip
        );

        liste.appendChild(
          item
        );
      }
    );
  }

  /* ===========================================================
     SYNTHÈSE
     =========================================================== */

  function afficherSynthese(donnees) {

    const objectif =
      objetSecurise(
        donnees.objectif
      );

    const titre =
      valeurTexte(
        objectif.titre,
        'Sans titre'
      );

    const description =
      valeurTexte(
        objectif.description,
        ''
      );

    const titreElement =
      document.getElementById(
        'qt-objectif-titre'
      );

    const descriptionElement =
      document.getElementById(
        'qt-objectif-description'
      );

    if (titreElement) {
      titreElement.textContent =
        titre;
    }

    if (descriptionElement) {
      descriptionElement.textContent =
        description;
    }

    /* =========================================================
       CAP
       ========================================================= */

    const resume =
      valeurTexte(
        donnees.resume,
        ''
      );

    const lignes =
      resume.split(/\n/);

    const ligneCap =
      lignes.find(
        function (ligne) {
          return ligne.includes(
            'CAP ACTUEL'
          );
        }
      ) ||
      '🚀 CAP ACTUEL : En attente...';

    const cap =
      document.getElementById(
        'qt-cap-actuel'
      );

    if (cap) {
      cap.textContent =
        ligneCap;
    }

    /* =========================================================
       SYNTHÈSE
       ========================================================= */

    const corps =
      document.getElementById(
        'qt-synthese-corps'
      );

    if (!corps) {
      return;
    }

    corps.replaceChildren();

    const discute =
      tableauSecurise(
        donnees.discute
      );

    if (discute.length === 0) {

      corps.appendChild(
        creerElement(
          'p',
          'qt-vide',
          'Initialisation de la réflexion en cours...'
        )
      );

    } else {

      const intro =
        document.createElement('p');

      const strong =
        document.createElement('strong');

      strong.textContent =
        'Points validés :';

      intro.appendChild(
        strong
      );

      corps.appendChild(
        intro
      );

      discute.forEach(
        function (element) {

          const objet =
            objetSecurise(element);

          const id =
            valeurTexte(
              objet.id,
              ''
            );

          const titre =
            valeurTexte(
              objet.titre,
              ''
            );

          const raison =
            valeurTexte(
              objet.raison,
              ''
            );

          const consequence =
            valeurTexte(
              objet.consequence,
              ''
            );

          const paragraphe =
            document.createElement('p');

          paragraphe.appendChild(
            document.createTextNode('• ')
          );

          paragraphe.appendChild(
            genererTagDOM(id)
          );

          paragraphe.appendChild(
            document.createTextNode(' ')
          );

          const titreFort =
            document.createElement('strong');

          titreFort.textContent =
            titre;

          paragraphe.appendChild(
            titreFort
          );

          paragraphe.appendChild(
            document.createTextNode(
              `. ${raison} `
            )
          );

          const label =
            document.createElement('em');

          label.textContent =
            'Conséquence :';

          paragraphe.appendChild(
            label
          );

          paragraphe.appendChild(
            document.createTextNode(
              ` ${consequence}`
            )
          );

          corps.appendChild(
            paragraphe
          );
        }
      );
    }

    /* =========================================================
       HYPOTHÈSES
       ========================================================= */

    const listeHyp =
      document.getElementById(
        'qt-hypotheses-liste'
      );

    if (!listeHyp) {
      return;
    }

    listeHyp.replaceChildren();

    const hypotheses =
      tableauSecurise(
        donnees.hypotheses
      );

    if (hypotheses.length === 0) {

      listeHyp.appendChild(
        creerElement(
          'p',
          'qt-vide',
          'Aucune hypothèse pour le moment.'
        )
      );

    } else {

      hypotheses.forEach(
        function (element) {

          const objet =
            objetSecurise(element);

          const paragraphe =
            document.createElement('p');

          const id =
            valeurTexte(
              objet.id,
              ''
            );

          const titre =
            valeurTexte(
              objet.titre,
              ''
            );

          const raison =
            valeurTexte(
              objet.raison,
              '—'
            );

          const consequence =
            valeurTexte(
              objet.consequence,
              '—'
            );

          paragraphe.appendChild(
            document.createTextNode('• ')
          );

          paragraphe.appendChild(
            genererTagDOM(id)
          );

          paragraphe.appendChild(
            document.createTextNode(' ')
          );

          const titreFort =
            document.createElement('strong');

          titreFort.textContent =
            titre;

          paragraphe.appendChild(
            titreFort
          );

          paragraphe.appendChild(
            document.createTextNode(
              `. ${raison} `
            )
          );

          const label =
            document.createElement('em');

          label.textContent =
            'Si faux :';

          paragraphe.appendChild(
            label
          );

          paragraphe.appendChild(
            document.createTextNode(
              ` ${consequence}`
            )
          );

          listeHyp.appendChild(
            paragraphe
          );
        }
      );
    }

    /* =========================================================
       PISTES ABANDONNÉES
       ========================================================= */

    const listeAbandonne =
      document.getElementById(
        'qt-abandonne-liste'
      );

    if (!listeAbandonne) {
      return;
    }

    listeAbandonne.replaceChildren();

    const abandonne =
      tableauSecurise(
        donnees.abandonne
      );

    if (abandonne.length === 0) {

      listeAbandonne.appendChild(
        creerElement(
          'p',
          'qt-vide',
          'Aucun point abandonné pour le moment.'
        )
      );

    } else {

      abandonne.forEach(
        function (element) {

          const objet =
            objetSecurise(element);

          const id =
            valeurTexte(
              objet.id,
              ''
            );

          const titre =
            valeurTexte(
              objet.titre,
              ''
            );

          const raison =
            valeurTexte(
              objet.raison,
              'Non précisé'
            );

          const condition =
            valeurTexte(
              objet.condition,
              '—'
            );

          const paragraphe =
            document.createElement('p');

          paragraphe.appendChild(
            document.createTextNode('• ')
          );

          paragraphe.appendChild(
            genererTagDOM(id)
          );

          paragraphe.appendChild(
            document.createTextNode(' ')
          );

          const titreFort =
            document.createElement('strong');

          titreFort.textContent =
            titre;

          paragraphe.appendChild(
            titreFort
          );

          paragraphe.appendChild(
            document.createTextNode(
              `. ${raison} `
            )
          );

          const label =
            document.createElement('em');

          label.textContent =
            'Réactivation :';

          paragraphe.appendChild(
            label
          );

          paragraphe.appendChild(
            document.createTextNode(
              ` ${condition}`
            )
          );

          listeAbandonne.appendChild(
            paragraphe
          );
        }
      );
    }
  }

  /* ===========================================================
     INITIALISATION
     =========================================================== */

  function initialiser() {

    const donnees =
      window.QTHOUGHTS_DATA;

    if (
      !donnees ||
      typeof donnees !== 'object' ||
      Array.isArray(donnees)
    ) {

      console.warn(
        'Q-Thoughts : QTHOUGHTS_DATA introuvable ou invalide.'
      );

      return;
    }

    try {

      injecterDisposition();

      afficherBarreLaterale(
        donnees
      );

      afficherSynthese(
        donnees
      );

    } catch (erreur) {

      /*
       * Une donnée mal formée ne doit pas
       * faire disparaître silencieusement
       * toute l'application.
       */

      console.error(
        'Q-Thoughts : erreur lors du rendu.',
        erreur
      );
    }
  }

  /* ===========================================================
     DÉMARRAGE
     =========================================================== */

  if (
    document.readyState === 'loading'
  ) {

    document.addEventListener(
      'DOMContentLoaded',
      initialiser,
      { once: true }
    );

  } else {

    initialiser();
  }

})();
