/**
 * Gestão Module - CRUD Padeiros, Produtos, Clientes
 * Bancada Sistema Padeiro
 */
const Gestao = {
  currentTab: 'padeiros',
  searchTerm: '',
  allData: { padeiros: [], produtos: [], clientes: [], atividades: [], usuarios: [] },

  renderStyles() {
    if (document.getElementById('gestao-mobile-css')) return;
    const style = document.createElement('style');
    style.id = 'gestao-mobile-css';
    style.innerHTML = `
      @media (max-width: 768px) {
        :root {
          --dark-header-bg: #1C1A14;
          --dark-header-text: #F5F2E8;
          --dark-header-sub: rgba(255,255,255,0.45);
          --dark-header-sub-dim: rgba(255,255,255,0.3);
          --orange-primary: #E55A2B;
          --content-bg: #f8f6ef;
          --card-bg: #ffffff;
          --text-main: #1E1B14;
          --text-muted: #9A9486;
        }

        #page-container {
          padding: 0 !important;
          background: var(--content-bg) !important;
          overflow-x: hidden !important;
        }
        .gestao-view {
          padding: 0 !important;
          background: var(--content-bg) !important;
          min-height: 100vh;
        }
        
        .gestao-mobile-header {
          background: var(--dark-header-bg);
          padding: 32px 20px 24px;
          position: relative;
          overflow: hidden;
        }
        .h-arc {
          position: absolute;
          top: -50px;
          right: -50px;
          width: 180px;
          height: 180px;
          border-radius: 50%;
          background: rgba(255,255,255,0.03);
          pointer-events: none;
        }
        .h-arc2 {
          position: absolute;
          bottom: -60px;
          left: -40px;
          width: 220px;
          height: 110px;
          border-radius: 50%;
          background: rgba(255,255,255,0.03);
          pointer-events: none;
        }
        .h-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          position: relative;
          z-index: 3;
        }
        .h-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .h-left .avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: rgba(229,90,43,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 800;
          color: var(--orange-primary);
        }
        .h-title {
          font-size: 20px;
          font-weight: 800;
          color: var(--dark-header-text);
          letter-spacing: -0.3px;
          font-family: 'DM Sans', sans-serif;
        }
        .h-icons {
          display: flex;
          gap: 8px;
        }
        .hicon {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255,255,255,0.08);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }
        .hicon:active {
          background: rgba(255,255,255,0.15);
        }
        .hicon i, .hicon svg {
          width: 18px;
          height: 18px;
          color: var(--dark-header-text);
        }

        .mobile-search-inline {
          display: none;
          margin-bottom: 16px;
          position: relative;
          z-index: 3;
        }
        .mobile-search-inline.active {
          display: block;
          animation: slideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .mobile-search-inline input {
          width: 100%;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 12px;
          padding: 10px 16px;
          font-size: 14px;
          color: white;
          outline: none;
        }
        .mobile-search-inline input::placeholder {
          color: rgba(255,255,255,0.4);
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .kpi-grid {
          display: grid !important;
          grid-template-columns: repeat(2, 1fr) !important;
          gap: 12px !important;
          margin-top: 8px !important;
          position: relative;
          z-index: 3;
        }
        .kpi {
          background: rgba(255,255,255,0.05) !important;
          border-radius: 20px !important;
          padding: 14px 16px !important;
          cursor: pointer !important;
          transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
          border: 1px solid rgba(255,255,255,0.08) !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: space-between !important;
          min-height: 98px !important;
          text-align: left !important;
        }
        .kpi:active, .kpi:hover {
          transform: translateY(-2px) !important;
          background: rgba(255,255,255,0.08) !important;
        }
        .kpi.active {
          background: var(--orange-primary) !important;
          border-color: var(--orange-primary) !important;
          box-shadow: 0 8px 20px rgba(229,90,43,0.3) !important;
        }
        .kpi.active:active, .kpi.active:hover {
          background: var(--orange-primary) !important;
          transform: translateY(-2px) !important;
        }
        .kpi-label {
          font-size: 11px !important;
          font-weight: 700 !important;
          color: rgba(255,255,255,0.5) !important;
          margin-bottom: 4px !important;
          text-transform: uppercase !important;
          letter-spacing: 0.3px !important;
          line-height: 1.2 !important;
        }
        .kpi.active .kpi-label {
          color: rgba(255,255,255,0.85) !important;
        }
        .kpi-val {
          font-size: 30px !important;
          font-weight: 800 !important;
          color: #FFFFFF !important;
          line-height: 1 !important;
          letter-spacing: -0.5px !important;
        }
        .kpi-sub {
          font-size: 10px !important;
          color: rgba(255,255,255,0.35) !important;
          margin-top: 4px !important;
          line-height: 1.2 !important;
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
        }
        .kpi.active .kpi-sub {
          color: rgba(255,255,255,0.75) !important;
        }

        .gestao-mobile-content {
          background: var(--content-bg);
          border-radius: 28px 28px 0 0;
          margin-top: -16px;
          padding-top: 20px;
          position: relative;
          z-index: 2;
          padding-bottom: 96px;
        }

        .tab-scroll {
          display: flex;
          gap: 6px;
          overflow-x: auto;
          scrollbar-width: none;
          padding: 0 20px 18px;
          -webkit-overflow-scrolling: touch;
        }
        .tab-scroll::-webkit-scrollbar {
          display: none;
        }
        .tab-scroll .tab {
          padding: 8px 18px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          white-space: nowrap;
          background: transparent;
          color: var(--text-muted);
          transition: all 0.2s;
        }
        .tab-scroll .tab.on {
          background: var(--dark-header-bg);
          color: var(--content-bg);
        }

        .sec-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 20px 14px;
        }
        .sec-title {
          font-size: 17px;
          font-weight: 800;
          color: var(--text-main);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .sec-badge {
          background: var(--orange-primary);
          color: #fff;
          font-size: 11px;
          font-weight: 800;
          padding: 3px 8px;
          border-radius: 999px;
        }
        .sec-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          background: var(--orange-primary);
          border: none;
          border-radius: 999px;
          padding: 8px 14px;
          cursor: pointer;
          color: #fff;
          box-shadow: 0 4px 10px rgba(229,90,43,0.25);
          transition: transform 0.2s, opacity 0.2s;
        }
        .sec-btn:active {
          transform: scale(0.96);
          opacity: 0.9;
        }
        .sec-btn i, .sec-btn svg {
          width: 14px;
          height: 14px;
          color: #fff;
        }
        .sec-btn-label {
          font-size: 13px;
          font-weight: 700;
          color: #fff;
        }

        .list-card {
          margin: 0 20px 24px;
          background: var(--card-bg) !important;
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid rgba(30,27,20,0.05);
          box-shadow: 0 4px 12px rgba(0,0,0,0.02);
        }
        .list-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          border-bottom: 1px solid rgba(30,27,20,0.06);
          transition: background 0.15s;
          cursor: pointer;
        }
        .list-item:active {
          background: rgba(30,27,20,0.03);
        }
        .list-item:last-child {
          border-bottom: none;
        }
        .li-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #4A9B7A;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 800;
          color: #fff;
          flex-shrink: 0;
          overflow: hidden;
        }
        .li-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .li-info {
          flex: 1;
          min-width: 0;
        }
        .li-name {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-main);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .li-sub {
          font-size: 12px;
          color: var(--text-muted);
          margin-top: 1px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .li-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 5px;
          flex-shrink: 0;
        }
        .li-badge {
          font-size: 11px;
          font-weight: 700;
          padding: 3px 9px;
          border-radius: 999px;
          text-transform: uppercase;
        }
        .b-treinee { background: #FDE8D8; color: #C03D0E; }
        .b-ativo { background: #D6EDE4; color: #1A6B4A; }
        .b-inativo { background: #FADBD8; color: #C0392B; }
        
        .li-actions {
          display: flex;
          gap: 12px;
          margin-left: 8px;
          flex-shrink: 0;
        }
        .li-actions button {
          border: none;
          background: transparent;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .li-actions button:active {
          transform: scale(0.9);
        }
        .i-edit {
          width: 18px;
          height: 18px;
          color: var(--text-muted);
        }
        .i-del {
          width: 18px;
          height: 18px;
          color: #E24B4A;
        }

        .empty-state {
          text-align: center;
          padding: 36px 20px;
          background: var(--card-bg) !important;
          border-radius: 20px;
          margin: 0 20px;
          border: 1px solid rgba(30,27,20,0.05);
          box-shadow: 0 4px 12px rgba(0,0,0,0.02);
        }
        .empty-state i, .empty-state svg {
          width: 36px;
          height: 36px;
          color: #C8C4B4;
          margin: 0 auto 10px;
          display: block;
        }
        .empty-title {
          font-size: 15px;
          font-weight: 700;
          color: #5A5750;
          margin-bottom: 4px;
        }
        .empty-sub {
          font-size: 13px;
          color: var(--text-muted);
        }

        .desktop-only, .hig-desktop-only {
          display: none !important;
        }
        .mobile-only {
          display: block !important;
        }

        /* ─── STAGGERED CASCADING TRANSITIONS ─── */
        @keyframes cascadeUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .cascade-item {
          opacity: 0;
          animation: cascadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
          animation-delay: calc(var(--index, 0) * 0.06s) !important;
        }
      }
    `;
    document.head.appendChild(style);
  },

  async render() {
    this.renderStyles();

    // Listener para busca global (mobile iOS)
    if (!this._searchListenerAdded) {
      document.addEventListener('app-search', (e) => {
        if (App.currentRoute === 'gestao' || App.currentRoute === 'produtos' || App.currentRoute === 'clientes') {
          this.search(e.detail);
        }
      });
      this._searchListenerAdded = true;
    }

    const isMobile = window.innerWidth <= 768;
    const c = document.getElementById('page-container');
    const searchContainer = document.getElementById('global-search-container');
    if (searchContainer) {
      if (isMobile) {
        searchContainer.innerHTML = '';
      } else {
        searchContainer.innerHTML = `
          <div class="input-icon-wrapper w-full">
            <i data-lucide="search"></i>
            <input class="input-control" type="text" placeholder="Buscar..." id="gestao-search-input" value="${this.searchTerm}" oninput="Gestao.search(this.value)">
          </div>
        `;
      }
    }

    const user = API.getUser() || {};
    const isAdmin = user.role === 'admin' || user.role === 'superadmin';
    if (!isAdmin && (this.currentTab === 'padeiros' || this.currentTab === 'usuarios')) {
      this.currentTab = 'produtos';
    }

    if (isMobile) {
      const userInitials = this.getInitials(user.nome || user.email || 'JO');

      c.innerHTML = `
      <div class="fade-in gestao-view">
        <div class="gestao-mobile-header">
          <div class="h-arc"></div>
          <div class="h-arc2"></div>
          <div class="h-top">
            <div class="h-left">
              <button class="hicon menu-toggle-btn" aria-label="Menu" onclick="App.toggleSidebar()">
                <i data-lucide="menu"></i>
              </button>
              <span class="h-title">Gestão</span>
            </div>
            <div class="h-icons">
              <button class="hicon" aria-label="Buscar" onclick="Gestao.toggleSearch()">
                <i data-lucide="search"></i>
              </button>
              <button class="hicon" aria-label="Notificações" onclick="Components.toast('Sem novas notificações', 'info')">
                <i data-lucide="bell"></i>
              </button>
            </div>
          </div>

          <div class="mobile-search-inline" id="mobile-search-wrapper">
            <input type="text" id="mobile-search-input" placeholder="Buscar..." value="${this.searchTerm}" oninput="Gestao.search(this.value)">
          </div>
          <div class="kpi-grid" id="mobile-kpi-grid">
            ${isAdmin ? `
            <div class="kpi cascade-item ${this.currentTab === 'padeiros' ? 'active' : ''}" style="--index: 0;" onclick="Gestao.switchTab('padeiros')">
              <div class="kpi-label">Funcionários ativos</div>
              <div class="kpi-val">—</div>
              <div class="kpi-sub">Carregando...</div>
            </div>` : ''}
            <div class="kpi cascade-item ${this.currentTab === 'produtos' ? 'active' : ''}" style="--index: 1;" onclick="Gestao.switchTab('produtos')">
              <div class="kpi-label">Serviços cadastrados</div>
              <div class="kpi-val">—</div>
              <div class="kpi-sub">Carregando...</div>
            </div>
            <div class="kpi cascade-item ${this.currentTab === 'clientes' ? 'active' : ''}" style="--index: 2;" onclick="Gestao.switchTab('clientes')">
              <div class="kpi-label">Clientes ativos</div>
              <div class="kpi-val">—</div>
              <div class="kpi-sub">Total registrados</div>
            </div>
            <div class="kpi cascade-item ${this.currentTab === 'atividades' ? 'active' : ''}" style="--index: 3;" onclick="Gestao.switchTab('atividades')">
              <div class="kpi-label">Registros de produção</div>
              <div class="kpi-val">—</div>
              <div class="kpi-sub">Carregando...</div>
            </div>
          </div>
        </div>

        <div class="gestao-mobile-content">
          <div class="tab-scroll">
            ${isAdmin ? `<button class="tab cascade-item ${this.currentTab === 'padeiros' ? 'on' : ''}" style="--index: 4;" onclick="Gestao.switchTab('padeiros')">Funcionários</button>` : ''}
            <button class="tab cascade-item ${this.currentTab === 'produtos' ? 'on' : ''}" style="--index: 5;" onclick="Gestao.switchTab('produtos')">Serviços</button>
            <button class="tab cascade-item ${this.currentTab === 'clientes' ? 'on' : ''}" style="--index: 6;" onclick="Gestao.switchTab('clientes')">Clientes</button>
            <button class="tab cascade-item ${this.currentTab === 'atividades' ? 'on' : ''}" style="--index: 7;" onclick="Gestao.switchTab('atividades')">Registros</button>
            ${isAdmin ? `<button class="tab cascade-item ${this.currentTab === 'usuarios' ? 'on' : ''}" style="--index: 8;" onclick="Gestao.switchTab('usuarios')">Usuários</button>` : ''}
          </div>
 
          <div class="sec-head cascade-item" style="--index: 9;">
            <span class="sec-title">
              ${this.currentTab === 'padeiros' ? 'Lista de funcionários' : 
                this.currentTab === 'produtos' ? 'Lista de serviços' : 
                this.currentTab === 'clientes' ? 'Lista de clientes' : 
                this.currentTab === 'atividades' ? 'Registros de produção' : 'Usuários do painel'}
              <span class="sec-badge" id="mobile-sec-badge">—</span>
            </span>
            ${this.currentTab !== 'atividades' ? `
              <button class="sec-btn" onclick="${
                this.currentTab === 'padeiros' ? 'Gestao.openPadeiroForm()' :
                this.currentTab === 'produtos' ? 'Gestao.openProdutoForm()' :
                this.currentTab === 'clientes' ? 'Gestao.openClienteForm()' : 'Gestao.openUsuarioForm()'
              }">
                <i data-lucide="plus"></i>
                <span class="sec-btn-label">Novo</span>
              </button>
            ` : ''}
          </div>
 
          <div id="gestao-content">${Components.loading()}</div>
        </div>
      </div>`;
    } else {
      const items = isAdmin ? ['padeiros', 'produtos', 'clientes', 'atividades', 'usuarios'] : ['produtos', 'clientes', 'atividades'];
      const idx = Math.max(0, items.indexOf(this.currentTab));
      const sliderWidth = isAdmin ? '20%' : '33.33%';
      const sliderTransform = `translateX(${idx * 100}%)`;

      c.innerHTML = `
      <div class="fade-in gestao-view">
        <div id="gestao-kpi-container" class="hig-desktop-only"></div>
        <div class="flex justify-between items-center mb-6 gestao-header-main">
          <h1 class="page-title" style="margin-bottom:0; font-size: 24px; font-weight: 700;">Gestão</h1>
          <div class="segmented-control" style="margin-bottom:0;" onclick="Components.createRipple(event, this)">
            <div class="segmented-slider" style="width: ${sliderWidth}; transform: ${sliderTransform}"></div>
            ${isAdmin ? `<div class="segmented-item ${this.currentTab === 'padeiros' ? 'active' : ''}" onclick="Gestao.switchTab('padeiros')">Funcionários</div>` : ''}
            <div class="segmented-item ${this.currentTab === 'produtos' ? 'active' : ''}" onclick="Gestao.switchTab('produtos')">Serviços</div>
            <div class="segmented-item ${this.currentTab === 'clientes' ? 'active' : ''}" onclick="Gestao.switchTab('clientes')">Clientes</div>
            <div class="segmented-item ${this.currentTab === 'atividades' ? 'active' : ''}" onclick="Gestao.switchTab('atividades')">Registros</div>
            ${isAdmin ? `<div class="segmented-item ${this.currentTab === 'usuarios' ? 'active' : ''}" onclick="Gestao.switchTab('usuarios')">Usuários</div>` : ''}
          </div>
        </div>
        <div id="gestao-content">${Components.loading()}</div>
      </div>`;
    }
    await this.loadTab();
  },

  async switchTab(tab) {
    const userRole = API.getUser()?.role;
    const isAdmin = userRole === 'admin' || userRole === 'superadmin';
    if (!isAdmin && (tab === 'usuarios' || tab === 'padeiros')) {
      tab = 'produtos';
    }
    this.currentTab = tab;
    this.searchTerm = '';
    
    const searchInput = document.getElementById('gestao-search-input');
    if (searchInput) searchInput.value = '';
    const mobileSearchInput = document.getElementById('mobile-search-input');
    if (mobileSearchInput) mobileSearchInput.value = '';

    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      document.querySelectorAll('.tab-scroll .tab').forEach(t => {
        t.classList.toggle('on', t.getAttribute('onclick')?.includes(`'${tab}'`));
      });
      document.querySelectorAll('.kpi-grid .kpi').forEach(k => {
        k.classList.toggle('active', k.getAttribute('onclick')?.includes(`'${tab}'`));
      });
      
      const secTitleEl = document.querySelector('.gestao-mobile-content .sec-title');
      if (secTitleEl) {
        const titleText = tab === 'padeiros' ? 'Lista de funcionários' : 
                          tab === 'produtos' ? 'Lista de serviços' : 
                          tab === 'clientes' ? 'Lista de clientes' : 
                          tab === 'atividades' ? 'Registros de produção' : 'Usuários do painel';
        secTitleEl.innerHTML = `${titleText} <span class="sec-badge" id="mobile-sec-badge">—</span>`;
      }
      
      const secHeadEl = document.querySelector('.gestao-mobile-content .sec-head');
      if (secHeadEl) {
        const existingBtn = secHeadEl.querySelector('.sec-btn');
        if (existingBtn) existingBtn.remove();
        
        if (tab !== 'atividades') {
          const action = tab === 'padeiros' ? 'Gestao.openPadeiroForm()' :
                         tab === 'produtos' ? 'Gestao.openProdutoForm()' :
                         tab === 'clientes' ? 'Gestao.openClienteForm()' : 'Gestao.openUsuarioForm()';
          const newBtn = document.createElement('button');
          newBtn.className = 'sec-btn';
          newBtn.setAttribute('onclick', action);
          newBtn.innerHTML = `<i data-lucide="plus"></i><span class="sec-btn-label">Novo</span>`;
          secHeadEl.appendChild(newBtn);
        }
      }
    } else {
      document.querySelectorAll('.segmented-item').forEach(t => t.classList.remove('active'));
      const items = isAdmin ? ['padeiros', 'produtos', 'clientes', 'atividades', 'usuarios'] : ['produtos', 'clientes', 'atividades'];
      const idx = Math.max(0, items.indexOf(tab));
      document.querySelectorAll('.segmented-item')[idx]?.classList.add('active');

      const slider = document.querySelector('.segmented-control .segmented-slider');
      if (slider) {
        slider.style.width = isAdmin ? '20%' : '33.33%';
        slider.style.transform = `translateX(${idx * 100}%)`;
      }
    }

    const contentEl = document.getElementById('gestao-content');
    if (contentEl) contentEl.innerHTML = Components.loading();
    await this.loadTab();
  },

  async loadTab() {
    try {
      const endpoint = this.currentTab === 'usuarios' ? 'management/users' : this.currentTab;
      this.loadStats().catch(console.error);

      const data = await API.get(`/api/${endpoint}`);
      this.allData[this.currentTab] = data;
      this.renderTabContent(data);
    } catch (e) {
      document.getElementById('gestao-content').innerHTML = `<div class="toast error">Erro: ${e.message}</div>`;
    }
  },

  async loadStats() {
    try {
      const isMobile = window.innerWidth <= 768;
      if (!isMobile) {
        const container = document.getElementById('gestao-kpi-container');
        if (!container) return;

        if (!container.innerHTML) {
          container.innerHTML = `
            <div class="db-kpi-grid gestao-kpi-grid" style="margin-bottom: 24px; gap: 18px;">
              <div class="db-kpi-card white" style="height: 120px; background: #ffffff; border: 1px solid rgba(226, 232, 240, 0.7); opacity: 0.7; display: flex; align-items: center; justify-content: center;">
                <div class="spinner" style="width: 24px; height: 24px; border: 3px solid rgba(0,0,0,0.1); border-top-color: #5e52ff; border-radius: 50%; animation: spin 1s linear infinite;"></div>
              </div>
              <div class="db-kpi-card blue" style="height: 120px; opacity: 0.7; display: flex; align-items: center; justify-content: center;">
                <div class="spinner" style="width: 24px; height: 24px; border: 3px solid rgba(255,255,255,0.2); border-top-color: #ffffff; border-radius: 50%; animation: spin 1s linear infinite;"></div>
              </div>
              <div class="db-kpi-card white" style="height: 120px; background: #ffffff; border: 1px solid rgba(226, 232, 240, 0.7); opacity: 0.7; display: flex; align-items: center; justify-content: center;">
                <div class="spinner" style="width: 24px; height: 24px; border: 3px solid rgba(0,0,0,0.1); border-top-color: #5e52ff; border-radius: 50%; animation: spin 1s linear infinite;"></div>
              </div>
            </div>
          `;
        }
      }

      const stats = await API.get('/api/stats');
      const user = API.getUser() || {};
      const isSuper = user.role === 'admin' || user.role === 'superadmin';

      if (isMobile) {
        const grid = document.getElementById('mobile-kpi-grid');
        if (grid) {
          grid.innerHTML = `
            <div class="kpi cascade-item ${this.currentTab === 'padeiros' ? 'active' : ''}" style="--index: 0;" onclick="Gestao.switchTab('padeiros')">
              <div class="kpi-label">Funcionários ativos</div>
              <div class="kpi-val">${stats.totalPadeiros || 0}</div>
              <div class="kpi-sub">Operando no sistema</div>
            </div>
            <div class="kpi cascade-item ${this.currentTab === 'produtos' ? 'active' : ''}" style="--index: 1;" onclick="Gestao.switchTab('produtos')">
              <div class="kpi-label">Serviços cadastrados</div>
              <div class="kpi-val">${stats.totalProdutos || 0}</div>
              <div class="kpi-sub">Disponíveis para orçamento</div>
            </div>
            <div class="kpi cascade-item ${this.currentTab === 'clientes' ? 'active' : ''}" style="--index: 2;" onclick="Gestao.switchTab('clientes')">
              <div class="kpi-label">Clientes ativos</div>
              <div class="kpi-val">${stats.totalClientes || 0}</div>
              <div class="kpi-sub">Total registrados</div>
            </div>
            <div class="kpi cascade-item ${this.currentTab === 'atividades' ? 'active' : ''}" style="--index: 3;" onclick="Gestao.switchTab('atividades')">
              <div class="kpi-label">Registros de produção</div>
              <div class="kpi-val">${stats.totalAtividades || 0}</div>
              <div class="kpi-sub">Atividades no total</div>
            </div>
          `;
        }
      } else {
        const container = document.getElementById('gestao-kpi-container');
        if (container) {
          container.innerHTML = `
            <div class="db-kpi-grid gestao-kpi-grid" style="margin-bottom: 24px; gap: 18px; grid-template-columns: repeat(${isSuper ? 5 : 4}, 1fr);">
              <!-- Card 1: Padeiros Ativos (White, clickable) -->
              <div class="db-kpi-card white" onclick="Gestao.switchTab('padeiros')" style="cursor: pointer;">
                <div class="db-kpi-top">
                  <span class="db-kpi-label">Funcionários Ativos</span>
                  <div class="db-kpi-arrow-circle"><i data-lucide="arrow-up-right"></i></div>
                </div>
                <span class="db-kpi-val">${stats.totalPadeiros || 0}</span>
                <span class="db-kpi-desc">Funcionários operando no sistema</span>
              </div>

              <!-- Card 2: Produtos (White) -->
              <div class="db-kpi-card white" onclick="Gestao.switchTab('produtos')" style="cursor: pointer;">
                <div class="db-kpi-top">
                  <span class="db-kpi-label">Serviços Cadastrados</span>
                  <div class="db-kpi-arrow-circle"><i data-lucide="arrow-up-right"></i></div>
                </div>
                <span class="db-kpi-val">${stats.totalProdutos || 0}</span>
                <span class="db-kpi-desc">Serviços disponíveis para orçamentos</span>
              </div>

              <!-- Card 3: Clientes Ativos (Blue, highlighted, clickable) -->
              <div class="db-kpi-card blue" onclick="Gestao.switchTab('clientes')" style="cursor: pointer;">
                <div class="db-kpi-top">
                  <span class="db-kpi-label text-white-50">Clientes Ativos</span>
                  <div class="db-kpi-arrow-circle"><i data-lucide="arrow-up-right"></i></div>
                </div>
                <span class="db-kpi-val text-white">${stats.totalClientes || 0}</span>
                <span class="db-kpi-desc text-white-50">Total de clientes registrados</span>
              </div>

              <!-- Card 4: Registros de Produção (White, clickable) -->
              <div class="db-kpi-card white" onclick="Gestao.switchTab('atividades')" style="cursor: pointer;">
                <div class="db-kpi-top">
                  <span class="db-kpi-label">Registros de Produção</span>
                  <div class="db-kpi-arrow-circle"><i data-lucide="arrow-up-right"></i></div>
                </div>
                <span class="db-kpi-val">${stats.totalAtividades || 0}</span>
                <span class="db-kpi-desc">Atividades registradas no total</span>
              </div>
              
              ${isSuper ? `
              <!-- Card 5: Usuários (White) -->
              <div class="db-kpi-card white" onclick="Gestao.switchTab('usuarios')" style="cursor: pointer;">
                <div class="db-kpi-top">
                  <span class="db-kpi-label">Usuários</span>
                  <div class="db-kpi-arrow-circle"><i data-lucide="arrow-up-right"></i></div>
                </div>
                <span class="db-kpi-val">${stats.totalColaboradores || 0}</span>
                <span class="db-kpi-desc">Usuários com acesso</span>
              </div>
              ` : ''}
            </div>
          `;
          Components.renderIcons();
        }
      }
    } catch (e) {
      console.error("Erro ao carregar estatísticas na Gestão:", e);
    }
  },

  toggleSearch() {
    const wrapper = document.getElementById('mobile-search-wrapper');
    if (wrapper) {
      wrapper.classList.toggle('active');
      if (wrapper.classList.contains('active')) {
        const input = document.getElementById('mobile-search-input');
        if (input) input.focus();
      } else {
        this.search('');
        const input = document.getElementById('mobile-search-input');
        if (input) input.value = '';
      }
    }
  },

  search(val) {
    this.searchTerm = val;
    this.renderTabContent(this.allData[this.currentTab] || []);
  },

  renderTabContent(data) {
    const filtered = this.searchTerm
      ? data.filter(item => JSON.stringify(item).toLowerCase().includes(this.searchTerm.toLowerCase()))
      : data;
    const c = document.getElementById('gestao-content');
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
      this.renderMobileTabContent(c, filtered);
    } else {
      if (this.currentTab === 'padeiros') this.renderPadeiros(c, filtered);
      else if (this.currentTab === 'produtos') this.renderProdutos(c, filtered);
      else if (this.currentTab === 'clientes') this.renderClientes(c, filtered);
      else if (this.currentTab === 'atividades') this.renderAtividades(c, filtered);
      else this.renderUsuarios(c, filtered);
    }
    Components.renderIcons();
  },

  renderMobileTabContent(c, filtered) {
    const getBadgeClass = (badge) => {
      if (badge === 'apple-orange') return 'b-treinee';
      if (badge.startsWith('apple-')) return 'b-' + badge.replace('apple-', '');
      return 'b-' + badge;
    };
    
    const badgeEl = document.getElementById('mobile-sec-badge');
    if (badgeEl) badgeEl.textContent = filtered.length;

    if (filtered.length === 0) {
      const getEmptyIcon = () => {
        if (this.currentTab === 'padeiros') return 'users';
        if (this.currentTab === 'produtos') return 'package';
        if (this.currentTab === 'clientes') return 'building-2';
        if (this.currentTab === 'atividades') return 'history';
        return 'lock';
      };
      
      const getEmptyTitle = () => {
        if (this.currentTab === 'padeiros') return 'Sem mais funcionários';
        if (this.currentTab === 'produtos') return 'Sem mais produtos';
        if (this.currentTab === 'clientes') return 'Sem mais clientes';
        if (this.currentTab === 'atividades') return 'Sem registros';
        return 'Sem usuários';
      };

      c.innerHTML = `
        <div style="padding:16px 20px 0; --index: 10;" class="cascade-item">
          <div class="empty-state">
            <i data-lucide="${getEmptyIcon()}"></i>
            <div class="empty-title">${getEmptyTitle()}</div>
            <div class="empty-sub">Toque em "+" para adicionar</div>
          </div>
        </div>
      `;
      return;
    }

    let itemsHtml = '';
    if (this.currentTab === 'padeiros') {
      itemsHtml = filtered.map(p => {
        const initials = this.getInitials(p.nome);
        const badgeClass = this.cargoBadge(p.cargo);
        const roleColor = this.getRoleColor(p.cargo, p.nome);

        let contractBadgeHtml = '';
        if (!p.contrato) {
          contractBadgeHtml = '<span class="li-badge b-inativo" style="background: #F1F1F0; color: #8E8E93;">Sem contrato</span>';
        } else if (p.contrato.status === 'pending' || p.contrato.status === 'Enviado para assinatura') {
          contractBadgeHtml = '<span class="li-badge b-treinee" style="background: #FFF3E0; color: #E65100;">Aguardando</span>';
        } else if (p.contrato.status === 'signed' || p.contrato.status === 'Assinado por ambas') {
          contractBadgeHtml = `<a href="${p.contrato.pdfPath || p.contrato.signedUrl || '#'}" target="_blank" onclick="event.stopPropagation();" class="li-badge b-ativo" style="background: #E8F5E9; color: #2E7D32; text-decoration: underline;">Assinado</a>`;
        } else {
          contractBadgeHtml = `<span class="li-badge b-inativo">${p.contrato.status}</span>`;
        }

        let contractActionHtml = '';
        if (!p.contrato) {
          contractActionHtml = `
            <button aria-label="Gerar Contrato" onclick="event.stopPropagation(); Gestao.openGenerateContractModal('${p.id}')" class="hover-lift" style="padding:4px;">
              <i data-lucide="file-signature" class="i-edit" style="color: var(--primary); width:18px; height:18px;"></i>
            </button>
          `;
        } else {
          contractActionHtml = `
            <button aria-label="Ver Contrato" onclick="event.stopPropagation(); Gestao.openContratoDetailsModal('${p.contrato.id}')" class="hover-lift" style="padding:4px;">
              <i data-lucide="eye" class="i-edit" style="color: #1E4BFF; width:18px; height:18px;"></i>
            </button>
            ${p.contrato.status === 'pending' || p.contrato.status === 'Enviado para assinatura' ? `
              <button aria-label="Reenviar lembrete" onclick="event.stopPropagation(); Gestao.resendContractReminder('${p.contrato.id}')" class="hover-lift" style="padding:4px;">
                <i data-lucide="send" class="i-edit" style="color: #FF9A3C; width:18px; height:18px;"></i>
              </button>
            ` : ''}
          `;
        }

        return `
          <div class="list-item" onclick="Gestao.openPadeiroForm('${p.id}')">
            <div class="li-avatar" style="background-color: ${roleColor}; color: ${this.getDarkColor(badgeClass, p.nome)}">${initials}</div>
            <div class="li-info">
              <div class="li-name">${p.nome}</div>
              <div class="li-sub">${p.email || '-'}</div>
            </div>
            <div class="li-right">
              <span class="li-badge ${getBadgeClass(badgeClass)}">${p.cargo || '-'}</span>
              ${contractBadgeHtml}
            </div>
            <div class="li-actions">
              ${contractActionHtml}
              <button aria-label="Editar" onclick="event.stopPropagation(); Gestao.openPadeiroForm('${p.id}')">
                <i data-lucide="pencil" class="i-edit"></i>
              </button>
              <button aria-label="Excluir" onclick="event.stopPropagation(); Gestao.deletePadeiro('${p.id}', '${p.nome}')">
                <i data-lucide="trash-2" class="i-del"></i>
              </button>
            </div>
          </div>
        `;
      }).join('');
    } else if (this.currentTab === 'produtos') {
      itemsHtml = filtered.map(p => {
        const hasPhoto = p.temFoto && p.codigo;
        return `
          <div class="list-item" onclick="Gestao.openProdutoForm('${p.id}')">
            <div class="li-avatar" style="background-color: rgba(229, 90, 43, 0.1); color: #E55A2B;">
              ${hasPhoto 
                ? `<img src="/api/foto-produto/${p.codigo}">` 
                : `<i data-lucide="package" style="width: 20px; height: 20px; color: #E55A2B;"></i>`
              }
            </div>
            <div class="li-info">
              <div class="li-name">${p.descricao}</div>
              <div class="li-sub">Cód: ${p.codigo || '—'} • ${p.fornecedor || 'Sem fornecedor'}</div>
            </div>
            <div class="li-right">
              <span class="li-badge b-ativo" style="font-weight:800; color: #E55A2B; background: rgba(229,90,43,0.1);">R$ ${p.preco ? p.preco.toFixed(2).replace('.', ',') : '0,00'}</span>
              <span class="li-badge ${p.estoque > 0 ? 'b-ativo' : 'b-inativo'}">Estoque: ${p.estoque || 0} ${p.unidade || 'un'}</span>
            </div>
            <div class="li-actions">
              <button aria-label="Editar" onclick="event.stopPropagation(); Gestao.openProdutoForm('${p.id}')">
                <i data-lucide="pencil" class="i-edit"></i>
              </button>
              <button aria-label="Excluir" onclick="event.stopPropagation(); Gestao.deleteProduto('${p.id}')">
                <i data-lucide="trash-2" class="i-del"></i>
              </button>
            </div>
          </div>
        `;
      }).join('');
    } else if (this.currentTab === 'clientes') {
      itemsHtml = filtered.map(cl => {
        const rawDesc = cl.orcamentoDescricao || '-';
        const displayDesc = rawDesc.length > 25 ? rawDesc.substring(0, 25) + '...' : rawDesc;
        return `
          <div class="list-item" onclick="Gestao.openClienteForm('${cl.id}')">
            <div class="li-avatar" style="background-color: rgba(52, 199, 89, 0.1); color: #34C759; font-weight:800; font-size:12px;">
              ${cl.codigo || 'CL'}
            </div>
            <div class="li-info">
              <div class="li-name">${cl.nome}</div>
              <div class="li-sub">${displayDesc}</div>
            </div>
            <div class="li-right">
              <span class="li-badge b-ativo" style="font-weight:800; color:#34C759; background:rgba(52,199,89,0.1);">${cl.bairro || 'Sem Bairro'}</span>
              <span class="li-badge b-treinee" style="font-weight:700;">${cl.estado || '—'}</span>
            </div>
            <div class="li-actions">
              <button aria-label="Editar" onclick="event.stopPropagation(); Gestao.openClienteForm('${cl.id}')">
                <i data-lucide="pencil" class="i-edit"></i>
              </button>
              <button aria-label="Excluir" onclick="event.stopPropagation(); Gestao.deleteCliente('${cl.id}')">
                <i data-lucide="trash-2" class="i-del"></i>
              </button>
            </div>
          </div>
        `;
      }).join('');
    } else if (this.currentTab === 'atividades') {
      itemsHtml = filtered.map(a => {
        const initials = this.getInitials(a.padeiroNome);
        return `
          <div class="list-item" onclick="Gestao.viewAtividade('${a.id}')">
            <div class="li-avatar" style="background-color: ${this.getRoleColor('', a.padeiroNome)}; color: ${this.getDarkColor('amber', a.padeiroNome)}">
              ${initials}
            </div>
            <div class="li-info">
              <div class="li-name">${a.clienteNome || 'Sem Cliente'}</div>
              <div class="li-sub">${a.padeiroNome} • ${new Date(a.inicioEm || a.data).toLocaleDateString('pt-BR')}</div>
            </div>
            <div class="li-right">
              <span class="li-badge b-ativo" style="color: #E55A2B; background: rgba(229,90,43,0.1); font-weight: 800;">${a.kgTotal || 0} kg</span>
              <span class="li-badge ${a.status === 'finalizado' ? 'b-ativo' : 'b-treinee'}">${a.status}</span>
            </div>
            <div class="li-actions">
              <button aria-label="Ver" onclick="event.stopPropagation(); Gestao.viewAtividade('${a.id}')">
                <i data-lucide="eye" class="i-edit"></i>
              </button>
            </div>
          </div>
        `;
      }).join('');
    } else if (this.currentTab === 'usuarios') {
      itemsHtml = filtered.map(u => {
        const initials = this.getInitials(u.nome);
        return `
          <div class="list-item" onclick="Gestao.openUsuarioForm('${u.id}')">
            <div class="li-avatar" style="background-color: rgba(163, 114, 64, 0.1); color: #7C3AED;">
              ${initials}
            </div>
            <div class="li-info">
              <div class="li-name">${u.nome}</div>
              <div class="li-sub">${u.email}</div>
            </div>
            <div class="li-right">
              <span class="li-badge b-purple">${u.role === 'admin' ? 'Admin' : u.role === 'gestor_geral' ? 'Geral' : u.role === 'gestor_regional' ? 'Regional' : u.role === 'padeiro' ? 'Padeiro' : 'Gestor'}</span>
              <span class="li-badge ${u.ativo !== false ? 'b-ativo' : 'b-inativo'}">${u.ativo !== false ? 'Ativo' : 'Inativo'}</span>
            </div>
            <div class="li-actions">
              <button aria-label="Editar" onclick="event.stopPropagation(); Gestao.openUsuarioForm('${u.id}')">
                <i data-lucide="pencil" class="i-edit"></i>
              </button>
              <button aria-label="Excluir" onclick="event.stopPropagation(); Gestao.deleteUsuario('${u.id}', '${u.nome}')">
                <i data-lucide="trash-2" class="i-del"></i>
              </button>
            </div>
          </div>
        `;
      }).join('');
    }

    c.innerHTML = `
      ${this.currentTab === 'padeiros' && API.getUser().role === 'superadmin' ? `
      <div style="padding: 0 20px 12px; display: flex; justify-content: flex-end;">
        <button class="pill-btn btn-light-orange" style="border: 1px solid var(--error) !important; color: var(--error) !important; background: transparent; font-size: 13px; font-weight:700; height: 38px; gap:6px; padding: 0 16px;" onclick="Gestao.deleteAllUsersExceptSuperadmin()">
          <i data-lucide="trash-2" style="width: 14px; height: 14px; color: var(--error) !important;"></i> Excluir todos os usuários
        </button>
      </div>
      ` : ''}
      <div class="list-card cascade-item" style="--index: 10;">
        ${itemsHtml}
      </div>
    `;
  },

  // -- PADEIROS --
  renderPadeiros(c, data) {
    c.innerHTML = `
    <div class="tab-padeiros card">
      <div class="flex justify-between items-center mb-6 gestao-list-header">
        <h3 style="display: flex; align-items: center; gap: 8px;">
          <i data-lucide="chef-hat" class="text-primary"></i> 
          Lista de Funcionários
          <span class="badge badge-secondary">${data.length}</span>
        </h3>
      </div>
      
      <button class="btn btn-primary btn-new-padeiro" onclick="Gestao.openPadeiroForm()">
        <i data-lucide="plus"></i> Novo Funcionário
      </button>
      ${API.getUser().role === 'superadmin' ? `
      <button class="btn btn-outline" style="border: 1px solid var(--error) !important; color: var(--error) !important; background: transparent; margin-left: 8px;" onclick="Gestao.deleteAllUsersExceptSuperadmin()">
        <i data-lucide="trash-2" style="color: var(--error) !important;"></i> Excluir todos os usuários
      </button>
      ` : ''}

      ${data.length === 0 ? '<div class="text-tertiary">Nenhum funcionário encontrado.</div>' : `
      <!-- Desktop Table -->
      <div class="table-responsive desktop-only">
        <table>
          <thead style="position: sticky; top: 0; background: var(--system-bg);">
            <tr><th>Funcionário</th><th>Cargo</th><th>COD TEC</th><th>CPF</th><th>Filial</th><th>Status</th><th>Contrato</th><th style="text-align: right;">Ações</th></tr>
          </thead>
          <tbody>
            ${data.map(p => {
              let contractBadgeHtml = '';
              if (!p.contrato) {
                contractBadgeHtml = '<span class="badge badge-secondary" style="background: #F1F1F0; color: #8E8E93;">Sem contrato</span>';
              } else if (p.contrato.status === 'pending' || p.contrato.status === 'Enviado para assinatura') {
                contractBadgeHtml = '<span class="badge badge-warning" style="background: #FFF3E0; color: #E65100;">Aguardando assinatura</span>';
              } else if (p.contrato.status === 'signed' || p.contrato.status === 'Assinado por ambas') {
                const pdfUrl = (p.contrato.pdfPath || p.contrato.signedUrl || '').replace('/uploads/', '/storage/');
                contractBadgeHtml = `<a href="${pdfUrl}" target="_blank" onclick="event.stopPropagation();" class="badge badge-success" style="background: #E8F5E9; color: #2E7D32; text-decoration: underline;">Contrato assinado</a>`;
              } else {
                contractBadgeHtml = `<span class="badge badge-secondary">${p.contrato.status}</span>`;
              }

              let contractActionHtml = '';
              if (!p.contrato) {
                contractActionHtml = `
                  <button class="btn btn-icon btn-sm hover-lift" onclick="event.stopPropagation(); Gestao.openGenerateContractModal('${p.id}')" title="Gerar Contrato">
                    <i data-lucide="file-signature" class="text-blue"></i>
                  </button>
                `;
              } else {
                contractActionHtml = `
                  <button class="btn btn-icon btn-sm hover-lift" onclick="event.stopPropagation(); Gestao.openContratoDetailsModal('${p.contrato.id}')" title="Ver Detalhes do Contrato">
                    <i data-lucide="eye" class="text-blue"></i>
                  </button>
                  ${p.contrato.status === 'pending' || p.contrato.status === 'Enviado para assinatura' ? `
                    <button class="btn btn-icon btn-sm hover-lift" onclick="event.stopPropagation(); Gestao.resendContractReminder('${p.contrato.id}')" title="Reenviar lembrete">
                      <i data-lucide="send" class="text-orange"></i>
                    </button>
                  ` : ''}
                `;
              }

              return `
                <tr>
                  <td>
                    <div class="row-user-info" style="display: flex; align-items: center; gap: 12px;">
                      <div class="row-avatar" style="width: 36px; height: 36px; border-radius: 50%; background-color: ${this.getRoleColor(p.cargo, p.nome)}; color: ${this.getDarkColor(this.cargoBadge(p.cargo), p.nome)}; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px;">
                        ${this.getInitials(p.nome)}
                      </div>
                      <div>
                        <div style="font-weight: 600; color: var(--hig-label-primary); font-size: 14px;">${p.nome}</div>
                        <div style="font-size: 12px; color: var(--hig-label-secondary);">${p.email || '-'}</div>
                      </div>
                    </div>
                  </td>
                  <td><span class="badge badge-${this.cargoBadge(p.cargo)}">${p.cargo || '-'}</span></td>
                  <td style="font-family:monospace;color:var(--primary); font-weight:600;">${p.codTec || '-'}</td>
                  <td class="text-secondary" style="font-size:13px">${this.formatCPF(p.cpf)}</td>
                  <td class="text-secondary" style="font-size:13px">${(Array.isArray(p.filial) ? p.filial.join(', ') : (p.filial || '')).replace(/Bancada /g, '')}</td>
                  <td>${p.ativo ? '<span class="badge badge-success">Ativo</span>' : '<span class="badge badge-danger">Inativo</span>'}</td>
                  <td>${contractBadgeHtml}</td>
                  <td style="text-align: right;">
                    <div class="row-actions flex gap-2 justify-end">
                      ${contractActionHtml}
                      <button class="btn btn-icon btn-sm" onclick="Gestao.openPadeiroForm('${p.id}')"><i data-lucide="pencil" class="text-blue"></i></button>
                      <button class="btn btn-icon btn-sm" onclick="Gestao.deletePadeiro('${p.id}','${p.nome}')"><i data-lucide="trash-2" class="text-danger"></i></button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- Mobile Apple List -->
      <div class="apple-list mobile-only">
        ${data.map(p => {
          const initials = this.getInitials(p.nome);
          const badgeClass = this.cargoBadge(p.cargo);
          const roleColor = this.getRoleColor(p.cargo, p.nome);

          let contractBadgeHtml = '';
          if (!p.contrato) {
            contractBadgeHtml = '<span class="apple-badge-pill badge-apple-gray" style="background: #F1F1F0; color: #8E8E93;">Sem contrato</span>';
          } else if (p.contrato.status === 'pending' || p.contrato.status === 'Enviado para assinatura') {
            contractBadgeHtml = '<span class="apple-badge-pill badge-apple-orange" style="background: #FFF3E0; color: #E65100;">Aguardando</span>';
          } else if (p.contrato.status === 'signed' || p.contrato.status === 'Assinado por ambas') {
            const pdfUrl = (p.contrato.pdfPath || p.contrato.signedUrl || '').replace('/uploads/', '/storage/');
            contractBadgeHtml = `<a href="${pdfUrl}" target="_blank" onclick="event.stopPropagation();" class="apple-badge-pill badge-apple-green" style="background: #E8F5E9; color: #2E7D32; text-decoration: underline;">Assinado</a>`;
          } else {
            contractBadgeHtml = `<span class="apple-badge-pill badge-apple-gray">${p.contrato.status}</span>`;
          }

          let contractActionHtml = '';
          if (!p.contrato) {
            contractActionHtml = `
              <button class="btn btn-icon btn-sm hover-lift" onclick="event.stopPropagation(); Gestao.openGenerateContractModal('${p.id}')" title="Gerar Contrato" style="padding:4px;">
                <i data-lucide="file-signature" class="text-blue" style="width:16px; height:16px;"></i>
              </button>
            `;
          } else {
            contractActionHtml = `
              <button class="btn btn-icon btn-sm hover-lift" onclick="event.stopPropagation(); Gestao.openContratoDetailsModal('${p.contrato.id}')" title="Ver Detalhes do Contrato" style="padding:4px;">
                <i data-lucide="eye" class="text-blue" style="width:16px; height:16px;"></i>
              </button>
              ${p.contrato.status === 'pending' || p.contrato.status === 'Enviado para assinatura' ? `
                <button class="btn btn-icon btn-sm hover-lift" onclick="event.stopPropagation(); Gestao.resendContractReminder('${p.contrato.id}')" title="Reenviar lembrete" style="padding:4px;">
                  <i data-lucide="send" class="text-orange" style="width:16px; height:16px;"></i>
                </button>
              ` : ''}
            `;
          }

          return `
            <div class="apple-card" onclick="Gestao.openPadeiroForm('${p.id}')">
              <div class="apple-avatar" style="background-color: ${roleColor}; color: ${this.getDarkColor(badgeClass, p.nome)}">${initials}</div>
              <div class="apple-card-info">
                <div class="apple-card-top">
                  <span class="apple-card-name">${p.nome}</span>
                  <span class="apple-card-code">${p.codTec || ''}</span>
                </div>
                <div class="apple-card-mid" style="display: flex; gap: 8px; align-items: center;">
                  <span class="apple-badge-pill badge-apple-${badgeClass}">${p.cargo || '-'}</span>
                  ${contractBadgeHtml}
                </div>
                <div class="apple-card-cpf">CPF: ${this.formatCPF(p.cpf)}</div>
              </div>
              <div class="flex items-center gap-2" style="z-index: 10; position: relative;">
                ${contractActionHtml}
                <i data-lucide="chevron-right" class="apple-chevron" style="width:16px; height:16px;"></i>
              </div>
            </div>`;
        }).join('')}
      </div>
      `}
    </div>`;
  },

  getInitials(name) {
    if (!name) return '??';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return parts[0].substring(0, 2).toUpperCase();
  },

  getRoleColor(cargo, nome = '') {
    const badge = this.cargoBadge(cargo);
    if (badge === 'amber' && nome) {
      const fallbackColors = ['rgba(229, 90, 43, 0.1)', 'rgba(52, 199, 89, 0.1)', 'rgba(28, 26, 20, 0.1)', 'rgba(255, 154, 60, 0.1)', 'rgba(255, 59, 48, 0.1)'];
      return fallbackColors[(nome.charCodeAt(0) || 0) % fallbackColors.length];
    }
    const colors = {
      'apple-blue': 'rgba(229, 90, 43, 0.1)',
      'apple-orange': 'rgba(28, 26, 20, 0.1)',
      'apple-green': 'rgba(52, 199, 89, 0.1)',
      'apple-purple': 'rgba(255, 154, 60, 0.1)',
      'apple-red': 'rgba(255, 59, 48, 0.1)',
      'blue': 'rgba(229, 90, 43, 0.1)',
      'purple': 'rgba(255, 154, 60, 0.1)',
      'red': 'rgba(255, 59, 48, 0.1)',
      'amber': 'rgba(255, 204, 0, 0.1)'
    };
    return colors[badge] || 'rgba(142, 142, 147, 0.1)';
  },

  getDarkColor(badge, nome = '') {
    if (badge === 'amber' && nome) {
      const fallbackColors = ['#E55A2B', '#34C759', '#1C1A14', '#FF9A3C', '#FF3B30'];
      return fallbackColors[(nome.charCodeAt(0) || 0) % fallbackColors.length];
    }
    const colors = {
      'apple-blue': '#E55A2B',
      'apple-orange': '#1C1A14',
      'apple-green': '#34C759',
      'apple-purple': '#FF9A3C',
      'apple-red': '#FF3B30',
      'blue': '#E55A2B',
      'purple': '#FF9A3C',
      'red': '#FF3B30',
      'amber': '#FFCC00'
    };
    return colors[badge] || '#8E8E93';
  },

  formatCPF(v) {
    if (!v) return '-';
    const clean = v.replace(/\D/g, '');
    if (clean.length !== 11) return v;
    return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  },

  formatIE(v) {
    if (!v) return '';
    let num = String(v).replace(/\D/g, '');
    if (num.length >= 9) {
      return num.substring(0, 2) + '.' + num.substring(2, 5) + '.' + num.substring(5, 8) + '-' + num.substring(8);
    }
    return v;
  },

  cargoBadge(cargo) {
    if (!cargo) return 'amber';
    const c = cargo.toUpperCase();
    if (c.includes('PROMOTOR')) return 'apple-blue';
    if (c.includes('TRAINEE')) return 'apple-orange';
    if (c.includes('JUNIOR')) return 'apple-green';
    if (c.includes('ASSISTENTE')) return 'apple-purple';
    if (c.includes('SENIOR')) return 'purple';
    if (c.includes('PLENO')) return 'blue';
    if (c.includes('GESTOR')) return 'red';
    return 'amber';
  },

  openPadeiroForm(id) {
    const p = id ? this.allData.padeiros.find(x => x.id === id) : {};
    const isEdit = !!id;

    let modalBodyHtml = '';
    if (isEdit) {
      modalBodyHtml = `
        <div class="modal-tabs" style="display: flex; gap: 16px; border-bottom: 1px solid var(--separator); padding-bottom: 12px; margin-bottom: 20px;">
          <button type="button" class="modal-tab-btn active" id="btn-tab-dados" onclick="Gestao.switchModalTab('dados')" style="background: none; border: none; font-weight: 700; color: var(--primary); font-size: 14px; cursor: pointer; padding-bottom: 6px; border-bottom: 2px solid var(--primary); transition: all 0.2s;">Dados Cadastrais</button>
          <button type="button" class="modal-tab-btn" id="btn-tab-contratos" onclick="Gestao.switchModalTab('contratos', '${id}')" style="background: none; border: none; font-weight: 500; color: var(--text-muted); font-size: 14px; cursor: pointer; padding-bottom: 6px; border-bottom: 2px solid transparent; transition: all 0.2s;">Contratos</button>
        </div>
        
        <div id="modal-tab-dados-container">
          <form id="padeiro-form">
            <div class="flex gap-4">
              <div class="form-group w-full"><label>Nome Completo</label><input class="input-control" name="nome" value="${p.nome || ''}" required></div>
              <div class="form-group w-full"><label>Cargo</label>
                <select class="input-control" name="cargo">
                  ${['PADEIRO TREINEE', 'PADEIRO JUNIOR', 'PADEIRO PLENO', 'PADEIRO SENIOR', 'GESTOR', 'PROMOTOR', 'ASSISTENTE DE PANIFICAÇÃO', 'CRIADOR'].map(c =>
                    `<option ${p.cargo === c ? 'selected' : ''}>${c}</option>`).join('')}
                </select>
              </div>
            </div>
            <div class="flex gap-4">
              <div class="form-group w-full"><label>CPF</label><input class="input-control" name="cpf" value="${p.cpf || ''}"></div>
              <div class="form-group w-full"><label>RG</label><input class="input-control" name="rg" value="${p.rg || ''}"></div>
            </div>
            <div class="flex gap-4">
              <div class="form-group w-full"><label>COD TEC</label><input class="input-control" name="codTec" value="${p.codTec || ''}" placeholder="Gerado automaticamente"></div>
              <div class="form-group w-full"><label>Filial</label>
                <select class="input-control" name="filial">
                  ${['Bancada Brasília', 'Bancada Goiania', 'Bancada Palmas', 'Bancada Campo Grande'].map(f =>
                    `<option ${(Array.isArray(p.filial) ? p.filial.includes(f) : p.filial === f) ? 'selected' : ''}>${f}</option>`).join('')}
                </select>
              </div>
            </div>
            <div class="flex gap-4">
              <div class="form-group w-full"><label>Email</label><input class="input-control" type="email" name="email" value="${p.email || ''}" required></div>
              <div class="form-group w-full"><label>Telefone</label><input class="input-control" name="telefone" value="${p.telefone || ''}"></div>
            </div>
            <div class="flex gap-4">
              <div class="form-group w-full"><label>Data de Nascimento</label><input class="input-control" type="date" name="dataNascimento" value="${p.dataNascimento || ''}"></div>
              <div class="form-group w-full"><label>Senha (deixe em branco para não alterar)</label><input class="input-control" type="password" name="senha" placeholder="••••••••"></div>
            </div>
          </form>
        </div>
        
        <div id="modal-tab-contratos-container" style="display: none; min-height: 200px;">
          <div class="loading-spinner" style="display:flex; justify-content:center; align-items:center; height:150px;">
            <div class="spinner" style="width: 24px; height: 24px; border: 3px solid rgba(0,0,0,0.1); border-top-color: var(--primary); border-radius: 50%; animation: spin 1s linear infinite;"></div>
          </div>
        </div>
      `;
    } else {
      modalBodyHtml = `
      <form id="padeiro-form">
        <div class="flex gap-4">
          <div class="form-group w-full"><label>Nome Completo</label><input class="input-control" name="nome" value="" required></div>
          <div class="form-group w-full"><label>Cargo</label>
            <select class="input-control" name="cargo">
              ${['PADEIRO TREINEE', 'PADEIRO JUNIOR', 'PADEIRO PLENO', 'PADEIRO SENIOR', 'GESTOR', 'PROMOTOR', 'ASSISTENTE DE PANIFICAÇÃO', 'CRIADOR'].map(c =>
                `<option>${c}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="flex gap-4">
          <div class="form-group w-full"><label>CPF</label><input class="input-control" name="cpf" value=""></div>
          <div class="form-group w-full"><label>RG</label><input class="input-control" name="rg" value=""></div>
        </div>
        <div class="flex gap-4">
          <div class="form-group w-full"><label>COD TEC</label><input class="input-control" name="codTec" value="" placeholder="Gerado automaticamente"></div>
          <div class="form-group w-full"><label>Filial</label>
            <select class="input-control" name="filial">
              ${['Bancada Brasília', 'Bancada Goiania', 'Bancada Palmas', 'Bancada Campo Grande'].map(f =>
                `<option>${f}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="flex gap-4">
          <div class="form-group w-full"><label>Email</label><input class="input-control" type="email" name="email" value="" required></div>
          <div class="form-group w-full"><label>Telefone</label><input class="input-control" name="telefone" value=""></div>
        </div>
        <div class="flex gap-4">
          <div class="form-group w-full"><label>Data de Nascimento</label><input class="input-control" type="date" name="dataNascimento" value=""></div>
          <div class="form-group w-full"><label>Senha</label><input class="input-control" type="password" name="senha" placeholder="Defina uma senha"></div>
        </div>
      </form>`;
    }

    Components.showModal(isEdit ? 'Editar Funcionário' : 'Novo Funcionário', modalBodyHtml,
      `<button class="btn btn-secondary" onclick="Components.closeModal()">Cancelar</button>
       <button class="btn btn-primary" id="btn-modal-save" onclick="Gestao.savePadeiro('${id || ''}')">Salvar</button>`
    );

    // Add CPF mask listener
    const cpfInput = document.querySelector('input[name="cpf"]');
    if (cpfInput) {
      cpfInput.maxLength = 14;
      cpfInput.addEventListener('input', e => {
        let v = e.target.value.replace(/\D/g, '');
        if (v.length > 11) v = v.substring(0, 11);
        v = v.replace(/(\d{3})(\d)/, '$1.$2');
        v = v.replace(/(\d{3})(\d)/, '$1.$2');
        v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        e.target.value = v;
      });
    }

    Components.renderIcons();
  },

  async savePadeiro(id) {
    const form = document.getElementById('padeiro-form');
    if (!form.checkValidity()) return form.reportValidity();

    const fd = new FormData(form);
    const body = Object.fromEntries(fd);
    try {
      if (id) await API.put(`/api/padeiros/${id}`, body);
      else await API.post('/api/padeiros', body);
      Components.closeModal();
      Components.toast(id ? 'Funcionário atualizado!' : 'Funcionário cadastrado!', 'success');
      await this.loadTab();
    } catch (e) { Components.toast(e.message, 'error'); }
  },

  deletePadeiro(id, nome) {
    if (confirm(`Deseja excluir o funcionário ${nome}?`)) {
      API.delete(`/api/padeiros/${id}`).then(() => {
        Components.toast('Funcionário excluído.', 'success');
        Gestao.loadTab();
      }).catch(e => Components.toast(e.message, 'error'));
    }
  },

  renderProdutos(c, data) {
    c.innerHTML = `
    <div class="card tab-produtos">
      <div class="flex justify-between items-center mb-6 gestao-list-header">
        <h3 style="display: flex; align-items: center; gap: 8px;">
          <i data-lucide="briefcase" class="text-primary"></i> 
          Lista de Serviços
          <span class="badge badge-secondary">${data.length}</span>
        </h3>
      </div>
 
      <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px;">
        <button class="btn btn-primary btn-new-padeiro" style="margin: 0;" onclick="Gestao.openProdutoForm()">
          <i data-lucide="plus"></i> Novo Serviço
        </button>
      </div>
 
      ${data.length === 0 ? '<div class="text-tertiary">Nenhum serviço cadastrado.</div>' : `
      <!-- Desktop Table -->
      <div class="table-responsive desktop-only">
        <table>
          <thead style="position: sticky; top: 0; background: var(--system-bg);">
            <tr><th>Serviço</th><th>Descrição</th><th>Preço</th><th style="text-align: right;">Ações</th></tr>
          </thead>
          <tbody>
            ${data.map(p => `
              <tr>
                <td>
                  <div class="row-user-info" style="display: flex; align-items: center; gap: 12px;">
                    <div class="row-avatar" style="width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, var(--primary-light), rgba(229,90,43,.15)); color: var(--primary); display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-weight: 800; font-size: 14px;">
                      ${(p.descricao || 'S').charAt(0).toUpperCase()}
                    </div>
                    <div style="font-weight: 600; color: var(--hig-label-primary); font-size: 14px;">${p.descricao}</div>
                  </div>
                </td>
                <td class="text-secondary" style="font-size:13px; max-width: 280px;">
                  <span style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${p.descricaoLonga || '<em style="color:#CBD5E1">Sem descrição</em>'}</span>
                </td>
                <td style="font-weight: 600; color: var(--primary); font-size: 13px; white-space:nowrap;">${p.preco !== undefined && p.preco !== null ? `R$ ${Number(p.preco).toFixed(2).replace('.', ',')}` : 'R$ 0,00'}</td>
                <td style="text-align: right;">
                  <div class="row-actions flex gap-2 justify-end">
                    <button class="btn btn-icon btn-sm" onclick="Gestao.openProdutoForm('${p.id}')"><i data-lucide="pencil" class="text-blue"></i></button>
                    <button class="btn btn-icon btn-sm" onclick="Gestao.deleteProduto('${p.id}')"><i data-lucide="trash-2" class="text-danger"></i></button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
 
      <!-- Mobile Apple List -->
      <div class="apple-list mobile-only">
        ${data.map(p => `
          <div class="apple-card" onclick="Gestao.openProdutoForm('${p.id}')">
            <div class="apple-avatar" style="background: linear-gradient(135deg, rgba(229,90,43,.15), rgba(229,90,43,.05)); color: #E55A2B; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 18px;">
              ${(p.descricao || 'S').charAt(0).toUpperCase()}
            </div>
            <div class="apple-card-info">
              <div class="apple-card-top">
                <span class="apple-card-name">${p.descricao}</span>
                <span style="font-weight: 700; color: #E55A2B; font-size: 12px; margin-left: auto;">${p.preco !== undefined && p.preco !== null ? `R$ ${Number(p.preco).toFixed(2).replace('.', ',')}` : 'R$ 0,00'}</span>
              </div>
              ${p.descricaoLonga ? `<div class="apple-card-cpf" style="margin-top:4px; font-size:12px; display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${p.descricaoLonga}</div>` : ''}
            </div>
            <i data-lucide="chevron-right" class="apple-chevron" style="width:16px; height:16px;"></i>
          </div>
        `).join('')}
      </div>
      `}
    </div>`;
  },
 
  openProdutoForm(id) {
    const p = id ? this.allData.produtos.find(x => x.id === id) : {};
    Components.showModal(id ? 'Editar Serviço' : 'Novo Serviço', `
      <form id="produto-form" style="display: flex; flex-direction: column; gap: 16px;">
        <div class="form-group w-full">
          <label>Nome do Serviço</label>
          <input class="input-control" name="descricao" value="${p.descricao || ''}" placeholder="Ex: Instalação elétrica completa" required>
        </div>
        <div class="form-group w-full">
          <label>Descrição do Serviço</label>
          <textarea class="input-control" name="descricaoLonga" rows="3" placeholder="Descreva o que está incluso no serviço..." style="resize:vertical;">${p.descricaoLonga || ''}</textarea>
        </div>
        <div class="form-group w-full">
          <label>Preço (R$)</label>
          <input class="input-control" type="number" min="0" step="0.01" name="preco" value="${p.preco !== undefined && p.preco !== null ? p.preco : ''}" placeholder="Ex: 250,00" required>
        </div>
      </form>`,
      `<button class="btn btn-secondary" onclick="Components.closeModal()">Cancelar</button>
       <button class="btn btn-primary" onclick="Gestao.saveProduto('${id || ''}')">${id ? 'Salvar alterações' : 'Criar Serviço'}</button>`
    );
    Components.renderIcons();
  },

  async saveProduto(id) {
    const form = document.getElementById('produto-form');
    if (!form.checkValidity()) return form.reportValidity();
    const body = Object.fromEntries(new FormData(form));
    try {
      if (id) await API.put(`/api/produtos/${id}`, body);
      else await API.post('/api/produtos', body);
      Components.closeModal();
      Components.toast(id ? 'Serviço atualizado!' : 'Serviço criado!', 'success');
      await this.loadTab();
    } catch (e) { Components.toast(e.message, 'error'); }
  },

  async deleteProduto(id) {
    if (confirm('Deseja excluir este serviço?')) {
      try { await API.delete(`/api/produtos/${id}`); Components.toast('Serviço excluído.', 'success'); await Gestao.loadTab(); }
      catch (e) { Components.toast(e.message, 'error'); }
    }
  },

  // -- CLIENTES --
  renderClientes(c, data) {
    c.innerHTML = `
    <div class="card tab-clientes">
      <div class="flex justify-between items-center mb-6 gestao-list-header">
        <h3 style="display: flex; align-items: center; gap: 8px;">
          <i data-lucide="building-2" class="text-primary"></i> 
          Lista de Clientes
          <span class="badge badge-secondary">${data.length}</span>
        </h3>
      </div>

      <button class="btn btn-primary btn-new-padeiro" onclick="Gestao.openClienteForm()">
        <i data-lucide="plus"></i> Novo Cliente
      </button>

      <button class="btn btn-secondary btn-new-padeiro" style="background: rgba(52, 199, 89, 0.15); color: #34C759; border: 1px solid rgba(52, 199, 89, 0.3); margin-left: 8px;" onclick="Gestao.syncClientes()">
        <i data-lucide="refresh-cw"></i> Sincronizar Base Local
      </button>

      ${data.length === 0 ? '<div class="text-tertiary">Nenhum cliente encontrado.</div>' : `
      <!-- Desktop Table -->
      <div class="table-responsive desktop-only">
        <table>
          <thead style="position: sticky; top: 0; background: var(--system-bg);">
            <tr>
              <th>Cliente</th>
              <th>Descrição</th>
              <th>Bairro / UF</th>
              <th style="text-align: right;">Ações</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(cl => {
              const rawDesc = cl.orcamentoDescricao || '-';
              const displayDesc = rawDesc.length > 20 ? rawDesc.substring(0, 20) + '....' : rawDesc;
              return `
                <tr>
                  <td>
                    <div class="row-user-info" style="display: flex; align-items: center; gap: 12px;">
                      <div class="row-avatar" style="width: 36px; height: 36px; border-radius: 50%; background-color: rgba(52, 199, 89, 0.1); color: var(--hig-system-green); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 12px;">
                        ${cl.codigo || 'CL'}
                      </div>
                      <div>
                        <div style="font-weight: 600; color: var(--hig-label-primary); font-size: 14px;">${cl.nome || '-'}</div>
                      </div>
                    </div>
                  </td>
                  <td class="text-secondary" style="font-size:13px" title="${rawDesc !== '-' ? rawDesc : ''}">${displayDesc}</td>
                  <td class="text-secondary" style="font-size:13px">${cl.bairro || '-'} ${cl.estado ? ' - ' + cl.estado : ''}</td>
                  <td style="text-align: right;">
                    <div class="row-actions flex gap-2 justify-end">
                      <button class="btn btn-icon btn-sm" onclick="Gestao.openClienteForm('${cl.id}')"><i data-lucide="pencil" class="text-blue"></i></button>
                      <button class="btn btn-icon btn-sm" onclick="Gestao.deleteCliente('${cl.id}')"><i data-lucide="trash-2" class="text-danger"></i></button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- Mobile Apple List -->
      <div class="apple-list mobile-only">
        ${data.map(cl => {
          const rawDesc = cl.orcamentoDescricao || '-';
          const displayDesc = rawDesc.length > 20 ? rawDesc.substring(0, 20) + '....' : rawDesc;
          return `
            <div class="apple-card" onclick="Gestao.openClienteForm('${cl.id}')">
              <div class="apple-avatar" style="background-color: rgba(52, 199, 89, 0.1); color: #34C759; font-size: 12px;">
                ${cl.codigo || 'CL'}
              </div>
              <div class="apple-card-info">
                <div class="apple-card-top">
                  <span class="apple-card-name">${cl.nome}</span>
                </div>
                <div style="font-size: 12px; color: var(--hig-label-secondary); margin-top: 2px;" title="${rawDesc !== '-' ? rawDesc : ''}">
                  ${displayDesc}
                </div>
                <div class="apple-card-mid" style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
                  <span class="apple-card-cpf">${cl.bairro || 'Sem bairro'}${cl.estado ? ' - ' + cl.estado : ''}</span>
                </div>
              </div>
              <i data-lucide="chevron-right" class="apple-chevron" style="width:16px; height:16px;"></i>
            </div>
          `;
        }).join('')}
      </div>
      `}
    </div>`;
  },

  openClienteForm(id) {
    const cl = id ? this.allData.clientes.find(x => x.id === id) : {};
    const isEdit = !!id;

    Components.showModal(isEdit ? 'Editar Cliente' : 'Novo Cliente', `
      <form id="cliente-form" style="display: flex; flex-direction: column; gap: 16px;">
        ${isEdit ? `
          <div class="form-group">
            <label class="cliente-form-label" style="font-size: 13px; font-weight: 700; color: #7A7567; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; display: block;">Código</label>
            <input class="input-control" name="codigo" value="${cl.codigo || ''}" readonly style="background: var(--apple-bg); opacity: 0.8; cursor: not-allowed;">
          </div>
        ` : ''}
        <div>
          <label class="cliente-form-label" style="font-size: 13px; font-weight: 700; color: #7A7567; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; display: block;">Nome do Cliente</label>
          <input class="input-control" name="nome" value="${cl.nome || ''}" required placeholder="Ex: Padaria São João" />
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div>
            <label class="cliente-form-label" style="font-size: 13px; font-weight: 700; color: #7A7567; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; display: block;">Receita Mensal (R$)</label>
            <input type="number" name="receita" id="gestao-cliente-receita" class="input-control" placeholder="Ex: 10000" step="0.01" min="0" value="${cl.receita !== undefined && cl.receita !== null ? cl.receita : 0}" />
          </div>
          <div>
            <label class="cliente-form-label" style="font-size: 13px; font-weight: 700; color: #7A7567; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; display: block;">Custo de Insumos (R$)</label>
            <input type="number" name="custoInsumos" id="gestao-cliente-insumos" class="input-control" placeholder="Ex: 3000" step="0.01" min="0" value="${cl.custoInsumos !== undefined && cl.custoInsumos !== null ? cl.custoInsumos : 0}" />
          </div>
        </div>
        <div>
          <label class="cliente-form-label" style="font-size: 13px; font-weight: 700; color: #7A7567; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; display: block;">Endereço Completo</label>
          <input type="text" name="endereco" class="input-control" placeholder="Ex: Av. Paulista, 1000" value="${cl.endereco || ''}" />
        </div>
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 12px;">
          <div>
            <label class="cliente-form-label" style="font-size: 13px; font-weight: 700; color: #7A7567; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; display: block;">Bairro</label>
            <input type="text" name="bairro" class="input-control" placeholder="Ex: Jardins" value="${cl.bairro || ''}" />
          </div>
          <div>
            <label class="cliente-form-label" style="font-size: 13px; font-weight: 700; color: #7A7567; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; display: block;">UF (Estado)</label>
            <input type="text" name="estado" class="input-control" placeholder="Ex: SP" maxlength="2" style="text-transform: uppercase;" value="${cl.estado || ''}" />
          </div>
        </div>
        <!-- Live Preview of Profit -->
        <div id="gestao-cliente-preview" style="background: #FDFBF9; border-radius: 16px; padding: 16px; border: 1px solid var(--apple-separator); display: none;">
          <div style="font-size: 13px; font-weight: 700; color: #7A7567; margin-bottom: 8px;">Prévia do Ganho Líquido</div>
          <div style="display: flex; justify-content: space-between; align-items: center; text-align: center;">
            <div style="flex: 1;">
              <span style="font-size: 11px; color: #7A7567; display: block; margin-bottom: 2px;">Receita</span>
              <div id="g-preview-receita" style="font-size: 16px; font-weight: 800; color: #E55A2B;">R$ 0,00</div>
            </div>
            <span style="font-size: 20px; color: #D2CABD; flex-shrink: 0; padding: 0 4px;">−</span>
            <div style="flex: 1;">
              <span style="font-size: 11px; color: #7A7567; display: block; margin-bottom: 2px;">Insumos</span>
              <div id="g-preview-insumos" style="font-size: 16px; font-weight: 800; color: #FF9A3C;">R$ 0,00</div>
            </div>
            <span style="font-size: 20px; color: #D2CABD; flex-shrink: 0; padding: 0 4px;">=</span>
            <div style="flex: 1;">
              <span style="font-size: 11px; color: #7A7567; display: block; margin-bottom: 2px;">Ganho Líquido</span>
              <div id="g-preview-lucro" style="font-size: 16px; font-weight: 800; color: #10B981;">R$ 0,00</div>
            </div>
          </div>
        </div>
      </form>`,
      `<button class="btn btn-secondary" onclick="Components.closeModal()">Cancelar</button>
       <button class="btn btn-primary" onclick="Gestao.saveCliente('${id || ''}')">Salvar</button>`
    );

    // Bind live preview
    const rInput = document.getElementById('gestao-cliente-receita');
    const iInput = document.getElementById('gestao-cliente-insumos');
    if (rInput && iInput) {
      const updatePreview = () => {
        const r = parseFloat(rInput.value) || 0;
        const i = parseFloat(iInput.value) || 0;
        const lucro = r - i;
        const preview = document.getElementById('gestao-cliente-preview');
        if (preview) {
          preview.style.display = (r > 0 || i > 0) ? 'block' : 'none';
          document.getElementById('g-preview-receita').textContent = `R$ ${r.toFixed(2).replace('.', ',')}`;
          document.getElementById('g-preview-insumos').textContent = `R$ ${i.toFixed(2).replace('.', ',')}`;
          const lucroEl = document.getElementById('g-preview-lucro');
          lucroEl.textContent = `R$ ${lucro.toFixed(2).replace('.', ',')}`;
          lucroEl.style.color = lucro >= 0 ? '#10B981' : '#EF4444';
        }
      };
      rInput.addEventListener('input', updatePreview);
      iInput.addEventListener('input', updatePreview);
      // Run once on load for edit form
      updatePreview();
    }

    Components.renderIcons();
  },

  async saveCliente(id) {
    const form = document.getElementById('cliente-form');
    if (!form.checkValidity()) return form.reportValidity();
    const body = Object.fromEntries(new FormData(form));
    try {
      if (id) await API.put(`/api/clientes/${id}`, body);
      else await API.post('/api/clientes', body);
      Components.closeModal();
      Components.toast('Cliente salvo!', 'success');
      await this.loadTab();
    } catch (e) { Components.toast(e.message, 'error'); }
  },

  async deleteCliente(id) {
    if (confirm('Deseja excluir este cliente?')) {
      try { await API.delete(`/api/clientes/${id}`); Components.toast('Excluído.', 'success'); await Gestao.loadTab(); }
      catch (e) { Components.toast(e.message, 'error'); }
    }
  },

  async syncClientes() {
    if (confirm('Deseja sincronizar o banco de dados de produção com as informações locais do repositório? Isso substituirá a tabela de clientes antiga pela nova contendo os CNPJs e as Inscrições Estaduais.')) {
      const btn = document.activeElement;
      const originalText = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '<i data-lucide="refresh-cw" class="spin"></i> Sincronizando...';
      Components.renderIcons();

      try {
        const res = await API.post('/api/admin/sync-clientes');
        Components.toast(res.message || 'Sincronização realizada com sucesso!', 'success');
        await this.loadTab();
      } catch (e) {
        Components.toast(e.message || 'Erro ao sincronizar clientes.', 'error');
      } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
        Components.renderIcons();
      }
    }
  },

  // -- ATIVIDADES (REGISTROS) --
  renderAtividades(c, data) {
    const sorted = [...data].sort((a, b) => new Date(b.inicioEm || b.data) - new Date(a.inicioEm || a.data));

    c.innerHTML = `
    <div class="card tab-atividades">
      <div class="flex justify-between items-center mb-6 gestao-list-header">
        <h3 style="display: flex; align-items: center; gap: 8px;">
          <i data-lucide="history" class="text-primary"></i> 
          Registros de Produção
          <span class="badge badge-secondary">${data.length}</span>
        </h3>
      </div>

      ${sorted.length === 0 ? '<div class="text-tertiary">Nenhum registro de atividade encontrado.</div>' : `
      <!-- Desktop Table -->
      <div class="table-responsive desktop-only">
        <table>
          <thead style="position: sticky; top: 0; background: var(--system-bg);">
            <tr><th>Registro (Funcionário / Cliente)</th><th>Data/Hora</th><th>KG Total</th><th>Status</th><th style="text-align: right;">Ver</th></tr>
          </thead>
          <tbody>
            ${sorted.map(a => `
              <tr>
                <td>
                  <div class="row-user-info" style="display: flex; align-items: center; gap: 12px;">
                    <div class="row-avatar" style="width: 36px; height: 36px; border-radius: 50%; background-color: ${this.getRoleColor('', a.padeiroNome)}; color: ${this.getDarkColor('amber', a.padeiroNome)}; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px;">
                      ${this.getInitials(a.padeiroNome)}
                    </div>
                    <div>
                      <div style="font-weight: 600; color: var(--hig-label-primary); font-size: 14px;">${a.padeiroNome}</div>
                      <div style="font-size: 12px; color: var(--hig-label-secondary);">${a.clienteNome}</div>
                    </div>
                  </div>
                </td>
                <td class="text-secondary" style="font-size:13px">${new Date(a.inicioEm || a.data).toLocaleString('pt-BR')}</td>
                <td style="font-weight:700; color: var(--primary);">${a.kgTotal || '0'} kg</td>
                <td><span class="badge badge-${a.status === 'finalizado' ? 'success' : 'amber'}">${a.status}</span></td>
                <td style="text-align: right;">
                  <div class="row-actions flex gap-2 justify-end">
                    <button class="btn btn-icon btn-sm" onclick="Gestao.viewAtividade('${a.id}')"><i data-lucide="eye" class="text-blue"></i></button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Mobile Apple List -->
      <div class="apple-list mobile-only">
        ${sorted.map(a => {
      const initials = this.getInitials(a.padeiroNome);
      return `
          <div class="apple-card" onclick="Gestao.viewAtividade('${a.id}')">
            <div class="apple-avatar" style="background-color: ${this.getRoleColor('', a.padeiroNome)}; color: ${this.getDarkColor('amber', a.padeiroNome)};">
              ${initials}
            </div>
            <div class="apple-card-info" style="min-width: 0; overflow: hidden;">
              <div class="apple-card-top" style="display: flex; justify-content: space-between; width: 100%; min-width: 0;">
                <span class="apple-card-name" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; margin-right: 8px;" title="${a.clienteNome}">${a.clienteNome}</span>
                <span class="apple-card-code" style="color: var(--apple-blue); font-weight: 700; white-space: nowrap; flex-shrink: 0;">${a.kgTotal || '0'} kg</span>
              </div>
              <div class="apple-card-mid">
                <span class="apple-card-cpf">${a.padeiroNome}</span>
              </div>
              <div class="apple-card-mid" style="margin-top: 4px;">
                 <span class="apple-card-code" style="font-size: 11px;">${new Date(a.inicioEm || a.data).toLocaleString('pt-BR')}</span>
              </div>
            </div>
            <i data-lucide="chevron-right" class="apple-chevron" style="width:16px; height:16px;"></i>
          </div>`;
    }).join('')}
      </div>
      `}
    </div>`;
  },

  viewAtividade(id) {
    const a = this.allData.atividades.find(x => x.id === id);
    if (!a) return;

    const itemsHtml = (a.kgItens || []).map(item => `
      <div style="display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid var(--separator);">
        <div>
          <div style="font-weight:600; font-size:14px;">${item.produtoNome}</div>
          <div class="text-tertiary" style="font-size:12px;">ID: ${item.produtoId}</div>
        </div>
        <div style="font-weight:700; color:var(--primary);">${item.quantidade !== undefined ? item.quantidade : (item.kg || 0)} ${item.unidade ? item.unidade.toLowerCase() : 'kg'}</div>
      </div>
    `).join('') || '<div class="text-tertiary">Nenhum produto detalhado.</div>';

    const fotosHtml = (a.fotos || []).map(f => `
      <div style="position:relative; aspect-ratio:1; border-radius:8px; overflow:hidden; border:1px solid var(--separator);">
        <img src="${(f.path || '').replace('/uploads/', '/storage/')}" style="width:100%; height:100%; object-fit:cover;" onclick="window.open('${(f.path || '').replace('/uploads/', '/storage/')}', '_blank')">
      </div>
    `).join('');

    Components.showModal('Detalhes da Atividade', `
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:24px;">
        <div><p class="text-tertiary uppercase font-bold" style="font-size:10px;">Padeiro</p><p class="font-bold">${a.padeiroNome}</p></div>
        <div><p class="text-tertiary uppercase font-bold" style="font-size:10px;">Cliente</p><p class="font-bold">${a.clienteNome}</p></div>
        <div><p class="text-tertiary uppercase font-bold" style="font-size:10px;">Data</p><p class="font-bold">${new Date(a.inicioEm).toLocaleDateString('pt-BR')}</p></div>
        <div><p class="text-tertiary uppercase font-bold" style="font-size:10px;">KG Total</p><p class="font-bold" style="color:var(--primary);">${a.kgTotal} kg</p></div>
      </div>

      <h4 style="margin-bottom:12px; font-size:14px; border-bottom:2px solid var(--primary); display:inline-block; padding-bottom:4px;">Produtos Produzidos</h4>
      <div style="background:var(--system-bg); padding:0 16px; border-radius:12px; margin-bottom:24px;">
        ${itemsHtml}
      </div>

      ${a.fotos && a.fotos.length > 0 ? `
        <h4 style="margin-bottom:12px; font-size:14px; border-bottom:2px solid var(--primary); display:inline-block; padding-bottom:4px;">Fotos da Produção</h4>
        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:8px; margin-bottom:24px;">
          ${fotosHtml}
        </div>
      ` : ''}

      ${a.assinatura && a.assinatura !== 'null' ? `
        <h4 style="margin-bottom:12px; font-size:14px; border-bottom:2px solid var(--primary); display:inline-block; padding-bottom:4px;">Assinatura do Cliente</h4>
        <div style="background:white; border:1px solid var(--separator); border-radius:8px; padding:8px;">
          <img src="${a.assinatura.replace('/uploads/', '/storage/')}" style="width:100%; max-height:150px; object-fit:contain;">
        </div>
      ` : ''}

      ${a.observacaoCliente ? `<div style="margin-top:20px; padding:12px; background:var(--system-bg); border-radius:8px; font-size:13px;"><strong>Obs Funcionário:</strong> ${a.observacaoCliente}</div>` : ''}
      ${a.comentario ? `<div style="margin-top:10px; padding:12px; background:var(--system-bg); border-radius:8px; font-size:13px;"><strong>Obs Cliente:</strong> ${a.comentario}</div>` : ''}
      ${a.observacao ? `<div style="margin-top:10px; padding:12px; background:var(--system-bg); border-radius:8px; font-size:13px;"><strong>Obs Geral:</strong> ${a.observacao}</div>` : ''}
    `, `<button class="btn btn-primary" onclick="Components.closeModal()">Fechar</button>`, 'modal-lg');

    Components.renderIcons();
  },

  // -- USUÁRIOS (ADMINS/GESTORES) --
  renderUsuarios(c, data) {
    c.innerHTML = `
    <div class="tab-usuarios card">
      <div class="flex justify-between items-center mb-6 gestao-list-header">
        <h3 style="display: flex; align-items: center; gap: 8px;">
          <i data-lucide="users" class="text-primary"></i> 
          Gestão de Usuários (Painel)
          <span class="badge badge-secondary">${data.length}</span>
        </h3>
      </div>
      
      <button class="btn btn-primary btn-new-padeiro" onclick="Gestao.openUsuarioForm()">
        <i data-lucide="user-plus"></i> Adicionar Usuário
      </button>

      ${data.length === 0 ? '<div class="text-tertiary">Nenhum usuário encontrado.</div>' : `
      <!-- Desktop Table -->
      <div class="table-responsive desktop-only">
        <table>
          <thead>
            <tr>
              <th>Usuário</th>
              <th>Papel</th>
              <th>Filial</th>
              <th>Status</th>
              <th class="text-right" style="text-align: right;">Ações</th>
            </tr>
          </thead>
          <tbody>
            ${data.sort((a,b) => a.nome.localeCompare(b.nome)).map(u => `
              <tr style="${!u.ativo ? 'opacity: 0.6;' : ''}">
                <td>
                  <div class="row-user-info" style="display: flex; align-items: center; gap: 12px;">
                    <div class="row-avatar" style="width: 36px; height: 36px; border-radius: 50%; background-color: rgba(163, 114, 64, 0.1); color: var(--hig-system-purple); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px;">
                      ${this.getInitials(u.nome)}
                    </div>
                    <div>
                      <div style="font-weight: 600; color: var(--hig-label-primary); font-size: 14px;">${u.nome}</div>
                      <div style="font-size: 12px; color: var(--hig-label-secondary);">${u.email}</div>
                    </div>
                  </div>
                </td>
                <td>${Components.badge(
                  u.role === 'admin' ? 'Administrador' : 
                  u.role === 'gestor_geral' ? 'Gestor Geral' : 
                  u.role === 'gestor_regional' ? 'Gestor Regional' : 
                  u.role === 'padeiro' ? 'Padeiro' : 'Gestor', 
                  u.role === 'admin' ? 'blue' : u.role === 'gestor_geral' ? 'purple' : u.role === 'padeiro' ? 'green' : 'amber'
                )}</td>
                <td>${(u.filial && u.filial !== 'null') ? (Array.isArray(u.filial) ? u.filial.join(', ') : u.filial) : 'Todas'}</td>
                <td>${u.ativo ? '<span class="text-green font-bold">Ativo</span>' : '<span class="text-danger font-bold">Inativo</span>'}</td>
                <td class="text-right" style="text-align: right;">
                  <div class="row-actions flex gap-2 justify-end">
                    <button class="btn btn-icon btn-sm" onclick="Gestao.openUsuarioForm('${u.id}')" title="Editar">
                      <i data-lucide="pencil" class="text-blue"></i>
                    </button>
                    <button class="btn btn-icon btn-sm" onclick="Gestao.deleteUsuario('${u.id}', '${u.nome}')" title="Excluir">
                      <i data-lucide="trash-2" class="text-danger"></i>
                    </button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Mobile List -->
      <div class="mobile-only apple-list">
        ${data.sort((a,b) => a.nome.localeCompare(b.nome)).map(u => `
          <div class="apple-card" style="${!u.ativo ? 'opacity: 0.6;' : ''}">
            <div class="apple-card-info" onclick="Gestao.openUsuarioForm('${u.id}')">
              <div class="apple-card-name">${u.nome} ${!u.ativo ? '<span style="font-size:10px; color:var(--apple-red);">(Inativo)</span>' : ''}</div>
              <div class="apple-list-subtitle" style="font-size: 13px; color: var(--apple-gray);">
                ${u.role === 'admin' ? 'Admin' : u.role === 'gestor_geral' ? 'Geral' : u.role === 'gestor_regional' ? 'Regional' : u.role === 'padeiro' ? 'Padeiro' : 'Gestor'} • 
                ${(u.filial && u.filial !== 'null') ? (Array.isArray(u.filial) ? u.filial.join(', ') : u.filial) : 'Todas'}
              </div>
            </div>
            <div class="flex items-center gap-2">
               <button class="btn-icon text-danger" onclick="event.stopPropagation(); Gestao.deleteUsuario('${u.id}', '${u.nome}')" style="padding: 8px;">
                 <i data-lucide="trash-2" style="width:18px; height:18px;"></i>
               </button>
               <i data-lucide="chevron-right" class="apple-chevron" style="width:16px; height:16px;"></i>
            </div>
          </div>
        `).join('')}
      </div>
      `}
    </div>`;
  },

  openUsuarioForm(id = null) {
    const u = id ? this.allData.usuarios.find(x => x.id === id) : {};
    
    const html = `
      <form id="form-usuario" class="flex flex-col gap-4">
        <div class="input-group">
          <label class="label">Nome Completo</label>
          <input type="text" name="nome" class="input-control" required placeholder="Ex: João Silva" value="${u.nome || ''}">
        </div>
        <div class="input-group">
          <label class="label">E-mail (Login)</label>
          <input type="email" name="email" class="input-control" required placeholder="joao@Bancada.com" value="${u.email || ''}">
        </div>
        <div class="input-group">
          <label class="label">${id ? 'Nova Senha (deixe em branco para manter)' : 'Senha Inicial'}</label>
          <input type="password" name="senha" class="input-control" ${id ? '' : 'required'} placeholder="Mínimo 6 caracteres">
        </div>
        <div class="input-group">
          <label class="label">Papel (Role)</label>
          <select name="role" class="input-control" onchange="
            const fs = document.getElementById('filial-selector');
            fs.style.display = (this.value === 'admin' || this.value === 'criador') ? 'none' : 'block';
          ">
            <option value="padeiro" ${u.role === 'padeiro' ? 'selected' : ''}>Padeiro (Acesso ao App do Padeiro)</option>
            <option value="gestor_regional" ${u.role === 'gestor_regional' || u.role === 'gestor' ? 'selected' : ''}>Gestor Regional (Acesso a uma filial)</option>
            <option value="gestor_geral" ${u.role === 'gestor_geral' ? 'selected' : ''}>Gestor Geral (Acesso total)</option>
            <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Administrador (Acesso total + Desenvolvimento)</option>
            <option value="criador" ${u.role === 'criador' ? 'selected' : ''}>Criador (Acesso ao Painel do Criador)</option>
          </select>
        </div>
        <div class="input-group" id="filial-selector" style="display: ${(u.role === 'admin' || u.role === 'criador') ? 'none' : 'block'}">
          <label class="label">Filiais Atribuídas</label>
          <p style="font-size: 12px; color: var(--text-secondary); margin: 0 0 8px 0;">Selecione uma ou mais filiais. Se nenhuma for marcada, terá acesso a todas.</p>
          <div class="checkbox-group" style="display: flex; gap: 10px; flex-wrap: wrap;">
            ${['Bancada Brasília', 'Bancada Goiania', 'Bancada Palmas', 'Bancada Campo Grande'].map(f => {
              const uFiliais = Array.isArray(u.filial) ? u.filial : (u.filial && u.filial !== 'null' ? [u.filial] : []);
              const checked = uFiliais.includes(f) ? 'checked' : '';
              return `<label style="display: flex; align-items: center; gap: 5px; cursor: pointer; background: var(--system-bg); padding: 5px 10px; border-radius: 6px;"><input type="checkbox" name="filial" value="${f}" ${checked}> ${f}</label>`;
            }).join('')}
          </div>
        </div>
        <div class="input-group">
          <label class="label">Status do Acesso</label>
          <select name="ativo" class="input-control">
            <option value="true" ${u.ativo !== false ? 'selected' : ''}>Ativo (Pode acessar)</option>
            <option value="false" ${u.ativo === false ? 'selected' : ''}>Inativo (Acesso bloqueado)</option>
          </select>
        </div>
      </form>
    `;

    const footer = `
      <div class="flex justify-between w-full">
        <div>
          ${u.id ? `
            <button class="btn btn-outline text-danger border-danger" onclick="Gestao.deleteUsuario('${u.id}', '${u.nome}')">
              <i data-lucide="archive" style="width:16px; height:16px; vertical-align: middle; margin-right: 4px;"></i>
              Mover para Lixeira
            </button>
          ` : ''}
        </div>
        <div class="flex gap-2">
          <button class="btn btn-secondary" onclick="Components.closeModal()">Cancelar</button>
          <button class="btn btn-primary" onclick="Gestao.saveUsuario('${id || ''}')">${id ? 'Salvar Alterações' : 'Criar Usuário'}</button>
        </div>
      </div>
    `;

    Components.showModal(id ? 'Editar Usuário' : 'Novo Usuário do Painel', html, footer);
    Components.renderIcons();
  },

  async saveUsuario(id = null) {
    const form = document.getElementById('form-usuario');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Pegar todas as filiais selecionadas como array
    const filiais = formData.getAll('filial');
    if (filiais.length > 0) {
      data.filial = filiais;
    } else {
      data.filial = null;
    }

    try {
      if (id) {
        await API.put(`/api/management/users/${id}`, data);
        Components.toast('Usuário atualizado com sucesso!', 'success');
      } else {
        await API.post('/api/management/users', data);
        Components.toast('Usuário criado com sucesso!', 'success');
      }
      Components.closeModal();
      this.loadTab();
    } catch (e) {
      Components.toast(e.message, 'error');
    }
  },

  deleteUsuario(id, nome) {
    if (!id || id === 'undefined') {
      console.error("Tentativa de excluir usuário sem ID válido", { id, nome });
      return Components.toast('Erro: ID do usuário inválido.', 'error');
    }
    
    if (confirm(`Deseja realmente mover o usuário ${nome} para a lixeira? Ele não aparecerá mais no sistema.`)) {
      API.delete(`/api/management/users/${id}`)
        .then(() => {
          Components.toast('Usuário movido para a lixeira!', 'success');
          Gestao.loadTab();
        })
        .catch(e => Components.toast(e.message, 'error'));
    }
  },

  switchModalTab(tab, padeiroId) {
    const btnDados = document.getElementById('btn-tab-dados');
    const btnContratos = document.getElementById('btn-tab-contratos');
    const containerDados = document.getElementById('modal-tab-dados-container');
    const containerContratos = document.getElementById('modal-tab-contratos-container');
    const btnSave = document.getElementById('btn-modal-save');

    if (tab === 'dados') {
      if (btnDados) {
        btnDados.classList.add('active');
        btnDados.style.color = 'var(--primary)';
        btnDados.style.borderBottomColor = 'var(--primary)';
        btnDados.style.fontWeight = '700';
      }
      if (btnContratos) {
        btnContratos.classList.remove('active');
        btnContratos.style.color = 'var(--text-muted)';
        btnContratos.style.borderBottomColor = 'transparent';
        btnContratos.style.fontWeight = '500';
      }
      if (containerDados) containerDados.style.display = 'block';
      if (containerContratos) containerContratos.style.display = 'none';
      if (btnSave) btnSave.style.display = 'block';
    } else {
      if (btnDados) {
        btnDados.classList.remove('active');
        btnDados.style.color = 'var(--text-muted)';
        btnDados.style.borderBottomColor = 'transparent';
        btnDados.style.fontWeight = '500';
      }
      if (btnContratos) {
        btnContratos.classList.add('active');
        btnContratos.style.color = 'var(--primary)';
        btnContratos.style.borderBottomColor = 'var(--primary)';
        btnContratos.style.fontWeight = '700';
      }
      if (containerDados) containerDados.style.display = 'none';
      if (containerContratos) containerContratos.style.display = 'block';
      if (btnSave) btnSave.style.display = 'none';
      if (padeiroId) {
        this.loadPadeiroContratos(padeiroId);
      }
    }
  },

  async loadPadeiroContratos(padeiroId) {
    const container = document.getElementById('modal-tab-contratos-container');
    if (!container) return;

    try {
      container.innerHTML = `
        <div style="display:flex; justify-content:center; align-items:center; height:150px;">
          <div class="spinner" style="width: 24px; height: 24px; border: 3px solid rgba(0,0,0,0.1); border-top-color: var(--primary); border-radius: 50%; animation: spin 1s linear infinite;"></div>
        </div>
      `;
      
      const contratos = await API.get('/api/contratos');
      this.currentContratos = contratos;
      const filtered = contratos.filter(c => c.padeiroId === padeiroId);

      if (filtered.length === 0) {
        container.innerHTML = `
          <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding: 40px 20px; text-align:center; color: var(--text-muted);">
            <i data-lucide="file-signature" style="width: 40px; height: 40px; stroke-width: 1.5; color: #C8C4B4; margin-bottom: 12px;"></i>
            <div style="font-weight: 700; color: #5A5750; font-size:15px; margin-bottom:4px;">Sem histórico de contratos</div>
            <div style="font-size:13px; margin-bottom:16px;">Nenhum contrato de prestação de serviços foi gerado para este funcionário.</div>
            <button class="btn btn-primary btn-sm hover-lift" onclick="Components.closeModal(); Gestao.openGenerateContractModal('${padeiroId}')">
              <i data-lucide="plus" style="width: 14px; height: 14px; margin-right: 4px;"></i> Gerar Contrato
            </button>
          </div>
        `;
        Components.renderIcons();
        return;
      }

      let listHtml = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 16px;">
          <div style="font-size: 13px; font-weight:700; color:#5A5750;">Histórico (${filtered.length})</div>
          <button class="btn btn-primary btn-sm hover-lift" onclick="Components.closeModal(); Gestao.openGenerateContractModal('${padeiroId}')">
            <i data-lucide="plus" style="width: 14px; height: 14px; margin-right: 4px;"></i> Novo
          </button>
        </div>
        <div style="display:flex; flex-direction:column; gap:12px; max-height: 250px; overflow-y: auto; padding-right:4px;">
      `;

      filtered.forEach(c => {
        let badgeHtml = '';
        if (c.status === 'pending' || c.status === 'Enviado para assinatura') {
          badgeHtml = '<span class="badge badge-warning" style="background: #FFF3E0; color: #E65100; font-size: 11px;">Aguardando assinatura</span>';
        } else if (c.status === 'signed' || c.status === 'Assinado por ambas') {
          badgeHtml = '<span class="badge badge-success" style="background: #E8F5E9; color: #2E7D32; font-size: 11px;">Contrato assinado</span>';
        } else if (c.status === 'Cancelado') {
          badgeHtml = '<span class="badge badge-danger" style="background: #FADBD8; color: #C0392B; font-size: 11px;">Cancelado</span>';
        } else {
          badgeHtml = `<span class="badge badge-secondary" style="font-size: 11px;">${c.status}</span>`;
        }

        const dateStr = new Date(c.criadoEm).toLocaleDateString('pt-BR');
        const pdfUrl = (c.pdfPath || c.signedUrl || '').replace('/uploads/', '/storage/');

        listHtml += `
          <div style="background: #FDFBF9; border: 1px solid var(--apple-separator); border-radius: 12px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center;">
            <div style="min-width: 0; flex: 1;">
              <div style="display:flex; align-items:center; gap:8px; margin-bottom: 4px;">
                <span style="font-weight:700; font-size:13px; color:var(--hig-label-primary); font-family: monospace;">${c.codigo}</span>
                ${badgeHtml}
              </div>
              <div style="font-size:11px; color:var(--text-muted); display:flex; gap:12px; flex-wrap:wrap;">
                <span>Tipo: ${c.tipoServico || 'Não especificado'}</span>
                <span>Início: ${c.dataInicio ? new Date(c.dataInicio).toLocaleDateString('pt-BR') : '-'}</span>
                <span>Criado: ${dateStr}</span>
              </div>
            </div>
            <div style="display:flex; gap:8px; align-items:center; margin-left: 12px;">
              <button class="btn btn-icon btn-sm hover-lift" onclick="event.stopPropagation(); Gestao.openContratoDetailsModal('${c.id}')" title="Ver detalhes">
                <i data-lucide="eye" style="color:var(--primary); width:18px; height:18px;"></i>
              </button>
              ${pdfUrl ? `
                <a href="${pdfUrl}" target="_blank" class="btn btn-icon btn-sm hover-lift" title="Baixar PDF">
                  <i data-lucide="download" style="color:#2E7D32; width:18px; height:18px;"></i>
                </a>
              ` : ''}
              ${(c.status === 'pending' || c.status === 'Enviado para assinatura') ? `
                <button class="btn btn-icon btn-sm hover-lift" onclick="event.stopPropagation(); Gestao.resendContractReminder('${c.id}')" title="Reenviar lembrete">
                  <i data-lucide="send" style="color:#E65100; width:18px; height:18px;"></i>
                </button>
              ` : ''}
            </div>
          </div>
        `;
      });

      listHtml += `</div>`;
      container.innerHTML = listHtml;
      Components.renderIcons();
    } catch (e) {
      container.innerHTML = `<div class="toast error">Erro ao carregar contratos: ${e.message}</div>`;
    }
  },

  openGenerateContractModal(padeiroId) {
    const p = this.allData.padeiros.find(x => x.id === padeiroId);
    if (!p) {
      Components.toast('Funcionário não encontrado!', 'error');
      return;
    }

    const today = new Date().toISOString().substring(0, 10);

    const bodyHtml = `
      <form id="generate-contrato-form" style="display:flex; flex-direction:column; gap:16px;">
        <input type="hidden" name="padeiroId" value="${padeiroId}">
        
        <div class="flex gap-4">
          <div class="form-group w-full">
            <label>Nome Completo do Prestador</label>
            <input class="input-control" name="nome" value="${p.nome || ''}" required>
          </div>
          <div class="form-group w-full">
            <label>CPF</label>
            <input class="input-control" name="cpf" value="${p.cpf || ''}" required placeholder="000.000.000-00">
          </div>
        </div>

        <div class="flex gap-4">
          <div class="form-group w-full">
            <label>E-mail (obrigatório para ZapSign)</label>
            <input class="input-control" type="email" name="email" value="${p.email || ''}" required placeholder="exemplo@email.com">
          </div>
          <div class="form-group w-full">
            <label>Telefone</label>
            <input class="input-control" name="telefone" value="${p.telefone || ''}" placeholder="(00) 90000-0000">
          </div>
        </div>

        <div class="flex gap-4">
          <div class="form-group w-full">
            <label>Tipo de Serviço Prestado</label>
            <select class="input-control" name="tipoServico">
              <option value="Marcenaria">Marcenaria</option>
              <option value="Montagem de móveis">Montagem de móveis</option>
              <option value="Acabamento e pintura">Acabamento e pintura</option>
              <option value="Serviços gerais de panificação">Serviços gerais de panificação</option>
              <option value="Logística e entregas">Logística e entregas</option>
            </select>
          </div>
          <div class="form-group w-full">
            <label>Forma de Pagamento</label>
            <select class="input-control" name="formaPagamento">
              <option value="projeto">Por projeto concluído</option>
              <option value="diaria">Por diária de serviço prestado</option>
              <option value="hora">Por hora de efetivo trabalho realizado</option>
            </select>
          </div>
        </div>

        <div class="flex gap-4">
          <div class="form-group w-full">
            <label>Valor Acordado (R$)</label>
            <input class="input-control" type="number" step="0.01" min="0" name="valor" required placeholder="Ex: 1500.00">
          </div>
          <div class="form-group w-full">
            <label>Data de Início</label>
            <input class="input-control" type="date" name="dataInicio" value="${today}" required>
          </div>
        </div>

        <div class="flex gap-4">
          <div class="form-group w-full">
            <label>Vigência</label>
            <select class="input-control" name="vigenciaTipo" onchange="Gestao.toggleColabVigenciaData(this.value)">
              <option value="indeterminado">Prazo Indeterminado</option>
              <option value="determinado">Prazo Determinado (Data de Término)</option>
            </select>
          </div>
          <div class="form-group w-full" id="vigencia-fim-group" style="display:none;">
            <label>Data de Término</label>
            <input class="input-control" type="date" name="dataFim">
          </div>
        </div>

        <div style="background: #FDFBF9; border: 1px solid var(--apple-separator); border-radius:12px; padding:12px 16px; display:flex; flex-direction:column; gap:10px;">
          <div style="font-size:12px; font-weight:700; color:#7A7567; text-transform:uppercase; letter-spacing:0.5px;">Cláusulas de Autonomia</div>
          <label style="display:flex; align-items:center; gap:8px; font-size:13px; cursor:pointer;">
            <input type="checkbox" name="semExclusividade" checked style="accent-color: var(--primary);"> Sem vínculo de exclusividade (pode prestar serviços a terceiros)
          </label>
          <label style="display:flex; align-items:center; gap:8px; font-size:13px; cursor:pointer;">
            <input type="checkbox" name="semSubordinacao" checked style="accent-color: var(--primary);"> Sem subordinação direta de horário (liberdade de agenda)
          </label>
        </div>
      </form>
    `;

    const footerHtml = `
      <button class="btn btn-secondary" onclick="Components.closeModal()">Cancelar</button>
      <button class="btn btn-primary" id="btn-generate-contrato-submit" onclick="Gestao.saveColaboradorContrato('${padeiroId}')">
        <i data-lucide="file-signature" style="width:16px; height:16px; margin-right:4px;"></i> Gerar e Enviar
      </button>
    `;

    Components.showModal('Gerar Contrato de Prestação de Serviços', bodyHtml, footerHtml);

    // Apply CPF mask to contract generation CPF field
    const cpfInput = document.querySelector('#generate-contrato-form input[name="cpf"]');
    if (cpfInput) {
      cpfInput.maxLength = 14;
      cpfInput.addEventListener('input', e => {
        let v = e.target.value.replace(/\D/g, '');
        if (v.length > 11) v = v.substring(0, 11);
        v = v.replace(/(\d{3})(\d)/, '$1.$2');
        v = v.replace(/(\d{3})(\d)/, '$1.$2');
        v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        e.target.value = v;
      });
    }

    Components.renderIcons();
  },

  toggleColabVigenciaData(val) {
    const group = document.getElementById('vigencia-fim-group');
    if (group) {
      group.style.display = val === 'determinado' ? 'block' : 'none';
      const input = group.querySelector('input');
      if (input) {
        input.required = val === 'determinado';
      }
    }
  },

  async saveColaboradorContrato(padeiroId) {
    const form = document.getElementById('generate-contrato-form');
    if (!form.checkValidity()) return form.reportValidity();

    const btnSubmit = document.getElementById('btn-generate-contrato-submit');
    const originalText = btnSubmit.innerHTML;
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<span class="spinner" style="width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; display:inline-block; animation: spin 1s linear infinite; margin-right:6px;"></span> Gerando PDF...';

    try {
      const fd = new FormData(form);
      const data = Object.fromEntries(fd.entries());
      
      const nome = data.nome;
      const cpf = data.cpf;
      const email = data.email;
      const telefone = data.telefone || '—';
      const tipoServico = data.tipoServico;
      const formaPagamento = data.formaPagamento;
      const valor = parseFloat(data.valor) || 0;
      const dataInicio = data.dataInicio;
      const vigenciaTipo = data.vigenciaTipo;
      const dataFim = data.dataFim;
      
      const semExclusividade = form.querySelector('input[name="semExclusividade"]').checked;
      const semSubordinacao = form.querySelector('input[name="semSubordinacao"]').checked;

      // Fetch template
      let response;
      try {
        const baseUrl = API.getBaseUrl ? API.getBaseUrl() : '';
        const headers = {};
        if (API.token) headers['Authorization'] = `Bearer ${API.token}`;
        
        // 1. Tentar obter o template via API (Vercel-safe e funciona no APK/Capacitor)
        response = await fetch(baseUrl + '/api/contratos/colaborador/template', { headers });
        if (!response.ok) throw new Error('Falha ao buscar template da API');
      } catch (e) {
        console.warn('Erro ao carregar template via API, tentando fallback estático local:', e);
        // 2. Fallback: tentar obter o arquivo estático diretamente do WebView/servidor
        const baseUrl = API.getBaseUrl ? API.getBaseUrl() : '';
        response = await fetch(baseUrl + '/templates/contrato_autonomo.html');
      }
      
      if (!response || !response.ok) {
        throw new Error('Não foi possível obter o template do contrato.');
      }
      let templateHtml = await response.text();

      // Convert values
      const valExtenso = numeroPorExtenso(valor);
      const valFormatted = valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      
      const formaPagamentoText = formaPagamento === 'projeto' ? 'por projeto concluído' :
                                 formaPagamento === 'diaria' ? 'por diária de serviço prestado' :
                                 'por hora de efetivo trabalho realizado';

      const dateParts = dataInicio.split('-');
      const formattedDataInicio = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;

      let vigenciaText = 'indeterminado';
      if (vigenciaTipo === 'determinado' && dataFim) {
        const endParts = dataFim.split('-');
        vigenciaText = `determinado, com término previsto para a data de ${endParts[2]}/${endParts[1]}/${endParts[0]}`;
      }

      const p = this.allData.padeiros.find(x => x.id === padeiroId);
      const filial = p.filial ? (Array.isArray(p.filial) ? p.filial[0] : p.filial) : '';
      const foro = filial.includes('Goiania') ? 'Goiânia/GO' :
                   filial.includes('Palmas') ? 'Palmas/TO' :
                   filial.includes('Campo Grande') ? 'Campo Grande/MS' :
                   'Brasília/DF';

      const subordinacaoText = semSubordinacao ? 
        'Desta forma, resta pacificado que inexiste controle de frequência, subordinação de horários ou qualquer tipo de controle hierárquico sob a atividade do prestador.' : '';
      const exclusividadeText = semExclusividade ? 
        'Fica livre o prestador para exercer sua profissão de forma independente para outros contratantes, inclusive concorrentes.' : '';

      // Replace placeholders
      let populated = templateHtml
        .replace(/{{nome}}/g, nome)
        .replace(/{{cpf}}/g, cpf)
        .replace(/{{telefone}}/g, telefone)
        .replace(/{{email}}/g, email)
        .replace(/{{tipo_servico}}/g, tipoServico)
        .replace(/{{sem_subordinacao}}/g, subordinacaoText)
        .replace(/{{sem_exclusividade}}/g, exclusividadeText)
        .replace(/{{valor}}/g, valFormatted)
        .replace(/{{valor_por_extenso}}/g, valExtenso)
        .replace(/{{forma_pagamento}}/g, formaPagamentoText)
        .replace(/{{data_inicio}}/g, formattedDataInicio)
        .replace(/{{vigencia}}/g, vigenciaText)
        .replace(/{{foro}}/g, foro);

      // Generate PDF
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';
      tempDiv.style.width = '210mm'; // A4 width

      const wrapper = document.createElement('div');
      wrapper.className = 'contrato-body';
      wrapper.style.background = 'white';
      wrapper.style.width = '100%';
      wrapper.style.boxSizing = 'border-box';
      wrapper.innerHTML = populated;

      tempDiv.appendChild(wrapper);
      document.body.appendChild(tempDiv);

      const opt = {
        margin: [15, 15, 15, 15],
        filename: `Contrato-Autonomo-${nome}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      const pdfBase64 = await html2pdf().from(wrapper).set(opt).outputPdf('datauristring');
      tempDiv.remove();

      const cleanBase64 = pdfBase64.split(',')[1];

      // Submit to backend
      btnSubmit.innerHTML = '<span class="spinner" style="width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; display:inline-block; animation: spin 1s linear infinite; margin-right:6px;"></span> Enviando para ZapSign...';

      const payload = {
        padeiroId,
        nome,
        cpf,
        email,
        telefone,
        tipoServico,
        formaPagamento,
        valor,
        dataInicio,
        vigencia: vigenciaTipo === 'indeterminado' ? 'indeterminado' : dataFim,
        base64Pdf: cleanBase64
      };

      const resContrato = await API.post('/api/contratos/colaborador', payload);

      Components.closeModal();
      Components.toast('Contrato gerado e enviado com sucesso!', 'success');
      
      // Auto open details on success
      if (resContrato && resContrato.id) {
        if (!this.currentContratos) this.currentContratos = [];
        this.currentContratos.push(resContrato);
        this.openContratoDetailsModal(resContrato.id, resContrato);
      }
      
      await this.loadTab();
    } catch (e) {
      console.error(e);
      Components.toast(e.message || 'Erro ao gerar ou enviar contrato', 'error');
    } finally {
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = originalText;
    }
  },

  async openContratoDetailsModal(contratoId, contratoObj = null) {
    try {
      // Show loading modal first
      Components.showModal('Detalhes do Contrato', `
        <div style="display:flex; justify-content:center; align-items:center; height:200px;">
          <div class="spinner" style="width: 32px; height: 32px; border: 3px solid rgba(0,0,0,0.1); border-top-color: var(--primary); border-radius: 50%; animation: spin 1s linear infinite;"></div>
        </div>
      `, `<button class="btn btn-secondary" onclick="Components.closeModal()">Fechar</button>`);

      let c = contratoObj;
      if (!c) {
        // Tentar buscar na lista em cache primeiro
        if (this.currentContratos) {
          c = this.currentContratos.find(x => x.id === contratoId);
        }
        if (!c) {
          const contratos = await API.get('/api/contratos');
          this.currentContratos = contratos;
          c = contratos.find(x => x.id === contratoId);
        }
      }
      if (!c) {
        Components.showModal('Erro', '<div class="toast error">Contrato não encontrado.</div>', `<button class="btn btn-secondary" onclick="Components.closeModal()">Fechar</button>`);
        return;
      }

      let badgeHtml = '';
      if (c.status === 'pending' || c.status === 'Enviado para assinatura') {
        badgeHtml = '<span class="badge badge-warning" style="background: #FFF3E0; color: #E65100;">Aguardando assinatura</span>';
      } else if (c.status === 'signed' || c.status === 'Assinado por ambas') {
        badgeHtml = '<span class="badge badge-success" style="background: #E8F5E9; color: #2E7D32;">Contrato assinado</span>';
      } else if (c.status === 'Cancelado') {
        badgeHtml = '<span class="badge badge-danger" style="background: #FADBD8; color: #C0392B;">Cancelado</span>';
      } else {
        badgeHtml = `<span class="badge badge-secondary">${c.status}</span>`;
      }

      const pdfUrl = (c.pdfPath || c.signedUrl || '').replace('/uploads/', '/storage/');
      const dateStr = new Date(c.criadoEm).toLocaleString('pt-BR');

      let signersHtml = '';
      if (c.signers && c.signers.length > 0) {
        signersHtml = c.signers.map(s => {
          const isSigned = s.status === 'signed';
          const signerBadge = isSigned ? 
            '<span class="badge badge-success" style="background:#E8F5E9; color:#2E7D32; font-size:10px;">Assinou</span>' : 
            '<span class="badge badge-warning" style="background:#FFF3E0; color:#E65100; font-size:10px;">Pendente</span>';
          
          return `
            <div style="background: white; border: 1px solid var(--apple-separator); border-radius: 12px; padding: 12px 16px; margin-bottom: 12px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 8px;">
                <div>
                  <div style="font-weight:700; font-size:13px; color:var(--hig-label-primary);">${s.name}</div>
                  <div style="font-size:11px; color:var(--text-muted);">${s.email}</div>
                </div>
                <div style="text-align: right; margin-left: auto;">
                  ${signerBadge}
                </div>
              </div>
              ${!isSigned && s.sign_url ? `
                <div style="display:flex; gap:8px; margin-top:8px;">
                  <a href="${s.sign_url}" target="_blank" class="btn btn-primary btn-sm hover-lift" style="flex: 1; text-align: center; font-size: 11px; padding: 6px 12px;">
                    <i data-lucide="edit-3" style="width:12px; height:12px; margin-right:4px;"></i> Assinar
                  </a>
                  <button class="btn btn-secondary btn-sm hover-lift" onclick="Gestao.copyText('${s.sign_url}', 'Link de assinatura copiado!')" style="font-size: 11px; padding: 6px 12px;">
                    <i data-lucide="copy" style="width:12px; height:12px;"></i> Copiar Link
                  </button>
                </div>
              ` : ''}
            </div>
          `;
        }).join('');
      } else {
        signersHtml = '<p class="text-tertiary">Nenhum signatário registrado.</p>';
      }

      const bodyHtml = `
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--apple-separator); padding-bottom: 12px;">
            <div>
              <span style="font-size: 11px; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px; display:block;">Código do Contrato</span>
              <span style="font-size: 18px; font-weight:800; color:var(--hig-label-primary); font-family: monospace;">${c.codigo}</span>
            </div>
            <div>
              ${badgeHtml}
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; background: #FDFBF9; border: 1px solid var(--apple-separator); border-radius: 12px; padding: 12px 16px;">
            <div>
              <span style="font-size: 10px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Tipo de Serviço</span>
              <div style="font-weight: 700; font-size: 13px; color:#5A5750;">${c.tipoServico || 'Não especificado'}</div>
            </div>
            <div>
              <span style="font-size: 10px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Forma de Pagamento</span>
              <div style="font-weight: 700; font-size: 13px; color:#5A5750;">
                ${c.formaPagamento === 'projeto' ? 'Por projeto' : c.formaPagamento === 'diaria' ? 'Por diária' : c.formaPagamento === 'hora' ? 'Por hora' : 'Não especificado'}
              </div>
            </div>
            <div>
              <span style="font-size: 10px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Valor Acordado</span>
              <div style="font-weight: 700; font-size: 13px; color:var(--primary);">R$ ${c.valor ? c.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}</div>
            </div>
            <div>
              <span style="font-size: 10px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Data de Início</span>
              <div style="font-weight: 700; font-size: 13px; color:#5A5750;">${c.dataInicio ? new Date(c.dataInicio).toLocaleDateString('pt-BR') : '-'}</div>
            </div>
            <div style="grid-column: span 2;">
              <span style="font-size: 10px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Vigência</span>
              <div style="font-weight: 700; font-size: 13px; color:#5A5750;">
                ${c.vigencia === 'indeterminado' ? 'Prazo Indeterminado' : `Prazo Determinado (até ${new Date(c.vigencia).toLocaleDateString('pt-BR')})`}
              </div>
            </div>
          </div>

          <div>
            <span style="font-size: 11px; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px; display:block; margin-bottom: 8px;">Signatários</span>
            ${signersHtml}
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; margin-top: 8px;">
            <div style="font-size:11px; color:var(--text-muted);">Criado em: ${dateStr}</div>
            ${pdfUrl ? `
              <a href="${pdfUrl}" target="_blank" class="btn btn-outline btn-sm hover-lift" style="display:flex; align-items:center; gap:4px; font-size:12px;">
                <i data-lucide="download" style="width:14px; height:14px;"></i> Visualizar/Baixar PDF
              </a>
            ` : ''}
          </div>
        </div>
      `;

      const footerHtml = `
        <div style="display:flex; justify-content:space-between; width:100%;">
          <div>
            ${c.status !== 'Cancelado' ? `
              <button class="btn btn-outline text-danger border-danger btn-sm" onclick="Gestao.cancelColabContrato('${c.id}')">
                <i data-lucide="x-circle" style="width:14px; height:14px; margin-right:4px;"></i> Cancelar Contrato
              </button>
            ` : ''}
          </div>
          <div style="display:flex; gap:8px;">
            <button class="btn btn-secondary btn-sm" onclick="Components.closeModal()">Fechar</button>
          </div>
        </div>
      `;

      Components.showModal('Detalhes do Contrato', bodyHtml, footerHtml);
      Components.renderIcons();
    } catch (e) {
      Components.showModal('Erro', `<div class="toast error">Erro ao carregar detalhes: ${e.message}</div>`, `<button class="btn btn-secondary" onclick="Components.closeModal()">Fechar</button>`);
    }
  },

  async cancelColabContrato(contratoId) {
    if (confirm('Tem certeza de que deseja cancelar este contrato? Isso anulará o envio na ZapSign e mudará o status para Cancelado.')) {
      try {
        await API.put(`/api/contratos/${contratoId}/cancel`, {});
        Components.toast('Contrato cancelado com sucesso.', 'success');
        Components.closeModal();
        await this.loadTab();
      } catch (e) {
        Components.toast(e.message || 'Erro ao cancelar contrato', 'error');
      }
    }
  },

  async resendContractReminder(contratoId) {
    try {
      const res = await API.post(`/api/contratos/${contratoId}/reminder`, {});
      if (res.success) {
        Components.toast('Lembrete de assinatura reenviado por e-mail!', 'success');
      } else {
        Components.toast(res.message || 'Não foi possível reenviar o lembrete.', 'info');
      }
    } catch (e) {
      Components.toast(e.message || 'Erro ao reenviar lembrete', 'error');
    }
  },

  copyText(text, successMsg) {
    navigator.clipboard.writeText(text).then(() => {
      Components.toast(successMsg || 'Copiado para a área de transferência!', 'success');
    }).catch(err => {
      console.error('Erro ao copiar texto:', err);
      Components.toast('Erro ao copiar texto.', 'error');
    });
  },

  async deleteAllUsersExceptSuperadmin() {
    const confirmText = prompt("ATENÇÃO: Esta ação é IRREVERSÍVEL e excluirá TODOS os funcionários, colaboradores, técnicos, históricos, avaliações, orçamentos, cronogramas e demais usuários do sistema (exceto você). Para prosseguir, digite 'DELETAR DEFINITIVAMENTE':");
    
    if (confirmText !== 'DELETAR DEFINITIVAMENTE') {
      Components.toast('Ação cancelada pelo usuário ou texto incorreto.', 'info');
      return;
    }

    try {
      const response = await API.delete('/api/management/users-all-except-superadmin');
      if (response && response.message) {
        Components.toast(response.message, 'success');
        // Recarregar os dados
        await this.loadTab();
      } else {
        throw new Error(response.error || 'Erro desconhecido');
      }
    } catch (e) {
      Components.toast(`Falha ao excluir: ${e.message}`, 'error');
    }
  }
};

// Helper for numbers to words in Portuguese
function numeroPorExtenso(n) {
  const unidades = ["", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove"];
  const dezenas = ["", "dez", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
  const especiais = ["dez", "onze", "doze", "treze", "quatorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"];
  const centenas = ["", "cem", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"];

  if (n === 0) return "zero";
  
  function obterCentena(v) {
    if (v === 0) return "";
    let res = "";
    const c = Math.floor(v / 100);
    const d = Math.floor((v % 100) / 10);
    const u = v % 10;
    
    if (c > 0) {
      if (c === 1 && (d > 0 || u > 0)) {
        res += "cento";
      } else {
        res += centenas[c];
      }
    }
    
    if (d > 0 || u > 0) {
      if (res !== "") res += " e ";
      if (d === 1) {
        res += especiais[u];
        return res;
      } else if (d > 0) {
        res += dezenas[d];
        if (u > 0) res += " e " + unidades[u];
      } else {
        res += unidades[u];
      }
    }
    return res;
  }

  let centavos = Math.round((n - Math.floor(n)) * 100);
  let inteiro = Math.floor(n);

  let partes = [];
  
  if (inteiro >= 1000) {
    const milhar = Math.floor(inteiro / 1000);
    const resto = inteiro % 1000;
    
    if (milhar === 1) {
      partes.push("mil");
    } else {
      partes.push(obterCentena(milhar) + " mil");
    }
    
    if (resto > 0) {
      partes.push(obterCentena(resto));
    }
  } else {
    partes.push(obterCentena(inteiro));
  }

  let ext = partes.join(" e ").trim();
  if (inteiro === 1) {
    ext += " real";
  } else if (inteiro > 1) {
    ext += " reais";
  }

  if (centavos > 0) {
    let centavosExt = "";
    if (centavos === 1) {
      centavosExt = "um centavo";
    } else {
      const cD = Math.floor(centavos / 10);
      const cU = centavos % 10;
      if (cD === 1) {
        centavosExt = especiais[cU] + " centavos";
      } else if (cD > 0) {
        centavosExt = dezenas[cD] + (cU > 0 ? " e " + unidades[cU] : "") + " centavos";
      } else {
        centavosExt = unidades[cU] + " centavos";
      }
    }
    if (inteiro > 0) {
      ext += " e " + centavosExt;
    } else {
      ext = centavosExt;
    }
  }
  
  return ext;
}

