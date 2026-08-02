/**
 * ARQUIVO: cronograma.render.js
 * CATEGORIA: Cronograma › Renderização principal
 * RESPONSABILIDADE: Renderiza o layout semanal (kanban) e controla navegação
 * DEPENDE DE: cronograma.state.js, cronograma.styles.js, API, Components
 * EXPORTA: render(), renderContent(), renderSemanal(), renderMatrixCard(),
 *           setView(), getWeekDates(), prevWeek(), nextWeek()
 */

Object.assign(Cronograma, {
  async render() {
    this.savedScrolls = {};
    document.querySelectorAll('.baker-row-mobile').forEach(row => {
      const bakerId = row.dataset.bakerId;
      const scrollEl = row.querySelector('.days-scroll-mobile');
      if (bakerId && scrollEl) {
        this.savedScrolls[bakerId] = scrollEl.scrollLeft;
      }
    });
    this.savedVerticalScroll = window.scrollY || document.documentElement.scrollTop;

    this.renderStyles();
    const c = document.getElementById('page-container');
    c.innerHTML = Components.loading();
    try {
      const [tarefas, padeiros, clientes, metas, atividades, kanbanLists, produtos] = await Promise.all([
        API.get('/api/cronograma'),
        API.get('/api/padeiros'),
        API.get('/api/clientes'),
        API.get('/api/metas'),
        API.get('/api/atividades'),
        API.get('/api/kanban-lists'),
        API.get('/api/produtos')
      ]);
      this.tarefas = tarefas;
      this.padeiros = padeiros;
      this.clientes = clientes;
      this.metas = metas;
      this.atividades = atividades;
      this.kanbanLists = kanbanLists || [];
      this.produtos = produtos || [];

      if (window.innerWidth <= 768) {
        this.renderMobile(c);
      } else {
        this.renderContent(c);
      }
    } catch (e) {
      c.innerHTML = `<div class="toast error">Erro: ${e.message}</div>`;
    }
  },

  renderContent(c) {
    c.innerHTML = `
    <style>
      @media (max-width: 430px) {
        .cronograma-actions {
          display: grid !important;
          grid-template-columns: repeat(2, 1fr) !important;
          gap: 8px !important;
          width: 100% !important;
        }
        .cronograma-actions .btn {
          width: 100% !important;
          height: 44px !important;
          border-radius: 12px !important;
          font-weight: 600 !important;
          font-size: 12px !important;
          justify-content: center !important;
          box-shadow: 0 2px 6px rgba(0,0,0,0.02) !important;
        }
        .matrix-task-card {
          -webkit-touch-callout: none !important;
          -webkit-user-select: none !important;
          user-select: none !important;
        }
        .cronograma-actions .btn-primary {
          grid-column: span 2 !important;
          height: 48px !important;
          font-size: 14px !important;
          border-radius: 14px !important;
          box-shadow: 0 4px 14px rgba(28,126,242,0.3) !important;
        }
      }
    </style>
    <div class="fade-in">
      <div class="flex justify-between items-center mb-6 cronograma-header" style="flex-wrap:wrap; gap:16px;">
        <div class="kanban-view-switcher">
          <button class="switcher-btn ${this.currentView === 'semanal' ? 'active' : ''}" onclick="Cronograma.setView('semanal')">Kanban</button>
          <button class="switcher-btn ${this.currentView === 'mensal' ? 'active' : ''}" onclick="Cronograma.setView('mensal')">Mensal</button>
          <button class="switcher-btn ${this.currentView === 'calendario' ? 'active' : ''}" onclick="Cronograma.setView('calendario')">Calendário</button>
        </div>
        <div class="flex items-center gap-3 cronograma-actions">
          <button class="btn btn-primary btn-pill" onclick="Cronograma.openTaskForm()">
            <i data-lucide="plus"></i> Nova Tarefa
          </button>
          <button class="btn btn-pill" style="background-color: rgba(52, 199, 89, 0.1); color: #34C759; border: none; font-weight: 600;" onclick="Cronograma.openSaveTemplateModal()">
            <i data-lucide="save"></i> Salvar Template
          </button>
          <button class="btn btn-pill" style="background-color: rgba(0, 122, 255, 0.1); color: #007AFF; border: none; font-weight: 600;" onclick="Cronograma.openLoadTemplateModal()">
            <i data-lucide="folder-open"></i> Carregar Template
          </button>
          <button class="btn btn-pill" style="background-color: rgba(175, 82, 222, 0.1); color: #AF52DE; border: none; font-weight: 600;" onclick="Cronograma.openSmartSchedule()">
            <i data-lucide="sparkles"></i> Inteligente
          </button>
          ${API.getUser().role === 'admin' ? `
          <button class="btn btn-pill" style="background-color: rgba(239, 68, 68, 0.1); color: #EF4444; border: none; font-weight: 600;" onclick="Cronograma.deleteAllTasks()">
            <i data-lucide="trash-2"></i> Limpar
          </button>
          ` : ''}
          <button class="btn btn-pill" style="background-color: rgba(255, 149, 0, 0.1); color: #FF9500; border: none; font-weight: 600;" onclick="Cronograma.exportToPDF()">
            <i data-lucide="file-down"></i> Exportar PDF
          </button>
        </div>
      </div>
      <div id="cronograma-content"></div>
    </div>`;
    const actions = c.querySelector('.cronograma-actions');
    if (actions) {
      if (this.currentView === 'mensal' || this.currentView === 'calendario') {
        actions.style.setProperty('display', 'none', 'important');
      } else {
        actions.style.removeProperty('display');
      }
    }
    if (this.currentView === 'semanal') {
      c.classList.remove('tf-page-active');
      document.body.classList.remove('tf-page-active');
      c.classList.remove('cal-page-active');
      document.body.classList.remove('cal-page-active');
      c.classList.add('kanban-redesign-active');
      document.body.classList.add('kanban-redesign-active');
      this.renderSemanal();
    } else if (this.currentView === 'mensal') {
      c.classList.remove('kanban-redesign-active');
      document.body.classList.remove('kanban-redesign-active');
      c.classList.remove('cal-page-active');
      document.body.classList.remove('cal-page-active');
      c.classList.add('tf-page-active');
      document.body.classList.add('tf-page-active');
      this.renderMensal();
    } else {
      c.classList.remove('kanban-redesign-active');
      document.body.classList.remove('kanban-redesign-active');
      c.classList.remove('tf-page-active');
      document.body.classList.remove('tf-page-active');
      c.classList.add('cal-page-active');
      document.body.classList.add('cal-page-active');
      this.renderCalendario();
    }
    Components.renderIcons();
  },

  setView(view) {
    if (this.currentView === view) return;

    // 1. Move switcher active classes immediately for responsive UI feedback
    document.querySelectorAll('.kanban-view-switcher .switcher-btn').forEach(btn => {
      const isKanban = view === 'semanal' && btn.innerText.toLowerCase() === 'kanban';
      const isMensal = view === 'mensal' && btn.innerText.toLowerCase() === 'mensal';
      const isCalendario = view === 'calendario' && btn.innerText.toLowerCase() === 'calendário';
      btn.classList.toggle('active', isKanban || isMensal || isCalendario);
    });

    const cc = document.getElementById('cronograma-content');
    if (cc) {
      cc.classList.add('page-exit-active');
      setTimeout(() => {
        cc.classList.remove('page-exit-active');
        this.currentView = view;

        const pageContainer = document.getElementById('page-container');
        if (pageContainer) {
          pageContainer.classList.remove('kanban-redesign-active', 'tf-page-active', 'cal-page-active');
          document.body.classList.remove('kanban-redesign-active', 'tf-page-active', 'cal-page-active');
          if (view === 'mensal') {
            pageContainer.classList.add('tf-page-active');
            document.body.classList.add('tf-page-active');
          } else if (view === 'calendario') {
            pageContainer.classList.add('cal-page-active');
            document.body.classList.add('cal-page-active');
          } else {
            pageContainer.classList.add('kanban-redesign-active');
            document.body.classList.add('kanban-redesign-active');
          }
        }

        const actions = document.querySelector('.cronograma-actions');
        if (actions) {
          if (view === 'mensal' || view === 'calendario') {
            actions.style.setProperty('display', 'none', 'important');
          } else {
            actions.style.removeProperty('display');
          }
        }

        if (view === 'semanal') this.renderSemanal();
        else if (view === 'mensal') this.renderMensal();
        else this.renderCalendario();
        Components.renderIcons();
      }, 180);
    } else {
      this.currentView = view;
      const pageContainer = document.getElementById('page-container');
      if (pageContainer) {
        pageContainer.classList.remove('kanban-redesign-active', 'tf-page-active', 'cal-page-active');
        document.body.classList.remove('kanban-redesign-active', 'tf-page-active', 'cal-page-active');
        if (view === 'mensal') {
          pageContainer.classList.add('tf-page-active');
          document.body.classList.add('tf-page-active');
        } else if (view === 'calendario') {
          pageContainer.classList.add('cal-page-active');
          document.body.classList.add('cal-page-active');
        } else {
          pageContainer.classList.add('kanban-redesign-active');
          document.body.classList.add('kanban-redesign-active');
        }
      }
      if (view === 'semanal') this.renderSemanal();
      else if (view === 'mensal') this.renderMensal();
      else this.renderCalendario();
      Components.renderIcons();
    }
  },

  getWeekDates() {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=dom, 1=seg...
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1) + (this.weekOffset * 7));

    const dates = [];
    for (let i = 0; i < 7; i++) { // seg-dom
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      dates.push(d);
    }
    return dates;
  },

  renderSemanal() {
    this.selectedClienteFilter = this.selectedClienteFilter || '';

    const dates = this.getWeekDates();
    const startStr = dates[0].toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    const endStr = dates[6].toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

    const cc = document.getElementById('cronograma-content');

    const monStr = Cronograma.getLocalISO(dates[0]);
    const sunStr = Cronograma.getLocalISO(dates[6]);

    let filteredTasks = this.tarefas.filter(t => dates.some(d => Cronograma.isTaskOnDate(t, Cronograma.getLocalISO(d))));

    if (this.selectedClienteFilter) {
      filteredTasks = filteredTasks.filter(t => t.clienteId === this.selectedClienteFilter);
    }

    const totalTasks = filteredTasks.length;
    const lastList = this.kanbanLists[this.kanbanLists.length - 1];
    const completedTasks = filteredTasks.filter(t => t.kanbanListId === (lastList?.id) || t.status === 'concluida').length;
    const progressPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    // ─── Geração Dinâmica do Mini-Calendário ───
    const activeDate = dates[0];
    const year = activeDate.getFullYear();
    const month = activeDate.getMonth();
    const mesesNomes = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const activeMonthYear = `${mesesNomes[month]} ${year}`;

    const firstDay = new Date(year, month, 1);
    const firstDayOfWeek = firstDay.getDay(); // 0=dom, 1=seg...
    const lastDay = new Date(year, month + 1, 0);
    const totalDays = lastDay.getDate();

    const today = new Date();
    const currentWeekStr = dates.map(d => d.toDateString());

    let minicalDaysHTML = '';

    // Preencher slots vazios do mês anterior
    for (let i = 0; i < firstDayOfWeek; i++) {
      minicalDaysHTML += `<span class="minical-day empty"></span>`;
    }

    // Preencher dias do mês atual
    for (let d = 1; d <= totalDays; d++) {
      const curDate = new Date(year, month, d);
      const isToday = curDate.toDateString() === today.toDateString();
      const inCurrentWeek = currentWeekStr.includes(curDate.toDateString());

      let dayClass = 'minical-day';
      if (isToday) dayClass += ' today';
      else if (inCurrentWeek) dayClass += ' active-week';

      minicalDaysHTML += `<span class="${dayClass}">${d}</span>`;
    }

    // ─── Seleção Dinâmica da Próxima Visita (Lembrete) ───
    let nextTask = null;
    if (filteredTasks.length > 0) {
      const pendingTasks = filteredTasks.filter(t => t.status !== 'concluida');
      if (pendingTasks.length > 0) {
        nextTask = pendingTasks[0];
      } else {
        nextTask = filteredTasks[0];
      }
    }

    const nextTaskClient = nextTask ? (nextTask.clienteNome || 'Sem Nome') : 'Nenhuma Visita Agendada';
    const nextTaskTime = nextTask ? `${nextTask.horario || 'Manhã'} (${nextTask.data.split('-').reverse().slice(0, 2).join('/')})` : '—';
    const nextTaskId = nextTask ? nextTask.id : '';

    // Mapa de cor de header por status da coluna
    const STATUS_HEADER_COLORS = {
      'pendente': '#6B6560',
      'em andamento': '#D97706',
      'em_andamento': '#D97706',
      'concluída': '#0F766E',
      'concluida': '#0F766E',
    };

    const getHeaderColor = (listTitulo, listCor) => {
      const key = listTitulo.toLowerCase().trim();
      if (STATUS_HEADER_COLORS[key]) return STATUS_HEADER_COLORS[key];
      return (listCor && listCor.startsWith('#') && listCor !== '#E5E7EB') ? listCor : '#7C3AED';
    };

    cc.innerHTML = `
    <div class="kanban-redesign-wrapper">
      
      <!-- Sub-Sidebar (Left Column) -->
      <aside class="kanban-sub-sidebar">
        <!-- Widget 1: Mini Calendário -->
        <div class="kanban-widget widget-minical">
          <div class="minical-header">
            <span class="minical-title">${activeMonthYear}</span>
            <div class="minical-nav">
              <button class="minical-nav-btn" onclick="Cronograma.prevWeek()"><i data-lucide="chevron-left"></i></button>
              <button class="minical-nav-btn" onclick="Cronograma.nextWeek()"><i data-lucide="chevron-right"></i></button>
            </div>
          </div>
          <div class="minical-grid">
            <span class="minical-weekday">D</span>
            <span class="minical-weekday">S</span>
            <span class="minical-weekday">T</span>
            <span class="minical-weekday">Q</span>
            <span class="minical-weekday">Q</span>
            <span class="minical-weekday">S</span>
            <span class="minical-weekday">S</span>
            ${minicalDaysHTML}
          </div>
        </div>

        <!-- Widget 2: Card de Lembrete "Próxima Visita" -->
        <div class="kanban-widget widget-reminder">
          <div class="reminder-label">Próxima Visita</div>
          <h4 class="reminder-title">${nextTaskClient}</h4>
          <div class="reminder-time">
            <i data-lucide="clock" size="14"></i> ${nextTaskTime}
          </div>
          ${nextTask ? `
          <div class="reminder-actions">
            <button class="reminder-btn-action reject" onclick="event.stopPropagation(); Cronograma.rejectNextTask('${nextTaskId}')" title="Ver Detalhes">
              <i data-lucide="eye"></i>
            </button>
            <button class="reminder-btn-action accept" onclick="event.stopPropagation(); Cronograma.acceptNextTask('${nextTaskId}')" title="Marcar como Concluída">
              <i data-lucide="check"></i>
            </button>
          </div>
          ` : ''}
        </div>

        <!-- Widget 3: Filtros Colapsáveis -->
        <div class="kanban-widget widget-filters">
          <div class="filters-header" onclick="Cronograma.toggleFiltersCollapse()">
            <span class="filters-title">Filtros</span>
            <i data-lucide="chevron-up" id="filters-chevron"></i>
          </div>
          <div class="filters-body" id="filters-body-content">
            <div class="filter-item-checkbox">
              <input type="checkbox" id="filter-meetings" checked />
              <label for="filter-meetings">Visitas Agendadas</label>
            </div>
            <div class="filter-item-checkbox">
              <input type="checkbox" id="filter-deadlines" />
              <label for="filter-deadlines">Prazos Limite</label>
            </div>
            <div class="filter-item-checkbox">
              <input type="checkbox" id="filter-personal" />
              <label for="filter-personal">Eventos Pessoais</label>
            </div>
          </div>
        </div>

        <!-- Widget 4: Outras Visões -->
        <div class="kanban-widget widget-other" onclick="Cronograma.setView('mensal')">
          <span>Outras Visões</span>
          <i data-lucide="chevron-right"></i>
        </div>
      </aside>

      <!-- Main Board Area (Right Column) -->
      <main class="kanban-main-area">
        
        <!-- Header Controls -->
        <div class="kanban-header-controls">
          <div class="kanban-date-nav">
            <button class="trello-btn-icon" onclick="Cronograma.prevWeek()"><i data-lucide="chevron-left"></i></button>
            <span class="kanban-date-display">${startStr} — ${endStr}</span>
            <button class="trello-btn-icon" onclick="Cronograma.nextWeek()"><i data-lucide="chevron-right"></i></button>
          </div>
          
          <div class="kanban-view-switcher">
            <button class="switcher-btn active" onclick="Cronograma.setView('semanal')">Kanban</button>
            <button class="switcher-btn" onclick="Cronograma.setView('mensal')">Mensal</button>
            <button class="switcher-btn" onclick="Cronograma.setView('calendario')">Calendário</button>
          </div>

          <div class="flex items-center gap-2">
            <button class="trello-btn-icon" style="color: #34C759;" onclick="Cronograma.openSaveTemplateModal()" title="Salvar Template">
              <i data-lucide="save"></i>
            </button>
            <button class="trello-btn-icon" style="color: #007AFF;" onclick="Cronograma.openLoadTemplateModal()" title="Carregar Template">
              <i data-lucide="folder-open"></i>
            </button>
            <button class="trello-btn-icon" style="color: #AF52DE;" onclick="Cronograma.openSmartSchedule()" title="Agendamento Inteligente">
              <i data-lucide="sparkles"></i>
            </button>
            ${API.getUser().role === 'admin' ? `
            <button class="trello-btn-icon" style="color: #EF4444;" onclick="Cronograma.deleteAllTasks()" title="Limpar Tudo">
              <i data-lucide="trash-2"></i>
            </button>
            ` : ''}
            <button class="trello-btn-icon" style="color: #FF9500;" onclick="Cronograma.exportToPDF()" title="Exportar PDF">
              <i data-lucide="file-down"></i>
            </button>
            <button class="btn-create-event" onclick="Cronograma.openTaskForm()">
              <i data-lucide="plus"></i> Nova Tarefa
            </button>
          </div>
        </div>

        <!-- Canvas Container (White Card Layout) -->
        <div class="kanban-board-canvas-card">
          <div class="trello-board-filters-row">
            <div class="trello-progress-badge">
              <svg viewBox="0 0 36 36" class="trello-progress-circle-mini">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(0,0,0,0.08)" stroke-width="4"/>
                <path stroke-dasharray="${progressPercent}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#E55A2B" stroke-width="4" stroke-linecap="round"/>
              </svg>
              <span style="margin-left: 8px;">Progresso Semanal: <strong>${progressPercent}%</strong></span>
            </div>
            
            <select class="trello-select" onchange="Cronograma.selectedClienteFilter = this.value; Cronograma.renderSemanal()">
              <option value="">Todos os Clientes</option>
              ${this.clientes.map(c => `<option value="${c.id}" ${this.selectedClienteFilter === c.id ? 'selected' : ''}>${c.nome}</option>`).join('')}
            </select>
          </div>

          <!-- Day Header Cards Row -->
          <div class="kanban-day-header-row">
            ${dates.map((date, dateIdx) => {
      const WEEKDAYS_FULL = ['Segunda', 'Ter\u00e7a', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
      const dayName = WEEKDAYS_FULL[dateIdx];
      const dayNum = date.getDate();
      const isToday = date.toDateString() === new Date().toDateString();
      return `
              <div class="kanban-day-header-card ${isToday ? 'is-today' : ''}">
                <span class="kanban-day-label">${dayName}</span>
                <span class="kanban-day-num">${dayNum}</span>
              </div>`;
    }).join('')}
          </div>

          <!-- Board Columns Grid -->
          <div class="trello-board-canvas kanban-open-grid">
            ${dates.map((date, dateIdx) => {
      const dateStr = Cronograma.getLocalISO(date);
      const dayTasks = filteredTasks.filter(t => Cronograma.isTaskOnDate(t, dateStr))
        .sort((a, b) => (a.posicao || 0) - (b.posicao || 0));
      const isToday = date.toDateString() === new Date().toDateString();
      return `
                <div class="kanban-day-column cascade-item" data-date="${dateStr}"
                     style="--index: ${dateIdx * 1.5};">
                  <div class="trello-cards-container" data-date="${dateStr}" ondragover="Cronograma.onDragOverTask(event)" ondrop="Cronograma.onDropKanbanDate(event, '${dateStr}')" style="min-height: 200px;">
                    ${dayTasks.map((t, idx) => this.renderKanbanCard(t, dateIdx * 1.5 + idx * 0.5 + 0.5)).join('')}
                  </div>
                  <button class="kanban-add-card-btn" onclick="Cronograma.openTaskForm(null, '${dateStr}')">
                    <i data-lucide="plus" size="14"></i> Adicionar
                  </button>
                </div>`;
    }).join('')}
          </div>
        </div>

      </main>

    </div>`;

    Components.renderIcons();
    if (window.HigPopovers) {
      setTimeout(() => HigPopovers.initCustomSelects(), 50);
    }
  },

  renderKanbanCard(t, index = 0) {
    const progress = t.progresso || 0;

    // Status Tag (Pendente, Em Andamento, Concluído)
    let statusTagHTML = '';
    const statusLower = (t.status || '').toLowerCase().replace('_', ' ');
    if (statusLower === 'concluida' || statusLower === 'concluída') {
      statusTagHTML = `<span class="trello-card-status-tag status-concluida" style="background: #D1FAE5; color: #065F46; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;"><span style="width: 6px; height: 6px; border-radius: 50%; background: #10B981;"></span>Concluído</span>`;
    } else if (statusLower === 'em andamento' || statusLower === 'andamento') {
      statusTagHTML = `<span class="trello-card-status-tag status-andamento" style="background: #FEF3C7; color: #D97706; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;"><span style="width: 6px; height: 6px; border-radius: 50%; background: #F59E0B;"></span>Em Andamento</span>`;
    } else {
      statusTagHTML = `<span class="trello-card-status-tag status-pendente" style="background: #E2E8F0; color: #475569; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;"><span style="width: 6px; height: 6px; border-radius: 50%; background: #64748B;"></span>Pendente</span>`;
    }

    // Fallback to tags or visual mockup if array is empty
    let tagsHTML = '';
    if (t.tags && t.tags.length > 0) {
      tagsHTML = t.tags.map(tag => `<span class="trello-card-tag">${tag}</span>`).join('');
    } else {
      tagsHTML = `<span class="trello-card-tag" style="background: #E0E7FF; color: #4338CA;">Tarefa</span>`;
    }

    const padeiro = this.padeiros.find(p => p.id === t.padeiroId);
    const isSuccess = progress === 100;

    const list = this.kanbanLists.find(l => l.id === t.kanbanListId) || this.kanbanLists[0];
    const listColor = list ? list.cor : '#E5E7EB';

    // Format date badge (ex: 15/06)
    let dateBadgeHTML = '';
    if (t.data) {
      const parts = t.data.split('-');
      if (parts.length === 3) {
        const dateFmt = `${parts[2]}/${parts[1]}`;
        dateBadgeHTML = `<div class="trello-badge" title="Data: ${dateFmt}" style="background: rgba(229, 90, 43, 0.08); color: #E55A2B; border-radius: 4px; padding: 2px 6px; font-size: 11px;"><i data-lucide="calendar" size="12"></i> ${dateFmt}</div>`;
      }
    }

    // Format checklist badge
    const hasChecklist = t.checklist && t.checklist.length > 0;
    let checklistBadgeHTML = '';
    if (hasChecklist) {
      checklistBadgeHTML = `
        <div class="trello-badge ${isSuccess ? 'trello-badge-success' : ''}" title="Checklist: ${progress}%" style="border-radius: 4px; padding: 2px 6px; font-size: 11px; ${isSuccess ? 'background:#D1FAE5; color:#065F46;' : 'background:#F1F5F9; color:#64748B;'}">
          <i data-lucide="check-square" size="12"></i> ${progress}%
        </div>
      `;
    }

    // Format profit (lucro) badge
    let lucroBadgeHTML = '';
    const client = this.clientes ? this.clientes.find(c => c.id === t.clienteId || c.nome === t.clienteNome) : null;
    if (client) {
      const receita = parseFloat(client.receita) || 0;
      const custo = parseFloat(client.custoInsumos) || 0;
      const lucro = receita - custo;
      const lucroFormatado = `R$ ${lucro.toFixed(2).replace('.', ',')}`;
      const color = lucro >= 0 ? '#10B981' : '#EF4444';
      const bgColor = lucro >= 0 ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)';
      lucroBadgeHTML = `
        <div class="trello-badge" title="Ganho Líquido: ${lucroFormatado}" style="background: ${bgColor}; color: ${color}; border-radius: 4px; padding: 2px 6px; font-size: 11px; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">
          <i data-lucide="trending-up" size="12"></i> ${lucroFormatado}
        </div>
      `;
    }

    return `
    <div class="trello-card cascade-item" draggable="true"
         style="border-left: 4px solid ${listColor}; background: #FFFFFF; --index: ${index};"
         data-task-id="${t.id}"
         ondragstart="Cronograma.onDragStart(event, '${t.id}')"
         ondragend="Cronograma.onDragEnd(event)"
         onclick="Cronograma.openTaskDetail('${t.id}')">
         
      <button class="trello-card-edit-btn" onclick="event.stopPropagation(); Cronograma.openTaskDetail('${t.id}')">
        <i data-lucide="edit-2" size="14"></i>
      </button>

      <div class="trello-card-tags" style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 8px;">
        ${statusTagHTML}
        ${tagsHTML}
      </div>
      <h4 class="trello-card-title" style="font-size: 14px; font-weight: 700; color: var(--text-main); margin-bottom: 6px; line-height: 1.4;">${t.nome || t.tarefas || t.clienteNome || 'Tarefa sem nome'}</h4>
      <div class="trello-card-baker-name" style="font-size: 11px; color: #8C857B; margin-bottom: 12px; display: flex; align-items: center; gap: 4px;">
        <i data-lucide="user" size="12" style="color: #A39C93;"></i> Funcionário: ${padeiro ? padeiro.nome : 'Não definido'}
      </div>
      
      <div class="trello-card-badges" style="display: flex; gap: 6px; flex-wrap: wrap;">
        ${dateBadgeHTML}
        ${t.observacao ? `<div class="trello-badge" title="Descrição"><i data-lucide="align-left" size="14"></i></div>` : ''}
        ${checklistBadgeHTML}
        ${lucroBadgeHTML}
      </div>
      
      <div class="trello-card-progress-bar">
        <div class="trello-card-progress-fill ${isSuccess ? 'trello-progress-fill-success' : ''}" style="width: ${progress}%;"></div>
      </div>
    </div>`;
  },

  animateKanbanExit() {
    return new Promise(resolve => {
      const lists = document.querySelectorAll('.trello-list');
      if (lists.length === 0) {
        resolve();
        return;
      }
      lists.forEach((list, idx) => {
        list.classList.add('page-exit-active');
        list.style.animationDelay = `${idx * 0.04}s`;
      });
      setTimeout(resolve, 200 + (lists.length * 40));
    });
  },

  async prevWeek() {
    if (this.currentView === 'semanal') {
      await this.animateKanbanExit();
      this.weekOffset--;
      this.renderSemanal();
    } else {
      this.weekOffset--;
    }
  },

  async nextWeek() {
    if (this.currentView === 'semanal') {
      await this.animateKanbanExit();
      this.weekOffset++;
      this.renderSemanal();
    } else {
      this.weekOffset++;
    }
  },

  createKanbanList() {
    const PRESET_COLORS = [
      { hex: '#6B6560', label: 'Cinza' },
      { hex: '#D97706', label: 'Âmbar' },
      { hex: '#0F766E', label: 'Teal' },
      { hex: '#7C3AED', label: 'Roxo' },
      { hex: '#1D4ED8', label: 'Azul' },
      { hex: '#DC2626', label: 'Vermelho' },
      { hex: '#059669', label: 'Verde' },
      { hex: '#E55A2B', label: 'Laranja' },
    ];

    const swatchesHtml = PRESET_COLORS.map(c => `
      <button type="button"
        class="kl-color-swatch"
        style="background:${c.hex};"
        title="${c.label}"
        onclick="document.getElementById('kl-selected-color').value='${c.hex}'; document.querySelectorAll('.kl-color-swatch').forEach(s=>s.classList.remove('active')); this.classList.add('active');"
      ></button>
    `).join('');

    const contentHtml = `
      <div class="form-group" style="margin-bottom:20px;">
        <label style="font-size:12px;font-weight:600;color:#64748B;text-transform:uppercase;letter-spacing:0.05em;display:block;margin-bottom:8px;">Nome da Lista</label>
        <input id="kl-titulo"
          type="text"
          class="input-control"
          placeholder="Ex: Em Revisão, Aguardando..."
          style="width:100%;padding:10px 14px;border-radius:10px;border:1px solid #E2E8F0;font-size:14px;outline:none;"
          onkeydown="if(event.key==='Enter') document.getElementById('kl-save-btn').click()"
        />
      </div>
      <div class="form-group">
        <label style="font-size:12px;font-weight:600;color:#64748B;text-transform:uppercase;letter-spacing:0.05em;display:block;margin-bottom:10px;">Cor da Coluna</label>
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px;">
          ${swatchesHtml}
        </div>
        <div style="display:flex;align-items:center;gap:10px;">
          <input id="kl-selected-color" type="color" value="#7C3AED"
            style="width:40px;height:36px;border:1px solid #E2E8F0;border-radius:8px;cursor:pointer;padding:2px;"
            oninput="document.querySelectorAll('.kl-color-swatch').forEach(s=>s.classList.remove('active'));"
          />
          <span style="font-size:13px;color:#64748B;">Ou escolha uma cor personalizada</span>
        </div>
      </div>
      <style>
        .kl-color-swatch {
          width:32px; height:32px; border-radius:8px; border:2px solid transparent;
          cursor:pointer; transition:transform 0.15s, border-color 0.15s;
        }
        .kl-color-swatch:hover { transform:scale(1.1); }
        .kl-color-swatch.active { border-color:#1C1C1C; transform:scale(1.1); box-shadow:0 0 0 2px rgba(0,0,0,0.15); }
      </style>
    `;

    const footerHtml = `
      <button class="btn btn-secondary" onclick="Components.closeModal()">Cancelar</button>
      <button id="kl-save-btn" class="btn btn-primary" onclick="Cronograma._submitCreateKanbanList()">
        Criar Lista
      </button>
    `;

    Components.showModal('Nova Lista', contentHtml, footerHtml);
    setTimeout(() => { document.getElementById('kl-titulo')?.focus(); }, 100);
  },

  async _submitCreateKanbanList() {
    const titulo = document.getElementById('kl-titulo')?.value?.trim();
    const cor = document.getElementById('kl-selected-color')?.value || '#7C3AED';

    if (!titulo) {
      const input = document.getElementById('kl-titulo');
      if (input) { input.style.borderColor = '#DC2626'; input.focus(); }
      return;
    }

    const btn = document.getElementById('kl-save-btn');
    if (btn) { btn.disabled = true; btn.textContent = 'Criando...'; }

    try {
      const res = await API.post('/api/kanban-lists', { titulo, cor });
      this.kanbanLists.push(res);
      Components.closeModal();
      this.renderSemanal();
      Components.toast('Lista criada com sucesso!', 'success');
    } catch (e) {
      Components.toast('Erro ao criar lista: ' + e.message, 'error');
      if (btn) { btn.disabled = false; btn.textContent = 'Criar Lista'; }
    }
  },

  editKanbanList(id, currentTitulo, currentCor) {
    const PRESET_COLORS = [
      { hex: '#6B6560', label: 'Cinza' },
      { hex: '#D97706', label: 'Âmbar' },
      { hex: '#0F766E', label: 'Teal' },
      { hex: '#7C3AED', label: 'Roxo' },
      { hex: '#1D4ED8', label: 'Azul' },
      { hex: '#DC2626', label: 'Vermelho' },
      { hex: '#059669', label: 'Verde' },
      { hex: '#E55A2B', label: 'Laranja' },
    ];

    const safeCor = currentCor && currentCor.startsWith('#') ? currentCor : '#7C3AED';

    const swatchesHtml = PRESET_COLORS.map(c => {
      const isActive = c.hex.toLowerCase() === safeCor.toLowerCase();
      return `
        <button type="button"
          class="kl-color-swatch ${isActive ? 'active' : ''}"
          style="background:${c.hex};"
          title="${c.label}"
          onclick="document.getElementById('kl-edit-color').value='${c.hex}'; document.querySelectorAll('.kl-color-swatch').forEach(s=>s.classList.remove('active')); this.classList.add('active');"
        ></button>
      `;
    }).join('');

    const contentHtml = `
      <div class="form-group" style="margin-bottom:20px;">
        <label style="font-size:12px;font-weight:600;color:#64748B;text-transform:uppercase;letter-spacing:0.05em;display:block;margin-bottom:8px;">Nome da Lista</label>
        <input id="kl-edit-titulo"
          type="text"
          class="input-control"
          value="${currentTitulo}"
          style="width:100%;padding:10px 14px;border-radius:10px;border:1px solid #E2E8F0;font-size:14px;outline:none;"
          onkeydown="if(event.key==='Enter') document.getElementById('kl-edit-save-btn').click()"
        />
      </div>
      <div class="form-group">
        <label style="font-size:12px;font-weight:600;color:#64748B;text-transform:uppercase;letter-spacing:0.05em;display:block;margin-bottom:10px;">Cor da Coluna</label>
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px;">
          ${swatchesHtml}
        </div>
        <div style="display:flex;align-items:center;gap:10px;">
          <input id="kl-edit-color" type="color" value="${safeCor}"
            style="width:40px;height:36px;border:1px solid #E2E8F0;border-radius:8px;cursor:pointer;padding:2px;"
            oninput="document.querySelectorAll('.kl-color-swatch').forEach(s=>s.classList.remove('active'));"
          />
          <span style="font-size:13px;color:#64748B;">Ou escolha uma cor personalizada</span>
        </div>
      </div>
      <style>
        .kl-color-swatch {
          width:32px; height:32px; border-radius:8px; border:2px solid transparent;
          cursor:pointer; transition:transform 0.15s, border-color 0.15s;
        }
        .kl-color-swatch:hover { transform:scale(1.1); }
        .kl-color-swatch.active { border-color:#1C1C1C; transform:scale(1.1); box-shadow:0 0 0 2px rgba(0,0,0,0.15); }
      </style>
    `;

    const footerHtml = `
      <button class="btn btn-outline" style="margin-right:auto;border-color:rgba(239,68,68,0.25);color:#DC2626;"
        onclick="Cronograma._submitDeleteKanbanList('${id}')">
        Excluir Lista
      </button>
      <button class="btn btn-secondary" onclick="Components.closeModal()">Cancelar</button>
      <button id="kl-edit-save-btn" class="btn btn-primary" onclick="Cronograma._submitEditKanbanList('${id}')">
        Salvar
      </button>
    `;

    Components.showModal('Editar Lista', contentHtml, footerHtml);
    setTimeout(() => { const el = document.getElementById('kl-edit-titulo'); if (el) { el.focus(); el.select(); } }, 100);
  },

  async _submitEditKanbanList(id) {
    const titulo = document.getElementById('kl-edit-titulo')?.value?.trim();
    const cor = document.getElementById('kl-edit-color')?.value || '#7C3AED';

    if (!titulo) {
      const input = document.getElementById('kl-edit-titulo');
      if (input) { input.style.borderColor = '#DC2626'; input.focus(); }
      return;
    }

    const btn = document.getElementById('kl-edit-save-btn');
    if (btn) { btn.disabled = true; btn.textContent = 'Salvando...'; }

    try {
      const res = await API.put(`/api/kanban-lists/${id}`, { titulo, cor });
      const idx = this.kanbanLists.findIndex(l => l.id === id);
      if (idx !== -1) this.kanbanLists[idx] = res;
      Components.closeModal();
      this.renderSemanal();
      Components.toast('Lista atualizada!', 'success');
    } catch (e) {
      Components.toast('Erro: ' + e.message, 'error');
      if (btn) { btn.disabled = false; btn.textContent = 'Salvar'; }
    }
  },

  async _submitDeleteKanbanList(id) {
    Components.confirm(
      'Tem certeza? As tarefas desta lista ficarão sem lista definida.',
      async () => {
        try {
          await API.delete(`/api/kanban-lists/${id}`);
          this.kanbanLists = this.kanbanLists.filter(l => l.id !== id);
          this.renderSemanal();
          Components.toast('Lista excluída.', 'success');
        } catch (e) {
          Components.toast('Erro ao excluir: ' + e.message, 'error');
        }
      }
    );
  },

  async acceptNextTask(taskId) {
    if (!taskId) return;
    try {
      await API.patch(`/api/cronograma/agenda/${taskId}/status`, { status: 'concluida' });
      Components.toast('Visita concluída com sucesso! ✅', 'success');
      this.render(); // Recarrega dados e view
    } catch (e) {
      Components.toast('Erro ao concluir visita: ' + e.message, 'error');
    }
  },

  async rejectNextTask(taskId) {
    if (!taskId) return;
    this.openTaskDetail(taskId);
  },

  toggleFiltersCollapse() {
    const el = document.getElementById('filters-body-content');
    const chevron = document.getElementById('filters-chevron');
    if (el) {
      const isCollapsed = el.style.display === 'none';
      el.style.display = isCollapsed ? 'flex' : 'none';
      if (chevron) {
        chevron.setAttribute('data-lucide', isCollapsed ? 'chevron-up' : 'chevron-down');
        Components.renderIcons();
      }
    }
  },

  renderMobile(c) {
    const user = API.getUser() || {};
    const userName = user.nome ? user.nome.split(' ')[0] : 'Administrador';

    const currentHour = new Date().getHours();
    let greeting = 'Olá';
    if (currentHour >= 5 && currentHour < 12) {
      greeting = 'Bom dia';
    } else if (currentHour >= 12 && currentHour < 18) {
      greeting = 'Boa tarde';
    } else {
      greeting = 'Boa noite';
    }

    c.classList.remove('kanban-redesign-active', 'tf-page-active');
    document.body.classList.remove('kanban-redesign-active', 'tf-page-active');

    if (!this.currentMobileView) this.currentMobileView = 'dia';
    if (!this.selectedMobileDate) this.selectedMobileDate = new Date();

    const activeDate = this.selectedMobileDate || new Date();
    const weekdaysPt = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const monthsPt = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const formattedTopDate = `${weekdaysPt[activeDate.getDay()]}, ${activeDate.getDate()} ${monthsPt[activeDate.getMonth()]}`;

    let headerHTML = `
      <div class="m-header">
        <div class="m-header-top">
          <!-- Minimized logo -->
          <div class="m-header-logo-container">
            <svg id="Camada_1" data-name="Camada 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 681.79 415.58" height="50" style="height: 50px; width: auto;">
              <defs>
                <style>
                  .cls-1-mini {
                    stroke: rgba(245, 242, 230, 0);
                  }
                  .cls-1-mini, .cls-2-mini, .cls-3-mini {
                    fill: none;
                    stroke-miterlimit: 3.5;
                    stroke-width: 3.5px;
                  }
                  .cls-1-mini, .cls-3-mini {
                    stroke-linecap: round;
                  }
                  .cls-4-mini {
                    font-family: Arial-BoldMT, Arial;
                    font-size: 336.67px;
                    font-weight: 700;
                  }
                  .cls-2-mini, .cls-3-mini {
                    stroke: #f5f2e6;
                  }
                  .cls-5-mini {
                    fill: #e55b2c;
                    letter-spacing: 0em;
                  }
                  .cls-6-mini {
                    fill: #f5f2e6;
                  }
                  .cls-7-mini {
                    fill: #f5f2e8;
                  }
                </style>
              </defs>
              <g>
                <circle class="cls-2-mini" cx="619.99" cy="239.79" r="60.04"/>
                <line class="cls-3-mini" x1="589.33" y1="289.94" x2="562.07" y2="334.52"/>
              </g>
              <g>
                <line class="cls-3-mini" x1="4.62" y1="121.78" x2="115.45" y2="10.94"/>
                <line class="cls-1-mini" x1="4.62" y1="10.94" x2="115.45" y2="121.78"/>
                <path class="cls-6-mini" d="M16.16,103.3h87.74c8.93,0,16.16,7.24,16.16,16.16h0c0,8.93-7.24,16.16-16.16,16.16H16.16c-8.93,0-16.16-7.24-16.16-16.16h0c0-8.93,7.24-16.16,16.16-16.16Z"/>
                <rect class="cls-6-mini" x="18.47" y="1.71" width="32.33" height="92.36" rx="1.75" ry="1.75"/>
              </g>
              <text class="cls-4-mini" transform="translate(129.83 288.84)"><tspan class="cls-7-mini" x="0" y="0">b</tspan><tspan class="cls-5-mini" x="205.65" y="0">a</tspan></text>
            </svg>
          </div>
          <!-- Right: Date and notification badge -->
          <div class="m-header-top-right">
            <span class="m-header-top-date">${formattedTopDate}</span>
            <span class="m-header-top-badge">1</span>
          </div>
        </div>
        
        <div class="m-header-greeting-row">
          <div class="m-header-user">
            <h1 class="m-header-greeting">${greeting}, ${userName}!</h1>
            <p class="m-header-subtitle">Veja a programação de visitas:</p>
          </div>
          <!-- Hamburger menu icon -->
          <button class="m-menu-toggle-btn" onclick="App.openDrawer()">
            <i data-lucide="menu" style="color: #FFFFFF; width: 24px; height: 24px;"></i>
          </button>
        </div>

        <div class="m-header-controls-row">
          <div class="m-segmented-control">
            <button class="m-seg-btn ${this.currentMobileView === 'dia' ? 'active' : ''}" onclick="Cronograma.setMobileView('dia')">Dia</button>
            <button class="m-seg-btn ${this.currentMobileView === 'semana' ? 'active' : ''}" onclick="Cronograma.setMobileView('semana')">Semana</button>
            <button class="m-seg-btn ${this.currentMobileView === 'mes' ? 'active' : ''}" onclick="Cronograma.setMobileView('mes')">Mês</button>
          </div>
          <button class="m-search-btn">
            <i data-lucide="search" style="color: #FFFFFF; width: 22px; height: 22px;"></i>
          </button>
        </div>
      </div>
    `;

    let bodyHTML = '';
    if (this.currentMobileView === 'dia') {
      bodyHTML = this._renderMobileDailyView();
    } else if (this.currentMobileView === 'semana') {
      bodyHTML = this._renderMobileWeeklyView();
    } else {
      bodyHTML = this._renderMobileMonthlyView();
    }

    const fabHTML = `
      <button class="m-fab" onclick="Cronograma.openTaskForm(null, Cronograma.getLocalISO(Cronograma.selectedMobileDate))">
        <i data-lucide="plus"></i>
      </button>
    `;

    // Try to find the existing shell in the container
    let shell = c.querySelector('.m-layout-shell');
    if (shell) {
      // Shell exists: Update dynamic components to prevent blinking
      const dateEl = shell.querySelector('.m-header-top-date');
      if (dateEl) {
        dateEl.textContent = formattedTopDate;
      }

      // Update segmented controls active state
      const segBtns = shell.querySelectorAll('.m-seg-btn');
      segBtns.forEach(btn => {
        const text = btn.innerText.trim().toLowerCase();
        const isDia = text === 'dia';
        const isSemana = text === 'semana';
        const isMes = text === 'mês';
        btn.classList.toggle('active', 
          (isDia && this.currentMobileView === 'dia') ||
          (isSemana && this.currentMobileView === 'semana') ||
          (isMes && this.currentMobileView === 'mes')
        );
      });

      // Update the content container
      const contentEl = shell.querySelector('#m-content-container');
      if (contentEl) {
        contentEl.innerHTML = bodyHTML;
      }
      
      // Update FAB destination or date
      const fabEl = shell.querySelector('.m-fab');
      if (fabEl) {
        fabEl.setAttribute('onclick', `Cronograma.openTaskForm(null, Cronograma.getLocalISO(Cronograma.selectedMobileDate))`);
      }
    } else {
      // Shell doesn't exist: Render the full layout
      c.innerHTML = `
        <div class="m-layout-shell" style="background: #1C1A14; min-height: 100vh;">
          ${headerHTML}
          <div class="m-content-card" id="m-content-container">
            ${bodyHTML}
          </div>
          ${fabHTML}
        </div>
      `;
    }

    Components.renderIcons();
  },

  setMobileView(view) {
    this.currentMobileView = view;
    const c = document.getElementById('page-container');
    if (c) this.renderMobile(c);
  },

  changeMobileDate(offset) {
    this.navDirection = offset;
    const d = new Date(this.selectedMobileDate);
    d.setDate(d.getDate() + offset);
    this.selectedMobileDate = d;
    const c = document.getElementById('page-container');
    if (c) this.renderMobile(c);
  },

  changeMobileWeek(offset) {
    this.navDirection = offset;
    const d = new Date(this.selectedMobileDate);
    d.setDate(d.getDate() + (offset * 7));
    this.selectedMobileDate = d;
    const c = document.getElementById('page-container');
    if (c) this.renderMobile(c);
  },

  changeMobileMonth(offset) {
    this.navDirection = offset;
    const d = new Date(this.selectedMobileDate);
    d.setMonth(d.getMonth() + offset);
    const maxDays = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    if (d.getDate() > maxDays) {
      d.setDate(maxDays);
    }
    this.selectedMobileDate = d;
    const c = document.getElementById('page-container');
    if (c) this.renderMobile(c);
  },

  selectMobileDay(dayNum, monthOffset = 0) {
    this.navDirection = monthOffset;
    const d = new Date(this.selectedMobileDate);
    this.selectedMobileDate = new Date(d.getFullYear(), d.getMonth() + monthOffset, dayNum);
    if (this.currentMobileView !== 'mes') {
      this.currentMobileView = 'dia';
    }
    const c = document.getElementById('page-container');
    if (c) this.renderMobile(c);
  },

  _renderMobileDailyView() {
    const activeDate = this.selectedMobileDate;
    const navDir = this.navDirection || 0;
    const leftAnimClass = navDir === 1 ? 'left-slide-from-center' : '';
    const centerAnimClass = navDir === -1 ? 'slide-from-left' : (navDir === 1 ? 'slide-from-right' : 'scale-bounce');
    const rightAnimClass = navDir === -1 ? 'right-slide-from-center' : '';
    const prevDate = new Date(activeDate);
    prevDate.setDate(activeDate.getDate() - 1);
    const nextDate = new Date(activeDate);
    nextDate.setDate(activeDate.getDate() + 1);

    const monthsPt = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

    const prevDayNum = prevDate.getDate();
    const prevDayMonth = monthsPt[prevDate.getMonth()];

    const currDayNum = activeDate.getDate();
    const currDayMonth = monthsPt[activeDate.getMonth()];

    const nextDayNum = nextDate.getDate();
    const nextDayMonth = monthsPt[nextDate.getMonth()];

    const selectedDateStr = this.getLocalISO(activeDate);
    const dayTasks = this.tarefas.filter(t => this.isTaskOnDate(t, selectedDateStr));

    const tasksByHour = {};
    dayTasks.forEach(t => {
      const hr = (t.horario || '08:00').split(':')[0];
      const hourNum = parseInt(hr, 10);
      if (!isNaN(hourNum)) {
        if (!tasksByHour[hourNum]) tasksByHour[hourNum] = [];
        tasksByHour[hourNum].push(t);
      }
    });

    let timelineHTML = '';
    const shortDateLabel = `${activeDate.getDate()} ${currDayMonth}`;

    let cascadeIdx = 0;
    for (let h = 5; h <= 20; h++) {
      const hStr = `${String(h).padStart(2, '0')}:00`;
      const tasks = tasksByHour[h] || [];

      if (tasks.length === 0) {
        timelineHTML += `
          <div class="m-timeline-slot cascade-item" style="--index: ${cascadeIdx++};">
            <div class="m-slot-time">${hStr}</div>
            <div class="m-slot-card empty">Sem tarefas</div>
          </div>
        `;
      } else {
        tasks.forEach(t => {
          let statusColorTop = '#7A7567';
          let statusColorBottom = '#A19B8D';

          if (t.status === 'concluida') {
            statusColorTop = '#10B981';
            statusColorBottom = '#34D399';
          } else if (t.status === 'em_andamento') {
            statusColorTop = '#E55A2B';
            statusColorBottom = '#FF9A3C';
          }

          const timeStr = t.horario || hStr;
          const [hrPart, minPart] = timeStr.split(':');
          const hrVal = parseInt(hrPart, 10);
          const timeHour = hrVal > 12 ? hrVal - 12 : (hrVal === 0 ? 12 : hrVal);
          const timeAmpm = hrVal >= 12 ? 'PM' : 'AM';

          timelineHTML += `
            <div class="m-timeline-slot cascade-item" style="--index: ${cascadeIdx++};">
              <div class="m-slot-time">${hStr}</div>
              <div class="m-slot-card active" onclick="Cronograma.openTaskDetail('${t.id}')">
                <div class="m-card-stripe split-stripe">
                  <div class="stripe-top" style="background: ${statusColorTop};">
                    <span class="stripe-time-num">${timeHour}</span>
                    <span class="stripe-time-suffix">${timeAmpm}</span>
                  </div>
                  <div class="stripe-bottom" style="background: ${statusColorBottom};">
                    <span class="stripe-date-num">${currDayNum}</span>
                    <span class="stripe-date-month">${currDayMonth}</span>
                  </div>
                </div>
                <div class="m-card-content">
                  <div class="m-card-header-row">
                    <span class="m-card-title">${t.nome || t.tarefas || t.clienteNome || 'Tarefa sem nome'}</span>
                    <i data-lucide="chevron-right" class="m-chevron-icon" style="width: 20px; height: 20px;"></i>
                  </div>
                  <span class="m-card-desc">${t.descricao || t.tipo || 'Visita agendada'}</span>
                  <hr class="m-card-divider">
                  <div class="m-card-footer">
                    <span class="m-card-attendees">
                      <i data-lucide="users" style="width: 14px; height: 14px; margin-right: 6px; color: #7A7567;"></i>
                      ${t.padeiroNome || 'Não atribuído'}
                    </span>
                    <i data-lucide="calendar" style="width: 16px; height: 16px; color: #7A7567;"></i>
                  </div>
                </div>
              </div>
            </div>
          `;
        });
      }
    }

    return `
      <div class="m-date-nav-row">
        <div class="m-date-adjacent-col ${leftAnimClass}" onclick="Cronograma.changeMobileDate(-1)">
          <span class="m-adj-day">${prevDayNum}</span>
          <span class="m-adj-month">${prevDayMonth}</span>
        </div>
        <button class="m-nav-arrow-btn" onclick="Cronograma.changeMobileDate(-1)">
          <i data-lucide="chevron-left"></i>
        </button>
        <div class="m-date-current-col ${centerAnimClass}">
          <span class="m-curr-day">${currDayNum}</span>
          <span class="m-curr-month">${currDayMonth}</span>
        </div>
        <button class="m-nav-arrow-btn" onclick="Cronograma.changeMobileDate(1)">
          <i data-lucide="chevron-right"></i>
        </button>
        <div class="m-date-adjacent-col ${rightAnimClass}" onclick="Cronograma.changeMobileDate(1)">
          <span class="m-adj-day">${nextDayNum}</span>
          <span class="m-adj-month">${nextDayMonth}</span>
        </div>
      </div>
      
      <div class="m-timeline-container">
        ${timelineHTML}
      </div>
    `;
  },

  _renderMobileWeeklyView() {
    const activeDate = this.selectedMobileDate;
    const navDir = this.navDirection || 0;
    const leftAnimClass = navDir === 1 ? 'left-slide-from-center' : '';
    const centerAnimClass = navDir === -1 ? 'slide-from-left' : (navDir === 1 ? 'slide-from-right' : 'scale-bounce');
    const rightAnimClass = navDir === -1 ? 'right-slide-from-center' : '';
    const dayOfWeek = activeDate.getDay();
    const monday = new Date(activeDate);
    monday.setDate(activeDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      dates.push(d);
    }

    const monthsPt = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const weekdaysPtShort = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'];

    const sunday = dates[6];

    const getWeekLabelAndMonth = (start, end) => {
      const startM = monthsPt[start.getMonth()];
      const endM = monthsPt[end.getMonth()];
      const label = `${start.getDate()} - ${end.getDate()}`;
      const month = startM === endM ? startM : `${startM}/${endM}`;
      return { label, month };
    };

    const prevMonday = new Date(monday);
    prevMonday.setDate(monday.getDate() - 7);
    const prevSunday = new Date(prevMonday);
    prevSunday.setDate(prevMonday.getDate() + 6);

    const nextMonday = new Date(monday);
    nextMonday.setDate(monday.getDate() + 7);
    const nextSunday = new Date(nextMonday);
    nextSunday.setDate(nextMonday.getDate() + 6);

    const prevInfo = getWeekLabelAndMonth(prevMonday, prevSunday);
    const currInfo = getWeekLabelAndMonth(monday, sunday);
    const nextInfo = getWeekLabelAndMonth(nextMonday, nextSunday);

    let gridColsHTML = '';
    dates.forEach((date, idx) => {
      const dateStr = this.getLocalISO(date);
      const dayTasks = this.tarefas.filter(t => this.isTaskOnDate(t, dateStr));
      const isToday = date.toDateString() === activeDate.toDateString();
      const hasTasks = dayTasks.length > 0;

      const dayName = weekdaysPtShort[idx];
      const dayNum = date.getDate();
      const monthName = monthsPt[date.getMonth()];
      const datePillClass = hasTasks ? 'has-tasks' : '';

      let slotsHTML = '';
      for (let h = 8; h <= 18; h++) {
        const hStr = `${String(h).padStart(2, '0')}:00`;
        const tasks = dayTasks.filter(t => {
          const tHr = parseInt((t.horario || '08:00').split(':')[0], 10);
          return tHr === h;
        });

        if (tasks.length === 0) {
          slotsHTML += `
            <div class="m-week-slot empty" onclick="Cronograma.openTaskForm(null, '${dateStr}', '${hStr}')"></div>
          `;
        } else {
          const t = tasks[0];
          const hrVal = h;
          const timeHour = hrVal > 12 ? hrVal - 12 : (hrVal === 0 ? 12 : hrVal);
          const timeAmpm = hrVal >= 12 ? 'PM' : 'AM';
          const displayTime = `${timeHour} ${timeAmpm}`;

          slotsHTML += `
            <div class="m-week-slot active" onclick="Cronograma.openTaskDetail('${t.id}')">
              <span>${displayTime}</span>
            </div>
          `;
        }
      }

      gridColsHTML += `
        <div class="m-week-col ${isToday ? 'is-today' : ''} cascade-item" style="--index: ${idx};">
          <div class="m-week-col-header">
            <span class="m-week-col-weekday">${dayName}</span>
            <div class="m-week-col-date-pill ${datePillClass}">
              <span class="m-week-col-day-num">${dayNum}</span>
              <span class="m-week-col-day-month">${monthName}</span>
            </div>
          </div>
          <div class="m-week-col-slots">
            ${slotsHTML}
          </div>
        </div>
      `;
    });

    return `
      <div class="m-date-nav-row week-mode">
        <div class="m-date-adjacent-col ${leftAnimClass}" onclick="Cronograma.changeMobileWeek(-1)">
          <span class="m-adj-day">${prevInfo.label}</span>
          <span class="m-adj-month">${prevInfo.month}</span>
        </div>
        <button class="m-nav-arrow-btn" onclick="Cronograma.changeMobileWeek(-1)">
          <i data-lucide="chevron-left"></i>
        </button>
        <div class="m-date-current-col ${centerAnimClass}">
          <span class="m-curr-day" style="font-size: 16px;">${currInfo.label}</span>
          <span class="m-curr-month">${currInfo.month}</span>
        </div>
        <button class="m-nav-arrow-btn" onclick="Cronograma.changeMobileWeek(1)">
          <i data-lucide="chevron-right"></i>
        </button>
        <div class="m-date-adjacent-col ${rightAnimClass}" onclick="Cronograma.changeMobileWeek(1)">
          <span class="m-adj-day">${nextInfo.label}</span>
          <span class="m-adj-month">${nextInfo.month}</span>
        </div>
      </div>
      
      <div class="m-week-grid-container">
        ${gridColsHTML}
      </div>
    `;
  },

  _renderMobileMonthlyView() {
    const activeDate = this.selectedMobileDate;
    const navDir = this.navDirection || 0;
    const leftAnimClass = navDir === 1 ? 'left-slide-from-center' : '';
    const centerAnimClass = navDir === -1 ? 'slide-from-left' : (navDir === 1 ? 'slide-from-right' : 'scale-bounce');
    const rightAnimClass = navDir === -1 ? 'right-slide-from-center' : '';
    const year = activeDate.getFullYear();
    const monthIdx = activeDate.getMonth();

    const realMonthsPt = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

    const prevMonthIdx = monthIdx === 0 ? 11 : monthIdx - 1;
    const prevMonthYear = monthIdx === 0 ? year - 1 : year;
    const nextMonthIdx = monthIdx === 11 ? 0 : monthIdx + 1;
    const nextMonthYear = monthIdx === 11 ? year + 1 : year;

    const firstDayOfMonth = new Date(year, monthIdx, 1);
    let startDayOfWeek = firstDayOfMonth.getDay();
    let offset = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

    const totalDays = new Date(year, monthIdx + 1, 0).getDate();
    const prevMonthLastDay = new Date(year, monthIdx, 0).getDate();

    let gridHTML = '';
    let cellIndex = 0;

    // Preceding month days
    for (let i = 0; i < offset; i++) {
      const day = prevMonthLastDay - offset + i + 1;
      const dateStr = `${prevMonthYear}-${String(prevMonthIdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const tasksOnDay = this.tarefas.filter(t => this.isTaskOnDate(t, dateStr));
      const taskCount = tasksOnDay.length;
      const rowIndex = Math.floor(cellIndex / 7);
      cellIndex++;

      gridHTML += `
        <div class="m-cal-cell adjacent-month cascade-item" style="--index: ${rowIndex};" onclick="Cronograma.selectMobileDay(${day}, -1)">
          <div class="m-cal-inner">
            ${taskCount > 0 ? `<span class="m-cal-badge">${taskCount}</span>` : `<span class="m-cal-badge-empty"></span>`}
            <span class="m-cal-day-num">${day}</span>
          </div>
        </div>
      `;
    }

    // Current month days
    for (let d = 1; d <= totalDays; d++) {
      const isSelected = d === activeDate.getDate();
      const dateStr = `${year}-${String(monthIdx + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const tasksOnDay = this.tarefas.filter(t => this.isTaskOnDate(t, dateStr));
      const taskCount = tasksOnDay.length;
      const rowIndex = Math.floor(cellIndex / 7);
      cellIndex++;

      gridHTML += `
        <div class="m-cal-cell ${isSelected ? 'selected' : ''} cascade-item" style="--index: ${rowIndex};" onclick="Cronograma.selectMobileDay(${d}, 0)">
          <div class="m-cal-inner">
            ${taskCount > 0 ? `<span class="m-cal-badge">${taskCount}</span>` : `<span class="m-cal-badge-empty"></span>`}
            <span class="m-cal-day-num">${d}</span>
          </div>
        </div>
      `;
    }

    // Succeeding month days (fill the grid)
    const totalCells = (offset + totalDays) <= 35 ? 35 : 42;
    const nextDaysCount = totalCells - (offset + totalDays);

    for (let j = 1; j <= nextDaysCount; j++) {
      const dateStr = `${nextMonthYear}-${String(nextMonthIdx + 1).padStart(2, '0')}-${String(j).padStart(2, '0')}`;
      const tasksOnDay = this.tarefas.filter(t => this.isTaskOnDate(t, dateStr));
      const taskCount = tasksOnDay.length;
      const rowIndex = Math.floor(cellIndex / 7);
      cellIndex++;

      gridHTML += `
        <div class="m-cal-cell adjacent-month cascade-item" style="--index: ${rowIndex};" onclick="Cronograma.selectMobileDay(${j}, 1)">
          <div class="m-cal-inner">
            ${taskCount > 0 ? `<span class="m-cal-badge">${taskCount}</span>` : `<span class="m-cal-badge-empty"></span>`}
            <span class="m-cal-day-num">${j}</span>
          </div>
        </div>
      `;
    }

    return `
      <div class="m-date-nav-row month-mode">
        <div class="m-date-adjacent-col ${leftAnimClass}" onclick="Cronograma.changeMobileMonth(-1)">
          <span class="m-adj-month">${realMonthsPt[prevMonthIdx]}</span>
          <span class="m-adj-year">${prevMonthYear}</span>
        </div>
        <button class="m-nav-arrow-btn" onclick="Cronograma.changeMobileMonth(-1)">
          <i data-lucide="chevron-left"></i>
        </button>
        <div class="m-date-current-col ${centerAnimClass}">
          <span class="m-curr-month">${realMonthsPt[monthIdx]}</span>
          <span class="m-curr-year">${year}</span>
        </div>
        <button class="m-nav-arrow-btn" onclick="Cronograma.changeMobileMonth(1)">
          <i data-lucide="chevron-right"></i>
        </button>
        <div class="m-date-adjacent-col ${rightAnimClass}" onclick="Cronograma.changeMobileMonth(1)">
          <span class="m-adj-month">${realMonthsPt[nextMonthIdx]}</span>
          <span class="m-adj-year">${nextMonthYear}</span>
        </div>
      </div>
      
      <div class="m-cal-grid">
        <div class="m-cal-weekday">Seg</div>
        <div class="m-cal-weekday">Ter</div>
        <div class="m-cal-weekday">Qua</div>
        <div class="m-cal-weekday">Qui</div>
        <div class="m-cal-weekday">Sex</div>
        <div class="m-cal-weekday">Sáb</div>
        <div class="m-cal-weekday">Dom</div>
        ${gridHTML}
      </div>
    `;
  },

  renderCalendario() {
    const cc = document.getElementById('cronograma-content');
    if (!cc) return;

    if (!this.calSelectedDate) this.calSelectedDate = new Date();
    if (this.calSelectedBoxId === undefined) this.calSelectedBoxId = '';
    if (this.calSearchTerm === undefined) this.calSearchTerm = '';
    if (this.calStatusFilter === undefined) this.calStatusFilter = '';
    if (this.calCreatorPage === undefined) this.calCreatorPage = 1;

    const currYear = this.calSelectedDate.getFullYear();
    const currMonth = this.calSelectedDate.getMonth();
    const currentMonthISO = `${currYear}-${String(currMonth + 1).padStart(2, '0')}`;
    const todayISO = Cronograma.getLocalISO(new Date());

    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    // 1. DATA AGGREGATION & CAIXAS ORGANIZADORAS (DA ABA PLANEJAMENTO)
    const cleanBoxName = (name) => {
      if (!name) return 'Caixa de Conteúdo';
      return name.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
    };

    let planCaixas = [];
    if (window.Planejamento && Array.isArray(window.Planejamento.caixas) && window.Planejamento.caixas.length > 0) {
      planCaixas = window.Planejamento.caixas;
    } else {
      try {
        const saved = localStorage.getItem('tomada_planejamento_caixas');
        if (saved) {
          planCaixas = JSON.parse(saved);
        }
      } catch (e) {}
    }

    if (!planCaixas || planCaixas.length === 0) {
      planCaixas = [
        { id: 'cx_1', nome: 'Ideias Brutas & Roteiros', cor: '#E55A2B', tema: 'theme-orange' },
        { id: 'cx_2', nome: 'Em Gravação & Produção', cor: '#1C1A14', tema: 'theme-dark' },
        { id: 'cx_3', nome: 'Prontos para Editar & Postar', cor: '#34C759', tema: 'theme-green' }
      ];
    }

    let planCards = [];
    if (window.Planejamento && Array.isArray(window.Planejamento.cards) && window.Planejamento.cards.length > 0) {
      planCards = window.Planejamento.cards;
    } else {
      try {
        const savedCards = localStorage.getItem('tomada_planejamento_cards');
        if (savedCards) {
          planCards = JSON.parse(savedCards);
        }
      } catch (e) {}
    }

    const allTarefas = Array.isArray(this.tarefas) ? [...this.tarefas] : [];

    planCards.forEach(card => {
      if (!allTarefas.some(t => t.id === card.id)) {
        allTarefas.push({
          id: card.id,
          tarefas: card.titulo,
          observacao: card.descricao,
          data: card.prazo || todayISO,
          status: card.status || 'pendente',
          caixaId: card.caixaId,
          clienteId: card.caixaId,
          clienteNome: 'Planejamento'
        });
      }
    });

    const boxesMap = new Map();

    boxesMap.set('', {
      id: '',
      nome: 'Todas as Caixas',
      categoria: 'Visão Geral do Canal',
      icon: 'layers',
      totalTarefas: 0,
      concluidas: 0
    });

    planCaixas.forEach((cx, idx) => {
      const bId = cx.id || `cx_${idx}`;
      const cName = cleanBoxName(cx.nome);
      let icon = 'box';
      const cLower = cName.toLowerCase();
      if (cLower.includes('ideia') || cLower.includes('roteiro')) icon = 'file-text';
      else if (cLower.includes('grava') || cLower.includes('produc')) icon = 'video';
      else if (cLower.includes('edit') || cLower.includes('post')) icon = 'scissors';
      else if (idx % 3 === 0) icon = 'folder';
      else if (idx % 3 === 1) icon = 'film';

      boxesMap.set(bId, {
        id: bId,
        nome: cName,
        categoria: 'Caixa Organizadora',
        icon: icon,
        totalTarefas: 0,
        concluidas: 0,
        data: cx
      });
    });

    const monthlyTarefas = allTarefas.filter(t => t.data && String(t.data).slice(0, 7) === currentMonthISO);

    monthlyTarefas.forEach(t => {
      const isDone = (t.status || '').toLowerCase().includes('conclu') || t.concluido;
      const globalBox = boxesMap.get('');
      if (globalBox) {
        globalBox.totalTarefas++;
        if (isDone) globalBox.concluidas++;
      }

      let boxKey = t.caixaId || t.clienteId;
      if (!boxKey) {
        for (const [key, boxObj] of boxesMap.entries()) {
          if (key !== '' && boxObj.nome && (
            (t.tarefas || '').toLowerCase().includes(boxObj.nome.toLowerCase()) ||
            (t.clienteNome || '').toLowerCase().includes(boxObj.nome.toLowerCase())
          )) {
            boxKey = key;
            break;
          }
        }
      }

      if (boxKey && boxesMap.has(boxKey)) {
        const box = boxesMap.get(boxKey);
        box.totalTarefas++;
        if (isDone) box.concluidas++;
      }
    });

    const boxesList = Array.from(boxesMap.values());

    // 2. PAGINATION & FILTERING FOR LEFT SIDEBAR
    const pageSize = 5;
    const totalPages = Math.ceil(Math.max(1, boxesList.length - 1) / pageSize);
    const currentPage = Math.min(Math.max(1, this.calCreatorPage), totalPages);

    const paginatedBoxes = [
      boxesList[0],
      ...boxesList.slice(1 + (currentPage - 1) * pageSize, 1 + currentPage * pageSize)
    ];

    const leftSidebarHtml = `
      <div class="cal-left-sidebar cal-cascade-animate">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:4px;">
          <h3 style="font-size:13px; font-weight:800; color:#7A7567; text-transform:uppercase; letter-spacing:0.5px; margin:0;">
            Caixas Organizadoras
          </h3>
          <span style="font-size:11px; font-weight:700; color:#E55A2B; background:rgba(229,90,43,0.1); padding:2px 8px; border-radius:99px;">
            ${boxesList.length - 1} caixas
          </span>
        </div>

        ${paginatedBoxes.map(b => {
          const isActive = this.calSelectedBoxId === b.id;
          const pct = b.totalTarefas > 0 ? Math.round((b.concluidas / b.totalTarefas) * 100) : 100;
          const fillClass = pct === 100 ? 'cal-progress-fill-green' : (pct >= 50 ? 'cal-progress-fill-orange' : 'cal-progress-fill-amber');
          
          return `
            <div class="cal-person-card ${isActive ? 'active' : ''}" onclick="Cronograma.selectCalBox('${b.id}')">
              <div class="cal-person-info">
                <div class="cal-person-avatar" style="background: ${isActive ? '#E55A2B' : '#FAF8F5'}; color: ${isActive ? '#FFFFFF' : '#1C1A14'}; border: 1px solid #EBE5DF;">
                  <i data-lucide="${b.icon || 'box'}" style="width: 20px; height: 20px;"></i>
                </div>
                <div class="cal-person-details" style="flex:1; min-width:0;">
                  <div class="cal-person-name" style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${b.nome}</div>
                  <div class="cal-person-role">${b.categoria}</div>
                </div>
              </div>
              <div class="cal-progress-bar-container">
                <div style="display:flex; justify-content:space-between; font-size:10px; font-weight:700; color:#7A7567; margin-bottom:2px;">
                  <span>${b.concluidas}/${b.totalTarefas} entregas</span>
                  <span>${pct}%</span>
                </div>
                <div class="cal-progress-bar">
                  <div class="${fillClass}" style="width: ${pct}%;"></div>
                </div>
              </div>
            </div>
          `;
        }).join('')}

        ${totalPages > 1 ? `
          <div class="cal-left-pagination">
            <button class="cal-page-btn nav" onclick="Cronograma.setCalPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled style="opacity:0.4;"' : ''}>
              <i data-lucide="chevron-left"></i>
            </button>
            <span style="font-size:12px; font-weight:700; color:#1C1A14; margin:0 4px;">Página ${currentPage} de ${totalPages}</span>
            <button class="cal-page-btn nav" onclick="Cronograma.setCalPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled style="opacity:0.4;"' : ''}>
              <i data-lucide="chevron-right"></i>
            </button>
          </div>
        ` : ''}
      </div>
    `;

    // 3. CALENDAR MONTH GRID COMPUTATION
    const firstDayObj = new Date(currYear, currMonth, 1);
    const lastDayObj = new Date(currYear, currMonth + 1, 0);
    const totalDaysInMonth = lastDayObj.getDate();

    let startingDayOfWeek = (firstDayObj.getDay() + 6) % 7;

    const prevMonthLastDayObj = new Date(currYear, currMonth, 0);
    const prevMonthTotalDays = prevMonthLastDayObj.getDate();

    const gridDays = [];

    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const pDay = prevMonthTotalDays - i;
      const pMonth = currMonth === 0 ? 11 : currMonth - 1;
      const pYear = currMonth === 0 ? currYear - 1 : currYear;
      const iso = `${pYear}-${String(pMonth + 1).padStart(2, '0')}-${String(pDay).padStart(2, '0')}`;
      gridDays.push({ dayNum: pDay, iso, isOtherMonth: true });
    }

    for (let d = 1; d <= totalDaysInMonth; d++) {
      const iso = `${currYear}-${String(currMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      gridDays.push({ dayNum: d, iso, isOtherMonth: false });
    }

    const totalGridCells = gridDays.length <= 35 ? 35 : 42;
    let nextMonthDay = 1;
    while (gridDays.length < totalGridCells) {
      const nMonth = currMonth === 11 ? 0 : currMonth + 1;
      const nYear = currMonth === 11 ? currYear + 1 : currYear;
      const iso = `${nYear}-${String(nMonth + 1).padStart(2, '0')}-${String(nextMonthDay).padStart(2, '0')}`;
      gridDays.push({ dayNum: nextMonthDay, iso, isOtherMonth: true });
      nextMonthDay++;
    }

    // 4. FILTER TASKS FOR CENTER CALENDAR
    const activeBox = boxesMap.get(this.calSelectedBoxId) || boxesMap.get('');
    const boxFilterName = activeBox ? activeBox.nome.toLowerCase() : '';

    let filteredTasks = allTarefas.filter(t => {
      if (this.calSelectedBoxId) {
        const matchesBox = t.caixaId === this.calSelectedBoxId || 
                           t.clienteId === this.calSelectedBoxId || 
                           t.padeiroId === this.calSelectedBoxId || 
                           (t.clienteNome && t.clienteNome.toLowerCase().includes(boxFilterName)) ||
                           (t.tarefas && t.tarefas.toLowerCase().includes(boxFilterName));
        if (!matchesBox) return false;
      }

      if (this.calSearchTerm) {
        const term = this.calSearchTerm.toLowerCase();
        const title = (t.tarefas || t.nome || t.observacao || '').toLowerCase();
        const client = (t.clienteNome || '').toLowerCase();
        const baker = (t.padeiroNome || '').toLowerCase();
        if (!title.includes(term) && !client.includes(term) && !baker.includes(term)) return false;
      }

      if (this.calStatusFilter) {
        const st = (t.status || '').toLowerCase();
        if (this.calStatusFilter === 'gravacao' && !st.includes('andamento') && !st.includes('execu')) return false;
        if (this.calStatusFilter === 'edicao' && !st.includes('revis') && !st.includes('edicao')) return false;
        if (this.calStatusFilter === 'publicado' && !st.includes('conclu') && st !== 'aprovado') return false;
        if (this.calStatusFilter === 'roteiro' && !st.includes('pendente') && !st.includes('aberto')) return false;
      }

      return true;
    });

    const countGravacao = allTarefas.filter(t => (t.status || '').toLowerCase().includes('andamento') || (t.status || '').toLowerCase().includes('execu')).length;
    const countEdicao = allTarefas.filter(t => (t.status || '').toLowerCase().includes('revis') || (t.status || '').toLowerCase().includes('edicao')).length;
    const countPublicado = allTarefas.filter(t => (t.status || '').toLowerCase().includes('conclu') || (t.status || '').toLowerCase() === 'aprovado').length;
    const countRoteiro = allTarefas.filter(t => (t.status || '').toLowerCase().includes('pendente') || (t.status || '').toLowerCase().includes('aberto')).length;

    const totalMonthTasks = filteredTasks.filter(t => t.data && String(t.data).slice(0, 7) === currentMonthISO);
    const totalMinutes = totalMonthTasks.reduce((sum, t) => sum + (parseInt(t.tempoMinimoMinutos, 10) || 45), 0);
    const totalHoursStr = (totalMinutes / 60).toFixed(1);

    const centerContentHtml = `
      <div class="cal-center-content">
        <!-- Top Search Bar -->
        <div class="cal-top-bar cal-cascade-animate">
          <div class="cal-search-group">
            <i data-lucide="search" style="color: #7A7567; width: 18px; height: 18px;"></i>
            <input type="text" class="cal-search-input" placeholder="Buscar por título do conteúdo, canal ou palavra-chave..." value="${this.calSearchTerm}" oninput="Cronograma.onCalSearch(this.value)" />
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <button class="cal-icon-btn" title="Filtrar por Status" onclick="Cronograma.toggleCalStatusFilter()"><i data-lucide="sliders-horizontal" style="width: 18px; height: 18px;"></i></button>
            <button class="cal-icon-btn" title="Resumo do Mês" onclick="Cronograma.showCalStatsModal()"><i data-lucide="bar-chart-3" style="width: 18px; height: 18px;"></i></button>
            <button class="cal-icon-btn cal-top-btn-plus" title="Agendar Novo Conteúdo" onclick="Cronograma.openTaskForm()"><i data-lucide="plus" style="width: 18px; height: 18px;"></i></button>
          </div>
        </div>

        <!-- Stats & Month Selector Row -->
        <div class="cal-stats-row cal-cascade-animate">
          <div>
            <div class="cal-stats-title">${totalMonthTasks.length} Conteúdos / ${totalHoursStr}h de produção</div>
            <div style="font-size:12px; color:#7A7567; font-weight:600; margin-top:2px;">
              Planejamento ativo: <strong style="color:#E55A2B;">${activeBox ? activeBox.nome : 'Todas as Caixas'}</strong>
            </div>
          </div>

          <!-- Month Selector -->
          <div class="cal-month-select-wrap">
            <button class="cal-page-btn nav" title="Mês Anterior" onclick="Cronograma.prevCalMonth()"><i data-lucide="chevron-left"></i></button>
            <select class="cal-month-select" onchange="Cronograma.onCalMonthChange(this.value)">
              ${Array.from({ length: 12 }, (_, mIdx) => {
                const val = `${currYear}-${String(mIdx + 1).padStart(2, '0')}`;
                const label = `${monthNames[mIdx]} ${currYear}`;
                const isSel = mIdx === currMonth;
                return `<option value="${val}" ${isSel ? 'selected' : ''}>${label}</option>`;
              }).join('')}
            </select>
            <button class="cal-page-btn nav" title="Próximo Mês" onclick="Cronograma.nextCalMonth()"><i data-lucide="chevron-right"></i></button>
          </div>
        </div>

        <!-- Status Pills (NO EMOJIS - SVG ICON INTEGRATED) -->
        <div class="cal-pills-container cal-cascade-animate">
          <div class="cal-pill-item ${!this.calStatusFilter ? 'active' : ''} black" onclick="Cronograma.filterCalStatus('')">
            <i data-lucide="layers" style="width:14px; height:14px;"></i>
            <span>Todos</span>
            <span class="cal-pill-badge">${allTarefas.length}</span>
          </div>
          <div class="cal-pill-item ${this.calStatusFilter === 'gravacao' ? 'active' : ''} orange" onclick="Cronograma.filterCalStatus('gravacao')">
            <i data-lucide="video" style="width:14px; height:14px;"></i>
            <span>Em Gravação</span>
            <span class="cal-pill-badge">${countGravacao}</span>
          </div>
          <div class="cal-pill-item ${this.calStatusFilter === 'edicao' ? 'active' : ''} amber" onclick="Cronograma.filterCalStatus('edicao')">
            <i data-lucide="scissors" style="width:14px; height:14px;"></i>
            <span>Em Edição</span>
            <span class="cal-pill-badge">${countEdicao}</span>
          </div>
          <div class="cal-pill-item ${this.calStatusFilter === 'publicado' ? 'active' : ''} green" onclick="Cronograma.filterCalStatus('publicado')">
            <i data-lucide="check-circle-2" style="width:14px; height:14px;"></i>
            <span>Publicados</span>
            <span class="cal-pill-badge">${countPublicado}</span>
          </div>
          <div class="cal-pill-item ${this.calStatusFilter === 'roteiro' ? 'active' : ''} blue" onclick="Cronograma.filterCalStatus('roteiro')">
            <i data-lucide="file-text" style="width:14px; height:14px;"></i>
            <span>Roteiros</span>
            <span class="cal-pill-badge">${countRoteiro}</span>
          </div>
        </div>

        <!-- Calendar Month Grid -->
        <div class="cal-grid-wrapper cal-cascade-animate">
          <div class="cal-grid-header">
            <div class="cal-grid-header-day">Seg</div>
            <div class="cal-grid-header-day">Ter</div>
            <div class="cal-grid-header-day">Qua</div>
            <div class="cal-grid-header-day">Qui</div>
            <div class="cal-grid-header-day">Sex</div>
            <div class="cal-grid-header-day weekend">Sáb</div>
            <div class="cal-grid-header-day weekend">Dom</div>
          </div>

          <div class="cal-grid-body">
            ${gridDays.map(cell => {
              const dayTasks = filteredTasks.filter(t => Cronograma.isTaskOnDate(t, cell.iso));
              const isToday = cell.iso === todayISO;

              return `
                <div class="cal-day-cell ${cell.isOtherMonth ? 'other-month' : ''} ${isToday ? 'is-today' : ''}" onclick="Cronograma.openCalNewTaskModal('${cell.iso}')">
                  <div style="display:flex; justify-content:space-between; align-items:center; flex-shrink:0;">
                    <span class="cal-day-num">${cell.dayNum}</span>
                    ${isToday ? `<span style="font-size:9px; font-weight:800; color:#E55A2B; text-transform:uppercase;">Hoje</span>` : ''}
                  </div>

                  <div class="cal-day-events-list">
                    ${dayTasks.map(t => {
                      const st = (t.status || '').toLowerCase();
                      let stripClass = 'cal-event-strip-dark';
                      let statusIcon = 'file-text';

                      if (st.includes('conclu') || st === 'aprovado') {
                        stripClass = 'cal-event-strip-green';
                        statusIcon = 'check-circle-2';
                      } else if (st.includes('andamento') || st.includes('execu')) {
                        stripClass = 'cal-event-strip-orange';
                        statusIcon = 'video';
                      } else if (st.includes('revis') || st.includes('edicao')) {
                        stripClass = 'cal-event-strip-amber';
                        statusIcon = 'scissors';
                      } else if (st.includes('pendente') || st.includes('aberto')) {
                        stripClass = 'cal-event-strip-blue';
                        statusIcon = 'file-text';
                      }

                      const titleText = t.tarefas || t.nome || t.observacao || 'Novo Conteúdo';
                      const displayTitle = titleText.length > 14 ? titleText.substring(0, 12) + '...' : titleText;

                      return `
                        <div class="cal-event-strip ${stripClass}" title="${titleText}" onclick="Cronograma.selectCalTask('${t.id}', event)">
                          <i data-lucide="${statusIcon}" style="width:12px; height:12px; flex-shrink:0;"></i>
                          <span style="overflow:hidden; text-overflow:ellipsis;">${displayTitle}</span>
                        </div>
                      `;
                    }).join('')}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;

    // 5. RIGHT SIDEBAR DETAILS (SELECTED TASK OR SELECTED BOX)
    let rightSidebarHtml = '';
    const selectedTask = this.calSelectedTaskId ? allTarefas.find(t => t.id === this.calSelectedTaskId) : null;

    if (selectedTask) {
      const st = (selectedTask.status || '').toLowerCase();
      let statusBadge = '<span style="background:rgba(229,90,43,0.12); color:#E55A2B; padding:4px 10px; border-radius:99px; font-size:11px; font-weight:700;">Em Gravação</span>';
      if (st.includes('conclu')) statusBadge = '<span style="background:rgba(52,199,89,0.12); color:#34C759; padding:4px 10px; border-radius:99px; font-size:11px; font-weight:700;">Publicado</span>';
      else if (st.includes('revis')) statusBadge = '<span style="background:rgba(255,154,60,0.14); color:#D97706; padding:4px 10px; border-radius:99px; font-size:11px; font-weight:700;">Em Edição</span>';
      else if (st.includes('pendente')) statusBadge = '<span style="background:rgba(0,122,255,0.12); color:#007AFF; padding:4px 10px; border-radius:99px; font-size:11px; font-weight:700;">Roteiro</span>';

      const taskTitle = selectedTask.tarefas || selectedTask.nome || 'Detalhes do Conteúdo';
      const taskDateFmt = selectedTask.data ? new Date(selectedTask.data + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Sem data definida';

      rightSidebarHtml = `
        <div class="cal-right-sidebar">
          <div class="cal-right-card">
            <div class="cal-right-banner" style="background: linear-gradient(135deg, #E55A2B 0%, #1C1A14 100%);">
              <button onclick="Cronograma.selectCalTask(null, event)" title="Fechar Detalhes" style="position:absolute; top:12px; right:12px; background:rgba(255,255,255,0.2); border:none; border-radius:50%; width:28px; height:28px; color:#FFF; cursor:pointer; display:flex; align-items:center; justify-content:center;">
                <i data-lucide="x" style="width:16px; height:16px;"></i>
              </button>
              <div class="cal-right-avatar" style="border-color:#FFFFFF; background:#1C1A14; color:#E55A2B;">
                <i data-lucide="film" style="width: 32px; height: 32px;"></i>
              </div>
            </div>

            <div class="cal-right-profile-info">
              <div class="cal-right-name">${taskTitle}</div>
              <div style="margin-top:6px;">${statusBadge}</div>
            </div>

            <div class="cal-right-section">
              <div class="cal-section-title">Informações do Conteúdo</div>
              <div class="cal-info-list">
                <div class="cal-info-item">
                  <span class="cal-info-label">Data Agendada</span>
                  <span class="cal-info-val">${taskDateFmt}</span>
                </div>
                <div class="cal-info-item">
                  <span class="cal-info-label">Horário</span>
                  <span class="cal-info-val">${selectedTask.horario || '09:00'}</span>
                </div>
                <div class="cal-info-item">
                  <span class="cal-info-label">Canal / Projeto</span>
                  <span class="cal-info-val">${selectedTask.clienteNome || 'Canal Principal'}</span>
                </div>
                <div class="cal-info-item">
                  <span class="cal-info-label">Responsável</span>
                  <span class="cal-info-val">${selectedTask.padeiroNome || 'Equipe Tomada'}</span>
                </div>
              </div>
            </div>

            <div class="cal-right-section">
              <div class="cal-section-title">Documentos & Briefings</div>
              <div style="display:flex; flex-direction:column; gap:8px;">
                <div class="cal-doc-item blue" onclick="Components.toast('Roteiro aberto no editor', 'info')">
                  <div class="cal-doc-icon"><i data-lucide="file-text" style="width:18px; height:18px; color:#007AFF;"></i></div>
                  <div class="cal-doc-details">
                    <span class="cal-doc-name">Roteiro_Oficial.pdf</span>
                    <span class="cal-doc-size">1.4 MB • Pronto</span>
                  </div>
                </div>
              </div>
            </div>

            <div style="padding:16px; display:flex; gap:10px;">
              <button class="btn btn-primary btn-pill" style="flex:1; justify-content:center;" onclick="Cronograma.openTaskForm('${selectedTask.id}', '${selectedTask.data}')">
                <i data-lucide="edit-3"></i> Editar
              </button>
              <button class="btn btn-pill" style="background:rgba(52,199,89,0.12); color:#34C759; border:none; font-weight:700;" onclick="Cronograma.toggleTaskComplete('${selectedTask.id}')">
                <i data-lucide="check"></i> Concluir
              </button>
            </div>
          </div>
        </div>
      `;
    } else {
      const activeBoxDetail = boxesMap.get(this.calSelectedBoxId) || boxesMap.get('');
      const boxName = activeBoxDetail ? activeBoxDetail.nome : 'Visão Geral do Canal';
      const boxCategory = activeBoxDetail ? activeBoxDetail.categoria : 'Grade de Conteúdo';

      // ── CÁLCULO DE DADOS REAIS DE DESEMPENHO ──
      const totalVideos = activeBoxDetail ? activeBoxDetail.totalTarefas : allTarefas.length;
      const concluidos = activeBoxDetail ? activeBoxDetail.concluidas : allTarefas.filter(t => (t.status || '').toLowerCase().includes('conclu')).length;
      
      // 1. Ritmo de Postagens (percentual de entregas realizadas)
      const ritmoPct = totalVideos > 0 ? Math.round((concluidos / totalVideos) * 100) : 100;
      const ritmoLabel = ritmoPct >= 80 ? 'Excelente' : (ritmoPct >= 50 ? 'Bom' : 'Ajustar');
      const ritmoClass = ritmoPct === 100 ? 'cal-progress-fill-green' : (ritmoPct >= 50 ? 'cal-progress-fill-orange' : 'cal-progress-fill-amber');

      // 2. Conclusão de Roteiros / Etapas (Checklist)
      const boxTasks = allTarefas.filter(t => {
        if (this.calSelectedBoxId) {
          return t.caixaId === this.calSelectedBoxId || t.clienteId === this.calSelectedBoxId || t.padeiroId === this.calSelectedBoxId;
        }
        return true;
      });
      const totalCheck = boxTasks.reduce((acc, t) => acc + (t.checklist ? t.checklist.length : 0), 0);
      const doneCheck = boxTasks.reduce((acc, t) => acc + (t.checklist ? t.checklist.filter(c => c.done || c.feito || c.concluido).length : 0), 0);
      const checklistPct = totalCheck > 0 ? Math.round((doneCheck / totalCheck) * 100) : (ritmoPct > 0 ? ritmoPct : 100);
      const checklistClass = checklistPct >= 80 ? 'cal-progress-fill-green' : (checklistPct >= 50 ? 'cal-progress-fill-orange' : 'cal-progress-fill-amber');

      rightSidebarHtml = `
        <div class="cal-right-sidebar cal-cascade-animate">
          <div class="cal-right-card">
            <div class="cal-right-banner" style="background: linear-gradient(135deg, #1C1A14 0%, #3A362D 100%);">
              <div class="cal-right-avatar" style="border-color:#E55A2B; background:#1C1A14; color:#FFF;">
                <i data-lucide="${activeBoxDetail ? (activeBoxDetail.icon || 'video') : 'layers'}" style="width: 32px; height: 32px;"></i>
              </div>
            </div>

            <div class="cal-right-profile-info">
              <div class="cal-right-name">${boxName}</div>
              <div class="cal-right-role">${boxCategory}</div>
            </div>

            <div class="cal-right-section">
              <div class="cal-section-title">Informações do Canal</div>
              <div class="cal-info-list">
                <div class="cal-info-item">
                  <span class="cal-info-label">Mês Ativo</span>
                  <span class="cal-info-val">${monthNames[currMonth]} ${currYear}</span>
                </div>
                <div class="cal-info-item">
                  <span class="cal-info-label">Status da Grade</span>
                  <span class="cal-info-val" style="color:#34C759;">Em Produção</span>
                </div>
                <div class="cal-info-item">
                  <span class="cal-info-label">Conteúdos Agendados</span>
                  <span class="cal-info-val">${totalVideos} vídeos</span>
                </div>
                <div class="cal-info-item">
                  <span class="cal-info-label">Taxa de Conclusão</span>
                  <span class="cal-info-val">${ritmoPct}%</span>
                </div>
              </div>
            </div>

            <div class="cal-right-section">
              <div class="cal-section-title">Documentos & Mídias</div>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                <div class="cal-doc-item blue" onclick="Components.toast('Abrindo modelo de briefing de conteúdo', 'info')">
                  <div class="cal-doc-icon"><i data-lucide="file-text" style="width: 18px; height: 18px; color: #007AFF;"></i></div>
                  <div class="cal-doc-details">
                    <span class="cal-doc-name">Briefing_Modelo_Conteudo.pdf</span>
                    <span class="cal-doc-size">2.4 MB</span>
                  </div>
                </div>
                <div class="cal-doc-item orange" style="background:rgba(229,90,43,0.1); color:#E55A2B;" onclick="Components.toast('Pasta de mídias conectada ao Google Drive', 'info')">
                  <div class="cal-doc-icon"><i data-lucide="folder" style="width: 18px; height: 18px; color: #E55A2B;"></i></div>
                  <div class="cal-doc-details">
                    <span class="cal-doc-name">Assets_Thumbnails_e_Cortes</span>
                    <span class="cal-doc-size">Drive Nuvem</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="cal-right-section">
              <div class="cal-section-title">Desempenho da Grade</div>
              <div style="display: flex; flex-direction: column; gap: 12px;">
                <div class="cal-stat-row">
                  <div class="cal-stat-label-row">
                    <span class="cal-stat-label">Ritmo de Postagens</span>
                    <span class="cal-stat-val">${ritmoLabel}</span>
                  </div>
                  <div class="cal-progress-bar">
                    <div class="${ritmoClass}" style="width: ${ritmoPct}%;"></div>
                  </div>
                </div>
                <div class="cal-stat-row">
                  <div class="cal-stat-label-row">
                    <span class="cal-stat-label">Conclusão de Roteiros</span>
                    <span class="cal-stat-val">${checklistPct}%</span>
                  </div>
                  <div class="cal-progress-bar">
                    <div class="${checklistClass}" style="width: ${checklistPct}%;"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    cc.innerHTML = `
      <div class="cal-container">
        ${leftSidebarHtml}
        ${centerContentHtml}
        ${rightSidebarHtml}
      </div>
    `;

    if (typeof lucide !== 'undefined' && lucide.createIcons) {
      lucide.createIcons();
    }

    if (typeof window.HigPopovers !== 'undefined') {
      setTimeout(() => window.HigPopovers.init(), 50);
    }
  },

  selectCalBox(boxId) {
    this.calSelectedBoxId = boxId;
    this.calSelectedTaskId = null;
    this.renderCalendario();
  },

  selectCalTask(taskId, e) {
    if (e) e.stopPropagation();
    this.calSelectedTaskId = taskId;
    this.renderCalendario();
  },

  onCalSearch(term) {
    this.calSearchTerm = term;
    this.renderCalendario();
  },

  filterCalStatus(status) {
    this.calStatusFilter = this.calStatusFilter === status ? '' : status;
    this.renderCalendario();
  },

  toggleCalStatusFilter() {
    const statuses = ['', 'gravacao', 'edicao', 'publicado', 'roteiro'];
    const idx = statuses.indexOf(this.calStatusFilter);
    this.calStatusFilter = statuses[(idx + 1) % statuses.length];
    this.renderCalendario();
  },

  prevCalMonth() {
    const el = document.querySelector('.cal-container');
    if (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(8px)';
      el.style.transition = 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)';
    }
    setTimeout(() => {
      if (!this.calSelectedDate) this.calSelectedDate = new Date();
      this.calSelectedDate = new Date(this.calSelectedDate.getFullYear(), this.calSelectedDate.getMonth() - 1, 1);
      this.renderCalendario();
    }, 150);
  },

  nextCalMonth() {
    const el = document.querySelector('.cal-container');
    if (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(8px)';
      el.style.transition = 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)';
    }
    setTimeout(() => {
      if (!this.calSelectedDate) this.calSelectedDate = new Date();
      this.calSelectedDate = new Date(this.calSelectedDate.getFullYear(), this.calSelectedDate.getMonth() + 1, 1);
      this.renderCalendario();
    }, 150);
  },

  onCalMonthChange(val) {
    if (!val) return;
    const parts = val.split('-');
    if (parts.length === 2) {
      const el = document.querySelector('.cal-container');
      if (el) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(8px)';
        el.style.transition = 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)';
      }
      setTimeout(() => {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        this.calSelectedDate = new Date(year, month, 1);
        this.renderCalendario();
      }, 150);
    }
  },

  setCalPage(page) {
    this.calCreatorPage = page;
    this.renderCalendario();
  },

  openCalNewTaskModal(dateStr) {
    if (this.openTaskForm) {
      this.openTaskForm(null, dateStr);
    }
  },

  showCalStatsModal() {
    const allTarefas = Array.isArray(this.tarefas) ? this.tarefas : [];
    const countGravacao = allTarefas.filter(t => (t.status || '').toLowerCase().includes('andamento') || (t.status || '').toLowerCase().includes('execu')).length;
    const countEdicao = allTarefas.filter(t => (t.status || '').toLowerCase().includes('revis') || (t.status || '').toLowerCase().includes('edicao')).length;
    const countPublicado = allTarefas.filter(t => (t.status || '').toLowerCase().includes('conclu') || (t.status || '').toLowerCase() === 'aprovado').length;
    const countRoteiro = allTarefas.filter(t => (t.status || '').toLowerCase().includes('pendente') || (t.status || '').toLowerCase().includes('aberto')).length;

    Components.showModal(
      'Resumo do Planejamento de Conteúdo',
      `
        <div style="font-family:'Outfit',sans-serif; padding:10px 0; color:#1C1A14;">
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:16px;">
            <div style="background:#FFF9F5; border:1px solid #EBE5DF; border-radius:14px; padding:14px; text-align:center;">
              <div style="font-size:24px; font-weight:800; color:#E55A2B;">${allTarefas.length}</div>
              <div style="font-size:12px; font-weight:600; color:#7A7567; margin-top:2px;">Total de Conteúdos</div>
            </div>
            <div style="background:#FAF8F5; border:1px solid #EBE5DF; border-radius:14px; padding:14px; text-align:center;">
              <div style="font-size:24px; font-weight:800; color:#34C759;">${countPublicado}</div>
              <div style="font-size:12px; font-weight:600; color:#7A7567; margin-top:2px;">Publicados</div>
            </div>
          </div>
          <div style="display:flex; flex-direction:column; gap:8px; font-size:13px;">
            <div style="display:flex; justify-content:space-between; padding:8px 12px; background:#FAF8F5; border-radius:10px;">
              <span>Em Gravação</span>
              <strong style="color:#E55A2B;">${countGravacao} vídeos</strong>
            </div>
            <div style="display:flex; justify-content:space-between; padding:8px 12px; background:#FAF8F5; border-radius:10px;">
              <span>Em Edição</span>
              <strong style="color:#FF9A3C;">${countEdicao} vídeos</strong>
            </div>
            <div style="display:flex; justify-content:space-between; padding:8px 12px; background:#FAF8F5; border-radius:10px;">
              <span>Roteiros em ABERTO</span>
              <strong style="color:#007AFF;">${countRoteiro} roteiros</strong>
            </div>
          </div>
        </div>
      `,
      `<button class="btn btn-primary btn-pill" onclick="Components.closeModal()">Fechar</button>`,
      'premium-task-modal'
    );
  },

  async toggleTaskComplete(taskId) {
    const task = (this.tarefas || []).find(t => t.id === taskId);
    if (!task) return;

    const newStatus = (task.status || '').toLowerCase().includes('conclu') ? 'pendente' : 'concluida';
    try {
      await API.put(`/api/cronograma/${taskId}`, { status: newStatus });
      Components.toast(newStatus === 'concluida' ? 'Conteúdo marcado como publicado!' : 'Status alterado para pendente', 'success');
      this.render();
    } catch (e) {
      Components.toast('Erro ao alterar status: ' + e.message, 'error');
    }
  }
});
