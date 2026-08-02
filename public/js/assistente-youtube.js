/**
 * 🤖 MÓDULO PRINCIPAL DE INTERFACE — ASSISTENTE YOUTUBE (COPILOT IA)
 * 
 * Orquestra o Widget Flutuante FAB, a Janela de Chat, a renderização de mensagens,
 * a comunicação com o Gemini 3.5 via backend, a sincronização de dados do CANAL CONECTADO,
 * a geração/download de PDF de Tendências diretamente no chat e a integração com Memória/Conhecimento.
 */

const AssistenteYouTube = {
  isOpen: false,
  isMaximized: false,
  isGenerating: false,
  canalInfo: null,

  // 1. Inicialização Automática
  async init() {
    if (document.getElementById('youtube-assistant-fab')) return;
    this.injetarEstruturaHTML();
    this.vincularEventos();
    await this.carregarStatusCanal();
    this.carregarMensagensSalvas();
    console.log('🤖 [AssistenteYouTube] Widget Copilot com Contexto de Canal & PDF Inicializado!');
  },

  // 2. Busca informações do canal conectado via API/Planejamento
  async carregarStatusCanal() {
    try {
      if (typeof Planejamento !== 'undefined' && Planejamento.canalInfo) {
        this.canalInfo = Planejamento.canalInfo;
      } else {
        const token = localStorage.getItem('NexusGestor_token') || localStorage.getItem('token') || '';
        const res = await fetch('/api/youtube/status', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data && (data.connected === 'connected' || data.connected === 'simulated' || data.connected === 'real')) {
            this.canalInfo = {
              conectado: true,
              nome: data.channelName || 'Tomada',
              subscribers: data.subscribers || (data.connected === 'simulated' ? '1.29k inscritos' : 'Conectado'),
              views: data.views || '1.26k views (28d)',
              avatar: data.channelAvatar || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
              customTheme: data.customTheme || ''
            };
          } else {
            this.canalInfo = null;
          }
        }
      }
    } catch (err) {
      console.warn('[AssistenteYouTube] Erro ao obter status do canal:', err.message);
      this.canalInfo = null;
    }

    this.atualizarHeaderCanalUI();
  },

  // 2.1 Atualiza o Header da Janela de Chat com os Dados do Canal Conectado
  atualizarHeaderCanalUI() {
    const subtitleEl = document.querySelector('.yt-assistant-subtitle');
    const avatarWrapper = document.querySelector('.yt-assistant-avatar-wrapper');

    if (!subtitleEl) return;

    if (this.canalInfo && this.canalInfo.conectado) {
      const nomeCanal = this.canalInfo.nome || 'Canal Conectado';
      const subs = this.canalInfo.subscribers || 'Conectado';
      
      subtitleEl.innerHTML = `
        <span style="width: 7px; height: 7px; border-radius: 50%; background: #10B981; display: inline-block; box-shadow: 0 0 8px #10B981;"></span>
        <strong style="color: #10B981;">${nomeCanal}</strong> (${subs})
      `;

      if (avatarWrapper && this.canalInfo.avatar) {
        avatarWrapper.innerHTML = `<img src="${this.canalInfo.avatar}" alt="${nomeCanal}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
      }
    } else {
      subtitleEl.innerHTML = `
        <span style="width: 7px; height: 7px; border-radius: 50%; background: #9CA3AF; display: inline-block;"></span>
        <span>Nenhum canal conectado</span>
      `;
    }
  },

  // 3. Injeta o HTML da Janela Flutuante e FAB no body
  injetarEstruturaHTML() {
    const fabHTML = `
      <!-- BOTÃO FLUTUANTE FAB -->
      <button id="youtube-assistant-fab" title="Abrir Assistente YouTube IA" aria-label="YouTube Copilot IA">
        <div class="fab-status-dot"></div>
        <i data-lucide="bot" style="width: 28px; height: 28px;"></i>
      </button>

      <!-- JANELA FLUTUANTE DE CHAT -->
      <div id="youtube-assistant-window" class="is-hidden">
        
        <!-- HEADER DA JANELA -->
        <div class="yt-assistant-header">
          <div class="yt-assistant-profile">
            <div class="yt-assistant-avatar-wrapper">
              <i data-lucide="sparkles" style="width: 22px; height: 22px;"></i>
            </div>
            <div class="yt-assistant-info">
              <span class="yt-assistant-title">YouTube Copilot <span style="background: rgba(229, 90, 43, 0.15); color: var(--ref-primary, #E55A2B); font-size: 10px; padding: 2px 6px; border-radius: 6px;">PRO</span></span>
              <span class="yt-assistant-subtitle">
                <span style="width: 6px; height: 6px; border-radius: 50%; background: #10B981; display: inline-block;"></span> Carregando Canal...
              </span>
            </div>
          </div>

          <div class="yt-assistant-actions">
            <button class="yt-assistant-btn-icon" id="yt-ast-clear-btn" title="Limpar Histórico de Memória">
              <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
            </button>
            <button class="yt-assistant-btn-icon" id="yt-ast-maximize-btn" title="Expandir Janela">
              <i data-lucide="maximize-2" style="width: 16px; height: 16px;"></i>
            </button>
            <button class="yt-assistant-btn-icon" id="yt-ast-close-btn" title="Minimizar">
              <i data-lucide="minus" style="width: 18px; height: 18px;"></i>
            </button>
          </div>
        </div>

        <!-- BARRA DE CHIPS DE CONHECIMENTO RÁPIDO -->
        <div class="yt-assistant-chips-container" id="yt-assistant-chips">
          <button class="yt-assistant-chip chip-highlight-pdf" id="yt-chip-pdf-btn">
            <span>📄 Gerar PDF de Tendências</span>
          </button>
          <button class="yt-assistant-chip chip-highlight" data-prompt="Analise meu canal conectado e sugira os 3 próximos vídeos com maior potencial de público e CTR">
            <span>📊 Analisar Meu Canal</span>
          </button>
          <button class="yt-assistant-chip" data-prompt="Me dê 5 ideias virais de 100 Dias no Minecraft Hardcore com alto CTR">
            <span>🎮 100 Dias Minecraft</span>
          </button>
          <button class="yt-assistant-chip" data-prompt="Quais os melhores ganchos de retenção para os primeiros 15s de vídeo de gameplay?">
            <span>⚡ Ganchos de 15s</span>
          </button>
          <button class="yt-assistant-chip" data-prompt="Como fazer SEO para Pokémon e ROM Hacks para ranquear nas buscas?">
            <span>🏆 SEO Pokémon</span>
          </button>
          <button class="yt-assistant-chip" data-prompt="Gere ideias de vídeos do GTA RP e desafios impossíveis no GTA 5">
            <span>🚗 GTA 5 & RP</span>
          </button>
        </div>

        <!-- ÁREA DE MENSAGENS -->
        <div class="yt-assistant-body" id="yt-assistant-messages">
          <!-- Mensagens renderizadas dinamicamente -->
        </div>

        <!-- FOOTER COM CAIXA DE INPUT -->
        <div class="yt-assistant-footer">
          <div class="yt-assistant-input-wrapper">
            <textarea id="yt-assistant-textarea" class="yt-assistant-textarea" placeholder="Pergunte sobre seu canal, peça um PDF ou ideias de jogos..." rows="1"></textarea>
          </div>
          <button id="yt-assistant-send-btn" class="yt-assistant-send-btn" title="Enviar Mensagem">
            <i data-lucide="send" style="width: 18px; height: 18px;"></i>
          </button>
        </div>
      </div>
    `;

    const wrapper = document.createElement('div');
    wrapper.id = 'youtube-assistant-root';
    wrapper.innerHTML = fabHTML;
    document.body.appendChild(wrapper);

    if (window.lucide) lucide.createIcons();

    // Ativa movimentação arrastável em 3 atos
    this.configurarJanelaArrastavel();
    this.configurarFabArrastavel();
  },

  // 3.1 Movimentação Arrastável em 3 Atos para o FAB
  configurarFabArrastavel() {
    const fab = document.getElementById('youtube-assistant-fab');
    if (!fab) return;

    let isDragging = false;
    let startX = 0, startY = 0;
    let initialLeft = 0, initialTop = 0;
    let lastX = 0;
    let hasMoved = false;

    const onStart = (e) => {
      isDragging = true;
      hasMoved = false;

      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      startX = clientX;
      startY = clientY;

      const rect = fab.getBoundingClientRect();
      initialLeft = rect.left;
      initialTop = rect.top;
      lastX = clientX;

      fab.style.bottom = 'auto';
      fab.style.right = 'auto';
      fab.style.left = `${initialLeft}px`;
      fab.style.top = `${initialTop}px`;

      fab.classList.remove('fab-dropped-bounce');
      fab.classList.add('is-dragging-fab');

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onEnd);
      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('touchend', onEnd);
    };

    const onMove = (e) => {
      if (!isDragging) return;

      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      const deltaX = clientX - startX;
      const deltaY = clientY - startY;

      if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
        hasMoved = true;
        if (e.cancelable) e.preventDefault();
      }

      if (!hasMoved) return;

      let newLeft = initialLeft + deltaX;
      let newTop = initialTop + deltaY;

      const maxLeft = window.innerWidth - fab.offsetWidth - 10;
      const maxTop = window.innerHeight - fab.offsetHeight - 10;
      newLeft = Math.max(10, Math.min(newLeft, maxLeft));
      newTop = Math.max(10, Math.min(newTop, maxTop));

      fab.style.left = `${newLeft}px`;
      fab.style.top = `${newTop}px`;

      if (clientX < lastX) {
        fab.classList.add('is-dragging-left');
        fab.classList.remove('is-dragging-right');
      } else if (clientX > lastX) {
        fab.classList.add('is-dragging-right');
        fab.classList.remove('is-dragging-left');
      }
      lastX = clientX;
    };

    const onEnd = () => {
      if (!isDragging) return;
      isDragging = false;

      fab.classList.remove('is-dragging-fab', 'is-dragging-left', 'is-dragging-right');
      fab.classList.add('fab-dropped-bounce');

      setTimeout(() => {
        fab.classList.remove('fab-dropped-bounce');
      }, 550);

      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onEnd);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onEnd);
    };

    fab.addEventListener('mousedown', onStart);
    fab.addEventListener('touchstart', onStart, { passive: false });

    fab.addEventListener('click', (e) => {
      if (hasMoved) {
        e.stopImmediatePropagation();
        e.preventDefault();
        hasMoved = false;
        return;
      }
      this.toggleWindow();
    });
  },

  // 3.2 Movimentação Arrastável em 3 Atos para a Janela Flutuante
  configurarJanelaArrastavel() {
    const win = document.getElementById('youtube-assistant-window');
    const header = win ? win.querySelector('.yt-assistant-header') : null;
    if (!win || !header) return;

    let isDragging = false;
    let startX = 0, startY = 0;
    let initialLeft = 0, initialTop = 0;
    let lastX = 0;

    const onStart = (e) => {
      if (e.target.closest('.yt-assistant-btn-icon')) return;

      isDragging = true;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      startX = clientX;
      startY = clientY;

      const rect = win.getBoundingClientRect();
      initialLeft = rect.left;
      initialTop = rect.top;
      lastX = clientX;

      win.style.bottom = 'auto';
      win.style.right = 'auto';
      win.style.left = `${initialLeft}px`;
      win.style.top = `${initialTop}px`;

      win.classList.remove('window-dropped-snap');
      win.classList.add('is-dragging-window');

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onEnd);
      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('touchend', onEnd);
    };

    const onMove = (e) => {
      if (!isDragging) return;
      if (e.cancelable) e.preventDefault();

      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      const deltaX = clientX - startX;
      const deltaY = clientY - startY;

      let newLeft = initialLeft + deltaX;
      let newTop = initialTop + deltaY;

      const maxLeft = window.innerWidth - win.offsetWidth - 10;
      const maxTop = window.innerHeight - win.offsetHeight - 10;
      newLeft = Math.max(10, Math.min(newLeft, maxLeft));
      newTop = Math.max(10, Math.min(newTop, maxTop));

      win.style.left = `${newLeft}px`;
      win.style.top = `${newTop}px`;

      if (clientX < lastX) {
        win.classList.add('is-dragging-left');
        win.classList.remove('is-dragging-right');
      } else if (clientX > lastX) {
        win.classList.add('is-dragging-right');
        win.classList.remove('is-dragging-left');
      }
      lastX = clientX;
    };

    const onEnd = () => {
      if (!isDragging) return;
      isDragging = false;

      win.classList.remove('is-dragging-window', 'is-dragging-left', 'is-dragging-right');
      win.classList.add('window-dropped-snap');

      setTimeout(() => {
        win.classList.remove('window-dropped-snap');
      }, 550);

      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onEnd);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onEnd);
    };

    header.addEventListener('mousedown', onStart);
    header.addEventListener('touchstart', onStart, { passive: false });
  },

  // 4. Vincular Eventos
  vincularEventos() {
    const win = document.getElementById('youtube-assistant-window');
    const closeBtn = document.getElementById('yt-ast-close-btn');
    const maxBtn = document.getElementById('yt-ast-maximize-btn');
    const clearBtn = document.getElementById('yt-ast-clear-btn');
    const sendBtn = document.getElementById('yt-assistant-send-btn');
    const textarea = document.getElementById('yt-assistant-textarea');
    const chipsContainer = document.getElementById('yt-assistant-chips');
    const pdfChipBtn = document.getElementById('yt-chip-pdf-btn');

    closeBtn.addEventListener('click', () => this.toggleWindow(false));

    maxBtn.addEventListener('click', () => {
      this.isMaximized = !this.isMaximized;
      win.classList.toggle('is-maximized', this.isMaximized);
      maxBtn.innerHTML = `<i data-lucide="${this.isMaximized ? 'minimize-2' : 'maximize-2'}" style="width: 16px; height: 16px;"></i>`;
      if (window.lucide) lucide.createIcons();
    });

    clearBtn.addEventListener('click', () => {
      if (confirm('Deseja realmente limpar o histórico de conversas do assistente?')) {
        if (typeof AssistenteMemoria !== 'undefined') {
          AssistenteMemoria.limparHistorico();
          this.carregarMensagensSalvas();
        }
      }
    });

    sendBtn.addEventListener('click', () => this.handleEnviarMensagem());

    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handleEnviarMensagem();
      }
    });

    if (pdfChipBtn) {
      pdfChipBtn.addEventListener('click', () => this.gerarEEnviarPDFTendencias());
    }

    chipsContainer.addEventListener('click', (e) => {
      const chip = e.target.closest('.yt-assistant-chip');
      if (chip && chip.id === 'yt-chip-pdf-btn') return;
      if (chip && !this.isGenerating) {
        const promptText = chip.getAttribute('data-prompt');
        if (promptText) {
          textarea.value = promptText;
          this.handleEnviarMensagem();
        }
      }
    });
  },

  // 5. Alternar Janela
  toggleWindow(forceState = null) {
    const win = document.getElementById('youtube-assistant-window');
    this.isOpen = forceState !== null ? forceState : !this.isOpen;
    win.classList.toggle('is-hidden', !this.isOpen);

    if (this.isOpen) {
      this.carregarStatusCanal();
      setTimeout(() => {
        const textarea = document.getElementById('yt-assistant-textarea');
        if (textarea) textarea.focus();
        this.scrollToBottom();
      }, 150);
    }
  },

  // 6. Carregar Mensagens Armazenadas na Memória
  carregarMensagensSalvas() {
    const container = document.getElementById('yt-assistant-messages');
    if (!container) return;
    container.innerHTML = '';

    if (typeof AssistenteMemoria !== 'undefined') {
      const memoria = AssistenteMemoria.obterMemoria();
      if (!memoria.historico || memoria.historico.length === 0) {
        const canalNome = this.canalInfo?.nome ? ` **${this.canalInfo.nome}**` : '';
        const msgWelcome = `Olá! Sou seu **YouTube Copilot PRO** 🚀. Estou conectado ao seu canal${canalNome}, pronto para analisar métricas, sugerir ideias virais de jogos, roteiros e **gerar relatórios PDF de tendências** diretamente no chat! Em que posso te ajudar hoje?`;
        this.renderizarBolhaMensagem('model', msgWelcome, new Date().toISOString());
      } else {
        memoria.historico.forEach(msg => {
          this.renderizarBolhaMensagem(msg.role, msg.texto, msg.data);
        });
      }
    }
    this.scrollToBottom();
  },

  // 7. GERAR E ENVIAR PDF DE TENDÊNCIAS DIRETO NO CHAT
  async gerarEEnviarPDFTendencias() {
    if (this.isGenerating) return;
    this.isGenerating = true;
    document.getElementById('yt-assistant-send-btn').disabled = true;

    const userMsg = '📄 Gerar PDF de Tendências do YouTube Gaming';
    const nowISO = new Date().toISOString();
    this.renderizarBolhaMensagem('user', userMsg, nowISO);
    if (typeof AssistenteMemoria !== 'undefined') {
      AssistenteMemoria.salvarMensagem('user', userMsg);
    }
    this.scrollToBottom();

    this.exibirIndicadorTyping(true);

    try {
      const token = localStorage.getItem('NexusGestor_token') || localStorage.getItem('token') || '';
      const response = await fetch('/api/youtube/gerar-pdf-tendencias', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      this.exibirIndicadorTyping(false);

      if (!response.ok) {
        throw new Error('Falha ao gerar PDF (' + response.status + ')');
      }

      const data = await response.json();
      
      const htmlPDFCard = `
        <div style="background: rgba(229, 90, 43, 0.08); border: 1px solid rgba(229, 90, 43, 0.3); border-radius: 10px; padding: 12px; margin-top: 4px;">
          <div style="display: flex; align-items: center; gap: 8px; font-weight: bold; color: var(--ref-primary, #E55A2B); margin-bottom: 6px;">
            <i data-lucide="file-text" style="width: 18px; height: 18px;"></i>
            <span>Relatório de Tendências PDF Gerado!</span>
          </div>
          <p style="font-size: 12px; color: var(--text-secondary, #94A3B8); margin-bottom: 10px; line-height: 1.4;">
            Mapeamos <strong>${data.totalItens || 10} vídeos em alta</strong> no nicho gaming com thumbnails, análise de retenção e ganchos virais no padrão Tomada Planner.
          </p>
          <a href="${data.pdfUrl}" target="_blank" download class="yt-pdf-card-btn" style="display: inline-flex; align-items: center; gap: 6px; background: #E55A2B; color: #FFF; padding: 8px 14px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 12px; box-shadow: 0 4px 12px rgba(229, 90, 43, 0.3);">
            <i data-lucide="download" style="width: 14px; height: 14px;"></i>
            <span>Baixar Relatório PDF</span>
          </a>
        </div>
      `;

      this.renderizarBolhaMensagem('model', htmlPDFCard, new Date().toISOString(), true);
      if (typeof AssistenteMemoria !== 'undefined') {
        AssistenteMemoria.salvarMensagem('model', `PDF de Tendências gerado com sucesso. [Baixar PDF](${data.pdfUrl})`);
      }
      if (window.lucide) lucide.createIcons();
    } catch (err) {
      console.error('[AssistenteYouTube] Erro ao gerar PDF:', err);
      this.exibirIndicadorTyping(false);
      const msgErro = '❌ Tive um problema ao gerar o PDF de Tendências. Certifique-se de que o backend está ativo.';
      this.renderizarBolhaMensagem('model', msgErro, new Date().toISOString());
    } finally {
      this.isGenerating = false;
      document.getElementById('yt-assistant-send-btn').disabled = false;
      this.scrollToBottom();
    }
  },

  // 8. Enviar Mensagem do Usuário
  async handleEnviarMensagem() {
    const textarea = document.getElementById('yt-assistant-textarea');
    const texto = (textarea.value || '').trim();
    if (!texto || this.isGenerating) return;

    // Detecta intenção de PDF
    const textoLower = texto.toLowerCase();
    if (textoLower.includes('pdf') || textoLower.includes('gerar pdf') || textoLower.includes('baixar pdf') || textoLower.includes('relatorio pdf')) {
      textarea.value = '';
      return this.gerarEEnviarPDFTendencias();
    }

    textarea.value = '';
    this.isGenerating = true;
    document.getElementById('yt-assistant-send-btn').disabled = true;

    await this.carregarStatusCanal();

    // 1. Renderiza e Salva Mensagem do Usuário
    const nowISO = new Date().toISOString();
    this.renderizarBolhaMensagem('user', texto, nowISO);
    if (typeof AssistenteMemoria !== 'undefined') {
      AssistenteMemoria.salvarMensagem('user', texto);
    }
    this.scrollToBottom();

    // 2. Exibe Indicador de Digitação
    this.exibirIndicadorTyping(true);

    try {
      let tendenciasTexto = '';
      if (typeof AssistenteConhecimento !== 'undefined' && AssistenteConhecimento.formatarTendenciasParaPrompt) {
        tendenciasTexto = AssistenteConhecimento.formatarTendenciasParaPrompt();
      }

      let systemPrompt = "Você é o especialista YouTube Copilot IA em SEO, estatísticas de canal e Jogos/Gameplay. Responda de forma concisa e de tamanho médio (máximo 250 a 350 palavras).";
      if (typeof AssistenteConhecimento !== 'undefined') {
        systemPrompt = AssistenteConhecimento.gerarSystemPrompt(this.canalInfo, [], tendenciasTexto);
      }

      let historicoMsgs = [];
      if (typeof AssistenteMemoria !== 'undefined') {
        historicoMsgs = AssistenteMemoria.obterHistoricoParaPrompt(10);
      }

      const response = await fetch('/api/youtube/gerar-texto-ia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + (localStorage.getItem('NexusGestor_token') || localStorage.getItem('token') || '')
        },
        body: JSON.stringify({
          prompt: texto,
          systemPrompt: systemPrompt,
          historico: historicoMsgs
        })
      });

      this.exibirIndicadorTyping(false);

      if (!response.ok) {
        throw new Error('Falha HTTP ' + response.status);
      }

      const data = await response.json();
      const respostaIA = data.texto || data.resultado || 'Desculpe, não consegui processar sua solicitação neste momento.';

      this.renderizarBolhaMensagem('model', respostaIA, new Date().toISOString());
      if (typeof AssistenteMemoria !== 'undefined') {
        AssistenteMemoria.salvarMensagem('model', respostaIA);
      }
    } catch (err) {
      console.error('[AssistenteYouTube] Erro ao obter resposta:', err);
      this.exibirIndicadorTyping(false);
      const msgErro = '❌ Tive um problema ao me conectar à IA. Por favor, tente novamente em instantes.';
      this.renderizarBolhaMensagem('model', msgErro, new Date().toISOString());
    } finally {
      this.isGenerating = false;
      document.getElementById('yt-assistant-send-btn').disabled = false;
      this.scrollToBottom();
    }
  },

  // 9. Renderizar Bolha de Mensagem no Chat
  renderizarBolhaMensagem(role, texto, timestamp, isHTML = false) {
    const container = document.getElementById('yt-assistant-messages');
    if (!container) return;

    const isUser = role === 'user';
    const timeStr = timestamp ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

    const formattedContent = isHTML ? texto : this.formatarMarkdown(texto);

    const msgDiv = document.createElement('div');
    msgDiv.className = `yt-msg ${isUser ? 'yt-msg-user' : 'yt-msg-assistant'}`;
    msgDiv.innerHTML = `
      <div class="yt-msg-bubble">
        ${formattedContent}
      </div>
      <span class="yt-msg-time">${timeStr}</span>
    `;

    container.appendChild(msgDiv);
  },

  // 10. Formatador de Markdown simples para HTML
  formatarMarkdown(texto) {
    if (!texto) return '';
    let html = texto
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');

    return `<p>${html}</p>`;
  },

  // 11. Indicador de Digitação
  exibirIndicadorTyping(show) {
    const container = document.getElementById('yt-assistant-messages');
    const existing = document.getElementById('yt-assistant-typing-indicator');

    if (show) {
      if (existing) return;
      const typingDiv = document.createElement('div');
      typingDiv.id = 'yt-assistant-typing-indicator';
      typingDiv.className = 'yt-msg yt-msg-assistant';
      typingDiv.innerHTML = `
        <div class="yt-msg-bubble" style="padding: 10px 14px;">
          <div class="yt-typing-dots">
            <div class="yt-typing-dot"></div>
            <div class="yt-typing-dot"></div>
            <div class="yt-typing-dot"></div>
          </div>
        </div>
      `;
      container.appendChild(typingDiv);
      this.scrollToBottom();
    } else {
      if (existing) existing.remove();
    }
  },

  // 12. Rolar para o Fim
  scrollToBottom() {
    const container = document.getElementById('yt-assistant-messages');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }
};

// Auto-inicialização na carga da página
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => AssistenteYouTube.init());
} else {
  AssistenteYouTube.init();
}

if (typeof window !== 'undefined') {
  window.AssistenteYouTube = AssistenteYouTube;
}