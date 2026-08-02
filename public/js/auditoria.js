/**
 * Auditoria Module - Visualização de Logs de Segurança
 * Bancada Design System compliance (Variables, Lucide, Cascade Animations, Modals)
 */
const Auditoria = {
  logs: [],
  searchTerm: '',

  async render() {
    const pageContainer = document.getElementById('page-container');
    if (!pageContainer) return;

    // Layout base da aba com Grid Responsivo
    pageContainer.innerHTML = `
      <style>
        .auditoria-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
          padding: 8px 0;
          font-family: var(--font-main);
        }
        
        /* Grid responsivo para os cards de estatísticas */
        .auditoria-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
        }
        
        .auditoria-card {
          background: var(--bg-card);
          border: 1px solid var(--separator);
          border-radius: var(--radius-lg);
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: var(--shadow-sm);
          transition: var(--transition);
        }
        
        .auditoria-card-icon {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-md);
          background: var(--primary-light);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .auditoria-card-icon.danger {
          background: rgba(239, 68, 68, 0.08);
          color: var(--error);
        }

        .auditoria-card-icon.success {
          background: rgba(16, 185, 129, 0.08);
          color: var(--success);
        }
        
        .auditoria-card-info h3 {
          font-size: 13px;
          color: var(--text-secondary);
          font-weight: 500;
          margin-bottom: 4px;
        }
        
        .auditoria-card-info p {
          font-size: 24px;
          color: var(--text-main);
          font-weight: 700;
        }
        
        /* Seção de filtros e pesquisa */
        .auditoria-actions-bar {
          display: flex;
          gap: 16px;
          align-items: center;
          justify-content: space-between;
          background: var(--bg-card);
          border: 1px solid var(--separator);
          border-radius: var(--radius-md);
          padding: 12px 16px;
        }
        
        .auditoria-search-wrapper {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--bg-main);
          border: 1px solid var(--separator);
          border-radius: var(--radius-sm);
          padding: 8px 12px;
          flex: 1;
          max-width: 400px;
          transition: var(--transition);
        }

        .auditoria-search-wrapper:focus-within {
          border-color: var(--primary);
          box-shadow: 0 0 0 2px var(--primary-light);
        }
        
        .auditoria-search-input {
          border: none;
          background: transparent;
          color: var(--text-main);
          font-size: 14px;
          width: 100%;
          outline: none;
        }
        
        /* Lista de logs de auditoria */
        .auditoria-list-section {
          background: var(--bg-card);
          border: 1px solid var(--separator);
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-sm);
        }
        
        .auditoria-list-header {
          display: grid;
          grid-template-columns: 200px 180px 150px 1fr 60px;
          padding: 16px 20px;
          background: var(--bg-main);
          border-bottom: 1px solid var(--separator);
          font-weight: 600;
          font-size: 13px;
          color: var(--text-secondary);
        }
        
        .auditoria-item {
          display: grid;
          grid-template-columns: 200px 180px 150px 1fr 60px;
          padding: 16px 20px;
          border-bottom: 1px solid var(--separator);
          align-items: center;
          font-size: 14px;
          color: var(--text-main);
          transition: var(--transition);
          cursor: pointer;
        }
        
        .auditoria-item:last-child {
          border-bottom: none;
        }
        
        .auditoria-item:hover {
          background: var(--bg-main);
        }
        
        .auditoria-badge {
          display: inline-flex;
          align-items: center;
          padding: 4px 8px;
          border-radius: var(--radius-full);
          font-size: 12px;
          font-weight: 500;
          gap: 4px;
        }
        
        .auditoria-badge.success {
          background: rgba(16, 185, 129, 0.1);
          color: var(--success);
        }
        
        .auditoria-badge.danger {
          background: rgba(239, 68, 68, 0.1);
          color: var(--error);
        }

        .auditoria-badge.info {
          background: var(--primary-light);
          color: var(--primary);
        }
        
        .auditoria-date {
          color: var(--text-secondary);
          font-size: 13px;
        }
        
        .auditoria-ip {
          font-family: monospace;
          color: var(--text-muted);
        }

        .auditoria-details-text {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          color: var(--text-secondary);
          padding-right: 8px;
        }
        
        .auditoria-btn-detail {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          transition: var(--transition);
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: var(--radius-sm);
        }

        .auditoria-btn-detail:hover {
          background: var(--primary-light);
          color: var(--primary);
        }

        /* Responsividade Mobile */
        @media (max-width: 900px) {
          .auditoria-list-header {
            display: none;
          }
          
          .auditoria-item {
            grid-template-columns: 1fr;
            gap: 8px;
            padding: 16px;
          }
          
          .auditoria-item-mobile-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .auditoria-details-text {
            white-space: normal;
          }
          
          .auditoria-btn-detail {
            align-self: flex-end;
          }
        }
      </style>

      <div class="auditoria-container animate-fade">
        
        <!-- Cards de Estatísticas com Entrada em Cascata -->
        <div class="auditoria-stats-grid">
          <div class="auditoria-card hover-lift cascade-item" style="--index: 1;">
            <div class="auditoria-card-icon"><i data-lucide="shield"></i></div>
            <div class="auditoria-card-info">
              <h3>Total de Eventos</h3>
              <p id="audit-stat-total">-</p>
            </div>
          </div>
          
          <div class="auditoria-card hover-lift cascade-item" style="--index: 2;">
            <div class="auditoria-card-icon success"><i data-lucide="unlock"></i></div>
            <div class="auditoria-card-info">
              <h3>Logins Bem Sucedidos</h3>
              <p id="audit-stat-success">-</p>
            </div>
          </div>
          
          <div class="auditoria-card hover-lift cascade-item" style="--index: 3;">
            <div class="auditoria-card-icon danger"><i data-lucide="lock"></i></div>
            <div class="auditoria-card-info">
              <h3>Bloqueios / Falhas</h3>
              <p id="audit-stat-failed">-</p>
            </div>
          </div>

          <div class="auditoria-card hover-lift cascade-item" style="--index: 4;">
            <div class="auditoria-card-icon success"><i data-lucide="fingerprint"></i></div>
            <div class="auditoria-card-info">
              <h3>Autenticações 2FA</h3>
              <p id="audit-stat-2fa">-</p>
            </div>
          </div>
        </div>

        <!-- Barra de Ações com Filtro de Pesquisa -->
        <div class="auditoria-actions-bar cascade-item" style="--index: 5;">
          <div class="auditoria-search-wrapper">
            <i data-lucide="search" style="width: 18px; height: 18px; color: var(--text-secondary);"></i>
            <input 
              type="text" 
              class="auditoria-search-input" 
              placeholder="Buscar por evento, usuário ou IP..." 
              id="audit-search-input"
              value="${this.searchTerm}"
            />
          </div>
          <button class="pill-btn btn-light-orange" id="btn-refresh-audit" style="height: 38px; padding: 0 16px; font-size: 13px; gap: 6px;">
            <i data-lucide="refresh-cw" style="width: 14px; height: 14px;"></i> Atualizar
          </button>
        </div>

        <!-- Lista de Logs -->
        <div class="auditoria-list-section cascade-item" style="--index: 6;">
          <div class="auditoria-list-header">
            <div>Data e Hora</div>
            <div>Evento</div>
            <div>Usuário</div>
            <div>Detalhes</div>
            <div></div>
          </div>
          <div id="auditoria-list-body">
            ${Components.loading()}
          </div>
        </div>

      </div>
    `;

    // Bind events
    this.bindEvents();

    // Fetch and render data
    await this.fetchLogs();
  },

  bindEvents() {
    const searchInput = document.getElementById('audit-search-input');
    const refreshBtn = document.getElementById('btn-refresh-audit');

    if (searchInput) {
      // Debounce simples para busca
      let timeout;
      searchInput.addEventListener('input', (e) => {
        this.searchTerm = e.target.value;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          this.fetchLogs();
        }, 300);
      });
    }

    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.fetchLogs();
      });
    }
  },

  async fetchLogs() {
    const listBody = document.getElementById('auditoria-list-body');
    if (listBody) {
      listBody.innerHTML = `<div style="padding: 40px; text-align: center;">${Components.loading()}</div>`;
    }

    try {
      const queryParam = this.searchTerm ? `?search=${encodeURIComponent(this.searchTerm)}` : '';
      const response = await API.get(`/api/auditoria/logs${queryParam}`);
      
      if (response && response.success) {
        this.logs = response.logs || [];
        this.renderStats();
        this.renderList();
      } else {
        throw new Error(response.error || 'Erro desconhecido');
      }
    } catch (e) {
      console.error('[AUDIT] Failed to fetch audit logs:', e);
      if (listBody) {
        listBody.innerHTML = `
          <div style="padding: 40px; text-align: center; color: var(--error);">
            <i data-lucide="alert-circle" style="width: 48px; height: 48px; margin-bottom: 12px;"></i>
            <p style="font-weight: 600;">Falha ao carregar logs de auditoria</p>
            <p style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">${e.message || 'Verifique se você possui credenciais de superadmin.'}</p>
          </div>
        `;
        Components.renderIcons();
      }
    }
  },

  renderStats() {
    const totalEl = document.getElementById('audit-stat-total');
    const successEl = document.getElementById('audit-stat-success');
    const failedEl = document.getElementById('audit-stat-failed');
    const twofaEl = document.getElementById('audit-stat-2fa');

    if (!totalEl) return;

    // Calcular estatísticas com base nos logs atuais
    const total = this.logs.length;
    const success = this.logs.filter(l => l.evento === 'login_sucesso').length;
    const failed = this.logs.filter(l => l.evento === 'login_falha' || l.evento === 'webauthn_verificacao_falha' || l.evento === 'webauthn_registro_falha').length;
    const twofa = this.logs.filter(l => l.evento.startsWith('webauthn_verificacao_sucesso')).length;

    totalEl.innerText = total;
    successEl.innerText = success;
    failedEl.innerText = failed;
    twofaEl.innerText = twofa;
  },

  getEventBadge(evento) {
    let classe = 'info';
    let label = evento;

    switch (evento) {
      case 'login_sucesso':
        classe = 'success';
        label = 'Login com Sucesso';
        break;
      case 'login_falha':
        classe = 'danger';
        label = 'Falha de Login';
        break;
      case 'webauthn_verificacao_sucesso':
        classe = 'success';
        label = '2FA Confirmado';
        break;
      case 'webauthn_verificacao_falha':
        classe = 'danger';
        label = 'Falha de 2FA';
        break;
      case 'webauthn_verificacao_solicitada':
        classe = 'info';
        label = '2FA Solicitado';
        break;
      case 'webauthn_registro_solicitado':
        classe = 'info';
        label = 'Registro 2FA Requerido';
        break;
      case 'webauthn_registro_sucesso':
        classe = 'success';
        label = 'Dispositivo 2FA Cadastrado';
        break;
      case 'webauthn_registro_falha':
        classe = 'danger';
        label = 'Falha no Registro 2FA';
        break;
      case 'trava_ip_desativada':
        classe = 'danger';
        label = 'Trava de IP Suspensa';
        break;
    }

    return `<span class="auditoria-badge ${classe}">${label}</span>`;
  },

  renderList() {
    const listBody = document.getElementById('auditoria-list-body');
    if (!listBody) return;

    if (this.logs.length === 0) {
      listBody.innerHTML = `<div style="padding: 40px; text-align: center; color: var(--text-secondary);">Nenhum log de auditoria encontrado.</div>`;
      return;
    }

    listBody.innerHTML = this.logs.map((log, idx) => {
      const dataStr = new Date(log.data).toLocaleString('pt-BR');
      let detalhesText = '';
      if (log.detalhes) {
        try {
          const parsed = JSON.parse(log.detalhes);
          detalhesText = parsed.erro || parsed.deviceName || parsed.metodo || log.detalhes;
        } catch (e) {
          detalhesText = log.detalhes;
        }
      }

      // Renderização compatível com desktop (grid) e adaptada a mobile via CSS
      return `
        <div class="auditoria-item" onclick="Auditoria.showLogDetails('${log.id}')">
          <div class="auditoria-date">${dataStr}</div>
          <div class="auditoria-item-mobile-row">
            ${this.getEventBadge(log.evento)}
          </div>
          <div>
            <strong style="font-weight:600; font-size: 13px;">${log.usuario}</strong>
            <div class="auditoria-ip" style="font-size: 12px; margin-top:2px;">IP: ${log.ip}</div>
          </div>
          <div class="auditoria-details-text">${detalhesText}</div>
          <div>
            <button class="auditoria-btn-detail" aria-label="Ver detalhes">
              <i data-lucide="eye" style="width: 16px; height: 16px;"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Reinstanciar ícones conforme o Mandamento 7
    Components.renderIcons();
    lucide.createIcons();
  },

  showLogDetails(logId) {
    const log = this.logs.find(l => l.id === logId);
    if (!log) return;

    const dataStr = new Date(log.data).toLocaleString('pt-BR');
    
    let parsedDetails = {};
    try {
      parsedDetails = JSON.parse(log.detalhes || '{}');
    } catch (e) {
      parsedDetails = { raw: log.detalhes };
    }

    const title = 'Detalhes do Evento de Segurança';
    
    // HTML do conteúdo seguindo estritamente as regras de design premium (sem inline styles, estrutura limpa)
    const contentHtml = `
      <div style="font-family: var(--font-main); color: var(--text-main); display: flex; flex-direction: column; gap: 16px;">
        <div style="display: grid; grid-template-columns: 120px 1fr; gap: 12px 16px; padding: 8px 0; border-bottom: 1px solid var(--separator);">
          <span style="font-weight: 600; color: var(--text-secondary);">Evento:</span>
          <div>${this.getEventBadge(log.evento)}</div>
          
          <span style="font-weight: 600; color: var(--text-secondary);">Usuário:</span>
          <span style="font-weight: 600;">${log.usuario}</span>
          
          <span style="font-weight: 600; color: var(--text-secondary);">Data/Hora:</span>
          <span>${dataStr}</span>
          
          <span style="font-weight: 600; color: var(--text-secondary);">IP de Origem:</span>
          <span style="font-family: monospace; color: var(--primary); font-weight: 600;">${log.ip}</span>
        </div>

        <div>
          <span style="font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 8px;">Dados do Contexto (JSON):</span>
          <pre style="background: var(--bg-main); border: 1px solid var(--separator); border-radius: var(--radius-md); padding: 16px; font-family: monospace; font-size: 13px; overflow-x: auto; color: var(--text-main); white-space: pre-wrap; word-break: break-all; margin: 0;">${JSON.stringify(parsedDetails, null, 2)}</pre>
        </div>
      </div>
    `;

    const footerHtml = `
      <div style="display: flex; justify-content: flex-end; width: 100%;">
        <button class="pill-btn btn-orange" style="height: 40px; padding: 0 24px;" onclick="Components.closeModal()">Fechar</button>
      </div>
    `;

    // Utiliza o modal oficial conforme Mandamento 3 e 5 com backdrop blur nativo
    Components.showModal(title, contentHtml, footerHtml);
    
    // Reinstanciar ícones após abrir o modal
    Components.renderIcons();
    lucide.createIcons();
  }
};

// Exportar globalmente
window.Auditoria = Auditoria;
