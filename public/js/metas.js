/**
 * Metas Module - Production Goals Management
 * Bancada Sistema Padeiro
 */
const Metas = {
  activeSubTab: 'padeiros',
  activeCategory: 'faturamento',
  ferramentas: [],

  async render() {
    this.renderStyles();
    const c = document.getElementById('page-container');
    if (c) c.classList.add('metas-view');
    c.innerHTML = Components.loading();
    try {
      let metas = [], padeiros = [], atividades = [], ferramentas = [], cronogramas = [], orcamentos = [], clientes = [];
      const results = await Promise.allSettled([
        API.get('/api/metas'), 
        API.get('/api/padeiros'), 
        API.get('/api/atividades'),
        API.get('/api/metas/ferramentas'),
        API.get('/api/cronograma'),
        API.get('/api/orcamentos'),
        API.get('/api/clientes')
      ]);

      if (results[0].status === 'fulfilled') metas = results[0].value;
      else console.error("Error loading metas:", results[0].reason);

      if (results[1].status === 'fulfilled') padeiros = results[1].value;
      else console.error("Error loading padeiros:", results[1].reason);

      if (results[2].status === 'fulfilled') atividades = results[2].value;
      else console.error("Error loading atividades:", results[2].reason);

      if (results[3].status === 'fulfilled') ferramentas = results[3].value;
      else console.error("Error loading ferramentas:", results[3].reason);

      if (results[4].status === 'fulfilled') cronogramas = results[4].value;
      else console.error("Error loading cronogramas:", results[4].reason);

      if (results[5].status === 'fulfilled') orcamentos = results[5].value;
      else console.error("Error loading orcamentos:", results[5].reason);

      if (results[6].status === 'fulfilled') clientes = results[6].value;
      else console.error("Error loading clientes:", results[6].reason);

      this.metas = metas;
      this.padeiros = padeiros;
      this.atividades = atividades;
      this.ferramentas = ferramentas || [];
      this.cronogramas = cronogramas || [];
      this.orcamentos = orcamentos || [];
      this.clientes = clientes || [];
      this.renderContent(c);
    } catch(e) { c.innerHTML = `<div class="toast error">Erro: ${e.message}</div>`; }
  },

  renderStyles() {
    if (document.getElementById('metas-apple-css')) return;
    const style = document.createElement('style');
    style.id = 'metas-apple-css';
    style.innerHTML = `
      .metas-view {
        --apple-blue: #E55A2B;
        --apple-green: #34C759;
        --apple-orange: #FF9A3C;
        --apple-bg: #F2F2F7;
        --apple-card: #FFFFFF;
        --apple-gray: #7A7567;
        --apple-separator: #C6C6C8;
      }

      /* Segmented Control macOS style - EXACTLY like Cronograma */
      .metas-view .segmented-control {
        background: rgba(120, 120, 128, 0.08) !important;
        border-radius: 10px !important;
        padding: 2px !important;
        height: 36px !important;
        display: inline-flex !important;
        align-items: center !important;
        border: 1px solid rgba(0, 0, 0, 0.02) !important;
        min-width: 240px;
        position: relative;
        user-select: none;
        cursor: pointer;
        transition: transform 0.2s ease;
        overflow: hidden;
      }
      .metas-view .segmented-control:active {
        transform: scale(0.96);
      }
      .metas-view .segmented-slider {
        position: absolute;
        top: 2px !important;
        left: 2px !important;
        height: calc(100% - 4px) !important;
        background-color: #FFFFFF !important;
        border-radius: 8px !important;
        box-shadow: 0 1px 3px rgba(0,0,0,0.08), 0 4px 8px rgba(0,0,0,0.04) !important;
        transition: transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.3s ease;
        z-index: 1;
        pointer-events: none;
      }
      .metas-view .segmented-item {
        position: relative;
        flex: 1;
        font-size: 13px !important;
        font-weight: 500 !important;
        color: #71717A !important;
        border-radius: 8px !important;
        height: 32px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        padding: 0 20px !important;
        z-index: 2;
        transition: opacity 0.3s ease, color 0.3s ease;
        opacity: 0.75;
        background: none;
        border: none;
        cursor: pointer;
        font-family: 'Inter', sans-serif;
        text-transform: none !important;
        letter-spacing: normal !important;
      }
      .metas-view .segmented-item.active {
        color: #18181B !important;
        font-weight: 600 !important;
        opacity: 1 !important;
      }



      .tool-dropdown .dropdown-item {
        transition: background-color 0.2s ease;
      }
      .tool-dropdown .dropdown-item:hover {
        background: rgba(229, 90, 43, 0.05);
      }

      @media (max-width: 430px) {
        .page-title { font-size: 28px !important; font-weight: 800 !important; letter-spacing: -0.5px !important; margin-bottom: 20px !important; }
        .card { background: transparent !important; border: none !important; box-shadow: none !important; padding: 0 !important; }
        
        .apple-metrics-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 24px;
        }
        
        .apple-metric-card {
          background: var(--apple-card);
          border-radius: 16px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        
        .apple-metric-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
        .apple-metric-icon-box {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
        .apple-metric-icon-box.blue { background: var(--apple-blue); }
        .apple-metric-icon-box.green { background: var(--apple-green); }
        .apple-metric-icon-box.orange { background: var(--apple-orange); }
        
        .apple-metric-value { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
        .apple-metric-label { font-size: 11px; color: var(--apple-gray); font-weight: 600; text-transform: uppercase; }
        
        .apple-section-header {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 20px;
        }
        .apple-section-title-row { display: flex; justify-content: space-between; align-items: center; }
        .apple-section-title { font-size: 20px; font-weight: 700; display: flex; align-items: center; gap: 8px; }
        .apple-month-pill {
          background: rgba(0,0,0,0.05);
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          color: #666;
        }
        
        .apple-padeiros-list { display: flex; flex-direction: column; gap: 12px; padding-bottom: 100px; }
        .apple-padeiro-card {
          background: var(--apple-card);
          border-radius: 18px;
          padding: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          border: 1px solid rgba(0,0,0,0.05);
        }
        
        .apple-padeiro-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
        .apple-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 15px;
        }
        .apple-padeiro-name { font-size: 17px; font-weight: 700; }
        
        .apple-meta-info { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
        .apple-info-item { display: flex; flex-direction: column; gap: 2px; }
        .apple-info-label { font-size: 11px; color: var(--apple-gray); font-weight: 600; text-transform: uppercase; }
        .apple-info-value { font-size: 16px; font-weight: 700; }
        
        .apple-progress-section { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
        .apple-progress-container { flex: 1; height: 8px; background: #E5E5EA; border-radius: 4px; overflow: hidden; }
        .apple-progress-fill { height: 100%; background: var(--apple-blue); border-radius: 4px; transition: width 0.3s ease; }
        .apple-progress-percent { font-size: 13px; font-weight: 700; min-width: 35px; text-align: right; }
        
        .apple-status-badge {
          display: inline-flex;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 700;
          margin-bottom: 16px;
        }
        .apple-status-badge.success { background: rgba(52,199,89,0.1); color: var(--apple-green); }
        .apple-status-badge.pending { background: rgba(229, 90, 43, 0.1); color: var(--apple-blue); }
        
        .apple-card-actions { display: flex; justify-content: flex-end; gap: 12px; border-top: 1px solid #F2F2F7; padding-top: 12px; }
        
        /* Floating Action Button */
        .btn-new-meta {
          position: fixed;
          bottom: 100px;
          right: 24px;
          width: 56px;
          height: 56px;
          border-radius: 28px;
          background: var(--apple-blue);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 24px rgba(229, 90, 43, 0.3);
          border: none;
          z-index: 90;
        }
      }

      /* Desktop Premium Styles (Boltshift Mockup Redesign) */
      @media (min-width: 431px) {
        /* Hide global app header on desktop for Metas page to prevent double titles */
        .main-content:has(#page-container.metas-view) .ios-desktop-header {
          display: none !important;
        }
        
        @keyframes goalsCascadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .goals-animate-cascade {
          opacity: 0;
          animation: goalsCascadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .goals-kpi-card, .goals-middle-card, .goals-table-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease !important;
        }
        .goals-kpi-card:hover, .goals-middle-card:hover, .goals-table-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.08) !important;
        }

        .metas-view {
          background-color: #f8f6f0 !important;
          padding: 32px 36px !important;
          min-height: 100vh;
          font-family: 'Inter', system-ui, sans-serif;
        }
        
        .goals-desktop-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        
        .goals-desktop-title-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .goals-desktop-title {
          font-size: 28px;
          font-weight: 800;
          color: #111;
          letter-spacing: -0.5px;
          margin: 0;
        }
        .goals-desktop-subtitle {
          font-size: 13px;
          color: #6B7280;
          margin: 0;
        }
        
        /* KPI Cards Grid */
        .goals-kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 24px;
        }
        
        .goals-kpi-card {
          background: #FFF;
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
          display: flex;
          flex-direction: column;
          position: relative;
        }
        .goals-kpi-card.gradient-blue {
          background: linear-gradient(135deg, #E55A2B 0%, #FF9A3C 100%) !important;
          color: #FFF;
        }
        
        .goals-kpi-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }
        .goals-kpi-title {
          font-size: 14px;
          font-weight: 500;
          color: #6B7280;
        }
        .goals-kpi-card.gradient-blue .goals-kpi-title {
          color: rgba(255,255,255,0.9);
        }
        
        .goals-kpi-icon-wrap {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .goals-kpi-icon-wrap.black { background: #111; color: #FFF; }
        .goals-kpi-icon-wrap.blue { background: #E55A2B; color: #FFF; }
        .goals-kpi-icon-wrap.lightblue { background: #EFF6FF; color: #E55A2B; }
        .goals-kpi-card.gradient-blue .goals-kpi-icon-wrap { background: #FFF; color: #E55A2B; }
        
        .goals-kpi-body {
          display: flex;
          align-items: baseline;
          gap: 12px;
          margin-bottom: 8px;
        }
        .goals-kpi-value {
          font-size: 32px;
          font-weight: 700;
          color: #111;
          letter-spacing: -0.5px;
        }
        .goals-kpi-card.gradient-blue .goals-kpi-value {
          color: #FFF;
        }
        
        .goals-kpi-trend {
          font-size: 12px;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 4px;
          display: inline-flex;
          align-items: center;
          gap: 2px;
        }
        .goals-kpi-trend.purple { background: #F3E8FF; color: #7E22CE; }
        .goals-kpi-trend.red { background: #FEE2E2; color: #B91C1C; }
        .goals-kpi-card.gradient-blue .goals-kpi-trend { background: rgba(255,255,255,0.2); color: #FFF; }
        
        .goals-kpi-footer {
          font-size: 12px;
          color: #9CA3AF;
          font-weight: 500;
        }
        .goals-kpi-card.gradient-blue .goals-kpi-footer {
          color: rgba(255,255,255,0.8);
        }
        
        /* Middle Dashboard Section */
        .goals-dashboard-middle {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 24px;
          margin-bottom: 24px;
        }
        
        .goals-middle-card {
          background: #FFF;
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
          display: flex;
          flex-direction: column;
        }
        
        .goals-middle-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .goals-middle-title {
          font-size: 18px;
          font-weight: 700;
          color: #111;
          margin: 0;
        }
        
        /* Segmented Gauge style */
        .gauge-sub-card {
          background: #F9FAFB;
          border-radius: 12px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .gauge-sub-label {
          font-size: 12px;
          color: #6B7280;
          margin-bottom: 4px;
        }
        .gauge-sub-value {
          font-size: 20px;
          font-weight: 700;
          color: #111;
        }
        .gauge-sub-pill {
          font-size: 10px;
          font-weight: 600;
          padding: 2px 4px;
          border-radius: 4px;
          margin-left: 8px;
        }
        
        /* Bottom Table Section */
        .goals-table-card {
          background: #FFF;
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
        }
        
        /* Table controls */
        .goals-search-input-wrap {
          position: relative;
        }
        .goals-search-input-wrap input {
          width: 200px;
          height: 36px;
          padding: 0 12px 0 36px;
          border-radius: 20px;
          border: 1px solid #E5E7EB;
          font-size: 14px;
          outline: none;
          background: #F9FAFB;
          transition: all 0.2s;
        }
        .goals-search-input-wrap input:focus {
          background: #FFF;
          border-color: #E55A2B;
        }
        .goals-search-input-wrap i {
          position: absolute;
          left: 12px;
          top: 10px;
          width: 16px;
          height: 16px;
          color: #9CA3AF;
        }
        .goals-sort-select {
          height: 36px;
          border-radius: 20px;
          border: 1px solid #E5E7EB;
          background: #FFF;
          font-size: 14px;
          font-weight: 500;
          color: #333;
          padding: 0 32px 0 16px;
          outline: none;
          cursor: pointer;
          appearance: none;
          -webkit-appearance: none;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 12px center;
          background-size: 16px;
        }
        
        .goals-table-card table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        .goals-table-card table th {
          background: #FFF;
          color: #6B7280;
          font-size: 13px;
          font-weight: 500;
          padding: 16px;
          border-bottom: 1px solid #F3F4F6;
        }
        .goals-table-card table td {
          padding: 16px;
          border-bottom: 1px solid #F3F4F6;
          font-size: 14px;
          color: #111;
          vertical-align: middle;
        }
        .goals-table-card table tr:last-child td {
          border-bottom: none;
        }
      }
    `;
    document.head.appendChild(style);
  },

  calculateBakerProduction(mesFilter) {
    const producao = {};
    const cronogramas = this.cronogramas || [];
    const clientes = this.clientes || [];

    // Initialize with 0 for all bakers to avoid undefined keys
    (this.padeiros || []).forEach(p => {
      producao[p.id] = 0;
    });

    cronogramas
      .filter(c => c.data && c.data.startsWith(mesFilter))
      .forEach(c => {
        let lucro = 0;
        let orc = c.orcamento;
        if (typeof orc === 'string') {
          try { orc = JSON.parse(orc); } catch (e) {}
        }

        if (orc && !Array.isArray(orc) && typeof orc.ganhoLiquido === 'number') {
          lucro = orc.ganhoLiquido;
        } else {
          const client = clientes.find(cl => cl.id === c.clienteId || cl.nome === c.clienteNome);
          if (client) {
            const receita = parseFloat(client.receita) || 0;
            const custo = parseFloat(client.custoInsumos) || 0;
            lucro = receita - custo;
          }
        }

        if (c.padeiroId) {
          producao[c.padeiroId] = (producao[c.padeiroId] || 0) + lucro;
        }
      });

    return producao;
  },

  renderContent(c) {
    if (window.innerWidth <= 768) {
      this._renderMobileMetasPage(c);
      return;
    }
    const mesAtual = new Date().toISOString().slice(0,7);
    const faturamentoMetas = this.metas.filter(m => !m.tipo || m.tipo === 'faturamento');
    const metasMes = faturamentoMetas.filter(m => m.periodo === mesAtual);
    const producao = this.calculateBakerProduction(mesAtual);

    const isFaturamento = this.activeCategory === 'faturamento';

    c.innerHTML = `
    <div class="fade-in">
      <!-- Category Switcher (Exactly like Cronograma) -->
      <div class="segmented-control mb-6" style="margin-bottom: 24px;" onclick="Components.createRipple(event, this)">
        <div class="segmented-slider" id="category-switcher-slider" style="width: 50%; transform: translateX(${this.activeCategory === 'equipamentos' ? '100%' : '0'})"></div>
        <div class="segmented-item ${this.activeCategory === 'faturamento' ? 'active' : ''}" onclick="Metas.switchCategory('faturamento')">Faturamento</div>
        <div class="segmented-item ${this.activeCategory === 'equipamentos' ? 'active' : ''}" onclick="Metas.switchCategory('equipamentos')">Equipamentos</div>
      </div>

      <!-- Mobile-only header -->
      <div class="mobile-only">
        <div class="flex justify-between items-center mb-6">
          <h1 class="page-title" style="margin-bottom:0;">${isFaturamento ? 'Metas de Produção' : 'Wishlist de Equipamentos'}</h1>
        </div>
        ${isFaturamento ? `
        <div class="segmented-control mb-6" onclick="Components.createRipple(event, this)">
          <div class="segmented-slider" id="subtab-switcher-slider" style="width: 50%; transform: translateX(${this.activeSubTab === 'metas-mensais' ? '100%' : '0'})"></div>
          <div id="tab-padeiros" class="segmented-item ${this.activeSubTab === 'padeiros' ? 'active' : ''}" onclick="Metas.switchSubTab('padeiros')">Semanais</div>
          <div id="tab-metas-mensais" class="segmented-item ${this.activeSubTab === 'metas-mensais' ? 'active' : ''}" onclick="Metas.switchSubTab('metas-mensais')">Mensais</div>
        </div>
        ` : ''}
      </div>
      
      <!-- Desktop-only header (Boltshift style) -->
      <div class="desktop-only">
        <div class="goals-desktop-header">
          <div class="goals-desktop-title-group">
            <h1 class="goals-desktop-title">${isFaturamento ? 'Metas de Produção' : 'Wishlist de Equipamentos'}</h1>
            <span class="goals-desktop-subtitle">${isFaturamento ? 'Seu resumo atual e atividades de metas' : 'Equipamentos dos seus sonhos e progressão de aportes'}</span>
          </div>
          <div class="goals-desktop-header-actions" style="display:flex; align-items:center; gap:12px;">
            <button class="btn btn-outline" onclick="Metas.openMetaCreateChoice()" style="height:36px; border-radius:20px; border:1px solid #E55A2B; background:#FFF; font-size:14px; font-weight:500; color:#E55A2B; padding:0 16px; display:flex; align-items:center; gap:8px; cursor:pointer;">
              <i data-lucide="plus" style="width:16px; height:16px;"></i> Criar Meta
            </button>
            ${isFaturamento ? `
            <div class="goals-select-wrapper" style="position:relative; display:inline-block;">
              <select class="goals-sort-select" style="height:36px; border-radius:20px; border:none; background:#FFF; font-size:14px; font-weight:500; color:#333; padding:0 32px 0 16px;">
                <option>Este Mês</option>
              </select>
            </div>
            <button class="btn btn-outline" onclick="Components.toast('Exportando dados de metas...', 'info')" style="height:36px; border-radius:20px; border:1px solid #E5E7EB; background:#FFF; font-size:14px; font-weight:500; color:#333; padding:0 16px; display:flex; align-items:center; gap:8px;">
              <i data-lucide="upload" style="width:16px; height:16px;"></i> Exportar
            </button>
            <button class="btn btn-primary" onclick="Components.toast('Filtros rápidos ativos.', 'success')" style="height:36px; border-radius:20px; border:none; background:#E55A2B; font-size:14px; font-weight:500; color:#FFF; padding:0 16px; display:flex; align-items:center; gap:8px;">
              <div style="border: 1px solid rgba(255,255,255,0.4); border-radius: 50%; padding: 2px; display:flex; align-items:center; justify-content:center;"><i data-lucide="sliders" style="width:12px; height:12px;"></i></div> Filtrar
            </button>
            ` : ''}
          </div>
        </div>
      </div>

      <div id="metas-sub-content">
        ${isFaturamento ? (this.activeSubTab === 'padeiros' ? this.renderPadeirosTab(mesAtual, metasMes, producao) : this.renderMetasMensaisTab()) : this.renderEquipamentosTab()}
      </div>

      <!-- Floating Action Button for mobile -->
      <div class="mobile-only">
        <button class="btn-new-meta" onclick="Metas.openMetaCreateChoice()">
          <i data-lucide="plus" style="width:24px; height:24px;"></i>
        </button>
      </div>
    </div>`;

    Components.renderIcons();
    
    // Initialize chart and table if tab is 'padeiros' on desktop and active category is faturamento
    if (isFaturamento && this.activeSubTab === 'padeiros') {
      setTimeout(() => {
        this.initPerformanceChart();
        this.updateDesktopTable();
      }, 50);
    }
  },

  switchCategory(cat) {
    this.activeCategory = cat;
    if (window.innerWidth <= 768) {
      const c = document.getElementById('page-container');
      if (c) this._renderMobileMetasPage(c);
    } else {
      this.render();
    }
  },

  switchSubTab(tab) {
    this.activeSubTab = tab;
    if (window.innerWidth <= 768) {
      const c = document.getElementById('page-container');
      if (c) this._renderMobileMetasPage(c);
    } else {
      const mesAtual = new Date().toISOString().slice(0,7);
      const faturamentoMetas = this.metas.filter(m => !m.tipo || m.tipo === 'faturamento');
      const metasMes = faturamentoMetas.filter(m => m.periodo === mesAtual);
      const producao = this.calculateBakerProduction(mesAtual);
      
      // Update mobile segmented control active states
      const tabPadeiros = document.getElementById('tab-padeiros');
      const tabMensais = document.getElementById('tab-metas-metas-mensais');
      if (tabPadeiros && tabMensais) {
        tabPadeiros.classList.toggle('active', tab === 'padeiros');
        tabMensais.classList.toggle('active', tab === 'metas-mensais');
      }
      const slider = document.getElementById('subtab-switcher-slider');
      if (slider) {
        slider.style.transform = `translateX(${tab === 'metas-mensais' ? '100%' : '0'})`;
      }
      
      document.getElementById('metas-sub-content').innerHTML =
        tab === 'padeiros' ? this.renderPadeirosTab(mesAtual, metasMes, producao) : this.renderMetasMensaisTab();
        
      Components.renderIcons();
      
      // Initialize chart and table if tab is 'padeiros'
      if (tab === 'padeiros') {
        setTimeout(() => {
          this.initPerformanceChart();
          this.updateDesktopTable();
        }, 50);
      }
    }
  },

  _renderMobileMetasPage(c) {
    const isFaturamento = this.activeCategory === 'faturamento';
    const mesAtual = new Date().toISOString().slice(0,7);
    const faturamentoMetas = this.metas.filter(m => !m.tipo || m.tipo === 'faturamento');
    const metasMes = faturamentoMetas.filter(m => m.periodo === mesAtual);
    const producao = this.calculateBakerProduction(mesAtual);

    let totalMeta = 0;
    let totalRealizado = 0;
    let restanteKg = 0;
    let progressoGeral = 0;
    let targetTitle = "Total Balance";
    let leftTitle = "Payment Next";
    let rightTitle = "Payment Completed";

    if (isFaturamento) {
      totalMeta = metasMes.reduce((s, m) => s + (parseFloat(m.metaKg) || 0), 0);
      totalRealizado = Object.values(producao).reduce((a,b)=>a+b,0);
      restanteKg = Math.max(0, totalMeta - totalRealizado);
      progressoGeral = totalMeta > 0 ? Math.min(100, Math.round((totalRealizado / totalMeta) * 100)) : 0;
      targetTitle = "Total Faturamento";
      leftTitle = "Pendente";
      rightTitle = "Realizado";
    } else {
      const equipMetas = this.metas.filter(m => m.tipo === 'equipamento');
      totalMeta = equipMetas.reduce((sum, m) => sum + (m.metaKg || 0), 0);
      totalRealizado = equipMetas.reduce((sum, m) => sum + (m.realizado || 0), 0);
      restanteKg = Math.max(0, totalMeta - totalRealizado);
      progressoGeral = totalMeta > 0 ? Math.min(100, Math.round((totalRealizado / totalMeta) * 100)) : 0;
      targetTitle = "Wishlist Planejado";
      leftTitle = "Falta Aportar";
      rightTitle = "Total Aportado";
    }

    const valueFormatted = `R$ ${totalMeta.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const leftFormatted = `R$ ${restanteKg.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const rightFormatted = `R$ ${totalRealizado.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    let itemsHtml = '';
    
    if (isFaturamento) {
      if (this.activeSubTab === 'metas-mensais') {
        const year = new Date().getFullYear();
        const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        const abrevs = ['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'];

        itemsHtml = `
          <div class="m-met-list-section" style="margin-top: 16px;">
            <div class="m-met-list-title" style="margin-bottom: 12px;">Visão Anual — ${year}</div>
            ${meses.map((nomeMes, index) => {
              const monthStr = `${year}-${String(index + 1).padStart(2, '0')}`;
              const metasMes = faturamentoMetas.filter(m => m.periodo === monthStr);
              const producaoMes = this.calculateBakerProduction(monthStr);
              const tMeta = metasMes.reduce((s, m) => s + (parseFloat(m.metaKg) || 0), 0);
              const tRealizado = Object.values(producaoMes).reduce((a, b) => a + b, 0);
              const prog = tMeta > 0 ? Math.min(100, Math.round((tRealizado / tMeta) * 100)) : 0;
              
              return `
                <div class="m-met-list-item" onclick="Metas.openMetaMensalDetails(${year}, ${index})">
                  <div class="m-met-item-left">
                    <div class="m-met-item-avatar" style="background: #E55A2B;">${abrevs[index]}</div>
                    <div class="m-met-item-info">
                      <span class="m-met-item-name">${nomeMes}</span>
                      <span class="m-met-item-date">${metasMes.length} meta(s) cadastrada(s)</span>
                    </div>
                  </div>
                  <div class="m-met-item-right">
                    <span class="m-met-item-value">${prog}%</span>
                    <span class="m-met-item-time ${prog >= 100 ? 'success' : 'progress'}">${prog >= 100 ? 'Atingido' : 'Em progresso'}</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `;
      } else {
        const metasToShow = metasMes.length > 0 ? metasMes : faturamentoMetas;
        const activeMetas = metasToShow.filter(m => {
          const realizado = m.padeiroId ? (producao[m.padeiroId] || 0) : totalRealizado;
          return m.metaKg > 0 && realizado < m.metaKg;
        });
        const completedMetas = metasToShow.filter(m => {
          const realizado = m.padeiroId ? (producao[m.padeiroId] || 0) : totalRealizado;
          return m.metaKg > 0 && realizado >= m.metaKg;
        });

        const renderMetaItem = (m) => {
          const realizado = m.padeiroId ? (producao[m.padeiroId] || 0) : totalRealizado;
          const pct = m.metaKg > 0 ? Math.round((realizado / m.metaKg) * 100) : 0;
          const padeiro = this.padeiros.find(p => p.id === m.padeiroId);
          const name = padeiro ? padeiro.nome : m.nome || 'Autônomo';
          const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
          const avatarColors = ['#E55A2B', '#FF9A3C', '#34C759', '#1C1A14', '#FF2D55'];
          const color = avatarColors[initials.charCodeAt(0) % avatarColors.length];
          const dateLabel = m.periodo || mesAtual;

          return `
            <div class="m-met-list-item" onclick="Metas.openMobileFaturamentoAction('${m.id}', '${name.replace(/'/g, "\\'")}')">
              <div class="m-met-item-left">
                <div class="m-met-item-avatar" style="background: ${color}">${initials}</div>
                <div class="m-met-item-info">
                  <span class="m-met-item-name">${name}</span>
                  <span class="m-met-item-date">Meta: R$ ${(m.metaKg || 0).toFixed(2).replace('.', ',')} • ${dateLabel}</span>
                </div>
              </div>
              <div class="m-met-item-right">
                <span class="m-met-item-value">R$ ${realizado.toFixed(2).replace('.', ',')}</span>
                <span class="m-met-item-time ${pct >= 100 ? 'success' : 'progress'}">${pct}% concluído</span>
              </div>
            </div>
          `;
        };

        itemsHtml = `
          <div class="m-met-list-section">
            <div class="m-met-list-title">Metas Individuais</div>
            ${activeMetas.length > 0 ? `
              <div class="m-met-list-divider">Em progresso</div>
              ${activeMetas.map(renderMetaItem).join('')}
            ` : ''}
            ${completedMetas.length > 0 ? `
              <div class="m-met-list-divider">Concluídas</div>
              ${completedMetas.map(renderMetaItem).join('')}
            ` : ''}
            ${activeMetas.length === 0 && completedMetas.length === 0 ? `
              <div style="text-align: center; padding: 32px; color: #9A9486; font-size: 13px;">Nenhuma meta encontrada para este período.</div>
            ` : ''}
          </div>
        `;
      }
    } else {
      const equipMetas = this.metas.filter(m => m.tipo === 'equipamento');
      const activeMetas = equipMetas.filter(m => m.realizado < m.metaKg);
      const completedMetas = equipMetas.filter(m => m.realizado >= m.metaKg);

      const renderEquipItem = (m) => {
        const pct = m.metaKg > 0 ? Math.min(100, Math.round((m.realizado / m.metaKg) * 100)) : 0;
        const initials = m.nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
        const avatarColors = ['#E55A2B', '#FF9A3C', '#34C759', '#1C1A14', '#FF2D55'];
        const color = avatarColors[initials.charCodeAt(0) % avatarColors.length];

        return `
          <div class="m-met-list-item" onclick="Metas.openMobileEquipAction('${m.id}', '${m.nome.replace(/'/g, "\\'")}')">
            <div class="m-met-item-left">
              <div class="m-met-item-avatar" style="background: ${color}">${initials}</div>
              <div class="m-met-item-info">
                <span class="m-met-item-name">${m.nome}</span>
                <span class="m-met-item-date">${m.observacao || 'Sem observação.'}</span>
              </div>
            </div>
            <div class="m-met-item-right">
              <span class="m-met-item-value">R$ ${m.realizado.toFixed(2).replace('.', ',')} / R$ ${m.metaKg.toFixed(2).replace('.', ',')}</span>
              <span class="m-met-item-time ${pct >= 100 ? 'success' : 'progress'}">${pct}% aportado</span>
            </div>
          </div>
        `;
      };

      itemsHtml = `
        <div class="m-met-list-section">
          <div class="m-met-list-title">Minha Wishlist</div>
          ${activeMetas.length > 0 ? `
            <div class="m-met-list-divider">Em progresso</div>
            ${activeMetas.map(renderEquipItem).join('')}
          ` : ''}
          ${completedMetas.length > 0 ? `
            <div class="m-met-list-divider">Concluídas</div>
            ${completedMetas.map(renderEquipItem).join('')}
          ` : ''}
          ${activeMetas.length === 0 && completedMetas.length === 0 ? `
            <div style="text-align: center; padding: 32px; color: #9A9486; font-size: 13px;">Nenhum equipamento cadastrado.</div>
          ` : ''}
        </div>
      `;
    }

    const user = API.getUser();

    c.innerHTML = `
      <div class="m-met-layout-shell">
        <div class="m-met-top-bar">
          <div class="m-met-avatar-box">
            <img src="${user && (user.foto || user.avatar) ? (user.foto || user.avatar) : 'https://api.dicebear.com/7.x/bottts/svg?seed=Bancada'}" class="m-met-avatar-img" onerror="this.src='https://api.dicebear.com/7.x/bottts/svg?seed=Bancada'" />
          </div>
          <div class="m-met-top-actions">
            <button class="m-met-top-btn" onclick="Components.toast('Suporte em breve!', 'info')">
              <i data-lucide="headphones"></i>
            </button>
            <button class="m-met-top-btn" onclick="Components.toast('Sem notificações novas.', 'info')">
              <i data-lucide="bell"></i>
              <span class="m-met-badge">0</span>
            </button>
          </div>
        </div>

        <!-- Faturamento / Equipamentos Switcher -->
        <div class="segmented-control mb-6" style="margin-bottom: 16px; width: 100%; border-radius: 12px; background: rgba(0,0,0,0.04); padding: 3px;" onclick="Components.createRipple(event, this)">
          <div class="segmented-slider" id="category-switcher-slider-mobile" style="width: 50%; transform: translateX(${this.activeCategory === 'equipamentos' ? '100%' : '0'})"></div>
          <div class="segmented-item ${this.activeCategory === 'faturamento' ? 'active' : ''}" onclick="Metas.switchCategory('faturamento')">Faturamento</div>
          <div class="segmented-item ${this.activeCategory === 'equipamentos' ? 'active' : ''}" onclick="Metas.switchCategory('equipamentos')">Equipamentos</div>
        </div>



        <!-- Total Balance card -->
        <div class="m-met-balance-card">
          <div class="m-met-balance-header">
            <span class="m-met-balance-title">${targetTitle}</span>
            <div class="m-met-balance-indicator" onclick="Components.toast('${isFaturamento ? 'Resumo de Faturamento' : 'Resumo de Wishlist'}', 'info')">
              <i data-lucide="target"></i>
            </div>
          </div>
          <div class="m-met-balance-value">${valueFormatted}</div>
          <div class="m-met-subcards-row">
            <div class="m-met-subcard">
              <span class="m-met-subcard-title">${leftTitle}</span>
              <span class="m-met-subcard-value">${leftFormatted}</span>
            </div>
            <div class="m-met-subcard">
              <span class="m-met-subcard-title">${rightTitle}</span>
              <span class="m-met-subcard-value" style="color: #10B981;">${rightFormatted}</span>
            </div>
          </div>
        </div>

        <!-- Card Limits (Progresso Geral) -->
        <div class="m-met-progress-card">
          <div class="m-met-progress-title">Progresso Geral</div>
          <div class="m-met-progress-bar-container">
            <div class="m-met-slider-track">
              <div class="m-met-slider-fill" style="width: ${progressoGeral}%;">
                <div class="m-met-slider-knob"></div>
              </div>
            </div>
            <div class="m-met-progress-info">
              <span class="m-met-progress-info-label">Progresso Geral</span>
              <span class="m-met-progress-info-value">${progressoGeral}%</span>
            </div>
          </div>
          <div class="m-met-progress-action-row" onclick="Metas.openMetaCreateChoice()">
            <span class="m-met-progress-action-label">${isFaturamento ? 'Definir Meta de Faturamento' : 'Adicionar Item na Wishlist'}</span>
            <i data-lucide="arrow-right"></i>
          </div>
        </div>

        <!-- Transactions Section -->
        ${itemsHtml}
      </div>
    `;

    Components.renderIcons();
  },

  openMobileEquipAction(id, nome) {
    Components.showModal(
      nome,
      `
      <div class="flex flex-col gap-3">
        <button class="pill-btn btn-orange" onclick="Components.closeModal(); Metas.openAporteForm('${id}', '${nome.replace(/'/g, "\\'")}')">
          <i data-lucide="dollar-sign"></i> Aportar Valor
        </button>
        <button class="pill-btn btn-light-orange" onclick="Components.closeModal(); Metas.openMetaForm('equipamento', '${id}')">
          <i data-lucide="pencil"></i> Editar Equipamento
        </button>
        <button class="pill-btn btn-light-danger" onclick="Components.closeModal(); Metas.deleteMeta('${id}')">
          <i data-lucide="trash-2"></i> Excluir Wishlist
        </button>
      </div>
      `,
      `<button class="btn btn-secondary w-full" onclick="Components.closeModal()">Fechar</button>`
    );
    Components.renderIcons();
  },

  openMobileFaturamentoAction(id, nome) {
    Components.showModal(
      `Meta de ${nome}`,
      `
      <div class="flex flex-col gap-3">
        <button class="pill-btn btn-light-orange" onclick="Components.closeModal(); Metas.openMetaForm('faturamento', '${id}')">
          <i data-lucide="pencil"></i> Editar Meta
        </button>
        <button class="pill-btn btn-light-danger" onclick="Components.closeModal(); Metas.deleteMeta('${id}')">
          <i data-lucide="trash-2"></i> Excluir Meta
        </button>
      </div>
      `,
      `<button class="btn btn-secondary w-full" onclick="Components.closeModal()">Fechar</button>`
    );
    Components.renderIcons();
  },

  renderPadeirosTab(mesAtual, metasMes, producao) {
    const faturamentoMetas = this.metas.filter(m => !m.tipo || m.tipo === 'faturamento');
    const totalRealizado = Object.values(producao).reduce((a,b)=>a+b,0);
    const atingidas = faturamentoMetas.filter(m => { const r = m.padeiroId ? (producao[m.padeiroId] || 0) : totalRealizado; return m.metaKg > 0 && r >= m.metaKg; }).length;
    const totalMetas = faturamentoMetas.length;
    const taxaSucesso = totalMetas > 0 ? Math.round((atingidas / totalMetas) * 100) : 0;
    
    const totalMeta = metasMes.reduce((s, m) => s + (parseFloat(m.metaKg) || 0), 0);
    const restanteKg = Math.max(0, totalMeta - totalRealizado);
    const progressoGeral = totalMeta > 0 ? Math.min(100, Math.round((totalRealizado / totalMeta) * 100)) : 0;
    const padeirosSemMeta = this.padeiros.length - metasMes.length;
    
    this.searchQuery = this.searchQuery || '';
    this.sortOption = this.sortOption || 'default';

    return `
      <!-- Mobile Metrics Cards -->
      <div class="mobile-only apple-metrics-grid">
        <div class="apple-metric-card">
          <div class="apple-metric-header">
            <div class="apple-metric-icon-box blue"><i data-lucide="package"></i></div>
            <div class="apple-metric-trend">↗</div>
          </div>
          <div class="apple-metric-value">R$ ${totalRealizado.toFixed(2).replace('.', ',')}</div>
          <div class="apple-metric-label">Produção Total do Mês</div>
        </div>
        <div class="apple-metric-card">
          <div class="apple-metric-header">
            <div class="apple-metric-icon-box green"><i data-lucide="check-circle-2"></i></div>
            <div class="apple-metric-trend">↗</div>
          </div>
          <div class="apple-metric-value">${atingidas}</div>
          <div class="apple-metric-label">Metas Atingidas</div>
        </div>
        <div class="apple-metric-card">
          <div class="apple-metric-header">
            <div class="apple-metric-icon-box orange"><i data-lucide="target"></i></div>
            <div class="apple-metric-trend">↗</div>
          </div>
          <div class="apple-metric-value">${totalMetas}</div>
          <div class="apple-metric-label">Total de Metas</div>
        </div>
      </div>
      
      <!-- Mobile Section Header -->
      <div class="mobile-only apple-section-header">
        <div class="apple-section-title-row">
          <div class="apple-section-title">
            <i data-lucide="target" class="text-primary"></i>
            Metas do Mês
          </div>
          <div class="apple-month-pill">${new Date().toLocaleDateString('pt-BR',{month:'long',year:'numeric'})}</div>
        </div>
        <div class="apple-button-row">
          <button class="apple-btn apple-btn-secondary" onclick="Metas.resetMetas()">
            Resetar Metas
          </button>
          <button class="apple-btn apple-btn-primary" onclick="Metas.openMetaCreateChoice()">
            <i data-lucide="plus"></i> Nova Meta
          </button>
        </div>
      </div>

      <!-- Mobile Padeiros Cards -->
      <div class="mobile-only apple-padeiros-list">
        ${(metasMes.length > 0 ? metasMes : faturamentoMetas).map(m => {
          const realizado = m.padeiroId ? (producao[m.padeiroId] || 0) : totalRealizado;
          const pct = m.metaKg > 0 ? Math.round((realizado / m.metaKg) * 100) : 0;
          const padeiro = this.padeiros.find(p => p.id === m.padeiroId);
          const status = pct >= 100 ? 'success' : 'pending';
          const initials = padeiro ? padeiro.nome.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase() : (m.nome ? m.nome.replace('Autônomo (', '').replace(')', '').split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase() : 'AU');
          const avatarColors = ['#E55A2B', '#FF9A3C', '#34C759', '#1C1A14', '#FF2D55'];
          const color = avatarColors[initials.charCodeAt(0) % avatarColors.length];

          return `
          <div class="apple-padeiro-card">
            <div class="apple-padeiro-header">
              <div class="apple-avatar" style="background: ${color}">${initials}</div>
              <div class="apple-padeiro-name">${padeiro ? padeiro.nome : m.nome || 'Autônomo'}</div>
            </div>
            <div class="apple-meta-info">
              <div class="apple-info-item">
                <div class="apple-info-label">Meta</div>
                <div class="apple-info-value">R$ ${(m.metaKg || 0).toFixed(2).replace('.', ',')}</div>
              </div>
              <div class="apple-info-item">
                <div class="apple-info-label">Realizado</div>
                <div class="apple-info-value" style="color: ${pct >= 100 ? 'var(--apple-green)' : 'var(--apple-label)'}">R$ ${realizado.toFixed(2).replace('.', ',')}</div>
              </div>
            </div>
            <div class="apple-progress-section">
              <div class="apple-progress-container">
                <div class="apple-progress-fill" style="width: ${Math.min(pct, 100)}%;"></div>
              </div>
              <div class="apple-progress-percent">${pct}%</div>
            </div>
            <div class="apple-status-badge ${status}">
              ${pct >= 100 ? 'Concluído' : 'Pendente'}
            </div>
            <div class="apple-card-actions">
              <button class="btn btn-icon" onclick="Metas.openMetaForm('faturamento', '${m.id}')"><i data-lucide="pencil" style="color: var(--apple-blue)"></i></button>
              <button class="btn btn-icon" onclick="Metas.deleteMeta('${m.id}')"><i data-lucide="trash-2" style="color: var(--apple-red)"></i></button>
            </div>
          </div>`;
        }).join('')}
      </div>

      <!-- DESKTOP REDESIGN (Boltshift Dashboard Style) -->
      <div class="desktop-only fade-in">
        
        <!-- 1. KPI Cards Row (4 cards) -->
        <div class="goals-kpi-grid">
          
          <!-- Card 1: Produção Total (Gradient Blue Card) -->
          <div class="goals-kpi-card gradient-blue goals-animate-cascade" style="animation-delay: 0.05s">
            <div class="goals-kpi-header">
              <span class="goals-kpi-title">Produção Total</span>
              <div class="goals-kpi-icon-wrap"><i data-lucide="shopping-cart" style="width: 20px;"></i></div>
            </div>
            <div class="goals-kpi-body">
              <span class="goals-kpi-value">R$ ${totalRealizado.toFixed(2).replace('.', ',')}</span>
              <span class="goals-kpi-trend"><i data-lucide="arrow-up" style="width:12px; height:12px;"></i> 4.9%</span>
            </div>
            <div class="goals-kpi-footer">Mês anterior: R$ ${(totalRealizado * 0.95).toFixed(2).replace('.', ',')}</div>
          </div>
          
          <!-- Card 2: Metas Atingidas (White Card) -->
          <div class="goals-kpi-card goals-animate-cascade" style="animation-delay: 0.1s">
            <div class="goals-kpi-header">
              <span class="goals-kpi-title">Metas Atingidas</span>
              <div class="goals-kpi-icon-wrap black"><i data-lucide="users" style="width: 20px;"></i></div>
            </div>
            <div class="goals-kpi-body">
              <span class="goals-kpi-value">${atingidas}</span>
              <span class="goals-kpi-trend purple"><i data-lucide="arrow-up" style="width:12px; height:12px;"></i> 7.5%</span>
            </div>
            <div class="goals-kpi-footer">Mês anterior: ${Math.max(0, atingidas - 2)}</div>
          </div>
          
          <!-- Card 3: Taxa de Sucesso (White Card) -->
          <div class="goals-kpi-card goals-animate-cascade" style="animation-delay: 0.15s">
            <div class="goals-kpi-header">
              <span class="goals-kpi-title">Taxa de Sucesso</span>
              <div class="goals-kpi-icon-wrap lightblue"><i data-lucide="box" style="width: 20px;"></i></div>
            </div>
            <div class="goals-kpi-body">
              <span class="goals-kpi-value">${taxaSucesso}%</span>
              <span class="goals-kpi-trend red"><i data-lucide="arrow-down" style="width:12px; height:12px;"></i> 6.0%</span>
            </div>
            <div class="goals-kpi-footer">Mês anterior: ${Math.min(100, taxaSucesso + 6)}%</div>
          </div>
          
          <!-- Card 4: Total de Metas (White Card) -->
          <div class="goals-kpi-card goals-animate-cascade" style="animation-delay: 0.2s">
            <div class="goals-kpi-header">
              <span class="goals-kpi-title">Total de Metas</span>
              <div class="goals-kpi-icon-wrap blue"><span style="font-weight: 700; font-size: 14px; line-height: 1;">R$</span></div>
            </div>
            <div class="goals-kpi-body">
              <span class="goals-kpi-value">${totalMetas}</span>
            </div>
            <div class="goals-kpi-footer">Mês anterior: ${Math.max(0, totalMetas - 5)}</div>
          </div>
          
        </div>
        
        <!-- 2. Middle Section (Chart on Left, Gauge on Right) -->
        <div class="goals-dashboard-middle">
          
          <!-- Chart Card -->
          <div class="goals-middle-card goals-animate-cascade" style="animation-delay: 0.25s">
            <div class="goals-middle-header">
              <h3 class="goals-middle-title">Visão Geral de Desempenho</h3>
              <div class="goals-select-wrapper" style="position:relative; display:inline-block;">
                <select class="goals-sort-select">
                  <option>Este Ano</option>
                </select>
              </div>
            </div>
            <div style="position:relative; height:260px; width:100%;">
              <canvas id="performance-chart"></canvas>
            </div>
          </div>
          
          <!-- Gauge Card -->
          <div class="goals-middle-card goals-animate-cascade" style="display:flex; flex-direction:column; justify-content:space-between; animation-delay: 0.3s">
            <div class="goals-middle-header" style="margin-bottom:0;">
              <h3 class="goals-middle-title">Visão Geral de Vendas</h3>
              <button class="btn btn-icon btn-sm" onclick="event.stopPropagation();" style="border:none; background:none; cursor:pointer; color:#9CA3AF;"><i data-lucide="more-horizontal"></i></button>
            </div>
            
            ${this.renderSegmentedGauge(progressoGeral)}
            
            <div style="display:flex; gap:16px; width:100%; margin-top:32px;">
              <div class="gauge-sub-card">
                <span class="gauge-sub-label">Falta para Meta</span>
                <div style="display:flex; align-items:baseline;">
                  <span class="gauge-sub-value">R$ ${restanteKg.toFixed(2).replace('.', ',')}</span>
                  <span class="gauge-sub-pill" style="background:#FEF3C7; color:#D97706;">RESTANTE ↗</span>
                </div>
              </div>
              <div class="gauge-sub-card">
                <span class="gauge-sub-label">Funcionários Pendentes</span>
                <div style="display:flex; align-items:baseline;">
                  <span class="gauge-sub-value">${padeirosSemMeta}</span>
                  <span class="gauge-sub-pill" style="background:#F3F4F6; color:#111;">PENDENTE ↗</span>
                </div>
              </div>
            </div>
          </div>
          
        </div>
        
        <!-- 3. Bottom Table Section -->
        <div class="goals-table-card goals-animate-cascade" style="animation-delay: 0.35s">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 24px;">
            <h3 class="goals-middle-title">Metas Recentes</h3>
            
            <div style="display:flex; gap:16px; align-items:center;">
              <div class="goals-search-input-wrap">
                <i data-lucide="search"></i>
                <input type="text" placeholder="Buscar funcionários..." value="${this.searchQuery}" oninput="Metas.onBakerSearch(this.value)">
              </div>
              <div style="position:relative;">
                <select class="goals-sort-select" onchange="Metas.onBakerSort(this.value)">
                  <option value="default" ${this.sortOption === 'default'?'selected':''}>Ordenar por: Padrão</option>
                  <option value="name-asc" ${this.sortOption === 'name-asc'?'selected':''}>Nome (A-Z)</option>
                  <option value="meta-desc" ${this.sortOption === 'meta-desc'?'selected':''}>Meta (Maior - Menor)</option>
                  <option value="progress-desc" ${this.sortOption === 'progress-desc'?'selected':''}>Progresso</option>
                </select>
              </div>
            </div>
          </div>
          
          <div style="overflow-x:auto;">
            <table>
              <thead>
                <tr>
                  <th><input type="checkbox" style="border-radius:4px; border:1px solid #D1D5DB; accent-color:#E55A2B;" disabled></th>
                  <th>Informações do Funcionário</th>
                  <th>ID da Meta</th>
                  <th>Data</th>
                  <th>Status</th>
                  <th>Meta (R$)</th>
                  <th>Realizado (R$)</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody id="goals-table-body">
                <!-- Preenchido via updateDesktopTable -->
              </tbody>
            </table>
          </div>
        </div>
        
      </div>
    `;
  },

  renderMetasMensaisTab() {
    const year = new Date().getFullYear();
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const abrevs = ['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'];
    const faturamentoMetas = this.metas.filter(m => !m.tipo || m.tipo === 'faturamento');
    
    const mobileHtml = `
      <div class="mobile-only">
        <div style="text-align:center;margin-bottom:32px;">
          <h3 style="font-size:18px;margin:0;">Visão Anual de Metas — ${year}</h3>
          <p class="text-secondary" style="margin-top:4px;font-size:13px;">Clique em um mês para ver o detalhamento das metas por funcionário.</p>
        </div>
        <div class="month-grid">
          ${meses.map((nomeMes, index) => {
            const monthStr = `${year}-${String(index + 1).padStart(2, '0')}`;
            const metasMes = faturamentoMetas.filter(m => m.periodo === monthStr);
            const producaoMes = this.calculateBakerProduction(monthStr);
            const totalMeta = metasMes.reduce((s, m) => s + (parseFloat(m.metaKg) || 0), 0);
            const totalRealizado = Object.values(producaoMes).reduce((a, b) => a + b, 0);
            const progresso = totalMeta > 0 ? Math.min(100, Math.round((totalRealizado / totalMeta) * 100)) : 0;
            return `
            <div class="month-card" onclick="Metas.openMetaMensalDetails(${year}, ${index})">
              <div style="position: relative; z-index: 2;">
                <div class="month-abbr">${abrevs[index]}</div>
                <div class="month-subtitle">${metasMes.length} meta${metasMes.length !== 1 ? 's' : ''} cadastrada${metasMes.length !== 1 ? 's' : ''}</div>
              </div>
              <div class="month-progress-wrapper">
                <div class="month-meta-header">
                  <span class="month-meta-text">${progresso}%</span>
                </div>
                <div class="month-progress-container">
                  <div class="month-progress-bar" style="width: ${progresso}%;"></div>
                </div>
              </div>
              <div class="month-card-blob"></div>
            </div>`;
          }).join('')}
        </div>
      </div>
    `;
    return mobileHtml;
  },

  initPerformanceChart() {
    const ctx = document.getElementById('performance-chart');
    if (!ctx) return;
    
    const year = new Date().getFullYear();
    const mesesAbrev = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    const monthlyGoals = Array(12).fill(0);
    const monthlyProduction = Array(12).fill(0);
    const faturamentoMetas = this.metas.filter(m => !m.tipo || m.tipo === 'faturamento');
    
    faturamentoMetas.forEach(m => {
      if (m.periodo && m.periodo.startsWith(String(year))) {
        const month = parseInt(m.periodo.split('-')[1]) - 1;
        if (month >= 0 && month < 12) {
          monthlyGoals[month] += (parseFloat(m.metaKg) || 0);
        }
      }
    });
    
    for (let month = 0; month < 12; month++) {
      const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
      const prodMap = this.calculateBakerProduction(monthStr);
      monthlyProduction[month] = Object.values(prodMap).reduce((a, b) => a + b, 0);
    }
    
    if (this.perfChart) {
      this.perfChart.destroy();
    }

    const currentMonthIndex = new Date().getMonth();
    
    let activeProductionColor = '#E55A2B';
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 12;
      canvas.height = 12;
      const pCtx = canvas.getContext('2d');
      pCtx.fillStyle = '#E55A2B';
      pCtx.fillRect(0, 0, 12, 12);
      pCtx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      pCtx.lineWidth = 3;
      pCtx.beginPath();
      pCtx.moveTo(0, 12);
      pCtx.lineTo(12, 0);
      pCtx.stroke();
      
      const patternContext = document.createElement('canvas').getContext('2d');
      activeProductionColor = patternContext.createPattern(canvas, 'repeat') || '#E55A2B';
    } catch (e) {
      console.error("Pattern creation failed", e);
    }

    const productionColors = Array(12).fill(0).map((_, i) => i === currentMonthIndex ? activeProductionColor : 'rgba(229, 90, 43, 0.35)');
    
    this.perfChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: mesesAbrev,
        datasets: [
          {
            label: 'Meta de Produção (R$)',
            data: monthlyGoals,
            backgroundColor: '#F3F4F6',
            borderRadius: 100,
            borderSkipped: false,
            barThickness: 32,
            grouped: false,
            order: 2
          },
          {
            label: 'Produção Realizada (R$)',
            data: monthlyProduction,
            backgroundColor: productionColors,
            borderRadius: 100,
            borderSkipped: false,
            barThickness: 32,
            grouped: false,
            order: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#FFFFFF',
            titleColor: '#111',
            bodyColor: '#6B7280',
            borderColor: '#E5E7EB',
            borderWidth: 1,
            padding: 16,
            boxPadding: 8,
            usePointStyle: true,
            titleFont: { family: 'Inter', size: 14, weight: '600' },
            bodyFont: { family: 'Inter', size: 13 },
            callbacks: {
              title: function(context) { return context[0].label + ' ' + year; }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: { font: { family: 'Inter', size: 12 }, color: '#9CA3AF' }
          },
          y: {
            grid: { color: '#F3F4F6', drawBorder: false, borderDash: [5, 5] },
            border: { display: false },
            ticks: { 
              font: { family: 'Inter', size: 12 }, 
              color: '#9CA3AF',
              callback: function(value) { return 'R$ ' + (value >= 1000 ? (value/1000) + 'k' : value); }
            }
          }
        }
      },
      plugins: [{
        id: 'topDot',
        afterDatasetsDraw(chart) {
          const ctx = chart.ctx;
          const meta = chart.getDatasetMeta(1);
          const currentMonthIndex = new Date().getMonth();
          const bar = meta.data[currentMonthIndex];
          if (bar) {
            ctx.beginPath();
            ctx.arc(bar.x, bar.y, 4, 0, 2 * Math.PI);
            ctx.fillStyle = '#6366F1';
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#FFFFFF';
            ctx.stroke();
          }
        }
      }]
    });
  },

  renderSegmentedGauge(percent) {
    const totalSegments = 16;
    const activeSegments = Math.round((percent / 100) * totalSegments);
    let html = '<div style="position:relative; display:flex; justify-content:center; align-items:flex-end; height:160px; width:100%; margin-top:24px;">';
    html += '<svg viewBox="0 0 100 55" style="width:100%; height:100%; overflow:visible;">';
    
    const cx = 50;
    const cy = 50;
    const r = 40;
    const gapAngle = 4;
    const totalGapAngle = gapAngle * (totalSegments - 1);
    const segmentAngle = (180 - totalGapAngle) / totalSegments;

    for (let i = 0; i < totalSegments; i++) {
      const startAngle = 180 - (i * (segmentAngle + gapAngle));
      const endAngle = startAngle - segmentAngle;
      
      const radStart = (startAngle * Math.PI) / 180;
      const radEnd = (endAngle * Math.PI) / 180;
      
      const x1 = cx + r * Math.cos(radStart);
      const y1 = cy - r * Math.sin(radStart);
      const x2 = cx + r * Math.cos(radEnd);
      const y2 = cy - r * Math.sin(radEnd);
      
      const isActive = i < activeSegments;
      let strokeColor = '#F3F4F6';
      if (isActive) {
        const ratio = i / (totalSegments - 1);
        const red = Math.round(28 + ratio * (147 - 28));
        const green = Math.round(78 + ratio * (197 - 78));
        const blue = Math.round(216 + ratio * (253 - 216));
        strokeColor = `rgb(${red}, ${green}, ${blue})`;
      }
      
      html += `<path d="M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}" stroke="${strokeColor}" stroke-width="12" fill="none" />`;
    }
    html += '</svg>';
    html += `<div style="position:absolute; bottom:0; display:flex; flex-direction:column; align-items:center; line-height:1.2;">
               <span style="font-size:36px; font-weight:700; color:#111;">${percent.toFixed(1)}%</span>
               <span style="font-size:13px; font-weight:500; color:#6B7280; margin-top:4px;">Crescimento de Vendas</span>
             </div>`;
    html += '</div>';
    return html;
  },

  onBakerSearch(query) {
    this.searchQuery = query;
    this.updateDesktopTable();
  },
  
  onBakerSort(option) {
    this.sortOption = option;
    this.updateDesktopTable();
  },

  filterAndSortMetas(metasMes, producao) {
    let list = [...metasMes].filter(m => !m.tipo || m.tipo === 'faturamento');
    
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase().trim();
      list = list.filter(m => {
        const padeiro = this.padeiros.find(p => p.id === m.padeiroId);
        const name = (padeiro ? padeiro.nome : m.padeiroNome || '').toLowerCase();
        return name.includes(q);
      });
    }
    
    if (this.sortOption === 'name-asc') {
      list.sort((a, b) => {
        const pA = this.padeiros.find(p => p.id === a.padeiroId);
        const pB = this.padeiros.find(p => p.id === b.padeiroId);
        const nameA = pA ? pA.nome : a.padeiroNome || '';
        const nameB = pB ? pB.nome : b.padeiroNome || '';
        return nameA.localeCompare(nameB);
      });
    } else if (this.sortOption === 'meta-desc') {
      list.sort((a, b) => (b.metaKg || 0) - (a.metaKg || 0));
    } else if (this.sortOption === 'meta-asc') {
      list.sort((a, b) => (a.metaKg || 0) - (b.metaKg || 0));
    } else if (this.sortOption === 'progress-desc') {
      list.sort((a, b) => {
        const rA = producao[a.padeiroId] || 0;
        const pctA = a.metaKg > 0 ? (rA / a.metaKg) : 0;
        const rB = producao[b.padeiroId] || 0;
        const pctB = b.metaKg > 0 ? (rB / b.metaKg) : 0;
        return pctB - pctA;
      });
    }
    
    return list;
  },
  
  updateDesktopTable() {
    const tbody = document.getElementById('goals-table-body');
    if (!tbody) return;
    
    const mesAtual = new Date().toISOString().slice(0,7);
    const faturamentoMetas = this.metas.filter(m => !m.tipo || m.tipo === 'faturamento');
    const metasMes = faturamentoMetas.filter(m => m.periodo === mesAtual);
    const producao = this.calculateBakerProduction(mesAtual);
    
    const listToShow = this.filterAndSortMetas(metasMes.length > 0 ? metasMes : faturamentoMetas, producao);
    
    if (listToShow.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding: 24px; color:#999; font-weight:500;">Nenhuma meta correspondente encontrada.</td></tr>';
      return;
    }
    
    const totalRealizado = Object.values(producao).reduce((a,b)=>a+b,0);
    tbody.innerHTML = listToShow.map(m => {
      const realizado = m.padeiroId ? (producao[m.padeiroId] || 0) : totalRealizado;
      const pct = m.metaKg > 0 ? Math.round((realizado / m.metaKg) * 100) : 0;
      const padeiro = this.padeiros.find(p => p.id === m.padeiroId);
      const initials = padeiro ? padeiro.nome.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase() : (m.nome ? m.nome.replace('Autônomo (', '').replace(')', '').split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase() : 'AU');
      const avatarColors = ['#E55A2B', '#FF9A3C', '#34C759', '#1C1A14', '#FF2D55'];
      const color = avatarColors[initials.charCodeAt(0) % avatarColors.length];
      const photoSrc = padeiro ? (padeiro.foto || padeiro.fotoPath || padeiro.avatar || padeiro.imagem) : '';
      
      return `
        <tr>
          <td><input type="checkbox" style="border-radius:4px; border:1px solid #D1D5DB; accent-color:#E55A2B;" disabled></td>
          <td>
            <div style="display:flex; align-items:center; gap:12px;">
              ${photoSrc ? `
                <img src="${photoSrc}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;" />
              ` : `
                <div style="width:32px; height:32px; border-radius:50%; background:${color}; color:#FFF; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:600;">${initials}</div>
              `}
              <span style="font-weight:500; color:#111;">${padeiro ? padeiro.nome : m.nome || 'Autônomo'}</span>
            </div>
          </td>
          <td style="color:#6B7280; font-family:monospace;">#${m.id.substring(0,6)}</td>
          <td style="color:#6B7280;">${mesAtual}</td>
          <td>
            <span style="padding:4px 10px; border-radius:12px; font-size:12px; font-weight:500; background:${pct >= 100 ? '#ECFDF3' : pct >= 50 ? '#EFF6FF' : '#FEF3F2'}; color:${pct >= 100 ? '#027A48' : pct >= 50 ? '#175CD3' : '#B42318'};">
              ${pct >= 100 ? 'Atingida' : pct >= 50 ? 'Em progresso' : 'Pendente'}
            </span>
          </td>
          <td style="color:#111; font-weight:500;">R$ ${(m.metaKg || 0).toFixed(2).replace('.', ',')}</td>
          <td style="color:#6B7280;">R$ ${realizado.toFixed(2).replace('.', ',')}</td>
          <td>
            <div style="display:flex; gap:12px;">
              <button class="btn btn-icon btn-sm" onclick="Metas.openMetaForm('faturamento', '${m.id}')" title="Editar" style="background:none; border:none; cursor:pointer;"><i data-lucide="pencil" style="color:#9CA3AF; width:16px;"></i></button>
              <button class="btn btn-icon btn-sm" onclick="Metas.deleteMeta('${m.id}')" title="Excluir" style="background:none; border:none; cursor:pointer;"><i data-lucide="trash-2" style="color:#EF4444; width:16px;"></i></button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
    
    if (window.lucide) lucide.createIcons();
  },

  openMetaMensalDetails(year, monthIndex) {
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const mesLabel = meses[monthIndex];
    const monthStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
    const faturamentoMetas = this.metas.filter(m => !m.tipo || m.tipo === 'faturamento');
    const metasMes = faturamentoMetas.filter(m => m.periodo === monthStr);
    const producaoMes = this.calculateBakerProduction(monthStr);

    const rows = metasMes.length > 0 ? metasMes.map(m => {
      const realizado = producaoMes[m.padeiroId] || 0;
      const pct = m.metaKg > 0 ? Math.round((realizado / m.metaKg) * 100) : 0;
      const padeiro = this.padeiros.find(p => p.id === m.padeiroId);
      const cor = pct >= 100 ? 'var(--success)' : pct >= 50 ? 'var(--primary)' : 'var(--danger)';
      return `<tr>
        <td style="font-weight:600">${padeiro ? padeiro.nome.split(' ').slice(0,2).join(' ') : '—'}</td>
        <td>R$ ${(m.metaKg || 0).toFixed(2).replace('.', ',')}</td>
        <td style="color:${cor};font-weight:700">R$ ${realizado.toFixed(2).replace('.', ',')}</td>
        <td style="min-width:150px">
          <div class="progress-bar-inline-container">
            <div class="progress-bar-inline" style="flex:1;"><div class="progress-bar" style="width:${Math.min(pct,100)}%;background:${cor};"></div></div>
            <span style="font-size:12px;font-weight:700;min-width:36px;text-align:right;color:var(--text-primary)">${pct}%</span>
          </div>
        </td>
      </tr>`;
    }).join('') : `<tr><td colspan="4" style="text-align:center;color:var(--text-tertiary);padding:24px;">Nenhuma meta cadastrada para ${mesLabel}.</td></tr>`;

    Components.showModal(`Metas — ${mesLabel} de ${year}`, `
      <div class="table-responsive">
        <table>
          <thead><tr><th>Funcionário</th><th>Meta</th><th>Realizado</th><th>Progresso</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`,
      `<button class="btn btn-secondary" onclick="Components.closeModal()">Fechar</button>
       <button class="btn btn-primary" onclick="Components.closeModal();Metas.openMetaCreateChoice()">+ Nova Meta</button>`
    );
    Components.renderIcons();
  },

  openMetaCreateChoice() {
    const isDesktop = window.innerWidth >= 768;
    
    const contentHtml = `
      <div style="display: flex; flex-direction: ${isDesktop ? 'row' : 'column'}; gap: 20px; padding: 10px 0;">
        <!-- Card Faturamento -->
        <div onclick="Components.closeModal(); Metas.openMetaForm('faturamento')" style="flex: 1; background: #ffffff; border-radius: 18px; border: 1px solid rgba(0,0,0,0.08); padding: 24px; cursor: pointer; text-align: center; transition: all 0.2s ease; box-shadow: 0 4px 12px rgba(0,0,0,0.03);" onmouseover="this.style.transform='translateY(-2px)'; this.style.borderColor='#E55A2B'; this.style.boxShadow='0 8px 24px rgba(0,0,0,0.08)';" onmouseout="this.style.transform='none'; this.style.borderColor='rgba(0,0,0,0.08)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.03)';">
          <div style="width: 48px; height: 48px; border-radius: 50%; background: rgba(229, 90, 43, 0.1); color: #E55A2B; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
            <i data-lucide="trending-up" style="width: 24px; height: 24px;"></i>
          </div>
          <h4 style="font-size: 16px; font-weight: 700; color: #111; margin: 0 0 8px 0;">Faturamento</h4>
          <p style="font-size: 13px; color: #6B7280; margin: 0; line-height: 1.4;">Defina alvos de faturamento ou produção por funcionário.</p>
        </div>

        <!-- Card Equipamentos -->
        <div onclick="Components.closeModal(); Metas.openMetaForm('equipamento')" style="flex: 1; background: #ffffff; border-radius: 18px; border: 1px solid rgba(0,0,0,0.08); padding: 24px; cursor: pointer; text-align: center; transition: all 0.2s ease; box-shadow: 0 4px 12px rgba(0,0,0,0.03);" onmouseover="this.style.transform='translateY(-2px)'; this.style.borderColor='#E55A2B'; this.style.boxShadow='0 8px 24px rgba(0,0,0,0.08)';" onmouseout="this.style.transform='none'; this.style.borderColor='rgba(0,0,0,0.08)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.03)';">
          <div style="width: 48px; height: 48px; border-radius: 50%; background: rgba(52, 199, 89, 0.1); color: #34C759; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
            <i data-lucide="wrench" style="width: 24px; height: 24px;"></i>
          </div>
          <h4 style="font-size: 16px; font-weight: 700; color: #111; margin: 0 0 8px 0;">Equipamentos</h4>
          <p style="font-size: 13px; color: #6B7280; margin: 0; line-height: 1.4;">Wishlist de ferramentas dos sonhos com progresso de aportes.</p>
        </div>
      </div>
    `;
    
    Components.showModal(
      'Sua meta é para equipamentos ou para faturamento?', 
      contentHtml, 
      `<button class="btn btn-secondary" onclick="Components.closeModal()" style="padding: 8px 16px; border-radius: 12px;">Cancelar</button>`,
      isDesktop ? 'premium-task-modal' : 'cronograma-task-modal'
    );
    Components.renderIcons();
  },

  openMetaForm(tipo, id) {
    if (id && !tipo) {
      const m = this.metas.find(x => x.id === id);
      tipo = m ? m.tipo : 'faturamento';
    } else if (!tipo) {
      tipo = 'faturamento';
    }
    
    const m = id ? this.metas.find(x => x.id === id) : {};
    const mesAtual = new Date().toISOString().slice(0,7);
    const isDesktop = window.innerWidth >= 768;
    let contentHtml, footerHtml;

    if (tipo === 'equipamento') {
      // Equipment Modal (Bento / High Premium style)
      if (isDesktop) {
        contentHtml = `
          <form id="meta-form" onsubmit="event.preventDefault(); Metas.saveMeta('${id||''}')" class="premium-desktop-form">
            <input type="hidden" name="tipo" value="equipamento">
            <div class="p-bento-container">
              <div class="p-bento-col">
                <!-- Card 1: Equipamento -->
                <div class="p-bento-card" style="position:relative;">
                  <h4 class="p-bento-title"><i data-lucide="wrench"></i> Equipamento</h4>
                  <div class="p-form-group">
                    <label>Produto</label>
                    <select class="p-input trello-select" name="nome" id="tool-select-control" required onchange="Metas.onToolSelectChange(this)">
                      <option value="">Selecione um produto...</option>
                      ${this.ferramentas.map(t => {
                        const preco = parseFloat(t.precoMedio || t.precoMin || 0);
                        const isSelected = m.nome === t.nome;
                        return `<option value="${t.nome}" data-price="${preco}" ${isSelected?'selected':''}>${t.nome} (R$ ${preco.toFixed(2).replace('.', ',')})</option>`;
                      }).join('')}
                      ${(m.nome && !this.ferramentas.some(t => t.nome === m.nome)) ? `<option value="${m.nome}" data-price="${m.metaKg || 0}" selected>${m.nome} (R$ ${(m.metaKg || 0).toFixed(2).replace('.', ',')})</option>` : ''}
                    </select>
                    <div style="margin-top:8px;">
                      <button type="button" class="btn btn-link btn-sm" onclick="Metas.toggleCustomToolSection(true)" style="color:#E55A2B; background:none; border:none; padding:0; cursor:pointer; font-size:12px; font-weight:600;">+ Cadastrar novo produto no banco</button>
                    </div>
                  </div>
                </div>
                
                <!-- Card 2: Observação -->
                <div class="p-bento-card">
                  <h4 class="p-bento-title"><i data-lucide="align-left"></i> Observação</h4>
                  <div class="p-form-group" style="margin-bottom:0;">
                    <textarea class="p-input" name="observacao" rows="2" placeholder="Ex: Comprar na cor preta, voltagem 220V...">${m.observacao||''}</textarea>
                  </div>
                </div>
              </div>

              <div class="p-bento-col">
                <!-- Custom Tool Register Card (collapsible) -->
                <div id="custom-tool-section" style="display:none; background:#ffffff; border-radius:20px; padding:24px; border:1px solid rgba(229, 90, 43, 0.15); box-shadow: 0 8px 24px -8px rgba(229,90,43,0.08); margin-bottom: 20px;">
                  <h4 class="p-bento-title" style="color:#E55A2B; margin-bottom: 12px;"><i data-lucide="plus-circle"></i> Novo Produto</h4>
                  <div class="p-form-group">
                    <label>Nome da Ferramenta</label>
                    <input type="text" id="custom-tool-name" class="p-input" placeholder="Ex: Lixadeira Bosch GEX 125">
                  </div>
                  <div class="p-form-group" style="margin-top:12px;">
                    <label>Preço Médio (R$)</label>
                    <input type="number" id="custom-tool-price" class="p-input" step="0.01" placeholder="Ex: 580,00">
                  </div>
                  <div style="display:flex; gap:12px; justify-content:flex-end; margin-top:16px;">
                    <button type="button" class="btn btn-secondary btn-sm" onclick="Metas.toggleCustomToolSection(false)" style="font-size:12px; border-radius:6px; padding: 6px 12px; border:1px solid #D1D5DB; background:#FFF; cursor:pointer;">Cancelar</button>
                    <button type="button" class="btn btn-primary btn-sm" onclick="Metas.saveCustomTool()" style="font-size:12px; border-radius:6px; background:#E55A2B; border:none; color:#FFF; padding:6px 12px; cursor:pointer;">Cadastrar</button>
                  </div>
                </div>

                <!-- Card 3: Valor Alvo -->
                <div class="p-bento-card">
                  <h4 class="p-bento-title"><i data-lucide="dollar-sign"></i> Planejamento</h4>
                  <div class="p-form-group">
                    <label>Preço do Equipamento (R$)</label>
                    <input class="p-input" type="number" id="meta-target-price" name="metaKg" value="${m.metaKg||''}" step="0.01" required>
                  </div>
                </div>
              </div>
            </div>
          </form>
        `;
        footerHtml = `
          <button type="button" class="btn-premium-secondary" onclick="Components.closeModal()">Cancelar</button>
          <button type="button" class="btn-premium-primary" onclick="Metas.saveMeta('${id||''}')">Salvar</button>
        `;
      } else {
        contentHtml = `
          <form id="meta-form" onsubmit="event.preventDefault(); Metas.saveMeta('${id||''}')">
            <input type="hidden" name="tipo" value="equipamento">
            <div class="form-group">
              <label>Equipamento</label>
              <select class="input-control trello-select" name="nome" id="tool-select-control" required onchange="Metas.onToolSelectChange(this)" style="padding-left: 16px;">
                <option value="">Selecione um produto...</option>
                ${this.ferramentas.map(t => {
                  const preco = parseFloat(t.precoMedio || t.precoMin || 0);
                  const isSelected = m.nome === t.nome;
                  return `<option value="${t.nome}" data-price="${preco}" ${isSelected?'selected':''}>${t.nome} (R$ ${preco.toFixed(2).replace('.', ',')})</option>`;
                }).join('')}
                ${(m.nome && !this.ferramentas.some(t => t.nome === m.nome)) ? `<option value="${m.nome}" data-price="${m.metaKg || 0}" selected>${m.nome} (R$ ${(m.metaKg || 0).toFixed(2).replace('.', ',')})</option>` : ''}
              </select>
              <div style="margin-top:8px;">
                <button type="button" class="btn btn-link btn-sm" onclick="Metas.toggleCustomToolSection(true)" style="color:#E55A2B; background:none; border:none; padding:0; cursor:pointer; font-size:12px; font-weight:600;">+ Cadastrar novo produto no banco</button>
              </div>
            </div>

            <div id="custom-tool-section" style="display:none; padding:16px; border: 1px dashed rgba(229, 90, 43, 0.2); border-radius:12px; background:rgba(229, 90, 43, 0.02); margin-bottom:16px;">
              <h5 style="margin:0 0 12px 0; font-size:14px; font-weight:700; color:#E55A2B;">Cadastrar Novo Produto</h5>
              <div class="form-group">
                <label>Nome do Produto</label>
                <input type="text" id="custom-tool-name" class="input-control" placeholder="Ex: Lixadeira Makita" style="padding-left:16px;">
              </div>
              <div class="form-group">
                <label>Preço (R$)</label>
                <input type="number" id="custom-tool-price" class="input-control" step="0.01" placeholder="Ex: 450,00" style="padding-left:16px;">
              </div>
              <div style="display:flex; gap:12px; justify-content:flex-end; margin-top:12px;">
                <button type="button" class="btn btn-secondary btn-sm" onclick="Metas.toggleCustomToolSection(false)" style="font-size:12px; border-radius:6px; padding: 4px 12px; border:1px solid #D1D5DB; background:#FFF;">Cancelar</button>
                <button type="button" class="btn btn-primary btn-sm" onclick="Metas.saveCustomTool()" style="font-size:12px; border-radius:6px; background:#E55A2B; border:none; color:#FFF; padding:6px 12px;">Salvar</button>
              </div>
            </div>

            <div class="form-group">
              <label>Preço do Equipamento (R$)</label>
              <input class="input-control" type="number" id="meta-target-price" name="metaKg" value="${m.metaKg||''}" step="0.01" required style="padding-left: 16px;">
            </div>
            
            <div class="form-group">
              <label>Observação</label>
              <textarea class="input-control" name="observacao" rows="2" placeholder="Opcional..." style="padding-left: 16px;">${m.observacao||''}</textarea>
            </div>
          </form>
        `;
        footerHtml = `
          <button type="button" class="btn btn-secondary" onclick="Components.closeModal()">Cancelar</button>
          <button type="button" class="btn btn-primary" onclick="Metas.saveMeta('${id||''}')">Salvar</button>
        `;
      }
    } else {
      // Faturamento Modal (Original)
      if (isDesktop) {
        contentHtml = `
          <form id="meta-form" onsubmit="event.preventDefault(); Metas.saveMeta('${id||''}')" class="premium-desktop-form">
            <input type="hidden" name="tipo" value="faturamento">
            <div class="p-bento-container">
              <div class="p-bento-col">
                <!-- Card 1: Responsável -->
                <div class="p-bento-card">
                  <h4 class="p-bento-title"><i data-lucide="user"></i> Responsável</h4>
                  <div class="p-form-group">
                    <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; cursor: pointer; user-select: none;">
                      <input type="checkbox" name="isAutonomo" id="autonomo-checkbox" onchange="Metas.onAutonomoChange(this)" ${!m.padeiroId && m.id ? 'checked' : ''} style="cursor: pointer; width: 16px; height: 16px;">
                      <span>Sou Autônomo</span>
                    </label>
                    <div id="padeiro-select-wrapper" style="${!m.padeiroId && m.id ? 'display: none;' : ''}">
                      <label>Funcionário</label>
                      <select class="p-input trello-select" name="padeiroId" id="meta-padeiro-id" ${!m.padeiroId && m.id ? '' : 'required'}>
                        <option value="">Selecione...</option>
                        ${this.padeiros.map(p => `<option value="${p.id}" ${m.padeiroId===p.id?'selected':''}>${p.nome} (${p.cargo})</option>`).join('')}
                      </select>
                    </div>
                  </div>
                </div>
                
                <!-- Card 2: Observação -->
                <div class="p-bento-card">
                  <h4 class="p-bento-title"><i data-lucide="align-left"></i> Observação</h4>
                  <div class="p-form-group" style="margin-bottom:0;">
                    <textarea class="p-input" name="observacao" rows="2" placeholder="Opcional...">${m.observacao||''}</textarea>
                  </div>
                </div>
              </div>

              <div class="p-bento-col">
                <!-- Card 3: Planejamento -->
                <div class="p-bento-card">
                  <h4 class="p-bento-title"><i data-lucide="target"></i> Planejamento</h4>
                  <div class="p-form-group">
                    <label>Meta de Produção (R$)</label>
                    <input class="p-input" type="number" name="metaKg" value="${m.metaKg||''}" step="0.01" required>
                  </div>
                  <div class="p-form-group" style="margin-top: 16px;">
                    <label>Período (Mês)</label>
                    <input class="p-input" type="month" name="periodo" value="${m.periodo||mesAtual}" required>
                  </div>
                </div>
              </div>
            </div>
          </form>
        `;
        footerHtml = `
          <button type="button" class="btn-premium-secondary" onclick="Components.closeModal()">Cancelar</button>
          <button type="button" class="btn-premium-primary" onclick="Metas.saveMeta('${id||''}')">Salvar</button>
        `;
      } else {
        contentHtml = `
          <form id="meta-form" onsubmit="event.preventDefault(); Metas.saveMeta('${id||''}')">
            <input type="hidden" name="tipo" value="faturamento">
            <div class="form-group">
              <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; cursor: pointer; user-select: none;">
                <input type="checkbox" name="isAutonomo" id="autonomo-checkbox" onchange="Metas.onAutonomoChange(this)" ${!m.padeiroId && m.id ? 'checked' : ''} style="cursor: pointer; width: 16px; height: 16px;">
                <span>Sou Autônomo</span>
              </label>
            </div>
            <div class="form-group" id="padeiro-select-wrapper" style="${!m.padeiroId && m.id ? 'display: none;' : ''}">
              <label>Funcionário</label>
              <select class="input-control trello-select" name="padeiroId" id="meta-padeiro-id" ${!m.padeiroId && m.id ? '' : 'required'} style="padding-left: 16px;">
                <option value="">Selecione...</option>
                ${this.padeiros.map(p => `<option value="${p.id}" ${m.padeiroId===p.id?'selected':''}>${p.nome} (${p.cargo})</option>`).join('')}
              </select>
            </div>
            <div class="flex gap-4">
              <div class="form-group w-full">
                <label>Meta de Produção (R$)</label>
                <input class="input-control" type="number" name="metaKg" value="${m.metaKg||''}" step="0.01" required style="padding-left: 16px;">
              </div>
              <div class="form-group w-full">
                <label>Período (Mês)</label>
                <input class="input-control" type="month" name="periodo" value="${m.periodo||mesAtual}" required style="padding-left: 16px;">
              </div>
            </div>
            <div class="form-group">
              <label>Observação</label>
              <textarea class="input-control" name="observacao" rows="2" placeholder="Opcional..." style="padding-left: 16px;">${m.observacao||''}</textarea>
            </div>
          </form>
        `;
        footerHtml = `
          <button type="button" class="btn btn-secondary" onclick="Components.closeModal()">Cancelar</button>
          <button type="button" class="btn btn-primary" onclick="Metas.saveMeta('${id||''}')">Salvar</button>
        `;
      }
    }

    const title = tipo === 'equipamento' ? (id ? 'Editar Equipamento' : 'Novo Equipamento') : (id ? 'Editar Meta de Faturamento' : 'Nova Meta de Faturamento');

    Components.showModal(
      title, 
      contentHtml, 
      footerHtml, 
      isDesktop ? 'premium-task-modal' : 'cronograma-task-modal'
    );
    Components.renderIcons();

    if (window.HigPopovers) {
      setTimeout(() => window.HigPopovers.initCustomSelects(), 50);
    }
  },

  async saveMeta(id) {
    const form = document.getElementById('meta-form');
    if (!form.checkValidity()) return form.reportValidity();

    const body = Object.fromEntries(new FormData(form));
    body.metaKg = parseFloat(body.metaKg);
    
    if (body.tipo === 'equipamento') {
      body.padeiroId = null;
      body.padeiroNome = null;
    } else {
      if (body.isAutonomo === 'on') {
        body.padeiroId = null;
        body.padeiroNome = null;
        const currentUser = API.getUser();
        body.nome = `Autônomo (${currentUser ? currentUser.nome : 'Sem Nome'})`;
      } else {
        const padeiro = this.padeiros.find(p => p.id === body.padeiroId);
        if (padeiro) body.padeiroNome = padeiro.nome;
        body.nome = null;
      }
    }

    try {
      if (id) await API.put(`/api/metas/${id}`, body);
      else await API.post('/api/metas', body);
      Components.closeModal();
      Components.toast('Meta salva!','success');
      await this.render();
    } catch(e) { Components.toast(e.message,'error'); }
  },

  async deleteMeta(id) {
    if (confirm('Excluir esta meta?')) {
      try { 
        await API.delete(`/api/metas/${id}`); 
        Components.toast('Meta excluída.','success'); 
        await Metas.render(); 
      } catch(e) { Components.toast(e.message,'error'); }
    }
  },

  async resetMetas() {
    if (confirm('⚠️ ATENÇÃO: Isso excluirá TODAS as metas de todos os meses e funcionários. Deseja continuar?')) {
      try {
        await API.delete('/api/metas/reset/all');
        Components.toast('Todas as metas foram excluídas.', 'success');
        await this.render();
      } catch(e) {
        Components.toast(e.message, 'error');
      }
    }
  },

  renderEquipamentosTab() {
    const equipMetas = this.metas.filter(m => m.tipo === 'equipamento');
    const totalPlanejado = equipMetas.reduce((sum, m) => sum + (m.metaKg || 0), 0);
    const totalRealizado = equipMetas.reduce((sum, m) => sum + (m.realizado || 0), 0);
    const progressoGeral = totalPlanejado > 0 ? Math.min(100, Math.round((totalRealizado / totalPlanejado) * 100)) : 0;
    const atingidas = equipMetas.filter(m => m.realizado >= m.metaKg).length;
    const totalMetas = equipMetas.length;

    // Mobile metrics HTML
    const mobileMetrics = `
      <div class="mobile-only apple-metrics-grid">
        <div class="apple-metric-card">
          <div class="apple-metric-header">
            <div class="apple-metric-icon-box orange"><i data-lucide="target"></i></div>
          </div>
          <div class="apple-metric-value">R$ ${totalPlanejado.toFixed(2).replace('.', ',')}</div>
          <div class="apple-metric-label">Total Planejado</div>
        </div>
        <div class="apple-metric-card">
          <div class="apple-metric-header">
            <div class="apple-metric-icon-box blue"><i data-lucide="piggy-bank"></i></div>
          </div>
          <div class="apple-metric-value">R$ ${totalRealizado.toFixed(2).replace('.', ',')}</div>
          <div class="apple-metric-label">Total Aportado</div>
        </div>
        <div class="apple-metric-card">
          <div class="apple-metric-header">
            <div class="apple-metric-icon-box green"><i data-lucide="trending-up"></i></div>
          </div>
          <div class="apple-metric-value">${progressoGeral}%</div>
          <div class="apple-metric-label">Progresso Geral</div>
        </div>
      </div>
    `;

    // Desktop metrics HTML
    const desktopMetrics = `
      <div class="desktop-only goals-kpi-grid">
        <div class="goals-kpi-card goals-animate-cascade" style="animation-delay: 0.05s">
          <div class="goals-kpi-header">
            <span class="goals-kpi-title">Total Planejado</span>
            <div class="goals-kpi-icon-wrap lightblue"><i data-lucide="target" style="width: 20px;"></i></div>
          </div>
          <div class="goals-kpi-body">
            <span class="goals-kpi-value">R$ ${totalPlanejado.toFixed(2).replace('.', ',')}</span>
          </div>
          <div class="goals-kpi-footer">Custo total dos equipamentos desejados</div>
        </div>

        <div class="goals-kpi-card gradient-blue goals-animate-cascade" style="animation-delay: 0.1s">
          <div class="goals-kpi-header">
            <span class="goals-kpi-title">Total Aportado</span>
            <div class="goals-kpi-icon-wrap"><i data-lucide="piggy-bank" style="width: 20px;"></i></div>
          </div>
          <div class="goals-kpi-body">
            <span class="goals-kpi-value">R$ ${totalRealizado.toFixed(2).replace('.', ',')}</span>
          </div>
          <div class="goals-kpi-footer">Dinheiro economizado isoladamente</div>
        </div>

        <div class="goals-kpi-card goals-animate-cascade" style="animation-delay: 0.15s">
          <div class="goals-kpi-header">
            <span class="goals-kpi-title">Progresso Geral</span>
            <div class="goals-kpi-icon-wrap black"><i data-lucide="trending-up" style="width: 20px;"></i></div>
          </div>
          <div class="goals-kpi-body">
            <span class="goals-kpi-value">${progressoGeral}%</span>
          </div>
          <div class="goals-kpi-footer">Economia total completada</div>
        </div>

        <div class="goals-kpi-card goals-animate-cascade" style="animation-delay: 0.2s">
          <div class="goals-kpi-header">
            <span class="goals-kpi-title">Adquiridos / Metas</span>
            <div class="goals-kpi-icon-wrap blue"><i data-lucide="check-square" style="width: 20px;"></i></div>
          </div>
          <div class="goals-kpi-body">
            <span class="goals-kpi-value">${atingidas} / ${totalMetas}</span>
          </div>
          <div class="goals-kpi-footer">Ferramentas prontas para compra</div>
        </div>
      </div>
    `;

    let gridHtml = '';
    if (totalMetas === 0) {
      gridHtml = `
        <div style="text-align:center; padding: 48px 24px; background:#FFF; border-radius:20px; border: 1px dashed #E5E7EB; margin-bottom:48px;">
          <i data-lucide="wrench" style="width:48px; height:48px; color:#9CA3AF; margin-bottom:16px; margin-left:auto; margin-right:auto; display:block;"></i>
          <h4 style="font-size:18px; font-weight:700; color:#111; margin:0 0 8px 0;">Sua Wishlist está vazia</h4>
          <p style="font-size:14px; color:#6B7280; margin:0 0 24px 0; max-width:400px; margin-left:auto; margin-right:auto;">Cadastre as ferramentas dos seus sonhos para acompanhar a sua progressão de economia e compra!</p>
          <button class="btn btn-primary" onclick="Metas.openMetaForm('equipamento')" style="border-radius:20px; background:#E55A2B; border:none; color:#FFF; padding:8px 20px; font-weight:600; display:inline-flex; align-items:center; gap:8px; margin:0 auto; cursor:pointer;">
            <i data-lucide="plus" style="width:16px; height:16px;"></i> Cadastrar Ferramenta
          </button>
        </div>
      `;
    } else {
      gridHtml = `
        <div class="equipamentos-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap:24px; margin-bottom:48px;">
          ${equipMetas.map(m => {
            const pct = m.metaKg > 0 ? Math.min(100, Math.round((m.realizado / m.metaKg) * 100)) : 0;
            const isCompleted = m.realizado >= m.metaKg;
            
            return `
              <div class="equip-card" style="background:#FFF; border-radius:20px; padding:24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); border:1px solid rgba(0,0,0,0.03); display:flex; flex-direction:column; justify-content:space-between; position:relative; transition: transform 0.2s, box-shadow 0.2s;" onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 12px 30px rgba(0,0,0,0.08)';" onmouseout="this.style.transform='none'; this.style.boxShadow='0 4px 6px -1px rgba(0,0,0,0.02)';">
                <div>
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                    <span style="padding:4px 10px; border-radius:12px; font-size:11px; font-weight:700; text-transform:uppercase; background:${isCompleted ? '#ECFDF3' : '#FFF8F2'}; color:${isCompleted ? '#027A48' : '#E55A2B'};">
                      ${isCompleted ? 'Adquirido' : 'Em andamento'}
                    </span>
                    <div style="display:flex; gap:8px;">
                      <button class="btn btn-icon btn-sm" onclick="Metas.openMetaForm('equipamento', '${m.id}')" title="Editar" style="background:none; border:none; cursor:pointer; padding:2px;"><i data-lucide="pencil" style="color:#9CA3AF; width:16px;"></i></button>
                      <button class="btn btn-icon btn-sm" onclick="Metas.deleteMeta('${m.id}')" title="Excluir" style="background:none; border:none; cursor:pointer; padding:2px;"><i data-lucide="trash-2" style="color:#EF4444; width:16px;"></i></button>
                    </div>
                  </div>
                  
                  <h4 style="font-size:18px; font-weight:700; color:#111; margin:0 0 4px 0;">${m.nome}</h4>
                  <p style="font-size:13px; color:#6B7280; margin:0 0 16px 0; min-height: 38px;">${m.observacao || 'Nenhuma observação.'}</p>
                  
                  <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:13px;">
                    <span style="color:#6B7280; font-weight:500;">Preço Alvo:</span>
                    <span style="color:#111; font-weight:700;">R$ ${m.metaKg.toFixed(2).replace('.', ',')}</span>
                  </div>
                  
                  <div style="display:flex; justify-content:space-between; margin-bottom:16px; font-size:13px;">
                    <span style="color:#6B7280; font-weight:500;">Aportado:</span>
                    <span style="color:#34C759; font-weight:700;">R$ ${m.realizado.toFixed(2).replace('.', ',')}</span>
                  </div>
                </div>
                
                <div>
                  <div class="apple-progress-section" style="display:flex; align-items:center; gap:12px; margin-bottom:20px;">
                    <div class="apple-progress-container" style="flex: 1; height: 10px; background: #E5E5EA; border-radius: 5px; overflow: hidden;">
                      <div class="apple-progress-fill" style="height: 100%; width: ${pct}%; background: linear-gradient(90deg, #E55A2B 0%, #34C759 100%); border-radius: 5px;"></div>
                    </div>
                    <span style="font-size: 14px; font-weight: 700; color:#111; min-width:35px; text-align:right;">${pct}%</span>
                  </div>
                  
                  <div style="display:flex; gap:12px;">
                    <button class="btn-aporte" onclick="Metas.openAporteForm('${m.id}', '${m.nome.replace(/'/g, "\\'")}')" style="flex:1; height:38px; border-radius:10px; border:none; background:#E55A2B; color:#FFF; font-size:14px; font-weight:600; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px; transition: opacity 0.2s;" onmouseover="this.style.opacity='0.9';" onmouseout="this.style.opacity='1';">
                      <i data-lucide="plus-circle" style="width:16px; height:16px;"></i> Aportar
                    </button>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    return `
      ${mobileMetrics}
      ${desktopMetrics}
      ${gridHtml}
    `;
  },

  openAporteForm(id, nome) {
    const contentHtml = `
      <form id="aporte-form" onsubmit="event.preventDefault(); Metas.saveAporte('${id}')">
        <div class="form-group" style="margin-bottom: 0;">
          <label style="font-weight:600; font-size:14px; color:#333; margin-bottom:8px; display:block;">Valor do Aporte (R$)</label>
          <input class="input-control" type="number" name="valor" step="0.01" placeholder="Digite o valor..." required style="width:100%; box-sizing:border-box; padding-left:16px;" autofocus>
          <p style="font-size:12px; color:#6B7280; margin-top:8px;">Este valor será adicionado ao total economizado para <strong>${nome}</strong> e não aparecerá nas movimentações financeiras gerais.</p>
        </div>
      </form>
    `;
    
    const footerHtml = `
      <button type="button" class="btn btn-secondary" onclick="Components.closeModal()">Cancelar</button>
      <button type="button" class="btn btn-primary" onclick="Metas.saveAporte('${id}')">Confirmar</button>
    `;
    
    Components.showModal(
      `Adicionar Aporte — ${nome}`,
      contentHtml,
      footerHtml,
      'cronograma-task-modal'
    );
  },

  async saveAporte(id) {
    const form = document.getElementById('aporte-form');
    if (!form.checkValidity()) return form.reportValidity();
    
    const body = Object.fromEntries(new FormData(form));
    body.valor = parseFloat(body.valor);
    
    try {
      await API.post(`/api/metas/${id}/aporte`, body);
      Components.closeModal();
      Components.toast('Aporte realizado com sucesso!', 'success');
      await this.render();
    } catch (e) {
      Components.toast(e.message, 'error');
    }
  },

  onToolSelectChange(select) {
    const selectedOption = select.options[select.selectedIndex];
    const priceInput = document.getElementById('meta-target-price');
    if (selectedOption && priceInput) {
      const price = parseFloat(selectedOption.getAttribute('data-price')) || 0;
      priceInput.value = price;
    }
  },

  onAutonomoChange(checkbox) {
    const wrapper = document.getElementById('padeiro-select-wrapper');
    const select = document.getElementById('meta-padeiro-id');
    if (checkbox.checked) {
      if (wrapper) wrapper.style.display = 'none';
      if (select) {
        select.removeAttribute('required');
        select.value = '';
        const trigger = wrapper ? wrapper.querySelector('.hig-select-wrapper') : null;
        if (trigger) trigger.style.display = 'none';
      }
    } else {
      if (wrapper) wrapper.style.display = 'block';
      if (select) {
        select.setAttribute('required', 'required');
        const trigger = wrapper ? wrapper.querySelector('.hig-select-wrapper') : null;
        if (trigger) trigger.style.display = 'block';
      }
    }
  },
  
  toggleCustomToolSection(show) {
    const section = document.getElementById('custom-tool-section');
    if (section) section.style.display = show ? 'block' : 'none';
  },
  
  async saveCustomTool() {
    const nameInput = document.getElementById('custom-tool-name');
    const priceInput = document.getElementById('custom-tool-price');
    
    if (!nameInput || !priceInput) return;
    
    const nome = nameInput.value.trim();
    const preco = parseFloat(priceInput.value);
    
    if (!nome || isNaN(preco)) {
      Components.toast('Preencha o nome e preço do produto!', 'error');
      return;
    }
    
    try {
      const response = await API.post('/api/metas/ferramentas', { nome, preco });
      this.ferramentas.push(response);
      
      const select = document.getElementById('tool-select-control');
      if (select) {
        const opt = document.createElement('option');
        opt.value = response.nome;
        opt.text = `${response.nome} (R$ ${preco.toFixed(2).replace('.', ',')})`;
        opt.setAttribute('data-price', preco);
        opt.selected = true;
        select.appendChild(opt);

        const prev = select.previousElementSibling;
        if (prev && prev.classList.contains('hig-select-wrapper')) {
          prev.remove();
        }
        
        delete select.dataset.higInitialized;
        select.style.display = 'block';
        
        if (window.HigPopovers) {
          window.HigPopovers.initCustomSelects();
        }
        
        this.onToolSelectChange(select);
      }

      this.toggleCustomToolSection(false);
      nameInput.value = '';
      priceInput.value = '';
      Components.toast('Produto cadastrado e selecionado!', 'success');
    } catch(e) {
      Components.toast(e.message, 'error');
    }
  }
};
