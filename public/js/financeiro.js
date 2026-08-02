/**
 * Financeiro Module - Visão Geral Financeira Replicando o Mockup Perfeito
 * Bancada Sistema Padeiro
 */
window.Financeiro = {
  _periodo: 'mensal',
  _activeTab: 'financeiro',
  _data: null,

  async render() {
    const pageContainer = document.getElementById('page-container');
    if (!pageContainer) return;

    // Estrutura HTML do Painel Financeiro
    pageContainer.innerHTML = `
      <div class="fade-in financeiro-dashboard-wrapper">
        
        <!-- Top Toolbar / Filtros -->
        <div class="financeiro-toolbar">
          <div class="financeiro-header-left" style="display:flex; align-items:center; gap:12px;">
            <button class="toolbar-btn" onclick="App.navigate('admin-dashboard')" style="padding: 8px 16px; font-size: 12px; display:inline-flex; align-items:center; gap:6px; margin-right:4px;">
              <i data-lucide="arrow-left" style="width:14px; height:14px;"></i> Voltar
            </button>
            <div class="financeiro-tab-switcher">
              <div class="fin-tab-slider" style="transform: translateX(${this._activeTab === 'visao-geral' ? '100%' : '0'})"></div>
              <button class="fin-tab-btn ${this._activeTab === 'financeiro' ? 'active' : ''}" data-tab="financeiro" onclick="Financeiro.switchSubTab('financeiro')">Financeiro</button>
              <button class="fin-tab-btn ${this._activeTab === 'visao-geral' ? 'active' : ''}" data-tab="visao-geral" onclick="Financeiro.switchSubTab('visao-geral')">Visão Geral</button>
            </div>
          </div>
          <div class="financeiro-actions">
            <div class="fin-period-tabs" style="display:flex; background:#FFFFFF; border:1px solid rgba(28,26,20,0.08); border-radius:9999px; padding:3px; gap:2px;">
              <button class="fin-period-btn ${this._periodo === 'diario'  ? 'active' : ''}" data-p="diario" style="padding:6px 16px; border-radius:9999px; border:none; background:transparent; font-size:12px; font-weight:600; cursor:pointer; transition:all 0.2s ease;">Hoje</button>
              <button class="fin-period-btn ${this._periodo === 'semanal' ? 'active' : ''}" data-p="semanal" style="padding:6px 16px; border-radius:9999px; border:none; background:transparent; font-size:12px; font-weight:600; cursor:pointer; transition:all 0.2s ease;">Semana</button>
              <button class="fin-period-btn ${this._periodo === 'mensal'  ? 'active' : ''}" data-p="mensal" style="padding:6px 16px; border-radius:9999px; border:none; background:transparent; font-size:12px; font-weight:600; cursor:pointer; transition:all 0.2s ease;">Mês</button>
              <button class="fin-period-btn ${this._periodo === 'geral'   ? 'active' : ''}" data-p="geral" style="padding:6px 16px; border-radius:9999px; border:none; background:transparent; font-size:12px; font-weight:600; cursor:pointer; transition:all 0.2s ease;">Geral</button>
            </div>
          </div>
        </div>

        <!-- Loading overlay -->
        <div id="fin-loading" style="display:flex; flex-direction:column; align-items:center; justify-content:center; gap:14px; padding:80px; font-size:14px; color:var(--text-secondary);">
          <div class="fin-spinner" style="width:36px; height:36px; border:3px solid rgba(229,90,43,0.15); border-top-color:var(--primary); border-radius:50%; animation:fin-spin 0.8s linear infinite;"></div>
          <span>Carregando dados financeiros…</span>
        </div>

        <!-- Bento Grid Layout: Financeiro -->
        <div class="financeiro-bento-grid" id="fin-grid" style="display: ${this._activeTab === 'financeiro' ? 'grid' : 'none'}; opacity:0; transition:opacity .4s ease">
          
          <!-- CARD 1: Expense Breakdown / Heatmap de Orçamentos -->
          <div class="bento-card expense-breakdown-card cascade-item" style="--index: 0;">
            <div class="card-header-row">
              <h3 class="bento-card-title">Orçamentos por Dia</h3>
              <div class="card-actions">
                <button class="card-dropdown-btn" onclick="App.navigate('orcamentos')" title="Ir para Orçamentos">
                  Ver Todos
                  <i data-lucide="chevron-right"></i>
                </button>
              </div>
            </div>
            <div class="heatmap-container" id="heatmap-container">
              <!-- Renderizado dinamicamente -->
            </div>
            <div class="heatmap-legend">
              <div class="legend-item">
                <span class="legend-dot color-light" style="background-color:#F0EDE8"></span>
                <span>Nenhum</span>
              </div>
              <div class="legend-item">
                <span class="legend-dot color-medium" style="background-color:#FF9A3C"></span>
                <span>1-3</span>
              </div>
              <div class="legend-item">
                <span class="legend-dot color-dark" style="background-color:#E55A2B"></span>
                <span>4+</span>
              </div>
              <div class="legend-item">
                <span class="legend-dot color-striped" style="background:repeating-linear-gradient(45deg,#1C1A14,#1C1A14 3px,#333026 3px,#333026 6px)"></span>
                <span>Fora</span>
              </div>
            </div>
            <div id="heatmap-summary-box"></div>
          </div>

          <!-- CARD 2: Class Mastery -->
          <div class="bento-card class-mastery-card cascade-item" style="--index: 1;">
            <div>
              <div class="class-mastery-pill">
                <span class="pill-dot"></span>
                Suporte Premium Ativo
              </div>
              <h2 class="class-mastery-title" style="margin-top:16px">Gestão Financeira<br>Unificada</h2>
            </div>
            <div class="class-mastery-action-row">
              <button class="join-class-btn" onclick="App.navigate('relatorios')">
                Ver Relatórios
                <div class="btn-arrow-circle">
                  <i data-lucide="arrow-up-right"></i>
                </div>
              </button>
            </div>
            <div class="class-mastery-bg-waves">
              <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0,120 Q50,150 100,120 T200,120" stroke="rgba(255,255,255,0.05)" stroke-width="4" fill="none"/>
                <path d="M0,140 Q50,170 100,140 T200,140" stroke="rgba(255,255,255,0.08)" stroke-width="4" fill="none"/>
              </svg>
            </div>
          </div>

          <!-- CARD 3: Today Received / Recebido Hoje -->
          <div class="bento-card today-received-card cascade-item" style="--index: 2;">
            <div class="today-received-header">
              <div class="received-icon-circle">
                <i data-lucide="arrow-down-left"></i>
              </div>
              <span class="today-received-label" id="kpi-hoje-label">Recebido Hoje</span>
            </div>
            <div class="received-value-wrapper">
              <span class="received-currency">R$</span>
              <span class="received-value" id="kpi-hoje">—</span>
            </div>
            <div class="today-received-footer">
              <div class="growth-indicator positive" id="badge-hoje">
                <span id="txt-hoje-var">—</span>
                <i data-lucide="arrow-up-right"></i>
              </div>
              <button class="received-chevron-btn" onclick="App.navigate('orcamentos')" title="Ver Orçamentos">
                <i data-lucide="chevron-right"></i>
              </button>
            </div>
          </div>

          <!-- CARD 4: Financial Report -->
          <div class="bento-card financial-report-card cascade-item" style="--index: 3;">
            <div class="report-header">
              <button class="report-close-btn" onclick="App.navigate('admin-dashboard')" title="Ir ao Dashboard">
                <i data-lucide="x"></i>
              </button>
              <div class="report-actions">
                <button class="report-action-icon" onclick="App.navigate('relatorios')" title="Ver Relatórios">
                  <i data-lucide="file-text"></i>
                </button>
                <button class="report-action-icon highlight" onclick="window.print()" title="Imprimir Relatório">
                  <i data-lucide="printer"></i>
                </button>
              </div>
            </div>
            <div class="report-body">
              <span class="report-pill">Exportar & Imprimir</span>
              <h4 class="report-title">Relatório Geral</h4>
            </div>
          </div>

          <!-- CARD 5: Income Sources / Receita por Mês -->
          <div class="bento-card income-sources-card cascade-item" style="--index: 4;">
            <div class="income-info-block">
              <div>
                <h3 class="bento-card-title">Fontes de Receita</h3>
                <span class="income-days-pill">Histórico 6M</span>
              </div>
              <div>
                <div class="income-value-row">
                  <span class="income-currency">R$</span>
                  <span class="income-value" id="bar-total">—</span>
                </div>
                <p class="income-description">Orçamentos aprovados no período</p>
              </div>
              <div class="income-legend">
                <div class="legend-item">
                  <span class="legend-dot source-salary" style="background-color:#E55A2B"></span>
                  <span>Aprovados</span>
                </div>
                <div class="legend-item">
                  <span class="legend-dot source-bonus" style="background-color:#FF9A3C"></span>
                  <span>Em Aberto</span>
                </div>
                <div class="legend-item">
                  <span class="legend-dot source-freelance" style="background-color:#FFD4C2"></span>
                  <span>Recusados</span>
                </div>
                <div class="legend-item">
                  <span class="legend-dot source-others" style="background-color:#1C1A14"></span>
                  <span>Contratos</span>
                </div>
              </div>
            </div>
            <div class="income-chart-block">
              <div class="card-header-row">
                <div class="chart-controls">
                  <button class="chart-control-btn" onclick="App.navigate('orcamentos')">
                    Orçamentos
                    <i data-lucide="chevron-right"></i>
                  </button>
                  <button class="chart-control-btn" onclick="App.navigate('relatorios')">
                    Relatórios
                    <i data-lucide="chevron-right"></i>
                  </button>
                </div>
              </div>
              <div class="growth-comparison">
                <span class="growth-percentage" id="bar-variacao">—</span>
                <span class="growth-text" id="bar-variacao-label">vs mês anterior</span>
              </div>
              <div class="custom-bar-chart" id="bar-chart">
                <!-- Barras dinâmicas -->
              </div>
            </div>
          </div>

          <!-- CARD 6: Financial Balance / Margem de Lucro -->
          <div class="bento-card financial-balance-card cascade-item" style="--index: 5;">
            <div class="card-header-row">
              <h3 class="bento-card-title">Margem de Lucro</h3>
              <button class="card-icon-btn" onclick="App.navigate('relatorios')" title="Ver Detalhes">
                <i data-lucide="arrow-up-right"></i>
              </button>
            </div>
            <div class="balance-legend">
              <div class="legend-item">
                <span class="legend-dot balance-total" style="background-color:#FFD4C2"></span>
                <span>Receita</span>
              </div>
              <div class="legend-item">
                <span class="legend-dot balance-profit" style="background-color:var(--primary)"></span>
                <span>Mão Obra</span>
              </div>
              <div class="legend-item">
                <span class="legend-dot balance-week" style="background-color:#F0EDE8"></span>
                <span>Lucro</span>
              </div>
            </div>
            <div class="radial-gauge-container">
              <div class="radial-gauge">
                <svg viewBox="0 0 200 120" class="gauge-svg" id="gauge-svg">
                  <defs>
                    <mask id="gauge-mask">
                      <rect x="0" y="0" width="200" height="120" fill="black" />
                      <path id="gauge-mask-path" d="M20,100 A80,80 0 0,1 180,100" fill="none" stroke="white" stroke-width="16" stroke-linecap="round" stroke-dasharray="251.33" stroke-dashoffset="251.33"/>
                    </mask>
                  </defs>
                  <path d="M20,100 A80,80 0 0,1 180,100" fill="none" stroke="#EBE5DF" stroke-width="12" stroke-linecap="round" stroke-dasharray="2, 6"/>
                  <path id="gauge-arc" d="M20,100 A80,80 0 0,1 180,100" fill="none" stroke="var(--primary)" stroke-width="12" stroke-linecap="round" stroke-dasharray="2, 6" mask="url(#gauge-mask)"/>
                </svg>
                <div class="gauge-overlay-center">
                  <span class="gauge-percentage-text" id="gauge-pct">—</span>
                  <span class="gauge-label-text">margem</span>
                </div>
              </div>
            </div>
            <div class="balance-footer-pill" id="gauge-footer" style="display:flex; justify-content:space-between; align-items:center;">
              <span>Carregando margem…</span>
            </div>
          </div>
</div><!-- /fin-grid -->

        <!-- Bento Grid Layout: Visão Geral (Salesforce Inspired Redesign) -->
        <div class="financeiro-bento-grid" id="visao-geral-grid" style="display: ${this._activeTab === 'visao-geral' ? 'grid' : 'none'}; opacity:0; transition:opacity .4s ease">
          
          <!-- BIG UNIFIED TOP CARD -->
          <div class="bento-card visao-geral-top-block" style="grid-column: span 3; display: flex; flex-direction: column; gap: 16px; padding: 24px; background-color: #FFFFFF; border-radius: 24px; border: var(--financeiro-border); box-shadow: var(--financeiro-shadow); position: relative;">
            
            <div class="visao-geral-top-row" style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px;">
              <!-- Column 1: Resumo de Orçamentos -->
              <div class="visao-summary-card-inner" id="visao-summary-card">
                <!-- Renderizado dinamicamente -->
              </div>
   
              <!-- Column 2: Receita Projetada -->
              <div class="visao-payout-card-inner" id="visao-payout-card">
                <!-- Renderizado dinamicamente -->
              </div>
            </div>

            <!-- Divider Line -->
            <div style="height: 1px; background-color: rgba(28, 26, 20, 0.06); margin: 4px -24px 0 -24px;"></div>

            <!-- Active Filters Bar -->
            <div class="visao-geral-filters-bar" style="padding: 8px 0;">
              <div class="filters-left">
                <span class="filters-label">Filtros ativos <span class="filter-badge" id="visao-filter-count">0</span></span>
              </div>
              <div class="filters-right">
                <select class="filter-select" id="visao-filter-cliente" onchange="Financeiro.filterVisaoBudgets()">
                  <option value="Todos">Todos os clientes</option>
                  <option value="Roberto Alves">Roberto Alves</option>
                  <option value="Ana Paula Silva">Ana Paula Silva</option>
                  <option value="Juliana Mendes">Juliana Mendes</option>
                  <option value="Panificadora Nápoles">Panificadora Nápoles</option>
                </select>

                <select class="filter-select" id="visao-filter-status" onchange="Financeiro.filterVisaoBudgets()">
                  <option value="Todos">Todos os status</option>
                  <option value="Aprovado">Aprovados</option>
                  <option value="Pendente">Pendentes</option>
                  <option value="Rascunho">Rascunhos</option>
                  <option value="Recusado">Recusados</option>
                </select>
                
                <div class="filter-date-btn">
                  <i data-lucide="calendar"></i>
                  <span>Novembro 2023</span>
                </div>
                
                <div class="filter-date-btn">
                  <i data-lucide="calendar"></i>
                  <span>Dezembro 2023</span>
                </div>
                
                <div class="filter-search">
                  <i data-lucide="search"></i>
                  <input type="text" id="visao-search-input" placeholder="Buscar orçamento..." oninput="Financeiro.filterVisaoBudgets()" />
                </div>
              </div>
            </div>

            <!-- Capsule Tabs floating on bottom border -->
            <div class="visao-floating-tabs-row" style="position: absolute; bottom: 0; left: 50%; transform: translate(-50%, 50%); z-index: 10;">
              <div class="panel-tabs" style="display: flex; gap: 8px;">
                <button class="panel-tab-btn active" data-tab="todos" onclick="Financeiro.setVisaoPanelTab('todos')">Todos</button>
                <button class="panel-tab-btn" data-tab="pendentes" onclick="Financeiro.setVisaoPanelTab('pendentes')">Pendente <span class="tab-badge-count">3</span></button>
                <button class="panel-tab-btn" data-tab="aprovados" onclick="Financeiro.setVisaoPanelTab('aprovados')">Aprovado <span class="tab-badge-count">3</span></button>
              </div>
            </div>

          </div><!-- /visao-geral-top-block -->

          <!-- Bottom: Large Bento Card (List-Detail Panel) -->
          <div class="bento-card visao-invoices-panel" style="grid-column: span 3; padding: 0; min-height: 520px; overflow: hidden; display: flex; flex-direction: column;">
            <!-- Header Tabs -->
            <div class="invoices-panel-header" style="display: flex; justify-content: space-between; align-items: center; padding: 16px 24px; border-bottom: 1px solid rgba(28, 26, 20, 0.05);">
              <h3 class="invoices-panel-title" style="margin: 0; font-size: 15px; font-weight: 700; color: var(--text-primary);">Orçamentos Recentes</h3>
              <div class="panel-actions-icons" style="display: flex; align-items: center; gap: 12px; color: var(--text-secondary);">
                <i data-lucide="list" style="width: 16px; height: 16px; cursor: pointer;"></i>
                <i data-lucide="more-vertical" style="width: 16px; height: 16px; cursor: pointer;"></i>
              </div>
            </div>
            
            <!-- List-Detail Body -->
            <div class="invoices-panel-body" style="display: flex; flex: 1; min-height: 0;">
              <!-- Left Sidebar: Budget List -->
              <div class="invoices-sidebar" id="visao-invoices-list-container">
                <!-- Renderizado dinamicamente -->
              </div>
              
              <!-- Right Pane: Budget Details -->
              <div class="invoices-details-pane" id="visao-invoice-details">
                <!-- Renderizado dinamicamente -->
              </div>
            </div>
          </div>

        </div><!-- /visao-geral-grid -->

      </div>
    `;

    // Adiciona animação de rotação ao spinner
    const style = document.createElement('style');
    style.id = 'financeiro-spinner-style';
    style.textContent = `
      @keyframes fin-spin { to { transform: rotate(360deg); } }
      .fin-period-btn.active {
        background: var(--primary) !important;
        color: #FFFFFF !important;
        box-shadow: 0 2px 8px rgba(229, 90, 43, 0.25);
      }
    `;
    document.head.appendChild(style);

    Components.renderIcons();
    this._bindPeriodTabs();
    await this._loadData();
  },

  async switchSubTab(tab) {
    this._activeTab = tab;
    const slider = document.querySelector('.fin-tab-slider');
    if (slider) slider.style.transform = `translateX(${tab === 'visao-geral' ? '100%' : '0'})`;
    
    document.querySelectorAll('.fin-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    // Control background gradient dynamically when switching tabs
    const pageContainer = document.getElementById('page-container');
    if (pageContainer) {
      if (this._activeTab === 'visao-geral') {
        pageContainer.classList.add('tf-page-active');
        document.body.classList.add('tf-page-active');
      } else {
        pageContainer.classList.remove('tf-page-active');
        document.body.classList.remove('tf-page-active');
      }
    }

    const finGrid = document.getElementById('fin-grid');
    const visaoGrid = document.getElementById('visao-geral-grid');
    
    if (this._data) {
      if (finGrid) {
        finGrid.style.display = tab === 'financeiro' ? 'grid' : 'none';
        finGrid.style.opacity = tab === 'financeiro' ? '1' : '0';
      }
      if (visaoGrid) {
        visaoGrid.style.display = tab === 'visao-geral' ? 'grid' : 'none';
        visaoGrid.style.opacity = tab === 'visao-geral' ? '1' : '0';
      }
      this._render(this._data);
      Components.renderIcons();
    } else {
      await this._loadData();
    }
  },

  _bindPeriodTabs() {
    document.querySelectorAll('.fin-period-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        this._periodo = btn.dataset.p;
        document.querySelectorAll('.fin-period-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        await this._loadData();
      });
    });
  },

  async _loadData() {
    const loading = document.getElementById('fin-loading');
    const finGrid = document.getElementById('fin-grid');
    const visaoGrid = document.getElementById('visao-geral-grid');
    const activeGrid = this._activeTab === 'financeiro' ? finGrid : visaoGrid;

    if (loading) loading.style.display = 'flex';
    if (finGrid) finGrid.style.opacity = '0';
    if (visaoGrid) visaoGrid.style.opacity = '0';

    try {
      const [stats, orcamentos] = await Promise.all([
        API.get(`/api/financeiro/stats?periodo=${this._periodo}`),
        API.get('/api/orcamentos')
      ]);

      this._data = stats;
      this._visaoBudgets = orcamentos || [];

      // Initialize control state if not present
      if (this._visaoSelectedIndex === undefined || this._visaoSelectedIndex >= this._visaoBudgets.length) {
        this._visaoSelectedIndex = 0;
      }
      if (this._visaoPanelTab === undefined) this._visaoPanelTab = "todos";
      if (this._visaoFilterStatus === undefined) this._visaoFilterStatus = "Todos";
      if (this._visaoFilterClient === undefined) this._visaoFilterClient = "Todos";
      if (this._visaoSearchQuery === undefined) this._visaoSearchQuery = "";

      // Control background gradient dynamically for Visão Geral view
      const pageContainer = document.getElementById('page-container');
      if (this._activeTab === 'visao-geral') {
        pageContainer.classList.add('tf-page-active');
        document.body.classList.add('tf-page-active');
      } else {
        pageContainer.classList.remove('tf-page-active');
        document.body.classList.remove('tf-page-active');
      }

      this._render(this._data);
    } catch (err) {
      console.error('[Financeiro] Erro ao carregar dados:', err);
      if (loading) loading.innerHTML = `<span style="color:var(--danger)">Erro ao carregar dados financeiros. Tente reiniciar o servidor.</span>`;
      return;
    }

    if (loading) loading.style.display = 'none';
    if (activeGrid) {
      activeGrid.style.display = 'grid';
      void activeGrid.offsetWidth;
      activeGrid.style.opacity = '1';
    }
    Components.renderIcons();
  },

  _render(d) {
    // ── Re-trigger cascade animation on the active grid's bento-cards
    const activeGridId = this._activeTab === 'financeiro' ? 'fin-grid' : 'visao-geral-grid';
    const activeGrid = document.getElementById(activeGridId);
    if (activeGrid) {
      activeGrid.querySelectorAll('.bento-card').forEach((card, idx) => {
        card.classList.remove('cascade-item');
        void card.offsetWidth; // force reflow
        card.style.setProperty('--index', idx);
        card.classList.add('cascade-item');
      });
    }

    // ── Dynamically update KPI received label based on period
    const labelMap = {
      'diario': 'Recebido Hoje',
      'semanal': 'Recebido na Semana',
      'mensal': 'Recebido no Mês',
      'geral': 'Recebido no Total'
    };
    this._setText('kpi-hoje-label', labelMap[this._periodo] || 'Recebido');

    // ── KPIs / Recebido Hoje
    this._setText('kpi-hoje', d.recebidoHojeFmt);
    this._renderBadgeHoje(d.variacaoHoje);

    // ── Gráfico de barras (Jan - Jun)
    this._renderBarChart(d.barChart, d.receitaBrutaFmt, d.variacaoReceita);

    // ── Gauge (Margem de Lucro)
    this._renderGauge(d.gaugePct, d.lucroBrutoFmt, d.receitaBrutaFmt);

    // ── Heatmap
    this._renderHeatmap(d.heatmapData);
    this._renderHeatmapSummary(d);

    // ── Render Visão Geral sub-view data
    this._renderVisaoGeral(d);
  },

  _setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val ?? '—';
  },

  _renderBadgeHoje(pct) {
    const el   = document.getElementById('badge-hoje');
    const txt  = document.getElementById('txt-hoje-var');
    if (!el || !txt) return;
    pct = parseFloat(pct) || 0;
    el.className = `growth-indicator ${pct >= 0 ? 'positive' : 'negative'}`;
    txt.textContent = `${pct >= 0 ? '+' : ''}${pct}%`;
    
    // Altera estilo do indicador de crescimento
    if (pct < 0) {
      el.style.backgroundColor = 'rgba(255, 59, 48, 0.1)';
      el.style.color = '#FF3B30';
    } else {
      el.style.backgroundColor = 'rgba(52, 199, 89, 0.1)';
      el.style.color = '#34C759';
    }
  },

  _renderBarChart(barChart, totalFmt, variacao) {
    const el = document.getElementById('bar-chart');
    const varEl = document.getElementById('bar-variacao');
    const totEl = document.getElementById('bar-total');
    if (!el) return;

    if (totEl) totEl.textContent = totalFmt;
    if (varEl) {
      const v = parseFloat(variacao) || 0;
      varEl.textContent = `${v >= 0 ? '+' : ''}${v}%`;
      varEl.className = `growth-percentage ${v >= 0 ? 'positive-text' : 'negative-text'}`;
      varEl.style.color = v >= 0 ? '#34C759' : '#FF3B30';
    }

    // Renderiza as barras exatamente conforme o design do mockup
    el.innerHTML = `
      <div class="chart-grid-line" style="bottom: 25%;"></div>
      <div class="chart-grid-line" style="bottom: 60%;"></div>
      <div class="chart-grid-line" style="bottom: 95%;"></div>
    `;

    // Filtra para pegar os últimos 4 meses de barChart para combinar perfeitamente com a visualização do mockup
    const barsToShow = barChart.slice(-4);
    
    el.innerHTML += barsToShow.map((b, i) => {
      const isLast = i === barsToShow.length - 1;
      const arrowIcon = b.valor > 0 ? 'arrow-up-right' : 'minus';
      
      // Cores alternadas e estilizadas do mockup original
      let barClass = 'bar-dark'; // Jan: orange escuro
      if (i === 1) barClass = 'bar-striped'; // Fev: listrado
      else if (i === 2) barClass = 'bar-primary'; // Mar: orange principal
      else if (i === 3) barClass = 'bar-light'; // Abr: orange claro

      return `
        <div class="bar-container">
          <div class="bar-label-pill ${isLast ? 'highlight' : ''}" style="animation-delay: ${i * 0.1 + 0.3}s;">
            <i data-lucide="${arrowIcon}"></i>
            ${b.valorFmt}
          </div>
          <div class="bar-fill ${barClass}" style="height:${b.height}%; animation-delay: ${i * 0.1}s;"></div>
          <span class="bar-month-label">${b.label}</span>
        </div>
      `;
    }).join('');
    
    Components.renderIcons();
  },

  _renderGauge(pct, lucroFmt, receitaFmt) {
    const pctEl  = document.getElementById('gauge-pct');
    const footer = document.getElementById('gauge-footer');
    const maskPath = document.getElementById('gauge-mask-path');

    if (pctEl) pctEl.textContent = `${pct}%`;
    if (footer) {
      footer.innerHTML = `
        <span>Margem de lucro calculada: ${pct}%</span>
        <span class="footer-badge-percent" style="background-color:rgba(52, 199, 89, 0.1); color:#34C759; padding:2px 6px; border-radius:9999px; font-weight:700; font-size:9px;">
          R$ ${lucroFmt}
        </span>
      `;
    }

    if (!maskPath) return;

    // Reset to 0% (full offset) without transition
    maskPath.style.transition = 'none';
    maskPath.style.strokeDashoffset = '251.33';

    // Force reflow
    void maskPath.getBoundingClientRect();

    // Enable transition and set target offset
    maskPath.style.transition = '';
    const totalLength = 251.33;
    const offset = totalLength * (1 - pct / 100);
    maskPath.style.strokeDashoffset = offset.toFixed(2);
  },

  _renderHeatmap(rows) {
    const container = document.getElementById('heatmap-container');
    if (!container) return;

    // Rótulos laterais das categorias
    const LABELS = ['Cozinha', 'Quarto', 'Escritório'];
    const classMap = { 0: 'color-empty', 1: 'color-striped', 2: 'color-medium', 3: 'color-dark' };

    // Agrupa todos os orçamentos nas 3 categorias usando dados de dias da semana para o heatmap de círculos
    container.innerHTML = `
      <div class="heatmap-labels">
        ${LABELS.map(lbl => `<span class="heatmap-label">${lbl}</span>`).join('')}
      </div>
      <div class="heatmap-grid-wrapper">
        ${rows.map((row, rIdx) => `
          <div class="heatmap-row">
            ${row.map(d => {
              // Mapeia intensidade dos orçamentos do dia da semana
              let intensity = d.intensity; 
              let dotClass = classMap[intensity] || 'color-empty';
              return `<div class="heatmap-dot ${dotClass}" title="${d.date}: ${d.count} orçamentos"></div>`;
            }).join('')}
          </div>
        `).join('')}
        <div class="heatmap-days">
          <span>S</span>
          <span>M</span>
          <span>T</span>
          <span>W</span>
          <span>T</span>
          <span>F</span>
          <span>S</span>
        </div>
      </div>
    `;
  },

  _renderHeatmapSummary(d) {
    const container = document.getElementById('heatmap-summary-box');
    if (!container) return;
    container.innerHTML = `
      <div class="heatmap-summary-container">
        <div class="heatmap-summary-item">
          <span class="summary-icon"><i data-lucide="file-text"></i></span>
          <div class="summary-info">
            <span class="summary-label">Total no Período</span>
            <span class="summary-val">${d.totalOrcamentos || 0}</span>
          </div>
        </div>
        <div class="heatmap-summary-item">
          <span class="summary-icon success"><i data-lucide="dollar-sign"></i></span>
          <div class="summary-info">
            <span class="summary-label">Aprovado (Receita)</span>
            <span class="summary-val">R$ ${d.receitaBrutaFmt || '0'}</span>
          </div>
        </div>
      </div>
    `;
  },

  _initVisaoData() {
    if (this._visaoBudgets) return;
    this._visaoBudgets = [];
    this._visaoSelectedIndex = 0;
    this._visaoPanelTab = "todos";
    this._visaoFilterStatus = "Todos";
    this._visaoFilterClient = "Todos";
    this._visaoSearchQuery = "";
  },

  selectVisaoBudget(index) {
    this._visaoSelectedIndex = index;
    const items = document.querySelectorAll('.budget-list-item');
    items.forEach((item) => {
      const origIndex = parseInt(item.getAttribute('onclick').match(/\d+/)[0], 10);
      item.classList.toggle('selected', origIndex === index);
    });

    const pane = document.getElementById('visao-invoice-details');
    if (pane) {
      pane.style.opacity = '0';
      pane.style.transform = 'translateY(10px)';
      setTimeout(() => {
        this._renderSelectedInvoiceDetails();
        pane.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
        pane.style.opacity = '1';
        pane.style.transform = 'translateY(0)';
      }, 80);
    }
  },

  setVisaoPanelTab(tab) {
    this._visaoPanelTab = tab;
    document.querySelectorAll('.panel-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    this._renderVisaoInvoicesList();
  },

  filterVisaoBudgets() {
    const statusSelect = document.getElementById('visao-filter-status');
    const clientSelect = document.getElementById('visao-filter-cliente');
    const searchInput = document.getElementById('visao-search-input');
    
    if (statusSelect) this._visaoFilterStatus = statusSelect.value;
    if (clientSelect) this._visaoFilterClient = clientSelect.value;
    if (searchInput) this._visaoSearchQuery = searchInput.value;

    this._renderVisaoInvoicesList();
  },

  _renderVisaoGeralSummaryCard() {
    const el = document.getElementById('visao-summary-card');
    if (!el) return;

    // Calculate sum of approved budgets
    const approvedBudgets = this._visaoBudgets.filter(o => this._isApproved(o.status));
    const totalApproved = approvedBudgets.reduce((s, o) => s + (parseFloat(o.valor_total) || 0), 0);
    
    // Sum of pending/sent budgets
    const pendingBudgets = this._visaoBudgets.filter(o => this._isPending(o.status));
    const totalPending = pendingBudgets.reduce((s, o) => s + (parseFloat(o.valor_total) || 0), 0);

    // Calculate average production days
    let totalPrazo = 0;
    let countPrazo = 0;
    approvedBudgets.forEach(o => {
      if (o.prazoEntrega) {
        const num = parseInt(o.prazoEntrega.match(/\d+/));
        if (!isNaN(num)) {
          totalPrazo += num;
          countPrazo++;
        }
      }
    });
    const avgPrazo = countPrazo > 0 ? Math.round(totalPrazo / countPrazo) : 15;

    const fmt = (v) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2 });

    // Generate dynamic timeline for the last 4 months
    const hoje = new Date();
    let timelineHtml = '';
    const avatarColors = ['av-orange', 'av-charcoal', 'av-peach'];
    let colorIdx = 0;

    for (let i = 3; i >= 0; i--) {
      const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      const mesStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const mesLabel = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
      
      const budgetsInMonth = this._visaoBudgets.filter(o => {
        const dStr = this._getBudgetDate(o);
        return dStr && dStr.startsWith(mesStr);
      });
      const totalInMonth = budgetsInMonth.reduce((s, o) => s + (parseFloat(o.valor_total) || 0), 0);
      const approvedInMonth = budgetsInMonth.filter(o => this._isApproved(o.status)).reduce((s, o) => s + (parseFloat(o.valor_total) || 0), 0);
      
      const pct = totalInMonth > 0 ? Math.round((approvedInMonth / totalInMonth) * 100) : 0;
      
      let barClass = 'fill-primary';
      if (i === 1) barClass = 'fill-light';
      else if (i === 2) barClass = 'fill-secondary';
      else if (i === 3) barClass = 'fill-primary';

      const seenClients = new Set();
      let avatarsHtml = '';
      budgetsInMonth.slice(0, 3).forEach(o => {
        if (o.clienteNome && !seenClients.has(o.clienteNome)) {
          seenClients.add(o.clienteNome);
          const initials = o.clienteNome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
          const colorClass = avatarColors[colorIdx % avatarColors.length];
          colorIdx++;
          avatarsHtml += `<div class="avatar-circle ${colorClass}" title="${o.clienteNome}">${initials}</div>`;
        }
      });

      timelineHtml += `
        <div class="month-col">
          <span class="month-name">${mesLabel}</span>
          <div class="timeline-bar">
            <div class="timeline-fill ${barClass}" style="width: ${totalInMonth > 0 ? pct : 0}%;"></div>
          </div>
          <div class="avatar-group">
            ${avatarsHtml || '<span style="font-size:10px; color:var(--text-tertiary);">—</span>'}
          </div>
        </div>
      `;
    }

    el.innerHTML = `
      <div class="summary-card-header">
        <h3 class="bento-card-title">Resumo Financeiro de Orçamentos</h3>
      </div>
      <div class="summary-card-kpis">
        <div class="kpi-col">
          <span class="kpi-label">Pendente de Recebimento</span>
          <div class="kpi-value-row">
            <span class="kpi-currency">R$</span>
            <span class="kpi-value">${fmt(totalPending)}</span>
          </div>
        </div>
        <div class="kpi-col">
          <span class="kpi-label">Aprovado no Período</span>
          <div class="kpi-value-row">
            <span class="kpi-currency">R$</span>
            <span class="kpi-value">${fmt(totalApproved)}</span>
          </div>
        </div>
        <div class="kpi-col">
          <span class="kpi-label">Prazo Médio de Produção</span>
          <div class="kpi-value-row">
            <span class="kpi-value-main">${avgPrazo}</span>
            <span class="kpi-value-sub">dias úteis</span>
          </div>
        </div>
      </div>
      
      <!-- Progress timeline matching Salesforce style -->
      <div class="summary-card-timeline">
        <div class="timeline-months">
          ${timelineHtml}
        </div>
      </div>
    `;
  },

  _renderVisaoGeralPayoutCard() {
    const el = document.getElementById('visao-payout-card');
    if (!el) return;

    const approvedBudgets = this._visaoBudgets.filter(o => this._isApproved(o.status));
    const totalApproved = approvedBudgets.reduce((s, o) => s + (parseFloat(o.valor_total) || 0), 0);

    const fmt = (v) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2 });

    el.innerHTML = `
      <div class="payout-card-header">
        <h3 class="bento-card-title">Receita Consolidada</h3>
        <button class="card-icon-btn" onclick="App.navigate('relatorios')" title="Ver Relatórios">
          <i data-lucide="arrow-up-right"></i>
        </button>
      </div>
      
      <div class="payout-value-wrapper">
        <span class="payout-label">Saldo em Carteira</span>
        <div class="payout-value-row">
          <span class="payout-currency">R$</span>
          <span class="payout-value">${fmt(totalApproved)}</span>
        </div>
        <span class="payout-sub">Projeção líquida do período</span>
      </div>

      <div class="payout-accounts">
        <!-- Account Card 1: Pix -->
        <div class="account-card pix-card">
          <span class="acc-number">Pix</span>
          <div class="acc-brand">
            <span class="acc-badge">Ativo</span>
          </div>
        </div>
        <!-- Account Card 2: Cartão (Stripe style, highlighted in orange) -->
        <div class="account-card card-highlight">
          <span class="acc-number">Cartão</span>
          <div class="acc-brand">
            <span class="acc-name">Stripe</span>
          </div>
        </div>
        <!-- Account Card 3: Boleto -->
        <div class="account-card boleto-card">
          <span class="acc-number">Boleto</span>
          <div class="acc-brand">
            <span class="acc-name">Banco</span>
          </div>
        </div>
      </div>
      
      <div class="payout-action-row">
        <button class="btn-payout-now" onclick="App.navigate('relatorios')">
          Exportar Relatório
          <i data-lucide="download" style="width:14px; height:14px; margin-left:6px;"></i>
        </button>
      </div>
    `;
  },

  _getDaysAgoString(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T12:00:00');
    const hoje = new Date();
    date.setHours(0,0,0,0);
    hoje.setHours(0,0,0,0);
    const diffTime = hoje - date;
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 0) return 'Em breve';
    return `Há ${diffDays} dias`;
  },

  _renderVisaoInvoicesList() {
    const listContainer = document.getElementById('visao-invoices-list-container');
    if (!listContainer) return;

    let filtered = [...this._visaoBudgets];

    const hoje = new Date();
    
    // Filter by period
    if (this._periodo === 'diario') {
      const hojeISO = hoje.toISOString().slice(0, 10);
      filtered = filtered.filter(o => this._getBudgetDate(o) === hojeISO);
    } else if (this._periodo === 'semanal') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(hoje.getDate() - 7);
      const limitISO = oneWeekAgo.toISOString().slice(0, 10);
      filtered = filtered.filter(o => this._getBudgetDate(o) >= limitISO);
    } else if (this._periodo === 'mensal') {
      const currentMonth = hoje.toISOString().slice(0, 7);
      filtered = filtered.filter(o => {
        const dStr = this._getBudgetDate(o);
        return dStr && dStr.startsWith(currentMonth);
      });
    }

    // Tab filter
    if (this._visaoPanelTab === 'pendentes') {
      filtered = filtered.filter(o => this._isPending(o.status));
    } else if (this._visaoPanelTab === 'aprovados') {
      filtered = filtered.filter(o => this._isApproved(o.status));
    }

    // Dropdown Status filter
    if (this._visaoFilterStatus !== 'Todos') {
      filtered = filtered.filter(o => (o.status || '').toLowerCase().replace(/_/g, ' ') === this._visaoFilterStatus.toLowerCase().replace(/_/g, ' '));
    }

    // Dropdown Client filter
    if (this._visaoFilterClient && this._visaoFilterClient !== 'Todos') {
      filtered = filtered.filter(o => o.clienteNome === this._visaoFilterClient);
    }

    // Search query
    if (this._visaoSearchQuery) {
      const q = this._visaoSearchQuery.toLowerCase();
      filtered = filtered.filter(o => 
        (o.codigo || '').toLowerCase().includes(q) || 
        (o.clienteNome || '').toLowerCase().includes(q) || 
        (o.descricao || '').toLowerCase().includes(q)
      );
    }

    // Update filters badge count
    const badgeEl = document.getElementById('visao-filter-count');
    if (badgeEl) {
      let count = 0;
      if (this._visaoFilterStatus !== 'Todos') count++;
      if (this._visaoFilterClient && this._visaoFilterClient !== 'Todos') count++;
      if (this._visaoSearchQuery) count++;
      badgeEl.textContent = count;
    }

    if (filtered.length === 0) {
      listContainer.innerHTML = `
        <div class="empty-list-state" style="padding: 40px 20px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; color: var(--text-tertiary);">
          <i data-lucide="info" style="width:24px; height:24px;"></i>
          <span style="font-size:12px; font-weight:600;">Nenhum orçamento encontrado</span>
        </div>
      `;
      Components.renderIcons();
      const detailsContainer = document.getElementById('visao-invoice-details');
      if (detailsContainer) detailsContainer.innerHTML = '';
      return;
    }

    listContainer.innerHTML = filtered.map((o) => {
      const origIndex = this._visaoBudgets.findIndex(item => item.id === o.id);
      const isSelected = origIndex === this._visaoSelectedIndex;
      const initials = o.clienteNome ? o.clienteNome.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase() : '??';
      const daysStr = this._getDaysAgoString(this._getBudgetDate(o));

      let badgeClass = '';
      if (this._isApproved(o.status)) badgeClass = 'status-badge-success';
      else if (this._isPending(o.status)) badgeClass = 'status-badge-warning';
      else badgeClass = 'status-badge-danger';

      return `
        <div class="budget-list-item ${isSelected ? 'selected' : ''}" onclick="Financeiro.selectVisaoBudget(${origIndex})">
          <div class="item-left">
            <div class="client-avatar-initials">${initials}</div>
          </div>
          <div class="item-center">
            <div class="item-header-row">
              <span class="budget-code">#${o.codigo ? o.codigo.replace('ORC-', '') : ''}</span>
              <span class="budget-days">${daysStr}</span>
            </div>
            <div class="item-client-name">${o.clienteNome || 'Sem Nome'}</div>
            <div class="item-status-row">
              <span class="status-badge ${badgeClass}">${o.status}</span>
            </div>
          </div>
          <div class="item-right">
            <span class="budget-value">R$ ${(o.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      `;
    }).join('');

    Components.renderIcons();

    // Select first visible budget if the selected one is filtered out
    const hasSelected = filtered.some(o => this._visaoBudgets.findIndex(item => item.id === o.id) === this._visaoSelectedIndex);
    if (!hasSelected && filtered.length > 0) {
      const firstOrigIndex = this._visaoBudgets.findIndex(item => item.id === filtered[0].id);
      this.selectVisaoBudget(firstOrigIndex);
    }
  },

  _renderSelectedInvoiceDetails() {
    const detailsContainer = document.getElementById('visao-invoice-details');
    if (!detailsContainer) return;

    const budget = this._visaoBudgets[this._visaoSelectedIndex];
    if (!budget) {
      detailsContainer.innerHTML = '';
      return;
    }

    const fmt = (v) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    
    let badgeClass = '';
    if (this._isApproved(budget.status)) badgeClass = 'status-badge-success';
    else if (this._isPending(budget.status)) badgeClass = 'status-badge-warning';
    else badgeClass = 'status-badge-danger';

    const itens = budget.itens || [];
    const subtotal = itens.reduce((s, it) => s + (parseFloat(it.subtotal) || 0), 0);
    const discount = (subtotal + (parseFloat(budget.maoDeObra) || 0)) * ((parseFloat(budget.descontoPct) || 0) / 100);

    const itemsHtml = itens.map(it => `
      <div class="invoice-detail-card">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; width: 100%;">
          <span class="detail-card-value">R$ ${fmt(parseFloat(it.subtotal) || 0)}</span>
          <i data-lucide="arrow-up-right" style="width: 12px; height: 12px; opacity: 0.4;"></i>
        </div>
        <div style="display: flex; flex-direction: column; gap: 2px; margin-top: 8px;">
          <span class="detail-card-title" title="${it.produtoNome || 'Item'}">${it.produtoNome || 'Item'}</span>
          <span class="detail-card-sub">Qtd: ${it.quantidade || 0} × R$ ${fmt(parseFloat(it.precoUnitario) || 0)}</span>
        </div>
      </div>
    `).join('');

    const emptyCardsCount = Math.max(0, 4 - itens.length);
    let emptyCardsHtml = '';
    for (let i = 0; i < emptyCardsCount; i++) {
      emptyCardsHtml += `
        <div class="invoice-detail-card card-add-item">
          <i data-lucide="plus"></i>
          <span>Novo Item</span>
        </div>
      `;
    }

    const clientInitials = budget.clienteNome ? budget.clienteNome.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase() : '??';

    detailsContainer.innerHTML = `
      <div class="invoice-details-inner-box">
        <!-- Header Section -->
        <div class="invoice-details-header">
          <div class="header-main-row" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
            <div>
              <span style="font-size: 10px; text-transform: uppercase; color: rgba(255,255,255,0.4); font-weight: 700; letter-spacing: 0.5px;">Detalhes do Orçamento</span>
              <h4 class="details-code" style="font-size: 20px; font-weight: 700; color: #FFFFFF; margin: 2px 0 0 0; display: flex; align-items: center;">
                #${budget.codigo ? budget.codigo.replace('ORC-', '') : ''}
                <span class="detail-unsent-badge">${budget.status}</span>
              </h4>
            </div>
            
            <div class="detail-company" style="text-align: right;">
              <span style="font-size: 10px; text-transform: uppercase; color: rgba(255,255,255,0.4); font-weight: 700; letter-spacing: 0.5px; display: block;">Empresa</span>
              <div style="display: flex; align-items: center; gap: 6px; margin-top: 2px; justify-content: flex-end;">
                <div class="detail-company-logo">B</div>
                <span style="font-size: 13px; font-weight: 700; color: #FFFFFF;">${budget.marcenariaNome || 'Bancada Móveis'}</span>
              </div>
            </div>
            
            <div class="detail-customer" style="display: flex; align-items: center; gap: 8px;">
              <div class="cust-avatar" style="width: 32px; height: 32px; border-radius: 50%; background-color: var(--primary); color: #FFFFFF; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700;">
                ${clientInitials}
              </div>
              <div class="cust-info">
                <span class="cust-name" style="color: #FFFFFF; font-size: 12px; font-weight: 700; display: block;">${budget.clienteNome || 'Sem Nome'}</span>
                <span class="cust-desc" style="color: rgba(255,255,255,0.4); font-size: 10px; display: block;">${budget.descricao || ''}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Items/Insumos Bento Grid (4 Columns) -->
        <div class="invoice-items-grid-wrapper">
          <span class="section-title-label" style="color: rgba(255,255,255,0.4);">Itens e Insumos</span>
          <div class="invoice-items-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
            ${itemsHtml}
            ${emptyCardsHtml}
          </div>
        </div>

        <!-- Summary & Action Footer Box -->
        <div class="invoice-details-summary">
          <div class="summary-kpis">
            <div class="summary-kpi-col">
              <span class="summary-kpi-lbl">Subtotal Insumos</span>
              <span class="summary-kpi-val">R$ ${fmt(subtotal)}</span>
            </div>
            <div class="summary-kpi-col">
              <span class="summary-kpi-lbl">Mão de Obra</span>
              <span class="summary-kpi-val">R$ ${fmt(parseFloat(budget.maoDeObra) || 0)}</span>
            </div>
            <div class="summary-kpi-col">
              <span class="summary-kpi-lbl">Total</span>
              <span class="summary-kpi-val highlight-orange">R$ ${fmt(parseFloat(budget.valor_total) || 0)}</span>
            </div>
          </div>
          
          <div class="summary-actions-block">
            <button class="round-action-btn" title="Meta / Objetivos"><i data-lucide="target"></i></button>
            <button class="round-action-btn" title="Cronograma"><i data-lucide="calendar"></i></button>
            <button class="btn-pay-now" onclick="App.navigate('orcamentos')">
              Pay out now
              <i data-lucide="arrow-up-right"></i>
            </button>
          </div>
        </div>
      </div>
    `;

    Components.renderIcons();
  },

  _renderVisaoGeralInvoicesPanel() {
    // Apply period filter first so tab badge counts match the list below
    let periodBudgets = [...this._visaoBudgets];
    const hoje = new Date();
    if (this._periodo === 'diario') {
      const hojeISO = hoje.toISOString().slice(0, 10);
      periodBudgets = periodBudgets.filter(o => this._getBudgetDate(o) === hojeISO);
    } else if (this._periodo === 'semanal') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(hoje.getDate() - 7);
      const limitISO = oneWeekAgo.toISOString().slice(0, 10);
      periodBudgets = periodBudgets.filter(o => this._getBudgetDate(o) >= limitISO);
    } else if (this._periodo === 'mensal') {
      const currentMonth = hoje.toISOString().slice(0, 7);
      periodBudgets = periodBudgets.filter(o => {
        const dStr = this._getBudgetDate(o);
        return dStr && dStr.startsWith(currentMonth);
      });
    }

    const countTodos = periodBudgets.length;
    const countPendentes = periodBudgets.filter(o => this._isPending(o.status)).length;
    const countAprovados = periodBudgets.filter(o => this._isApproved(o.status)).length;
    
    const badgeTodos = document.querySelector('.panel-tab-btn[data-tab="todos"] .tab-badge-count');
    const badgePendente = document.querySelector('.panel-tab-btn[data-tab="pendentes"] .tab-badge-count');
    const badgeAprovado = document.querySelector('.panel-tab-btn[data-tab="aprovados"] .tab-badge-count');
    
    if (badgeTodos) badgeTodos.textContent = countTodos;
    if (badgePendente) badgePendente.textContent = countPendentes;
    if (badgeAprovado) badgeAprovado.textContent = countAprovados;

    this._renderVisaoInvoicesList();
    this._renderSelectedInvoiceDetails();
  },

  _populateClientFilter() {
    const select = document.getElementById('visao-filter-cliente');
    if (!select) return;

    const currentVal = select.value || 'Todos';

    // Get unique client names from real budgets
    const uniqueClients = [...new Set(this._visaoBudgets.map(o => o.clienteNome).filter(Boolean))].sort();

    let html = '<option value="Todos">Todos os clientes</option>';
    uniqueClients.forEach(c => {
      html += `<option value="${c}">${c}</option>`;
    });
    select.innerHTML = html;

    if (uniqueClients.includes(currentVal)) {
      select.value = currentVal;
      this._visaoFilterClient = currentVal;
    } else {
      select.value = 'Todos';
      this._visaoFilterClient = 'Todos';
    }
  },

  _isApproved(status) {
    if (!status) return false;
    const s = String(status).trim().toLowerCase().replace(/_/g, ' ');
    return ['aprovado', 'em produção', 'em producao', 'concluído', 'concluido', 'assinado por ambas', 'enviado para assinatura'].includes(s);
  },

  _isPending(status) {
    if (!status) return false;
    const s = String(status).trim().toLowerCase().replace(/_/g, ' ');
    return ['pendente', 'enviado', 'rascunho', 'em análise', 'em analise', 'em aberto'].includes(s);
  },

  _getBudgetDate(o) {
    if (!o) return '';
    const raw = o.data || o.criadoEm || o.createdAt || o.validade || '';
    if (!raw) return '';
    if (typeof raw === 'string') {
      if (raw.includes('T')) return raw.split('T')[0];
      return raw.slice(0, 10);
    }
    if (raw instanceof Date) {
      return raw.toISOString().split('T')[0];
    }
    return String(raw).slice(0, 10);
  },

  _renderVisaoGeral(d) {
    this._initVisaoData();
    this._populateClientFilter();
    this._renderVisaoGeralSummaryCard();
    this._renderVisaoGeralPayoutCard();
    this._renderVisaoGeralInvoicesPanel();
  }
};
