/**
 * ARQUIVO: cronograma.tasks.js
 * CATEGORIA: Cronograma › Formulários e CRUD de tarefas
 * RESPONSABILIDADE: Abre modais, salva, edita e exclui tarefas
 * DEPENDE DE: cronograma.state.js, API, Components
 * EXPORTA: openQuickAddForm, saveQuickAdd, openTaskForm, saveTask,
 *           deleteTask, deleteAllTasks, openTaskDetail, changeTaskOrder
 */

Object.assign(Cronograma, {

  // ──────────────────────────────────────────────────────────────
  // HELPER: Gera HTML do campo de busca de cliente com dropdown
  // ──────────────────────────────────────────────────────────────
  _clienteSearchHTML(selectedId = '', selectedNome = '') {
    return `
      <div class="cliente-search-wrapper" id="cliente-search-wrapper">
        <input type="hidden" id="tarefa-cliente-id" value="${selectedId}">
        <input type="hidden" id="tarefa-cliente-nome" value="${selectedNome}">
        <div class="cliente-search-input-wrap">
          <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            class="cliente-search-field${selectedNome ? ' has-value' : ''}"
            id="tarefa-cliente-search"
            placeholder="Pesquisar cliente..."
            value="${selectedNome}"
            autocomplete="off"
          >
        </div>
        <div class="cliente-dropdown" id="cliente-dropdown"></div>
      </div>`;
  },

  // ──────────────────────────────────────────────────────────────
  // HELPER: Inicializa o comportamento interativo do campo de busca
  // ──────────────────────────────────────────────────────────────
  _initClienteSearch() {
    const clientes = this.clientes.filter(c => c.ativo !== false);
    const input    = document.getElementById('tarefa-cliente-search');
    const dropdown = document.getElementById('cliente-dropdown');
    const hiddenId  = document.getElementById('tarefa-cliente-id');
    const hiddenNome = document.getElementById('tarefa-cliente-nome');

    if (!input || !dropdown) return;

    const renderItems = (filter = '') => {
      const q = filter.trim().toLowerCase();
      const filtered = q
        ? clientes.filter(c => {
            const nome   = (c.nomeFantasia || c.nome || '').toLowerCase();
            const bairro = (c.bairro || '').toLowerCase();
            return nome.includes(q) || bairro.includes(q);
          })
        : clientes;

      if (filtered.length === 0) {
        dropdown.innerHTML = `
          <div class="cliente-dropdown-empty">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="display:block;margin:0 auto 8px;opacity:.4"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            Nenhum cliente encontrado
          </div>`;
        return;
      }

      dropdown.innerHTML = filtered.map(c => {
        const nome   = c.nomeFantasia || c.nome || '';
        const bairro = c.bairro || '';
        const initials = nome.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
        const display  = nome + (bairro ? ` - ${bairro}` : '');
        const safeDisplay = display.replace(/'/g, "\\'").replace(/"/g, '&quot;');
        return `
          <div class="cliente-dropdown-item"
               data-id="${c.id}"
               data-nome="${safeDisplay}"
               onmousedown="Cronograma._selectCliente('${c.id}', '${safeDisplay}')">
            <div class="item-avatar">${initials || '?'}</div>
            <div class="item-info">
              <div class="item-name">${nome}</div>
              ${bairro ? `<div class="item-bairro">${bairro}</div>` : ''}
            </div>
          </div>`;
      }).join('');
    };

    // Abre o dropdown ao focar
    input.addEventListener('focus', () => {
      renderItems(input.value);
      dropdown.classList.add('open');
    });

    // Fecha ao perder foco (mousedown do item é disparado antes do blur)
    input.addEventListener('blur', () => {
      setTimeout(() => dropdown.classList.remove('open'), 200);
    });

    // Filtra ao digitar
    input.addEventListener('input', () => {
      // Limpa a seleção se o usuário editar manualmente
      hiddenId.value   = '';
      hiddenNome.value = '';
      input.classList.remove('has-value');
      input.classList.remove('input-error');
      renderItems(input.value);
      if (!dropdown.classList.contains('open')) dropdown.classList.add('open');
    });
  },

  // ──────────────────────────────────────────────────────────────
  // HELPER: Seleciona um cliente do dropdown
  // ──────────────────────────────────────────────────────────────
  _selectCliente(id, nome) {
    const hiddenId   = document.getElementById('tarefa-cliente-id');
    const hiddenNome = document.getElementById('tarefa-cliente-nome');
    const input      = document.getElementById('tarefa-cliente-search');
    const dropdown   = document.getElementById('cliente-dropdown');

    if (hiddenId)   hiddenId.value   = id;
    if (hiddenNome) hiddenNome.value = nome;
    if (input) {
      input.value = nome;
      input.classList.add('has-value');
      input.classList.remove('input-error');
      input.style.borderColor = '';
    }
    if (dropdown) dropdown.classList.remove('open');
  },

  // ──────────────────────────────────────────────────────────────
  // HELPER: Inicializa o comportamento interativo do campo de busca de produtos
  // ──────────────────────────────────────────────────────────────
  _initProdutoSearch() {
    const produtos = (Cronograma.produtos || []).filter(p => p.ativo !== false);
    const input    = document.getElementById('tarefa-produto-search');
    const dropdown = document.getElementById('produto-dropdown');

    if (!input || !dropdown) return;

    const renderItems = (filter = '') => {
      const q = filter.trim().toLowerCase();
      const filtered = q
        ? produtos.filter(p => {
            const desc = (p.descricao || '').toLowerCase();
            const cod  = (p.codigo || '').toLowerCase();
            return desc.includes(q) || cod.includes(q);
          })
        : produtos;

      if (filtered.length === 0) {
        dropdown.innerHTML = `
          <div class="cliente-dropdown-empty">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="display:block;margin:0 auto 8px;opacity:.4"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            Nenhum produto encontrado
          </div>`;
        return;
      }

      dropdown.innerHTML = filtered.map(p => {
        const desc = p.descricao || '';
        const cod  = p.codigo || '';
        const precoFmt = p.preco ? `R$ ${p.preco.toFixed(2).replace('.', ',')}` : 'R$ 0,00';
        const estoqueFmt = `${p.estoque || 0} ${p.unidade || 'un'}`;
        const initials = desc.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
        
        return `
          <div class="cliente-dropdown-item"
               data-id="${p.id}"
               onmousedown="Cronograma._selectProduto('${p.id}')">
            <div class="item-avatar">${initials || '?'}</div>
            <div class="item-info">
              <div class="item-name">${desc}</div>
              <div class="item-bairro" style="display: flex; justify-content: space-between;">
                <span>${precoFmt}</span>
                <span>Estoque: ${estoqueFmt}</span>
              </div>
            </div>
          </div>`;
      }).join('');
    };

    // Abre o dropdown ao focar
    input.addEventListener('focus', () => {
      renderItems(input.value);
      dropdown.classList.add('open');
    });

    // Fecha ao perder foco (mousedown do item é disparado antes do blur)
    input.addEventListener('blur', () => {
      setTimeout(() => dropdown.classList.remove('open'), 200);
    });

    // Filtra ao digitar
    input.addEventListener('input', () => {
      renderItems(input.value);
      if (!dropdown.classList.contains('open')) dropdown.classList.add('open');
    });
  },

  // ──────────────────────────────────────────────────────────────
  // HELPER: Seleciona um produto do dropdown
  // ──────────────────────────────────────────────────────────────
  _selectProduto(id) {
    const prod = (Cronograma.produtos || []).find(p => p.id === id);
    if (!prod) return;

    const existingInput = document.querySelector(`.trello-orcamento-item-qty[data-id="${id}"]`);
    if (existingInput) {
      existingInput.focus();
      existingInput.select();
      Components.toast('Produto já adicionado ao orçamento.', 'info');
      return;
    }

    Cronograma.appendOrcamentoItemHTML(prod, 1);
    
    const input = document.getElementById('tarefa-produto-search');
    const dropdown = document.getElementById('produto-dropdown');
    if (input) {
      input.value = '';
      input.blur();
    }
    if (dropdown) dropdown.classList.remove('open');
    Cronograma.updateOrcamentoTotals();
  },

  _selectProdutoFromSelect(select) {
    const prodId = select.value;
    if (!prodId) return;

    const prod = (this.produtos || []).find(p => p.id === prodId);
    if (!prod) return;

    const existingInput = document.querySelector(`.trello-orcamento-item-qty[data-id="${prodId}"]`);
    if (existingInput) {
      existingInput.focus();
      existingInput.select();
      Components.toast('Produto já adicionado ao orçamento.', 'info');
      // Reset select
      select.value = '';
      select.dispatchEvent(new Event('change', { bubbles: true }));
      return;
    }

    this.appendOrcamentoItemHTML(prod, 1);
    
    // Reset select
    select.value = '';
    select.dispatchEvent(new Event('change', { bubbles: true }));
    
    this.updateOrcamentoTotals();
  },

  // ──────────────────────────────────────────────────────────────
  // MODAL: Adicionar cliente ao cronograma (mobile/quick)
  // ──────────────────────────────────────────────────────────────
  openQuickAddForm(dateStr, padeiroId) {
    const padeiro = this.padeiros.find(p => p.id === padeiroId);

    Components.showModal('Adicionar Cliente', `
      <form id="tarefa-form">
        <div class="form-group" style="background: var(--system-bg); border-radius: 10px; padding: 12px 16px; margin-bottom: 16px; display: flex; align-items: center; gap: 12px;">
          <div class="avatar" style="width:36px;height:36px;font-size:13px;background:var(--primary);flex-shrink:0;">${padeiro ? padeiro.nome.split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase() : '?'}</div>
          <div>
            <div style="font-weight:600;font-size:14px;">${padeiro ? padeiro.nome.split(' ').slice(0,2).join(' ') : '—'}</div>
            <div style="font-size:11px;font-family:monospace;color:var(--text-tertiary);">COD ${padeiro ? padeiro.codTec : '—'} • ${new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' })}</div>
          </div>
          <input type="hidden" name="padeiroId" value="${padeiroId}">
          <input type="hidden" name="data" value="${dateStr}">
        </div>
        <div class="form-group">
          <label>Nome / Título da Tarefa (Opcional)</label>
          <input class="input-control" type="text" name="nome" id="tarefa-nome" placeholder="Ex: Produção de Vídeo, Manutenção..." style="padding-left: 16px;">
        </div>
        <div class="form-group">
          <label>Cliente (Opcional)</label>
          ${this._clienteSearchHTML()}
        </div>
        <div class="flex gap-4">
          <div class="form-group w-full">
            <label>Início</label>
            <input class="input-control" type="time" name="horario" value="08:00" style="padding-left: 16px;">
          </div>
          <div class="form-group w-full">
            <label>Término</label>
            <input class="input-control" type="time" name="horarioFim" value="17:00" style="padding-left: 16px;">
          </div>
        </div>
        <div class="form-group">
          <label>Status</label>
          <select class="input-control" name="status" style="padding-left: 16px;">
            <option value="pendente" selected>Pendente</option>
            <option value="em_andamento">Em Andamento</option>
            <option value="concluida">Concluída</option>
          </select>
        </div>
        <div class="form-group">
          <label>Observação</label>
          <textarea class="input-control" name="observacao" rows="2" placeholder="Observações..." style="padding-left: 16px;"></textarea>
        </div>
      </form>`,
      `<button class="btn btn-secondary" onclick="Components.closeModal()">Cancelar</button>
       <button class="btn btn-primary" onclick="Cronograma.saveQuickAdd('${padeiroId}')"><i data-lucide="plus"></i> Adicionar</button>`
    );
    Components.renderIcons();
    this._initClienteSearch();
  },

  async saveQuickAdd(padeiroId) {
    const form = document.getElementById('tarefa-form');

    // Cliente (campo opcional)
    const clienteId = document.getElementById('tarefa-cliente-id')?.value?.trim() || null;
    const clienteNome = document.getElementById('tarefa-cliente-nome')?.value?.trim() || document.getElementById('tarefa-cliente-search')?.value?.trim() || '';

    const fd   = new FormData(form);
    const body = Object.fromEntries(fd);
    body.clienteId   = clienteId;
    body.clienteNome = clienteNome;
    body.nome        = body.nome?.trim() || clienteNome || 'Nova Tarefa';
    body.tarefas     = body.nome;

    const padeiro = this.padeiros.find(p => p.id === padeiroId);
    if (padeiro) {
      body.padeiroNome = padeiro.nome;
      body.codTec      = padeiro.codTec;
    }

    try {
      const criada = await API.post('/api/cronograma', body);
      this.tarefas.push(criada);
      Components.closeModal();
      Components.toast('Cliente adicionado!', 'success');
      this.renderSemanal();
    } catch (e) { Components.toast(e.message, 'error'); }
  },

  // ──────────────────────────────────────────────────────────────
  // MODAL: Nova / Editar Tarefa (formulário completo)
  // ──────────────────────────────────────────────────────────────
  openTaskForm(id, preDate, listId) {
    let foundTask = id ? (this.tarefas || []).find(x => x.id == id) : null;
    if (!foundTask && id) {
      try {
        const savedCards = JSON.parse(localStorage.getItem('tomada_planejamento_cards') || '[]');
        const card = savedCards.find(c => c.id === id);
        if (card) {
          foundTask = {
            id: card.id,
            tarefas: card.titulo,
            nome: card.titulo,
            observacao: card.descricao,
            data: card.prazo,
            status: card.status || 'pendente',
            caixaId: card.caixaId,
            clienteId: card.caixaId,
            clienteNome: 'Planejamento'
          };
        }
      } catch (e) {
        console.warn("Erro ao buscar card do planejamento:", e);
      }
    }
    const t = foundTask || {};
    const isEdit = !!foundTask;
    const dates = this.getWeekDates();
    const todayStr = Cronograma.getLocalISO(new Date());
    const isTodayInWeek = dates.some(d => Cronograma.getLocalISO(d) === todayStr);
    const defaultDate = preDate || t.data || (isTodayInWeek ? todayStr : Cronograma.getLocalISO(dates[0]));

    const tagsStr = (t.tags || []).join(', ');
    const checklistStr = (t.checklist || []).map(c => `${(c.done || c.feito) ? '[x]' : '[ ]'} ${c.text || c.texto || ''}`).join('\n');
    const kanbanListIdValue = listId || t.kanbanListId || (this.kanbanLists && this.kanbanLists[0] ? this.kanbanLists[0].id : '');

    const isDesktop = window.innerWidth >= 768;
    let contentHtml, footerHtml;

    if (isDesktop) {
      contentHtml = `
        <form id="tarefa-form" onsubmit="event.preventDefault(); Cronograma.saveTask(${id ? `'${id}'` : 'null'})" class="premium-desktop-form">
          <input type="hidden" name="kanbanListId" value="${kanbanListIdValue}">
          <div class="p-bento-container">
            <div class="p-bento-col">
              <div class="p-bento-card">
                <h4 class="p-bento-title"><i data-lucide="check-square"></i> Identificação & Responsáveis</h4>
                <div class="p-form-group">
                  <label>Nome / Título da Tarefa</label>
                  <input class="p-input" type="text" name="nome" id="tarefa-nome" value="${t.nome || t.tarefas || ''}" placeholder="Ex: Produção de Vídeo, Manutenção...">
                </div>
                <div class="p-form-group">
                  <label>Funcionário</label>
                  <select class="p-input" name="padeiroId" id="tarefa-padeiro">
                    <option value="">Selecione o funcionário...</option>
                    ${this.padeiros.filter(p => p.ativo).map(p =>
                      `<option value="${p.id}" data-nome="${p.nome}" data-cod="${p.codTec}" ${t.padeiroId === p.id ? 'selected' : ''}>${p.nome} — COD ${p.codTec}</option>`
                    ).join('')}
                  </select>
                </div>
                <div class="p-form-group">
                  <label>Cliente (Opcional)</label>
                  ${this._clienteSearchHTML(t.clienteId || '', t.clienteNome || '')}
                </div>
                <div class="p-form-group" style="margin-top: 4px;">
                  <label>Status</label>
                  <select class="p-input" name="status">
                    <option value="pendente" ${(!t.status || t.status === 'pendente') ? 'selected' : ''}>Pendente</option>
                    <option value="em_andamento" ${t.status === 'em_andamento' ? 'selected' : ''}>Em Andamento</option>
                    <option value="concluida" ${t.status === 'concluida' ? 'selected' : ''}>Concluída</option>
                  </select>
                </div>
              </div>

              <!-- Sessão específica para o Checklist -->
              <div class="p-bento-card">
                <div id="trello-checklist-root"></div>
              </div>

              <!-- Sessão específica para o Orçamento -->
              <div class="p-bento-card">
                <div id="trello-orcamento-root"></div>
              </div>
            </div>

            <div class="p-bento-col">
              <div class="p-bento-card">
                <h4 class="p-bento-title"><i data-lucide="calendar-clock"></i> Agendamento</h4>
                <div class="p-form-row">
                  <div class="p-form-group">
                    <label>Data</label>
                    <input class="p-input" type="date" name="data" value="${defaultDate}" required>
                  </div>
                  <div class="p-form-group">
                    <label>T. Mínimo (min)</label>
                    <input class="p-input" type="number" name="tempoMinimoMinutos" value="${t.tempoMinimoMinutos || 0}" min="0">
                  </div>
                </div>
                <div class="p-form-row">
                  <div class="p-form-group">
                    <label>Início</label>
                    <input class="p-input" type="time" name="horario" value="${t.horario || ''}">
                  </div>
                  <div class="p-form-group">
                    <label>Término</label>
                    <input class="p-input" type="time" name="horarioFim" value="${t.horarioFim || ''}">
                  </div>
                </div>
              </div>
              
              <div class="p-bento-card">
                <h4 class="p-bento-title"><i data-lucide="align-left"></i> Observação</h4>
                <div class="p-form-group" style="margin-bottom:0;">
                  <textarea class="p-input" name="observacao" rows="2" placeholder="Notas sobre a tarefa...">${t.observacao || ''}</textarea>
                </div>
              </div>

              <div class="p-bento-card">
                <h4 class="p-bento-title"><i data-lucide="tags"></i> Tags</h4>
                <div class="p-form-group" style="margin-bottom:0;">
                  <label>Tags (separadas por vírgula)</label>
                  <input class="p-input" type="text" name="tags" value="${tagsStr}" placeholder="Design, Urgente">
                </div>
                <input type="hidden" name="progresso" value="${t.progresso || 0}">
              </div>

              <div class="p-bento-card">
                <h4 class="p-bento-title"><i data-lucide="copy"></i> Template de Card</h4>
                <div class="p-form-group">
                  <label>Carregar Modelo Salvo</label>
                  <div class="flex gap-2">
                    <select class="p-input" id="card-template-selector" onchange="Cronograma.loadCardTemplate(this.value)" style="flex-grow: 1;">
                      <option value="">Selecione um template...</option>
                      ${Cronograma.getCardTemplatesOptions()}
                    </select>
                    <button type="button" class="btn-premium-danger" onclick="Cronograma.deleteCardTemplate(false)" title="Excluir template selecionado" style="padding: 0 12px; height: 38px; display: flex; align-items: center; justify-content: center;">
                      <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
                    </button>
                  </div>
                </div>
                <button type="button" class="btn-premium-secondary w-full mt-2" onclick="Cronograma.saveCardTemplate(false)" style="font-size: 13px; padding: 8px 12px; display: flex; align-items: center; justify-content: center; gap: 6px;">
                  <i data-lucide="save" style="width: 14px; height: 14px;"></i>
                  Salvar atual como Template
                </button>
              </div>
            </div>
          </div>
        </form>
      `;
      footerHtml = `
        ${isEdit ? `<button type="button" class="btn-premium-danger" onclick="Cronograma.deleteTask('${id}')">Excluir</button>` : ''}
        <button type="button" class="btn-premium-secondary" onclick="Components.closeModal()">Cancelar</button>
        <button type="button" class="btn-premium-primary" onclick="Cronograma.saveTask('${id || ''}')">Salvar Tarefa</button>
      `;
    } else {
      contentHtml = `
        <form id="tarefa-form" onsubmit="event.preventDefault(); Cronograma.saveTask(${id ? `'${id}'` : 'null'})">
          <input type="hidden" name="kanbanListId" value="${kanbanListIdValue}">
          <div class="form-group">
            <label>Nome / Título da Tarefa</label>
            <input class="input-control" type="text" name="nome" id="tarefa-nome" value="${t.nome || t.tarefas || ''}" placeholder="Ex: Produção de Vídeo, Manutenção..." style="padding-left: 16px;">
          </div>
          <div class="form-group">
            <label>Funcionário</label>
            <select class="input-control" name="padeiroId" id="tarefa-padeiro" style="padding-left: 16px;">
              <option value="">Selecione o funcionário...</option>
              ${this.padeiros.filter(p => p.ativo).map(p =>
                `<option value="${p.id}" data-nome="${p.nome}" data-cod="${p.codTec}" ${t.padeiroId === p.id ? 'selected' : ''}>${p.nome} — COD ${p.codTec}</option>`
              ).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Cliente (Opcional)</label>
            ${this._clienteSearchHTML(t.clienteId || '', t.clienteNome || '')}
          </div>
          <div class="flex gap-4">
            <div class="form-group w-full">
              <label>Data</label>
              <input class="input-control" type="date" name="data" value="${defaultDate}" required style="padding-left: 16px;">
            </div>
            <div class="form-group w-full">
              <label>Início</label>
              <input class="input-control" type="time" name="horario" value="${t.horario || ''}" style="padding-left: 16px;">
            </div>
            <div class="form-group w-full">
              <label>Término</label>
              <input class="input-control" type="time" name="horarioFim" value="${t.horarioFim || ''}" style="padding-left: 16px;">
            </div>
            <div class="form-group w-full">
              <label>Tempo Mínimo (min)</label>
              <input class="input-control" type="number" name="tempoMinimoMinutos" value="${t.tempoMinimoMinutos || 0}" min="0" style="padding-left: 16px;">
            </div>
          </div>
          <div class="form-group">
            <label>Status</label>
            <select class="input-control" name="status" style="padding-left: 16px;">
              <option value="pendente" ${(!t.status || t.status === 'pendente') ? 'selected' : ''}>Pendente</option>
              <option value="em_andamento" ${t.status === 'em_andamento' ? 'selected' : ''}>Em Andamento</option>
              <option value="concluida" ${t.status === 'concluida' ? 'selected' : ''}>Concluída</option>
            </select>
          </div>
          <div class="form-group">
            <label>Tags (separadas por vírgula)</label>
            <input class="input-control" type="text" name="tags" value="${tagsStr}" placeholder="Design, Urgente" style="padding-left: 16px;">
          </div>
          <input type="hidden" name="progresso" value="${t.progresso || 0}">

          <div class="form-group" style="background: var(--system-bg); border-radius: 10px; padding: 12px; margin-bottom: 16px; border: 1px solid var(--border-color);">
            <label style="font-weight: 600; margin-bottom: 8px; display: block;">Template de Card</label>
            <div class="flex gap-2 mb-2">
              <select class="input-control" id="card-template-selector-mobile" onchange="Cronograma.loadCardTemplate(this.value)" style="flex-grow: 1; padding-left: 16px;">
                <option value="">Carregar template...</option>
                ${this.getCardTemplatesOptions()}
              </select>
              <button type="button" class="btn btn-outline" onclick="Cronograma.deleteCardTemplate(true)" title="Excluir template" style="padding: 0 12px; color: var(--danger); border-color: var(--danger);">
                <i data-lucide="trash-2"></i>
              </button>
            </div>
            <button type="button" class="btn btn-outline w-full" onclick="Cronograma.saveCardTemplate(true)" style="font-size: 13px; display: flex; align-items: center; justify-content: center; gap: 6px;">
              <i data-lucide="save"></i>
              Salvar atual como Template
            </button>
          </div>

          <div class="form-group">
            <div id="trello-checklist-root"></div>
          </div>
          <div class="form-group">
            <div id="trello-orcamento-root"></div>
          </div>
          <div class="form-group">
            <label>Observação</label>
            <textarea class="input-control" name="observacao" rows="3" placeholder="Observações..." style="padding-left: 16px;">${t.observacao || ''}</textarea>
          </div>
        </form>
      `;
      footerHtml = `
        ${isEdit ? `<button type="button" class="btn btn-outline" style="color:var(--danger);border-color:var(--danger);" onclick="Cronograma.deleteTask('${id}')" style="margin-right:auto">Excluir</button>` : ''}
        <button type="button" class="btn btn-secondary" onclick="Components.closeModal()">Cancelar</button>
        <button type="button" class="btn btn-primary" onclick="Cronograma.saveTask('${id || ''}')">Salvar</button>
      `;
    }

    Components.showModal(isEdit ? 'Editar Tarefa' : 'Nova Tarefa', contentHtml, footerHtml, isDesktop ? 'premium-task-modal' : 'cronograma-task-modal');
    Cronograma.initChecklistEditor(t.checklist || []);
    Cronograma.initOrcamentoEditor(Array.isArray(t.orcamento) ? t.orcamento : (t.orcamento?.itens || []));
    Components.renderIcons();
    this._initClienteSearch();
    
    if (window.HigPopovers) {
      setTimeout(() => HigPopovers.init(), 50);
    }
  },

  async saveTask(id) {
    const form = document.getElementById('tarefa-form');
    if (!form) return;

    // Cliente (campo opcional)
    const clienteId = document.getElementById('tarefa-cliente-id')?.value?.trim() || null;
    const clienteNome = document.getElementById('tarefa-cliente-nome')?.value?.trim() || document.getElementById('tarefa-cliente-search')?.value?.trim() || '';

    const fd   = new FormData(form);
    const body = Object.fromEntries(fd);
    body.clienteId   = clienteId;
    body.clienteNome = clienteNome;
    body.nome        = body.nome?.trim() || body.tarefas?.trim() || clienteNome || 'Nova Tarefa';
    body.tarefas     = body.nome;

    const padeiroSel = document.getElementById('tarefa-padeiro');
    if (padeiroSel && padeiroSel.selectedIndex > 0) {
      const opt = padeiroSel.options[padeiroSel.selectedIndex];
      body.padeiroNome = opt.dataset.nome;
      body.codTec      = opt.dataset.cod;
    }

    // Processar novos campos
    if (body.tags) {
      body.tags = body.tags.split(',').map(tag => tag.trim()).filter(Boolean);
    } else {
      body.tags = [];
    }

    if (body.progresso) {
      body.progresso = parseInt(body.progresso, 10) || 0;
    } else {
      body.progresso = 0;
    }

    // Extrai o checklist dinamicamente dos inputs renderizados no Trello Checklist
    const checklistItems = [];
    document.querySelectorAll('.trello-checklist-item').forEach(itemEl => {
      const textInput = itemEl.querySelector('.trello-checklist-item-text');
      const checkbox = itemEl.querySelector('.trello-checklist-item-checkbox');
      if (textInput && checkbox) {
        const textVal = textInput.value.trim();
        if (textVal) {
          checklistItems.push({ text: textVal, done: checkbox.checked });
        }
      }
    });
    body.checklist = checklistItems;
    delete body.checklist_text;

    // Extrai o orçamento dinamicamente dos inputs
    const orcamentoItems = [];
    document.querySelectorAll('.trello-orcamento-item-qty').forEach(input => {
      const prodId = input.dataset.id;
      const qty = parseFloat(input.value) || 0;
      if (prodId && qty > 0) {
        orcamentoItems.push({ produtoId: prodId, quantidade: qty });
      }
    });

    const originalTask = id ? this.tarefas.find(t => t.id === id) : null;
    if (originalTask && originalTask.orcamento && !Array.isArray(originalTask.orcamento)) {
      body.orcamento = {
        ...originalTask.orcamento,
        itens: orcamentoItems
      };
    } else {
      body.orcamento = orcamentoItems;
    }

    try {
      if (id && String(id).startsWith('card_')) {
        const savedCards = JSON.parse(localStorage.getItem('tomada_planejamento_cards') || '[]');
        const cardIndex = savedCards.findIndex(c => c.id === id);
        if (cardIndex !== -1) {
          savedCards[cardIndex].titulo = body.nome;
          savedCards[cardIndex].descricao = body.observacao;
          savedCards[cardIndex].prazo = body.data;
          savedCards[cardIndex].status = body.status;
          localStorage.setItem('tomada_planejamento_cards', JSON.stringify(savedCards));
        }
      } else if (id) {
        const atualizada = await API.put(`/api/cronograma/${id}`, body);
        const index = this.tarefas.findIndex(t => t.id === id);
        if (index !== -1) this.tarefas[index] = atualizada;
      }
      else {
        const criada = await API.post('/api/cronograma', body);
        this.tarefas.push(criada);
      }
      Components.closeModal();
      Components.toast(id ? 'Tarefa atualizada!' : 'Tarefa criada!', 'success');
      this.renderSemanal();
    } catch (e) { Components.toast(e.message, 'error'); }
  },

  // ──────────────────────────────────────────────────────────────
  // Excluir tarefa
  // ──────────────────────────────────────────────────────────────
  async deleteTask(id) {
    if (confirm('Excluir esta tarefa?')) {
      try {
        if (id && String(id).startsWith('card_')) {
          const savedCards = JSON.parse(localStorage.getItem('tomada_planejamento_cards') || '[]');
          const filtered = savedCards.filter(c => c.id !== id);
          localStorage.setItem('tomada_planejamento_cards', JSON.stringify(filtered));
        } else {
          await API.delete(`/api/cronograma/${id}`);
          this.tarefas = this.tarefas.filter(t => t.id !== id);
        }
        Components.closeModal();
        Components.toast('Tarefa excluída.', 'success');
        this.renderSemanal();
      } catch (e) { Components.toast(e.message, 'error'); }
    }
  },

  // ──────────────────────────────────────────────────────────────
  // Excluir todo o cronograma
  // ──────────────────────────────────────────────────────────────
  async deleteAllTasks() {
    if (API.getUser().role !== 'admin') {
      Components.toast('Apenas administradores podem limpar o cronograma.', 'error');
      return;
    }
    if (confirm('ATENÇÃO: Você está prestes a excluir TODO o cronograma. Esta ação não pode ser desfeita. Deseja continuar?')) {
      try {
        await API.delete('/api/cronograma/all');
        Components.toast('Cronograma totalmente limpo!', 'success');
        await this.render();
      } catch (e) {
        Components.toast('Erro ao limpar cronograma: ' + e.message, 'error');
      }
    }
  },

  // ──────────────────────────────────────────────────────────────
  // Exportar para PDF
  // ──────────────────────────────────────────────────────────────
  exportToPDF() {
    Components.toast('Preparando documento para impressão...', 'info');
    
    // Pegar as datas da semana atual
    const weekDates = this.getWeekDates(); // Return an array of Date objects
    const startDate = weekDates[0];
    const endDate = weekDates[6];
    
    const formatDate = (date) => date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace(' de ', ' de ').replace('.', '');
    const dataRangeStr = `${formatDate(startDate)} — ${formatDate(endDate)}`;
    
    const today = new Date();
    const todayStr = today.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const generatedAt = `${today.toLocaleDateString('pt-BR')} ${today.toLocaleTimeString('pt-BR')}`;
    
    const getLocalISO = (date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    };
    
    const startStr = getLocalISO(startDate);
    const endStr = getLocalISO(endDate);
    const filenameTitle = `Cronograma_Bancada_${startStr}_a_${endStr}`;
    
    // Iniciar HTML
    let html = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>${filenameTitle}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
          @page { size: A4 landscape; margin: 10mm 15mm; }
          body { 
            font-family: 'Inter', system-ui, sans-serif; 
            margin: 0; 
            padding: 0; 
            color: #111827;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .header-top { display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; margin-bottom: 25px; }
          .header-main { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 25px; border-bottom: 2px solid #f3f4f6; padding-bottom: 15px;}
          .brand h1 { margin: 0; font-size: 24px; font-weight: 900; color: #111827; letter-spacing: -0.5px; }
          .brand p { margin: 4px 0 0; font-size: 10px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
          .title-area { text-align: right; }
          .title-area h2 { margin: 0; font-size: 16px; font-weight: 800; color: #111827; }
          .title-area .date-range { margin: 4px 0 0; font-size: 12px; font-weight: 700; color: #ea580c; }
          .title-area .generated { margin: 4px 0 0; font-size: 9px; color: #9ca3af; }
          
          table { width: 100%; border-collapse: collapse; border-top: 1px solid #d1d5db; border-bottom: 1px solid #d1d5db; }
          th, td { border: 1px solid #e5e7eb; padding: 12px 8px; text-align: center; }
          th { padding-top: 14px; padding-bottom: 14px; border-top: none; }
          .th-tech { width: 160px; text-align: left; padding-left: 16px; font-size: 10px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px; border-left: none; }
          .th-day { width: 110px; border-top: none; }
          th:last-child, td:last-child { border-right: none; }
          td:first-child { border-left: none; }
          
          .day-name { font-size: 9px; font-weight: 700; color: #9ca3af; text-transform: uppercase; margin-bottom: 4px; }
          .day-number { font-size: 18px; font-weight: 700; color: #9ca3af; }
          .day-today .day-number { color: #111827; }
          .day-today .day-name { color: #111827; }
          .today-badge { font-size: 8px; font-weight: 800; color: #9ca3af; text-transform: uppercase; margin-top: 4px; }
          
          .tech-cell { text-align: left; padding-left: 16px; display: flex; align-items: center; gap: 10px; }
          .tech-avatar { font-size: 12px; font-weight: 800; color: #111827; }
          .tech-info { display: flex; flex-direction: column; }
          .tech-name { font-size: 12px; font-weight: 700; color: #111827; margin-bottom: 2px;}
          .tech-cod { font-size: 9px; font-weight: 800; color: #ea580c; }
          
          .task-cell { vertical-align: top; padding: 6px; position: relative; }
          .empty-cell { color: #d1d5db; display: flex; align-items: center; justify-content: center; height: 100%; min-height: 40px;}
          
          .task-item { text-align: left; background: #fff; border: 1px solid #e5e7eb; border-radius: 4px; padding: 6px; margin-bottom: 4px; border-left: 3px solid #E55A2B; page-break-inside: avoid;}
          .task-item.status-concluida { border-left-color: #10b981; }
          .task-item.status-pendente { border-left-color: #f59e0b; }
          .task-client { font-size: 9px; font-weight: 700; color: #111827; line-height: 1.2; margin-bottom: 2px;}
          .task-time { font-size: 8px; font-weight: 600; color: #6b7280; display: flex; align-items: center; gap: 3px;}
        </style>
      </head>
      <body>
        <div class="header-top">
          <div>Cronograma</div>
          <div>${todayStr}</div>
        </div>
        
        <div class="header-main">
          <div class="brand">
            <div style="font-family: 'Outfit', 'Inter', sans-serif; font-size: 26px; font-weight: 800; color: #111827; letter-spacing: -0.02em; margin-bottom: 4px;">Nexus<span style="font-weight: 300; color: #6b7280;">Gestor</span></div>
            <p>SISTEMA DE GESTÃO DE PANIFICAÇÃO</p>
          </div>
          <div class="title-area">
            <h2>Cronograma de Operações</h2>
            <div class="date-range">${dataRangeStr}</div>
            <div class="generated">Gerado em: ${generatedAt}</div>
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th class="th-tech">Técnico</th>
    `;
    
    // Colunas dos dias
    const dayNames = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
    const todayISO = getLocalISO(new Date());
    
    weekDates.forEach((d, i) => {
      const dStr = getLocalISO(d);
      const isToday = dStr === todayISO;
      html += `
        <th class="th-day ${isToday ? 'day-today' : ''}">
          <div class="day-name">${dayNames[i]}</div>
          <div class="day-number">${d.getDate()}</div>
          ${isToday ? '<div class="today-badge">HOJE</div>' : ''}
        </th>
      `;
    });
    
    html += `
            </tr>
          </thead>
          <tbody>
    `;
    
    // Linhas dos padeiros
    this.padeiros.forEach(padeiro => {
      const init = padeiro.nome.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase();
      html += `
        <tr>
          <td>
            <div class="tech-cell">
              <div class="tech-avatar">${init}</div>
              <div class="tech-info">
                <span class="tech-name">${padeiro.nome}</span>
                <span class="tech-cod">COD ${padeiro.codTec || '000000'}</span>
              </div>
            </div>
          </td>
      `;
      
      weekDates.forEach(d => {
        const dateStr = getLocalISO(d);
        const tasks = this.tarefas
          .filter(t => t.padeiroId === padeiro.id && Cronograma.isTaskOnDate(t, dateStr))
          .sort((a, b) => (a.posicao || 0) - (b.posicao || 0));
          
        html += `<td class="task-cell">`;
        if (tasks.length === 0) {
          html += `<div class="empty-cell">—</div>`;
        } else {
          tasks.forEach(t => {
            html += `
              <div class="task-item status-${t.status || 'pendente'}">
                <div class="task-client">${t.nome || t.tarefas || t.clienteNome || 'Tarefa sem nome'}</div>
                <div class="task-time">
                  ${t.horario || '--:--'}
                </div>
              </div>
            `;
          });
        }
        html += `</td>`;
      });
      
      html += `</tr>`;
    });
    
    html += `
          </tbody>
        </table>
        </table>
      </body>
      </html>
    `;
    
    // Create an invisible iframe to print
    let printFrame = document.getElementById('print-frame');
    if (printFrame) {
      printFrame.remove();
    }
    
    printFrame = document.createElement('iframe');
    printFrame.id = 'print-frame';
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = '0';
    document.body.appendChild(printFrame);
    
    printFrame.contentWindow.document.open();
    printFrame.contentWindow.document.write(html);
    printFrame.contentWindow.document.close();

    setTimeout(() => {
      printFrame.contentWindow.focus();
      printFrame.contentWindow.print();
    }, 500);
  },

  // ──────────────────────────────────────────────────────────────
  // MODAL: Detalhe da Tarefa (somente leitura)
  // ──────────────────────────────────────────────────────────────
  openTaskDetail(id) {
    const t = this.tarefas.find(x => x.id === id);
    if (!t) return;
    const padeiro = this.padeiros.find(p => p.id === t.padeiroId);
    
    let statusBg = '#F1F5F9';
    let statusColor = '#475569';
    let statusBorder = 'rgba(71, 85, 105, 0.15)';
    let statusText  = 'Pendente';
    if (t.status === 'concluida') {
      statusBg = '#E6F4EA';
      statusColor = '#137333';
      statusBorder = 'rgba(19, 115, 51, 0.15)';
      statusText = 'Concluída';
    } else if (t.status === 'em_andamento') {
      statusBg = '#FEF3C7';
      statusColor = '#D97706';
      statusBorder = 'rgba(217, 119, 6, 0.15)';
      statusText = 'Andamento';
    }

    const hasChecklist = t.checklist && t.checklist.length > 0;
    const totalChecklist = hasChecklist ? t.checklist.length : 0;
    const doneChecklist = hasChecklist ? t.checklist.filter(c => c.done || c.feito).length : 0;

    Components.showModal('Detalhes da Tarefa', `
      <style>
        .premium-detail-container {
          font-family: 'Outfit', 'Inter', sans-serif;
          color: #4A4540;
        }
        .detail-hero-card {
          background: #FAF8F5;
          border: 1px solid #F0ECE6;
          border-radius: 16px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
        }
        .detail-hero-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: linear-gradient(135deg, #E55A2B 0%, #FF9A3C 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 4px 10px rgba(229, 90, 43, 0.2);
        }
        .detail-hero-info {
          flex-grow: 1;
        }
        .detail-hero-title {
          font-weight: 800;
          font-size: 18px;
          color: #1C1C1C;
          margin: 0 0 4px 0;
          line-height: 1.3;
        }
        .detail-hero-subtitle {
          font-size: 12px;
          color: #8C857B;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .detail-hero-badge {
          padding: 6px 12px;
          font-size: 11px;
          font-weight: 700;
          border-radius: 20px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          white-space: nowrap;
        }
        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 20px;
        }
        .detail-meta-card {
          background: #FFFFFF;
          border: 1px solid #F0ECE6;
          border-radius: 12px;
          padding: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: border-color 0.2s;
        }
        .detail-meta-card:hover {
          border-color: #D4C5B4;
        }
        .detail-meta-icon-wrapper {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .detail-meta-label {
          font-size: 11px;
          color: #A39C93;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.02em;
          margin-bottom: 2px;
        }
        .detail-meta-value {
          font-size: 13px;
          font-weight: 700;
          color: #4A4540;
        }
        .detail-progress-card {
          grid-column: span 2;
          background: #FFFFFF;
          border: 1px solid #F0ECE6;
          border-radius: 12px;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .detail-checklist-card {
          background: #FAF8F5;
          border: 1px solid #F0ECE6;
          border-radius: 16px;
          padding: 16px;
          margin-top: 20px;
        }
        .detail-checklist-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .detail-checklist-title {
          font-size: 12px;
          font-weight: 700;
          color: #8C857B;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .detail-checklist-counter {
          font-size: 11px;
          font-weight: 600;
          color: #8C857B;
        }
        .detail-checklist-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .detail-checklist-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          background: #FFFFFF;
          border: 1px solid #F0ECE6;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .detail-checklist-item:hover {
          background: #FAF8F5 !important;
          border-color: #D4C5B4 !important;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
        }
        .detail-checklist-item:active {
          transform: scale(0.98);
        }
        .detail-checkbox {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 18px;
          height: 18px;
          border-radius: 5px;
          border: 2px solid #D4C5B4;
          background: transparent;
          color: white;
          transition: all 0.15s ease;
        }
        .detail-checkbox.checked {
          border-color: #E55A2B;
          background: #E55A2B;
        }
        .detail-checklist-text {
          font-size: 13px;
          font-weight: 500;
          color: #4A4540;
          transition: all 0.15s ease;
        }
        .detail-checklist-text.checked {
          text-decoration: line-through;
          color: #A39C93;
        }
        .detail-obs-card {
          background: #FAF8F5;
          border: 1px solid #F0ECE6;
          border-radius: 16px;
          padding: 16px;
          margin-top: 20px;
        }
        .detail-obs-title {
          font-size: 12px;
          font-weight: 700;
          color: #8C857B;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .detail-obs-content {
          font-size: 13px;
          line-height: 1.6;
          color: #4A4540;
          background: #FFFFFF;
          border: 1px solid #F0ECE6;
          border-radius: 10px;
          padding: 12px;
          min-height: 50px;
          word-break: break-word;
        }
      </style>
      
      <div class="premium-detail-container">
        <!-- Hero Card -->
        <div class="detail-hero-card">
          <div class="detail-hero-icon">
            <i data-lucide="store" style="width: 24px; height: 24px;"></i>
          </div>
          <div class="detail-hero-info">
            <h4 class="detail-hero-title">${t.nome || t.tarefas || t.clienteNome || 'Tarefa sem nome'}</h4>
            <div class="detail-hero-subtitle">
              <i data-lucide="user" size="12" style="color: #A39C93; margin-top:-1px;"></i>
              Funcionário: <span style="font-weight:600; color:#6B6560;">${padeiro ? padeiro.nome : t.padeiroNome || 'Não definido'}</span>
              <span style="color: #E2E8F0;">|</span>
              <span style="font-family: monospace; font-weight: 600; font-size: 11px;">COD ${padeiro ? padeiro.codTec : t.codTec || '—'}</span>
            </div>
          </div>
          <span class="detail-hero-badge" style="background: ${statusBg}; color: ${statusColor}; border: 1px solid ${statusBorder};">
            ${statusText}
          </span>
        </div>

        <!-- Meta Grid -->
        <div class="detail-grid">
          <!-- Data Card -->
          <div class="detail-meta-card">
            <div class="detail-meta-icon-wrapper" style="background: rgba(229, 90, 43, 0.08); color: #E55A2B;">
              <i data-lucide="calendar" size="16"></i>
            </div>
            <div>
              <div class="detail-meta-label">Data</div>
              <div class="detail-meta-value">
                ${t.data ? new Date(t.data + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'}
              </div>
            </div>
          </div>

          <!-- Horário Card -->
          <div class="detail-meta-card">
            <div class="detail-meta-icon-wrapper" style="background: rgba(0, 122, 255, 0.08); color: #007AFF;">
              <i data-lucide="clock" size="16"></i>
            </div>
            <div>
              <div class="detail-meta-label">Horário</div>
              <div class="detail-meta-value" style="font-size:12px;">
                ${t.horario ? t.horario : 'Não definido'}${t.horario ? ` - ${t.horarioFim || '17:00'}` : ''}
              </div>
            </div>
          </div>

          <!-- Progress Card -->
          <div class="detail-progress-card">
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <div class="detail-meta-icon-wrapper" style="background: rgba(52, 199, 89, 0.08); color: #34C759; margin-top:-1px;">
                  <i data-lucide="trending-up" size="16"></i>
                </div>
                <div class="detail-meta-label" style="margin-bottom:0;">Progresso Total</div>
              </div>
              <span style="font-size: 14px; font-weight: 800; color: #28A745;" id="detail-progress-percent">${t.progresso || 0}%</span>
            </div>
            <div style="width: 100%; height: 8px; background: #F1F5F9; border-radius: 4px; overflow: hidden; position: relative;">
              <div id="detail-progress-fill" style="width: ${t.progresso || 0}%; height: 100%; background: linear-gradient(90deg, #34C759 0%, #28A745 100%); border-radius: 4px; transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);"></div>
            </div>
          </div>
        </div>

        <!-- Tags -->
        ${(t.tags && t.tags.length > 0) ? `
          <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom: 20px;">
            ${t.tags.map(tag => `<span class="trello-card-tag" style="background: rgba(229, 90, 43, 0.06); color: #E55A2B; border: 1px solid rgba(229, 90, 43, 0.12); font-size:10px; font-weight:700; padding:3px 9px; border-radius:20px; letter-spacing:0.02em;">${tag}</span>`).join('')}
          </div>
        ` : ''}

        <!-- Checklist -->
        ${hasChecklist ? `
          <div class="detail-checklist-card">
            <div class="detail-checklist-header">
              <div class="detail-checklist-title">
                <i data-lucide="list-checks" size="16"></i> Checklist
              </div>
              <span class="detail-checklist-counter" id="detail-checklist-counter">
                ${doneChecklist}/${totalChecklist} concluídos
              </span>
            </div>
            <div class="detail-checklist-list">
              ${t.checklist.map((c, index) => {
                const isDone = !!(c.done || c.feito);
                const textVal = c.text || c.texto || '';
                return `
                  <div class="detail-checklist-item" onclick="Cronograma.toggleDetailChecklistItem('${t.id}', ${index})">
                    <div class="detail-checkbox ${isDone ? 'checked' : ''}">
                      ${isDone ? '<i data-lucide="check" style="width: 12px; height: 12px; stroke-width: 3;"></i>' : ''}
                    </div>
                    <span class="detail-checklist-text ${isDone ? 'checked' : ''}">${textVal}</span>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        ` : ''}
        <!-- Orçamento -->
        ${(() => {
          const orcItems = t.orcamento ? (Array.isArray(t.orcamento) ? t.orcamento : (t.orcamento.itens || [])) : [];
          if (orcItems.length === 0) return '';
          let totalOrcamento = 0;
          const itemsHtml = orcItems.map(item => {
            const prod = (this.produtos || []).find(p => p.id === item.produtoId);
            if (!prod) return '';
            
            const qty = parseFloat(item.quantidade) || 0;
            const price = parseFloat(prod.preco) || 0;
            const subtotal = qty * price;
            totalOrcamento += subtotal;
            
            const estoque = prod.estoque || 0;
            let pct = 0;
            if (qty > 0) {
              pct = Math.round((estoque / qty) * 100);
            } else if (estoque > 0) {
              pct = 100;
            }
            const progressPercent = Math.min(100, pct);
            
            let barColor = '#EF4444'; // Red
            if (pct >= 100) {
              barColor = '#10B981'; // Green
            } else if (pct >= 30) {
              barColor = '#F59E0B'; // Orange
            }
            
            return `
              <div class="detail-checklist-item" style="display: flex; flex-direction: column; gap: 4px; padding: 10px 12px; align-items: stretch; cursor: default;">
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                  <span style="font-size: 13px; font-weight: 700; color: #4A4540;">${prod.descricao}</span>
                  <span style="font-size: 12px; font-weight: 700; color: #E55A2B;">R$ ${subtotal.toFixed(2).replace('.', ',')}</span>
                </div>
                <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; color: #8C857B;">
                  <span>Qtd: ${qty} ${prod.unidade || 'un'} x R$ ${price.toFixed(2).replace('.', ',')}</span>
                  <span>Estoque: ${estoque} ${prod.unidade || 'un'}</span>
                </div>
                <div class="trello-checklist-progress-bar-container" style="margin-bottom: 0; margin-top: 4px; display: flex; align-items: center; gap: 8px;">
                  <div class="trello-checklist-progress-bar" style="height: 6px; background: rgba(0,0,0,0.06); border-radius: 3px; flex-grow: 1;">
                    <div style="height: 100%; width: ${progressPercent}%; background: ${barColor}; border-radius: 3px;"></div>
                  </div>
                  <span style="font-size: 10px; font-weight: 700; color: ${barColor === '#10B981' ? '#10B981' : barColor === '#F59E0B' ? '#D97706' : '#EF4444'}; min-width: 32px; text-align: right;">${pct}%</span>
                </div>
              </div>
            `;
          }).join('');
          
          return `
            <div class="detail-checklist-card" style="margin-top: 20px;">
              <div class="detail-checklist-header">
                <div class="detail-checklist-title">
                  <i data-lucide="dollar-sign" size="16"></i> Orçamento de Insumos
                </div>
                <span style="font-size: 13px; font-weight: 800; color: #E55A2B;">
                  Total: R$ ${totalOrcamento.toFixed(2).replace('.', ',')}
                </span>
              </div>
              <div class="detail-checklist-list">
                ${itemsHtml}
              </div>
            </div>
          `;
        })()}

        <!-- Observações -->
        ${t.observacao ? `
          <div class="detail-obs-card">
            <div class="detail-obs-title">
              <i data-lucide="file-text" size="14"></i> Observações
            </div>
            <div class="detail-obs-content">${t.observacao}</div>
          </div>
        ` : ''}
      </div>
    `, `
      <button class="btn btn-pill btn-secondary" onclick="Components.closeModal()" style="border-radius:20px; font-weight:600; padding:10px 20px;">Fechar</button>
      <button class="btn btn-pill btn-outline" style="border-radius:20px; font-weight:600; color:#E55A2B; border-color:#E55A2B; padding:10px 20px;" onclick="Cronograma.openDuplicateTaskToDaysModal('${id}')">Duplicar p/ Dias</button>
      <button class="btn btn-pill btn-primary" onclick="Components.closeModal();Cronograma.openTaskForm('${id}')" style="border-radius:20px; font-weight:600; padding:10px 20px; background:#E55A2B; border:none; color:white;">Editar Tarefa</button>
    `, 'premium-task-detail-modal');
    Components.renderIcons();
  },

  async toggleDetailChecklistItem(taskId, index) {
    const t = this.tarefas.find(x => x.id === taskId);
    if (!t || !t.checklist || !t.checklist[index]) return;

    // Toggle done status
    t.checklist[index].done = !t.checklist[index].done;

    // Sincronizar com o Planejamento (LocalStorage)
    try {
      const savedCards = JSON.parse(localStorage.getItem('tomada_planejamento_cards') || '[]');
      const matchingCard = savedCards.find(c => c.titulo === t.nome || c.titulo === t.tarefas);
      if (matchingCard && matchingCard.checklist) {
        const textVal = t.checklist[index].text || t.checklist[index].texto || '';
        const cardChecklistItem = matchingCard.checklist.find(ci => (ci.texto || ci.text) === textVal) || matchingCard.checklist[index];
        if (cardChecklistItem) {
          cardChecklistItem.feito = !!(t.checklist[index].done || t.checklist[index].feito);
          localStorage.setItem('tomada_planejamento_cards', JSON.stringify(savedCards));
          
          if (window.Planejamento && Array.isArray(window.Planejamento.cards)) {
            const localCard = window.Planejamento.cards.find(c => c.id === matchingCard.id);
            if (localCard && localCard.checklist) {
              const localItem = localCard.checklist.find(ci => (ci.texto || ci.text) === textVal) || localCard.checklist[index];
              if (localItem) localItem.feito = cardChecklistItem.feito;
            }
          }
        }
      }
    } catch (errSync) {
      console.warn('Erro ao sincronizar checklist com Planejamento:', errSync);
    }

    // Sincronizar com as outras tarefas de mesmo nome no Cronograma (Kanban / Dias de Repetição)
    try {
      const sameNameTasks = (this.tarefas || []).filter(ot => ot.id !== taskId && (ot.nome === t.nome || ot.tarefas === t.tarefas));
      for (const ot of sameNameTasks) {
        let otChecklist = ot.checklist || [];
        if (typeof otChecklist === 'string') otChecklist = JSON.parse(otChecklist);
        
        if (otChecklist && otChecklist.length > 0) {
          const textVal = t.checklist[index].text || t.checklist[index].texto || '';
          const otItem = otChecklist.find(ci => (ci.text || ci.texto) === textVal) || otChecklist[index];
          if (otItem) {
            otItem.done = !!(t.checklist[index].done || t.checklist[index].feito);
            if (otItem.feito !== undefined) otItem.feito = otItem.done;
            ot.checklist = otChecklist;
            
            const otTotal = otChecklist.length;
            const otDoneCount = otChecklist.filter(c => c.done || c.feito).length;
            ot.progresso = Math.round((otDoneCount / otTotal) * 100);
            
            API.put(`/api/cronograma/${ot.id}`, {
              checklist: otChecklist,
              progresso: ot.progresso
            }).catch(err => console.warn('Erro ao sincronizar sub-tarefa de repetição:', err));
          }
        }
      }
    } catch (errRep) {
      console.warn('Erro ao sincronizar tarefas repetidas:', errRep);
    }

    // Recalculate progress
    const total = t.checklist.length;
    const doneCount = t.checklist.filter(c => c.done).length;
    const progress = Math.round((doneCount / total) * 100);
    t.progresso = progress;

    // Update UI elements in the modal immediately (Optimistic UI)
    const progressPercentEl = document.getElementById('detail-progress-percent');
    const progressFillEl = document.getElementById('detail-progress-fill');
    const checklistCounterEl = document.getElementById('detail-checklist-counter');
    
    if (progressPercentEl) progressPercentEl.textContent = `${progress}%`;
    if (progressFillEl) progressFillEl.style.width = `${progress}%`;
    if (checklistCounterEl) checklistCounterEl.textContent = `${doneCount}/${total} concluídos`;

    // Find the item clicked and toggle the style locally
    const items = document.querySelectorAll('.detail-checklist-item');
    const clickedItem = items[index];
    if (clickedItem) {
      const checkboxBox = clickedItem.querySelector('.detail-checkbox');
      const textSpan = clickedItem.querySelector('.detail-checklist-text');
      
      if (checkboxBox) {
        if (t.checklist[index].done) {
          checkboxBox.classList.add('checked');
          checkboxBox.innerHTML = '<i data-lucide="check" style="width: 12px; height: 12px; stroke-width: 3;"></i>';
        } else {
          checkboxBox.classList.remove('checked');
          checkboxBox.innerHTML = '';
        }
      }
      if (textSpan) {
        if (t.checklist[index].done) {
          textSpan.classList.add('checked');
        } else {
          textSpan.classList.remove('checked');
        }
      }
    }
    Components.renderIcons();

    // Trigger update in database
    const oldStatus = t.status;
    try {
      const updatedTask = await API.put(`/api/cronograma/${taskId}`, {
        checklist: t.checklist,
        progresso: progress
      });
      
      // Apply server-side auto-completion changes back to local state
      if (updatedTask) {
        if (updatedTask.status) t.status = updatedTask.status;
        if (updatedTask.kanbanListId) t.kanbanListId = updatedTask.kanbanListId;
        if (updatedTask.progresso !== undefined) t.progresso = updatedTask.progresso;
        if (updatedTask.checklist) {
          t.checklist = typeof updatedTask.checklist === 'string' ? JSON.parse(updatedTask.checklist) : updatedTask.checklist;
        }
      }
      
      // If task was auto-completed by backend (transitioned to concluida)
      if (oldStatus !== 'concluida' && updatedTask && updatedTask.status === 'concluida') {
        Components.closeModal();
        Components.toast('Tarefa concluída automaticamente! ✅', 'success');
      }
      
      // Update the Kanban card on the board (so it updates in background without reload)
      this.renderSemanal();
    } catch (e) {
      Components.toast('Erro ao atualizar checklist: ' + e.message, 'error');
      // Rollback on failure
      t.checklist[index].done = !t.checklist[index].done;
      const rolledDoneCount = t.checklist.filter(c => c.done).length;
      t.progresso = Math.round((rolledDoneCount / total) * 100);
      this.openTaskDetail(taskId);
    }
  },

  // ──────────────────────────────────────────────────────────────
  // Reordenar tarefas
  // ──────────────────────────────────────────────────────────────
  async changeTaskOrder(taskId, direction) {
    const task = this.tarefas.find(t => t.id === taskId);
    if (!task) return;

    const siblings = this.tarefas
      .filter(t => t.data === task.data && t.padeiroId === task.padeiroId)
      .sort((a, b) => (a.posicao || 0) - (b.posicao || 0));

    const currentIndex = siblings.findIndex(t => t.id === taskId);
    const targetIndex  = currentIndex + direction;

    if (targetIndex < 0 || targetIndex >= siblings.length) return;

    const targetTask = siblings[targetIndex];

    // Swap positions
    const oldPos = task.posicao || 0;
    const newPos = targetTask.posicao || 0;

    // If both are 0, assign proper indexes first
    if (oldPos === newPos) {
      siblings.forEach((t, i) => t.posicao = i * 10);
      task.posicao = siblings.findIndex(t => t.id === taskId) * 10;
      const targetSibling = siblings[siblings.findIndex(t => t.id === taskId) + direction];

      const temp = task.posicao;
      task.posicao = targetSibling.posicao;
      targetSibling.posicao = temp;

      await Promise.all(siblings.map(t => API.put(`/api/cronograma/${t.id}`, { posicao: t.posicao })));
    } else {
      task.posicao       = newPos;
      targetTask.posicao = oldPos;

      await Promise.all([
        API.put(`/api/cronograma/${task.id}`,       { posicao: task.posicao }),
        API.put(`/api/cronograma/${targetTask.id}`, { posicao: targetTask.posicao }),
      ]);
    }

    this.renderSemanal();
  },

  openDuplicateTaskToDaysModal(id) {
    const t = this.tarefas.find(x => x.id === id);
    if (!t) return;

    const dates = this.getWeekDates();
    const dayLabels = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

    Components.showModal('Duplicar para outros dias', `
      <div style="margin-bottom: 16px; font-size:14px; line-height:1.5;">
        Duplicar a tarefa de <b>${t.clienteNome}</b> para os seguintes dias desta semana:
      </div>
      <form id="duplicate-days-form" style="display:flex; flex-direction:column; gap:10px;">
        ${dates.map((date, idx) => {
          const dateStr = Cronograma.getLocalISO(date);
          const formattedDate = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
          const isCurrentDay = t.data === dateStr;
          return `
            <label style="display:flex; align-items:center; gap:10px; padding:10px 14px; background:var(--system-bg); border-radius:10px; cursor:${isCurrentDay ? 'not-allowed' : 'pointer'}; opacity:${isCurrentDay ? 0.6 : 1}">
              <input type="checkbox" name="selectedDates" value="${dateStr}" ${isCurrentDay ? 'disabled' : ''} style="width:20px; height:20px; accent-color:var(--primary);">
              <div>
                <span style="font-weight:600;">${dayLabels[idx]}</span>
                <span style="color:var(--text-tertiary); font-size:12px; margin-left:4px;">${formattedDate}</span>
              </div>
            </label>
          `;
        }).join('')}
      </form>
    `, `
      <button class="btn btn-secondary" onclick="Cronograma.openTaskDetail('${id}')">Voltar</button>
      <button class="btn btn-primary" onclick="Cronograma.duplicateTaskToDays('${id}')">Duplicar</button>
    `);
    Components.renderIcons();
  },

  async duplicateTaskToDays(id) {
    const t = this.tarefas.find(x => x.id === id);
    if (!t) return;

    const checkedBoxes = document.querySelectorAll('#duplicate-days-form input[name="selectedDates"]:checked');
    if (checkedBoxes.length === 0) {
      Components.toast('Selecione ao menos um dia para duplicar.', 'warning');
      return;
    }

    const selectedDates = Array.from(checkedBoxes).map(cb => cb.value);
    
    try {
      const criadas = await Promise.all(selectedDates.map(date => {
        const novaTarefa = {
          clienteId:   t.clienteId,
          clienteNome: t.clienteNome,
          padeiroId:   t.padeiroId,
          padeiroNome: t.padeiroNome,
          codTec:      t.codTec,
          data:        date,
          horario:     t.horario,
          horarioFim:  t.horarioFim,
          status:      'pendente',
          posicao:     t.posicao || 0,
          observacao:  t.observacao ? `[Cópia] ${t.observacao}` : '[Cópia]'
        };
        return API.post('/api/cronograma', novaTarefa);
      }));

      this.tarefas.push(...criadas);

      Components.closeModal();
      Components.toast('Tarefa duplicada com sucesso!', 'success');
      this.renderSemanal();
    } catch (e) {
      Components.toast('Erro ao duplicar tarefa: ' + e.message, 'error');
    }
  },

  // ──────────────────────────────────────────────────────────────
  // TRELLO CHECKLIST EDITOR METHODS
  // ──────────────────────────────────────────────────────────────
  initChecklistEditor(items) {
    const root = document.getElementById('trello-checklist-root');
    if (!root) return;

    root.innerHTML = `
      <div class="trello-checklist-container">
        <div class="trello-checklist-header">
          <h4 class="trello-checklist-title">
            <i data-lucide="check-square" size="14"></i> Checklist
          </h4>
        </div>
        <div class="trello-checklist-progress-bar-container">
          <div class="trello-checklist-progress-bar">
            <div id="trello-checklist-progress-fill" class="trello-checklist-progress-fill"></div>
          </div>
          <span id="trello-checklist-progress-percentage" class="trello-checklist-progress-percentage">0%</span>
        </div>
        <div id="trello-checklist-items-list" class="trello-checklist-items">
          <!-- Itens serão adicionados aqui -->
        </div>
        <div class="trello-checklist-add-form">
          <button type="button" id="trello-checklist-add-trigger" class="trello-checklist-add-trigger-btn" onclick="Cronograma.toggleChecklistAddForm(true)">
            <i data-lucide="plus" size="13"></i> Adicionar um item
          </button>
          <div id="trello-checklist-add-input-wrap" class="trello-checklist-add-input-wrap" style="display: none;">
            <input type="text" id="trello-checklist-new-item-text" class="trello-checklist-add-input" placeholder="Adicione um item..." onkeydown="if(event.key==='Enter') { event.preventDefault(); Cronograma.addChecklistItem(); }">
            <div class="trello-checklist-add-actions">
              <button type="button" class="btn btn-primary btn-sm" onclick="Cronograma.addChecklistItem()" style="padding: 6px 12px; font-size: 12px; height: auto;">Adicionar</button>
              <button type="button" class="btn btn-secondary btn-sm" onclick="Cronograma.toggleChecklistAddForm(false)" style="padding: 6px 12px; font-size: 12px; height: auto;">Cancelar</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Renderizar itens iniciais
    const listContainer = document.getElementById('trello-checklist-items-list');
    if (listContainer && items && items.length > 0) {
      items.forEach(item => {
        Cronograma.appendChecklistItemHTML(item.text, item.done);
      });
    }

    // Atualiza barra de progresso
    Cronograma.updateChecklistProgress();
    Components.renderIcons();
  },

  toggleChecklistAddForm(show) {
    const trigger = document.getElementById('trello-checklist-add-trigger');
    const wrap = document.getElementById('trello-checklist-add-input-wrap');
    const input = document.getElementById('trello-checklist-new-item-text');

    if (show) {
      if (trigger) trigger.style.display = 'none';
      if (wrap) wrap.style.display = 'flex';
      if (input) { input.value = ''; input.focus(); }
    } else {
      if (trigger) trigger.style.display = 'flex';
      if (wrap) wrap.style.display = 'none';
    }
  },

  appendChecklistItemHTML(text, done) {
    const listContainer = document.getElementById('trello-checklist-items-list');
    if (!listContainer) return;

    const itemDiv = document.createElement('div');
    itemDiv.className = 'trello-checklist-item';
    itemDiv.innerHTML = `
      <input type="checkbox" class="trello-checklist-item-checkbox" ${done ? 'checked' : ''} onchange="Cronograma.onChecklistItemToggle(this)">
      <input type="text" class="trello-checklist-item-text ${done ? 'done' : ''}" value="${text.replace(/"/g, '&quot;')}" onchange="Cronograma.updateChecklistProgress()">
      <button type="button" class="trello-checklist-item-delete-btn" onclick="this.closest('.trello-checklist-item').remove(); Cronograma.updateChecklistProgress();" title="Excluir item">
        <i data-lucide="trash-2" size="14"></i>
      </button>
    `;
    listContainer.appendChild(itemDiv);
    Components.renderIcons();
  },

  addChecklistItem() {
    const input = document.getElementById('trello-checklist-new-item-text');
    const text = input ? input.value.trim() : '';
    if (!text) return;

    Cronograma.appendChecklistItemHTML(text, false);
    if (input) {
      input.value = '';
      input.focus();
    }
    Cronograma.updateChecklistProgress();
  },

  onChecklistItemToggle(checkbox) {
    const textInput = checkbox.nextElementSibling;
    if (textInput) {
      textInput.classList.toggle('done', checkbox.checked);
    }
    Cronograma.updateChecklistProgress();
  },

  updateChecklistProgress() {
    const checkboxes = document.querySelectorAll('.trello-checklist-item-checkbox');
    const total = checkboxes.length;
    let percentage = 0;

    if (total > 0) {
      const checked = Array.from(checkboxes).filter(cb => cb.checked).length;
      percentage = Math.round((checked / total) * 100);
    }

    const fill = document.getElementById('trello-checklist-progress-fill');
    const pct = document.getElementById('trello-checklist-progress-percentage');
    if (fill) fill.style.width = `${percentage}%`;
    if (pct) pct.textContent = `${percentage}%`;

    // Sincronizar com o campo de progresso (%) no formulário se ele existir
    const progressInput = document.querySelector('input[name="progresso"]');
    if (progressInput) {
      progressInput.value = percentage;
    }
  },

  // ──────────────────────────────────────────────────────────────
  // TRELLO BUDGET (ORÇAMENTO) EDITOR METHODS
  // ──────────────────────────────────────────────────────────────
  initOrcamentoEditor(items) {
    const root = document.getElementById('trello-orcamento-root');
    if (!root) return;

    const activeProds = (this.produtos || []).filter(p => p.ativo !== false);

    root.innerHTML = `
      <div class="trello-checklist-container trello-orcamento-container">
        <div class="trello-checklist-header">
          <h4 class="trello-checklist-title">
            <i data-lucide="dollar-sign" size="14"></i> Orçamento
          </h4>
          <span id="trello-orcamento-total" style="font-size: 13px; font-weight: 700; color: #E55A2B;">Total: R$ 0,00</span>
        </div>
        
        <div id="trello-orcamento-items-list" class="trello-checklist-items" style="max-height: 250px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; margin-bottom: 8px;">
          <!-- Itens do orçamento serão adicionados aqui -->
        </div>

        <div class="trello-checklist-add-form" style="margin-top: 8px; position: relative;">
          <div class="cliente-search-wrapper" id="produto-search-wrapper" style="width: 100%;">
            <div class="cliente-search-input-wrap">
              <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                class="cliente-search-field"
                id="tarefa-produto-search"
                placeholder="Selecione um produto..."
                autocomplete="off"
                style="padding-left: 40px; width: 100%;"
              >
            </div>
            <div class="cliente-dropdown" id="produto-dropdown"></div>
          </div>
        </div>
      </div>
    `;

    // Render existing items
    const listContainer = document.getElementById('trello-orcamento-items-list');
    if (listContainer && items && items.length > 0) {
      items.forEach(item => {
        const prod = activeProds.find(p => p.id === item.produtoId);
        if (prod) {
          Cronograma.appendOrcamentoItemHTML(prod, item.quantidade);
        }
      });
    }

    Cronograma.updateOrcamentoTotals();
    
    // Inicializa o comportamento interativo do campo de busca de produtos
    Cronograma._initProdutoSearch();
    
    if (window.HigPopovers) {
      window.HigPopovers.initCustomSelects();
    }
    
    Components.renderIcons();
  },

  appendOrcamentoItemHTML(prod, quantidade) {
    const listContainer = document.getElementById('trello-orcamento-items-list');
    if (!listContainer) return;

    const estoque = prod.estoque || 0;
    const qty = parseFloat(quantidade) || 0;
    let pct = 0;
    if (qty > 0) {
      pct = Math.round((estoque / qty) * 100);
    } else if (estoque > 0) {
      pct = 100;
    }

    const progressPercent = Math.min(100, pct);
    
    let barColor = '#EF4444'; // Red
    if (pct >= 100) {
      barColor = '#10B981'; // Green
    } else if (pct >= 30) {
      barColor = '#F59E0B'; // Orange
    }

    const itemDiv = document.createElement('div');
    itemDiv.className = 'trello-orcamento-item';
    itemDiv.style.cssText = 'display: flex; flex-direction: column; gap: 6px; padding: 10px 12px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; margin-bottom: 4px;';
    itemDiv.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
        <span style="font-size: 13px; font-weight: 700; color: #1E293B; flex-grow: 1;">${prod.descricao}</span>
        <span style="font-size: 11px; color: #64748B;">Estoque: ${estoque} ${prod.unidade || 'un'}</span>
        <button type="button" class="trello-checklist-item-delete-btn" onclick="this.closest('.trello-orcamento-item').remove(); Cronograma.updateOrcamentoTotals();" title="Remover item" style="padding: 2px;">
          <i data-lucide="trash-2" size="14"></i>
        </button>
      </div>

      <div style="display: flex; align-items: center; gap: 10px;">
        <div style="flex-grow: 1; display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 11px; color: #64748B; min-width: 30px;">Qtd:</span>
          <input type="number" class="trello-orcamento-item-qty" value="${quantidade}" min="0.1" step="any" 
                 data-id="${prod.id}" data-preco="${prod.preco || 0}" data-estoque="${estoque}"
                 oninput="Cronograma.onOrcamentoQtyInput(this)"
                 style="width: 70px; height: 28px; border: 1px solid #D2CABD; border-radius: 6px; padding: 2px 6px; font-size: 12px; outline: none; background: white;">
          <span style="font-size: 11px; color: #64748B;">${prod.unidade || 'un'}</span>
        </div>
        <div style="text-align: right; min-width: 80px;">
          <span class="trello-orcamento-item-subtotal" style="font-size: 12px; font-weight: 700; color: #1C1A14;">R$ 0,00</span>
        </div>
      </div>

      <div class="trello-checklist-progress-bar-container" style="margin-bottom: 0; margin-top: 2px; display: flex; align-items: center; gap: 8px;">
        <div class="trello-checklist-progress-bar" style="height: 6px; background: rgba(0,0,0,0.06); border-radius: 3px; flex-grow: 1;">
          <div class="trello-orcamento-progress-fill" style="height: 100%; width: ${progressPercent}%; background: ${barColor}; border-radius: 3px; transition: width 0.3s ease, background-color 0.3s;"></div>
        </div>
        <span class="trello-orcamento-progress-pct" style="font-size: 10px; font-weight: 700; color: ${barColor === '#10B981' ? '#10B981' : barColor === '#F59E0B' ? '#D97706' : '#EF4444'}; min-width: 32px; text-align: right;">${pct}%</span>
      </div>
    `;

    listContainer.appendChild(itemDiv);
    Cronograma.updateOrcamentoItemSubtotal(itemDiv.querySelector('.trello-orcamento-item-qty'));
    Components.renderIcons();
  },

  addOrcamentoItem() {
    const select = document.getElementById('trello-orcamento-new-product');
    const prodId = select ? select.value : '';
    if (!prodId) return;

    const existingInput = document.querySelector(`.trello-orcamento-item-qty[data-id="${prodId}"]`);
    if (existingInput) {
      existingInput.focus();
      existingInput.select();
      Components.toast('Produto já adicionado ao orçamento.', 'info');
      return;
    }

    const prod = (this.produtos || []).find(p => p.id === prodId);
    if (prod) {
      Cronograma.appendOrcamentoItemHTML(prod, 1);
      select.value = '';
    }
  },

  onOrcamentoQtyInput(input) {
    Cronograma.updateOrcamentoItemSubtotal(input);
    Cronograma.updateOrcamentoTotals();
  },

  updateOrcamentoItemSubtotal(input) {
    const qty = parseFloat(input.value) || 0;
    const price = parseFloat(input.dataset.preco) || 0;
    const estoque = parseFloat(input.dataset.estoque) || 0;
    
    const subtotal = qty * price;
    const subtotalSpan = input.closest('.trello-orcamento-item').querySelector('.trello-orcamento-item-subtotal');
    if (subtotalSpan) {
      subtotalSpan.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
    }

    let pct = 0;
    if (qty > 0) {
      pct = Math.round((estoque / qty) * 100);
    } else if (estoque > 0) {
      pct = 100;
    }
    
    const progressPercent = Math.min(100, pct);
    const fill = input.closest('.trello-orcamento-item').querySelector('.trello-orcamento-progress-fill');
    const pctSpan = input.closest('.trello-orcamento-item').querySelector('.trello-orcamento-progress-pct');
    
    let barColor = '#EF4444'; // Red
    if (pct >= 100) {
      barColor = '#10B981'; // Green
    } else if (pct >= 30) {
      barColor = '#F59E0B'; // Orange
    }

    if (fill) {
      fill.style.width = `${progressPercent}%`;
      fill.style.backgroundColor = barColor;
    }
    if (pctSpan) {
      pctSpan.textContent = `${pct}%`;
      pctSpan.style.color = barColor === '#10B981' ? '#10B981' : barColor === '#F59E0B' ? '#D97706' : '#EF4444';
    }
  },

  updateOrcamentoTotals() {
    let grandTotal = 0;
    document.querySelectorAll('.trello-orcamento-item-qty').forEach(input => {
      const qty = parseFloat(input.value) || 0;
      const price = parseFloat(input.dataset.preco) || 0;
      grandTotal += qty * price;
    });

    const totalSpan = document.getElementById('trello-orcamento-total');
    if (totalSpan) {
      totalSpan.textContent = `Total: R$ ${grandTotal.toFixed(2).replace('.', ',')}`;
    }
  },

  getCardTemplatesOptions() {
    try {
      const templates = JSON.parse(localStorage.getItem('bancada_card_templates') || '[]');
      return templates.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
    } catch (e) {
      console.error(e);
      return '';
    }
  },

  saveCardTemplate(isMobile = false) {
    Components.showPrompt('Salvar Template de Card', 'Ex: Visita Semanal', (name) => {
      if (!name || !name.trim()) return;

      // Obter valores do formulário atual
      const form = document.getElementById('tarefa-form');
      if (!form) return;

      const fd = new FormData(form);
      const body = Object.fromEntries(fd);

      // Pegar cliente dos inputs hidden
      const clienteId = document.getElementById('tarefa-cliente-id')?.value || '';
      const clienteNome = document.getElementById('tarefa-cliente-nome')?.value || '';

      // Extrair o checklist atual
      const checklistItems = [];
      document.querySelectorAll('.trello-checklist-item').forEach(itemEl => {
        const textInput = itemEl.querySelector('.trello-checklist-item-text');
        const checkbox = itemEl.querySelector('.trello-checklist-item-checkbox');
        if (textInput && checkbox) {
          const textVal = textInput.value.trim();
          if (textVal) {
            checklistItems.push({ text: textVal, done: checkbox.checked });
          }
        }
      });

      // Extrair o orçamento atual
      const orcamentoItems = [];
      document.querySelectorAll('.trello-orcamento-item-qty').forEach(input => {
        const prodId = input.dataset.id;
        const qty = parseFloat(input.value) || 0;
        if (prodId && qty > 0) {
          orcamentoItems.push({ produtoId: prodId, quantidade: qty });
        }
      });

      const newTemplate = {
        id: 'tpl_' + Date.now(),
        name: name.trim(),
        padeiroId: body.padeiroId || '',
        clienteId,
        clienteNome,
        status: body.status || 'pendente',
        tempoMinimoMinutos: parseInt(body.tempoMinimoMinutos, 10) || 0,
        horario: body.horario || '',
        horarioFim: body.horarioFim || '',
        observacao: body.observacao || '',
        tags: body.tags || '',
        checklist: checklistItems,
        orcamento: orcamentoItems
      };

      try {
        const templates = JSON.parse(localStorage.getItem('bancada_card_templates') || '[]');
        templates.push(newTemplate);
        localStorage.setItem('bancada_card_templates', JSON.stringify(templates));

        Components.toast('Template de card salvo!', 'success');

        // Atualizar os selects na interface
        const selectDesktop = document.getElementById('card-template-selector');
        const selectMobile = document.getElementById('card-template-selector-mobile');
        [selectDesktop, selectMobile].forEach(sel => {
          if (sel) {
            sel.innerHTML = '<option value="">Selecione um template...</option>' + 
              templates.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
            sel.value = newTemplate.id;
          }
        });
      } catch (e) {
        Components.toast('Erro ao salvar template: ' + e.message, 'error');
      }
    });
  },

  loadCardTemplate(templateId) {
    if (!templateId) return;

    try {
      const templates = JSON.parse(localStorage.getItem('bancada_card_templates') || '[]');
      const t = templates.find(x => x.id === templateId);
      if (!t) return;

      // Preencher campos do formulário
      const form = document.getElementById('tarefa-form');
      if (!form) return;

      // Padeiro
      const padeiroSel = document.getElementById('tarefa-padeiro');
      if (padeiroSel && t.padeiroId) {
        padeiroSel.value = t.padeiroId;
      }

      // Cliente
      if (t.clienteId) {
        this._selectCliente(t.clienteId, t.clienteNome);
      } else {
        const hiddenId = document.getElementById('tarefa-cliente-id');
        const hiddenNome = document.getElementById('tarefa-cliente-nome');
        const input = document.getElementById('tarefa-cliente-search');
        if (hiddenId) hiddenId.value = '';
        if (hiddenNome) hiddenNome.value = '';
        if (input) {
          input.value = '';
          input.classList.remove('has-value');
        }
      }

      // Status
      const statusSel = form.querySelector('select[name="status"]');
      if (statusSel) statusSel.value = t.status;

      // Tempo Mínimo
      const tempoInput = form.querySelector('input[name="tempoMinimoMinutos"]');
      if (tempoInput) tempoInput.value = t.tempoMinimoMinutos;

      // Horários
      const horarioInput = form.querySelector('input[name="horario"]');
      if (horarioInput) horarioInput.value = t.horario;

      const horarioFimInput = form.querySelector('input[name="horarioFim"]');
      if (horarioFimInput) horarioFimInput.value = t.horarioFim;

      // Observação
      const obsTextarea = form.querySelector('textarea[name="observacao"]');
      if (obsTextarea) obsTextarea.value = t.observacao;

      // Tags
      const tagsInput = form.querySelector('input[name="tags"]');
      if (tagsInput) tagsInput.value = t.tags;

      // Checklist
      this.initChecklistEditor(t.checklist || []);

      // Orçamento
      this.initOrcamentoEditor(Array.isArray(t.orcamento) ? t.orcamento : (t.orcamento?.itens || []));

      Components.toast('Template carregado!', 'success');
    } catch (e) {
      Components.toast('Erro ao carregar template: ' + e.message, 'error');
    }
  },

  deleteCardTemplate(isMobile = false) {
    const selectorId = isMobile ? 'card-template-selector-mobile' : 'card-template-selector';
    const selector = document.getElementById(selectorId);
    if (!selector || !selector.value) {
      Components.toast('Selecione um template para excluir.', 'error');
      return;
    }

    const templateId = selector.value;
    if (!confirm('Deseja realmente excluir este template de card?')) return;

    try {
      let templates = JSON.parse(localStorage.getItem('bancada_card_templates') || '[]');
      templates = templates.filter(x => x.id !== templateId);
      localStorage.setItem('bancada_card_templates', JSON.stringify(templates));

      Components.toast('Template excluído!', 'success');

      // Atualizar selects
      const selectDesktop = document.getElementById('card-template-selector');
      const selectMobile = document.getElementById('card-template-selector-mobile');
      [selectDesktop, selectMobile].forEach(sel => {
        if (sel) {
          sel.innerHTML = '<option value="">Selecione um template...</option>' + 
            templates.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
          sel.value = '';
        }
      });
    } catch (e) {
      Components.toast('Erro ao excluir template: ' + e.message, 'error');
    }
  }
});

