/**
 * Central de Mídia & Edição YouTube - Sistema Tomada
 * Interface 100% livre de Emojis - Utiliza ícones SVG (Lucide Icons) conforme diretrizes de design.
 * Inclui Player de Prévia de Vídeo HD, Seção e Mini Pop-up Padrão Premium para PNGTubers e Banco de Memes BR.
 */

(function () {
  const YoutubeDownloader = {
    activeTab: 'search',
    currentAudioPreview: null,
    currentPreviewBtn: null,

    init() {
      if (document.getElementById('yt-downloader-fab')) return;
      this.injectStyles();
      this.createFAB();
    },

    injectStyles() {
      if (document.getElementById('yt-downloader-styles')) return;
      const style = document.createElement('style');
      style.id = 'yt-downloader-styles';
      style.innerHTML = `
        /* FAB Flutuante */
        .yt-fab-button {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 99990;
          display: flex;
          align-items: center;
          gap: 10px;
          background: linear-gradient(135deg, #FF0000 0%, #CC0000 100%);
          color: #FFFFFF;
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 12px 20px;
          border-radius: 50px;
          font-family: -apple-system, BlinkMacSystemFont, 'Outfit', 'Segoe UI', Roboto, sans-serif;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 10px 25px rgba(255, 0, 0, 0.4), 0 4px 10px rgba(0, 0, 0, 0.15);
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          user-select: none;
        }

        .yt-fab-button:hover {
          transform: translateY(-3px) scale(1.04);
          box-shadow: 0 14px 32px rgba(255, 0, 0, 0.5), 0 6px 14px rgba(0, 0, 0, 0.2);
          background: linear-gradient(135deg, #FF1A1A 0%, #DD0000 100%);
        }

        .yt-fab-button:active {
          transform: translateY(0) scale(0.98);
        }

        .yt-fab-icon {
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Estilização do Modal no Padrão do Sistema Tomada */
        .youtube-downloader-modal {
          max-width: 740px !important;
          width: 94% !important;
          border-radius: 24px !important;
          background: var(--hig-bg-tertiary, #ffffff) !important;
          border: 1px solid rgba(0, 0, 0, 0.08) !important;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25) !important;
          overflow: hidden;
        }

        .youtube-downloader-modal .modal-header {
          padding: 22px 28px 16px !important;
          border-bottom: 1px solid var(--hig-separator, rgba(0, 0, 0, 0.06)) !important;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .yt-modal-title-box {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }

        .yt-modal-badge-icon {
          width: 42px;
          height: 42px;
          border-radius: 14px;
          background: linear-gradient(135deg, rgba(255, 0, 0, 0.12) 0%, rgba(204, 0, 0, 0.06) 100%);
          color: #FF0000;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .yt-modal-title {
          font-size: 19px !important;
          font-weight: 800 !important;
          color: var(--hig-label-primary, #1c1c1e) !important;
          margin: 0;
          line-height: 1.2;
          font-family: 'Outfit', sans-serif;
        }

        .yt-modal-subtitle {
          font-size: 13px;
          color: var(--hig-label-secondary, #6e6e73);
          margin: 2px 0 0 0;
        }

        /* Botão do Mini Pop-up no Header */
        .yt-mini-popup-trigger {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          border-radius: 20px;
          background: linear-gradient(135deg, #007AFF 0%, #0051A8 100%);
          color: #FFFFFF;
          border: none;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(0, 122, 255, 0.25);
          white-space: nowrap;
        }

        .yt-mini-popup-trigger:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(0, 122, 255, 0.35);
        }

        .youtube-downloader-modal .modal-body {
          padding: 20px 24px !important;
        }

        /* Segmented Control / Tabs */
        .yt-tabs-container {
          display: flex;
          background: var(--system-bg, #F2F2F7);
          padding: 4px;
          border-radius: 14px;
          gap: 4px;
          margin-bottom: 18px;
          border: 1px solid rgba(0, 0, 0, 0.04);
          overflow-x: auto;
        }

        .yt-tab-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 9px 12px;
          border-radius: 10px;
          border: none;
          background: transparent;
          font-size: 12px;
          font-weight: 700;
          color: #6E6E73;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .yt-tab-btn.active {
          background: #FFFFFF;
          color: #1C1C1E;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04);
        }

        .yt-tab-btn:hover:not(.active) {
          color: #1C1C1E;
          background: rgba(255, 255, 255, 0.5);
        }

        /* Category Chips / Pills */
        .yt-chips-scroll {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 8px;
          margin-bottom: 16px;
          scrollbar-width: thin;
        }

        .yt-chip-item {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 20px;
          background: #FFFFFF;
          border: 1px solid var(--hig-separator, rgba(0, 0, 0, 0.1));
          font-size: 12px;
          font-weight: 600;
          color: #3A3A3C;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s ease;
          box-shadow: 0 1px 3px rgba(0,0,0,0.03);
        }

        .yt-chip-item:hover {
          background: #FF0000;
          color: #FFFFFF;
          border-color: #FF0000;
          transform: translateY(-1px);
        }

        .yt-chip-item.active {
          background: #FF0000;
          color: #FFFFFF;
          border-color: #FF0000;
        }

        /* MyInstants Memes Grid */
        .yt-memes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 10px;
          margin-bottom: 18px;
          max-height: 280px;
          overflow-y: auto;
          padding-right: 4px;
        }

        .yt-meme-button {
          background: #FFFFFF;
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 14px;
          padding: 10px 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          text-align: center;
          box-shadow: 0 2px 6px rgba(0,0,0,0.02);
          transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .yt-meme-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0,0,0,0.08);
          border-color: #FF0000;
        }

        .yt-meme-circle-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg, #FF0000 0%, #CC0000 100%);
          color: #FFFFFF;
          border: 2px solid #FFF;
          box-shadow: 0 4px 10px rgba(255, 0, 0, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .yt-meme-circle-btn:hover {
          transform: scale(1.08);
          box-shadow: 0 6px 14px rgba(255, 0, 0, 0.45);
        }

        .yt-meme-title {
          font-size: 12px;
          font-weight: 700;
          color: #1C1C1E;
          font-family: 'Outfit', sans-serif;
          line-height: 1.2;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .yt-meme-dl-btn {
          padding: 4px 10px;
          font-size: 10px;
          border-radius: 6px;
          border: none;
          background: rgba(52, 199, 89, 0.12);
          color: #248A3D;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 3px;
          transition: all 0.15s ease;
        }

        .yt-meme-dl-btn:hover {
          background: #34C759;
          color: #FFF;
        }

        /* Input Search Group */
        .yt-input-group {
          position: relative;
          display: flex;
          gap: 10px;
          margin-bottom: 16px;
        }

        .yt-url-input {
          flex: 1;
          height: 48px;
          border-radius: 14px;
          border: 1px solid var(--hig-separator, rgba(0, 0, 0, 0.15));
          background: var(--system-bg, #F5F5F7);
          padding: 0 16px 0 42px;
          font-size: 14px;
          color: #000;
          outline: none;
          transition: all 0.2s ease;
        }

        .yt-url-input:focus {
          border-color: #FF0000;
          background: #FFFFFF;
          box-shadow: 0 0 0 3px rgba(255, 0, 0, 0.12);
        }

        .yt-input-icon {
          position: absolute;
          left: 14px;
          top: 15px;
          color: #8E8E93;
          pointer-events: none;
        }

        .yt-btn-fetch {
          height: 48px;
          padding: 0 22px;
          border-radius: 14px;
          background: #FF0000;
          color: #FFFFFF;
          border: none;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: background 0.2s ease;
          white-space: nowrap;
        }

        .yt-btn-fetch:hover {
          background: #D60000;
        }

        .yt-btn-fetch:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Cards Layout */
        .yt-search-card {
          background: #FFFFFF;
          border-radius: 16px;
          border: 1px solid rgba(0,0,0,0.08);
          padding: 14px;
          display: flex;
          gap: 14px;
          align-items: flex-start;
          box-shadow: 0 2px 8px rgba(0,0,0,0.02);
          transition: all 0.2s ease;
        }

        .yt-search-card:hover {
          box-shadow: 0 6px 16px rgba(0,0,0,0.06);
          border-color: rgba(0,0,0,0.12);
        }

        /* Thumb Play Hover Overlay */
        .yt-thumb-wrapper {
          width: 120px;
          height: 74px;
          border-radius: 10px;
          overflow: hidden;
          position: relative;
          flex-shrink: 0;
          background: #000;
          cursor: pointer;
        }

        .yt-thumb-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .yt-thumb-wrapper:hover .yt-thumb-overlay {
          opacity: 1;
        }

        /* Quick Action Buttons on Cards */
        .yt-quick-actions {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
          margin-top: 10px;
        }

        .yt-quick-btn {
          padding: 5px 11px;
          font-size: 11px;
          border-radius: 8px;
          border: 1px solid rgba(0,0,0,0.08);
          background: #F2F2F7;
          color: #1C1C1E;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          transition: all 0.15s ease;
        }

        .yt-quick-btn:hover {
          transform: translateY(-1px);
        }

        .yt-quick-btn.play {
          background: rgba(0, 122, 255, 0.1);
          color: #007AFF;
          border-color: rgba(0, 122, 255, 0.2);
        }
        .yt-quick-btn.play:hover {
          background: #007AFF;
          color: #FFF;
        }

        .yt-quick-btn.mp3 {
          background: rgba(52, 199, 89, 0.12);
          color: #248A3D;
          border-color: rgba(52, 199, 89, 0.2);
        }
        .yt-quick-btn.mp3:hover {
          background: #34C759;
          color: #FFF;
        }

        .yt-quick-btn.wav {
          background: rgba(0, 122, 255, 0.1);
          color: #007AFF;
          border-color: rgba(0, 122, 255, 0.2);
        }
        .yt-quick-btn.wav:hover {
          background: #007AFF;
          color: #FFF;
        }

        .yt-quick-btn.mp4 {
          background: rgba(255, 0, 0, 0.08);
          color: #FF0000;
          border-color: rgba(255, 0, 0, 0.2);
        }
        .yt-quick-btn.mp4:hover {
          background: #FF0000;
          color: #FFF;
        }

        .yt-quick-btn.more {
          background: #E5E5EA;
          color: #3A3A3C;
        }
        .yt-quick-btn.more:hover {
          background: #D1D1D6;
        }

        /* Card de Resultado */
        .yt-preview-card {
          display: flex;
          flex-direction: column;
          gap: 16px;
          background: var(--system-bg, #F9F9FB);
          border: 1px solid var(--hig-separator, rgba(0, 0, 0, 0.08));
          border-radius: 16px;
          padding: 16px;
          animation: fadeIn 0.3s ease-out;
        }

        .yt-preview-header {
          display: flex;
          gap: 14px;
          align-items: center;
        }

        .yt-thumb-img {
          width: 120px;
          height: 70px;
          object-fit: cover;
          border-radius: 10px;
          background: #000;
        }

        .yt-preview-info {
          flex: 1;
          min-width: 0;
        }

        .yt-video-title {
          font-size: 15px;
          font-weight: 700;
          color: #1C1C1E;
          margin: 0 0 4px 0;
          font-family: 'Outfit', sans-serif;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .yt-video-author {
          font-size: 12px;
          color: #6E6E73;
          margin: 0;
        }

        .yt-format-selector {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .yt-format-option {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-radius: 12px;
          background: #FFFFFF;
          border: 1px solid var(--hig-separator, rgba(0, 0, 0, 0.1));
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .yt-format-option:hover {
          border-color: #FF0000;
          background: rgba(255, 0, 0, 0.02);
          transform: translateX(2px);
        }

        .yt-format-label {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;
          font-weight: 600;
          color: #1C1C1E;
        }

        .yt-badge {
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          background: #E5E5EA;
          color: #3A3A3C;
        }

        .yt-badge.hd {
          background: #FF0000;
          color: #FFFFFF;
        }

        .yt-badge.mp3 {
          background: #34C759;
          color: #FFFFFF;
        }

        .yt-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: #fff;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 600px) {
          .yt-fab-text { display: none; }
          .yt-fab-button { padding: 14px; border-radius: 50%; bottom: 80px; right: 16px; }
          .yt-btn-fetch { padding: 0 14px; font-size: 13px; }
          .yt-tab-btn { font-size: 11px; padding: 8px 6px; }
          .yt-memes-grid { grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); }
        }
      `;
      document.head.appendChild(style);
    },

    createFAB() {
      const fab = document.createElement('button');
      fab.id = 'yt-downloader-fab';
      fab.className = 'yt-fab-button';
      fab.setAttribute('title', 'Central de Mídia & Edição YouTube');
      fab.onclick = () => this.openModal();

      fab.innerHTML = `
        <div class="yt-fab-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        </div>
        <span class="yt-fab-text">Central de Edição (YouTube)</span>
      `;

      document.body.appendChild(fab);
    },

    openModal() {
      this.activeTab = 'search';

      const contentHtml = `
        <div class="yt-downloader-body">
          <!-- Tab Navigation Bar -->
          <div class="yt-tabs-container">
            <button type="button" class="yt-tab-btn active" id="yt-tab-search" onclick="YoutubeDownloader.switchTab('search')">
              <i data-lucide="search" style="width: 14px; height: 14px;"></i>
              <span>Buscar Vídeo / Link</span>
            </button>
            <button type="button" class="yt-tab-btn" id="yt-tab-memes" onclick="YoutubeDownloader.switchTab('memes')">
              <i data-lucide="smile" style="width: 14px; height: 14px;"></i>
              <span>Memes BR (MyInstants)</span>
            </button>
            <button type="button" class="yt-tab-btn" id="yt-tab-pngtuber" onclick="YoutubeDownloader.switchTab('pngtuber')">
              <i data-lucide="gamepad-2" style="width: 14px; height: 14px;"></i>
              <span>PNGTuber</span>
            </button>
            <button type="button" class="yt-tab-btn" id="yt-tab-sfx" onclick="YoutubeDownloader.switchTab('sfx')">
              <i data-lucide="volume-2" style="width: 14px; height: 14px;"></i>
              <span>Efeitos Sonoros</span>
            </button>
            <button type="button" class="yt-tab-btn" id="yt-tab-music" onclick="YoutubeDownloader.switchTab('music')">
              <i data-lucide="music" style="width: 14px; height: 14px;"></i>
              <span>Músicas (NCM)</span>
            </button>
            <button type="button" class="yt-tab-btn" id="yt-tab-overlay" onclick="YoutubeDownloader.switchTab('overlay')">
              <i data-lucide="layers" style="width: 14px; height: 14px;"></i>
              <span>Overlays</span>
            </button>
          </div>

          <!-- MyInstants Soundboard Fast Grid Container -->
          <div id="yt-memes-soundboard" style="display: none;" class="yt-memes-grid"></div>

          <!-- Category Chips Container (Dynamic per tab) -->
          <div id="yt-chips-container" style="display: none;" class="yt-chips-scroll"></div>

          <!-- Search Input Group -->
          <div class="yt-input-group">
            <div class="yt-input-icon">
              <i data-lucide="link" style="width: 18px; height: 18px;"></i>
            </div>
            <input type="text" id="yt-url-input" class="yt-url-input" placeholder="Cole a URL do vídeo ou pesquise o termo desejado..." />
            <button class="yt-btn-fetch" id="yt-btn-fetch" onclick="YoutubeDownloader.fetchVideoInfo()">
              <i data-lucide="search" style="width: 16px; height: 16px;"></i>
              <span>Pesquisar</span>
            </button>
          </div>

          <div id="yt-status-msg" style="display: none; margin-bottom: 16px; font-size: 13px; color: #6E6E73; text-align: center;"></div>

          <div id="yt-result-container" style="display: none;"></div>
        </div>
      `;

      const footerHtml = `
        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
          <button type="button" class="yt-mini-popup-trigger" onclick="YoutubeDownloader.openMiniSoundboardPopup()">
            <i data-lucide="sparkles" style="width: 13px; height: 13px;"></i>
            <span>Pack Pop-up PNGTuber</span>
          </button>
          <button class="btn-premium-secondary" onclick="Components.closeModal()">Fechar</button>
        </div>
      `;

      if (typeof Components !== 'undefined' && Components.showModal) {
        Components.showModal(
          `<div class="yt-modal-title-box">
            <div class="yt-modal-badge-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </div>
            <div>
              <div class="yt-modal-title">Central de Recursos para Edição</div>
              <div class="yt-modal-subtitle">Baixe vídeos, efeitos sonoros (SFX), memes BR e trilhas 100% prontos para o Premiere</div>
            </div>
          </div>`,
          contentHtml,
          footerHtml,
          'youtube-downloader-modal premium-task-modal'
        );

        if (typeof lucide !== 'undefined' && lucide.createIcons) {
          lucide.createIcons();
        }
      }
    },

    myInstantsMemes: [
      { name: 'Receba! (Luva de Pedreiro)', vId: 'query:efeito sonoro luva de pedreiro receba' },
      { name: 'Ele Gosta! (Rodrigo Faro)', vId: 'query:efeito sonoro rodrigo faro ele gosta' },
      { name: 'Ui! (Rodrigo Faro)', vId: 'query:efeito sonoro rodrigo faro ui' },
      { name: 'Cavalo! (Rodrigo Faro)', vId: 'query:efeito sonoro rodrigo faro cavalo' },
      { name: 'Dança Gatinho Dança', vId: 'query:efeito sonoro danca gatinho danca' },
      { name: 'Faustão: Errou!', vId: 'query:efeito sonoro faustao errou' },
      { name: 'Bruh Sound Effect', vId: 'query:bruh sound effect meme' },
      { name: 'Emotional Damage', vId: 'query:emotional damage sound effect meme' },
      { name: 'GTA San Andreas Wasted', vId: 'query:gta san andreas wasted sound effect' },
      { name: 'Risada do Chaves', vId: 'query:risada do chaves efeito sonoro' },
      { name: 'Metal Gear Alert', vId: 'query:metal gear solid alert sound effect' },
      { name: 'Trombeta Sad / Sad Violin', vId: 'query:trombeta sad violin sound effect' }
    ],

    presetCategories: {
      memes: [
        { label: 'Memes BR Virais', icon: 'flame', query: 'meme audio br rodrigo faro ratinho luva de pedreiro' },
        { label: 'Rodrigo Faro & Ratinho', icon: 'tv', query: 'efeito sonoro rodrigo faro ele gosta cavalo ui' },
        { label: 'Faustão & TV Brasileira', icon: 'volume-2', query: 'faustao errou meme som tv' },
        { label: 'Internet Global & Gringo', icon: 'globe', query: 'bruh emotional damage meme sound' },
        { label: 'Gamers & Anime', icon: 'gamepad-2', query: 'gta wasted skyrim level up anime wow meme' }
      ],
      pngtuber: [
        { label: 'Efeitos PNGTuber Virais', icon: 'gamepad-2', query: 'pngtuber sound effect meme bonk vine boom' },
        { label: 'Discord Join & Pop', icon: 'bell', query: 'discord join notification sound effect pop' },
        { label: 'Bonk & Cartoon', icon: 'zap', query: 'bonk cartoon sound effect meme' },
        { label: 'Vine Boom & Impacto', icon: 'activity', query: 'vine boom sound effect dramatic' },
        { label: 'Huh? & Gato Meme', icon: 'help-circle', query: 'huh cat sound effect meme' },
        { label: 'Teclado & Cliques Rápido', icon: 'mouse-pointer', query: 'mechanical keyboard typing sound effect' },
        { label: 'Erro & Windows Glitch', icon: 'alert-octagon', query: 'windows error sound effect meme' }
      ],
      sfx: [
        { label: 'Mais Populares', icon: 'flame', query: 'efeito sonoro mais usado edicao' },
        { label: 'Transição & Swoosh', icon: 'zap', query: 'swoosh sound effect transition edicao' },
        { label: 'Risada & Memes', icon: 'smile', query: 'efeito sonoro risada meme engraçado' },
        { label: 'Impacto & Boom', icon: 'activity', query: 'impact sound effect vine boom bass drop' },
        { label: 'Suspense & Tensão', icon: 'alert-circle', query: 'suspense sound effect tension dramatic' },
        { label: 'Cliques & Pop', icon: 'mouse-pointer', query: 'mouse click keyboard sound effect pop' }
      ],
      music: [
        { label: 'Lofi Beats', icon: 'headphones', query: 'no copyright music lofi hip hop relaxed' },
        { label: 'Upbeat & Vlogs', icon: 'rocket', query: 'no copyright music vlog upbeat energetic' },
        { label: 'Cinemática & Épica', icon: 'film', query: 'no copyright music cinematic epic background' },
        { label: 'Acústica & Soft', icon: 'coffee', query: 'no copyright music acoustic guitar soft' },
        { label: 'Synthwave & Gaming', icon: 'gamepad-2', query: 'no copyright music synthwave cyberpunk' }
      ],
      overlay: [
        { label: 'Chroma Key & Memes', icon: 'video', query: 'greenscreen meme overlay edição' },
        { label: 'Explosões & Fogo', icon: 'flame', query: 'fire explosion green screen overlay' },
        { label: 'Efeitos Visuais', icon: 'sparkles', query: 'light leaks particles overlay edição' },
        { label: 'Transições Overlay', icon: 'arrow-right-left', query: 'transition green screen overlay video' }
      ]
    },

    // Mini Pop-up Padrão Premium do Sistema (PNGTuber Pack)
    openMiniSoundboardPopup() {
      const pngtuberPack = [
        { name: 'Bonk Cartoon SFX', vId: 'query:bonk cartoon sound effect', type: 'audio' },
        { name: 'Discord Join Sound', vId: 'query:discord join notification sound effect', type: 'audio' },
        { name: 'Vine Boom Effect', vId: 'query:vine boom sound effect', type: 'audio' },
        { name: 'Huh? Cat Sound', vId: 'query:huh cat sound effect meme', type: 'audio' },
        { name: 'Mechanical Keyboard', vId: 'query:mechanical keyboard typing sound effect', type: 'audio' },
        { name: 'Windows Error Meme', vId: 'query:windows error sound effect meme', type: 'audio' },
        { name: 'Anime Wow Effect', vId: 'query:anime wow sound effect', type: 'audio' },
        { name: 'Toy Squeak Sound', vId: 'query:squeak toy sound effect', type: 'audio' }
      ];

      let overlay = document.getElementById('pngtuber-mini-popup-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'pngtuber-mini-popup-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.right = '0';
        overlay.style.bottom = '0';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.45)';
        overlay.style.backdropFilter = 'blur(4px)';
        overlay.style.zIndex = '9999999';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.2s ease';
        document.body.appendChild(overlay);
      }

      overlay.innerHTML = `
        <div style="background: #ffffff; width: 340px; max-width: 90%; border-radius: 20px; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Outfit', 'Segoe UI', Roboto, sans-serif; box-shadow: 0 14px 40px rgba(0,0,0,0.25); border: 1px solid rgba(0,0,0,0.1); transform: scale(0.95); transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);" id="pngtuber-mini-box">
          <div style="padding: 18px 20px 14px; background: linear-gradient(135deg, #007AFF 0%, #0051A8 100%); color: #FFF; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <i data-lucide="gamepad-2" style="width: 20px; height: 20px;"></i>
              <div>
                <h4 style="margin: 0; font-size: 15px; font-weight: 800; line-height: 1.2;">Pack PNGTuber & Streamers</h4>
                <p style="margin: 2px 0 0 0; font-size: 11px; opacity: 0.85; font-weight: 400;">Efeitos mais usados para download rápido</p>
              </div>
            </div>
            <button style="background: rgba(255,255,255,0.2); border: none; color: #FFF; width: 26px; height: 26px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center;" onclick="YoutubeDownloader.closeMiniPopup()">&times;</button>
          </div>

          <div style="padding: 14px 16px; max-height: 320px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px;">
            ${pngtuberPack.map(item => `
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: #F2F2F7; border-radius: 12px; border: 1px solid rgba(0,0,0,0.04);">
                <span style="font-size: 12px; font-weight: 700; color: #1C1C1E; font-family: 'Outfit', sans-serif;">${item.name}</span>
                <button type="button" style="padding: 5px 10px; font-size: 11px; border-radius: 8px; border: none; background: #FF0000; color: #FFF; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;" onclick="YoutubeDownloader.triggerQuickDownload('${item.vId}', 'audio', '${encodeURIComponent(item.name)}', this)">
                  <i data-lucide="download" style="width: 11px; height: 11px;"></i> MP3
                </button>
              </div>
            `).join('')}
          </div>

          <div style="padding: 10px 16px; border-top: 1px solid rgba(0,0,0,0.08); background: #F9F9FB; text-align: center;">
            <button style="width: 100%; padding: 10px; background: #E5E5EA; border: none; border-radius: 10px; font-size: 13px; font-weight: 700; color: #3A3A3C; cursor: pointer;" onclick="YoutubeDownloader.closeMiniPopup()">Fechar Mini Pop-up</button>
          </div>
        </div>
      `;

      requestAnimationFrame(() => {
        overlay.style.opacity = '1';
        const box = document.getElementById('pngtuber-mini-box');
        if (box) box.style.transform = 'scale(1)';
        if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
      });
    },

    closeMiniPopup() {
      const overlay = document.getElementById('pngtuber-mini-popup-overlay');
      if (overlay) {
        overlay.style.opacity = '0';
        const box = document.getElementById('pngtuber-mini-box');
        if (box) box.style.transform = 'scale(0.95)';
        setTimeout(() => {
          if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
        }, 200);
      }
    },

    // Player de Prévia de Vídeo (Pop-up de Vídeo HD)
    openVideoPreviewModal(videoId, encodedTitle) {
      const title = decodeURIComponent(encodedTitle || 'Prévia do Vídeo');
      
      let overlay = document.getElementById('yt-video-preview-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'yt-video-preview-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.right = '0';
        overlay.style.bottom = '0';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.75)';
        overlay.style.backdropFilter = 'blur(6px)';
        overlay.style.zIndex = '9999999';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.2s ease';
        document.body.appendChild(overlay);
      }

      overlay.innerHTML = `
        <div style="background: #ffffff; width: 680px; max-width: 94%; border-radius: 20px; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Outfit', 'Segoe UI', Roboto, sans-serif; box-shadow: 0 20px 50px rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1); transform: scale(0.95); transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);" id="yt-video-box">
          <!-- Header -->
          <div style="padding: 16px 20px; background: #1C1C1E; color: #FFF; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 10px; min-width: 0; flex: 1;">
              <div style="width: 32px; height: 32px; border-radius: 10px; background: #FF0000; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #FFF;">
                <i data-lucide="play" style="width: 16px; height: 16px;"></i>
              </div>
              <div style="min-width: 0;">
                <h4 style="margin: 0; font-size: 14px; font-weight: 800; line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${title}">${title}</h4>
                <p style="margin: 2px 0 0 0; font-size: 11px; color: #8E8E93;">Prévia do Vídeo (Player em Alta Definição)</p>
              </div>
            </div>
            <button style="background: rgba(255,255,255,0.15); border: none; color: #FFF; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; margin-left: 12px; flex-shrink: 0;" onclick="YoutubeDownloader.closeVideoPreview()">&times;</button>
          </div>

          <!-- Video iFrame Container (16:9 Ratio) -->
          <div style="position: relative; width: 100%; padding-top: 56.25%; background: #000;">
            <iframe 
              src="https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1" 
              title="Prévia do Vídeo" 
              frameborder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              allowfullscreen 
              style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;">
            </iframe>
          </div>

          <!-- Quick Action Buttons -->
          <div style="padding: 14px 20px; background: #F9F9FB; border-top: 1px solid rgba(0,0,0,0.08); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
            <div style="font-size: 12px; font-weight: 700; color: #1C1C1E;">Gostou do vídeo? Baixe direto para o Premiere:</div>
            <div style="display: flex; gap: 8px;">
              <button type="button" class="yt-quick-btn mp4" style="padding: 7px 14px; font-size: 12px;" onclick="YoutubeDownloader.triggerQuickDownload('${videoId}', 'video', '${encodeURIComponent(title)}', this)">
                <i data-lucide="video" style="width: 13px; height: 13px;"></i> Baixar MP4 HD
              </button>
              <button type="button" class="yt-quick-btn mp3" style="padding: 7px 14px; font-size: 12px;" onclick="YoutubeDownloader.triggerQuickDownload('${videoId}', 'audio', '${encodeURIComponent(title)}', this)">
                <i data-lucide="music" style="width: 13px; height: 13px;"></i> Baixar MP3
              </button>
              <button type="button" class="yt-quick-btn more" style="padding: 7px 14px; font-size: 12px;" onclick="YoutubeDownloader.closeVideoPreview()">
                Fechar
              </button>
            </div>
          </div>
        </div>
      `;

      requestAnimationFrame(() => {
        overlay.style.opacity = '1';
        const box = document.getElementById('yt-video-box');
        if (box) box.style.transform = 'scale(1)';
        if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
      });
    },

    closeVideoPreview() {
      const overlay = document.getElementById('yt-video-preview-overlay');
      if (overlay) {
        overlay.style.opacity = '0';
        const box = document.getElementById('yt-video-box');
        if (box) box.style.transform = 'scale(0.95)';
        setTimeout(() => {
          if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
        }, 200);
      }
    },

    async toggleMemePreview(vId, btnElement) {
      if (this.currentAudioPreview) {
        this.currentAudioPreview.pause();
        this.currentAudioPreview = null;
        if (this.currentPreviewBtn && this.currentPreviewBtn !== btnElement) {
          this.currentPreviewBtn.innerHTML = `<i data-lucide="volume-2" style="width: 18px; height: 18px;"></i>`;
        }
      }

      if (this.currentPreviewBtn === btnElement && !this.currentAudioPreview) {
        this.currentPreviewBtn = null;
        if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
        return;
      }

      this.currentPreviewBtn = btnElement;

      btnElement.innerHTML = `<i data-lucide="loader-2" style="width: 18px; height: 18px; animation: spin 0.8s linear infinite;"></i>`;
      if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();

      try {
        const streamUrl = `/api/youtube/stream-download?v=${encodeURIComponent(vId)}&type=audio&title=preview&inline=true`;
        const response = await fetch(streamUrl);

        if (!response.ok) throw new Error('Erro no servidor ao carregar áudio');

        const blob = await response.blob();
        if (blob.size === 0) throw new Error('Áudio retornou 0 bytes');

        const blobUrl = URL.createObjectURL(blob);
        const audio = new Audio(blobUrl);
        this.currentAudioPreview = audio;

        btnElement.innerHTML = `<i data-lucide="pause" style="width: 18px; height: 18px;"></i>`;
        if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();

        audio.play().catch(e => console.warn('Preview play error:', e));

        audio.onended = () => {
          btnElement.innerHTML = `<i data-lucide="volume-2" style="width: 18px; height: 18px;"></i>`;
          this.currentAudioPreview = null;
          this.currentPreviewBtn = null;
          URL.revokeObjectURL(blobUrl);
          if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
        };
      } catch (err) {
        console.error('Preview error:', err);
        btnElement.innerHTML = `<i data-lucide="volume-x" style="width: 18px; height: 18px;"></i>`;
        this.currentAudioPreview = null;
        this.currentPreviewBtn = null;
        if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();

        setTimeout(() => {
          btnElement.innerHTML = `<i data-lucide="volume-2" style="width: 18px; height: 18px;"></i>`;
          if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
        }, 2500);

        if (typeof Components !== 'undefined' && Components.toast) {
          Components.toast('Não foi possível reproduzir o áudio deste meme.', 'error');
        }
      }
    },

    renderMyInstantsGrid() {
      const gridContainer = document.getElementById('yt-memes-soundboard');
      if (!gridContainer) return;

      gridContainer.innerHTML = this.myInstantsMemes.map(m => `
        <div class="yt-meme-button">
          <button type="button" class="yt-meme-circle-btn" title="Ouvir Meme" onclick="YoutubeDownloader.toggleMemePreview('${m.vId}', this)">
            <i data-lucide="volume-2" style="width: 18px; height: 18px;"></i>
          </button>
          <div class="yt-meme-title">${m.name}</div>
          <button type="button" class="yt-meme-dl-btn" onclick="YoutubeDownloader.triggerQuickDownload('${m.vId}', 'audio', '${encodeURIComponent(m.name)}', this)">
            <i data-lucide="download" style="width: 10px; height: 10px;"></i> MP3
          </button>
        </div>
      `).join('');

      gridContainer.style.display = 'grid';
      if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
    },

    switchTab(tabKey) {
      this.activeTab = tabKey;
      document.querySelectorAll('.yt-tab-btn').forEach(btn => btn.classList.remove('active'));
      const activeBtn = document.getElementById(`yt-tab-${tabKey}`);
      if (activeBtn) activeBtn.classList.add('active');

      const chipsContainer = document.getElementById('yt-chips-container');
      const memesGrid = document.getElementById('yt-memes-soundboard');
      const input = document.getElementById('yt-url-input');

      if (this.currentAudioPreview) {
        this.currentAudioPreview.pause();
        this.currentAudioPreview = null;
      }

      if (tabKey === 'memes') {
        this.renderMyInstantsGrid();
      } else {
        if (memesGrid) memesGrid.style.display = 'none';
      }

      if (tabKey === 'search') {
        chipsContainer.style.display = 'none';
        if (input) input.placeholder = 'Cole a URL do vídeo ou pesquise o termo desejado...';
      } else {
        const categories = this.presetCategories[tabKey] || [];
        chipsContainer.innerHTML = categories.map((cat, idx) => `
          <button type="button" class="yt-chip-item ${idx === 0 ? 'active' : ''}" onclick="YoutubeDownloader.selectChip('${tabKey}', ${idx}, '${encodeURIComponent(cat.query)}')">
            <i data-lucide="${cat.icon}" style="width: 13px; height: 13px;"></i>
            <span>${cat.label}</span>
          </button>
        `).join('');
        chipsContainer.style.display = 'flex';

        if (typeof lucide !== 'undefined' && lucide.createIcons) {
          lucide.createIcons();
        }

        if (categories.length > 0) {
          this.selectChip(tabKey, 0, encodeURIComponent(categories[0].query));
        }
      }
    },

    selectChip(tabKey, chipIdx, encodedQuery) {
      const query = decodeURIComponent(encodedQuery);
      const input = document.getElementById('yt-url-input');
      if (input) input.value = query;

      document.querySelectorAll('#yt-chips-container .yt-chip-item').forEach((chip, i) => {
        chip.classList.toggle('active', i === chipIdx);
      });

      this.fetchVideoInfo(query);
    },

    async fetchVideoInfo(customQuery = null) {
      const input = document.getElementById('yt-url-input');
      const fetchBtn = document.getElementById('yt-btn-fetch');
      const statusMsg = document.getElementById('yt-status-msg');
      const resultContainer = document.getElementById('yt-result-container');

      const queryVal = customQuery !== null ? customQuery : (input ? input.value.trim() : '');

      if (!queryVal) {
        if (typeof Components !== 'undefined' && Components.toast) {
          Components.toast('Insira uma URL ou digite um termo de busca', 'info');
        } else {
          alert('Insira uma URL ou digite um termo de busca');
        }
        return;
      }

      fetchBtn.disabled = true;
      fetchBtn.innerHTML = `<div class="yt-spinner"></div> <span>Buscando...</span>`;
      statusMsg.style.display = 'block';
      statusMsg.style.color = '#6E6E73';
      statusMsg.innerHTML = '<i data-lucide="search" style="width: 14px; height: 14px; vertical-align: -2px;"></i> Pesquisando recursos no YouTube...';
      resultContainer.style.display = 'none';

      if (typeof lucide !== 'undefined' && lucide.createIcons) {
        lucide.createIcons();
      }

      try {
        const srvResp = await fetch(`/api/youtube/video-info?url=${encodeURIComponent(queryVal)}`);
        const contentType = srvResp.headers.get('content-type') || '';
        
        if (srvResp.ok && contentType.includes('application/json')) {
          const data = await srvResp.json();
          if (data.success) {
            statusMsg.style.display = 'none';
            if (data.isSearchList) {
              this.renderSearchResults(data);
            } else {
              this.renderResult(data);
            }
          } else {
            statusMsg.style.color = '#FF3B30';
            statusMsg.innerHTML = `<i data-lucide="alert-circle" style="width: 14px; height: 14px; vertical-align: -2px;"></i> ${data.error || 'Nenhum resultado encontrado.'}`;
          }
        } else {
          statusMsg.style.color = '#FF3B30';
          statusMsg.innerHTML = '<i data-lucide="wifi-off" style="width: 14px; height: 14px; vertical-align: -2px;"></i> Erro de conexão ao pesquisar no servidor.';
        }
      } catch (e) {
        console.error('[YouTube Downloader] Erro ao buscar:', e);
        statusMsg.style.color = '#FF3B30';
        statusMsg.innerHTML = '<i data-lucide="alert-triangle" style="width: 14px; height: 14px; vertical-align: -2px;"></i> Não foi possível carregar os resultados da busca.';
      } finally {
        fetchBtn.disabled = false;
        fetchBtn.innerHTML = `<i data-lucide="search" style="width: 16px; height: 16px;"></i> <span>Pesquisar</span>`;
        if (typeof lucide !== 'undefined' && lucide.createIcons) {
          lucide.createIcons();
        }
      }
    },

    lastSearchResults: null,

    renderSearchResults(data) {
      const resultContainer = document.getElementById('yt-result-container');
      if (!resultContainer) return;

      this.lastSearchResults = data;
      const results = data.results || [];
      if (results.length === 0) {
        resultContainer.innerHTML = `
          <div style="text-align: center; padding: 24px; color: #6E6E73;">
            Nenhum recurso encontrado para "<strong>${data.query}</strong>". Tente outro termo.
          </div>
        `;
        resultContainer.style.display = 'block';
        return;
      }

      resultContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <div style="font-size: 13px; font-weight: 700; color: #1C1C1E; display: flex; align-items: center; justify-content: space-between;">
            <span>Resultados para: "<strong style="color: #FF0000;">${data.query}</strong>"</span>
            <span style="font-size: 11px; color: #6E6E73; font-weight: 500;">${results.length} itens encontrados</span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 14px; max-height: 440px; overflow-y: auto; padding-right: 4px;">
            ${results.map((v) => `
              <div class="yt-search-card">
                
                <!-- Thumb Interativa com Play Overlay -->
                <div class="yt-thumb-wrapper" title="Clique para Ver a Prévia do Vídeo" onclick="YoutubeDownloader.openVideoPreviewModal('${v.videoId}', '${encodeURIComponent(v.title)}')">
                  <img src="${v.thumbnail}" style="width: 100%; height: 100%; object-fit: cover;">
                  <div class="yt-thumb-overlay">
                    <i data-lucide="play-circle" style="width: 34px; height: 34px; color: #FFF; filter: drop-shadow(0 2px 6px rgba(0,0,0,0.6));"></i>
                  </div>
                  <div style="position: absolute; bottom: 4px; right: 4px; background: rgba(0,0,0,0.8); color: #FFF; padding: 2px 6px; border-radius: 6px; font-size: 10px; font-weight: 700;">
                    ${v.duration || '0:00'}
                  </div>
                </div>

                <!-- Detalhes do Vídeo -->
                <div style="flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
                  <div>
                    <h5 style="margin: 0 0 4px 0; font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 800; color: #1C1C1E; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; cursor: pointer;" title="${v.title}" onclick="YoutubeDownloader.openVideoPreviewModal('${v.videoId}', '${encodeURIComponent(v.title)}')">
                      ${v.title}
                    </h5>
                    <div style="font-size: 11px; color: #6E6E73; display: flex; align-items: center; gap: 8px;">
                      <span><i data-lucide="user" style="width: 11px; height: 11px; vertical-align: -1px; margin-right: 3px;"></i> ${v.author}</span>
                      <span>•</span>
                      <span><i data-lucide="eye" style="width: 11px; height: 11px; vertical-align: -1px; margin-right: 3px;"></i> ${v.viewsEst}</span>
                    </div>
                  </div>

                  <!-- Quick Action Buttons para Edição e Prévia -->
                  <div class="yt-quick-actions">
                    <button type="button" class="yt-quick-btn play" onclick="YoutubeDownloader.openVideoPreviewModal('${v.videoId}', '${encodeURIComponent(v.title)}')">
                      <i data-lucide="play" style="width: 12px; height: 12px;"></i> Ver Prévia
                    </button>
                    <button type="button" class="yt-quick-btn mp3" onclick="YoutubeDownloader.triggerQuickDownload('${v.videoId}', 'audio', '${encodeURIComponent(v.title)}', this)">
                      <i data-lucide="music" style="width: 12px; height: 12px;"></i> MP3
                    </button>
                    <button type="button" class="yt-quick-btn mp4" onclick="YoutubeDownloader.triggerQuickDownload('${v.videoId}', 'video', '${encodeURIComponent(v.title)}', this)">
                      <i data-lucide="video" style="width: 12px; height: 12px;"></i> MP4 HD
                    </button>
                    <button type="button" class="yt-quick-btn more" onclick="YoutubeDownloader.selectVideoForDownload('${v.videoId}')">
                      <i data-lucide="sliders" style="width: 12px; height: 12px;"></i> Opções
                    </button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;

      resultContainer.style.display = 'block';
      if (typeof lucide !== 'undefined' && lucide.createIcons) {
        lucide.createIcons();
      }
    },

    triggerQuickDownload(videoId, type, encodedTitle, btnElement) {
      const title = decodeURIComponent(encodedTitle);
      const cleanTitle = (title || `youtube_${videoId}`).trim();
      const url = `/api/youtube/stream-download?v=${videoId}&type=${type}&quality=max&title=${encodeURIComponent(cleanTitle)}`;
      
      const ext = type === 'wav' ? 'wav' : (type === 'audio' ? 'mp3' : 'mp4');
      const originalText = btnElement ? btnElement.innerHTML : '';
      if (btnElement) {
        btnElement.style.pointerEvents = 'none';
        btnElement.style.opacity = '0.7';
        btnElement.innerHTML = `<i data-lucide="loader-2" style="width: 12px; height: 12px; animation: spin 0.8s linear infinite;"></i> Processando...`;
        if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
      }

      fetch(url)
        .then(async response => {
          if (!response.ok) {
            let errorMsg = 'Erro no servidor (' + response.status + ')';
            try {
              const errData = await response.json();
              if (errData && errData.error) errorMsg = errData.error;
            } catch (e) {}
            throw new Error(errorMsg);
          }

          const contentType = response.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const errData = await response.json();
            throw new Error(errData.error || 'Servidor retornou resposta inválida');
          }

          return response.blob();
        })
        .then(blob => {
          const sanitizedTitle = cleanTitle.replace(/[\\\/\?\:\*\"\<\|\>]/g, '_').replace(/\s+/g, ' ').trim();
          const filename = `${sanitizedTitle}.${ext}`;
          const blobUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(blobUrl);

          if (btnElement) {
            btnElement.innerHTML = `<i data-lucide="check" style="width: 12px; height: 12px;"></i> Salvo!`;
            btnElement.style.background = '#34C759';
            btnElement.style.color = '#FFF';
            if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
          }
          if (typeof Components !== 'undefined' && Components.toast) {
            Components.toast(`Download de ${filename} concluído!`, 'success');
          }
        })
        .catch(err => {
          console.error('Download error:', err);
          if (btnElement) {
            btnElement.innerHTML = `<i data-lucide="x" style="width: 12px; height: 12px;"></i> Erro`;
            btnElement.style.background = '#FF3B30';
            btnElement.style.color = '#FFF';
            if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
          }
          if (typeof Components !== 'undefined' && Components.toast) {
            Components.toast(err.message || 'Erro no download', 'error');
          }
        })
        .finally(() => {
          setTimeout(() => {
            if (btnElement) {
              btnElement.style.pointerEvents = '';
              btnElement.style.opacity = '1';
              btnElement.style.background = '';
              btnElement.style.color = '';
              btnElement.innerHTML = originalText;
              if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
            }
          }, 4000);
        });
    },

    selectVideoForDownload(videoId) {
      if (!this.lastSearchResults || !this.lastSearchResults.results) return;
      const found = this.lastSearchResults.results.find(v => v.videoId === videoId);
      if (!found) return;

      const input = document.getElementById('yt-url-input');
      if (input) {
        input.value = found.youtubeUrl || `https://www.youtube.com/watch?v=${videoId}`;
      }

      this.renderResult({
        success: true,
        videoId: found.videoId,
        title: found.title,
        author: found.author,
        thumbnail: found.thumbnail,
        youtubeUrl: found.youtubeUrl
      }, true);
    },

    backToSearchResults() {
      if (this.lastSearchResults) {
        this.renderSearchResults(this.lastSearchResults);
      }
    },

    renderResult(data, isFromSearch = false) {
      const resultContainer = document.getElementById('yt-result-container');
      if (!resultContainer) return;

      this.currentVideoData = data;

      resultContainer.innerHTML = `
        <div class="yt-preview-card">
          ${isFromSearch ? `
            <div style="margin-bottom: 6px;">
              <button type="button" onclick="YoutubeDownloader.backToSearchResults()" style="background: none; border: none; color: #FF0000; font-size: 12px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; padding: 0;">
                <i data-lucide="arrow-left" style="width: 14px; height: 14px;"></i> Voltar para os resultados da pesquisa
              </button>
            </div>
          ` : ''}

          <div class="yt-preview-header">
            <div class="yt-thumb-wrapper" title="Clique para Ver a Prévia do Vídeo" onclick="YoutubeDownloader.openVideoPreviewModal('${data.videoId}', '${encodeURIComponent(data.title)}')">
              <img src="${data.thumbnail}" class="yt-thumb-img" alt="Thumbnail" />
              <div class="yt-thumb-overlay">
                <i data-lucide="play-circle" style="width: 34px; height: 34px; color: #FFF;"></i>
              </div>
            </div>
            <div class="yt-preview-info">
              <h4 class="yt-video-title" style="cursor: pointer;" onclick="YoutubeDownloader.openVideoPreviewModal('${data.videoId}', '${encodeURIComponent(data.title)}')">${data.title}</h4>
              <p class="yt-video-author"><i data-lucide="user" style="width: 12px; height: 12px; vertical-align: -1px;"></i> ${data.author}</p>
            </div>
          </div>

          <div style="font-size: 13px; font-weight: 600; color: #1C1C1E; margin-top: 6px;">Escolha a Opção de Download Otimizada para o Premiere:</div>

          <div class="yt-format-selector">
            <button type="button" class="yt-format-option" style="border-color: #007AFF; background: rgba(0, 122, 255, 0.08); width: 100%; text-align: left;" onclick="YoutubeDownloader.openVideoPreviewModal('${data.videoId}', '${encodeURIComponent(data.title)}')">
              <div class="yt-format-label">
                <i data-lucide="play-circle" style="width: 20px; height: 20px; color: #007AFF;"></i>
                <div>
                  <div style="color: #007AFF; font-weight: 700;">Ver Prévia do Vídeo HD (Player do Sistema)</div>
                  <div style="font-size: 11px; color: #6E6E73; font-weight: 400;">Assista o vídeo com áudio em HD direto na janela</div>
                </div>
              </div>
              <span class="yt-badge" style="background: #007AFF; color: #fff;">PLAYER</span>
            </button>

            <a href="/api/youtube/stream-download?v=${data.videoId}&type=video&quality=max&title=${encodeURIComponent(data.title)}" class="yt-format-option" style="text-decoration: none;" onclick="YoutubeDownloader.handleNativeDownload(event, this)">
              <div class="yt-format-label">
                <i data-lucide="video" style="width: 20px; height: 20px; color: #FF0000;"></i>
                <div>
                  <div style="font-weight: 700; color: #1C1C1E;">Baixar Vídeo MP4 HD (H.264 / AAC - Premiere Ready)</div>
                  <div style="font-size: 11px; color: #6E6E73; font-weight: 400;">Processado direto com FFmpeg compatível com Adobe Premiere</div>
                </div>
              </div>
              <span class="yt-badge hd">MP4 HD</span>
            </a>

            <a href="/api/youtube/stream-download?v=${data.videoId}&type=audio&title=${encodeURIComponent(data.title)}" class="yt-format-option" style="text-decoration: none;" onclick="YoutubeDownloader.handleNativeDownload(event, this)">
              <div class="yt-format-label">
                <i data-lucide="music" style="width: 20px; height: 20px; color: #34C759;"></i>
                <div>
                  <div style="font-weight: 700; color: #1C1C1E;">Baixar Áudio MP3 320kbps (LAME / 44.1kHz - Premiere Ready)</div>
                  <div style="font-size: 11px; color: #6E6E73; font-weight: 400;">Extração local de alta definição com ID3v2</div>
                </div>
              </div>
              <span class="yt-badge mp3">MP3 320k</span>
            </a>

            <a href="/api/youtube/stream-download?v=${data.videoId}&type=wav&title=${encodeURIComponent(data.title)}" class="yt-format-option" style="text-decoration: none;" onclick="YoutubeDownloader.handleNativeDownload(event, this)">
              <div class="yt-format-label">
                <i data-lucide="disc" style="width: 20px; height: 20px; color: #007AFF;"></i>
                <div>
                  <div style="font-weight: 700; color: #1C1C1E;">Baixar Áudio WAV PCM (Sem Perdas - Premiere Native)</div>
                  <div style="font-size: 11px; color: #6E6E73; font-weight: 400;">Áudio PCM 16-bit 44.1kHz para edição profissional</div>
                </div>
              </div>
              <span class="yt-badge" style="background: #007AFF; color: #fff;">WAV</span>
            </a>

            <a href="/api/youtube/stream-download?v=${data.videoId}&type=video&quality=480&title=${encodeURIComponent(data.title)}" class="yt-format-option" style="text-decoration: none;" onclick="YoutubeDownloader.handleNativeDownload(event, this)">
              <div class="yt-format-label">
                <i data-lucide="zap" style="width: 20px; height: 20px; color: #FF9500;"></i>
                <div>
                  <div style="font-weight: 700; color: #1C1C1E;">Baixar Vídeo MP4 (Qualidade Média 480p)</div>
                  <div style="font-size: 11px; color: #6E6E73; font-weight: 400;">Processamento rápido local</div>
                </div>
              </div>
              <span class="yt-badge" style="background: #FF9500;">SD</span>
            </a>
          </div>
        </div>
      `;

      resultContainer.style.display = 'block';
      if (typeof lucide !== 'undefined' && lucide.createIcons) {
        lucide.createIcons();
      }
    },

    handleNativeDownload(e, element) {
      e.preventDefault();
      const url = element.href;
      const titleEl = element.querySelector('div > div:first-child');
      const subtitleEl = element.querySelector('div > div:nth-child(2)');
      const originalText = titleEl ? titleEl.textContent : '';
      const originalSub = subtitleEl ? subtitleEl.textContent : '';

      document.querySelectorAll('.yt-format-option').forEach(btn => {
        btn.style.pointerEvents = 'none';
        btn.style.opacity = '0.5';
      });
      element.style.opacity = '1';
      element.style.border = '2px solid #34C759';

      if (titleEl) titleEl.innerHTML = '<i data-lucide="loader-2" style="width: 16px; height: 16px; animation: spin 0.8s linear infinite;"></i> Baixando do YouTube...';
      if (subtitleEl) subtitleEl.textContent = 'O servidor está processando o arquivo para o Premiere Pro';
      if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();

      fetch(url)
        .then(async response => {
          if (!response.ok) {
            let errorMsg = 'Erro no servidor (' + response.status + ')';
            try {
              const errData = await response.json();
              if (errData && errData.error) errorMsg = errData.error;
            } catch (e) {}
            throw new Error(errorMsg);
          }

          const contentType = response.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const errData = await response.json();
            throw new Error(errData.error || 'Servidor retornou uma resposta inválida');
          }

          const contentLength = response.headers.get('content-length');
          const total = contentLength ? parseInt(contentLength) : 0;
          let loaded = 0;
          const reader = response.body.getReader();
          const chunks = [];

          function pump() {
            return reader.read().then(({ done, value }) => {
              if (done) {
                const params = new URL(url, window.location.origin).searchParams;
                const type = params.get('type') || 'video';
                let mime = 'video/mp4';
                if (type === 'wav') mime = 'audio/wav';
                else if (type === 'audio') mime = 'audio/mpeg';

                return new Blob(chunks, { type: mime });
              }
              chunks.push(value);
              loaded += value.length;
              if (total && titleEl) {
                const pct = Math.round((loaded / total) * 100);
                const mb = (loaded / 1024 / 1024).toFixed(1);
                titleEl.innerHTML = `<i data-lucide="download" style="width: 16px; height: 16px;"></i> Baixando... ${pct}% (${mb} MB)`;
                if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
              }
              return pump();
            });
          }

          return pump();
        })
        .then(blob => {
          const params = new URL(url, window.location.origin).searchParams;
          const type = params.get('type') || 'video';
          const videoId = params.get('v') || 'video';
          const title = params.get('title') || `youtube_${videoId}`;
          const ext = type === 'wav' ? 'wav' : (type === 'audio' ? 'mp3' : 'mp4');
          
          const cleanTitle = decodeURIComponent(title)
            .replace(/[\\\/\?\:\*\"\<\|\>]/g, '_')
            .replace(/\s+/g, ' ')
            .trim();
          const filename = `${cleanTitle}.${ext}`;

          const blobUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(blobUrl);

          if (titleEl) titleEl.innerHTML = '<i data-lucide="check-circle" style="width: 16px; height: 16px; color: #34C759;"></i> Download concluído!';
          if (subtitleEl) subtitleEl.textContent = `Arquivo salvo: ${filename} (${(blob.size / 1024 / 1024).toFixed(1)} MB)`;
          element.style.border = '2px solid #34C759';
          element.style.background = 'rgba(52, 199, 89, 0.08)';
          if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
        })
        .catch(err => {
          console.error('Download error:', err);
          if (titleEl) titleEl.innerHTML = '<i data-lucide="alert-triangle" style="width: 16px; height: 16px; color: #FF3B30;"></i> Erro no download';
          if (subtitleEl) subtitleEl.textContent = err.message || 'Tente novamente';
          element.style.border = '2px solid #FF3B30';
          if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
        })
        .finally(() => {
          setTimeout(() => {
            document.querySelectorAll('.yt-format-option').forEach(btn => {
              btn.style.pointerEvents = '';
              btn.style.opacity = '1';
              btn.style.border = '';
              btn.style.background = '';
            });
            if (titleEl) titleEl.textContent = originalText;
            if (subtitleEl) subtitleEl.textContent = originalSub;
          }, 4000);
        });
    }
  };

  window.YoutubeDownloader = YoutubeDownloader;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => YoutubeDownloader.init());
  } else {
    YoutubeDownloader.init();
  }
})();
