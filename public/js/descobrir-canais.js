/**
 * Descobrir Canais - YouTube Channel Discovery Redesign
 * Tomada Sistema - Designed to match the reference UI
 */
const DescubrirCanais = {
  currentFilters: [],
  searchQuery: '',
  selectedSize: '',
  subscribersRange: 10000000,
  currentPage: 1,
  pageSize: 16,

  // Mock data representing high-quality channel results to match the image UI cards
  results: [
    {
      id: 'ch_1',
      name: 'Program Manager - Compliance, Audit',
      logo: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=80&q=80',
      owner: 'Google',
      location: 'United States',
      subscribers: 240000,
      subscribersText: '240k subs',
      category: 'Tecnologia',
      description: 'Canal focado em auditoria de software, conformidade de segurança da informação e melhores práticas de engenharia de software para grandes corporações.',
      contacts: ['email', 'site', 'linkedin'],
      videos: 180,
      views: '12M views',
      updatedAt: '3 dias atrás',
      countryCode: 'US'
    },
    {
      id: 'ch_2',
      name: 'Product Designer, UX/UI Interface',
      logo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80',
      owner: 'Huawei',
      location: 'United Kingdom',
      subscribers: 750000,
      subscribersText: '750k subs',
      category: 'Design & UX',
      description: 'Tutoriais práticos de Figma, workshops sobre design de interação e análises de interfaces de aplicativos reais com foco na experiência do usuário.',
      contacts: ['email', 'discord', 'instagram'],
      videos: 320,
      views: '45M views',
      updatedAt: '1 dia atrás',
      countryCode: 'UK'
    },
    {
      id: 'ch_3',
      name: 'DevOps & Cloud Architect Community',
      logo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=80&q=80',
      owner: 'Amazon Web Services',
      location: 'Brazil',
      subscribers: 85000,
      subscribersText: '85k subs',
      category: 'DevOps & Infra',
      description: 'Tudo sobre AWS, Kubernetes, Terraform e automação de infraestrutura híbrida com demonstrações práticas em tempo real de arquiteturas resilientes.',
      contacts: ['discord', 'twitter', 'site'],
      videos: 145,
      views: '4.8M views',
      updatedAt: '5 dias atrás',
      countryCode: 'BR'
    }
  ],

  searchCache: {}, // Cache em memória para economizar cota da API (ex: "gameplay_BR": [...canais])

  async render() {
    const container = document.getElementById('page-container');
    return this.renderInContainer(container);
  },

  async renderInContainer(container) {
    if (!container) return;
    container.innerHTML = this.getPageHTML();

    if (window.HigPopovers && typeof window.HigPopovers.initCustomSelects === 'function') {
      window.HigPopovers.initCustomSelects();
    }

    this.bindEvents();
    Components.renderIcons();
    this.applyFilters();
  },

  getPageHTML() {
    return `
    <style>
      /* Viewport styling for Descobrir Canais */
      body.dc-page-active .app-layout {
        background: #F8F6F0 !important;
      }
      body.dc-page-active .main-content {
        background: #F8F6F0 !important;
      }
      body.dc-page-active #page-container {
        background: #F8F6F0 !important;
        box-shadow: none !important;
        border-radius: 0 !important;
        padding-bottom: 60px !important;
      }

      .dc-wrapper {
        display: grid;
        grid-template-columns: 240px 1fr 280px;
        gap: 24px;
        background: transparent;
        padding: 0 24px 60px 24px;
        max-width: 1400px;
        margin: 0 auto;
        width: 100%;
        font-family: 'Outfit', 'Inter', sans-serif;
        box-sizing: border-box;
      }

      /* Left Column (Profile & Source List) */
      .dc-left-panel {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }
      .dc-profile-card {
        background: #FFFFFF;
        border-radius: 16px;
        padding: 24px;
        text-align: center;
        border: 1px solid #E2E8F0;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      }
      .dc-profile-img {
        width: 72px;
        height: 72px;
        border-radius: 50%;
        object-fit: cover;
        margin-bottom: 12px;
        border: 2px solid #E55A2B;
        padding: 2px;
      }
      .dc-profile-name {
        font-size: 15px;
        font-weight: 700;
        color: #0F172A;
        margin-bottom: 4px;
      }
      .dc-profile-title {
        font-size: 12px;
        color: #64748B;
        margin-bottom: 16px;
        font-weight: 500;
      }
      .dc-profile-btn {
        width: 100%;
        background: #E55A2B;
        color: #FFFFFF;
        border: none;
        border-radius: 10px;
        padding: 10px;
        font-size: 13px;
        font-weight: 700;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: opacity 0.2s;
      }
      .dc-profile-btn:hover {
        opacity: 0.9;
      }

      .dc-section-card {
        background: #FFFFFF;
        border-radius: 16px;
        padding: 20px;
        border: 1px solid #E2E8F0;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      }
      .dc-section-title-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      }
      .dc-section-title {
        font-size: 13px;
        font-weight: 800;
        color: #0F172A;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .dc-section-icon {
        color: #94A3B8;
        cursor: pointer;
      }
      .dc-source-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .dc-source-item {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 13px;
        font-weight: 600;
        color: #475569;
        cursor: pointer;
        padding: 6px 0;
        transition: color 0.2s;
      }
      .dc-source-item:hover, .dc-source-item.active {
        color: #E55A2B;
      }
      .dc-source-logo {
        width: 28px;
        height: 28px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #F1F5F9;
        font-size: 14px;
        color: #64748B;
      }
      .dc-source-item.active .dc-source-logo {
        background: rgba(229, 90, 43, 0.1);
        color: #E55A2B;
      }
      .dc-source-badge {
        margin-left: auto;
        font-size: 11px;
        background: #F1F5F9;
        color: #64748B;
        padding: 2px 6px;
        border-radius: 6px;
        font-weight: 700;
      }
      .dc-source-item.active .dc-source-badge {
        background: rgba(229, 90, 43, 0.15);
        color: #E55A2B;
      }

      .dc-tags-flex {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .dc-tag-pill {
        background: #F1F5F9;
        color: #475569;
        font-size: 12px;
        font-weight: 600;
        padding: 6px 12px;
        border-radius: 100px;
        cursor: pointer;
        transition: all 0.2s;
      }
      .dc-tag-pill:hover, .dc-tag-pill.active {
        background: #E55A2B;
        color: #FFFFFF;
      }

      /* Center Column (Hero & Cards) */
      .dc-center-panel {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
      
      /* Orange Gradient Hero Card matching aba-clientes */
      .dc-hero-banner {
        background: linear-gradient(135deg, #E55A2B 0%, #FF8A00 100%);
        border-radius: 20px;
        padding: 32px 36px;
        color: #FFFFFF;
        box-shadow: 0 10px 30px rgba(229, 90, 43, 0.15);
        position: relative;
        overflow: hidden;
      }
      .dc-hero-banner::after {
        content: '';
        position: absolute;
        right: -50px;
        top: -50px;
        width: 200px;
        height: 200px;
        border-radius: 50%;
        background: rgba(255,255,255,0.08);
        pointer-events: none;
      }
      .dc-hero-title {
        font-size: 26px;
        font-weight: 800;
        margin: 0 0 8px 0;
        letter-spacing: -0.5px;
        color: #FFFFFF !important;
      }
      .dc-hero-desc {
        font-size: 13.5px;
        margin: 0 0 24px 0;
        line-height: 1.5;
        font-weight: 500;
        max-width: 480px;
        color: #E2E8F0 !important;
      }
      .dc-search-container {
        display: flex;
        background: #FFFFFF;
        border-radius: 12px;
        padding: 4px;
        align-items: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      }
      .dc-search-field-wrapper {
        flex: 1;
        display: flex;
        align-items: center;
        padding: 0 12px;
        gap: 10px;
      }
      .dc-search-field-wrapper i {
        color: #94A3B8;
      }
      .dc-search-input {
        border: none;
        outline: none;
        width: 100%;
        font-size: 14px;
        font-weight: 500;
        color: #0F172A;
      }
      .dc-search-input::placeholder {
        color: #94A3B8;
      }
      .dc-search-button {
        background: #0F172A;
        color: #FFFFFF;
        border: none;
        border-radius: 10px;
        padding: 10px 20px;
        font-size: 13px;
        font-weight: 700;
        cursor: pointer;
        transition: background 0.2s;
      }
      .dc-search-button:hover {
        background: #1E293B;
      }

      .dc-results-title {
        font-size: 14px;
        font-weight: 800;
        color: #0F172A;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin: 8px 0 4px 0;
      }

      /* Card Style matching reference image */
      .dc-card {
        background: #FFFFFF;
        border-radius: 16px;
        border: 1px solid #E2E8F0;
        padding: 24px;
        display: flex;
        gap: 16px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.03);
        position: relative;
        transition: transform 0.2s, box-shadow 0.2s;
      }
      .dc-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 24px rgba(0,0,0,0.05);
      }
      .dc-card-logo-wrap {
        width: 48px;
        height: 48px;
        border-radius: 10px;
        overflow: hidden;
        border: 1px solid #E2E8F0;
        flex-shrink: 0;
      }
      .dc-card-logo {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .dc-card-content {
        flex: 1;
      }
      .dc-card-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 6px;
      }
      .dc-card-title {
        font-size: 16px;
        font-weight: 800;
        color: #0F172A;
        margin: 0;
        cursor: pointer;
      }
      .dc-card-title:hover {
        color: #E55A2B;
      }
      .dc-card-bookmark {
        color: #94A3B8;
        cursor: pointer;
        transition: color 0.2s;
        background: none;
        border: none;
        padding: 0;
      }
      .dc-card-bookmark:hover {
        color: #E55A2B;
      }
      .dc-card-meta-row {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        font-weight: 600;
        color: #64748B;
        margin-bottom: 12px;
        flex-wrap: wrap;
      }
      .dc-card-meta-sep {
        width: 3px;
        height: 3px;
        border-radius: 50%;
        background: #CBD5E1;
      }
      .dc-card-tag {
        font-size: 11px;
        font-weight: 700;
        padding: 3px 8px;
        border-radius: 6px;
        text-transform: uppercase;
      }
      .dc-card-tag.email { background: rgba(59, 130, 246, 0.1); color: #3B82F6; }
      .dc-card-tag.discord { background: rgba(124, 58, 237, 0.1); color: #7C3AED; }
      .dc-card-tag.site { background: rgba(245, 158, 11, 0.1); color: #D97706; }
      .dc-card-tag.instagram { background: rgba(236, 72, 153, 0.1); color: #EC4899; }
      .dc-card-tag.twitter { background: rgba(14, 165, 233, 0.1); color: #0EA5E9; }
      .dc-card-tag.niche { background: #F1F5F9; color: #475569; }

      .dc-card-desc {
        font-size: 13px;
        color: #475569;
        line-height: 1.6;
        margin-bottom: 16px;
      }
      .dc-card-footer {
        display: flex;
        gap: 16px;
        border-top: 1px dashed #F1F5F9;
        padding-top: 14px;
        flex-wrap: wrap;
      }
      .dc-footer-item {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        font-weight: 600;
        color: #64748B;
      }
      .dc-footer-item i {
        color: #94A3B8;
      }

      /* Right Column (Filters Panel) */
      .dc-right-panel {
        display: flex;
        flex-direction: column;
        gap: 20px;
        background: #FFFFFF;
        border-radius: 16px;
        border: 1px solid #E2E8F0;
        padding: 24px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        align-self: flex-start;
      }
      .dc-filter-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #F1F5F9;
        padding-bottom: 12px;
        margin-bottom: 16px;
      }
      .dc-filter-title {
        font-size: 14px;
        font-weight: 800;
        color: #0F172A;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .dc-filter-clear {
        font-size: 12px;
        color: #64748B;
        font-weight: 700;
        cursor: pointer;
        background: none;
        border: none;
        padding: 0;
      }
      .dc-filter-clear:hover {
        color: #E55A2B;
      }

      .dc-filter-group {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-bottom: 20px;
      }
      .dc-filter-label {
        font-size: 13px;
        font-weight: 800;
        color: #0F172A;
      }
 
       .dc-check-label {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: #475569;
        font-weight: 600;
        cursor: pointer;
        user-select: none;
      }
      .dc-checkbox {
        width: 16px;
        height: 16px;
        accent-color: #E55A2B;
        cursor: pointer;
      }

      .dc-range-wrap {
        margin-top: 6px;
      }
      .dc-slider {
        width: 100%;
        accent-color: #E55A2B;
        cursor: pointer;
      }
      .dc-range-values {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        font-weight: 700;
        color: #475569;
        margin-top: 4px;
      }

      /* Responsive Layout */
      @media (max-width: 1100px) {
        .dc-wrapper {
          grid-template-columns: 1fr;
        }
        .dc-left-panel, .dc-right-panel {
          align-self: stretch;
        }
      }

      /* Estilos para a paginação redonda */
      .dc-pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 8px;
        margin-top: 32px;
        padding-top: 8px;
        padding-bottom: 24px;
      }
      .dc-page-btn {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: 1px solid #E2E8F0;
        background: #FFFFFF;
        color: #334155;
        font-weight: 600;
        font-size: 14px;
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;
        transition: all 0.2s ease-in-out;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      }
      .dc-page-btn:hover {
        background: #F1F5F9;
        border-color: #CBD5E1;
        color: #0F172A;
        transform: translateY(-1px);
      }
      .dc-page-btn.active {
        background: #E55A2B;
        color: #FFFFFF;
        border-color: #E55A2B;
        box-shadow: 0 4px 6px -1px rgba(229, 90, 43, 0.2), 0 2px 4px -1px rgba(229, 90, 43, 0.1);
      }
      .dc-page-arrow {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: 1px solid #E2E8F0;
        background: #FFFFFF;
        color: #64748B;
        cursor: pointer;
        transition: all 0.2s ease-in-out;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      }
      .dc-page-arrow:hover:not(:disabled) {
        background: #F1F5F9;
        border-color: #CBD5E1;
        color: #0F172A;
      }
      .dc-page-arrow:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .dc-contact-btn {
        background: #E55A2B;
        color: #FFFFFF;
        border: none;
        padding: 6px 14px;
        border-radius: 8px;
        font-weight: 700;
        font-size: 12px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
        transition: all 0.2s ease-in-out;
      }
      .dc-contact-btn:hover {
        background: #C2410C;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(229, 90, 43, 0.2);
      }
    </style>

    <div class="dc-wrapper">
      <!-- Coluna Esquerda -->
      <div class="dc-left-panel">
        <!-- Card Perfil -->
        <div class="dc-profile-card">
          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80" class="dc-profile-img" alt="Foto">
          <div class="dc-profile-name">Herthwil Revaldi</div>
          <div class="dc-profile-title">Product Designer</div>
          <button class="dc-profile-btn" onclick="Components.toast('Função não habilitada na fase 1', 'info')">
            <i data-lucide="plus" style="width:16px;height:16px;"></i> Vincular Canal
          </button>
        </div>

        <!-- Origens -->
        <div class="dc-section-card">
          <div class="dc-section-title-row">
            <span class="dc-section-title">Fontes de Pesquisa</span>
            <i data-lucide="more-horizontal" class="dc-section-icon" style="width:16px;height:16px;"></i>
          </div>
          <div class="dc-source-list">
            <div class="dc-source-item active">
              <div class="dc-source-logo">YT</div>
              <span>YouTube API</span>
              <span class="dc-source-badge">Online</span>
            </div>
            <div class="dc-source-item">
              <div class="dc-source-logo">DB</div>
              <span>Base Local</span>
              <span class="dc-source-badge">120</span>
            </div>
            <div class="dc-source-item">
              <div class="dc-source-logo">⭐</div>
              <span>Favoritos</span>
              <span class="dc-source-badge">12</span>
            </div>
          </div>
        </div>

        <!-- Nichos Sugeridos -->
        <div class="dc-section-card">
          <div class="dc-section-title-row">
            <span class="dc-section-title">Nichos Principais</span>
            <i data-lucide="chevron-right" class="dc-section-icon" style="width:16px;height:16px;"></i>
          </div>
          <div class="dc-tags-flex">
            <span class="dc-tag-pill" onclick="DescubrirCanais.searchNiche('Tecnologia', this)">Tecnologia</span>
            <span class="dc-tag-pill" onclick="DescubrirCanais.searchNiche('Design & UX', this)">Design & UX</span>
            <span class="dc-tag-pill" onclick="DescubrirCanais.searchNiche('Educação', this)">Educação</span>
            <span class="dc-tag-pill" onclick="DescubrirCanais.searchNiche('Culinária', this)">Culinária</span>
            <span class="dc-tag-pill" onclick="DescubrirCanais.searchNiche('Negócios', this)">Negócios</span>
          </div>
        </div>
      </div>

      <!-- Coluna Central -->
      <div class="dc-center-panel">
        <!-- Banner Principal com Gradiente Clientes -->
        <div class="dc-hero-banner">
          <h2 class="dc-hero-title">Encontre os canais ideais aqui!</h2>
          <p class="dc-hero-desc">Explore canais do YouTube para parcerias, marketing de influência e análises de mercado completas com informações detalhadas de contato.</p>
          <div class="dc-search-container">
            <div class="dc-search-field-wrapper">
              <i data-lucide="search" style="width:18px;height:18px;"></i>
              <input type="text" class="dc-search-input" placeholder="Ex: marketing digital, games, culinária..." id="dc-search-inp">
            </div>
            <button class="dc-search-button" id="dc-search-btn-v2">Buscar</button>
          </div>
        </div>

        <!-- Título de resultados -->
        <div class="dc-results-title">Resultados das pesquisas</div>

        <!-- Grid de Cards de Canais -->
        <div style="display:flex; flex-direction:column; gap:16px;" id="dc-cards-container">
          ${this.results.map(ch => this.getCardHTML(ch)).join('')}
        </div>
      </div>

      <!-- Coluna Direita (Painel de Filtros) -->
      <div class="dc-right-panel">
        <div class="dc-filter-header">
          <span class="dc-filter-title">Filtros</span>
          <button class="dc-filter-clear" onclick="DescubrirCanais.clearFilters()">Limpar</button>
        </div>

        <!-- Localização -->
        <div class="dc-filter-group">
          <span class="dc-filter-label">Localização do Canal</span>
          <select class="trello-select" id="dc-loc-select" style="width: 100%;">
            <option value="Todos" selected>Todas as Localizações</option>
            <option value="Brasil">Brasil</option>
            <option value="Estados Unidos">Estados Unidos</option>
            <option value="América Latina (Espanhol)">América Latina (Espanhol)</option>
            <option value="Europa (PT/ES)">Europa (PT/ES)</option>
            <option value="Outros">Outros</option>
          </select>
        </div>

        <!-- Meios de Contato -->
        <div class="dc-filter-group">
          <span class="dc-filter-label">Meios de Contato</span>
          <label class="dc-check-label">
            <input type="checkbox" class="dc-checkbox" id="dc-chk-email" onchange="DescubrirCanais.applyFilters()"> E-mail
          </label>
          <label class="dc-check-label">
            <input type="checkbox" class="dc-checkbox" id="dc-chk-discord" onchange="DescubrirCanais.applyFilters()"> Discord
          </label>
          <label class="dc-check-label">
            <input type="checkbox" class="dc-checkbox" id="dc-chk-site" onchange="DescubrirCanais.applyFilters()"> Site / Blog
          </label>
          <label class="dc-check-label">
            <input type="checkbox" class="dc-checkbox" id="dc-chk-instagram" onchange="DescubrirCanais.applyFilters()"> Instagram
          </label>
          <label class="dc-check-label">
            <input type="checkbox" class="dc-checkbox" id="dc-chk-twitter" onchange="DescubrirCanais.applyFilters()"> Twitter / X
          </label>
        </div>

        <!-- Tamanho do Canal -->
        <div class="dc-filter-group">
          <span class="dc-filter-label">Tamanho do Canal</span>
          <label class="dc-check-label">
            <input type="checkbox" class="dc-checkbox" id="dc-chk-micro" onchange="DescubrirCanais.applyFilters()"> Micro (1k - 100k)
          </label>
          <label class="dc-check-label">
            <input type="checkbox" class="dc-checkbox" id="dc-chk-medio" onchange="DescubrirCanais.applyFilters()"> Médio (100k - 500k)
          </label>
          <label class="dc-check-label">
            <input type="checkbox" class="dc-checkbox" id="dc-chk-grande" onchange="DescubrirCanais.applyFilters()"> Grande (1.000.000+)
          </label>
        </div>

        <!-- Mínimo de Inscritos -->
        <div class="dc-filter-group">
          <span class="dc-filter-label">Mín. Inscritos</span>
          <div class="dc-range-wrap">
            <input type="range" class="dc-slider" min="1000" max="1000000" step="10000" id="dc-sub-range" value="1000" oninput="DescubrirCanais.updateSubscribersLabel(this.value)">
            <div class="dc-range-values">
              <span>1k</span>
              <span id="dc-sub-val-label">1k</span>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  },

  getCardHTML(ch) {
    const contactBadges = (ch.contacts || []).map(c => `<span class="dc-card-tag ${c}">${c}</span>`).join(' ');
    const subsText = this.formatSubscribers(ch.subscribers);
    const viewsText = this.formatViews(ch.viewCount);

    return `
      <div class="dc-card" data-channel-id="${ch.id}">
        <div class="dc-card-logo-wrap">
          <img src="${ch.logo || ch.thumbnail || `https://ui-avatars.com/api/?name=${encodeURIComponent(ch.name)}&background=E55A2B&color=fff`}" referrerpolicy="no-referrer" class="dc-card-logo" alt="Logo" onerror="this.onerror=null;this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(ch.name)}&background=E55A2B&color=fff'">
        </div>
        <div class="dc-card-content">
          <div class="dc-card-header">
            <h4 class="dc-card-title">${ch.name}</h4>
            <button class="dc-card-bookmark" onclick="Components.toast('Favoritado! (Simulado)', 'success')">
              <i data-lucide="bookmark" style="width:16px;height:16px;"></i>
            </button>
          </div>
          <div class="dc-card-meta-row">
            <span style="color:#0F172A;font-weight:700;">${ch.customUrl || '@canal'}</span>
            <div class="dc-card-meta-sep"></div>
            <span>${this.getCountryLabel(ch.country)}</span>
            <div class="dc-card-meta-sep"></div>
            <span>${subsText}</span>
            <div class="dc-card-meta-sep"></div>
            <span class="dc-card-tag niche">${ch.category || 'Geral'}</span>
          </div>
          <p class="dc-card-desc">${ch.description || 'Sem descrição disponível.'}</p>
          <div class="dc-card-footer">
            <div class="dc-footer-item">
              <i data-lucide="video" style="width:14px;height:14px;"></i>
              <span>${ch.videoCount || 0} vídeos</span>
            </div>
            <div class="dc-footer-item">
              <i data-lucide="eye" style="width:14px;height:14px;"></i>
              <span>${viewsText}</span>
            </div>
            <div class="dc-footer-item">
              <i data-lucide="calendar" style="width:14px;height:14px;"></i>
              <span>Atualizado</span>
            </div>
            <div class="dc-footer-item" style="margin-left:auto; display:flex; align-items:center; gap:12px;">
              <div style="display:flex; gap:6px;">
                ${contactBadges}
              </div>
              <button class="dc-contact-btn" onclick="DescubrirCanais.openContactModal('${ch.id}')">
                <i data-lucide="mail" style="width:14px;height:14px;"></i> Contatar
              </button>
            </div>
          </div>
        </div>
      </div>`;
  },

  bindEvents() {
    const searchBtn = document.getElementById('dc-search-btn-v2');
    const input = document.getElementById('dc-search-inp');
    if (searchBtn && input) {
      searchBtn.addEventListener('click', () => {
        this.executeSearch(input.value);
      });
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          this.executeSearch(input.value);
        }
      });
    }

    // Listener para o select de localização — re-executa a busca com região diferente
    const select = document.getElementById('dc-loc-select');
    if (select) {
      select.addEventListener('change', () => {
        // Se há um termo de busca, re-executar com a nova região
        const input = document.getElementById('dc-search-inp');
        const query = input?.value?.trim();
        if (query && query.length >= 2) {
          this.executeSearch(query);
        } else {
          this.applyFilters();
        }
      });
    }

    // Listener para o slider de inscritos (atualiza em tempo real enquanto arrasta)
    const range = document.getElementById('dc-sub-range');
    if (range) {
      range.addEventListener('input', (e) => {
        this.updateSubscribersLabel(e.target.value);
      });
    }
  },

  async executeSearch(query) {
    if (!query || query.trim().length < 2) {
      Components.toast('Digite pelo menos 2 caracteres para buscar.', 'warning');
      return;
    }

    this.lastQuery = query;
    const region = this.getRegionCode();
    const cacheKey = `${query.trim().toLowerCase()}_${region}`;

    // 🚀 Economia de Cota de API: usa os resultados em cache da 1ª pesquisa se já realizados nesta sessão
    if (this.searchCache && this.searchCache[cacheKey]) {
      console.log(`[DescubrirCanais] Usando cache para "${cacheKey}"`);
      this.results = this.searchCache[cacheKey];
      this.currentPage = 1;
      this.applyFilters(true);
      Components.toast(`Exibindo ${this.results.length} canais obtidos para "${query}"`, 'success');
      return;
    }

    const cardsContainer = document.getElementById('dc-cards-container');
    if (cardsContainer) {
      cardsContainer.innerHTML = `
        <div style="display:flex; justify-content:center; align-items:center; min-height:200px;">
          <div class="spinner" style="width: 32px; height: 32px; border: 3px solid rgba(0,0,0,0.1); border-top-color: #E55A2B; border-radius: 50%; animation: spin 1s linear infinite;"></div>
        </div>
      `;
    }

    try {
      const data = await API.get(`/api/youtube/search?q=${encodeURIComponent(query)}&maxResults=1000&region=${region}`, { timeout: 120000 });
      const rawChannels = data.channels || [];

      // Mapear contatos e categorias dinamicamente
      this.results = rawChannels.map(ch => {
        const contacts = this.parseContacts(ch.description || '');
        // Definir categoria padrão baseada em palavras-chave da busca ou descrição
        let category = 'Geral';
        const rawText = ((ch.name || '') + ' ' + (ch.description || '')).toLowerCase();
        // Remover acentos para garantir casamento de padrão ASCII simples
        const text = rawText.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

        if (/\b(games?|jogos?|gameplays?|jogando|minecraft|fortnite|gta|playstation|xbox|nintendo)\b/i.test(text)) {
          category = 'Games & Jogos';
        } else if (/\b(tech|tecnologia|programador|programacao|developers?|devs?|hardware|computador)\b/i.test(text)) {
          category = 'Tecnologia';
        } else if (/\b(design|ux|ui|artes?|identidade visual|logotipos?)\b/i.test(text)) {
          category = 'Design & UX';
        } else if (/\b(educacao|aulas?|cursos?|aprenda|aprender|ensino|tutorial|tutoriais)\b/i.test(text)) {
          category = 'Educação';
        } else if (/\b(receitas?|cozinhar?|cozinha|culinaria|comidas?|chef|gastronomia)\b/i.test(text)) {
          category = 'Culinária';
        } else if (/\b(financas|investir|investimentos?|negocios?|empreendedorismo|vendas|marketing)\b/i.test(text)) {
          category = 'Negócios';
        }

        return { ...ch, contacts, category };
      });

      // Salvar no cache em memória para economizar cota de API em requisições futuras
      if (!this.searchCache) this.searchCache = {};
      this.searchCache[cacheKey] = this.results;

      this.currentPage = 1;
      this.applyFilters(true); // Evita resetar para 1 novamente na chamada interna
      Components.toast(`Encontrados ${this.results.length} canais para "${query}"`, 'success');
    } catch (e) {
      console.error('Erro na busca:', e);
      if (cardsContainer) {
        cardsContainer.innerHTML = `<div class="text-secondary" style="text-align:center; padding: 24px;">Erro ao buscar canais: ${e.message}</div>`;
      }
      Components.toast('Falha ao obter canais da API.', 'error');
    }
  },

  async searchNiche(niche, element) {
    // Remover classe active de todos
    document.querySelectorAll('.dc-tag-pill').forEach(t => t.classList.remove('active'));
    if (element) element.classList.add('active');

    const input = document.getElementById('dc-search-inp');
    if (input) {
      input.value = niche;
    }
    await this.executeSearch(niche);
  },

  applyFilters(isPageChange = false) {
    if (!isPageChange) {
      this.currentPage = 1;
    }

    const cardsContainer = document.getElementById('dc-cards-container');
    if (!cardsContainer) return;

    if (!this.results || this.results.length === 0) {
      cardsContainer.innerHTML = '<div class="text-secondary" style="text-align:center; padding: 24px;">Nenhum resultado de busca disponível. Digite um termo acima.</div>';
      return;
    }

    // Obter valores de filtro
    const selectedLoc = document.getElementById('dc-loc-select')?.value || 'Todos';

    const reqContacts = [];
    if (document.getElementById('dc-chk-email')?.checked) reqContacts.push('email');
    if (document.getElementById('dc-chk-discord')?.checked) reqContacts.push('discord');
    if (document.getElementById('dc-chk-site')?.checked) reqContacts.push('site');
    if (document.getElementById('dc-chk-instagram')?.checked) reqContacts.push('instagram');
    if (document.getElementById('dc-chk-twitter')?.checked) reqContacts.push('twitter');

    const selectedSizes = [];
    if (document.getElementById('dc-chk-micro')?.checked) selectedSizes.push('micro');
    if (document.getElementById('dc-chk-medio')?.checked) selectedSizes.push('medio');
    if (document.getElementById('dc-chk-grande')?.checked) selectedSizes.push('grande');

    const minSubs = parseInt(document.getElementById('dc-sub-range')?.value, 10) || 1000;

    // Aplicar filtros
    const filtered = this.results.filter(ch => {
      // 1. Filtro de localização — filtra canais que não correspondem à região selecionada
      if (selectedLoc !== 'Todos' && !this.matchLocation(ch, selectedLoc)) return false;

      // 2. Filtro de contatos (Se marcado, o canal deve possuir PELO MENOS UM dos contatos selecionados)
      if (reqContacts.length > 0) {
        const matchContact = reqContacts.some(c => (ch.contacts || []).includes(c));
        if (!matchContact) return false;
      }

      // 3. Filtro de tamanho de canal (Micro, Médio, Grande)
      if (selectedSizes.length > 0) {
        const matchSize = selectedSizes.some(size => {
          const subs = ch.subscribers || 0;
          if (size === 'micro') return subs >= 1000 && subs <= 100000;
          if (size === 'medio') return subs > 100000 && subs <= 500000;
          if (size === 'grande') return subs > 500000; // Grande
          return false;
        });
        if (!matchSize) return false;
      } else {
        // 4. Filtro de mínimo de inscritos via slider (só aplica quando nenhum checkbox de tamanho está ativo)
        if ((ch.subscribers || 0) < minSubs) return false;
      }

      return true;
    });

    if (filtered.length === 0) {
      cardsContainer.innerHTML = '<div class="text-secondary" style="text-align:center; padding: 48px;">Nenhum canal corresponde aos filtros selecionados.</div>';
    } else {
      const totalItems = filtered.length;
      const totalPages = Math.ceil(totalItems / this.pageSize);

      if (this.currentPage > totalPages) {
        this.currentPage = totalPages || 1;
      }
      if (this.currentPage < 1) {
        this.currentPage = 1;
      }

      const startIndex = (this.currentPage - 1) * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      const paginated = filtered.slice(startIndex, endIndex);

      let html = paginated.map(ch => this.getCardHTML(ch)).join('');

      if (totalPages > 1) {
        html += this.getPaginationHTML(totalPages);
      }

      cardsContainer.innerHTML = html;
    }

    Components.renderIcons();
  },

  setPage(page) {
    this.currentPage = page;
    this.applyFilters(true);

    const target = document.querySelector('.dc-results-title');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  },

  getPaginationHTML(totalPages) {
    let buttons = '';

    buttons += `
      <button onclick="DescubrirCanais.setPage(${this.currentPage - 1})" 
              class="dc-page-arrow" 
              ${this.currentPage === 1 ? 'disabled' : ''}>
        <i data-lucide="chevron-left" style="width:16px;height:16px;"></i>
      </button>
    `;

    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(totalPages, this.currentPage + 2);

    if (startPage > 1) {
      buttons += `<button onclick="DescubrirCanais.setPage(1)" class="dc-page-btn">1</button>`;
      if (startPage > 2) {
        buttons += `<span style="padding: 0 4px; color: #94A3B8;">...</span>`;
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons += `
        <button onclick="DescubrirCanais.setPage(${i})" 
                class="dc-page-btn ${this.currentPage === i ? 'active' : ''}">
          ${i}
        </button>
      `;
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons += `<span style="padding: 0 4px; color: #94A3B8;">...</span>`;
      }
      buttons += `<button onclick="DescubrirCanais.setPage(${totalPages})" class="dc-page-btn">${totalPages}</button>`;
    }

    buttons += `
      <button onclick="DescubrirCanais.setPage(${this.currentPage + 1})" 
              class="dc-page-arrow" 
              ${this.currentPage === totalPages ? 'disabled' : ''}>
        <i data-lucide="chevron-right" style="width:16px;height:16px;"></i>
      </button>
    `;

    return `
      <div class="dc-pagination">
        ${buttons}
      </div>
    `;
  },

  parseContacts(desc) {
    const contacts = new Set();
    if (!desc) return [];
    const lower = desc.toLowerCase();

    // ── E-mail: SOMENTE se um email REAL for encontrado via regex ──
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i;
    const emailObfuscated = /[a-zA-Z0-9._%+-]+\s*[\(\[]?\s*at\s*[\)\]]?\s*[a-zA-Z0-9.-]+\s*[\(\[]?\s*dot\s*[\)\]]?\s*[a-zA-Z]{2,}/i;
    if (emailRegex.test(desc) || emailObfuscated.test(desc)) {
      contacts.add('email');
    }

    // ── Discord: link real ou menção clara ──
    if (/discord\.(gg|com|me)\//i.test(desc) || /\bdiscord\b/i.test(lower)) {
      contacts.add('discord');
    }

    // ── Instagram: link real ou @ handle ──
    if (/instagram\.com\//i.test(desc) || /instagr\.am\//i.test(desc) || /@[\w.]+\s*\(?\s*insta/i.test(desc) || /\binsta(gram)?[\s:]+@/i.test(desc)) {
      contacts.add('instagram');
    }

    // ── Twitter/X: link real ──
    if (/twitter\.com\//i.test(desc) || /\bx\.com\/\w/i.test(desc)) {
      contacts.add('twitter');
    }

    // ── Site/Blog: URL real (http/https/www) ou linktree ──
    if (/https?:\/\/[^\s]+/i.test(desc) || /www\.\S+/i.test(desc) || /linktr\.ee\//i.test(desc) || /beacons\.ai\//i.test(desc) || /bit\.ly\//i.test(desc)) {
      contacts.add('site');
    }

    // NÃO adiciona padrões se nada for detectado — a badge fica vazia e o card mostra apenas "Contatar"
    return Array.from(contacts);
  },

  // Mapeia o valor do dropdown de localização para o código de região da API
  getRegionCode() {
    const selectedLoc = document.getElementById('dc-loc-select')?.value || 'Todos';
    const map = {
      'Brasil': 'BR',
      'Estados Unidos': 'US',
      'América Latina (Espanhol)': 'LATAM',
      'Europa (PT/ES)': 'EU',
      'Todos': 'ALL',
      'Outras': 'ALL',
      'Outros': 'ALL'
    };
    return map[selectedLoc] || 'BR';
  },

  matchLocation(ch, selectedLoc) {
    const country = (ch.country || '').toUpperCase();
    const latamCodes = ['LATAM', 'MX', 'AR', 'CO', 'CL', 'PE', 'VE', 'EC', 'UY', 'PY', 'BO', 'CR', 'GT', 'HN', 'SV', 'PA', 'DO', 'CU', 'NI', 'PR'];
    const euCodes = ['EU', 'PT', 'ES', 'FR', 'DE', 'IT', 'GB', 'NL', 'BE'];

    switch (selectedLoc) {
      case 'Brasil':
        return country === 'BR' || country === '';
      case 'Estados Unidos':
        return country === 'US' || country === '';
      case 'América Latina (Espanhol)':
        return latamCodes.includes(country) || country === '';
      case 'Europa (PT/ES)':
        return euCodes.includes(country) || country === '';
      case 'Todos':
        return true;
      case 'Outros':
        return !['BR', 'US', ...latamCodes, ...euCodes].includes(country);
      default:
        return true;
    }
  },

  getCountryLabel(countryCode) {
    const labels = {
      'BR': '🇧🇷 Brasil',
      'US': '🇺🇸 Estados Unidos',
      'LATAM': '🌎 América Latina',
      'MX': '🇲🇽 México',
      'AR': '🇦🇷 Argentina',
      'CO': '🇨🇴 Colômbia',
      'CL': '🇨🇱 Chile',
      'PE': '🇵🇪 Peru',
      'VE': '🇻🇪 Venezuela',
      'EC': '🇪🇨 Equador',
      'UY': '🇺🇾 Uruguai',
      'PY': '🇵🇾 Paraguai',
      'BO': '🇧🇴 Bolívia',
      'CR': '🇨🇷 Costa Rica',
      'GT': '🇬🇹 Guatemala',
      'HN': '🇭🇳 Honduras',
      'SV': '🇸🇻 El Salvador',
      'PA': '🇵🇦 Panamá',
      'DO': '🇩🇴 Rep. Dominicana',
      'CU': '🇨🇺 Cuba',
      'NI': '🇳🇮 Nicarágua',
      'PR': '🇵🇷 Porto Rico',
      'EU': '🇪🇺 Europa',
      'PT': '🇵🇹 Portugal',
      'ES': '🇪🇸 Espanha',
      'FR': '🇫🇷 França',
      'DE': '🇩🇪 Alemanha',
      'IT': '🇮🇹 Itália',
      'GB': '🇬🇧 Reino Unido',
      'UK': '🇬🇧 Reino Unido',
      'NL': '🇳🇱 Holanda',
      'BE': '🇧🇪 Bégica'
    };
    return labels[(countryCode || '').toUpperCase()] || (countryCode ? `🌐 ${countryCode}` : '🌐 Global');
  },

  formatSubscribers(subs) {
    if (!subs) return '0 subs';
    if (subs >= 1000000) return (subs / 1000000).toFixed(1).replace('.0', '') + 'M subs';
    if (subs >= 1000) return (subs / 1000).toFixed(0) + 'k subs';
    return subs + ' subs';
  },

  formatViews(views) {
    if (!views) return '0 views';
    if (views >= 1000000) return (views / 1000000).toFixed(1).replace('.0', '') + 'M views';
    if (views >= 1000) return (views / 1000).toFixed(0) + 'k views';
    return views + ' views';
  },

  updateSubscribersLabel(valStr) {
    const val = parseInt(valStr, 10) || 1000;
    const label = document.getElementById('dc-sub-val-label');
    if (label) {
      if (val >= 1000000) {
        label.textContent = (val / 1000000).toFixed(1) + 'M';
      } else if (val >= 1000) {
        label.textContent = Math.round(val / 1000) + 'k';
      } else {
        label.textContent = val;
      }
    }
    this.applyFilters();
  },

  clearFilters() {
    const chkEmail = document.getElementById('dc-chk-email');
    if (chkEmail) chkEmail.checked = false;
    const chkDiscord = document.getElementById('dc-chk-discord');
    if (chkDiscord) chkDiscord.checked = false;
    const chkSite = document.getElementById('dc-chk-site');
    if (chkSite) chkSite.checked = false;
    const chkInstagram = document.getElementById('dc-chk-instagram');
    if (chkInstagram) chkInstagram.checked = false;
    const chkTwitter = document.getElementById('dc-chk-twitter');
    if (chkTwitter) chkTwitter.checked = false;

    const chkMicro = document.getElementById('dc-chk-micro');
    if (chkMicro) chkMicro.checked = false;
    const chkMedio = document.getElementById('dc-chk-medio');
    if (chkMedio) chkMedio.checked = false;
    const chkGrande = document.getElementById('dc-chk-grande');
    if (chkGrande) chkGrande.checked = false;

    const range = document.getElementById('dc-sub-range');
    if (range) {
      range.value = 1000;
      this.updateSubscribersLabel(1000);
    }
    const select = document.getElementById('dc-loc-select');
    if (select) {
      select.value = 'Brasil';
      const trigger = select.previousElementSibling;
      if (trigger && trigger.classList.contains('hig-select-wrapper')) {
        const textSpan = trigger.querySelector('.hig-select-text');
        if (textSpan) textSpan.textContent = 'Brasil';
      }
      select.dispatchEvent(new Event('change'));
    }
    this.applyFilters();
    Components.toast('Filtros limpos!', 'info');
  },

  openContactModal(channelId) {
    const ch = this.results.find(c => c.id === channelId);
    if (!ch) return;
    this._currentContactChannel = ch; // Save reference for sendViaGmail

    // Obter dados do Perfil de Freelancer
    let prof = {
      nome: API.getUser()?.nome || 'Administrador',
      role: 'Editor de Vídeo',
      portfolio: 'https://seufolio.com',
      email: API.getUser()?.email || 'admin@tomada.com',
      whatsapp: '(11) 99999-9999'
    };

    const configModule = window.Configuracoes || (typeof Configuracoes !== 'undefined' ? Configuracoes : null);
    if (configModule && typeof configModule.getData === 'function') {
      prof = configModule.getData();
    } else {
      try {
        const user = API.getUser();
        const profileKey = 'bancada_user_profile_' + (user ? (user.email || user.id || 'default') : 'default');
        const saved = localStorage.getItem(profileKey);
        if (saved) {
          prof = { ...prof, ...JSON.parse(saved) };
        }
      } catch (e) {
        console.error('Erro ao buscar dados do perfil:', e);
      }
    }

    this._currentContactProfile = prof;

    const category = ch.category || 'Geral';
    const initialTemplate = this.getAbordagemTemplate('opcao1', ch, prof, category);

    const emailMatch = ch.description ? ch.description.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/) : null;
    const realEmail = emailMatch ? emailMatch[0] : null;
    const subsText = this.formatSubscribers(ch.subscribers);

    const contentHtml = `
      <div class="premium-desktop-form" style="padding: 10px 0;">
        <div class="p-bento-container" style="display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 20px;">
          <!-- Coluna Esquerda: Texto Pronto e Contatos -->
          <div class="p-bento-col" style="display:flex; flex-direction:column; gap:20px;">
            <div class="p-bento-card">
              <h4 class="p-bento-title" style="margin-bottom: 12px; font-weight: 700; color: #E55A2B;"><i data-lucide="file-text"></i> Proposta de Mídia (Alta Conversão)</h4>

              <!-- Seletor de Modelo de Abordagem (Mini Pop-up) -->
              <div class="p-form-group" style="margin-bottom: 14px;">
                <label style="margin-bottom:6px; font-weight: 700; color: #475569; display:block;">Modelo de Abordagem</label>
                <select class="trello-select" id="dc-modal-abordagem-select" style="width: 100%;">
                  <option value="opcao1" selected>1. Proposta de Edição/Retenção (Nicho ${category})</option>
                  <option value="opcao2">2. Apresentação de Portfólio (Canal no YouTube)</option>
                  <option value="opcao3">3. Prestação de Serviços Direta / Orçamento Sob Medida</option>
                </select>
              </div>

              <div class="p-form-group" style="margin-bottom: 12px;">
                <label style="margin-bottom:6px; font-weight: 700; color: #475569;">E-mail do Destinatário</label>
                ${realEmail ? `
                  <div style="display:flex; align-items:center; gap:8px;">
                    <input type="text" id="dc-modal-email" class="p-input" value="${realEmail}" style="width:100%; box-sizing:border-box; font-weight:700; padding:10px 14px; border-radius:10px; border:1px solid #10B981; background:#F0FDF4; color:#14532D;" readonly>
                    <span style="font-size:11px; font-weight:700; color:#10B981; background:rgba(16,185,129,0.1); padding:4px 8px; border-radius:6px; white-space:nowrap;"><i data-lucide="check" style="width:12px;height:12px;display:inline;"></i> Detectado</span>
                  </div>
                ` : `
                  <div style="display:flex; flex-direction:column; gap:6px;">
                    <input type="text" id="dc-modal-email" class="p-input" placeholder="exemplo@canal.com" style="width:100%; box-sizing:border-box; font-weight:700; padding:10px 14px; border-radius:10px; border:1px solid #FF9A3C; background:#FFF7ED; color:#7C2D12;" oninput="DescubrirCanais.validateEmailInput(this)">
                    <span style="font-size:11px; font-weight:600; color:#EA580C; display:flex; align-items:center; gap:4px;"><i data-lucide="alert-triangle" style="width:12px;height:12px;"></i> E-mail não encontrado na descrição. Insira manualmente para contatar.</span>
                  </div>
                `}
              </div>

              <div class="p-form-group">
                <label style="margin-bottom:6px; font-weight: 700; color: #475569;">Assunto do E-mail</label>
                <input type="text" id="dc-modal-subject" class="p-input" value="${initialTemplate.subject}" style="width:100%; box-sizing:border-box; font-weight:700; padding:10px 14px; border-radius:10px; border:1px solid #E2E8F0; background:#FFF;" readonly>
              </div>
              <div class="p-form-group" style="margin-top:12px;">
                <label style="margin-bottom:6px; font-weight: 700; color: #475569;">Mensagem Pronta</label>
                <textarea id="dc-modal-body" class="p-input" rows="10" style="width:100%; box-sizing:border-box; font-family:'Outfit', 'Inter', sans-serif; font-size:13px; font-weight:500; line-height:1.5; padding:12px; border-radius:12px; resize:none; background:#F8FAFC; border:1px solid #E2E8F0; height: 210px;" readonly>${initialTemplate.body}</textarea>
              </div>
              <div style="display:flex; gap:12px; margin-top:16px;">
                <button onclick="DescubrirCanais.copyProposal()" class="btn btn-secondary btn-sm" style="display:flex; align-items:center; gap:6px; font-size:13px; padding:10px 16px; border-radius:10px; cursor:pointer; font-weight:700; border:1px solid #CBD5E1; background:#FFF;">
                  <i data-lucide="copy" style="width:16px;height:16px;"></i> Copiar Texto
                </button>
                <button id="dc-gmail-btn" onclick="DescubrirCanais.sendViaGmailClick('${encodeURIComponent(initialTemplate.subject)}')" class="btn btn-primary btn-sm" style="display:flex; align-items:center; gap:6px; font-size:13px; padding:10px 16px; border-radius:10px; cursor:pointer; background:#EA4335; border:none; color:white; font-weight:700; ${realEmail ? '' : 'opacity:0.6; cursor:not-allowed;'}" ${realEmail ? '' : 'disabled'}>
                  <i data-lucide="mail" style="width:16px;height:16px;"></i> Enviar por Gmail
                </button>
              </div>
            </div>
          </div>
          
          <!-- Coluna Direita: Informações e Enviar Orçamento -->
          <div class="p-bento-col" style="display:flex; flex-direction:column; gap:20px;">
            <div class="p-bento-card">
              <h4 class="p-bento-title" style="margin-bottom: 12px; color: #475569;"><i data-lucide="info"></i> Canal Selecionado</h4>
              <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
                <img src="${ch.logo || ch.thumbnail || `https://ui-avatars.com/api/?name=${encodeURIComponent(ch.name)}&background=E55A2B&color=fff`}" referrerpolicy="no-referrer" style="width:48px; height:48px; border-radius:50%; border:2px solid #E55A2B; padding:1px; object-fit:cover;" onerror="this.onerror=null;this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(ch.name)}&background=E55A2B&color=fff'">
                <div>
                  <div style="font-weight:700; color:#0F172A; font-size:15px;">${ch.name}</div>
                  <div style="font-weight:600; color:#64748B; font-size:12px;">${ch.customUrl || '@canal'}</div>
                </div>
              </div>
              <div style="display:flex; flex-direction:column; gap:8px; font-size:13px; color:#475569;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <strong>Nicho:</strong>
                  <span class="dc-card-tag niche" style="font-size:11px; padding:2px 8px; border-radius:4px; font-weight:700; color:#1E4BFF; background:rgba(30,75,255,0.08);">${category}</span>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px;">
                  <strong>Inscritos:</strong>
                  <span style="font-weight:700; color:#0F172A;">${subsText}</span>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px;">
                  <strong>Localização:</strong>
                  <span style="font-weight:600; color:#0F172A;">${this.getCountryLabel(ch.country)}</span>
                </div>
              </div>
            </div>
            
            <div class="p-bento-card" style="background:#FFF7ED; border:1px solid #FFEDD5; box-shadow: 0 4px 12px rgba(229,90,43,0.05);">
              <h4 class="p-bento-title" style="color:#C2410C; margin-bottom: 12px;"><i data-lucide="file-spreadsheet"></i> Enviar Orçamento</h4>
              <p style="font-size:12px; color:#7C2D12; margin-bottom:16px; font-weight:600; line-height:1.4;">
                Gostaria de cadastrar uma proposta de orçamento no sistema para acompanhar o funil de parceria com este canal?
              </p>
              <button onclick="DescubrirCanais.openQuickBudgetModal('${ch.id}')" class="btn btn-primary" style="width:100%; display:flex; align-items:center; justify-content:center; gap:6px; font-size:13px; padding:10px; border-radius:10px; cursor:pointer; background:#E55A2B; border:none; color:white; font-weight:700;">
                <i data-lucide="plus-circle" style="width:16px;height:16px;"></i> Criar Orçamento de Serviço
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    const footerHtml = `
      <button class="btn btn-secondary" onclick="Components.closeModal()" style="border-radius:10px; font-weight:600; padding:10px 20px;">Fechar</button>
    `;

    Components.showModal('Entrar em Contato', contentHtml, footerHtml, 'premium-task-modal');
    Components.renderIcons();

    // Inicializar o mini pop-up customizado de abordagem (replicando o padrão do seletor de região)
    setTimeout(() => {
      const modalSelect = document.getElementById('dc-modal-abordagem-select');
      if (modalSelect) {
        if (typeof HigPopovers !== 'undefined' && typeof HigPopovers.initCustomSelects === 'function') {
          delete modalSelect.dataset.higInitialized;
          HigPopovers.initCustomSelects();
        }
        modalSelect.addEventListener('change', (e) => {
          this.selectAbordagem(e.target.value);
        });
      }
    }, 50);
  },

  getAbordagemTemplate(opt, ch, prof, category) {
    if (opt === 'opcao2') {
      return {
        subject: `Parceria e Edição Profissional - Portfólio no YouTube - ${ch.name}`,
        body: `Olá ${ch.name}, tudo bem?\n\nMeu nome é ${prof.nome} (${prof.role}). Também tenho um canal/portfólio no YouTube onde produzo conteúdos focados em edição dinâmica, cortes de alta retenção e qualidade cinematográfica.\n\nVocê pode conferir nossas produções e estilo diretamente no nosso canal/portfólio: ${prof.portfolio}\n\nAcredito que uma parceria na pós-produção dos seus vídeos traria um salto imenso de qualidade e engajamento para a sua audiência. Como está a demanda de vocês para novos editores no momento?\n\nAtenciosamente,\n${prof.nome}\nE-mail: ${prof.email}\nWhatsApp: ${prof.whatsapp}`
      };
    }
    if (opt === 'opcao3') {
      return {
        subject: `Prestação de Serviços de Edição & Pós-Produção - ${ch.name}`,
        body: `Olá, equipe do canal ${ch.name}!\n\nEspero que estejam bem. Me chamo ${prof.nome} e ofereço serviços completos de pós-produção audiovisual (edição de vídeos longos, cortes virais para Shorts/Reels, thumbnails de alto CTR e tratamento de áudio/cor).\n\nTrabalhamos com pacotes sob medida para criadores de conteúdo que buscam terceirizar a edição com prazos ágeis e qualidade profissional. Acesse nosso portfólio de cases: ${prof.portfolio}\n\nPodemos agendar uma breve conversa ou enviar um orçamento sem compromisso? Se fizer sentido, qual o melhor e-mail ou WhatsApp para contato?\n\nUm grande abraço,\n${prof.nome}\nE-mail: ${prof.email}\nWhatsApp: ${prof.whatsapp}`
      };
    }
    // opcao1 (Padrão - Nicho)
    const categoryTemplates = {
      'Games & Jogos': `Olá, equipe do ${ch.name}!\n\nTudo bem? Sou ${prof.nome}, profissional atuando como ${prof.role} focado em canais de games e gameplays. Acompanho as gameplays de vocês e sou fã do canal.\n\nSei que vídeos de gameplay hoje em dia exigem uma edição extremamente dinâmica, memes pontuais, zoom estruturado e efeitos de som para manter a atenção dos jovens e reter o público por mais tempo. Preparei uma edição conceito rápida de 30 segundos usando um de seus últimos vídeos para demonstrar o ritmo que proponho: ${prof.portfolio}\n\nSe tiverem interesse em testar esse formato para aumentar a retenção média dos vídeos, qual seria o melhor contato para conversarmos?\n\nAbraços,\n${prof.nome}\nE-mail: ${prof.email}\nWhatsApp: ${prof.whatsapp}`,
      'Design & UX': `Olá, equipe do ${ch.name}!\n\nMe chamo ${prof.nome} e sou ${prof.role} focado em canais de Design & UX. Acompanho o conteúdo de vocês e vejo uma oportunidade excelente de elevarmos ainda mais a identidade visual e o CTR (taxa de clique) das suas capas!\n\nDesenvolvi algumas artes e layouts personalizados baseados no estilo do seu canal que você pode ver na minha pasta de trabalhos: ${prof.portfolio}\n\nPodemos fazer um teste gratuito de uma imagem/capa sem compromisso para você avaliar a resposta do seu público? Se fizer sentido, qual seria o melhor contato (e-mail ou WhatsApp) para alinharmos?\n\nAbraços,\n${prof.nome}\nE-mail: ${prof.email}\nWhatsApp: ${prof.whatsapp}`,
      'Tecnologia': `Olá, equipe do ${ch.name}!\n\nTudo bem? Sou ${prof.nome}, profissional especializado como ${prof.role} para canais de tecnologia. Adoro a forma como abordam os temas de tech nos seus vídeos.\n\nAnalisei seus últimos uploads e notei alguns pontos onde uma edição mais dinâmica e cortes focados em retenção de público poderiam aumentar o tempo de exibição médio em até 20%. Preparei um exemplo rápido de como ficaria a edição de um dos seus vídeos aqui: ${prof.portfolio}\n\nQual o melhor canal comercial ou e-mail de vocês para enviarmos uma proposta comercial detalhada de serviços?\n\nAtenciosamente,\n${prof.nome}\nE-mail: ${prof.email}\nWhatsApp: ${prof.whatsapp}`,
      'Negócios': `Olá, pessoal comercial do ${ch.name}!\n\nSou ${prof.nome}, atuo como ${prof.role} profissional com foco no nicho de negócios, finanças e mercado corporativo. Sigo as análises e o conteúdo educacional do seu canal.\n\nMinha especialidade é criar estruturas narrativas e dinâmicas de alto engajamento para canais de negócios, otimizando o funil de atenção dos inscritos. Você pode ver alguns dos canais que atendo e meus trabalhos de portfólio neste link: ${prof.portfolio}\n\nComo está a demanda de vocês para novos parceiros de produção e roteiro no momento? Se houver interesse, podemos conversar sobre valores.\n\nUm abraço,\n${prof.nome}\nE-mail: ${prof.email}\nWhatsApp: ${prof.whatsapp}`,
      'Educação': `Olá, equipe do ${ch.name}!\n\nTudo bem? Meu nome é ${prof.nome} e trabalho como ${prof.role} focado em canais de conteúdo educativo e infoprodutos. A didática do canal é fantástica.\n\nAjudo criadores do ramo educacional a transformar aulas densas em vídeos altamente atraentes e fáceis de consumir, aumentando a retenção de alunos. Meu portfólio completo de edições e criativos educacionais está disponível aqui: ${prof.portfolio}\n\nGostaria de entender se vocês estão aceitando propostas de prestadores de serviço terceirizados. Qual seria o melhor contato para conversarmos?\n\nObrigado,\n${prof.nome}\nE-mail: ${prof.email}\nWhatsApp: ${prof.whatsapp}`,
      'Culinária': `Olá, equipe do canal ${ch.name}!\n\nEspero que estejam bem. Me chamo ${prof.nome} e atuo como ${prof.role} especializado em canais de culinária e gastronomia. Sou fascinado pelas receitas que postam!\n\nSei que vídeos de culinária exigem um apelo visual gigantesco (food appeal) nas thumbnails e cortes precisos no ritmo da preparação. Preparei um modelo de capa e edição rápida que fiz para um dos seus vídeos para mostrar a diferença que faz no CTR: ${prof.portfolio}\n\nPodemos fazer um teste sem custo comercial para vocês avaliarem a qualidade? Qual o melhor e-mail para contato?\n\nAtenciosamente,\n${prof.nome}\nE-mail: ${prof.email}\nWhatsApp: ${prof.whatsapp}`,
      'Geral': `Olá, equipe do ${ch.name}!\n\nMe chamo ${prof.nome} e atuo profissionalmente como ${prof.role}. Acompanho e gosto muito do ritmo dos vídeos do seu canal.\n\nTrabalho ajudando canais de destaque no YouTube a terceirizar a pós-produção de vídeos (edição, thumbnails, roteiros, SEO) com qualidade e agilidade. Meu portfólio com trabalhos reais pode ser acessado aqui: ${prof.portfolio}\n\nPodemos conversar sobre como posso somar à equipe de produção de vocês? Se fizer sentido, qual o melhor contato de e-mail ou WhatsApp?\n\nUm grande abraço,\n${prof.nome}\nE-mail: ${prof.email}\nWhatsApp: ${prof.whatsapp}`
    };

    const body = categoryTemplates[category] || categoryTemplates['Geral'];
    const subject = `Edição de Vídeo/Retenção para Canal de ${category} - ${ch.name}`;
    return { subject, body };
  },

  selectAbordagem(option) {
    if (!this._currentContactChannel || !this._currentContactProfile) return;
    const ch = this._currentContactChannel;
    const prof = this._currentContactProfile;
    const category = ch.category || 'Geral';
    const tpl = this.getAbordagemTemplate(option, ch, prof, category);

    const subjectEl = document.getElementById('dc-modal-subject');
    const bodyEl = document.getElementById('dc-modal-body');
    const gmailBtn = document.getElementById('dc-gmail-btn');

    if (subjectEl) subjectEl.value = tpl.subject;
    if (bodyEl) bodyEl.value = tpl.body;
    if (gmailBtn) {
      gmailBtn.setAttribute('onclick', `DescubrirCanais.sendViaGmailClick('${encodeURIComponent(tpl.subject)}')`);
    }
  },

  copyProposal() {
    const copyText = document.getElementById('dc-modal-body');
    if (copyText) {
      navigator.clipboard.writeText(copyText.value)
        .then(() => Components.toast('Proposta copiada para a área de transferência!', 'success'))
        .catch(err => console.error('Erro ao copiar:', err));
    }
  },

  sendViaGmail(email, subjectEncoded) {
    const bodyText = document.getElementById('dc-modal-body')?.value || '';
    const subjectText = decodeURIComponent(subjectEncoded);

    // Salvar prospect no localStorage para a aba Prospecção
    this._saveProspect(email, subjectText, bodyText);

    const bodyEncoded = encodeURIComponent(bodyText);
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subjectEncoded}&body=${bodyEncoded}`;
    window.open(gmailUrl, '_blank');
    Components.toast('Prospect salvo na aba Clientes → Prospecção!', 'success');
  },

  _saveProspect(emailTo, subject, body) {
    try {
      const ch = this._currentContactChannel;
      if (!ch) return;

      const prospect = {
        id: 'prsp_' + Date.now().toString(36),
        channelId: ch.id,
        channelName: ch.name,
        channelAvatar: ch.logo || ch.thumbnail || '',
        channelUrl: ch.customUrl || '',
        subscribers: ch.subscribers || 0,
        videoCount: ch.videoCount || 0,
        viewCount: ch.viewCount || 0,
        category: ch.category || 'Geral',
        contacts: ch.contacts || [],
        description: ch.description || '',
        emailTo,
        subject,
        body,
        sentAt: new Date().toISOString(),
        status: 'enviado' // enviado | respondido | contratado | arquivado
      };

      const user = API.getUser();
      const prospectsKey = 'bancada_prospects_' + (user ? (user.email || user.id || 'default') : 'default');
      const stored = JSON.parse(localStorage.getItem(prospectsKey) || '[]');
      // Evitar duplicata por channelId — atualiza se já existe
      const existingIdx = stored.findIndex(p => p.channelId === ch.id);
      if (existingIdx >= 0) {
        stored[existingIdx] = { ...stored[existingIdx], ...prospect, sentAt: new Date().toISOString() };
      } else {
        stored.unshift(prospect);
      }
      localStorage.setItem(prospectsKey, JSON.stringify(stored));
    } catch (e) {
      console.error('[Prospecção] Erro ao salvar prospect:', e);
    }
  },

  openQuickBudgetModal(channelId) {
    const ch = this.results.find(c => c.id === channelId);
    if (!ch) return;

    // Close the contact modal
    Components.closeModal();

    // Navigate to Orçamentos tab
    App.navigate('orcamentos');

    // Open Orcamentos Form Modal with pre-filled influencer details
    setTimeout(() => {
      if (window.Orcamentos && typeof window.Orcamentos.openFormModal === 'function') {
        window.Orcamentos.openFormModal(null, null, `Parceria Canal: ${ch.name}`);
      }
    }, 200);
  },

  validateEmailInput(input) {
    const email = input.value.trim();
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const btn = document.getElementById('dc-gmail-btn');
    if (btn) {
      if (emailRegex.test(email)) {
        btn.removeAttribute('disabled');
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
      } else {
        btn.setAttribute('disabled', 'true');
        btn.style.opacity = '0.6';
        btn.style.cursor = 'not-allowed';
      }
    }
  },

  sendViaGmailClick(subjectEncoded) {
    const emailInput = document.getElementById('dc-modal-email');
    if (!emailInput) return;
    const email = emailInput.value.trim();
    if (!email) return;
    this.sendViaGmail(email, subjectEncoded);
  }
};

window.DescubrirCanais = DescubrirCanais;
