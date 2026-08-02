/**
 * Rastreamento Component - BRAGO Sistema Padeiro
 * Admin real-time map dashboard
 */
window.Rastreamento = {
  map: null,
  markers: {},
  trailLayers: null,
  selectedUserId: null,
  socket: null,
  allPadeiros: [],
  liveTrailPoints: {},
  _livePolyline: null,

  async render() {
    if (this.bcpInterval) clearInterval(this.bcpInterval);
    const container = document.getElementById('page-container');
    
    // Fetch all active products to populate select dropdown
    let padeiros = [];
    try {
      const allProds = await API.get('/api/produtos');
      padeiros = allProds.map(p => ({
        ...p,
        nome: p.descricao,
        codTec: p.codigo,
        filial: p.fornecedor || 'Sem Fornecedor'
      }));
      this.allPadeiros = padeiros;
    } catch (e) {
      console.error('Erro ao buscar produtos:', e);
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const dateFormatter = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const dataFormatada = dateFormatter.format(new Date());

    container.innerHTML = `
      <style>
      /* macOS HIG Rastreamento Reset & Variables */
      .mac-rastreamento-root {
        --mac-window-bg: #FFFFFF;
        --mac-sidebar-bg: rgba(246,246,246,0.9);
        --mac-toolbar-bg: rgba(255,255,255,0.72);
        --mac-accent: var(--primary);
        --mac-destructive: #FF3B30;
        --mac-success: #34C759;
        --mac-label: #000000;
        --mac-secondary: #3C3C43;
        --mac-tertiary: #C7C7CC;
        --mac-border: rgba(0,0,0,0.08);
        --mac-input-border: rgba(0,0,0,0.15);
        --mac-hover: rgba(0,0,0,0.04);
        --mac-selected-bg: rgba(229, 90, 43, 0.12);

        font-family: -apple-system, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', sans-serif;
        flex: 1;
        width: 100%;
        display: flex;
        flex-direction: column;
        background: var(--mac-window-bg);
      }

      @media (prefers-color-scheme: dark) {
        .mac-rastreamento-root {
          --mac-window-bg: #1E1E1E;
          --mac-sidebar-bg: rgba(30,30,30,0.9);
          --mac-toolbar-bg: rgba(40,40,40,0.72);
          --mac-accent: var(--primary);
          --mac-destructive: #FF453A;
          --mac-success: #32D74B;
          --mac-label: #FFFFFF;
          --mac-secondary: rgba(235, 235, 245, 0.6);
          --mac-tertiary: rgba(235, 235, 245, 0.3);
          --mac-border: rgba(255,255,255,0.1);
          --mac-input-border: rgba(255,255,255,0.15);
          --mac-hover: rgba(255,255,255,0.05);
          --mac-selected-bg: rgba(229, 90, 43, 0.15);
        }
      }

      .mac-layout { position: relative; display: flex; flex: 1; width: 100%; overflow: hidden; }
      .mac-mobile-block { display: none !important; }

      /* Reconstrução da Aba Rastreamento para Mobile (Mantendo o Desktop macOS idêntico) */
      @media (max-width: 1023px) {
        .mac-rastreamento-root {
          width: 100% !important;
          box-sizing: border-box !important;
          overflow-x: hidden !important;
        }
        .mac-layout {
          flex-direction: column;
          overflow: visible !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }
        .mac-sidebar {
          order: 3;
          position: relative !important;
          width: 100% !important;
          height: auto !important;
          background: var(--bg-card) !important;
          border: 1px solid var(--separator) !important;
          border-radius: var(--radius-md) !important;
          box-shadow: var(--shadow-md) !important;
          margin-top: 20px !important;
          padding: 16px !important;
          box-sizing: border-box !important;
          left: 0 !important;
          top: 0 !important;
          bottom: auto !important;
        }
        .mac-sidebar-header {
          padding: 0 0 12px 0 !important;
        }
        .mac-sidebar-title {
          font-size: 14px !important;
          color: var(--text-primary) !important;
          text-transform: none !important;
          letter-spacing: normal !important;
        }
        .mac-sidebar-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .mac-track-item {
          height: auto !important;
          padding: 12px !important;
          margin: 0 !important;
          border-radius: var(--radius-md) !important;
          border: 1px solid var(--separator) !important;
          background: var(--bg-card) !important;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: var(--text-primary) !important;
          box-sizing: border-box !important;
        }
        .mac-avatar {
          width: 36px !important;
          height: 36px !important;
          font-size: 14px !important;
        }
        .mac-track-name {
          font-size: 14px !important;
          font-weight: 600 !important;
          color: var(--text-primary) !important;
          white-space: normal !important;
          overflow: visible !important;
          text-overflow: clip !important;
          margin-left: 10px;
        }
        .mac-track-status {
          margin-left: auto;
          margin-right: 12px;
        }
        .mac-main-content {
          order: 1;
          flex: none !important;
          width: 100% !important;
          display: flex;
          flex-direction: column;
          background: transparent !important;
          overflow: visible !important;
          box-sizing: border-box !important;
        }
        .mac-page-header {
          padding: 0 0 16px 0 !important;
          background: transparent !important;
        }
        .mac-page-title {
          font-size: 28px !important;
          font-weight: 700 !important;
          color: var(--text-primary) !important;
        }
        .mac-page-subtitle {
          display: block !important;
          font-size: 13px !important;
          color: var(--text-secondary) !important;
        }
        .mac-page-header-right {
          display: none !important;
        }
        .mac-toolbar {
          height: auto !important;
          width: 100% !important;
          background: var(--bg-card) !important;
          padding: 16px !important;
          border-radius: var(--radius-md) !important;
          border: 1px solid var(--separator) !important;
          box-shadow: var(--shadow-md) !important;
          margin-bottom: 20px !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: stretch !important;
          gap: 12px !important;
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
          overflow-x: visible !important;
          box-sizing: border-box !important;
        }
        .mac-toolbar-group {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          width: 100%;
          box-sizing: border-box;
        }
        .mac-label {
          font-size: 11px !important;
          color: var(--text-tertiary) !important;
          font-weight: 600 !important;
        }
        .mac-select, .mac-input {
          width: 60% !important;
          height: 36px !important;
          border: 1px solid var(--separator) !important;
          border-radius: var(--radius-sm) !important;
          background: var(--bg-card) !important;
          color: var(--text-main) !important;
          box-sizing: border-box !important;
        }
        .mac-separator {
          display: none !important;
        }
        .mac-toolbar-actions {
          margin-left: 0 !important;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          width: 100%;
          box-sizing: border-box;
        }
        .mac-btn {
          flex: 1;
          min-width: 100px;
          height: 36px !important;
          border-radius: var(--radius-sm) !important;
          font-size: 14px !important;
          font-weight: 600 !important;
        }
        .mac-btn-primary {
          background: var(--primary) !important;
          color: white !important;
        }
        .mac-btn-borderless {
          background: var(--bg-input) !important;
          color: var(--text-secondary) !important;
        }
        .mac-btn-destructive {
          background: var(--danger-light) !important;
          color: var(--danger) !important;
        }
        .mac-map-container {
          width: 100% !important;
          background: var(--bg-card) !important;
          border-radius: 16px !important;
          overflow: hidden !important;
          box-shadow: var(--shadow-lg) !important;
          height: 450px !important;
          flex: none !important;
          display: flex;
          flex-direction: column;
          box-sizing: border-box !important;
        }
        #tracking-map {
          height: 100% !important;
        }
        .mac-timeline-container {
          padding: 16px;
        }
        .sidebar-filial-header {
          margin: 16px 0 8px !important;
        }
      }

      .sidebar-filial-header {
        margin: 16px 16px 8px;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      /* Sidebar */
      .mac-sidebar {
        position: absolute;
        top: 20px;
        left: 20px;
        bottom: 20px;
        width: 380px;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border-radius: 16px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.15);
        display: flex;
        flex-direction: column;
        z-index: 1010;
        border: 1px solid var(--mac-border);
      }

      .mac-sidebar-header { padding: 24px 24px 16px; }
      .mac-sidebar-title {
        font-size: 18px; font-weight: 700; color: var(--mac-label); margin: 0;
      }

      .mac-sidebar-list { flex: 1; overflow-y: auto; padding-bottom: 20px; }
      .mac-sidebar-list::-webkit-scrollbar { width: 6px; }
      .mac-sidebar-list::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 3px; }

      /* Mobile original list item */
      .mac-track-item:not(.desktop-track-item) {
        height: 52px; padding: 0 12px; margin: 0 8px; border-radius: 6px;
        display: flex; align-items: center; gap: 10px;
        cursor: pointer; transition: background-color 120ms ease;
        color: var(--mac-label);
      }
      .mac-track-item:not(.desktop-track-item):hover { background: var(--mac-hover); }
      .mac-track-item:not(.desktop-track-item).selected { background: var(--mac-selected-bg); }
      .mac-track-item:not(.desktop-track-item).selected .mac-track-name { font-weight: 600; }

      /* Desktop Card Item */
      .desktop-track-item {
        margin: 0 16px 16px;
        padding: 20px;
        border-radius: 20px;
        background: #FFFFFF;
        border: 1px solid var(--mac-border);
        cursor: pointer;
        transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        height: 80px; /* Collapsed */
        box-sizing: border-box;
      }
      .desktop-track-item:hover { background: #F8F9FA; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
      
      .desktop-track-item.expanded {
        height: 250px; /* Expanded */
        background: linear-gradient(135deg, var(--mac-accent) 0%, var(--primary-dark) 100%);
        color: #FFF;
        box-shadow: 0 12px 30px rgba(229, 90, 43, 0.3);
        border: none;
      }

      .track-item-header { display: flex; justify-content: space-between; align-items: flex-start; width: 100%; }
      .track-item-title-group { display: flex; flex-direction: column; gap: 4px; }
      .track-item-title { font-size: 15px; font-weight: 700; color: var(--mac-label); transition: color 0.3s; }
      .desktop-track-item.expanded .track-item-title { color: #FFF; }
      .track-item-subtitle { font-size: 12px; color: var(--mac-tertiary); font-weight: 500; transition: color 0.3s; }
      .desktop-track-item.expanded .track-item-subtitle { color: rgba(255,255,255,0.7); }
      
      .filial-name-highlight { color: var(--mac-accent); font-weight: 600; transition: color 0.3s; }
      .desktop-track-item.expanded .filial-name-highlight { color: rgba(255,255,255,0.9); }
      
      .track-item-badge { background: var(--mac-accent); color: #FFF; font-size: 10px; font-weight: 800; padding: 6px 12px; border-radius: 12px; letter-spacing: 0.5px; transition: all 0.3s; }
      .desktop-track-item.expanded .track-item-badge { background: #FFF; color: var(--mac-accent); }
      .desktop-track-item.expanded .track-item-badge.online { background: #FFF !important; color: var(--mac-success) !important; }
      .desktop-track-item.expanded .track-item-badge.offline { background: rgba(255, 255, 255, 0.2) !important; color: #FFF !important; }
      
      .track-item-details { margin-top: 16px; opacity: 0; transition: opacity 0.3s, transform 0.3s; transform: translateY(10px); display: none; flex-direction: column; }
      .desktop-track-item.expanded .track-item-details { opacity: 1; transform: translateY(0); display: flex; }
      
      .track-progress-container { margin-bottom: 16px; }
      .track-progress-label { font-size: 13px; font-weight: 700; color: #FFF; margin-bottom: 8px; display: block; }
      .track-progress-bar { height: 3px; background: rgba(255,255,255,0.3); border-radius: 2px; width: 100%; overflow: hidden; }
      .track-progress-fill { height: 100%; background: #FFF; border-radius: 2px; transition: width 1s ease; }
      
      .track-info-grid { display: grid; grid-template-columns: 1.8fr 1fr 1.2fr; gap: 8px; margin-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 16px; }
      .track-info-col { display: flex; flex-direction: column; gap: 4px; }
      .track-info-label { font-size: 10px; color: rgba(255,255,255,0.7); text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px; }
      .track-info-value { font-size: 13px; font-weight: 700; color: #FFF; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      
      .track-driver-footer { display: flex; align-items: center; gap: 12px; }
      .track-driver-info { flex: 1; display: flex; flex-direction: column; }
      .track-driver-name { font-size: 14px; font-weight: 700; color: #FFF; }
      .track-driver-role { font-size: 12px; color: rgba(255,255,255,0.7); font-weight: 500;}
      
      .track-driver-actions { display: flex; gap: 10px; }
      .track-action-btn { width: 34px; height: 34px; border-radius: 50%; background: #FFF; border: none; color: var(--mac-accent); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.2s; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
      .track-action-btn:hover { background: #F0F0F0; }
      .track-action-btn i { width: 16px; height: 16px; }

      .mac-avatar {
        width: 32px; height: 32px; border-radius: 50%; display: flex;
        align-items: center; justify-content: center;
        color: #fff; font-size: 13px; font-weight: 500;
        flex-shrink: 0;
      }

      .mac-track-name { font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; }
      .mac-track-status { position: relative; width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
      .mac-track-status.active { background: var(--mac-success); animation: pulseMac 2s infinite; }
      .mac-track-status.inactive { background: var(--mac-tertiary); }
      .mac-track-icon { color: var(--mac-accent); display: flex; align-items: center; }

      @keyframes pulseMac {
        0% { box-shadow: 0 0 0 0 rgba(52, 199, 89, 0.5); }
        70% { box-shadow: 0 0 0 6px rgba(52, 199, 89, 0); }
        100% { box-shadow: 0 0 0 0 rgba(52, 199, 89, 0); }
      }
      
      /* Bottom Client Panel */
      .bottom-client-panel {
        position: absolute;
        bottom: 30px;
        right: 30px; /* Align to right side */
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.12);
        border: 1px solid var(--mac-border);
        padding: 20px 24px;
        z-index: 1010;
        display: none;
        flex-direction: column;
        transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s;
        transform: translateY(20px);
        opacity: 0;
        width: max-content;
        max-width: calc(100% - 440px); /* Evita sobrepor a sidebar */
      }
      .bottom-client-panel.visible {
        display: flex;
        transform: translateY(0);
        opacity: 1;
      }
      @media (max-width: 1023px) {
        .bottom-client-panel { display: none !important; }
      }
      
      .bcp-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
      .bcp-title { font-size: 16px; font-weight: 800; color: var(--mac-label); margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .bcp-badge { background: var(--mac-accent); color: #FFF; font-size: 10px; font-weight: 800; padding: 4px 10px; border-radius: 10px; letter-spacing: 0.5px; flex-shrink: 0; }
      
      .bcp-grid { display: flex; gap: 24px; flex-wrap: wrap; }
      .bcp-col { display: flex; flex-direction: column; gap: 6px; }
      .bcp-label { font-size: 10px; color: var(--mac-secondary); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
      .bcp-value { font-size: 13px; font-weight: 800; color: var(--mac-label); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 250px; }

      /* Main Content */
      .mac-main-content {
        flex: 1; position: relative; display: flex; flex-direction: column; background: var(--mac-window-bg); overflow: hidden;
      }

      /* Page Header */
      .mac-page-header {
        display: flex; align-items: flex-start; justify-content: space-between;
        padding: 20px 24px 16px; background: var(--mac-window-bg); flex-shrink: 0;
      }
      .mac-page-title { font-size: 28px; font-weight: 700; color: var(--mac-label); margin: 0; font-family: 'SF Pro Display', sans-serif; letter-spacing: 0.3px; }
      .mac-page-subtitle { font-size: 13px; color: var(--mac-secondary); margin-top: 4px; }
      .mac-page-header-right { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
      .mac-page-date { font-size: 13px; color: var(--mac-secondary); font-weight: 400; }

      /* Toolbar */
      .mac-toolbar {
        height: 52px; background: var(--mac-toolbar-bg); backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px); border-bottom: 1px solid var(--mac-border);
        display: flex; align-items: center; padding: 0 16px; flex-shrink: 0;
        z-index: 1000; gap: 4px; overflow-x: auto;
      }

      .mac-toolbar-group { display: flex; align-items: center; gap: 6px; }
      .mac-separator { width: 1px; height: 20px; background: var(--mac-border); margin: 0 8px; flex-shrink: 0; }
      .mac-label { font-size: 11px; color: var(--mac-secondary); text-transform: uppercase; letter-spacing: 0.3px; white-space: nowrap; }

      .mac-input, .mac-select {
        height: 28px; border: 1px solid var(--mac-input-border); border-radius: 6px;
        background: var(--mac-window-bg); color: var(--mac-label); font-family: inherit; font-size: 13px;
        padding: 0 6px; outline: none; box-shadow: 0 1px 2px rgba(0,0,0,0.02);
      }
      .mac-select { width: 110px; }
      .mac-input[type="date"] { width: 120px; }
      .mac-input[type="time"] { width: 68px; }
      .mac-input:focus, .mac-select:focus { outline: 2px solid var(--mac-accent); outline-offset: -1px; }
      .mac-select { padding-right: 20px; appearance: none; background-image: url('data:image/svg+xml;utf8,<svg fill="%23999" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>'); background-repeat: no-repeat; background-position: right center; background-size: 14px; }
      @media (prefers-color-scheme: dark) { .mac-input, .mac-select { background: rgba(0,0,0,0.2); } }

      .mac-toolbar-actions { display: flex; align-items: center; gap: 6px; margin-left: auto; flex-shrink: 0; }
      .mac-btn {
        height: 28px; border-radius: 6px; font-family: inherit; font-size: 12px; font-weight: 500;
        display: inline-flex; align-items: center; justify-content: center; gap: 4px; cursor: pointer;
        border: none; outline: none; padding: 0 10px; white-space: nowrap;
      }
      .mac-btn:focus-visible { outline: 2px solid var(--mac-accent); }
      .mac-btn i { width: 13px; height: 13px; }
      
      .mac-btn-primary { background: var(--mac-accent); color: #FFF; font-weight: 600; transition: transform 100ms cubic-bezier(0.175, 0.885, 0.32, 1.275); }
      .mac-btn-primary:active { transform: scale(0.97); }
      
      .mac-btn-borderless { background: transparent; color: var(--mac-secondary); padding: 0 6px; }
      .mac-btn-borderless:hover { background: var(--mac-hover); color: var(--mac-label); }
      
      .mac-btn-destructive { background: transparent; color: var(--mac-destructive); padding: 0 6px; }
      .mac-btn-destructive:hover { background: rgba(255,59,48,0.1); }

      /* Map Container */
      .mac-map-container { flex: 1; width: 100%; background: #e5e5ea; z-index: 1; }
      .leaflet-control-zoom { border: 1px solid var(--mac-border) !important; border-radius: 6px !important; box-shadow: 0 1px 4px rgba(0,0,0,0.2) !important; margin-left: 16px !important; margin-bottom: 38px !important; }
      .leaflet-control-zoom a { width: 28px !important; height: 28px !important; line-height: 28px !important; font-family: inherit !important; font-size: 14px !important; font-weight: 500 !important; color: var(--mac-label) !important; background: var(--mac-window-bg) !important; }

      /* Status Badge */
      .mac-status-badge {
        background: var(--mac-window-bg); color: var(--mac-label); font-size: 11px; font-weight: 500;
        padding: 4px 10px; border-radius: 12px; display: inline-flex; align-items: center; gap: 6px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.08); border: 1px solid var(--mac-border); transition: opacity 0.3s;
      }
      .mac-status-badge.connected .mac-status-dot { background: var(--mac-success); width: 6px; height: 6px; border-radius: 50%; display: inline-block; animation: pulseMac 2s infinite; }
      .mac-status-badge.disconnected .mac-status-dot { background: var(--mac-tertiary); width: 6px; height: 6px; border-radius: 50%; display: inline-block; animation: none; }
      .mac-status-dot { width: 6px; height: 6px; border-radius: 50%; display: inline-block; }

      /* Status Bar (Footer) */
      .mac-map-footer { position: absolute; bottom: 0; left: 0; right: 0; height: 22px; background: rgba(255,255,255,0.85); backdrop-filter: blur(10px); z-index: 900; display: flex; align-items: center; justify-content: space-between; padding: 0 16px; font-size: 11px; color: var(--mac-tertiary); border-top: 1px solid var(--mac-border); }
      @media (prefers-color-scheme: dark) { .mac-map-footer { background: rgba(30,30,30,0.85); } }
      .mac-footer-left { color: var(--mac-secondary); }

      /* Sub-Tabs */
      .mac-view-tabs { display: flex; gap: 8px; align-items: center; }
      .mac-view-tab { padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; border: 1px solid transparent; background: transparent; color: var(--mac-secondary); transition: all 0.2s; }
      .mac-view-tab.active { background: var(--mac-accent); color: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
      .mac-view-tab:not(.active):hover { background: var(--mac-hover); color: var(--mac-label); }

      /* Timeline UI Mercado Livre style */
      .mac-timeline-container { flex: 1; overflow-y: auto; background: var(--mac-window-bg); padding: 24px; display: none; }
      .mac-timeline-container.active { display: block; }

      .ml-timeline { position: relative; margin-left: 12px; padding-left: 24px; border-left: 2px solid var(--mac-border); }
      .ml-timeline-item { position: relative; margin-bottom: 24px; }
      .ml-timeline-dot { position: absolute; left: -31px; top: 0; width: 14px; height: 14px; border-radius: 50%; background: #10b981; border: 3px solid var(--mac-window-bg); box-shadow: 0 0 0 1px var(--mac-border); }
      .ml-timeline-time { font-size: 11px; color: var(--mac-tertiary); margin-bottom: 4px; font-weight: 500; }
      .ml-timeline-title { font-size: 14px; font-weight: 600; color: var(--mac-label); }
      .ml-timeline-map-btn { font-size: 11px; color: var(--mac-accent); cursor: pointer; border: none; background: none; padding: 0; margin-top: 4px; display: inline-flex; align-items: center; gap: 4px; font-weight: 500; }
      .ml-timeline-map-btn:hover { text-decoration: underline; }
      .ml-timeline-activity-card { background: var(--mac-window-bg); border: 1px solid var(--mac-border); border-radius: 8px; padding: 16px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
      .ml-timeline-activity-title { font-size: 15px; font-weight: 600; margin-bottom: 20px; color: var(--mac-label); display: flex; align-items: center; gap: 8px; padding-bottom: 12px; border-bottom: 1px solid var(--mac-border); }
      @media (min-width: 1024px) {
        .mac-page-header {
          display: none !important;
        }
        .mac-toolbar {
          display: none !important;
        }
      }
      
      /* Floating Map Actions (Top Right) */
      .mac-map-floating-actions {
        position: absolute;
        top: 20px;
        right: 20px;
        display: flex;
        gap: 12px;
        z-index: 1010;
      }
      .mac-floating-btn {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid var(--mac-border);
        color: var(--mac-label);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
        transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        padding: 0;
        outline: none;
      }
      .mac-floating-btn:hover {
        background: #FFFFFF;
        color: var(--mac-accent);
        transform: scale(1.08) translateY(-2px);
        box-shadow: 0 12px 24px rgba(0, 0, 0, 0.18);
        border-color: rgba(0, 122, 255, 0.3);
      }
      .mac-floating-btn:active {
        transform: scale(0.98) translateY(0);
      }
      .mac-floating-btn i {
        width: 18px;
        height: 18px;
      }

      /* Dark mode override */
      @media (prefers-color-scheme: dark) {
        .mac-floating-btn {
          background: rgba(30, 30, 30, 0.9);
          border-color: rgba(255, 255, 255, 0.15);
          color: #FFFFFF;
        }
        .mac-floating-btn:hover {
          background: #2D2D2D;
          color: var(--mac-accent);
          border-color: rgba(10, 132, 255, 0.3);
        }
      }

      /* Price markers and OSM geocoding search styling */
      .leaflet-div-icon.mp-price-marker-container {
        border: none !important;
        background: transparent !important;
      }
      .mp-price-marker-container {
        border: none !important;
        background: transparent !important;
      }
      .mp-price-marker {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 120px;
        height: 70px;
        position: absolute;
        top: 0;
        left: 0;
        transform: scale(clamp(0.45, calc(1 + (var(--map-zoom, 12) - 12) * 0.12), 1.6));
        transform-origin: 50% 50%; /* Matches Leaflet's iconAnchor [60, 35] */
        pointer-events: auto;
        transition: transform 0.15s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .mp-price-pill {
        background-color: var(--primary, #E55A2B);
        color: #FFFFFF;
        font-weight: 700;
        font-size: 13px;
        padding: 5px 10px;
        border-radius: 20px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.18);
        border: 2px solid #FFFFFF;
        white-space: nowrap;
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        text-shadow: 0 1px 1px rgba(0,0,0,0.1);
      }
      .mp-price-marker.selected .mp-price-pill {
        background-color: #C8461B;
        transform: scale(1.12);
        box-shadow: 0 6px 14px rgba(229, 90, 43, 0.35);
      }
      .mp-price-marker:hover .mp-price-pill {
        transform: scale(1.1);
        background-color: #C8461B;
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.22);
      }
      .mp-price-store {
        background-color: rgba(255, 255, 255, 0.95);
        color: #1C1A14;
        font-size: 10px;
        font-weight: 700;
        padding: 2px 6px;
        border-radius: 4px;
        margin-top: 4px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        white-space: nowrap;
        border: 1px solid var(--mac-border, #E5E5EA);
        max-width: 120px;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      @media (prefers-color-scheme: dark) {
        .mp-price-store {
          background-color: rgba(30, 30, 30, 0.95);
          color: #FFFFFF;
          border-color: rgba(255,255,255,0.1);
        }
      }
      .tracking-search-overlay {
        position: absolute;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 1000;
        pointer-events: none;
      }
      .tracking-search-pill {
        background: rgba(255, 255, 255, 0.95);
        border: 1px solid var(--mac-border);
        color: #3C3C43;
        font-size: 12px;
        font-weight: 600;
        padding: 8px 16px;
        border-radius: 20px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 8px;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }
      @media (prefers-color-scheme: dark) {
        .tracking-search-pill {
          background: rgba(30, 30, 30, 0.95);
          border-color: rgba(255,255,255,0.1);
          color: #FFFFFF;
        }
      }
      .tracking-search-spinner {
        width: 14px;
        height: 14px;
        border: 2px solid var(--primary);
        border-top-color: transparent;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      @keyframes slideDown {
        from { transform: translateY(-20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      }
      </style>

      <div class="mac-rastreamento-root fade-in">
        
        <!-- Desktop App -->
        <div class="mac-layout">
          <!-- Sidebar -->
          <aside class="mac-sidebar">
            <header class="mac-sidebar-header" style="display: flex; flex-direction: column; gap: 10px;">
              <h2 class="mac-sidebar-title">Produtos</h2>
              <div id="sidebar-search-container" style="display: none; width: 100%;">
                <div style="position: relative; width: 100%;">
                  <input type="text" id="sidebar-search-input" placeholder="Buscar por nome ou fornecedor..." oninput="Rastreamento.filterBakers(this.value)" style="width: 100%; height: 34px; padding: 0 12px 0 34px; border-radius: 8px; border: 1px solid var(--mac-border); background: var(--mac-hover); color: var(--mac-label); font-size: 13px; outline: none; box-sizing: border-box;" />
                  <i data-lucide="search" style="position: absolute; left: 10px; top: 9px; width: 16px; height: 16px; color: var(--mac-tertiary);"></i>
                </div>
              </div>
            </header>
            <div id="active-track-list" class="mac-sidebar-list">
              <div style="padding: 12px 20px; font-size: 13px; color: var(--mac-tertiary);">Aguardando sinais...</div>
            </div>
          </aside>
          
          <!-- Main Area -->
          <main class="mac-main-content">
            
            <!-- Page Header -->
            <div class="mac-page-header">
               <div class="mac-page-header-left">
                 <div class="mac-page-subtitle">Monitoramento GPS em tempo real e histórico de trajetos</div>
               </div>
               <div class="mac-page-header-right">
                 <div class="mac-page-date">${dataFormatada}</div>
                 <div id="tracking-status" class="mac-status-badge connected">
                   <span class="mac-status-dot"></span> <span>Servidor Conectado</span>
                 </div>
               </div>
            </div>

            <!-- Toolbar -->
            <div class="mac-toolbar">
               <div class="mac-toolbar-group">
                  <label for="trail-user-select" class="mac-label">Produto:</label>
                  <select id="trail-user-select" class="mac-select" onchange="Rastreamento.onUserSelectChange(this.value)" tabindex="1">
                     <option value="">Selecione...</option>
                     ${padeiros.map(p => `<option value="${p.id}">${p.nome}</option>`).join('')}
                  </select>
               </div>
               
               <div class="mac-separator"></div>
               
               <div class="mac-toolbar-group">
                  <label for="trail-date" class="mac-label">Data:</label>
                  <input type="date" id="trail-date" class="mac-input" value="${todayStr}" onchange="Rastreamento.onDateChange()" tabindex="2">
               </div>

               <div class="mac-separator"></div>
               
               <div class="mac-toolbar-group">
                  <label for="trail-start-time" class="mac-label" title="Início">De:</label>
                  <input type="time" id="trail-start-time" class="mac-input" value="00:00" onchange="Rastreamento.onTimeChange()" tabindex="3">
               </div>
               <div class="mac-toolbar-group" style="margin-right: 0;">
                  <label for="trail-end-time" class="mac-label" title="Fim">Até:</label>
                  <input type="time" id="trail-end-time" class="mac-input" value="23:59" onchange="Rastreamento.onTimeChange()" tabindex="4">
               </div>
               
               <div class="mac-toolbar-actions">
                  <button class="mac-btn mac-btn-primary" id="btn-load-trail" onclick="Rastreamento.loadTrail()" tabindex="5" title="Carregar Trajeto (⌘R)">Carregar</button>
                  <button class="mac-btn mac-btn-borderless" onclick="Rastreamento.clearTrail()" tabindex="6" title="Limpar Mapa (⌘L)"><i data-lucide="x"></i> Limpar</button>
                  ${API.getUser().role === 'admin' ? `
                    <div class="mac-separator" style="margin-left: 2px; margin-right: 2px;"></div>
                    <button class="mac-btn mac-btn-destructive" onclick="Rastreamento.resetUserTracking()" tabindex="7" title="Resetar Histórico (⌘⌫)"><i data-lucide="trash-2"></i></button>
                  ` : ''}
               </div>
            </div>
            
            <!-- Map Area -->
            <div id="view-mapa" class="mac-map-container" style="display:flex; flex-direction:column; position: relative;">
               <!-- Floating Map Actions (Top Right) -->
               <div class="mac-map-floating-actions">
                 <button class="mac-floating-btn" onclick="Rastreamento.toggleSearch()" title="Buscar Padeiro">
                   <i data-lucide="search"></i>
                 </button>
                 <button class="mac-floating-btn" onclick="Rastreamento.recenterMap()" title="Centralizar Mapa">
                   <i data-lucide="target"></i>
                 </button>
               </div>
               
               <div id="tracking-map" style="flex:1;"></div>
               
               <!-- Bottom Floating Client Panel -->
               <div id="bottom-client-panel" class="bottom-client-panel">
                 <div class="bcp-header">
                   <h3 class="bcp-title" id="bcp-main-title">Produto Selecionado</h3>
                   <span class="bcp-badge">EM ESTOQUE</span>
                 </div>
                 <div class="bcp-grid">
                   <div class="bcp-col">
                     <span class="bcp-label">Fornecedor</span>
                     <span class="bcp-value" id="bcp-cliente">Aguardando...</span>
                   </div>
                   <div class="bcp-col">
                     <span class="bcp-label">Unidade</span>
                     <span class="bcp-value" id="bcp-destino">Não info.</span>
                   </div>
                   <div class="bcp-col">
                     <span class="bcp-label">Preço</span>
                     <span class="bcp-value" id="bcp-local">Buscando...</span>
                   </div>
                   <div class="bcp-col">
                     <span class="bcp-label">Estoque</span>
                     <span class="bcp-value" id="bcp-etapa">--</span>
                   </div>
                   <div class="bcp-col">
                     <span class="bcp-label">Status</span>
                     <span class="bcp-value" id="bcp-restante">--</span>
                   </div>
                 </div>
               </div>

               <div class="mac-map-footer" style="position:relative;">
                 <div id="trail-info" class="mac-footer-left"></div>
                 <div class="mac-footer-right">Leaflet | © OpenStreetMap</div>
               </div>
            </div>
            
          </main>
        </div>

        <!-- Mobile Block (Hidden) -->
        <div class="mac-mobile-block">
          <i data-lucide="monitor" style="width: 48px; height: 48px; margin-bottom: 16px;"></i>
          <h3>Uso Exclusivo Desktop</h3>
          <p>O painel de rastreamento avançado requer uma resolução mínima de 1280px para visualização correta do mapa e controles.</p>
        </div>

      </div>
    `;

    // Wait for DOM
    setTimeout(() => {
      const topHeader = document.querySelector('.top-header');
      const pageContent = document.getElementById('page-container');
      
      if (window.innerWidth >= 1024) {
        if (topHeader) topHeader.style.setProperty('display', 'none', 'important');
        if (pageContent) {
          pageContent.style.setProperty('padding', '0', 'important');
          pageContent.style.setProperty('overflow', 'hidden', 'important');
          pageContent.style.setProperty('display', 'flex', 'important');
          pageContent.style.setProperty('flex-direction', 'column', 'important');
        }
      } else {
        if (topHeader) topHeader.style.removeProperty('display');
        if (pageContent) {
          pageContent.style.removeProperty('padding');
          pageContent.style.removeProperty('overflow');
          pageContent.style.removeProperty('display');
          pageContent.style.removeProperty('flex-direction');
        }
      }

      lucide.createIcons();
      this.initMap();
      this.updateList([]); // Initially populate sidebar with offline bakers
      this.initSocket();
      
      // Forçar atualização do tamanho do mapa após transição do flexbox
      setTimeout(() => {
        if (this.map) this.map.invalidateSize();
      }, 150);
    }, 50);
  },

  initMap() {
    this._initialZoomDone = false;
    this.map = L.map('tracking-map', { zoomControl: false }).setView([-15.7942, -47.8822], 12);
    
    this.trailLayers = L.featureGroup();
    
    // Add custom zoom control at bottom-left
    L.control.zoom({ position: 'bottomleft' }).addTo(this.map);

    L.tileLayer('https://mt1.google.com/vt/lyrs=m&hl=pt-BR&x={x}&y={y}&z={z}', {
      attribution: '&copy; Google Maps',
      maxZoom: 20
    }).addTo(this.map);

    this.trailLayers.addTo(this.map);

    // Dynamic marker scaling based on zoom level
    const mapEl = document.getElementById('tracking-map');
    if (mapEl) {
      mapEl.style.setProperty('--map-zoom', 12);
    }
    this.map.on('zoom', () => {
      const zoom = this.map.getZoom();
      if (mapEl) {
        mapEl.style.setProperty('--map-zoom', zoom);
      }
    });
  },

  initSocket() {
    if (this.socket) this.socket.disconnect();
    
    if (typeof io === 'undefined') {
      console.warn('⚠️ Socket.io (io) não está definido no painel de rastreamento.');
      return;
    }
    
    this.socket = io(window.location.origin, { transports: ['websocket', 'polling'] });

    this.socket.on('connect', () => {
      const statusEl = document.getElementById('tracking-status');
      if (statusEl) {
        statusEl.className = 'mac-status-badge connected';
        statusEl.innerHTML = '<span class="mac-status-dot"></span> <span>Servidor Conectado</span>';
      }
    });

    this.socket.on('disconnect', () => {
      const statusEl = document.getElementById('tracking-status');
      if (statusEl) {
        statusEl.className = 'mac-status-badge disconnected';
        statusEl.innerHTML = '<span class="mac-status-dot"></span> <span>Desconectado</span>';
      }
    });

    this.socket.on('location-broadcast', (locations) => {
      const user = API.getUser();
      let filtered = locations;
      
      if (user.role === 'gestor' && user.filial) {
        // Filter: only show bakers from the manager's branch
        filtered = locations.filter(loc => loc.filial === user.filial);
      }
      
      this.updateMarkers(filtered);
      this.updateList(filtered);
    });

    // Event with batch of points (emitted during offline sync or real-time batch)
    this.socket.on('location-broadcast-single', (data) => {
      const user = API.getUser();
      if (user.role === 'gestor' && user.filial && data.filial !== user.filial) return;

      // Update the user's marker and sidebar status
      this.updateMarkers([data]);
      this.updateList([data]);

      // If this user is selected to view trail -> accumulate points and redraw live trail
      if (this.selectedUserId === data.userId && data.newPoints && data.newPoints.length > 0) {
        this._appendLiveTrailPoints(data.userId, data.newPoints);
      }
    });

    this.socket.on('activity-updated', (atividade) => {
      const dateInput = document.getElementById('trail-date');
      const selectedDate = dateInput ? dateInput.value : new Date().toISOString().split('T')[0];
      
      if (atividade.data === selectedDate) {
        this.fetchClientInfo(atividade.padeiroId, selectedDate);
        if (this.selectedUserId === atividade.padeiroId) {
          this.loadTimeline(selectedDate);
        }
      }
    });
  },

  // Accumulate new points into the live trail drawn on the map
  _appendLiveTrailPoints(userId, newPoints) {
    if (!this.liveTrailPoints[userId]) {
      this.liveTrailPoints[userId] = [];
    }
    
    // Add new points
    this.liveTrailPoints[userId].push(...newPoints);
    
    // Sort by timestamp to guarantee chronological order
    this.liveTrailPoints[userId].sort((a, b) => 
      new Date(a.timestamp || a.recorded_at) - new Date(b.timestamp || b.recorded_at)
    );

    const latlngs = this.liveTrailPoints[userId].map(p => [p.lat, p.lng]);

    // If we already have a livePolyline for this user, update it
    if (this._livePolyline) {
      this._livePolyline.setLatLngs(latlngs);
    } else {
      // Create a solid orange line for live tracking trail
      this._livePolyline = L.polyline(latlngs, {
        color: '#E55A2B',
        weight: 3,
        opacity: 0.8,
        dashArray: null
      }).addTo(this.map);
    }
  },

  updateMarkers(locations) {
    locations.forEach(loc => {
      const { userId, userName, coords, lastUpdate } = loc;
      
      if (this.markers[userId]) {
        // Update existing marker
        this.markers[userId].setLatLng([coords.lat, coords.lng]);
      } else {
        // Create new marker
        const marker = L.marker([coords.lat, coords.lng]).addTo(this.map);
        marker.bindPopup(`
          <div class="map-popup">
            <strong>${userName}</strong><br>
            <span>Último sinal: ${new Date(lastUpdate).toLocaleTimeString()}</span><br>
            <small>Precisão: ${Math.round(coords.accuracy)}m</small>
            <button class="map-popup-btn" onclick="Rastreamento.selectUserForTrail('${userId}')">Ver Trajeto do Dia</button>
          </div>
        `);
        this.markers[userId] = marker;
      }
    });

    // Auto-zoom to fit markers if it's the first update
    if (!this._initialZoomDone && locations.length > 0) {
      const group = new L.featureGroup(Object.values(this.markers));
      this.map.fitBounds(group.getBounds().pad(0.1));
      this._initialZoomDone = true;
    }
  },



  updateList(locations) {
    const list = document.getElementById('active-track-list');
    if (!list) return;

    if (locations) {
      this.latestLocations = locations;
    } else {
      locations = this.latestLocations || [];
    }

    const padeirosToRender = this.allPadeiros || [];
    if (padeirosToRender.length === 0) {
      list.innerHTML = '<div style="padding: 12px 20px; font-size: 13px; color: var(--mac-tertiary);">Nenhum produto cadastrado.</div>';
      return;
    }

    // Map locations by userId for fast lookup
    const locMap = new Map();
    locations.forEach(loc => locMap.set(loc.userId, loc));

    // Avoid DOM recreation if the online users haven't changed
    const onlineIds = Array.from(locMap.keys()).sort().join(',');
    if (this._lastOnlineIds === onlineIds) {
      return;
    }
    this._lastOnlineIds = onlineIds;

    const colors = ['#E55A2B', '#34C759', '#FF9500', '#AF52DE', '#FF2D55'];
    const isMobile = window.innerWidth < 1024;
    const dateInput = document.getElementById('trail-date');
    const selectedDateStr = dateInput && dateInput.value ? dateInput.value : '';

    // Group bakers by filial
    const grouped = {};
    padeirosToRender.forEach(p => {
      const filial = p.filial || 'Sem Filial';
      if (!grouped[filial]) grouped[filial] = [];
      grouped[filial].push(p);
    });

    let html = '';
    let globalIdx = 0;

    Object.keys(grouped).sort().forEach(filial => {
      // Add filial header separator
      html += `
        <div class="sidebar-filial-header">
          <span class="filial-tag" style="background: rgba(229, 90, 43, 0.1); color: var(--mac-accent); font-size: 10px; font-weight: 750; padding: 4px 10px; border-radius: 8px; text-transform: uppercase; border: 1px solid rgba(229, 90, 43, 0.2);">
            ${filial}
          </span>
          <div style="flex: 1; height: 1px; background: var(--mac-border);"></div>
        </div>
      `;

      grouped[filial].forEach((padeiro) => {
        const isSelected = this.selectedUserId === padeiro.id;
        const initial = padeiro.nome[0].toUpperCase();
        const color = colors[globalIdx % colors.length];
        globalIdx++;

        const isOnline = padeiro.estoque > 0;
        const productPhoto = (padeiro.temFoto && padeiro.codigo) ? `/api/foto-produto/${padeiro.codigo}` : null;
        
        if (isMobile) {
          html += `
            <div class="mac-track-item ${isSelected ? 'selected' : ''}" id="track-item-${padeiro.id}" onclick="Rastreamento.selectActiveItem('${padeiro.id}')">
              ${productPhoto ? `
                <img src="${productPhoto}" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover; flex-shrink: 0;" />
              ` : `
                <div class="mac-avatar" style="background-color: ${color}; color: #FFF; width: 36px; height: 36px; font-size: 15px; font-weight: 600; flex-shrink: 0; display: flex; align-items: center; justify-content: center; border-radius: 50%;">${initial}</div>
              `}
              <div class="mac-track-name" style="margin-left: 10px;">${padeiro.nome}</div>
              <div class="mac-track-status ${isOnline ? 'active' : 'inactive'}"></div>
              <div class="mac-track-icon">
                 <i data-lucide="crosshair" style="width: 16px; height: 16px;"></i>
              </div>
            </div>
          `;
          return;
        }

        const displayDate = selectedDateStr 
          ? new Date(selectedDateStr + 'T12:00:00') 
          : new Date();
        const displayDateStr = displayDate.toLocaleDateString('pt-BR', {day: 'numeric', month: 'short'});
        const displayCod = padeiro.codTec ? padeiro.codTec : padeiro.id.substring(0, 6).toUpperCase();

        const maxStock = Math.max(...padeirosToRender.map(pr => pr.estoque || 0), 100);
        const stockPercent = Math.min(100, Math.max(0, Math.round(((padeiro.estoque || 0) / maxStock) * 100)));

        html += `
          <div class="mac-track-item desktop-track-item ${isSelected ? 'expanded' : ''}" id="track-item-${padeiro.id}" onclick="Rastreamento.selectActiveItem('${padeiro.id}')">
            <div class="track-item-header" style="display: flex; align-items: center; gap: 12px; width: 100%;">
              ${productPhoto ? `
                <img src="${productPhoto}" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover; flex-shrink: 0;" />
              ` : `
                <div class="mac-avatar" style="background-color: ${color}; color: #FFF; width: 36px; height: 36px; font-size: 15px; font-weight: 600; flex-shrink: 0; display: flex; align-items: center; justify-content: center; border-radius: 50%; transition: all 0.3s;">${initial}</div>
              `}
              <div class="track-item-title-group" style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px;">
                <div class="track-item-title" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${padeiro.nome}</div>
                <div class="track-item-subtitle" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                  COD: ${displayCod} <span class="filial-name-highlight">• ${filial}</span>
                </div>
              </div>
              <div class="track-item-badge ${isOnline ? 'online' : 'offline'}" style="background: ${isOnline ? 'var(--mac-success)' : 'var(--mac-tertiary)'}; color: #FFF; flex-shrink: 0;">
                ${isOnline ? 'EM ESTOQUE' : 'SEM ESTOQUE'}
              </div>
            </div>
            
            <div class="track-item-details">
              <div class="track-progress-container">
                <span class="track-progress-label progress-label-${padeiro.id}">${stockPercent}%</span>
                <div class="track-progress-bar"><div class="track-progress-fill progress-fill-${padeiro.id}" style="width: ${stockPercent}%;"></div></div>
              </div>
              
              <div class="track-info-grid">
                <div class="track-info-col">
                  <span class="track-info-label">Fornecedor</span>
                  <span class="track-info-value client-name" data-userid="${padeiro.id}">${padeiro.filial}</span>
                </div>
                <div class="track-info-col">
                  <span class="track-info-label">Status</span>
                  <span class="track-info-value">${padeiro.ativo ? 'Ativo' : 'Inativo'}</span>
                </div>
                <div class="track-info-col">
                  <span class="track-info-label">Preço</span>
                  <span class="track-info-value">R$ ${(padeiro.preco || 0).toFixed(2).replace('.', ',')}</span>
                </div>
              </div>
              
              <div class="track-driver-footer">
                ${productPhoto ? `
                  <img src="${productPhoto}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; flex-shrink: 0;" />
                ` : `
                  <div class="mac-avatar" style="background-color: ${color}; color: #FFF; width: 32px; height: 32px; font-size: 13px; font-weight: 500; display: flex; align-items: center; justify-content: center; border-radius: 50%;">${initial}</div>
                `}
                <div class="track-driver-info">
                  <div class="track-driver-name">${padeiro.nome}</div>
                  <div class="track-driver-role">${padeiro.categoria || 'Produto'}</div>
                </div>
                <div class="track-driver-actions">
                  <button class="track-action-btn btn-calendar-picker" data-userid="${padeiro.id}" title="Cronograma" onclick="event.stopPropagation()"><i data-lucide="calendar"></i></button>
                  <button class="track-action-btn" title="Ligar" onclick="event.stopPropagation()"><i data-lucide="phone"></i></button>
                </div>
              </div>
            </div>
          </div>
        `;
      });
    });

    list.innerHTML = html;
    
    if (window.lucide) lucide.createIcons();

    // Inicializa o Flatpickr (popup idêntico ao do Cronograma) nos botões de calendário dos cards
    if (typeof flatpickr !== 'undefined') {
      document.querySelectorAll('.btn-calendar-picker').forEach(btn => {
        const userId = btn.dataset.userid;
        flatpickr(btn, {
          locale: "pt",
          dateFormat: "Y-m-d",
          disableMobile: true,
          defaultDate: selectedDateStr || new Date().toISOString().split('T')[0],
          onChange: (selectedDates, dateStr) => {
            Rastreamento.selectCalendarDate(dateStr, userId);
          }
        });
      });
    }
    
    if (this.selectedUserId && !isMobile) {
      setTimeout(() => {
        const dateInput = document.getElementById('trail-date');
        const date = dateInput ? dateInput.value : new Date().toISOString().split('T')[0];
        this.fetchClientInfo(this.selectedUserId, date);
      }, 100);
    }
  },

  selectActiveItem(userId) {
    const isMobile = window.innerWidth < 1024;
    
    // Toggle collapse logic
    if (!isMobile && this.selectedUserId === userId) {
      this.onUserSelectChange(''); // This clears selection and collapses
      return;
    }
    
    // Atualiza a seleção visual
    this.selectedUserId = userId;
    const selectEl = document.getElementById('trail-user-select');
    if (selectEl) selectEl.value = userId;
    
    this.renderComparedStoreMarkers(userId);
    
    document.querySelectorAll('.mac-track-item').forEach(el => {
      el.classList.remove('selected');
      el.classList.remove('expanded');
    });
    
    const target = document.getElementById('track-item-' + userId);
    if (target) {
      if (isMobile) {
        target.classList.add('selected');
        
        // Rola a tela suavemente para cima, centralizando o mapa
        const mapContainer = document.getElementById('view-mapa');
        if (mapContainer) {
          mapContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } else {
        target.classList.add('expanded');
        const bottomPanel = document.getElementById('bottom-client-panel');
        if (bottomPanel) {
          bottomPanel.classList.add('visible');
          document.getElementById('bcp-main-title').innerText = 'Carregando...';
          document.getElementById('bcp-cliente').innerText = 'Carregando...';
          document.getElementById('bcp-etapa').innerText = '--';
        }
      }
    }
    
    const dateInput = document.getElementById('trail-date');
    const date = dateInput ? dateInput.value : new Date().toISOString().split('T')[0];
    this.fetchClientInfo(userId, date);
  },

  async fetchClientInfo(userId, date) {
    if (this.bcpInterval) clearInterval(this.bcpInterval);
    try {
      const product = this.allPadeiros.find(p => p.id === userId);
      if (!product) return;

      const maxStock = Math.max(...this.allPadeiros.map(p => p.estoque || 0), 100);
      const progressVal = Math.min(100, Math.max(0, Math.round(((product.estoque || 0) / maxStock) * 100)));

      const progressLabel = document.querySelector(`.progress-label-${userId}`);
      const progressFill = document.querySelector(`.progress-fill-${userId}`);
      if (progressLabel) progressLabel.innerText = `${progressVal}%`;
      if (progressFill) progressFill.style.width = `${progressVal}%`;

      const clientNameEl = document.querySelector(`.client-name[data-userid="${userId}"]`);
      if (clientNameEl) clientNameEl.innerText = product.filial; // supplier

      const bcpTitle = document.getElementById('bcp-main-title');
      const bcpCliente = document.getElementById('bcp-cliente');
      const bcpDestino = document.getElementById('bcp-destino');
      const bcpLocal = document.getElementById('bcp-local');
      const bcpEtapa = document.getElementById('bcp-etapa');
      const bcpRestante = document.getElementById('bcp-restante');

      if (bcpTitle) bcpTitle.innerText = product.nome;
      if (bcpCliente) bcpCliente.innerText = product.filial;
      if (bcpDestino) bcpDestino.innerText = product.unidade || 'un';
      if (bcpLocal) bcpLocal.innerText = `R$ ${(product.preco || 0).toFixed(2).replace('.', ',')}`;
      if (bcpEtapa) bcpEtapa.innerText = `${product.estoque || 0}`;
      if (bcpRestante) bcpRestante.innerText = product.ativo ? 'Ativo' : 'Inativo';

      const bcpBadge = document.querySelector('.bcp-badge');
      if (bcpBadge) {
        const hasStock = product.estoque > 0;
        bcpBadge.innerText = hasStock ? 'EM ESTOQUE' : 'SEM ESTOQUE';
        bcpBadge.style.background = hasStock ? 'var(--mac-success)' : 'var(--mac-destructive)';
      }
    } catch (e) {
      console.error('Erro ao processar informações do produto:', e);
    }
  },

  focusPadeiro(userId) {
    const marker = this.markers[userId];
    if (marker) {
      this.map.setView(marker.getLatLng(), 15);
      marker.openPopup();
    }
  },

  onUserSelectChange(userId) {
    this.selectedUserId = userId || null;
    
    document.querySelectorAll('.mac-track-item').forEach(el => {
      el.classList.remove('selected');
      el.classList.remove('expanded');
    });
    
    if (userId) {
      const itemEl = document.getElementById(`track-item-${userId}`);
      if (itemEl && window.innerWidth >= 1024) itemEl.classList.add('expanded');
      
      this.renderComparedStoreMarkers(userId);
      
      const bottomPanel = document.getElementById('bottom-client-panel');
      if (bottomPanel && window.innerWidth >= 1024) bottomPanel.classList.add('visible');
      
      const dateInput = document.getElementById('trail-date');
      const date = dateInput ? dateInput.value : new Date().toISOString().split('T')[0];
      this.fetchClientInfo(userId, date);
    } else {
      this.clearTrail();
      if (this.bcpInterval) clearInterval(this.bcpInterval);
      const bottomPanel = document.getElementById('bottom-client-panel');
      if (bottomPanel) bottomPanel.classList.remove('visible');
    }
  },

  onDateChange() {
    if (this.selectedUserId) {
      this.renderComparedStoreMarkers(this.selectedUserId);
    }
  },

  onTimeChange() {
    if (this.selectedUserId) {
      this.renderComparedStoreMarkers(this.selectedUserId);
    }
  },

  selectUserForTrail(userId) {
    this.selectActiveItem(userId);
  },

  loadTrail() {
    if (this.selectedUserId) {
      this.renderComparedStoreMarkers(this.selectedUserId);
    } else {
      Components.toast('Selecione um produto primeiro', 'info');
    }
  },

  clearTrail() {
    this.trailLayers.clearLayers();
    
    if (this._livePolyline) {
      this._livePolyline.remove();
      this._livePolyline = null;
    }
    this.liveTrailPoints = {};
    
    Object.values(this.markers).forEach(m => m.remove());
    this.markers = {};
    
    const infoEl = document.getElementById('trail-info');
    if (infoEl) infoEl.innerHTML = '';
    if (this.bcpInterval) clearInterval(this.bcpInterval);
    const bottomPanel = document.getElementById('bottom-client-panel');
    if (bottomPanel) bottomPanel.classList.remove('visible');
    
    let overlay = document.getElementById('tracking-search-overlay');
    if (overlay) overlay.remove();
  },

  async loadTimeline(date) {
    const container = document.getElementById('timeline-content');
    if (!container) return;
    container.innerHTML = '<div style="color:var(--mac-tertiary); font-size:13px; text-align:center; padding-top:40px;">Carregando timeline...</div>';

    try {
      const atividades = await API.get(`/api/atividades?padeiroId=${this.selectedUserId}&data=${date}`);
      
      if (!atividades || atividades.length === 0) {
        container.innerHTML = '<div style="color:var(--mac-tertiary); font-size:13px; text-align:center; padding-top:40px;">Nenhuma atividade iniciada ou concluída nesta data.</div>';
        return;
      }

      // Filtrar as que tem a timeline populada. Trata o caso de timeline nula/vazia de versões antigas.
      const actsWithTimeline = atividades.filter(a => Array.isArray(a.timeline) && a.timeline.length > 0);
      
      if (actsWithTimeline.length === 0) {
        container.innerHTML = '<div style="color:var(--mac-tertiary); font-size:13px; text-align:center; padding-top:40px;">As atividades deste dia não possuem registros de timeline de localização.</div>';
        return;
      }

      let html = '';
      actsWithTimeline.forEach(act => {
        html += `<div class="ml-timeline-activity-card">
          <div class="ml-timeline-activity-title">
            <i data-lucide="package" style="width:18px;height:18px;color:var(--mac-accent)"></i> 
            Atendimento: ${act.clienteNome}
          </div>
          <div class="ml-timeline">`;
        
        act.timeline.forEach(ev => {
          const t = new Date(ev.timestamp);
          const timeStr = isNaN(t) ? '--:--' : t.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
          
          let mapLink = '';
          if (ev.lat && ev.lng) {
            mapLink = `<button class="ml-timeline-map-btn" onclick="Rastreamento.focusTimelinePoint(${ev.lat}, ${ev.lng})">
                         <i data-lucide="map-pin" style="width:12px;height:12px;"></i> Ver no mapa
                       </button>`;
          } else {
            mapLink = `<span style="font-size:11px;color:var(--mac-tertiary);display:inline-block;margin-top:4px;">Sem GPS</span>`;
          }

          html += `
            <div class="ml-timeline-item">
              <div class="ml-timeline-dot"></div>
              <div class="ml-timeline-time">${timeStr}</div>
              <div class="ml-timeline-title">${ev.step}</div>
              ${mapLink}
            </div>
          `;
        });

        html += `</div></div>`;
      });

      container.innerHTML = html;
      if (window.lucide) lucide.createIcons();

    } catch (e) {
      console.error('Erro ao carregar timeline:', e);
      container.innerHTML = '<div style="color:var(--mac-destructive); font-size:13px; text-align:center; padding-top:40px;">Erro ao carregar timeline de eventos.</div>';
    }
  },

  focusTimelinePoint(lat, lng) {
    this.switchTab('mapa');
    if (!this.timelinePointMarker) {
      this.timelinePointMarker = L.circleMarker([lat, lng], {
        radius: 12, fillColor: '#10b981', color: '#fff', weight: 3, opacity: 1, fillOpacity: 1
      }).addTo(this.map);
    } else {
      this.timelinePointMarker.setLatLng([lat, lng]);
    }
    
    // Bind popup to explain it's an event
    this.timelinePointMarker.bindPopup('<div class="map-popup"><strong>Ponto do Evento</strong><br>Local onde a etapa foi registrada.</div>').openPopup();
    this.map.setView([lat, lng], 18);
  },

  async resetUserTracking() {
    const selectEl = document.getElementById('trail-user-select');
    const userId = selectEl ? selectEl.value : null;

    if (!userId) {
      Components.toast('Selecione um padeiro primeiro', 'info');
      return;
    }

    const userName = selectEl.options[selectEl.selectedIndex].text;
    const dateInput = document.getElementById('trail-date');
    const date = dateInput ? dateInput.value : '';

    if (!date) {
      Components.toast('Selecione uma data para o reset', 'info');
      return;
    }

    // Exibe modal de confirmação
    Components.confirm(
      `Deseja realmente apagar o histórico de localização do padeiro <b>${userName}</b> para o dia <b>${date.split('-').reverse().join('/')}</b>?<br><br>Esta ação excluirá apenas os registros dele deste dia e é irreversível.`,
      async () => {
        const loaderDiv = document.createElement('div');
        loaderDiv.innerHTML = Components.loading();
        const loaderEl = loaderDiv.firstChild;
        document.body.appendChild(loaderEl);

        try {
          const res = await API.delete(`/api/tracking/trail/${userId}?date=${date}`);
          Components.toast('Histórico do padeiro limpo com sucesso!', 'success');
          this.clearTrail();
          
          // Se hoje, remove o marcador ativo
          const todayStr = new Date().toISOString().split('T')[0];
          if (date === todayStr) {
            if (this.markers[userId]) {
              this.markers[userId].remove();
              delete this.markers[userId];
            }
          }
        } catch (error) {
          console.error('Erro ao resetar histórico do padeiro:', error);
          Components.toast(error.message || 'Erro ao resetar histórico', 'error');
        } finally {
          if (loaderEl) loaderEl.remove();
        }
      }
    );
  },

  clearTrail() {
    this.trailLayers.clearLayers();
    
    if (this._livePolyline) {
      this._livePolyline.remove();
      this._livePolyline = null;
    }
    this.liveTrailPoints = {};
    
    const infoEl = document.getElementById('trail-info');
    if (infoEl) infoEl.innerHTML = '';
    if (this.bcpInterval) clearInterval(this.bcpInterval);
    const bottomPanel = document.getElementById('bottom-client-panel');
    if (bottomPanel) bottomPanel.classList.remove('visible');
  },

  selectCalendarDate(dateStr, userId) {
    // Update the date input element
    const dateInput = document.getElementById('trail-date');
    if (dateInput) {
      dateInput.value = dateStr;
    }
    
    // Also trigger date change and load trail
    this.onDateChange();
    
    // Update the card's visual date display
    const targetUserId = userId || this.selectedUserId;
    if (targetUserId) {
      const cardId = `track-item-${targetUserId}`;
      const cardEl = document.getElementById(cardId);
      if (cardEl) {
        const dateEl = cardEl.querySelector('.track-info-col:nth-child(3) .track-info-value');
        if (dateEl) {
          const dateObj = new Date(dateStr + 'T12:00:00');
          dateEl.innerText = dateObj.toLocaleDateString('pt-BR', {day: 'numeric', month: 'short'});
        }
      }
      this.fetchClientInfo(targetUserId, dateStr);
    }
  },

  toggleSearch() {
    const container = document.getElementById('sidebar-search-container');
    if (!container) return;
    
    if (container.style.display === 'none') {
      container.style.display = 'block';
      const input = document.getElementById('sidebar-search-input');
      if (input) {
        input.focus();
        input.value = '';
        this.filterBakers('');
      }
    } else {
      container.style.display = 'none';
      this.filterBakers('');
    }
  },

  filterBakers(query) {
    const term = query.toLowerCase().trim();
    
    // Select all baker cards and filial headers in the sidebar
    const items = document.querySelectorAll('.desktop-track-item, .mac-track-item:not(.desktop-track-item)');
    const headers = document.querySelectorAll('.sidebar-filial-header');
    
    // Track headers that have at least one visible item
    const visibleFiliais = new Set();
    
    items.forEach(item => {
      // Extract the name of the baker from this item
      const titleEl = item.querySelector('.track-item-title') || item.querySelector('.mac-track-name');
      const name = titleEl ? titleEl.innerText.toLowerCase() : '';
      
      // Extract the branch name
      const parentSub = item.querySelector('.track-item-subtitle');
      let filial = '';
      if (parentSub) {
        const filialEl = parentSub.querySelector('.filial-name-highlight');
        if (filialEl) filial = filialEl.innerText.replace('•', '').toLowerCase().trim();
      }
      
      const isMatch = name.includes(term) || filial.includes(term);
      if (isMatch) {
        item.style.setProperty('display', 'flex', 'important');
        if (parentSub) {
          const filialEl = parentSub.querySelector('.filial-name-highlight');
          if (filialEl) {
            visibleFiliais.add(filialEl.innerText.replace('•', '').trim());
          }
        }
      } else {
        item.style.setProperty('display', 'none', 'important');
      }
    });
    
    // Filter filial headers
    headers.forEach(header => {
      const tagEl = header.querySelector('.filial-tag');
      if (tagEl) {
        const branchName = tagEl.innerText.trim();
        if (term === '' || visibleFiliais.has(branchName)) {
          header.style.setProperty('display', 'flex', 'important');
        } else {
          header.style.setProperty('display', 'none', 'important');
        }
      }
    });
  },

  recenterMap() {
    if (!this.map) return;
    const activeMarkers = Object.values(this.markers);
    if (activeMarkers.length > 0) {
      const group = new L.featureGroup(activeMarkers);
      this.map.fitBounds(group.getBounds().pad(0.1));
      Components.toast('Mapa centralizado nas lojas ativas', 'success');
    } else {
      this.map.setView([-15.7942, -47.8822], 12);
      Components.toast('Nenhuma loja ativa no momento para centralizar', 'info');
    }
  },

  async renderComparedStoreMarkers(productId) {
    if (!this.map) return;
    
    const product = this.allPadeiros.find(p => p.id === productId);
    if (!product) return;

    // Clear old markers
    Object.values(this.markers).forEach(m => m.remove());
    this.markers = {};
    this.trailLayers.clearLayers();
    if (this._livePolyline) {
      this._livePolyline.remove();
      this._livePolyline = null;
    }

    // Show loading overlay
    let overlay = document.getElementById('tracking-search-overlay');
    if (overlay) overlay.remove();
    overlay = document.createElement('div');
    overlay.id = 'tracking-search-overlay';
    overlay.className = 'tracking-search-overlay';
    overlay.innerHTML = `
      <div class="tracking-search-pill">
        <div class="tracking-search-spinner"></div>
        Buscando lojas via Nominatim…
      </div>
    `;
    const viewMapa = document.getElementById('view-mapa');
    if (viewMapa) viewMapa.appendChild(overlay);

    // Find all compared stores selling this product (matching code or description)
    const compared = this.allPadeiros.filter(p => 
      p.codigo ? (p.codigo === product.codigo) : (p.nome === product.nome)
    );

    const staticCoordinates = {
      'madeireira central': [-15.795, -47.95],
      'madeireira nobre': [-15.83, -48.06],
      'duratex': [-15.76, -47.88],
      'madeirite sul': [-15.81, -47.98],
      'lp brasil': [-15.82, -48.11],
      'madelar': [-15.88, -48.08]
    };

    function getDeterministicOffset(name) {
      let hash = 0;
      for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
      }
      const latOffset = ((hash & 0xFF) / 255 - 0.5) * 0.08;
      const lngOffset = (((hash >> 8) & 0xFF) / 255 - 0.5) * 0.08;
      return [latOffset, lngOffset];
    }

    // Geocode helper using Nominatim with static & deterministic fallbacks
    const geocodeSupplier = async (supplierName) => {
      const normalized = supplierName.toLowerCase().trim();
      for (const [key, coords] of Object.entries(staticCoordinates)) {
        if (normalized.includes(key) || key.includes(normalized)) {
          return coords;
        }
      }

      // Nominatim search
      try {
        const query = `${supplierName}, Brasilia, DF, Brasil`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'BancadaSistemaPadeiro/1.0 (bancada@sistema.com)'
          }
        });
        clearTimeout(timeoutId);
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
          }
        }
      } catch (err) {
        console.warn(`Erro no geocodificador Nominatim para "${supplierName}":`, err);
      }

      // Nominatim simple search fallback
      try {
        const query = `${supplierName}, DF, Brasil`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'BancadaSistemaPadeiro/1.0 (bancada@sistema.com)'
          }
        });
        clearTimeout(timeoutId);
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
          }
        }
      } catch (err) {
        // Ignore
      }

      // Deterministic offset fallback
      const baseCenter = [-15.7942, -47.8822];
      const offset = getDeterministicOffset(supplierName);
      return [baseCenter[0] + offset[0], baseCenter[1] + offset[1]];
    };

    // Process all compared suppliers in parallel
    const markerBounds = [];
    await Promise.all(compared.map(async (p) => {
      const coords = await geocodeSupplier(p.filial);
      if (!coords) return;

      const priceStr = `R$ ${(p.preco || 0).toFixed(2).replace('.', ',')}`;
      const isSelectedProduct = p.id === productId;

      const customIcon = L.divIcon({
        className: 'mp-price-marker-container',
        html: `
          <div class="mp-price-marker ${isSelectedProduct ? 'selected' : ''}">
            <div class="mp-price-pill">${priceStr}</div>
            <div class="mp-price-store">${p.filial}</div>
          </div>
        `,
        iconSize: [120, 70],
        iconAnchor: [60, 35]
      });

      const marker = L.marker(coords, { icon: customIcon }).addTo(this.map);
      
      marker.bindPopup(`
        <div class="map-popup">
          <strong style="color: var(--primary);">${p.nome}</strong><br>
          <strong>Fornecedor:</strong> ${p.filial}<br>
          <strong>Preço:</strong> ${priceStr}<br>
          <strong>Estoque:</strong> ${p.estoque} un (${p.ativo ? 'Ativo' : 'Inativo'})<br>
          <button class="map-popup-btn" style="margin-top: 8px; width: 100%; border: none; background: var(--primary); color: white; padding: 6px; border-radius: 4px; font-weight: 600; cursor: pointer;" onclick="Rastreamento.selectActiveItem('${p.id}')">Selecionar Produto</button>
        </div>
      `);

      this.markers[p.id] = marker;
      markerBounds.push(coords);
    }));

    // Remove loading overlay
    if (overlay) overlay.remove();

    // Fit map bounds to show all markers
    if (markerBounds.length > 0) {
      this.map.fitBounds(L.latLngBounds(markerBounds), { padding: [50, 50] });
    } else {
      this.map.setView([-15.7942, -47.8822], 12);
    }
  }
};
