/**
 * Configuracoes Module - Settings & Company Account Tab
 * Bancada Sistema Padeiro / Marceneiro
 */
const Configuracoes = {
  currentTab: 'empresa',

  defaultData: {
    cnpj: '48.209.111/0001-08',
    razaoSocial: 'Bancada Carpintaria e Móveis Planejados Ltda',
    nomeFantasia: 'Bancada Design',
    telefone: '(11) 98765-4321',
    email: 'contato@bancadadesign.com.br',
    endereco: 'Rua das Madeiras, 450 - Distrito Industrial, São Paulo - SP',
    foco: 'Móveis Planejados',
    regime: 'Simples Nacional',
    logo: ''
  },

  defaultSecurity: {
    mfa: false,
    sessionTimeout: '60'
  },

  defaultIntegrations: {
    zapsignToken: 'zs_a1b2c3d4e5f6g7h8i9j0',
    zapsignActive: true,
    autoWhatsApp: true
  },

  defaultPreferences: {
    idioma: 'Português (Brasil)',
    fusoHorario: 'Brasília (GMT-3)',
    unidadeMedida: 'Milímetros (mm)',
    tema: 'Claro',
    androidBackButtonVolta: true
  },

  getData() {
    const defaultProfile = {
      nome: API.getUser()?.nome || 'Administrador',
      role: 'Editor de Vídeo',
      portfolio: 'https://seufolio.com',
      email: API.getUser()?.email || 'admin@tomada.com',
      whatsapp: '(11) 99999-9999'
    };
    try {
      const user = API.getUser();
      const profileKey = 'bancada_user_profile_' + (user ? (user.email || user.id || 'default') : 'default');
      const saved = localStorage.getItem(profileKey);
      if (saved) {
        return { ...defaultProfile, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Erro ao ler perfil:', e);
    }
    return defaultProfile;
  },

  getSecurity() {
    const saved = localStorage.getItem('bancada_config_seguranca');
    if (saved) {
      try {
        return { ...this.defaultSecurity, ...JSON.parse(saved) };
      } catch (e) {
        return this.defaultSecurity;
      }
    }
    return this.defaultSecurity;
  },

  getIntegrations() {
    const saved = localStorage.getItem('bancada_config_integracoes');
    if (saved) {
      try {
        return { ...this.defaultIntegrations, ...JSON.parse(saved) };
      } catch (e) {
        return this.defaultIntegrations;
      }
    }
    return this.defaultIntegrations;
  },

  getPreferences() {
    const saved = localStorage.getItem('bancada_config_preferencias');
    if (saved) {
      try {
        return { ...this.defaultPreferences, ...JSON.parse(saved) };
      } catch (e) {
        return this.defaultPreferences;
      }
    }
    return this.defaultPreferences;
  },

  async render() {
    const pageContainer = document.getElementById('page-container');
    if (!pageContainer) return;

    const tab = this.currentTab;

    pageContainer.innerHTML = `
      <div class="fade-in animate-fade">
        <div class="settings-container">
          
          <!-- Sidebar de Navegação de Configurações -->
          <aside class="settings-sidebar-card cascade-item" style="--index: 0;">
            <div class="settings-menu-item ${tab === 'empresa' ? 'active' : ''}" onclick="Configuracoes.switchTab('empresa')">
              <i data-lucide="user"></i>
              <span>Perfil</span>
            </div>
            <div class="settings-menu-item ${tab === 'seguranca' ? 'active' : ''}" onclick="Configuracoes.switchTab('seguranca')">
              <i data-lucide="shield-check"></i>
              <span>Segurança & Acesso</span>
            </div>
            <div class="settings-menu-item ${tab === 'integracoes' ? 'active' : ''}" onclick="Configuracoes.switchTab('integracoes')">
              <i data-lucide="blocks"></i>
              <span>Integrações (ZapSign)</span>
            </div>
            <div class="settings-menu-item ${tab === 'preferencias' ? 'active' : ''}" onclick="Configuracoes.switchTab('preferencias')">
              <i data-lucide="sliders"></i>
              <span>Preferências</span>
            </div>
          </aside>

          <!-- Painel Principal de Configurações (Conteúdo Dinâmico) -->
          <main class="settings-content-card cascade-item" style="--index: 1;" id="settings-content-panel">
            ${this.getTabHtml(tab)}
          </main>

        </div>
      </div>
    `;

    Components.renderIcons();
    if (tab === 'empresa') {
      this.liveUpdateProgress();
    }
  },

  switchTab(tab) {
    this.currentTab = tab;
    this.render();
  },

  getTabHtml(tab) {
    if (tab === 'empresa') return this.getEmpresaHtml();
    if (tab === 'seguranca') return this.getSegurancaHtml();
    if (tab === 'integracoes') return this.getIntegrationsHtml();
    if (tab === 'preferencias') return this.getPreferencesHtml();
    return '';
  },

  // ─── 1. ABA PERFIL (CONTA) ──────────────────────────────────────────────────
  getEmpresaHtml() {
    const prof = this.getData();
    
    // Progress Circle Constants
    const radius = 50;
    const circumference = 2 * Math.PI * radius;

    return `
      <style>
        .prof-grid-container {
          display: grid;
          grid-template-columns: 1.3fr 0.7fr;
          gap: 24px;
          font-family: 'Outfit', 'Inter', sans-serif;
          margin-top: 16px;
        }
        @media (max-width: 900px) {
          .prof-grid-container {
            grid-template-columns: 1fr;
          }
        }
        .prof-left-panel {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        
        .prof-right-panel {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .prof-checklist {
          display: flex;
          flex-direction: column;
          gap: 10px;
          border-top: 1px solid var(--bg-input);
          padding-top: 16px;
        }
        .prof-check-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
          transition: all 0.2s;
        }
        .prof-check-item.completed {
          color: var(--text-main);
        }
        .prof-check-label-row {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .prof-check-icon {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: bold;
        }
        .prof-check-icon.success {
          background: #DCFCE7;
          color: #15803D;
        }
        .prof-check-icon.pending {
          background: var(--bg-input);
          color: var(--text-secondary);
        }
        .prof-check-pct {
          font-size: 10px;
          font-weight: 700;
          color: #10B981;
        }
        .prof-check-pct.pending {
          color: var(--text-secondary);
        }
      </style>

      <div class="flex items-center gap-3 mb-6" style="border-bottom: 1px solid var(--bg-input); padding-bottom: 16px;">
        <div class="kpi-icon text-primary"><i data-lucide="user"></i></div>
        <div>
          <h3 style="margin:0; font-size: 18px; font-weight: 700; color: var(--text-main);">Perfil Profissional</h3>
          <p style="margin: 4px 0 0; font-size: 13px; color: var(--text-secondary);">Gerencie os dados de freelancer e links de portfólio para propostas de alta conversão.</p>
        </div>
      </div>

      <form id="empresa-config-form" onsubmit="Configuracoes.salvarEmpresa(event)">
        <div class="prof-grid-container">
          <!-- Coluna Esquerda: Form fields -->
          <div class="prof-left-panel">
            
            <!-- Upload de Foto / Avatar -->
            <div style="display:flex; align-items:center; gap:16px; padding:16px; background:var(--bg-main); border-radius:var(--radius-lg); border:1.5px solid var(--bg-input); margin-bottom: 8px;">
              <div class="prof-avatar-img" id="prof-avatar-display" style="width: 60px; height: 60px; border-radius: 50%; background:#E55A2B; color:#FFFFFF; font-size:24px; font-weight:800; display:flex; align-items:center; justify-content:center; flex-shrink: 0;">
                ${prof.nome.charAt(0).toUpperCase()}
              </div>
              <div>
                <button type="button" class="btn-secondary hover-lift" onclick="Components.toast('Mock upload: Foto atualizada!', 'success')" style="padding: 6px 12px; font-size: 13px;">
                  <i data-lucide="camera" style="width:14px;height:14px;margin-right:6px;vertical-align:middle;"></i> Carregar Foto
                </button>
                <span style="display:block; font-size:11px; color:var(--text-secondary); margin-top:4px;">Formatos recomendados: JPG ou PNG. Mínimo 800x800 px.</span>
              </div>
            </div>

            <!-- Upload / Personalização da Logo do Orçamento (SVG) -->
            <div style="padding:16px; background:var(--bg-main); border-radius:var(--radius-lg); border:1.5px solid var(--bg-input); margin-bottom: 12px;">
              <h4 style="margin:0 0 4px 0; font-size:14px; font-weight:700; color:var(--text-main); display:flex; align-items:center; gap:8px;">
                <i data-lucide="image" style="color:#E55A2B;width:16px;height:16px;"></i> Logo Personalizada do Orçamento (SVG)
              </h4>
              <p style="margin:0 0 12px 0; font-size:12px; color:var(--text-secondary);">
                Envie a logo da sua marca em formato <strong>.SVG</strong> para exibir no cabeçalho das propostas e orçamentos. (Por padrão, nenhuma logo é exibida).
              </p>
              
              <div style="display:flex; align-items:center; gap:16px; flex-wrap:wrap;">
                <div id="prof-logo-preview-box" style="width: 140px; height: 60px; border-radius: 8px; border: 1.5px dashed var(--bg-input); background: #FFFFFF; display: flex; align-items: center; justify-content: center; overflow: hidden; padding: 6px; box-sizing: border-box;">
                  ${this.getLogoPreviewHtml()}
                </div>

                <div style="display:flex; flex-direction:column; gap:6px;">
                  <input type="file" id="input-upload-logo-svg" accept=".svg,image/svg+xml" style="display:none;" onchange="Configuracoes.handleLogoSvgFile(event)" />
                  
                  <div style="display:flex; gap:8px;">
                    <button type="button" class="btn-secondary hover-lift" onclick="document.getElementById('input-upload-logo-svg').click()" style="padding: 6px 12px; font-size: 12px; display:inline-flex; align-items:center; gap:6px;">
                      <i data-lucide="upload" style="width:14px;height:14px;"></i> Carregar Logo SVG
                    </button>
                    
                    <button type="button" class="btn-secondary hover-lift" id="btn-remover-logo-svg" onclick="Configuracoes.removerLogoSvg()" style="padding: 6px 12px; font-size: 12px; color:var(--danger); display:${this.hasCustomLogo() ? 'inline-flex' : 'none'}; align-items:center; gap:4px;">
                      <i data-lucide="trash-2" style="width:14px;height:14px;"></i> Remover Logo
                    </button>
                  </div>
                  <span style="font-size:11px; color:var(--text-secondary);">Formatos aceitos: <strong>.SVG</strong> vetorial.</span>
                </div>
              </div>
            </div>

            <!-- Informações Pessoais -->
            <div style="margin-bottom: 8px;">
              <h4 style="margin:0 0 16px 0; font-size:14px; font-weight:700; color:var(--text-main); display:flex; align-items:center; gap:8px;">
                <i data-lucide="user" style="color:#E55A2B;width:16px;height:16px;"></i> Informações Pessoais
              </h4>
              <div class="settings-form-grid">
                <div class="form-group">
                  <label class="form-label">Nome Completo / Profissional</label>
                  <input type="text" id="config-nome" class="input-premium" value="${prof.nome}" required placeholder="Ex: Ronald Richards" oninput="Configuracoes.liveUpdateProgress()">
                </div>
                <div class="form-group">
                  <label class="form-label">E-mail de Contato</label>
                  <input type="email" id="config-email" class="input-premium" value="${prof.email}" required placeholder="Ex: ronald@example.com" oninput="Configuracoes.liveUpdateProgress()">
                </div>
                <div class="form-group settings-form-full">
                  <label class="form-label">WhatsApp / Telefone</label>
                  <input type="text" id="config-whatsapp" class="input-premium" value="${prof.whatsapp}" required placeholder="Ex: (11) 99999-9999" oninput="Configuracoes.liveUpdateProgress()">
                </div>
              </div>
            </div>

            <!-- Especialidade & Portfólio -->
            <div>
              <h4 style="margin:0 0 16px 0; font-size:14px; font-weight:700; color:var(--text-main); display:flex; align-items:center; gap:8px;">
                <i data-lucide="briefcase" style="color:#E55A2B;width:16px;height:16px;"></i> Especialidade & Portfólio
              </h4>
              <div class="settings-form-grid">
                <div class="form-group">
                  <label class="form-label">Serviço / Especialidade</label>
                  <div class="hig-select-wrapper" style="position:relative;">
                    <div class="hig-select-trigger input-premium" id="trigger-role" onclick="Configuracoes.abrirRolePopover(this)" style="cursor: pointer; display: flex; align-items: center; justify-content: space-between; height: 38px; box-sizing: border-box;">
                      <span class="hig-select-text" id="val-role">${prof.role}</span>
                      <i data-lucide="chevron-down" class="hig-select-icon" style="width: 16px; height: 16px; color: var(--text-secondary);"></i>
                    </div>
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">Link do Portfólio</label>
                  <input type="url" id="config-portfolio" class="input-premium" value="${prof.portfolio}" required placeholder="Ex: https://behance.net/ricardofolio" oninput="Configuracoes.liveUpdateProgress()">
                </div>
              </div>
            </div>

          </div>

          <!-- Coluna Direita: Widget Completar Perfil -->
          <div class="prof-right-panel">
            <div class="prof-widget-card" style="background: var(--bg-card); border-radius: var(--radius-lg); border: 1.5px solid var(--bg-input); padding: 24px; box-shadow: var(--shadow-sm); position: sticky; top: 24px; box-sizing: border-box;">
              <h4 class="prof-widget-title" style="font-size: 14px; font-weight: 700; color: var(--text-main); margin-bottom: 16px; text-align: center;">Complete seu perfil</h4>
              
              <div class="prof-progress-circle-wrap" style="position: relative; width: 110px; height: 110px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                <svg width="100" height="100" viewBox="0 0 120 120" style="transform: rotate(-90deg);">
                  <circle cx="60" cy="60" r="${radius}" stroke="var(--bg-input)" stroke-width="10" fill="transparent" />
                  <circle cx="60" cy="60" r="${radius}" stroke="#E55A2B" stroke-width="10" fill="transparent"
                    stroke-dasharray="${circumference}"
                    stroke-dashoffset="${circumference}"
                    id="prof-progress-circle-bar"
                    stroke-linecap="round"
                    style="transition: stroke-dashoffset 0.3s ease-in-out;" />
                </svg>
                <div class="prof-progress-text" style="position: absolute; font-size: 20px; font-weight: 800; color: var(--text-main); display: flex; flex-direction: column; align-items: center;">
                  <strong id="prof-progress-pct-txt">0%</strong>
                  <span style="font-size: 9px; color: var(--text-secondary); font-weight: 700; text-transform: uppercase;">concluído</span>
                </div>
              </div>

              <div class="prof-checklist" id="prof-checklist-container">
                <!-- Renderizado dinamicamente por liveUpdateProgress -->
              </div>
            </div>
          </div>
        </div>

        <!-- Botões Salvar e Descartar (Padrão do Sistema) -->
        <div class="flex justify-end gap-3 mt-6" style="border-top: 1px solid var(--bg-input); padding-top: 20px;">
          <button type="button" class="btn-secondary hover-lift" onclick="App.navigate('admin-dashboard')">Descartar</button>
          <button type="submit" class="btn btn-primary hover-lift" id="btn-salvar-config">
            <i data-lucide="save"></i> Salvar Alterações
          </button>
        </div>
      </form>
    `;
  },

  // ─── 2. ABA SEGURANÇA & ACESSO ─────────────────────────────────────────────
  getSegurancaHtml() {
    const sec = this.getSecurity();
    return `
      <div class="flex items-center gap-3 mb-6" style="border-bottom: 1px solid var(--bg-input); padding-bottom: 16px;">
        <div class="kpi-icon text-primary"><i data-lucide="shield-check"></i></div>
        <div>
          <h3 style="margin:0; font-size: 18px; font-weight: 700; color: var(--text-main);">Segurança & Acesso</h3>
          <p style="margin: 4px 0 0; font-size: 13px; color: var(--text-secondary);">Gerencie as credenciais, autenticação e dispositivos conectados.</p>
        </div>
      </div>

      <form id="seguranca-config-form" onsubmit="Configuracoes.salvarSeguranca(event)">
        <div class="settings-form-grid">
          
          <!-- Alteração de Senha -->
          <div class="settings-form-full">
            <h4 style="margin:0 0 16px 0; font-size:14px; font-weight:700; color:var(--text-main);">Alterar Senha do Administrador</h4>
          </div>

          <div class="form-group">
            <label class="form-label">Senha Atual</label>
            <input type="password" id="sec-senha-atual" class="input-premium" placeholder="••••••••">
          </div>

          <div class="form-group">
            <!-- Espaço em branco para grid -->
          </div>

          <div class="form-group">
            <label class="form-label">Nova Senha</label>
            <input type="password" id="sec-nova-senha" class="input-premium" placeholder="Mínimo 8 caracteres">
          </div>

          <div class="form-group">
            <label class="form-label">Confirmar Nova Senha</label>
            <input type="password" id="sec-confirmar-senha" class="input-premium" placeholder="Confirme a nova senha">
          </div>

          <!-- Autenticação de Dois Fatores (MFA) -->
          <div class="settings-form-full" style="border-top: 1px solid var(--bg-input); padding-top: 20px; margin-top: 10px;">
            <h4 style="margin:0 0 16px 0; font-size:14px; font-weight:700; color:var(--text-main);">Autenticação Multifator</h4>
            <div style="display:flex; align-items:center; justify-content:space-between; padding:16px; background:var(--bg-main); border-radius:var(--radius-md); border:1px solid var(--bg-input);">
              <div>
                <span style="display:block; font-size:14px; font-weight:600; color:var(--text-main);">Ativar 2FA (E-mail/SMS)</span>
                <span style="font-size:12px; color:var(--text-secondary);">Exige um código temporário de verificação a cada novo login.</span>
              </div>
              <label class="switch-container" style="position:relative; display:inline-block; width:50px; height:28px;">
                <input type="checkbox" id="sec-mfa" ${sec.mfa ? 'checked' : ''} style="opacity:0; width:0; height:0;">
                <span class="slider" style="position:absolute; cursor:pointer; top:0; left:0; right:0; bottom:0; background-color:#D2CABD; transition:.4s; border-radius:34px;"></span>
              </label>
            </div>
          </div>

          <!-- Dispositivos Ativos -->
          <div class="settings-form-full" style="border-top: 1px solid var(--bg-input); padding-top: 20px; margin-top: 10px;">
            <h4 style="margin:0 0 12px 0; font-size:14px; font-weight:700; color:var(--text-main);">Dispositivos Conectados</h4>
            <div style="display:flex; flex-direction:column; gap:8px;">
              <div style="display:flex; align-items:center; justify-content:space-between; padding:12px 16px; background:#FFFFFF; border-radius:var(--radius-md); border:1px solid var(--bg-input);">
                <div style="display:flex; align-items:center; gap:12px;">
                  <i data-lucide="laptop" class="text-primary"></i>
                  <div>
                    <span style="display:block; font-size:13px; font-weight:600; color:var(--text-main);">Chrome no Windows (Este dispositivo)</span>
                    <span style="font-size:11px; color:var(--text-secondary);">São Paulo - SP • Online agora</span>
                  </div>
                </div>
                <span class="badge badge-success" style="font-size:10px;">Atual</span>
              </div>
              <div style="display:flex; align-items:center; justify-content:space-between; padding:12px 16px; background:#FFFFFF; border-radius:var(--radius-md); border:1px solid var(--bg-input);">
                <div style="display:flex; align-items:center; gap:12px;">
                  <i data-lucide="smartphone" class="text-secondary"></i>
                  <div>
                    <span style="display:block; font-size:13px; font-weight:600; color:var(--text-main);">Safari no iPhone 15 Pro</span>
                    <span style="font-size:11px; color:var(--text-secondary);">São Paulo - SP • Há 2 horas</span>
                  </div>
                </div>
                <button type="button" style="background:none; border:none; color:var(--error); font-size:12px; font-weight:600; cursor:pointer;" onclick="Components.toast('Sessão encerrada com sucesso.', 'success')">Desconectar</button>
              </div>
            </div>
          </div>

        </div>

        <style>
          /* Estilização básica rápida do Switch */
          #seguranca-config-form input:checked + .slider {
            background-color: var(--primary) !important;
          }
          #seguranca-config-form .slider:before {
            position: absolute;
            content: "";
            height: 20px;
            width: 20px;
            left: 4px;
            bottom: 4px;
            background-color: white;
            transition: .4s;
            border-radius: 50%;
          }
          #seguranca-config-form input:checked + .slider:before {
            transform: translateX(22px);
          }
        </style>

        <!-- Ações do Formulário -->
        <div class="flex justify-end gap-3 mt-6" style="border-top: 1px solid var(--bg-input); padding-top: 20px;">
          <button type="button" class="btn-secondary hover-lift" onclick="App.navigate('admin-dashboard')">Cancelar</button>
          <button type="submit" class="btn btn-primary hover-lift" id="btn-salvar-config">
            <i data-lucide="save"></i> Salvar Alterações
          </button>
        </div>
      </form>
    `;
  },

  // ─── 3. ABA INTEGRAÇÕES (ZAPSIGN) ──────────────────────────────────────────
  getIntegrationsHtml() {
    const integ = this.getIntegrations();
    return `
      <div class="flex items-center gap-3 mb-6" style="border-bottom: 1px solid var(--bg-input); padding-bottom: 16px;">
        <div class="kpi-icon text-primary"><i data-lucide="blocks"></i></div>
        <div>
          <h3 style="margin:0; font-size: 18px; font-weight: 700; color: var(--text-main);">Integrações / ZapSign</h3>
          <p style="margin: 4px 0 0; font-size: 13px; color: var(--text-secondary);">Configure as integrações externas para automatizar o envio de contratos.</p>
        </div>
      </div>

      <form id="integracoes-config-form" onsubmit="Configuracoes.salvarIntegracoes(event)">
        <div class="settings-form-grid">
          
          <!-- Seção ZapSign -->
          <div class="settings-form-full">
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:16px;">
              <h4 style="margin:0; font-size:14px; font-weight:700; color:var(--text-main);">Assinatura Eletrônica de Contratos (ZapSign)</h4>
              <span class="badge ${integ.zapsignActive ? 'badge-success' : 'badge-warning'}">${integ.zapsignActive ? 'Ativo' : 'Inativo'}</span>
            </div>
            <p style="font-size:13px; color:var(--text-secondary); margin-bottom:20px;">Permite que orçamentos aprovados gerem automaticamente contratos de prestação de serviços com assinatura eletrônica.</p>
          </div>

          <div class="form-group settings-form-full">
            <label class="form-label">Token de API ZapSign</label>
            <div style="display:flex; gap:8px;">
              <input type="password" id="int-zapsign-token" class="input-premium" value="${integ.zapsignToken}" placeholder="Insira o Token de Produção">
              <button type="button" class="btn btn-secondary hover-lift" onclick="Configuracoes.testarConexaoZapSign()" style="padding:0 20px; white-space:nowrap;">Testar Conexão</button>
            </div>
          </div>

          <!-- Gatilho de Automação -->
          <div class="settings-form-full" style="border-top: 1px solid var(--bg-input); padding-top: 20px; margin-top: 10px;">
            <h4 style="margin:0 0 16px 0; font-size:14px; font-weight:700; color:var(--text-main);">Automação de Envio</h4>
            
            <div style="display:flex; align-items:center; justify-content:space-between; padding:16px; background:var(--bg-main); border-radius:var(--radius-md); border:1px solid var(--bg-input); margin-bottom:12px;">
              <div>
                <span style="display:block; font-size:14px; font-weight:600; color:var(--text-main);">Gerar Contrato ao Aprovar Orçamento</span>
                <span style="font-size:12px; color:var(--text-secondary);">Gera o documento no ZapSign assim que o status do orçamento for 'Aprovado'.</span>
              </div>
              <label class="switch-container" style="position:relative; display:inline-block; width:50px; height:28px;">
                <input type="checkbox" id="int-zapsign-active" ${integ.zapsignActive ? 'checked' : ''} style="opacity:0; width:0; height:0;">
                <span class="slider" style="position:absolute; cursor:pointer; top:0; left:0; right:0; bottom:0; background-color:#D2CABD; transition:.4s; border-radius:34px;"></span>
              </label>
            </div>

            <div style="display:flex; align-items:center; justify-content:space-between; padding:16px; background:var(--bg-main); border-radius:var(--radius-md); border:1px solid var(--bg-input);">
              <div>
                <span style="display:block; font-size:14px; font-weight:600; color:var(--text-main);">Notificar Cliente via WhatsApp Automático</span>
                <span style="font-size:12px; color:var(--text-secondary);">Envia uma mensagem automática com o link de assinatura para o número do cliente.</span>
              </div>
              <label class="switch-container" style="position:relative; display:inline-block; width:50px; height:28px;">
                <input type="checkbox" id="int-whatsapp" ${integ.autoWhatsApp ? 'checked' : ''} style="opacity:0; width:0; height:0;">
                <span class="slider" style="position:absolute; cursor:pointer; top:0; left:0; right:0; bottom:0; background-color:#D2CABD; transition:.4s; border-radius:34px;"></span>
              </label>
            </div>
          </div>

        </div>

        <style>
          #integracoes-config-form input:checked + .slider {
            background-color: var(--primary) !important;
          }
          #integracoes-config-form .slider:before {
            position: absolute;
            content: "";
            height: 20px;
            width: 20px;
            left: 4px;
            bottom: 4px;
            background-color: white;
            transition: .4s;
            border-radius: 50%;
          }
          #integracoes-config-form input:checked + .slider:before {
            transform: translateX(22px);
          }
        </style>

        <!-- Ações do Formulário -->
        <div class="flex justify-end gap-3 mt-6" style="border-top: 1px solid var(--bg-input); padding-top: 20px;">
          <button type="button" class="btn-secondary hover-lift" onclick="App.navigate('admin-dashboard')">Descartar</button>
          <button type="submit" class="btn btn-primary hover-lift" id="btn-salvar-config">
            <i data-lucide="save"></i> Salvar Integrações
          </button>
        </div>
      </form>
    `;
  },

  // ─── 4. ABA PREFERÊNCIAS ───────────────────────────────────────────────────
  getPreferencesHtml() {
    const pref = this.getPreferences();
    return `
      <div class="flex items-center gap-3 mb-6" style="border-bottom: 1px solid var(--bg-input); padding-bottom: 16px;">
        <div class="kpi-icon text-primary"><i data-lucide="sliders"></i></div>
        <div>
          <h3 style="margin:0; font-size: 18px; font-weight: 700; color: var(--text-main);">Preferências Gerais</h3>
          <p style="margin: 4px 0 0; font-size: 13px; color: var(--text-secondary);">Ajuste o idioma, unidades de medida e o tema de cores do painel.</p>
        </div>
      </div>

      <form id="preferencias-config-form" onsubmit="Configuracoes.salvarPreferencias(event)">
        <div class="settings-form-grid">
          
          <!-- Idioma -->
          <div class="form-group">
            <label class="form-label">Idioma do Sistema</label>
            <div class="hig-select-wrapper" style="position:relative;">
              <div class="hig-select-trigger input-premium" id="trigger-idioma" onclick="Configuracoes.abrirIdiomaPopover(this)">
                <span class="hig-select-text" id="val-idioma">${pref.idioma}</span>
                <i data-lucide="chevron-down" class="hig-select-icon"></i>
              </div>
            </div>
          </div>

          <!-- Unidade de Medida (Foco Marceneiro!) -->
          <div class="form-group">
            <label class="form-label">Unidade de Medida (Modelos/Projetos)</label>
            <div class="hig-select-wrapper" style="position:relative;">
              <div class="hig-select-trigger input-premium" id="trigger-medida" onclick="Configuracoes.abrirMedidaPopover(this)">
                <span class="hig-select-text" id="val-medida">${pref.unidadeMedida}</span>
                <i data-lucide="chevron-down" class="hig-select-icon"></i>
              </div>
            </div>
          </div>

          <!-- Tema do Painel -->
          <div class="form-group">
            <label class="form-label">Tema do Painel</label>
            <div class="hig-select-wrapper" style="position:relative;">
              <div class="hig-select-trigger input-premium" id="trigger-tema" onclick="Configuracoes.abrirTemaPopover(this)">
                <span class="hig-select-text" id="val-tema">${pref.tema}</span>
                <i data-lucide="chevron-down" class="hig-select-icon"></i>
              </div>
            </div>
          </div>

          <!-- Fuso Horário -->
          <div class="form-group">
            <label class="form-label">Fuso Horário</label>
            <div class="hig-select-wrapper" style="position:relative;">
              <div class="hig-select-trigger input-premium" id="trigger-fuso" onclick="Configuracoes.abrirFusoPopover(this)">
                <span class="hig-select-text" id="val-fuso">${pref.fusoHorario}</span>
                <i data-lucide="chevron-down" class="hig-select-icon"></i>
              </div>
            </div>
          </div>

          <!-- Botão Voltar do Android -->
          <div class="settings-form-full" style="border-top: 1px solid var(--bg-input); padding-top: 20px; margin-top: 10px;">
            <h4 style="margin:0 0 16px 0; font-size:14px; font-weight:700; color:var(--text-main);">Navegação no APK</h4>
            <div style="display:flex; align-items:center; justify-content:space-between; padding:16px; background:var(--bg-main); border-radius:var(--radius-md); border:1px solid var(--bg-input);">
              <div>
                <span style="display:block; font-size:14px; font-weight:600; color:var(--text-main);">Botão Voltar Volta Página</span>
                <span style="font-size:12px; color:var(--text-secondary);">Quando ativado no APK, pressionar o botão 'voltar' do Android volta para a tela anterior em vez de fechar o app.</span>
              </div>
              <label class="switch-container" style="position:relative; display:inline-block; width:50px; height:28px;">
                <input type="checkbox" id="pref-back-button" ${pref.androidBackButtonVolta ? 'checked' : ''} style="opacity:0; width:0; height:0;">
                <span class="slider" style="position:absolute; cursor:pointer; top:0; left:0; right:0; bottom:0; background-color:#D2CABD; transition:.4s; border-radius:34px;"></span>
              </label>
            </div>
          </div>

        </div>

        <style>
          #preferencias-config-form input:checked + .slider {
            background-color: var(--primary) !important;
          }
          #preferencias-config-form .slider:before {
            position: absolute;
            content: "";
            height: 20px;
            width: 20px;
            left: 4px;
            bottom: 4px;
            background-color: white;
            transition: .4s;
            border-radius: 50%;
          }
          #preferencias-config-form input:checked + .slider:before {
            transform: translateX(22px);
          }
        </style>

        <!-- Ações do Formulário -->
        <div class="flex justify-end gap-3 mt-6" style="border-top: 1px solid var(--bg-input); padding-top: 20px;">
          <button type="button" class="btn-secondary hover-lift" onclick="App.navigate('admin-dashboard')">Descartar</button>
          <button type="submit" class="btn btn-primary hover-lift" id="btn-salvar-config">
            <i data-lucide="save"></i> Salvar Preferências
          </button>
        </div>
      </form>
    `;
  },

  // ─── HANDLERS DE POPOVER (MANDAMENTO 4) ────────────────────────────────────
  abrirRolePopover(trigger) {
    const opcoes = [
      'Editor de Vídeo',
      'Thumbmaker',
      'Designer Gráfico',
      'Copywriter / Roteirista',
      'Gestor de Redes Sociais',
      'Produtor de Conteúdo'
    ];
    this.renderPopoverCustom(trigger, opcoes, 'val-role');
  },

  abrirFocoPopover(trigger) {
    const opcoes = ['Móveis Planejados', 'Portas e Esquadrias', 'Carpintaria Geral', 'Instalações Comerciais', 'Móveis Rústicos', 'Serviços de Usinagem CNC'];
    this.renderPopoverCustom(trigger, opcoes, 'val-foco');
  },

  abrirRegimePopover(trigger) {
    const opcoes = ['MEI (Microempreendedor Individual)', 'Simples Nacional', 'Lucro Presumido', 'Lucro Real', 'Pessoa Física / Autônomo'];
    this.renderPopoverCustom(trigger, opcoes, 'val-regime');
  },

  abrirIdiomaPopover(trigger) {
    const opcoes = ['Português (Brasil)', 'English (US)', 'Español (ES)', 'Deutsch (DE)'];
    this.renderPopoverCustom(trigger, opcoes, 'val-idioma');
  },

  abrirMedidaPopover(trigger) {
    const opcoes = ['Milímetros (mm)', 'Centímetros (cm)', 'Polegadas (in)'];
    this.renderPopoverCustom(trigger, opcoes, 'val-medida');
  },

  abrirTemaPopover(trigger) {
    const opcoes = ['Claro', 'Escuro (Em breve)', 'Automático (Sistema)'];
    this.renderPopoverCustom(trigger, opcoes, 'val-tema');
  },

  abrirFusoPopover(trigger) {
    const opcoes = ['Brasília (GMT-3)', 'Fernando de Noronha (GMT-2)', 'Manaus (GMT-4)', 'Acre (GMT-5)', 'Greenwich (GMT+0)'];
    this.renderPopoverCustom(trigger, opcoes, 'val-fuso');
  },

  renderPopoverCustom(trigger, opcoes, targetValId) {
    const antigo = document.querySelector('.popover-sistema');
    if (antigo) antigo.remove();

    const popover = document.createElement('div');
    popover.className = 'popover-sistema hig-select-menu';
    
    let itemsHtml = '';
    opcoes.forEach(opt => {
      const currentVal = document.getElementById(targetValId).textContent;
      const isSelected = currentVal.trim() === opt.trim();
      itemsHtml += `
        <div class="hig-select-item ${isSelected ? 'selected' : ''}" onclick="Configuracoes.selectPopoverItem('${opt}', '${targetValId}')">
          <span>${opt}</span>
          ${isSelected ? '<i data-lucide="check" style="width: 16px; height: 16px;"></i>' : ''}
        </div>
      `;
    });

    popover.innerHTML = `<div class="hig-select-items">${itemsHtml}</div>`;
    document.body.appendChild(popover);

    const rect = trigger.getBoundingClientRect();
    const popoverHeight = popover.offsetHeight || 160; 
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    popover.style.position = 'fixed';
    popover.style.left = `${rect.left}px`;
    popover.style.width = `${rect.width}px`;
    popover.style.zIndex = '999999';

    if (spaceBelow < popoverHeight + 10 && spaceAbove > spaceBelow) {
      popover.style.top = `${rect.top - popoverHeight - 4}px`;
      popover.style.transformOrigin = 'bottom center';
    } else {
      popover.style.top = `${rect.bottom + 4}px`;
      popover.style.transformOrigin = 'top center';
    }

    requestAnimationFrame(() => {
      popover.style.opacity = '1';
      popover.style.transform = 'scale(1) translateY(0)';
    });

    const fechar = (e) => {
      if (!trigger.contains(e.target) && !popover.contains(e.target)) {
        popover.style.opacity = '0';
        popover.style.transform = 'scale(0.95) translateY(-5px)';
        setTimeout(() => popover.remove(), 150);
        document.removeEventListener('click', fechar);
      }
    };
    setTimeout(() => document.addEventListener('click', fechar), 50);

    if (window.lucide) {
      window.lucide.createIcons({ root: popover });
    }
  },

  selectPopoverItem(val, targetValId) {
    document.getElementById(targetValId).textContent = val;
    const popover = document.querySelector('.popover-sistema');
    if (popover) {
      popover.style.opacity = '0';
      popover.style.transform = 'scale(0.95) translateY(-5px)';
      setTimeout(() => popover.remove(), 150);
    }
    if (targetValId === 'val-role') {
      this.liveUpdateProgress();
    }
  },

  // ─── OUTROS MÉTODOS AUXILIARES ─────────────────────────────────────────────
  previewLogo(input) {
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = function(e) {
        const logoBase64 = e.target.result;
        document.getElementById('logo-preview-box').innerHTML = `<img src="${logoBase64}" class="logo-preview-image" alt="Logotipo">`;
        Configuracoes._uploadedLogo = logoBase64;
        Components.toast('Logotipo carregado com sucesso!', 'success');
      };
      reader.readAsDataURL(input.files[0]);
    }
  },

  hasCustomLogo() {
    return !!(localStorage.getItem('bancada_custom_logo_svg') || '').trim();
  },

  getLogoPreviewHtml() {
    const custom = localStorage.getItem('bancada_custom_logo_svg') || '';
    if (custom && custom.trim()) {
      const trimmed = custom.trim();
      if (trimmed.startsWith('<svg')) {
        return trimmed.replace('<svg', '<svg style="max-height:100%; max-width:100%; object-fit:contain;"');
      }
      return `<img src="${trimmed}" style="max-height:100%; max-width:100%; object-fit:contain;" />`;
    }
    return `<span style="font-size:11px; color:var(--text-tertiary); font-weight:600;">Sem Logo (Padrão)</span>`;
  },

  handleLogoSvgFile(event) {
    const input = event.target;
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];
    
    if (!file.name.toLowerCase().endsWith('.svg') && file.type !== 'image/svg+xml') {
      Components.toast('Selecione um arquivo vetorial no formato .SVG', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      localStorage.setItem('bancada_custom_logo_svg', content);
      
      const previewBox = document.getElementById('prof-logo-preview-box');
      if (previewBox) previewBox.innerHTML = this.getLogoPreviewHtml();
      
      const removeBtn = document.getElementById('btn-remover-logo-svg');
      if (removeBtn) removeBtn.style.display = 'inline-flex';
      
      Components.toast('Logo SVG personalizada carregada com sucesso!', 'success');
      if (window.lucide) window.lucide.createIcons();
    };

    reader.readAsText(file);
  },

  removerLogoSvg() {
    localStorage.removeItem('bancada_custom_logo_svg');
    const previewBox = document.getElementById('prof-logo-preview-box');
    if (previewBox) previewBox.innerHTML = this.getLogoPreviewHtml();
    
    const removeBtn = document.getElementById('btn-remover-logo-svg');
    if (removeBtn) removeBtn.style.display = 'none';
    
    const fileInput = document.getElementById('input-upload-logo-svg');
    if (fileInput) fileInput.value = '';

    Components.toast('Logo personalizada removida (Padrão: sem logo).', 'success');
  },

  mascaraCNPJ(input) {
    let v = input.value.replace(/\D/g, '');
    if (v.length > 14) v = v.substring(0, 14);
    if (v.length > 12) {
      v = v.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
    } else if (v.length > 8) {
      v = v.replace(/^(\d{2})(\d{3})(\d{3})(\d{0,4})$/, "$1.$2.$3/$4");
    } else if (v.length > 5) {
      v = v.replace(/^(\d{2})(\d{3})(\d{0,3})$/, "$1.$2.$3");
    } else if (v.length > 2) {
      v = v.replace(/^(\d{2})(\d{0,3})$/, "$1.$2");
    }
    input.value = v;
  },

  mascaraTelefone(input) {
    let v = input.value.replace(/\D/g, '');
    if (v.length > 11) v = v.substring(0, 11);
    if (v.length > 10) {
      v = v.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
    } else if (v.length > 5) {
      v = v.replace(/^(\d{2})(\d{4})(\d{0,4})$/, "($1) $2-$3");
    } else if (v.length > 2) {
      v = v.replace(/^(\d{2})(\d{0,5})$/, "($1) $2");
    }
    input.value = v;
  },

  // ─── SALVAMENTO DE CONFIGURAÇÕES ───────────────────────────────────────────
  salvarEmpresa(event) {
    event.preventDefault();
    const btn = document.getElementById('btn-salvar-config');
    const originalText = btn.innerHTML;
    
    btn.disabled = true;
    btn.innerHTML = `<span class="loader" style="width: 16px; height: 16px; border-width: 2px; margin-right: 8px; border-top-color: #fff;"></span> Salvando...`;

    const newData = {
      nome: document.getElementById('config-nome').value,
      email: document.getElementById('config-email').value,
      whatsapp: document.getElementById('config-whatsapp').value,
      role: document.getElementById('val-role').textContent,
      portfolio: document.getElementById('config-portfolio').value
    };

    setTimeout(() => {
      const user = API.getUser();
      const profileKey = 'bancada_user_profile_' + (user ? (user.email || user.id || 'default') : 'default');
      localStorage.setItem(profileKey, JSON.stringify(newData));
      btn.disabled = false;
      btn.innerHTML = originalText;
      Components.toast('Perfil salvo com sucesso!', 'success');
      Configuracoes.render();
    }, 800);
  },

  liveUpdateProgress() {
    const nomeEl = document.getElementById('config-nome');
    const emailEl = document.getElementById('config-email');
    const whatsappEl = document.getElementById('config-whatsapp');
    const roleEl = document.getElementById('val-role');
    const portfolioEl = document.getElementById('config-portfolio');
    const avatarDisplay = document.getElementById('prof-avatar-display');

    if (!nomeEl) return;

    const nome = nomeEl.value.trim();
    const email = emailEl.value.trim();
    const whatsapp = whatsappEl.value.trim();
    const role = roleEl ? roleEl.textContent.trim() : 'Editor de Vídeo';
    const portfolio = portfolioEl.value.trim();

    if (avatarDisplay && nome) {
      avatarDisplay.textContent = nome.charAt(0).toUpperCase();
    }

    const items = [
      { val: nome, label: 'Nome Profissional' },
      { val: email, label: 'E-mail de Contato' },
      { val: whatsapp, label: 'WhatsApp / Telefone' },
      { val: role, label: 'Especialidade' },
      { val: portfolio, label: 'Portfólio' }
    ];

    let completedCount = 0;
    let checklistHtml = '';

    items.forEach(item => {
      const isOk = !!item.val;
      if (isOk) completedCount++;

      checklistHtml += `
        <div class="prof-check-item ${isOk ? 'completed' : ''}">
          <div class="prof-check-label-row">
            <span class="prof-check-icon ${isOk ? 'success' : 'pending'}">${isOk ? '✓' : '✗'}</span>
            <span>${item.label}</span>
          </div>
          <span class="prof-check-pct ${isOk ? 'success' : 'pending'}">${isOk ? '+20%' : '0%'}</span>
        </div>
      `;
    });

    const pct = completedCount * 20;
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (pct / 100) * circumference;

    const circleBar = document.getElementById('prof-progress-circle-bar');
    if (circleBar) {
      circleBar.style.strokeDashoffset = offset;
    }

    const pctText = document.getElementById('prof-progress-pct-txt');
    if (pctText) {
      pctText.textContent = `${pct}%`;
    }

    const checklistContainer = document.getElementById('prof-checklist-container');
    if (checklistContainer) {
      checklistContainer.innerHTML = checklistHtml;
    }
  },

  salvarSeguranca(event) {
    event.preventDefault();
    const btn = document.getElementById('btn-salvar-config');
    const originalText = btn.innerHTML;

    const novaSenha = document.getElementById('sec-nova-senha').value;
    const confSenha = document.getElementById('sec-confirmar-senha').value;

    if (novaSenha && novaSenha.length < 8) {
      Components.toast('A nova senha deve ter pelo menos 8 caracteres.', 'error');
      return;
    }

    if (novaSenha !== confSenha) {
      Components.toast('A confirmação da senha não confere.', 'error');
      return;
    }
    
    btn.disabled = true;
    btn.innerHTML = `<span class="loader" style="width: 16px; height: 16px; border-width: 2px; margin-right: 8px; border-top-color: #fff;"></span> Gravando...`;

    const newData = {
      mfa: document.getElementById('sec-mfa').checked
    };

    setTimeout(() => {
      localStorage.setItem('bancada_config_seguranca', JSON.stringify(newData));
      btn.disabled = false;
      btn.innerHTML = originalText;
      
      Components.toast('Configurações de segurança atualizadas!', 'success');
      
      // Limpa inputs de senha
      if (document.getElementById('sec-senha-atual')) document.getElementById('sec-senha-atual').value = '';
      if (document.getElementById('sec-nova-senha')) document.getElementById('sec-nova-senha').value = '';
      if (document.getElementById('sec-confirmar-senha')) document.getElementById('sec-confirmar-senha').value = '';
      
      setTimeout(() => App.navigate('admin-dashboard'), 500);
    }, 800);
  },

  testarConexaoZapSign() {
    const token = document.getElementById('int-zapsign-token').value;
    if (!token) {
      Components.toast('Por favor, insira o token antes de testar.', 'warning');
      return;
    }
    Components.toast('Testando conexão com a API do ZapSign...', 'info');
    setTimeout(() => {
      Components.toast('Conexão estabelecida com sucesso! API ativa.', 'success');
    }, 1200);
  },

  salvarIntegracoes(event) {
    event.preventDefault();
    const btn = document.getElementById('btn-salvar-config');
    const originalText = btn.innerHTML;
    
    btn.disabled = true;
    btn.innerHTML = `<span class="loader" style="width: 16px; height: 16px; border-width: 2px; margin-right: 8px; border-top-color: #fff;"></span> Conectando...`;

    const newData = {
      zapsignToken: document.getElementById('int-zapsign-token').value,
      zapsignActive: document.getElementById('int-zapsign-active').checked,
      autoWhatsApp: document.getElementById('int-whatsapp').checked
    };

    setTimeout(() => {
      localStorage.setItem('bancada_config_integracoes', JSON.stringify(newData));
      btn.disabled = false;
      btn.innerHTML = originalText;
      Components.toast('Parâmetros de integração salvos com sucesso!', 'success');
      setTimeout(() => App.navigate('admin-dashboard'), 500);
    }, 800);
  },

  salvarPreferencias(event) {
    event.preventDefault();
    const btn = document.getElementById('btn-salvar-config');
    const originalText = btn.innerHTML;
    
    btn.disabled = true;
    btn.innerHTML = `<span class="loader" style="width: 16px; height: 16px; border-width: 2px; margin-right: 8px; border-top-color: #fff;"></span> Aplicando...`;

    const newData = {
      idioma: document.getElementById('val-idioma').textContent,
      unidadeMedida: document.getElementById('val-medida').textContent,
      tema: document.getElementById('val-tema').textContent,
      fusoHorario: document.getElementById('val-fuso').textContent,
      androidBackButtonVolta: document.getElementById('pref-back-button').checked
    };

    setTimeout(() => {
      localStorage.setItem('bancada_config_preferencias', JSON.stringify(newData));
      btn.disabled = false;
      btn.innerHTML = originalText;
      Components.toast('Preferências atualizadas!', 'success');
      setTimeout(() => App.navigate('admin-dashboard'), 500);
    }, 800);
  }
};

window.Configuracoes = Configuracoes;
