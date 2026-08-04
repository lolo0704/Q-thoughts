/**
 * Q-Thoughts Engine v3.5 (Pure Observer Mode & Gemini AI Co-Pilot)
 * Dépôt GitHub : https://github.com/lolo0704/Q-thoughts
 * CDN : https://cdn.jsdelivr.net/gh/lolo0704/Q-thoughts@main/qthoughts.js
 */

(function () {
  'use strict';

  // Sécurisation HTML pour prévenir l'injection XSS (PR-7)
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

  // Re-tentative avec backoff exponentiel pour les API Gemini
  async function fetchGeminiWithBackoff(url, options, maxRetries = 3) {
    let delay = 1000;
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetch(url, options);
        if (response.ok) return response;
        if (response.status === 429 || response.status >= 500) {
          await new Promise(r => setTimeout(r, delay));
          delay *= 2;
          continue;
        }
        const errText = await response.text();
        throw new Error(`API error (${response.status}): ${errText}`);
      } catch (err) {
        if (i === maxRetries - 1) throw err;
        await new Promise(r => setTimeout(r, delay));
        delay *= 2;
      }
    }
  }

  // Conversion PCM16 vers WAV pour le TTS Gemini
  function pcmToWav(pcmInt16Array, sampleRate = 24000) {
    const numChannels = 1;
    const bytesPerSample = 2;
    const blockAlign = numChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = pcmInt16Array.length * bytesPerSample;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    function writeString(offset, string) {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    }

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, dataSize, true);

    let offset = 44;
    for (let i = 0; i < pcmInt16Array.length; i++, offset += 2) {
      view.setInt16(offset, pcmInt16Array[i], true);
    }
    return new Blob([buffer], { type: 'audio/wav' });
  }

  function base64ToArrayBuffer(base64) {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
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
      --accent-gemini: #ec4899;
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
      flex-wrap: wrap;
      align-items: center;
    }

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

    .action-btn-gemini {
      background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
      border: 1px solid #f472b6;
      color: #ffffff;
      padding: 0.4rem 0.75rem;
      font-size: 0.775rem;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 0 12px rgba(236, 72, 153, 0.3);
      white-space: nowrap;
    }

    .action-btn-gemini:hover {
      transform: translateY(-1px);
      box-shadow: 0 0 18px rgba(236, 72, 153, 0.5);
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

    .toggle-btn.active {
      background-color: #0284c7;
      color: #ffffff;
    }

    .objective-banner {
      background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%);
      border: 1px solid rgba(99, 102, 241, 0.4);
      border-radius: 12px;
      padding: 1rem 1.25rem;
      margin-bottom: 1.25rem;
    }

    .objective-info h2 {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--accent-objective);
      margin-bottom: 0.25rem;
    }

    .objective-desc {
      font-size: 0.85rem;
      color: var(--text-main);
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

    .card.highlighted {
      border-color: #38bdf8 !important;
      box-shadow: 0 0 12px rgba(56, 189, 248, 0.4);
    }

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
      position: fixed;
      inset: 0;
      background-color: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(5px);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-overlay.active { display: flex; }

    .modal-card {
      background-color: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 1.5rem;
      max-width: 600px;
      width: 92%;
      max-height: 90vh;
      overflow-y: auto;
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
      margin-bottom: 1rem;
    }

    .modal-title { font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem; }
    .modal-desc { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.25rem; }
    .modal-buttons { display: flex; flex-direction: column; gap: 0.5rem; }

    .modal-btn {
      padding: 0.6rem 1rem;
      border-radius: 6px;
      border: 1px solid var(--card-border);
      font-size: 0.825rem;
      font-weight: 600;
      cursor: pointer;
      text-align: center;
      transition: all 0.2s ease;
    }

    .modal-btn-primary { background-color: #0284c7; color: #fff; border-color: #0369a1; }
    .modal-btn-gemini { background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); color: #fff; border: none; }
    .modal-btn-cancel { background: transparent; border-color: transparent; color: var(--text-muted); }

    .spinner {
      border: 3px solid rgba(255, 255, 255, 0.1);
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border-left-color: #ec4899;
      animation: spin 1s linear infinite;
      display: inline-block;
    }

    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

    .toast {
      position: fixed;
      bottom: 1.5rem;
      right: 1.5rem;
      background-color: #22c55e;
      color: #000;
      font-weight: 600;
      padding: 0.75rem 1.25rem;
      border-radius: 8px;
      display: none;
      z-index: 1100;
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
          <p class="subtitle">Mémoire latérale du raisonnement & Intelligence Gemini</p>
        </div>
        <div class="toolbar-actions">
          <button class="action-btn-gemini" id="btn-open-gemini">✨ Gemini Co-Pilot</button>
          <button class="action-btn-gemini" id="btn-open-chat" style="background: linear-gradient(135deg, #0284c7 0%, #6366f1 100%); box-shadow: 0 0 12px rgba(99, 102, 241, 0.3);">💬 Chat Direct IA</button>
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
          <h2 id="obj-title">🎯 Objectif : Cadrage de Q-Thoughts</h2>
          <p class="objective-desc" id="obj-desc"></p>
        </div>
      </div>

      <div id="reactivation-alert" class="reactivation-alert-banner" style="display: none;">
        <span>⚠️ <strong>Réactivation potentielle :</strong> <span id="reactivation-count">0</span> piste(s) pertinente(s).</span>
        <button class="reactivation-btn" id="btn-filter-reactivations">Examiner la piste</button>
      </div>

      <main class="board" id="app"></main>

      <!-- Modale Gemini Co-Pilot -->
      <div id="gemini-modal" class="modal-overlay">
        <div class="modal-card" style="max-width: 680px;">
          <h3 class="modal-title" style="color: #f472b6;">✨ Co-Pilote Cognitif Gemini</h3>
          <p class="modal-desc">Fonctionnalités IA avancées exécutées directement sur la mémoire de travail :</p>
          
          <div style="display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.25rem;">
            
            <!-- Action 1: Transcription -->
            <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid var(--card-border); padding: 1rem; border-radius: 8px;">
              <h4 style="font-size: 0.875rem; font-weight: 700; color: #38bdf8; margin-bottom: 0.4rem;">1. 📝 Analyser une transcription / note brute</h4>
              <p style="font-size: 0.775rem; color: var(--text-muted); margin-bottom: 0.5rem;">Collez du texte pour que Gemini 3 Flash structure automatiquement les hypothèses et arbitrages.</p>
              <textarea id="gemini-transcript-input" class="modal-textarea" style="height: 70px;" placeholder="Collez votre extrait de conversation ou vos notes ici..."></textarea>
              <button class="modal-btn modal-btn-gemini" id="btn-gemini-parse-transcript" style="width: 100%;">⚡ Structurer avec Gemini 3 Flash</button>
            </div>

            <!-- Action 2: Audit d'angles morts -->
            <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid var(--card-border); padding: 1rem; border-radius: 8px;">
              <h4 style="font-size: 0.875rem; font-weight: 700; color: #f59e0b; margin-bottom: 0.4rem;">2. 🔍 Audit des Biais Cognitifs & Angles Morts</h4>
              <p style="font-size: 0.775rem; color: var(--text-muted); margin-bottom: 0.5rem;">Gemini analyse vos hypothèses pour déceler les risques non identifiés.</p>
              <button class="modal-btn modal-btn-primary" id="btn-gemini-audit" style="width: 100%; background: #d97706; border-color: #f59e0b;">🔎 Lancer l'Audit d'Angles Morts</button>
            </div>

            <!-- Action 3: Recherche Web Ancrée -->
            <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid var(--card-border); padding: 1rem; border-radius: 8px;">
              <h4 style="font-size: 0.875rem; font-weight: 700; color: #38bdf8; margin-bottom: 0.4rem;">3. 🌐 Recherche Web Ancrée (Google Search Grounding)</h4>
              <p style="font-size: 0.775rem; color: var(--text-muted); margin-bottom: 0.5rem;">Interrogez le web en temps réel pour nourrir votre réflexion.</p>
              <div style="display: flex; gap: 0.5rem;">
                <input type="text" id="gemini-search-query" style="flex: 1; background: #0b0f19; border: 1px solid var(--card-border); color: #fff; padding: 0.5rem; border-radius: 6px; font-size: 0.775rem;" placeholder="Sujet à rechercher sur le web...">
                <button class="modal-btn modal-btn-primary" id="btn-gemini-web-search">🌐 Rechercher</button>
              </div>
              <div id="gemini-search-sources" style="font-size: 0.725rem; color: #94a3b8; margin-top: 0.5rem; display: none;"></div>
            </div>

            <!-- Action 4: Vision Multimodale -->
            <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid var(--card-border); padding: 1rem; border-radius: 8px;">
              <h4 style="font-size: 0.875rem; font-weight: 700; color: #ec4899; margin-bottom: 0.4rem;">4. 📷 Analyse Multimodale (Photo / Tableau Blanc)</h4>
              <p style="font-size: 0.775rem; color: var(--text-muted); margin-bottom: 0.5rem;">Importez la photo d'un tableau blanc ou d'un schéma manuscrit.</p>
              <input type="file" id="gemini-image-input" accept="image/*" style="font-size: 0.775rem; color: var(--text-muted); margin-bottom: 0.5rem;">
              <button class="modal-btn modal-btn-gemini" id="btn-gemini-analyze-image" style="width: 100%;">👁️ Extraire les cartes depuis l'image</button>
            </div>

            <!-- Action 5: Synthèse vocale TTS -->
            <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid var(--card-border); padding: 1rem; border-radius: 8px;">
              <h4 style="font-size: 0.875rem; font-weight: 700; color: #22c55e; margin-bottom: 0.4rem;">5. 🎙️ Briefing Audio Stratégique (TTS Gemini)</h4>
              <p style="font-size: 0.775rem; color: var(--text-muted); margin-bottom: 0.5rem;">Écoutez un résumé vocal dynamique généré par Gemini TTS.</p>
              <div style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem;">
                <select id="gemini-voice-select" style="background: #0b0f19; border: 1px solid var(--card-border); color: #fff; padding: 0.35rem; border-radius: 6px; font-size: 0.775rem; flex: 1;">
                  <option value="Aoede">Voix : Aoede (Breezy)</option>
                  <option value="Puck">Voix : Puck (Upbeat)</option>
                  <option value="Zephyr">Voix : Zephyr (Bright)</option>
                  <option value="Kore">Voix : Kore (Firm)</option>
                  <option value="Fenrir">Voix : Fenrir (Excitable)</option>
                </select>
                <button class="modal-btn modal-btn-primary" id="btn-gemini-tts">🎧 Générer l'audio</button>
              </div>
              <audio id="gemini-audio-player" controls style="width: 100%; display: none; margin-top: 0.5rem; height: 36px;"></audio>
            </div>

            <!-- Action 6: Schéma visuel Imagen 4 -->
            <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid var(--card-border); padding: 1rem; border-radius: 8px;">
              <h4 style="font-size: 0.875rem; font-weight: 700; color: #a855f7; margin-bottom: 0.4rem;">6. 🎨 Cartographie Visuelle (Imagen 4.0)</h4>
              <p style="font-size: 0.775rem; color: var(--text-muted); margin-bottom: 0.5rem;">Générez une infographie visuelle résumant l'état de la session.</p>
              <button class="modal-btn modal-btn-gemini" id="btn-gemini-generate-image" style="width: 100%;">🖼️ Générer le schéma visuel</button>
              <div id="gemini-image-container" style="margin-top: 0.75rem; text-align: center; display: none;">
                <img id="gemini-generated-image" style="max-width: 100%; border-radius: 8px; border: 1px solid var(--card-border);" alt="Carte visuelle" />
              </div>
            </div>

          </div>

          <div id="gemini-loading" style="display: none; text-align: center; padding: 1rem; color: #f472b6; font-weight: 600;">
            <span class="spinner"></span> <span id="gemini-loading-text">Traitement par les API Gemini...</span>
          </div>

          <div class="modal-buttons">
            <button class="modal-btn modal-btn-cancel" data-close="gemini-modal">Fermer</button>
          </div>
        </div>
      </div>

      <!-- Chat In-App Gemini Direct -->
      <div id="chat-modal" class="modal-overlay">
        <div class="modal-card" style="max-width: 650px; height: 85vh; display: flex; flex-direction: column;">
          <h3 class="modal-title" style="color: #38bdf8;">💬 Discussion Directe avec Gemini Co-Pilot</h3>
          <p class="modal-desc" style="margin-bottom: 0.5rem;">Vos instructions mettent à jour dynamiquement la mémoire Q-Thoughts :</p>
          
          <div id="chat-messages" style="flex: 1; overflow-y: auto; background: rgba(11, 15, 25, 0.9); border: 1px solid var(--card-border); border-radius: 8px; padding: 0.75rem; margin-bottom: 0.75rem; font-size: 0.8rem; display: flex; flex-direction: column; gap: 0.5rem;">
            <div style="background: #1e293b; padding: 0.5rem 0.75rem; border-radius: 6px; color: #94a3b8;">
              🤖 <strong>Gemini :</strong> Bonjour ! Je suis connecté à votre mémoire Q-Thoughts.
            </div>
          </div>

          <div style="display: flex; gap: 0.5rem;">
            <input type="text" id="chat-user-input" style="flex: 1; background: #0b0f19; border: 1px solid var(--card-border); color: #fff; padding: 0.6rem; border-radius: 6px; font-size: 0.8rem;" placeholder="Discuter ou donner une instruction à Gemini..." />
            <button class="modal-btn modal-btn-primary" id="btn-send-chat">Envoyer</button>
          </div>
          
          <div style="margin-top: 0.75rem; text-align: right;">
            <button class="modal-btn modal-btn-cancel" data-close="chat-modal">Fermer</button>
          </div>
        </div>
      </div>

      <!-- Modale Synthèse -->
      <div id="summary-modal" class="modal-overlay">
        <div class="modal-card">
          <h3 class="modal-title">📝 Synthèse stratégique de la session</h3>
          <p class="modal-desc">Vue d'ensemble haute-altitude :</p>
          <div id="summary-content" style="white-space: pre-line; color: var(--text-main); background: rgba(11, 15, 25, 0.9); padding: 0.85rem; border-radius: 6px; font-size: 0.8rem; margin-bottom: 1rem; border: 1px solid var(--card-border); max-height: 280px; overflow-y: auto;"></div>
          <div class="modal-buttons">
            <button class="modal-btn modal-btn-primary" id="btn-copy-summary">📋 Copier la synthèse</button>
            <button class="modal-btn modal-btn-cancel" data-close="summary-modal">Fermer</button>
          </div>
        </div>
      </div>

      <!-- Modale Import -->
      <div id="import-modal" class="modal-overlay">
        <div class="modal-card">
          <h3 class="modal-title">📥 Importer une mémoire Q-Thoughts</h3>
          <p class="modal-desc">Collez un JSON d'exportation pour restaurer l'état exact :</p>

          <div id="import-step-input">
            <textarea id="import-json-textarea" class="modal-textarea" placeholder="Collez le contenu JSON ici..."></textarea>
            <div style="margin-bottom: 1rem;">
              <label style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 0.35rem;">Ou charger un fichier .json :</label>
              <input type="file" id="import-file-input" accept=".json" style="font-size: 0.8rem; color: var(--text-muted);">
            </div>
            <div class="modal-buttons">
              <button class="modal-btn modal-btn-primary" id="btn-process-import">⚡ Restaurer la mémoire vive</button>
              <button class="modal-btn modal-btn-cancel" data-close="import-modal">Annuler</button>
            </div>
          </div>

          <div id="import-step-result" style="display: none;">
            <p class="modal-desc" style="color: var(--accent-discussed);">✓ Mémoire chargée avec succès ! Copiez le prompt de réalignement ci-dessous :</p>
            <textarea id="import-sync-prompt" class="modal-textarea" readonly></textarea>
            <div class="modal-buttons">
              <button class="modal-btn modal-btn-primary" id="btn-copy-sync-prompt">📋 Copier le prompt de synchro</button>
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

  async function runGeminiParseTranscript(transcript) {
    const loader = document.getElementById('gemini-loading');
    const loaderText = document.getElementById('gemini-loading-text');
    loaderText.textContent = 'Analyse de la transcription par Gemini 3 Flash...';
    loader.style.display = 'block';

    try {
      const apiKey = "";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

      const systemPrompt = `Tu es le moteur cognitif Q-Thoughts. Analyse le texte fourni et met à jour la mémoire latérale au format JSON exact. Conserve les identifiants existants si pertinents.`;
      const promptText = `Voici l'état actuel de Q-Thoughts :\n${JSON.stringify(QTHOUGHTS_DATA, null, 2)}\n\nVoici le nouveau texte/notes à incorporer :\n${transcript}`;

      const payload = {
        contents: [{ parts: [{ text: promptText }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: { responseMimeType: "application/json" }
      };

      const res = await fetchGeminiWithBackoff(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const jsonRes = await res.json();
      const jsonText = jsonRes.candidates?.[0]?.content?.parts?.[0]?.text;
      if (jsonText) {
        const parsed = JSON.parse(jsonText);
        QTHOUGHTS_DATA = normalizeQThoughtsData(parsed);
        window.QTHOUGHTS_DATA = QTHOUGHTS_DATA;
        renderBoard();
        showToast("✨ Mémoire mise à jour par Gemini !");
        document.getElementById('gemini-modal').classList.remove('active');
      }
    } catch (err) {
      showToast("⚠️ Erreur Gemini: " + err.message);
    } finally {
      loader.style.display = 'none';
    }
  }

  async function runGeminiAudit() {
    const loader = document.getElementById('gemini-loading');
    const loaderText = document.getElementById('gemini-loading-text');
    loaderText.textContent = 'Analyse des angles morts & biais cognitifs...';
    loader.style.display = 'block';

    try {
      const apiKey = "";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

      const promptText = `Examine l'état de Q-Thoughts. Détecte les biais cognitifs ou questions ouvertes oubliées. Mets à jour Q-Thoughts en ajoutant 1 ou 2 questions dans "toDiscuss" et au moins une nouvelle "hypotheses".

État actuel :
${JSON.stringify(QTHOUGHTS_DATA, null, 2)}`;

      const payload = {
        contents: [{ parts: [{ text: promptText }] }],
        generationConfig: { responseMimeType: "application/json" }
      };

      const res = await fetchGeminiWithBackoff(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const jsonRes = await res.json();
      const jsonText = jsonRes.candidates?.[0]?.content?.parts?.[0]?.text;
      if (jsonText) {
        const parsed = JSON.parse(jsonText);
        QTHOUGHTS_DATA = normalizeQThoughtsData(parsed);
        window.QTHOUGHTS_DATA = QTHOUGHTS_DATA;
        renderBoard();
        showToast("🔎 Audit terminé : Angles morts ajoutés !");
        document.getElementById('gemini-modal').classList.remove('active');
      }
    } catch (err) {
      showToast("⚠️ Erreur Audit: " + err.message);
    } finally {
      loader.style.display = 'none';
    }
  }

  async function runGeminiWebSearch(query) {
    const loader = document.getElementById('gemini-loading');
    const loaderText = document.getElementById('gemini-loading-text');
    const sourcesDiv = document.getElementById('gemini-search-sources');
    loaderText.textContent = `Recherche Google pour : "${query}"...`;
    loader.style.display = 'block';
    sourcesDiv.style.display = 'none';

    try {
      const apiKey = "";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

      const payload = {
        contents: [{ parts: [{ text: `Recherche sur "${query}". Résume les faits et propose une carte "toDiscuss".` }] }],
        tools: [{ "google_search": {} }]
      };

      const res = await fetchGeminiWithBackoff(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      const candidate = result.candidates?.[0];
      const text = candidate?.content?.parts?.[0]?.text || "";

      let sources = [];
      const groundingMetadata = candidate?.groundingMetadata;
      if (groundingMetadata && groundingMetadata.groundingAttributions) {
        sources = groundingMetadata.groundingAttributions
          .map(a => ({ uri: a.web?.uri, title: a.web?.title }))
          .filter(s => s.uri && s.title);
      }

      if (text) {
        const searchCard = {
          id: 'td_search_' + hashString(query),
          title: `🌐 Recherche : ${query}`,
          reason: text.slice(0, 200) + '...',
          consequence: 'Données ancrées via Google Search',
          related_to: []
        };
        QTHOUGHTS_DATA.toDiscuss.unshift(searchCard);
        renderBoard();

        if (sources.length > 0) {
          sourcesDiv.innerHTML = '<strong>Sources Google :</strong><br>' + 
            sources.map(s => `<a href="${escapeHtml(s.uri)}" target="_blank" style="color: #38bdf8; text-decoration: underline;">${escapeHtml(s.title)}</a>`).join('<br>');
          sourcesDiv.style.display = 'block';
        }
        showToast("🌐 Recherche Web ancrée ajoutée !");
      }
    } catch (err) {
      showToast("⚠️ Erreur Recherche Web: " + err.message);
    } finally {
      loader.style.display = 'none';
    }
  }

  async function runGeminiImageAnalyze(file) {
    const loader = document.getElementById('gemini-loading');
    const loaderText = document.getElementById('gemini-loading-text');
    loaderText.textContent = 'Analyse vision de l\'image...';
    loader.style.display = 'block';

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target.result.split(',')[1];
        const mimeType = file.type || 'image/png';

        const apiKey = "";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

        const payload = {
          contents: [{
            role: "user",
            parts: [
              { text: `Analyse cette image. Extraie la structure cognitive au format JSON de QTHOUGHTS_DATA.` },
              { inlineData: { mimeType: mimeType, data: base64Data } }
            ]
          }],
          generationConfig: { responseMimeType: "application/json" }
        };

        const res = await fetchGeminiWithBackoff(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const jsonRes = await res.json();
        const jsonText = jsonRes.candidates?.[0]?.content?.parts?.[0]?.text;
        if (jsonText) {
          const parsed = JSON.parse(jsonText);
          QTHOUGHTS_DATA = normalizeQThoughtsData(parsed);
          window.QTHOUGHTS_DATA = QTHOUGHTS_DATA;
          renderBoard();
          showToast("📷 Analyse d'image terminée !");
          document.getElementById('gemini-modal').classList.remove('active');
        }
        loader.style.display = 'none';
      };
      reader.readAsDataURL(file);
    } catch (err) {
      showToast("⚠️ Erreur Vision: " + err.message);
      loader.style.display = 'none';
    }
  }

  async function runGeminiTTS() {
    const loader = document.getElementById('gemini-loading');
    const loaderText = document.getElementById('gemini-loading-text');
    const voice = document.getElementById('gemini-voice-select').value;
    loaderText.textContent = `Génération audio avec ${voice}...`;
    loader.style.display = 'block';

    try {
      const apiKey = "";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;
      const textToSay = `Briefing stratégique. Objectif: ${QTHOUGHTS_DATA.objective?.title}. ${QTHOUGHTS_DATA.summary}`;

      const payload = {
        contents: [{ parts: [{ text: textToSay }] }],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } }
        }
      };

      const res = await fetchGeminiWithBackoff(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const jsonRes = await res.json();
      const part = jsonRes.candidates?.[0]?.content?.parts?.[0];
      const base64Data = part?.inlineData?.data;
      const mimeType = part?.inlineData?.mimeType || "audio/L16;rate=24000";

      if (base64Data) {
        const sampleRateMatch = mimeType.match(/rate=(\d+)/);
        const sampleRate = sampleRateMatch ? parseInt(sampleRateMatch[1], 10) : 24000;
        const arrayBuffer = base64ToArrayBuffer(base64Data);
        const pcm16 = new Int16Array(arrayBuffer);
        const wavBlob = pcmToWav(pcm16, sampleRate);
        const audioUrl = URL.createObjectURL(wavBlob);

        const player = document.getElementById('gemini-audio-player');
        player.src = audioUrl;
        player.style.display = 'block';
        player.play();
        showToast("🎙️ Briefing audio généré !");
      }
    } catch (err) {
      showToast("⚠️ Erreur TTS: " + err.message);
    } finally {
      loader.style.display = 'none';
    }
  }

  async function runGeminiGenerateImage() {
    const loader = document.getElementById('gemini-loading');
    const loaderText = document.getElementById('gemini-loading-text');
    loaderText.textContent = 'Génération du schéma visuel (Imagen 4)...';
    loader.style.display = 'block';

    try {
      const apiKey = "";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`;
      const promptText = `Modern futuristic 3d diagram infographic for goal: "${QTHOUGHTS_DATA.objective?.title}". Dark navy background, neon cyan and purple accents.`;

      const payload = {
        instances: [{ prompt: promptText }],
        parameters: { sampleCount: 1 }
      };

      const res = await fetchGeminiWithBackoff(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const jsonRes = await res.json();
      const base64Image = jsonRes.predictions?.[0]?.bytesBase64Encoded;
      if (base64Image) {
        const imgEl = document.getElementById('gemini-generated-image');
        imgEl.src = `data:image/png;base64,${base64Image}`;
        document.getElementById('gemini-image-container').style.display = 'block';
        showToast("🎨 Schéma visuel généré !");
      }
    } catch (err) {
      showToast("⚠️ Erreur Image: " + err.message);
    } finally {
      loader.style.display = 'none';
    }
  }

  async function sendGeminiChatMessage(userMsg) {
    const chatBox = document.getElementById('chat-messages');
    chatBox.innerHTML += `<div style="background: #0284c7; padding: 0.5rem 0.75rem; border-radius: 6px; color: #fff; align-self: flex-end;">👤 <strong>Vous :</strong> ${escapeHtml(userMsg)}</div>`;
    
    const loadingDiv = document.createElement('div');
    loadingDiv.style.cssText = 'background: #1e293b; padding: 0.5rem 0.75rem; border-radius: 6px; color: #f472b6;';
    loadingDiv.innerHTML = '🤖 <strong>Gemini :</strong> <span class="spinner" style="width: 14px; height: 14px;"></span> Réflexion...';
    chatBox.appendChild(loadingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
      const apiKey = "";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

      const promptText = `Tu es le co-pilote cognitif Q-Thoughts. Réponds à l'utilisateur ET met à jour QTHOUGHTS_DATA.
Réponds au format JSON avec "reply" et "qthoughts".

Message utilisateur : "${userMsg}"
État actuel QTHOUGHTS_DATA :
${JSON.stringify(QTHOUGHTS_DATA, null, 2)}`;

      const payload = {
        contents: [{ parts: [{ text: promptText }] }],
        generationConfig: { responseMimeType: "application/json" }
      };

      const res = await fetchGeminiWithBackoff(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const jsonRes = await res.json();
      const jsonText = jsonRes.candidates?.[0]?.content?.parts?.[0]?.text;
      if (jsonText) {
        const parsed = JSON.parse(jsonText);
        loadingDiv.innerHTML = `🤖 <strong>Gemini :</strong> ${escapeHtml(parsed.reply || "Mémoire mise à jour.")}`;
        if (parsed.qthoughts) {
          QTHOUGHTS_DATA = normalizeQThoughtsData(parsed.qthoughts);
          window.QTHOUGHTS_DATA = QTHOUGHTS_DATA;
          renderBoard();
          showToast("✨ Mémoire Q-Thoughts mise à jour via le Chat !");
        }
      }
    } catch (err) {
      loadingDiv.innerHTML = `⚠️ <strong>Erreur :</strong> ${escapeHtml(err.message)}`;
    }
    chatBox.scrollTop = chatBox.scrollHeight;
  }

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
      window.QTHOUGHTS_DATA = QTHOUGHTS_DATA;
      renderBoard();

      const syncPrompt = `Nous venons de restaurer notre mémoire cognitive Q-Thoughts :\n\n\`\`\`json\n${JSON.stringify(QTHOUGHTS_DATA, null, 2)}\n\`\`\``;
      document.getElementById('import-sync-prompt').value = syncPrompt;
      document.getElementById('import-step-input').style.display = 'none';
      document.getElementById('import-step-result').style.display = 'block';
    } catch (err) {
      showToast("⚠️ JSON invalide : " + err.message);
    }
  }

  function init() {
    injectStyles();
    buildDOM();

    document.getElementById('btn-open-gemini').addEventListener('click', () => {
      document.getElementById('gemini-modal').classList.add('active');
    });

    document.getElementById('btn-gemini-parse-transcript').addEventListener('click', () => {
      const val = document.getElementById('gemini-transcript-input').value.trim();
      if (val) runGeminiParseTranscript(val);
      else showToast("Veuillez saisir un texte.");
    });

    document.getElementById('btn-gemini-tts').addEventListener('click', runGeminiTTS);
    document.getElementById('btn-gemini-generate-image').addEventListener('click', runGeminiGenerateImage);

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

    document.getElementById('btn-export-json').addEventListener('click', exportSession);

    document.getElementById('btn-open-import').addEventListener('click', () => {
      document.getElementById('import-json-textarea').value = '';
      document.getElementById('import-step-input').style.display = 'block';
      document.getElementById('import-step-result').style.display = 'none';
      document.getElementById('import-modal').classList.add('active');
    });

    document.getElementById('btn-process-import').addEventListener('click', processImport);

    document.getElementById('import-file-input').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => { document.getElementById('import-json-textarea').value = evt.target.result; };
      reader.readAsText(file);
    });

    document.getElementById('btn-copy-sync-prompt').addEventListener('click', () => {
      const text = document.getElementById('import-sync-prompt').value;
      if (navigator.clipboard) navigator.clipboard.writeText(text);
      else document.execCommand('copy');
      showToast("📋 Prompt de synchronisation copié !");
      document.getElementById('import-modal').classList.remove('active');
    });

    document.getElementById('btn-gemini-audit').addEventListener('click', runGeminiAudit);

    document.getElementById('btn-gemini-web-search').addEventListener('click', () => {
      const q = document.getElementById('gemini-search-query').value.trim();
      if (q) runGeminiWebSearch(q);
      else showToast("Veuillez entrer un terme.");
    });

    document.getElementById('btn-gemini-analyze-image').addEventListener('click', () => {
      const fileInput = document.getElementById('gemini-image-input');
      if (fileInput.files && fileInput.files[0]) runGeminiImageAnalyze(fileInput.files[0]);
      else showToast("Sélectionnez une image.");
    });

    document.getElementById('btn-open-chat').addEventListener('click', () => {
      document.getElementById('chat-modal').classList.add('active');
    });

    document.getElementById('btn-send-chat').addEventListener('click', () => {
      const input = document.getElementById('chat-user-input');
      const val = input.value.trim();
      if (val) {
        sendGeminiChatMessage(val);
        input.value = '';
      }
    });

    document.getElementById('chat-user-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') document.getElementById('btn-send-chat').click();
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
