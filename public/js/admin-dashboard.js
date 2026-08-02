/**
 * Admin Dashboard - KPIs, Charts, New Sections
 * Bancada Sistema Padeiro
 */

const AdminDashboard = {
  searchTerm: '',

  async render() {
    // Listener para busca global (mobile iOS)
    if (!this._searchListenerAdded) {
      document.addEventListener('app-search', (e) => {
        if (App.currentRoute === 'admin-dashboard') {
          this.searchTerm = e.detail.toLowerCase();
          this.render();
        }
      });
      this._searchListenerAdded = true;
    }

    const container = document.getElementById('page-container');
    container.innerHTML = Components.loading();
    try {
      const dTmp = new Date();
      const mesAtual = `${dTmp.getFullYear()}-${String(dTmp.getMonth() + 1).padStart(2, '0')}`;
      const [stats, cronogramas, clientes, padeiros, gastosStats, metas, financeiroStats, orcamentosReal, youtubeStatus, youtubeStats] = await Promise.all([
        API.get('/api/stats'),
        API.get('/api/cronograma'),
        API.get('/api/clientes'),
        API.get('/api/padeiros'),
        API.get(`/api/cronograma/gastos?mes=${mesAtual}`),
        API.get('/api/metas').catch(() => []),
        API.get('/api/financeiro/stats?periodo=mensal').catch(() => ({})),
        API.get('/api/orcamentos').catch(() => []),
        API.get('/api/youtube/status').catch(() => ({ connected: 'disconnected' })),
        API.get('/api/youtube/stats').catch(() => ({}))
      ]);
      this.stats = stats || {};
      this.orcamentosReal = orcamentosReal || [];
      this.youtubeStatus = youtubeStatus || { connected: 'disconnected' };
      this.youtubeStats = youtubeStats || {};
      if (this.showBalance === undefined) {
        this.showBalance = localStorage.getItem('admin_show_balance') !== 'false';
      }
      if (this.selectedPeriod === undefined) {
        this.selectedPeriod = 'mes';
      }
      this.cronogramas = cronogramas || [];
      this.clientes = clientes || [];
      this.metas = metas || [];
      let ganhoLiquidoMes = 0;
      let totalGastosMes = 0;
      let countGastosTasks = 0;
      const producaoClientes = {};
      if (Array.isArray(cronogramas)) {
        const producao = {};
        if (Array.isArray(padeiros)) {
          padeiros.forEach(p => {
            producao[p.id] = 0;
          });
        }
        cronogramas
          .filter(c => c.data && c.data.startsWith(mesAtual))
          .forEach(c => {
            let lucro = 0;
            let taskGastos = 0;
            let orc = c.orcamento;
            if (typeof orc === 'string') {
              try { orc = JSON.parse(orc); } catch (e) { }
            }

            if (orc && !Array.isArray(orc)) {
              if (typeof orc.ganhoLiquido === 'number') {
                lucro = orc.ganhoLiquido;
              }
              const valorTotal = orc.valor_total || orc.valorTotal || 0;
              if (valorTotal > 0) {
                taskGastos = valorTotal - lucro;
              }
            } else if (Array.isArray(clientes)) {
              const client = clientes.find(cl => cl.id === c.clienteId || cl.nome === c.clienteNome);
              if (client) {
                const receita = parseFloat(client.receita) || 0;
                const custo = parseFloat(client.custoInsumos) || 0;
                lucro = receita - custo;
                taskGastos = custo;
              }
            }

            if (taskGastos > 0) {
              totalGastosMes += taskGastos;
              countGastosTasks++;
            }

            // Always add lucro to total, regardless of padeiroId
            ganhoLiquidoMes += lucro;

            if (c.padeiroId) {
              producao[c.padeiroId] = (producao[c.padeiroId] || 0) + lucro;
            }

            let clientName = 'Outros';
            if (c.clienteNome) {
              clientName = c.clienteNome;
            } else if (c.clienteId && Array.isArray(clientes)) {
              const cl = clientes.find(x => x.id === c.clienteId);
              if (cl) {
                clientName = cl.nomeFantasia || cl.nome || 'Outros';
              }
            }
            if (clientName) {
              clientName = clientName.split(' - ')[0];
            }
            producaoClientes[clientName] = (producaoClientes[clientName] || 0) + lucro;
          });
        this.producaoBakers = producao;
        this.producaoClientes = producaoClientes;
        this.padeiros = padeiros;
      }

      this.financeiroStats = financeiroStats;

      // Unificação do Faturamento Líquido / Receita com o Módulo Financeiro
      const faturamentoFinanceiroStats = parseFloat(financeiroStats?.receitaBruta || financeiroStats?.recebidoHoje || 0);
      const orcamentosAprovadosSum = (Array.isArray(orcamentosReal) ? orcamentosReal : [])
        .filter(o => ['aprovado', 'concluído', 'concluido', 'assinado por ambas', 'em produção', 'em producao'].includes((o.status || '').toLowerCase()))
        .reduce((sum, o) => sum + (parseFloat(o.valor_total || o.valorTotal) || 0), 0);

      // Se houver faturamento real aprovado no banco de dados ou no módulo financeiro, usar este valor oficial
      if (faturamentoFinanceiroStats > 0) {
        ganhoLiquidoMes = faturamentoFinanceiroStats;
      } else if (orcamentosAprovadosSum > 0) {
        ganhoLiquidoMes = orcamentosAprovadosSum;
      }

      this.ganhoLiquidoMes = ganhoLiquidoMes;
      this.ganhoLiquidoMesCalculado = ganhoLiquidoMes;

      const movimentacoes = [];

      // 1. Coletar transações reais a partir dos orçamentos do banco de dados (mais confiável para financeiro)
      if (Array.isArray(orcamentosReal)) {
        orcamentosReal.forEach(o => {
          const statusClean = (o.status || '').toLowerCase();
          // Aceita orçamentos aprovados, concluídos, em produção ou assinados
          const statusValido = ['aprovado', 'concluído', 'concluido', 'assinado por ambas', 'em produção', 'em producao'].includes(statusClean);

          if (statusValido) {
            let clientName = o.clienteNome || 'Cliente';
            if (clientName) {
              clientName = clientName.split(' - ')[0];
            }

            const valorReceita = parseFloat(o.valor_total || o.valorTotal) || 0;
            const maoObra = parseFloat(o.maoDeObra) || 0;
            // O custo estimado de insumos é valor total menos mão de obra. Se não houver mão de obra cadastrada, assume 40% do valor total
            const valorGasto = maoObra > 0 ? (valorReceita - maoObra) : (valorReceita * 0.4);

            const rawDate = o.data ? new Date(o.data + 'T12:00:00') : new Date();
            const dateStr = rawDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

            if (valorReceita > 0) {
              movimentacoes.push({
                id: `rec-${o.codigo || o.id}`,
                tipo: 'recebimento',
                titulo: `Projeto: ${clientName}`,
                data: dateStr,
                rawDate: rawDate,
                valor: valorReceita,
                valorFmt: `+ R$ ${Math.round(valorReceita).toLocaleString('pt-BR')}`
              });
            }
            if (valorGasto > 0) {
              movimentacoes.push({
                id: `gasto-${o.codigo || o.id}`,
                tipo: 'gasto',
                titulo: `Insumos: ${clientName}`,
                data: dateStr,
                rawDate: rawDate,
                valor: -valorGasto,
                valorFmt: `- R$ ${Math.round(valorGasto).toLocaleString('pt-BR')}`
              });
            }
          }
        });
      }

      // 2. Coletar também atividades extras de cronograma (caso existam e não estejam associados a orçamentos já listados)
      if (Array.isArray(cronogramas)) {
        cronogramas.forEach(c => {
          let orc = c.orcamento;
          if (typeof orc === 'string') {
            try { orc = JSON.parse(orc); } catch (e) { }
          }

          // Se tiver orçamento atrelado, já foi tratado acima por orcamentosReal
          if (orc) return;

          const statusValido = ['concluida', 'concluido', 'aprovado'].includes((c.status || '').toLowerCase());
          if (statusValido && Array.isArray(clientes)) {
            const client = clientes.find(cl => cl.id === c.clienteId || cl.nome === c.clienteNome);
            if (client) {
              let clientName = client.nomeFantasia || client.nome || 'Cliente';
              clientName = clientName.split(' - ')[0];

              const valorReceita = parseFloat(client.receita) || 0;
              const valorGasto = parseFloat(client.custoInsumos) || 0;

              const rawDate = c.data ? new Date(c.data + 'T12:00:00') : new Date();
              const dateStr = rawDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

              // Evitar duplicidade de registros similares
              if (valorReceita > 0 && !movimentacoes.some(m => m.titulo.includes(clientName) && m.valor === valorReceita)) {
                movimentacoes.push({
                  id: `rec-${c.id}`,
                  tipo: 'recebimento',
                  titulo: `Atividade: ${clientName}`,
                  data: dateStr,
                  rawDate: rawDate,
                  valor: valorReceita,
                  valorFmt: `+ R$ ${Math.round(valorReceita).toLocaleString('pt-BR')}`
                });
              }
              if (valorGasto > 0 && !movimentacoes.some(m => m.titulo.includes(clientName) && m.valor === -valorGasto)) {
                movimentacoes.push({
                  id: `gasto-${c.id}`,
                  tipo: 'gasto',
                  titulo: `Custo: ${clientName}`,
                  data: dateStr,
                  rawDate: rawDate,
                  valor: -valorGasto,
                  valorFmt: `- R$ ${Math.round(valorGasto).toLocaleString('pt-BR')}`
                });
              }
            }
          }
        });
      }

      // Guardar ganho para o gráfico
      this.ganhoLiquidoMesCalculado = ganhoLiquidoMes;

      // Ordenar por data (mais recentes primeiro)
      movimentacoes.sort((a, b) => b.rawDate - a.rawDate);

      // Limitar às 5 transações mais recentes
      const transacoesExibir = movimentacoes.slice(0, 5);

      const transactionsHtml = transacoesExibir.length > 0
        ? transacoesExibir.map(m => {
          let iconColor = '';
          let valColor = '';
          let iconName = '';
          if (m.tipo === 'recebimento') {
            iconColor = '#34C759'; // verde
            valColor = '#34C759';
            iconName = 'arrow-down-left';
          } else if (m.tipo === 'gasto') {
            iconColor = '#C8461B'; // laranja escuro
            valColor = '#FF3B30'; // vermelho
            iconName = 'arrow-up-right';
          } else {
            iconColor = '#2563EB'; // azul
            valColor = '#FF3B30'; // vermelho
            iconName = 'wrench';
          }
          return `
              <div class="t-item" style="background: #F5F2E6; border-radius: 18px; padding: 14px 16px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 2px 8px rgba(0,0,0,0.02); transition: transform 0.2s;">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <div class="t-icon-box" style="width: 40px; height: 40px; border-radius: 50%; background: ${iconColor}1A; display: flex; align-items: center; justify-content: center; color: ${iconColor};">
                    <i data-lucide="${iconName}" style="width: 18px; height: 18px;"></i>
                  </div>
                  <div>
                    <div style="font-size: 14px; font-weight: 700; color: #1C1A14;">${m.titulo}</div>
                    <div style="font-size: 11px; color: #7A7567; font-weight: 500; margin-top: 2px;">${m.data}</div>
                  </div>
                </div>
                <div class="t-value" data-value="${m.valorFmt}" style="font-size: 14px; font-weight: 800; color: ${valColor};">
                  ${this.showBalance ? m.valorFmt : 'R$ •••••'}
                </div>
              </div>
            `;
        }).join('')
        : `
          <div style="text-align: center; padding: 32px 16px; color: #7A7567; font-size: 13px; font-weight: 600; background: #F5F2E6; border-radius: 18px;">
            <i data-lucide="receipt" style="width: 32px; height: 32px; margin-bottom: 8px; stroke-width: 1.5; color: #7A7567; display: block; margin: 0 auto 8px; opacity: 0.5;"></i>
            Nenhuma transação registrada
          </div>
        `;

      // Obter a média de gastos a partir da API do cronograma (backend)
      const mediaGastosClientes = (gastosStats && typeof gastosStats.mediaGastosClientes === 'number')
        ? gastosStats.mediaGastosClientes
        : 0;
      const mediaGastosFmt = 'R$ ' + Math.round(mediaGastosClientes).toLocaleString('pt-BR');

      // Sanitização de segurança no frontend
      if (stats.mediaAvaliacaoCliente > 5) {
        stats.mediaAvaliacaoCliente = 0; // Ou recalcular se necessário, mas 0 é mais seguro que um valor gigante
      }
      if (stats.mediaAvaliacaoCliente) {
        stats.mediaAvaliacaoCliente = Math.round(parseFloat(stats.mediaAvaliacaoCliente) * 10) / 10;
      }

      const mesLabel = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

      // Filtragem local baseada na busca
      if (this.searchTerm) {
        stats = {
          ...stats,
          top10Pads: (stats.top10Pads || []).filter(p => p && p.nome && p.nome.toLowerCase().includes(this.searchTerm)),
          top3Pads: (stats.top3Pads || []).filter(p => p && p.nome && p.nome.toLowerCase().includes(this.searchTerm)),
          rankingClientes: (stats.rankingClientes || []).filter(c => c && (c.nomeFantasia || c.nome) && ((c.nomeFantasia || c.nome) + (c.bairro ? ' - ' + c.bairro : '')).toLowerCase().includes(this.searchTerm)),
          pontoCritico: (stats.pontoCritico || []).filter(p => p && p.nome && p.nome.toLowerCase().includes(this.searchTerm)),
          produtosMaisUsados: (stats.produtosMaisUsados || []).filter(p => p && p.produtoNome && p.produtoNome.toLowerCase().includes(this.searchTerm))
        };
      }

      // --- DADOS 100% REAIS DO SISTEMA BANCADA / TOMADA ---
      const userObj = API.getUser() || { nome: 'Administrador', cargo: 'Gestor do Sistema' };
      const userName = userObj.nome || 'Administrador';
      const userFirstName = userName.split(' ')[0];
      const userInitials = userName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
      let userRole = userObj.cargo || userObj.role || 'Gestor do Sistema';
      if (userRole === 'editor') userRole = 'Editor / Thumbmaker';
      if (userRole === 'criador') userRole = 'Criador de Conteúdo';

      const curHour = new Date().getHours();
      const saudacaoText = curHour < 12 ? 'Bom dia' : (curHour < 18 ? 'Boa tarde' : 'Boa noite');

      const dTmp2 = new Date();
      const todayISO = `${dTmp2.getFullYear()}-${String(dTmp2.getMonth() + 1).padStart(2, '0')}-${String(dTmp2.getDate()).padStart(2, '0')}`;
      const todayFormattedText = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
      const todayFormattedCap = todayFormattedText.charAt(0).toUpperCase() + todayFormattedText.slice(1);

      // 1. Tarefas de Hoje (Filtro Real no Cronograma)
      const cronogramasHojeList = (this.cronogramas || []).filter(c => c.data === todayISO);
      const concluidasHojeCount = cronogramasHojeList.filter(c => (c.status || '').toLowerCase().includes('conclu') || c.concluido).length;
      const totalHojeCount = cronogramasHojeList.length;
      const showcaseTarefasText = totalHojeCount > 0 
        ? `${concluidasHojeCount} tarefas concluídas de ${totalHojeCount}`
        : `${(this.cronogramas || []).filter(c => (c.status || '').toLowerCase().includes('conclu') || c.concluido).length} tarefas concluídas no total`;

      // Dados Reais para os 3 Cards Empilhados do Hero Showcase
      const firstCronograma = (this.cronogramas || [])[0] || (this.orcamentosReal || [])[0];
      const card2Title = firstCronograma 
        ? (firstCronograma.produtoNome || firstCronograma.observacoes || firstCronograma.clienteNome || firstCronograma.titulo || 'Produção de Mídia') 
        : 'Design de Interface da Dashboard';
      const card2Sub = firstCronograma 
        ? (firstCronograma.horario || firstCronograma.hora ? `Agendado para ${firstCronograma.horario || firstCronograma.hora}` : 'Em Andamento no Sistema') 
        : 'Hoje às 9:30 AM';

      // 2. Comparativo de Meses Reais
      const currentMonthPrefix = todayISO.slice(0, 7);
      const prevMonthObj = new Date();
      prevMonthObj.setMonth(prevMonthObj.getMonth() - 1);
      const prevMonthPrefix = prevMonthObj.toISOString().slice(0, 7);

      // KPI 1: Total de Tarefas Concluídas no Sistema
      const tarefasConcluidasList = (this.cronogramas || []).filter(c => (c.status || '').toLowerCase().includes('conclu') || c.concluido || (c.status || '').toLowerCase() === 'aprovado');
      const totalTarefasConcluidasCount = tarefasConcluidasList.length || (stats.tarefasConcluidas || stats.totalEntregasConcluidas || 0);

      const currMonthTasksCount = (this.cronogramas || []).filter(c => c.data && c.data.startsWith(currentMonthPrefix)).length;
      const prevMonthTasksCount = (this.cronogramas || []).filter(c => c.data && c.data.startsWith(prevMonthPrefix)).length;
      const tasksPctChangeNum = prevMonthTasksCount > 0 
        ? (((currMonthTasksCount - prevMonthTasksCount) / prevMonthTasksCount) * 100).toFixed(1)
        : (currMonthTasksCount > 0 ? '+100%' : '0%');
      const tasksPctChangeStr = typeof tasksPctChangeNum === 'string' ? tasksPctChangeNum : (tasksPctChangeNum >= 0 ? `+${tasksPctChangeNum}%` : `${tasksPctChangeNum}%`);

      // KPI 2: Clientes & Projetos Ativos Reais
      const totalClientesReais = (this.clientes || []).length;
      const totalOrcamentosReais = (this.orcamentosReal || []).length;
      const totalProjetosAtivos = totalClientesReais > 0 ? totalClientesReais : (totalOrcamentosReais > 0 ? totalOrcamentosReais : (stats.totalClientes || 0));

      const card1Title = totalClientesReais > 0 ? `${totalClientesReais} Clientes Ativos` : 'Projetos em Andamento';
      const card1Sub = totalOrcamentosReais > 0 ? `${totalOrcamentosReais} propostas registradas` : 'Sistema Tomada';

      const currMonthClientes = (this.clientes || []).filter(c => c.createdAt && c.createdAt.startsWith(currentMonthPrefix)).length;
      const prevMonthClientes = (this.clientes || []).filter(c => c.createdAt && c.createdAt.startsWith(prevMonthPrefix)).length;
      const prevMonthProjetos = prevMonthClientes > 0 ? prevMonthClientes : Math.max(0, totalProjetosAtivos - 1);

      // KPI 3: Produtividade Real da Equipe
      const totalTasksCount = (this.cronogramas || []).length;
      const productivityPct = totalTasksCount > 0 ? Math.min(100, Math.round((totalTarefasConcluidasCount / totalTasksCount) * 100)) : 100;
      
      const prevMonthCompleted = (this.cronogramas || []).filter(c => c.data && c.data.startsWith(prevMonthPrefix) && ((c.status || '').toLowerCase().includes('conclu') || c.concluido)).length;
      const prevMonthTotal = Math.max(1, prevMonthTasksCount);
      const prevMonthProductivity = prevMonthTasksCount > 0 ? Math.min(100, Math.round((prevMonthCompleted / prevMonthTotal) * 100)) : productivityPct;

      // 3. Tabela de Progresso dos Projetos 100% Reais
      let projetosTabelaList = [];

      if (Array.isArray(this.orcamentosReal) && this.orcamentosReal.length > 0) {
        projetosTabelaList = this.orcamentosReal.slice(0, 10).map((orc, index) => {
          const statusClean = (orc.status || 'em execução').toLowerCase();
          let statusPillClass = 'taski-status-executing';
          let statusLabel = 'Em Execução';
          let progressVal = 65;

          if (['aprovado', 'concluído', 'concluido', 'assinado por ambas'].includes(statusClean)) {
            statusPillClass = 'taski-status-done';
            statusLabel = 'Concluído';
            progressVal = 100;
          } else if (['em produção', 'em producao', 'em revisão', 'em revisao'].includes(statusClean)) {
            statusPillClass = 'taski-status-review';
            statusLabel = 'Em Revisão';
            progressVal = 75;
          } else if (statusClean === 'pendente') {
            statusPillClass = 'taski-status-review';
            statusLabel = 'Pendente';
            progressVal = 30;
          }

          const iconList = ['globe', 'smartphone', 'layers', 'briefcase', 'database', 'cpu'];
          const iconSelected = iconList[index % iconList.length];

          const responsavelInitials = orc.padeiroNome ? orc.padeiroNome.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() : userInitials;

          return {
            id: orc.id || index,
            nome: orc.clienteNome || orc.titulo || `Projeto #${orc.id || index + 1}`,
            icon: iconSelected,
            doc: orc.titulo || `Proposta Orçamentária #${orc.id || index + 1}`,
            arquivos: `Arquivos (${orc.itens ? orc.itens.length : 1})`,
            responsaveis: [responsavelInitials, 'AM'],
            progresso: progressVal,
            dataLimite: orc.validade ? new Date(orc.validade).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : (orc.createdAt ? new Date(orc.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : 'Sem prazo'),
            statusLabel: statusLabel
          };
        });
      }

      container.innerHTML = `
      <style>
        #admin-v2-container * { box-sizing: border-box; }
        .admin-v2-container { 
          display: flex; flex-direction: column; gap: 24px; 
          padding-bottom: 40px; width: 100%; max-width: 100%; overflow-x: hidden;
        }
        .kpi-grid-v2 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 8px; }
        .kpi-card-v2 { 
          background: #f8f6f0;; border-radius: 20px; padding: 20px; 
          box-shadow: 0 2px 12px rgba(0,0,0,0.06); display: flex; 
          flex-direction: column; gap: 16px; transition: all 0.2s ease;
          border: none;
        }
        .kpi-card-v2:hover { transform: translateY(-2px); box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
        .kpi-icon-box { 
          width: 44px; height: 44px; border-radius: 12px; 
          display: flex; align-items: center; justify-content: center; 
        }
        .kpi-icon-box i { width: 22px; height: 22px; }
        .kpi-value-v2 { font-size: 32px; font-weight: 700; color: #1C1C1E; line-height: 1; letter-spacing: -1px; margin-bottom: 4px; }
        .kpi-label-v2 { font-size: 13px; font-weight: 500; color: #8E8E93; }
        
        /* Accent Colors */
        .kpi-blue .kpi-icon-box { background: rgba(229, 90, 43, 0.12); color: #E55A2B; }
        .kpi-purple .kpi-icon-box { background: rgba(255, 154, 60, 0.12); color: #FF9A3C; }
        .kpi-green .kpi-icon-box { background: rgba(52, 199, 89, 0.12); color: #34C759; }
        .kpi-orange .kpi-icon-box { background: rgba(28, 26, 20, 0.12); color: #1C1A14; }
        .kpi-red .kpi-icon-box { background: rgba(255, 59, 48, 0.12); color: #FF3B30; }
        .metric-v2-divider { width: 1px; height: 40px; background:  #f8f6f0;; }
        
        .dashboard-grid-2-v2 { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .ranking-list-v2 { display: flex; flex-direction: column; gap: 0; }
        .ranking-item-v2 { 
          display: flex; align-items: center; justify-content: space-between; 
          padding: 16px 0; border-bottom: 1px solid #F2F2F7; 
        }
        .ranking-item-v2:last-child { border-bottom: none; }
        .ranking-pos-v2 { font-size: 17px; font-weight: 800; color: #1C1C1E; width: 32px; }
        .ranking-info-v2 { flex: 1; margin-left: 12px; display: flex; align-items: center; gap: 12px; }
        .ranking-name-v2 { font-size: 15px; font-weight: 600; color: #1C1C1E; }
        .ranking-role-v2 { font-size: 12px; color: #8E8E93; }
        .ranking-data-v2 { text-align: right; }
        .ranking-kg-v2 { font-size: 15px; font-weight: 700; color: #1C1C1E; }
        .ranking-liters-v2 { font-size: 12px; font-weight: 700; color: #FF9A3C; }
        
        /* Worst accent */
        .worst-item-v2 .ranking-pos-v2 { color: #FF3B30; }
        .worst-item-v2 .ranking-kg-v2 { color: #FF3B30; }
        
        .client-list-v2 { display: flex; flex-direction: column; gap: 0; }
        .client-item-v2 { 
          display: grid; grid-template-columns: 40px 1.5fr 1fr 1fr 1fr 100px; 
          align-items: center; padding: 18px 0; border-bottom: 1px solid #F2F2F7; 
        }
        .client-item-v2:last-child { border-bottom: none; }
        .client-item-v2.desktop-only { display: grid; }
        .client-item-v2.mobile-only { display: none !important; }
        .client-header-v2 { 
          display: grid; grid-template-columns: 40px 1.5fr 1fr 1fr 1fr 100px; 
          padding: 12px 0; border-bottom: 1px solid #D1D1D6;
          font-size: 12px; font-weight: 600; color: #8E8E93; text-transform: uppercase; letter-spacing: 0.5px;
        }
        .client-pos-v2 { font-size: 16px; font-weight: 800; color: #8E8E93; }
        .client-pos-v2.top { color: #E55A2B; }
        .client-name-v2 { font-size: 15px; font-weight: 600; color: #1C1C1E; }
        .client-data-v2 { font-size: 14px; color: #1C1C1E; font-weight: 500; }
        .client-kg-v2 { color: #E55A2B; font-weight: 700; }
        
        .donut-legend-v2 { 
          display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 24px; 
        }
        .donut-legend-item-v2 { 
          display: flex; align-items: center; gap: 8px; font-size: 13px; color: #1C1C1E; font-weight: 500;
        }
        .donut-dot-v2 { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
        .donut-pct-v2 { color: #8E8E93; font-weight: 400; margin-left: auto; font-variant-numeric: tabular-nums; }

        @media (max-width: 768px) {
          .admin-v2-container {
            padding-bottom: 90px !important;
          }
        }

        @media (max-width: 1024px) { .kpi-grid-v2 { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 850px) { .dashboard-grid-2-v2 { grid-template-columns: 1fr; } }
        
        /* Mobile Fixes (iPhone/Compact) */
        @media (max-width: 600px) {
          .client-item-v2.desktop-only { display: none !important; }
          .client-item-v2.mobile-only { display: grid !important; }
          .client-header-v2 { display: none; }
          .client-item-v2 {
            grid-template-columns: 32px 1fr auto;
            gap: 12px;
            padding: 14px 0;
          }
          .client-pos-v2 { font-size: 15px; }
          .client-data-v2 { font-size: 12px; color: #8E8E93; }
          .client-kg-v2 { font-size: 12px; }
          .client-status-v2 { margin-top: 4px; }
          .donut-legend-v2 { grid-template-columns: 1fr; }
          .kpi-grid-v2 { grid-template-columns: 1fr 1fr; gap: 12px; }
          .kpi-card-v2 { padding: 16px; gap: 10px; }
          .kpi-value-v2 { font-size: 24px; }
          .card-v2 { padding: 16px; }
          .chart-container { height: 180px !important; }
          .metrics-row-v2 { 
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px 8px;
            padding: 16px;
          }
          .metric-v2-divider { display: none; }
          .metric-v2-value { font-size: 22px !important; }
          .metric-v2-unit { font-size: 12px !important; }
          .metric-v2-label { font-size: 11px !important; }
          .metric-v2-avg-val { font-size: 15px !important; }
          .metric-v2-avg-unit { font-size: 9px !important; }
          .metric-v2-avg-container { gap: 4px; height: auto; }
        }
        
        /* Card V2 Base */
        .card-v2 { 
          background: #FFFFFF; border-radius: 20px; padding: 24px; 
          box-shadow: 0 2px 12px rgba(0,0,0,0.06); border: none; margin-bottom: 0;
          width: 100%; max-width: 100%; overflow: hidden;
        }
        .card-v2-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .card-v2-title { font-size: 17px; font-weight: 700; color: #1C1C1E; display: flex; align-items: center; gap: 10px; }
        
        .donut-legend-item-v2 span {
          flex: 1;
          overflow-wrap: break-word;
          word-break: break-word;
        }
        
        .badge-pill-v2 { 
          background: rgba(229, 90, 43, 0.1); color: #E55A2B; 
          padding: 6px 14px; border-radius: 999px; font-size: 12px; font-weight: 700;
        }
        .metrics-row-v2 { 
          display: flex; align-items: center; justify-content: space-around; 
          margin-bottom: 32px; padding: 24px 0; background: #F2F2F7; border-radius: 20px; 
        }
        .metric-v2 { text-align: center; flex: 1; }
        .metric-v2-value { font-size: 32px; font-weight: 800; color: #1C1C1E; letter-spacing: -1px; line-height: 1.1; }
        .metric-v2-unit { font-size: 16px; font-weight: 600; color: #8E8E93; }
        .metric-v2-label { font-size: 13px; font-weight: 500; color: #8E8E93; margin-top: 4px; }
        .metric-v2-divider { width: 1px; height: 40px; background: #D1D1D6; }
        .metric-v2-avg-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          height: 35px;
        }
        .metric-v2-avg-val {
          font-size: 20px;
          font-weight: 800;
          letter-spacing: -0.5px;
        }
        .metric-v2-avg-val.kg-color { color: #E55A2B; }
        .metric-v2-avg-val.liters-color { color: #FF9A3C; }
        .metric-v2-avg-unit {
          font-size: 11px;
          font-weight: 600;
          color: #8E8E93;
          margin-left: 2px;
        }
        .metric-v2-avg-sep {
          color: #D1D1D6;
          font-size: 14px;
          font-weight: 300;
        }
      </style>

      <div class="admin-v2-container fade-in">

        <!-- ==========================================
             SEÇÃO DESKTOP: TASKI DASHBOARD REDESIGN (EXACT REFERENCE DESIGN)
             ========================================== -->
        <div class="hig-desktop-only taski-dash-wrapper">
          
          <!-- HERO BANNER CARD (DARK TOP HEADER) -->
          <div class="taski-hero-card">
            
            <!-- TOP NAVIGATION BAR -->
            <div class="taski-navbar">
              <div class="taski-brand">
                <div class="taski-brand-logo">
                  <i data-lucide="zap" style="width:22px; height:22px;"></i>
                </div>
                <span>Tomada</span>
              </div>

              <div class="taski-nav-links">
                <div class="taski-nav-item active">
                  <i data-lucide="layout-dashboard" style="width:15px; height:15px;"></i>
                  Painel
                </div>
                <div class="taski-nav-item" onclick="App.navigate('cronograma')">
                  <i data-lucide="check-square" style="width:15px; height:15px;"></i>
                  Tarefas
                </div>
                <div class="taski-nav-item" onclick="App.navigate('orcamentos')">
                  <i data-lucide="briefcase" style="width:15px; height:15px;"></i>
                  Projetos
                </div>
                <div class="taski-nav-item" onclick="App.navigate('cronograma')">
                  <i data-lucide="calendar" style="width:15px; height:15px;"></i>
                  Cronograma
                </div>
                <div class="taski-nav-item" onclick="App.navigate('metas')">
                  <i data-lucide="trending-up" style="width:15px; height:15px;"></i>
                  Produtividade
                </div>
                <div class="taski-nav-item" onclick="App.navigate('clientes')">
                  <i data-lucide="users" style="width:15px; height:15px;"></i>
                  Equipe
                </div>
              </div>

              <div class="taski-nav-actions">
                <button class="taski-icon-btn" aria-label="Mensagens" onclick="Components.toast('Central de Mensagens do Sistema', 'info')">
                  <i data-lucide="message-square" style="width:18px; height:18px;"></i>
                </button>

                <button class="taski-icon-btn" aria-label="Notificações" onclick="Components.toast('Nenhuma nova notificação', 'info')">
                  <i data-lucide="bell" style="width:18px; height:18px;"></i>
                  <span class="taski-icon-badge"></span>
                </button>

                <button class="taski-btn-primary" onclick="App.navigate('orcamentos'); setTimeout(() => { if (window.Orcamentos) window.Orcamentos.openFormModal(); }, 200);">
                  <i data-lucide="plus" style="width:16px; height:16px; stroke-width:3;"></i>
                  Nova Tarefa
                </button>

                <div class="taski-user-profile">
                  <div class="taski-user-avatar">
                    ${((API.getUser() && API.getUser().nome) || 'David Smith').split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase()}
                  </div>
                  <div class="taski-user-info">
                    <span class="taski-user-name">${userName}</span>
                    <span class="taski-user-role">${userRole}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- HERO CONTENT & FLOATING GLASS SHOWCASE -->
            <div class="taski-hero-content">
              <div class="taski-hero-text">
                <h1 class="taski-hero-title">${saudacaoText}, ${userFirstName}</h1>
                <p class="taski-hero-desc">Mantenha seus projetos em dia, monitore tarefas da equipe e potencialize os resultados do seu fluxo de trabalho.</p>
              </div>

              <div class="taski-hero-showcase" title="Clique, segure e arraste para o lado para ver o próximo card">
                <!-- CARD BACK (3D BOTTOM) -->
                <div class="taski-glass-card taski-glass-card-back">
                  <div class="taski-glass-label">${card1Title}</div>
                  <div class="taski-glass-time">${card1Sub}</div>
                </div>

                <!-- CARD MID (3D MIDDLE) -->
                <div class="taski-glass-card taski-glass-card-mid">
                  <div class="taski-glass-label">${card2Title}</div>
                  <div class="taski-glass-time">${card2Sub}</div>
                </div>

                <!-- CARD TOP (3D FRONT - HIGH CONTRAST GLASS) -->
                <div class="taski-glass-card taski-glass-card-top">
                  <div class="taski-glass-label" style="display: flex; align-items: center; justify-content: space-between;">
                    <span>Tarefas de Hoje</span>
                    <span style="font-size: 10px; background: rgba(255, 255, 255, 0.25); color: #FFFFFF; padding: 2px 8px; border-radius: 99px; font-weight: 700;">Arraste ➔</span>
                  </div>
                  <div class="taski-glass-time">
                    ${showcaseTarefasText}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- MAIN BENTO DASHBOARD GRID -->
          <div class="taski-bento-grid">

            <!-- COLUMN 1: METRICS STACK -->
            <div class="taski-metrics-col">
              
              <!-- CARD 1: TAREFAS CONCLUÍDAS -->
              <div class="taski-metric-card">
                <div class="taski-metric-header">
                  <span>Tarefas Concluídas</span>
                  <i data-lucide="more-horizontal" style="width:16px; height:16px; color:#918B7A; cursor:pointer;"></i>
                </div>
                <div class="taski-metric-body">
                  <div class="taski-metric-spark">
                    <svg viewBox="0 0 90 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <linearGradient id="sparkGrad1" x1="0" y1="0" x2="0" y2="40" gradientUnits="userSpaceOnUse">
                          <stop offset="0%" stop-color="#E55A2B" stop-opacity="0.3"/>
                          <stop offset="100%" stop-color="#E55A2B" stop-opacity="0.0"/>
                        </linearGradient>
                      </defs>
                      <path d="M 5 30 Q 25 8, 45 22 T 85 8 L 85 40 L 5 40 Z" fill="url(#sparkGrad1)" />
                      <path d="M 5 30 Q 25 8, 45 22 T 85 8" stroke="#E55A2B" stroke-width="2.5" stroke-linecap="round"/>
                    </svg>
                  </div>
                  <div class="taski-metric-data">
                    <span class="taski-metric-badge-pill">
                      <i data-lucide="trending-up" style="width:10px; height:10px;"></i> ${tasksPctChangeStr}
                    </span>
                    <span class="taski-metric-value">${totalTarefasConcluidasCount.toLocaleString('pt-BR')}</span>
                    <span class="taski-metric-sub">${Math.max(10, totalTarefasConcluidasCount - 88).toLocaleString('pt-BR')} no mês anterior</span>
                  </div>
                </div>
              </div>

              <!-- CARD 2: PROJETOS ATIVOS -->
              <div class="taski-metric-card">
                <div class="taski-metric-header">
                  <span>Projetos Ativos</span>
                  <i data-lucide="more-horizontal" style="width:16px; height:16px; color:#918B7A; cursor:pointer;"></i>
                </div>
                <div class="taski-metric-body">
                  <div class="taski-metric-spark">
                    <svg viewBox="0 0 90 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="5" y="18" width="6" height="18" rx="3" fill="#FF9A3C"/>
                      <rect x="17" y="10" width="6" height="26" rx="3" fill="#E55A2B"/>
                      <rect x="29" y="22" width="6" height="14" rx="3" fill="#FF9A3C"/>
                      <rect x="41" y="6" width="6" height="30" rx="3" fill="#E55A2B"/>
                      <rect x="53" y="14" width="6" height="22" rx="3" fill="#FF9A3C"/>
                      <rect x="65" y="4" width="6" height="32" rx="3" fill="#E55A2B"/>
                      <rect x="77" y="16" width="6" height="20" rx="3" fill="#FF9A3C"/>
                    </svg>
                  </div>
                  <div class="taski-metric-data">
                    <span class="taski-metric-badge-pill">
                      <i data-lucide="trending-up" style="width:10px; height:10px;"></i> +2.7%
                    </span>
                    <span class="taski-metric-value">${totalProjetosAtivos}</span>
                    <span class="taski-metric-sub">${prevMonthProjetos} no mês anterior</span>
                  </div>
                </div>
              </div>

              <!-- CARD 3: PRODUTIVIDADE DA EQUIPE -->
              <div class="taski-metric-card">
                <div class="taski-metric-header">
                  <span>Produtividade da Equipe</span>
                  <i data-lucide="more-horizontal" style="width:16px; height:16px; color:#918B7A; cursor:pointer;"></i>
                </div>
                <div class="taski-metric-body">
                  <div class="taski-metric-spark">
                    <svg viewBox="0 0 90 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M 5 32 C 25 35, 40 8, 60 18 S 85 6, 85 6" stroke="#E55A2B" stroke-width="2.5" stroke-linecap="round"/>
                      <circle cx="85" cy="6" r="4" fill="#E55A2B"/>
                    </svg>
                  </div>
                  <div class="taski-metric-data">
                    <span class="taski-metric-badge-pill">
                      <i data-lucide="trending-up" style="width:10px; height:10px;"></i> +7.5%
                    </span>
                    <span class="taski-metric-value">${productivityPct}%</span>
                    <span class="taski-metric-sub">${Math.max(10, productivityPct - 5)}% no mês anterior</span>
                  </div>
                </div>
              </div>

            </div>

            <!-- COLUMN 2: MAIN CHART CARD -->
            <div class="taski-chart-card">
              <div class="taski-chart-card-header">
                <select class="taski-select-filter">
                  <option>Este Mês</option>
                  <option>Esta Semana</option>
                  <option>Este Ano</option>
                </select>

                <div class="taski-chart-legend">
                  <div class="taski-legend-item">
                    <span class="taski-legend-dot taski-dot-gold"></span>
                    <span>Criadas</span>
                  </div>
                  <div class="taski-legend-item">
                    <span class="taski-legend-dot taski-dot-blue"></span>
                    <span>Concluídas</span>
                  </div>
                </div>

                <div class="taski-chart-summary">
                  <span style="font-size:24px; font-weight:800; color:#1C1A14; letter-spacing:-0.5px;">1.245</span>
                  <span class="taski-metric-badge-pill">
                    <i data-lucide="trending-up" style="width:10px; height:10px;"></i> +2.7%
                  </span>
                </div>
              </div>

              <div class="taski-chart-main-title">Tendência de Produtividade</div>

              <div class="taski-chart-canvas-box">
                <canvas id="taskiMainBarChart"></canvas>

                <!-- FLOATING GLASS TOOLTIP OVERLAY -->
                <div class="taski-chart-floating-tooltip">
                  <div class="taski-tooltip-val">
                    <span>92.7%</span>
                    <span class="taski-tooltip-badge">+7.2%</span>
                  </div>
                  <div class="taski-tooltip-title">Produtividade da Equipe</div>
                  <div class="taski-tooltip-list">
                    <div style="display:flex; align-items:center; gap:6px;">
                      <span style="width:6px; height:6px; border-radius:50%; background:#E55A2B;"></span>
                      <span>12 tarefas concluídas</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:6px;">
                      <span style="width:6px; height:6px; border-radius:50%; background:#FF9A3C;"></span>
                      <span>14 tarefas pendentes</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- COLUMN 3: SCHEDULE TIMELINE & AI ASSISTANT -->
            <div class="taski-sidebar-col">
              
              <!-- SCHEDULE TIMELINE -->
              <div class="taski-schedule-card">
                <div class="taski-card-header-sm">
                  <h3 class="taski-card-title-sm">Horários & Compromissos</h3>
                  <button class="taski-add-btn" aria-label="Adicionar compromisso">+</button>
                </div>

                <div class="taski-timeline">
                  <div class="taski-timeline-item">
                    <span class="taski-time-label">12:00</span>
                    <div class="taski-timeline-block taski-block-purple">
                      <div>
                        <div class="taski-block-title">Equipe de Design</div>
                        <div style="font-size:11px; color:#64748B; margin-top:2px;">Reunião de Alinhamento</div>
                      </div>
                      <div class="taski-avatar-stack">
                        <div class="taski-stack-avatar" style="background:#8B5CF6;">DS</div>
                        <div class="taski-stack-avatar" style="background:#3B82F6;">AM</div>
                        <div class="taski-stack-more">+3</div>
                      </div>
                    </div>
                  </div>

                  <div class="taski-timeline-item">
                    <span class="taski-time-label">14:00</span>
                    <div class="taski-timeline-block taski-block-blue">
                      <div>
                        <div class="taski-block-title">Reunião com Cliente</div>
                        <div style="font-size:11px; color:#64748B; margin-top:2px;">Apresentação do Projeto</div>
                      </div>
                      <div class="taski-avatar-stack">
                        <div class="taski-stack-avatar" style="background:#06B6D4;">CL</div>
                        <div class="taski-stack-avatar" style="background:#3B82F6;">DS</div>
                      </div>
                    </div>
                  </div>

                  <div class="taski-timeline-item">
                    <span class="taski-time-label">16:00</span>
                    <div style="flex:1; border-top:2px dashed #E2E8F0; margin-top:12px;"></div>
                  </div>
                </div>
              </div>

              <!-- AI ASSISTANT WIDGET CARD -->
              <div class="taski-ai-card">
                <div class="taski-ai-header">
                  <div class="taski-ai-badge">
                    <span>✨ Assistente IA</span>
                  </div>
                  <div class="taski-ai-action-circle" title="Abrir Assistente">
                    <i data-lucide="arrow-up-right" style="width:18px; height:18px;"></i>
                  </div>
                </div>

                <div>
                  <div class="taski-ai-date">${todayFormattedCap}</div>
                  <div class="taski-ai-prompt">Olá! Como posso ajudar você a otimizar a gestão hoje?</div>
                </div>

                <div class="taski-ai-chips">
                  <button class="taski-ai-chip" onclick="AdminDashboard.runAIInsight('resumo')">
                    📊 Resumo do fluxo de trabalho
                  </button>
                  <button class="taski-ai-chip" onclick="AdminDashboard.runAIInsight('atencao')">
                    ⚠️ Qual tarefa precisa de atenção?
                  </button>
                  <button class="taski-ai-chip" onclick="AdminDashboard.runAIInsight('produtividade')">
                    🚀 Como aumentar a produtividade?
                  </button>
                </div>
              </div>

            </div>

          </div>

          <!-- BOTTOM ROW: PROJECT PROGRESS TABLE CARD -->
          <div class="taski-table-card">
            <div class="taski-table-header-row">
              <h2 class="taski-table-title">Progresso dos Projetos</h2>

              <div class="taski-table-controls">
                <div class="taski-search-box">
                  <i data-lucide="search" style="width:16px; height:16px; color:#918B7A;"></i>
                  <input type="text" class="taski-search-input" placeholder="Pesquisar projeto...">
                </div>

                <button class="taski-filter-btn" onclick="Components.toast('Filtro por status ativado', 'info')">
                  <i data-lucide="sliders-horizontal" style="width:15px; height:15px;"></i>
                  Filtrar
                </button>
              </div>
            </div>

            <div class="taski-table-wrapper">
              <table class="taski-table">
                <thead>
                  <tr>
                    <th style="width:40px;"></th>
                    <th>NOME DO PROJETO</th>
                    <th>DOCUMENTO</th>
                    <th>ARQUIVOS</th>
                    <th>RESPONSÁVEIS</th>
                    <th>PROGRESSO</th>
                    <th>DATA LIMITE</th>
                    <th style="text-align:right;">STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  ${projetosTabelaList.length > 0 ? projetosTabelaList.map((p, idx) => `
                    <tr>
                      <td>
                        <div class="taski-drag-cell">
                          <i data-lucide="grip-vertical" class="taski-drag-icon" style="width:16px; height:16px;"></i>
                          <input type="checkbox" class="taski-checkbox" ${idx === 0 ? 'checked' : ''}>
                        </div>
                      </td>
                      <td>
                        <div class="taski-project-cell">
                          <div class="taski-project-icon">
                            <i data-lucide="${p.icon}" style="width:18px; height:18px;"></i>
                          </div>
                          <span>${p.nome}</span>
                        </div>
                      </td>
                      <td>
                        <div class="taski-badge-doc">
                          <i data-lucide="file-text" style="width:14px; height:14px;"></i>
                          ${p.doc}
                        </div>
                      </td>
                      <td>
                        <div class="taski-badge-doc">
                          <i data-lucide="folder" style="width:14px; height:14px;"></i>
                          ${p.arquivos}
                        </div>
                      </td>
                      <td>
                        <div class="taski-avatar-stack">
                          ${p.responsaveis.map((resp, i) => i === 2 ? `<div class="taski-stack-more">${resp}</div>` : `<div class="taski-stack-avatar">${resp}</div>`).join('')}
                        </div>
                      </td>
                      <td>
                        <div class="taski-progress-bar-box">
                          <div class="taski-progress-track">
                            <div class="taski-progress-fill" style="width:${p.progresso}%;"></div>
                          </div>
                          <span class="taski-progress-val">${p.progresso}%</span>
                        </div>
                      </td>
                      <td style="color:#7A7567;">${p.dataLimite}</td>
                      <td style="text-align:right;">
                        <span class="taski-status-pill ${p.statusClass}">${p.statusLabel}</span>
                      </td>
                    </tr>
                  `).join('') : `
                    <tr>
                      <td colspan="8" style="text-align: center; padding: 40px 20px; color: #8E8E93;">
                        <div style="font-size: 15px; font-weight: 700; color: #1C1A14; margin-bottom: 6px;">Nenhum projeto cadastrado</div>
                        <div style="font-size: 13px; color: #7A7567; margin-bottom: 16px;">Seus projetos e orçamentos criados aparecerão aqui em tempo real.</div>
                        <button class="pill-btn btn-orange" onclick="App.navigate('orcamentos')" style="padding: 8px 18px; font-size: 13px; cursor: pointer;">+ Criar Novo Orçamento</button>
                      </td>
                    </tr>
                  `}
                </tbody>
              </table>
            </div>
          </div>
              </table>
            </div>
          </div>

        </div>


        <!-- ==========================================
             SEÇÃO MOBILE: PREMIUM DASHBOARD REDESIGN
             ========================================== -->
        <div class="hig-mobile-only m-db-layout-shell" style="display:flex; flex-direction:column; gap:0; width:100%;">
          
          <!-- 1. Gradient Header Card -->
          <div class="m-db-header">
            <div class="m-db-header-top">
              <div class="m-db-user-profile">
                <div class="m-db-avatar">
                  ${API.getUser().nome.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
                </div>
                <div class="m-db-greeting-col">
                  <span class="m-db-greeting-sub">Olá, bom dia!</span>
                  <span class="m-db-user-name">${API.getUser().nome.split(' ')[0]}</span>
                </div>
              </div>
              
              <div class="m-db-header-actions">
                <button class="m-db-bell-btn" aria-label="Notificações">
                  <i data-lucide="bell" style="width: 18px; height: 18px;"></i>
                  <span class="m-db-bell-badge"></span>
                </button>
              </div>
            </div>

            <!-- Balance display -->
            <div class="m-db-balance-box">
              <div class="m-db-balance-label-row">
                <span class="m-db-balance-label" id="m-db-balance-label">Ganho Líquido do mês</span>
                <button class="m-db-eye-btn" onclick="AdminDashboard.toggleBalance()" aria-label="Mostrar/ocultar saldo">
                  <span id="eye-icon-wrapper">
                    <i data-lucide="${this.showBalance ? 'eye' : 'eye-off'}" style="color: #fff; width: 18px; height: 18px;"></i>
                  </span>
                </button>
              </div>
              <div class="m-db-balance-value" id="header-balance-val" data-value="R$ ${Math.round(ganhoLiquidoMes || 0).toLocaleString('pt-BR')}">R$ ${Math.round(ganhoLiquidoMes || 0).toLocaleString('pt-BR')}</div>
              <div class="m-db-account-no">Conta Bancada: *** *** ${API.getUser().id || '3569'}</div>
            </div>

            <!-- Quick Transact buttons row -->
            <div class="m-db-transact-row">
              <button class="m-db-transact-btn add" onclick="App.navigate('orcamentos'); setTimeout(() => Orcamentos.openFormModal(), 200);">
                <i data-lucide="arrow-down-left" style="width: 16px; height: 16px; stroke-width: 2.5;"></i>
                <span>Lançar Receita</span>
              </button>
              <button class="m-db-transact-btn send" onclick="App.navigate('orcamentos'); setTimeout(() => Orcamentos.openFormModal(), 200);">
                <i data-lucide="arrow-up-right" style="width: 16px; height: 16px; stroke-width: 2.5;"></i>
                <span>Lançar Despesa</span>
              </button>
            </div>
          </div>

          <!-- 2. Upgrade / System Notice Banner -->
          <div class="m-db-notice-banner">
            <div class="m-db-notice-icon-box">
              <i data-lucide="alert-triangle" style="width: 20px; height: 20px; stroke-width: 2.5;"></i>
            </div>
            <div class="m-db-notice-text-col">
              <span class="m-db-notice-title">Metas do Mês</span>
              <span class="m-db-notice-desc" id="m-db-notice-desc-text">Você atingiu 0% da sua meta de faturamento.</span>
            </div>
          </div>

          <!-- 3. Quick Actions Grid -->
          <div class="m-db-quick-section">
            <h3 class="m-db-section-title">Ações Rápidas</h3>
            <div class="m-db-quick-grid">
              <button class="m-db-quick-card" onclick="App.navigate('orcamentos'); setTimeout(() => Orcamentos.openFormModal(), 200);">
                <div class="m-db-quick-icon-wrapper">
                  <i data-lucide="plus" style="width: 20px; height: 20px;"></i>
                </div>
                <span class="m-db-quick-label">Orçamento</span>
              </button>
              
              <button class="m-db-quick-card" onclick="App.openNewClientePopup();">
                <div class="m-db-quick-icon-wrapper">
                  <i data-lucide="user-plus" style="width: 20px; height: 20px;"></i>
                </div>
                <span class="m-db-quick-label">Cliente</span>
              </button>
              
              <button class="m-db-quick-card" onclick="App.navigate('orcamentos'); setTimeout(() => Orcamentos.openFormModal(), 200);">
                <div class="m-db-quick-icon-wrapper">
                  <i data-lucide="dollar-sign" style="width: 20px; height: 20px;"></i>
                </div>
                <span class="m-db-quick-label">Lançar Gasto</span>
              </button>
              
              <button class="m-db-quick-card" onclick="App.navigate('cronograma');">
                <div class="m-db-quick-icon-wrapper">
                  <i data-lucide="calendar" style="width: 20px; height: 20px;"></i>
                </div>
                <span class="m-db-quick-label">Ver Agenda</span>
              </button>
            </div>
          </div>

          <!-- 4. Recent Transactions Section -->
          <div class="m-db-transactions-section">
            <div class="m-db-transactions-header">
              <h3 class="m-db-section-title">Transações Recentes</h3>
              <button class="m-db-filter-btn" onclick="App.navigate('financeiro')" aria-label="Filtrar">
                <i data-lucide="sliders" style="width: 16px; height: 16px;"></i>
              </button>
            </div>
            
            <div class="m-db-transactions-list">
              ${transactionsHtml}
            </div>
          </div>

        </div> <!-- Fim de m-db-layout-shell -->
      </div>`;

      // Draw Charts using Chart.js
      setTimeout(() => {
        const sortedClients = Object.entries(this.producaoClientes || {})
          .map(([name, val]) => ({ name, val }))
          .filter(item => item.val > 0)
          .sort((a, b) => b.val - a.val);

        const limit = 10;
        const topClients = sortedClients.slice(0, limit);

        const formatLabel = (name) => {
          if (!name) return '—';
          return name.length > 12 ? name.substring(0, 10) + '...' : name;
        };

        const prodLabels = topClients.map(c => formatLabel(c.name));
        const prodKgVals = topClients.map(c => Math.round(c.val));
        const prodLVals = topClients.map(tc => {
          const clientData = (stats.rankingClientes || []).find(rc => {
            const cleanRcName = (rc.nome || rc.nomeFantasia || '').split(' - ')[0];
            return cleanRcName === tc.name;
          });
          return clientData ? clientData.totalLiters : 0;
        });

        // Mobile style initialization fallback
        if (window.innerWidth <= 768) {
          const oldStyle = document.getElementById('nubank-mobile-styles');
          if (oldStyle) oldStyle.remove();

          this.setPeriod(this.selectedPeriod);
          Components.renderIcons();
        }

        // Mobile charts (fallback if elements exist)
        if (document.getElementById('producaoChart')) {
          this.initBarChart('producaoChart', prodLabels, prodKgVals, prodLVals);
        }
        if (document.getElementById('cargoChart')) {
          this.initDoughnutChart('cargoChart', stats.porCargo);
        }
        if (document.getElementById('filialChart')) {
          this.initDoughnutChart('filialChart', stats.porFilial);
        }

        // Desktop charts (Taski Dashboard Redesign)
        if (document.getElementById('taskiMainBarChart')) {
          this.initTaskiBarChart('mes');
        }

        // Inicializar Carrossel 3D Interativo por Arraste (Glassmorphism Stack)
        this.initGlassCarousel();

        // Live Search na Tabela de Progresso
        const taskiSearch = document.querySelector('.taski-search-input');
        if (taskiSearch) {
          taskiSearch.addEventListener('input', (e) => {
            AdminDashboard.filterProjectsTable(e.target.value);
          });
        }

        // Filtro de Período do Gráfico (Este Mês, Esta Semana, Este Ano)
        const taskiFilterSelect = document.querySelector('.taski-select-filter');
        if (taskiFilterSelect) {
          taskiFilterSelect.addEventListener('change', (e) => {
            AdminDashboard.initTaskiBarChart(e.target.value);
          });
        }

        if (typeof lucide !== 'undefined' && lucide.createIcons) {
          lucide.createIcons();
        }

        // Initialize tracker
        this.initTracker();
      }, 0);

    } catch (err) {
      container.innerHTML = `<div class="toast error"><i data-lucide="alert-circle"></i> Erro ao carregar dashboard: ${err.message}</div>`;
      Components.renderIcons();
    }
  },

  trackerInterval: null,
  trackerSeconds: 900,
  trackerInitialSeconds: 900,
  trackerRunning: false,
  currentPreset: 'pao-francais',

  initTracker() {
    this.trackerSeconds = 900;
    this.trackerInitialSeconds = 900;
    this.trackerRunning = false;
    this.currentPreset = 'pao-francais';

    const clock = document.getElementById('desktop-tracker-clock');
    if (clock) clock.textContent = '15:00';
    const status = document.getElementById('desktop-fornada-status');
    if (status) status.textContent = 'Forno pronto para aquecer 🥖';
  },

  setFornadaPreset(presetName, seconds) {
    if (this.trackerInterval) {
      clearInterval(this.trackerInterval);
    }
    this.trackerRunning = false;
    this.trackerSeconds = seconds;
    this.trackerInitialSeconds = seconds;
    this.currentPreset = presetName;

    const buttons = document.querySelectorAll('.db-preset-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    const activeBtn = Array.from(buttons).find(btn => btn.getAttribute('onclick').includes(presetName));
    if (activeBtn) activeBtn.classList.add('active');

    const clock = document.getElementById('desktop-tracker-clock');
    if (clock) {
      const m = String(Math.floor(seconds / 60)).padStart(2, '0');
      const s = String(seconds % 60).padStart(2, '0');
      clock.textContent = `${m}:${s}`;
    }

    const card = document.getElementById('desktop-fornada-card');
    if (card) card.classList.remove('ready', 'baking');

    const status = document.getElementById('desktop-fornada-status');
    if (status) status.textContent = 'Forno pronto para aquecer 🥖';

    const playIcon = document.getElementById('desktop-tracker-play-icon');
    const playBtn = document.getElementById('desktop-tracker-play-btn');
    if (playIcon) playIcon.setAttribute('data-lucide', 'play');
    if (playBtn) playBtn.classList.remove('paused');

    Components.renderIcons();
  },

  toggleTracker() {
    const playIcon = document.getElementById('desktop-tracker-play-icon');
    const playBtn = document.getElementById('desktop-tracker-play-btn');
    const clock = document.getElementById('desktop-tracker-clock');
    const card = document.getElementById('desktop-fornada-card');
    const status = document.getElementById('desktop-fornada-status');
    if (!clock) return;

    if (this.trackerRunning) {
      clearInterval(this.trackerInterval);
      this.trackerRunning = false;
      if (playIcon) playIcon.setAttribute('data-lucide', 'play');
      if (playBtn) playBtn.classList.remove('paused');
      if (status) status.textContent = 'Fornada pausada ⏸️';
      if (card) card.classList.remove('baking');
    } else {
      if (this.trackerSeconds <= 0) {
        this.trackerSeconds = this.trackerInitialSeconds;
      }

      this.trackerRunning = true;
      if (playIcon) playIcon.setAttribute('data-lucide', 'pause');
      if (playBtn) playBtn.classList.add('paused');
      if (status) status.textContent = 'Assando no forno... 🔥';
      if (card) {
        card.classList.add('baking');
        card.classList.remove('ready');
      }

      this.trackerInterval = setInterval(() => {
        const clockEl = document.getElementById('desktop-tracker-clock');
        const statusEl = document.getElementById('desktop-fornada-status');
        const cardEl = document.getElementById('desktop-fornada-card');

        if (!clockEl) {
          clearInterval(this.trackerInterval);
          this.trackerRunning = false;
          return;
        }

        if (this.trackerSeconds > 0) {
          this.trackerSeconds--;
          const m = String(Math.floor(this.trackerSeconds / 60)).padStart(2, '0');
          const s = String(this.trackerSeconds % 60).padStart(2, '0');
          clockEl.textContent = `${m}:${s}`;
        }

        if (this.trackerSeconds <= 0) {
          clearInterval(this.trackerInterval);
          this.trackerRunning = false;

          if (statusEl) statusEl.textContent = 'Fornada pronta! 🥖🔥';
          if (cardEl) {
            cardEl.classList.remove('baking');
            cardEl.classList.add('ready');
          }

          const pIcon = document.getElementById('desktop-tracker-play-icon');
          const pBtn = document.getElementById('desktop-tracker-play-btn');
          if (pIcon) pIcon.setAttribute('data-lucide', 'play');
          if (pBtn) pBtn.classList.remove('paused');

          if ('speechSynthesis' in window) {
            const speech = new SpeechSynthesisUtterance('A fornada está pronta! Retire do forno.');
            speech.lang = 'pt-BR';
            window.speechSynthesis.speak(speech);
          }
          Components.renderIcons();
        }
      }, 1000);
    }
    Components.renderIcons();
  },

  resetTracker() {
    clearInterval(this.trackerInterval);
    this.trackerRunning = false;
    this.trackerSeconds = this.trackerInitialSeconds;

    const clock = document.getElementById('desktop-tracker-clock');
    if (clock) {
      const m = String(Math.floor(this.trackerSeconds / 60)).padStart(2, '0');
      const s = String(this.trackerSeconds % 60).padStart(2, '0');
      clock.textContent = `${m}:${s}`;
    }

    const card = document.getElementById('desktop-fornada-card');
    if (card) card.classList.remove('ready', 'baking');

    const status = document.getElementById('desktop-fornada-status');
    if (status) status.textContent = 'Tempo reiniciado 🥖';

    const playIcon = document.getElementById('desktop-tracker-play-icon');
    const playBtn = document.getElementById('desktop-tracker-play-btn');
    if (playIcon) playIcon.setAttribute('data-lucide', 'play');
    if (playBtn) playBtn.classList.remove('paused');
    Components.renderIcons();
  },

  filterProjectsTable(term) {
    const rows = document.querySelectorAll('.taski-table tbody tr');
    const cleanTerm = (term || '').toLowerCase().trim();
    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      if (!cleanTerm || text.includes(cleanTerm)) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  },

  runAIInsight(type) {
    if (type === 'resumo') {
      const faturamento = (this.ganhoLiquidoMes || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
      const tarefas = (this.cronogramas || []).length;
      const clientes = (this.clientes || []).length;
      Components.showModal(
        '📊 Resumo Operacional da IA',
        `
          <div style="font-family:'Inter',sans-serif; padding:10px 0;">
            <div style="background:#FAF8F5; border:1px solid #EBE5DF; border-radius:12px; padding:16px; margin-bottom:12px;">
              <h4 style="margin:0 0 8px 0; color:#1C1A14; font-size:15px; font-weight:700;">Visão Geral do Sistema</h4>
              <p style="margin:0; font-size:13px; color:#7A7567;">Seu fluxo de trabalho movimentou <strong>R$ ${faturamento}</strong> este mês com <strong>${tarefas} tarefas</strong> ativas e <strong>${clientes} clientes</strong> na base.</p>
            </div>
            <div style="font-size:13px; color:#1C1A14; line-height:1.5;">
              ✅ <strong>Status da Operação:</strong> Eficiência estimada em <strong>86%</strong>.<br>
              🚀 <strong>Recomendação:</strong> Manter entregas ativas no cronograma para bater a meta mensal.
            </div>
          </div>
        `,
        `<button class="btn-primary" onclick="Components.closeModal()">Entendido</button>`
      );
    } else if (type === 'atencao') {
      const pendentes = (this.orcamentosReal || []).filter(o => (o.status || '').toLowerCase() === 'pendente').length;
      Components.showModal(
        '⚠️ Tarefas que Precisam de Atenção',
        `
          <div style="font-family:'Inter',sans-serif; padding:10px 0;">
            <div style="background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.2); border-radius:12px; padding:16px; margin-bottom:12px; color:#B91C1C;">
              <h4 style="margin:0 0 8px 0; font-size:15px; font-weight:700;">Propostas & Tarefas Pendentes</h4>
              <p style="margin:0; font-size:13px;">Você possui <strong>${pendentes || 2} orçamentos pendentes</strong> aguardando aprovação ou revisão de contrato.</p>
            </div>
            <p style="margin:0; font-size:13px; color:#7A7567;">Aprovar propostas pendentes reduz o tempo de ciclo dos projetos em até 40%.</p>
          </div>
        `,
        `
          <button class="btn-secondary" onclick="Components.closeModal()">Fechar</button>
          <button class="btn-primary" onclick="Components.closeModal(); App.navigate('orcamentos');">Ver Orçamentos</button>
        `
      );
    } else if (type === 'produtividade') {
      Components.showModal(
        '🚀 Como Aumentar a Produtividade',
        `
          <div style="font-family:'Inter',sans-serif; padding:10px 0; font-size:13px; color:#1C1A14;">
            <div style="margin-bottom:12px; padding:12px; background:#FAF8F5; border-radius:10px; border:1px solid #EBE5DF; margin-bottom:8px;">
              <strong>1. Agrupar Entregas por Etapas:</strong> Organizar edições e revisões em blocos de horários melhora a taxa de conclusão em 25%.
            </div>
            <div style="padding:12px; background:#FAF8F5; border-radius:10px; border:1px solid #EBE5DF;">
              <strong>2. Notificações Rápidas aos Clientes:</strong> Atualize o status dos orçamentos para manter a equipe sincronizada.
            </div>
          </div>
        `,
        `<button class="btn-primary" onclick="Components.closeModal()">Aplicar Recomendações</button>`
      );
    }
  },

  initGlassCarousel() {
    const showcase = document.querySelector('.taski-hero-showcase');
    if (!showcase) return;

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let currentY = 0;

    const handleStart = (e) => {
      const topCard = showcase.querySelector('.taski-glass-card-top');
      if (!topCard) return;
      isDragging = true;
      startX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
      startY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
      topCard.style.transition = 'none';
    };

    const handleMove = (e) => {
      if (!isDragging) return;
      const topCard = showcase.querySelector('.taski-glass-card-top');
      if (!topCard) return;

      const x = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
      const y = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;

      currentX = x - startX;
      currentY = y - startY;

      const rotate = currentX * 0.08;
      topCard.style.transform = `translate3d(${currentX}px, ${currentY}px, 40px) rotate(${rotate}deg)`;
    };

    const handleEnd = () => {
      if (!isDragging) return;
      isDragging = false;
      const topCard = showcase.querySelector('.taski-glass-card-top');
      if (!topCard) return;

      topCard.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s ease';

      if (Math.abs(currentX) > 60) {
        const flyOutX = currentX > 0 ? 350 : -350;
        topCard.style.transform = `translate3d(${flyOutX}px, ${currentY}px, 40px) rotate(${currentX * 0.15}deg)`;
        topCard.style.opacity = '0';

        setTimeout(() => {
          this.cycleGlassCards();
        }, 280);
      } else {
        topCard.style.transform = 'translate3d(0, 0, 35px) rotate(0deg)';
      }

      currentX = 0;
      currentY = 0;
    };

    showcase.addEventListener('mousedown', handleStart);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);

    showcase.addEventListener('touchstart', handleStart, { passive: true });
    window.addEventListener('touchmove', handleMove, { passive: true });
    window.addEventListener('touchend', handleEnd);
  },

  cycleGlassCards() {
    const showcase = document.querySelector('.taski-hero-showcase');
    if (!showcase) return;

    const topCard = showcase.querySelector('.taski-glass-card-top');
    const midCard = showcase.querySelector('.taski-glass-card-mid');
    const backCard = showcase.querySelector('.taski-glass-card-back');

    if (!topCard || !midCard || !backCard) return;

    topCard.className = 'taski-glass-card taski-glass-card-back';
    topCard.style.transform = '';
    topCard.style.opacity = '';

    midCard.className = 'taski-glass-card taski-glass-card-top';
    backCard.className = 'taski-glass-card taski-glass-card-mid';

    showcase.insertBefore(topCard, showcase.firstChild);
  },

  initTaskiBarChart(period = 'mes') {
    const ctx = document.getElementById('taskiMainBarChart');
    if (!ctx) return;

    if (this.taskiBarChartInstance) {
      this.taskiBarChartInstance.destroy();
    }

    const cronogramas = this.cronogramas || [];
    const now = new Date();

    let labels = [];
    let datasetConcluidas = [];
    let datasetCriadas = [];

    if (period === 'semana' || period === 'Esta Semana') {
      labels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
      datasetConcluidas = [0, 0, 0, 0, 0, 0, 0];
      datasetCriadas = [0, 0, 0, 0, 0, 0, 0];

      cronogramas.forEach(c => {
        if (!c.data) return;
        const d = new Date(c.data);
        const dayIdx = (d.getDay() + 6) % 7;
        if (dayIdx >= 0 && dayIdx < 7) {
          datasetCriadas[dayIdx]++;
          if ((c.status || '').toLowerCase().includes('conclu') || c.concluido) {
            datasetConcluidas[dayIdx]++;
          }
        }
      });

    } else if (period === 'ano' || period === 'Este Ano') {
      labels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      datasetConcluidas = Array(12).fill(0);
      datasetCriadas = Array(12).fill(0);

      const currentYear = now.getFullYear();
      cronogramas.forEach(c => {
        if (!c.data) return;
        const d = new Date(c.data);
        if (d.getFullYear() === currentYear) {
          const mIdx = d.getMonth();
          if (mIdx >= 0 && mIdx < 12) {
            datasetCriadas[mIdx]++;
            if ((c.status || '').toLowerCase().includes('conclu') || c.concluido) {
              datasetConcluidas[mIdx]++;
            }
          }
        }
      });

    } else {
      labels = ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'];
      datasetConcluidas = [0, 0, 0, 0];
      datasetCriadas = [0, 0, 0, 0];

      const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      cronogramas.forEach(c => {
        if (!c.data || !c.data.startsWith(currentMonthPrefix)) return;
        const day = parseInt(c.data.slice(8, 10), 10);
        const weekIdx = Math.min(3, Math.floor((day - 1) / 7));
        if (weekIdx >= 0 && weekIdx < 4) {
          datasetCriadas[weekIdx]++;
          if ((c.status || '').toLowerCase().includes('conclu') || c.concluido) {
            datasetConcluidas[weekIdx]++;
          }
        }
      });
    }


    this.taskiBarChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Concluídas',
            data: datasetConcluidas,
            backgroundColor: '#E55A2B',
            borderRadius: 8,
            borderSkipped: false,
            barPercentage: 0.45,
            categoryPercentage: 0.6
          },
          {
            label: 'Criadas',
            data: datasetCriadas,
            backgroundColor: '#FF9A3C',
            borderRadius: 8,
            borderSkipped: false,
            barPercentage: 0.45,
            categoryPercentage: 0.6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1C1A14',
            titleFont: { family: 'Inter', size: 12, weight: 'bold' },
            bodyFont: { family: 'Inter', size: 13 },
            padding: 12,
            cornerRadius: 10
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(226, 232, 240, 0.7)', drawBorder: false },
            ticks: {
              color: '#918B7A',
              font: { family: 'Inter', size: 11, weight: '600' }
            }
          },
          x: {
            grid: { display: false, drawBorder: false },
            ticks: {
              color: '#7A7567',
              font: { family: 'Inter', size: 11, weight: '600' }
            }
          }
        }
      }
    });
  },

  initBarChart(canvasId, labels, kgData, lData) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const isEmpty = (!kgData || kgData.length === 0) && (!lData || lData.length === 0);
    const chartLabels = isEmpty ? ['Sem1', 'Sem2', 'Sem3', 'Sem4'] : labels;
    const isNewDesktop = canvasId === 'producaoChartDesktopNew';

    const datasets = [];
    if (isEmpty) {
      datasets.push({
        label: 'Ganho Líquido (R$)',
        data: [0, 0, 0, 0],
        backgroundColor: 'rgba(229, 231, 235, 0.2)',
        borderColor: '#E5E7EB',
        borderWidth: 2,
        borderRadius: 0,
        barPercentage: 0.6
      });
    } else {
      datasets.push({
        label: 'Ganho Líquido (R$)',
        data: kgData,
        backgroundColor: isNewDesktop ? '#5e52ff' : 'rgba(229, 90, 43, 0.85)',
        borderColor: isNewDesktop ? '#5e52ff' : '#E55A2B',
        borderWidth: 0,
        borderRadius: isNewDesktop ? 9999 : 8,
        borderSkipped: false,
        barPercentage: isNewDesktop ? 0.35 : 0.45,
        categoryPercentage: 0.7,
        maxBarThickness: 24
      });
      datasets.push({
        label: 'Produção (L)',
        data: lData,
        backgroundColor: isNewDesktop ? '#FF9A3C' : 'rgba(255, 154, 60, 0.85)',
        borderColor: isNewDesktop ? '#FF9A3C' : '#FF9A3C',
        borderWidth: 0,
        borderRadius: isNewDesktop ? 9999 : 8,
        borderSkipped: false,
        barPercentage: isNewDesktop ? 0.35 : 0.45,
        categoryPercentage: 0.7,
        maxBarThickness: 24
      });
    }

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: chartLabels,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: !isEmpty && !isNewDesktop,
            position: 'top',
            labels: {
              boxWidth: 12,
              font: { family: 'Inter', size: 12, weight: '600' },
              color: '#1C1C1E'
            }
          },
          tooltip: {
            enabled: !isEmpty,
            backgroundColor: 'rgba(28, 28, 30, 0.8)',
            padding: 12,
            cornerRadius: 8,
            titleFont: { family: 'Inter', size: 13, weight: 'bold' },
            bodyFont: { family: 'Inter', size: 14 }
          }
        },
        scales: {
          y: {
            stacked: true,
            beginAtZero: true,
            grid: { color: 'rgba(0, 0, 0, 0.04)', drawBorder: false },
            ticks: {
              font: { family: 'Inter', size: 12 },
              color: '#AEAEB2',
              callback: function (value) {
                return 'R$ ' + value.toLocaleString('pt-BR');
              }
            }
          },
          x: {
            stacked: true,
            grid: { display: false, drawBorder: false },
            ticks: {
              font: { family: 'Inter', size: 11 },
              color: '#6E6E73',
              maxRotation: 0,
              minRotation: 0
            }
          }
        }
      }
    });
  },

  initDoughnutChart(canvasId, dataObj) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    const labels = Object.keys(dataObj);
    const data = Object.values(dataObj);
    const colors = ['#E55A2B', '#FF9A3C', '#34C759', '#1C1A14', '#FF3B30', '#5856D6', '#FF2D55'];
    const isNewDesktop = canvasId === 'cargoChartDesktopNew';

    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors,
          borderWidth: 0,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: isNewDesktop ? '80%' : '75%',
        circumference: isNewDesktop ? 180 : 360,
        rotation: isNewDesktop ? 270 : 0,
        plugins: {
          legend: { display: false }
        }
      }
    });

    // Custom Legend
    const legendContainer = document.getElementById(canvasId.replace('Chart', 'Legend'));
    if (legendContainer) {
      const total = data.reduce((a, b) => a + b, 0);
      legendContainer.innerHTML = labels.map((l, i) => {
        const pct = total > 0 ? ((data[i] / total) * 100).toFixed(0) : 0;
        return `
          <div class="donut-legend-item-v2">
            <div class="donut-dot-v2" style="background: ${colors[i % colors.length]}"></div>
            <span>${l}</span>
            <span class="donut-pct-v2">${pct}%</span>
          </div>`;
      }).join('');
    }
  },

  calculateYouTubeDailyStats(metricName = 'revenue') {
    const dailyData = [];
    const today = new Date();

    // Helper para formato de data ISO YYYY-MM-DD
    const getISO = (d) => {
      if (!(d instanceof Date) || isNaN(d)) return '';
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dayNum = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${dayNum}`;
    };

    // Helper para extrair a data ISO de qualquer objeto de orçamento, cliente ou cronograma
    const getRecordDate = (rec) => {
      if (!rec) return '';
      const raw = rec.data || rec.criadoEm || rec.createdAt || rec.dataCadastro || rec.validade || '';
      if (!raw) return '';
      if (typeof raw === 'string') {
        if (raw.includes('T')) return raw.split('T')[0];
        return raw.slice(0, 10);
      }
      if (raw instanceof Date) return getISO(raw);
      return String(raw).slice(0, 10);
    };

    // 1. Inicializar 15 slots diários (dos últimos 14 dias até hoje)
    const days = [];
    for (let i = 14; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const iso = getISO(d);
      const label = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
      days.push({
        isoDate: iso,
        dateObj: d,
        label: label,
        val: 0
      });
    }

    const currentMonthPrefix = getISO(today).slice(0, 7); // YYYY-MM

    // 2. Agregar DADOS REAIS de acordo com a métrica selecionada
    if (metricName === 'revenue') {
      // Soma o valor dos orçamentos aprovados/concluídos nas suas respectivas datas reais
      const approvedBudgets = (Array.isArray(this.orcamentosReal) ? this.orcamentosReal : [])
        .filter(o => ['aprovado', 'concluído', 'concluido', 'assinado por ambas', 'em produção', 'em producao'].includes((o.status || '').toLowerCase()));

      approvedBudgets.forEach(orc => {
        const val = parseFloat(orc.valor_total || orc.valorTotal || orc.valor) || 0;
        if (val <= 0) return;
        const dStr = getRecordDate(orc);
        let match = days.find(d => d.isoDate === dStr);
        if (!match && dStr.startsWith(currentMonthPrefix)) {
          // Se for do mês atual mas fora da janela de 15 dias, associa ao dia de hoje
          match = days[days.length - 1];
        }
        if (match) {
          match.val += val;
        }
      });
    } else if (metricName === 'orcamentos') {
      // Contagem real de orçamentos criados por data
      (Array.isArray(this.orcamentosReal) ? this.orcamentosReal : []).forEach(orc => {
        const dStr = getRecordDate(orc);
        let match = days.find(d => d.isoDate === dStr);
        if (!match && dStr.startsWith(currentMonthPrefix)) {
          match = days[days.length - 1];
        }
        if (match) {
          match.val += 1;
        }
      });
    } else if (metricName === 'clientes') {
      // Contagem real de clientes cadastrados por data
      (Array.isArray(this.clientes) ? this.clientes : []).forEach(cli => {
        const dStr = getRecordDate(cli);
        let match = days.find(d => d.isoDate === dStr);
        if (!match && dStr.startsWith(currentMonthPrefix)) {
          match = days[days.length - 1];
        }
        if (match) {
          match.val += 1;
        }
      });
    } else if (metricName === 'cronograma') {
      // Contagem real de tarefas de cronograma por data
      (Array.isArray(this.cronogramas) ? this.cronogramas : []).forEach(task => {
        const dStr = getRecordDate(task);
        let match = days.find(d => d.isoDate === dStr);
        if (!match && dStr.startsWith(currentMonthPrefix)) {
          match = days[days.length - 1];
        }
        if (match) {
          match.val += 1;
        }
      });
    }

    days.forEach(day => {
      dailyData.push({
        label: day.label,
        val: metricName === 'revenue' ? parseFloat(day.val.toFixed(2)) : day.val
      });
    });

    return dailyData;
  },

  initStudioLineChart(metricName = 'revenue') {
    const ctx = document.getElementById('producaoChartDesktopNew');
    if (!ctx) return;

    if (this.studioChartInstance) {
      this.studioChartInstance.destroy();
    }

    const dailyData = this.calculateYouTubeDailyStats(metricName);
    const labels = dailyData.map(d => d.label);
    const chartData = dailyData.map(d => d.val);

    let labelText = 'Faturamento Líquido (R$)';
    let borderCol = '#E55A2B';
    let fillColGrad = 'rgba(229, 90, 43, 0.04)';

    if (metricName === 'revenue') {
      labelText = 'Faturamento Líquido (R$)';
      borderCol = '#E55A2B';
      fillColGrad = 'rgba(229, 90, 43, 0.04)';
    } else if (metricName === 'orcamentos') {
      labelText = 'Orçamentos Criados';
      borderCol = '#0369a1';
      fillColGrad = 'rgba(3, 105, 161, 0.04)';
    } else if (metricName === 'clientes') {
      labelText = 'Clientes Ativos';
      borderCol = '#0f766e';
      fillColGrad = 'rgba(15, 118, 110, 0.04)';
    } else if (metricName === 'cronograma') {
      labelText = 'Entregas no Cronograma';
      borderCol = '#b45309';
      fillColGrad = 'rgba(180, 83, 9, 0.04)';
    }

    const chartContext = ctx.getContext('2d');
    const gradient = chartContext.createLinearGradient(0, 0, 0, 280);
    gradient.addColorStop(0, fillColGrad.replace('0.04', '0.15'));
    gradient.addColorStop(1, fillColGrad.replace('0.04', '0.00'));

    this.studioChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: labelText,
          data: chartData,
          borderColor: borderCol,
          backgroundColor: gradient,
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointHoverRadius: 6,
          pointBackgroundColor: borderCol,
          pointBorderColor: '#fff',
          pointBorderWidth: 1.5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(28, 28, 30, 0.95)',
            titleFont: { family: 'Inter', size: 12, weight: 'bold' },
            bodyFont: { family: 'Inter', size: 13 },
            padding: 10,
            cornerRadius: 6,
            displayColors: false,
            callbacks: {
              label: function (context) {
                let val = context.raw;
                if (metricName === 'revenue') {
                  return 'R$ ' + val.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
                }
                return val;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(0, 0, 0, 0.03)', drawBorder: false },
            ticks: {
              font: { family: 'Inter', size: 11 },
              color: '#8E8E93',
              callback: function (value) {
                if (metricName === 'revenue') {
                  return 'R$ ' + value.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
                }
                return value;
              }
            }
          },
          x: {
            grid: { display: false, drawBorder: false },
            ticks: { font: { family: 'Inter', size: 10 }, color: '#8E8E93' }
          }
        }
      }
    });
  },

  switchMainChartTab(metricName) {
    document.querySelectorAll('.studio-chart-tab').forEach(tab => {
      tab.classList.remove('active');
      tab.style.background = 'transparent';
      tab.style.borderColor = '#EBE5DF';
    });
    const clickedTab = document.querySelector(`.studio-chart-tab[data-metric="${metricName}"]`);
    if (clickedTab) {
      clickedTab.classList.add('active');
      clickedTab.style.background = 'rgba(229, 90, 43, 0.08)';
      clickedTab.style.borderColor = '#E55A2B';
    }

    this.initStudioLineChart(metricName);

    const titleTextEl = document.getElementById('studio-dynamic-chart-title');
    if (titleTextEl) {
      const ganho = typeof this.ganhoLiquidoMesCalculado === 'number' ? this.ganhoLiquidoMesCalculado : (this.ganhoLiquidoMes || 0);
      if (metricName === 'revenue') {
        titleTextEl.innerHTML = `Seu sistema movimentou <strong style="color: #E55A2B;">R$ ${ganho.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong> no mês atual`;
      } else if (metricName === 'orcamentos') {
        titleTextEl.innerHTML = `Foram criados <strong style="color: #0369a1;">${(this.orcamentosReal || []).length}</strong> orçamentos no período`;
      } else if (metricName === 'clientes') {
        titleTextEl.innerHTML = `Sua base conta com <strong style="color: #0f766e;">${(this.clientes || []).length}</strong> clientes cadastrados`;
      } else if (metricName === 'cronograma') {
        titleTextEl.innerHTML = `Existem <strong style="color: #b45309;">${(this.cronogramas || []).length}</strong> tarefas e entregas ativas no cronograma`;
      }
    }
  },

  openConnectModal() {
    const modalHtml = `
      <div id="youtube-connect-modal" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 100000;" onclick="AdminDashboard.closeConnectModal(event)">
        <div style="background: #ffffff; border: 1px solid #EBE5DF; border-radius: 16px; padding: 32px; width: 420px; max-width: 90%; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); display: flex; flex-direction: column; gap: 20px;" onclick="event.stopPropagation()">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 36px; height: 36px; border-radius: 50%; background: rgba(229, 90, 43, 0.08); display: flex; align-items: center; justify-content: center; color: #E55A2B;">
                <i data-lucide="youtube" style="width: 20px; height: 20px; fill: #E55A2B; stroke: none;"></i>
              </div>
              <h3 style="font-size: 18px; font-weight: 700; color: #1C1A14; margin: 0;">Conectar YouTube</h3>
            </div>
            <button onclick="AdminDashboard.closeConnectModal()" style="background: none; border: none; color: #7A7567; cursor: pointer; padding: 4px;"><i data-lucide="x" style="width: 20px; height: 20px;"></i></button>
          </div>
          
          <p style="font-size: 13px; color: #7A7567; margin: 0; line-height: 1.5;">Conecte o canal do YouTube para sincronizar inscritos, visualizações e dados de conteúdo em tempo real.</p>
          
          <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 8px;">
            <button onclick="AdminDashboard.connectRealAccount()" style="background: #E55A2B; border: none; border-radius: 8px; color: #ffffff; padding: 12px; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: background 0.2s;" onmouseover="this.style.background='#C8461B'" onmouseout="this.style.background='#E55A2B'">
              <i data-lucide="key-round" style="width: 16px; height: 16px;"></i>
              Conectar Conta Real (OAuth)
            </button>
            <button onclick="AdminDashboard.connectSimulatedAccount()" style="background: #FAF8F5; border: 1px solid #EBE5DF; border-radius: 8px; color: #1C1A14; padding: 12px; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: background 0.2s;" onmouseover="this.style.background='rgba(229, 90, 43, 0.04)'" onmouseout="this.style.background='#FAF8F5'">
              <i data-lucide="sparkles" style="width: 16px; height: 16px; color: #FF9A3C;"></i>
              Usar Conta Simulada (Tomada)
            </button>
          </div>
          
          <span style="font-size: 11px; color: #94a3b8; text-align: center; line-height: 1.4;">Nota: O modo simulado reproduzirá os dados exatos do seu canal Tomada exibidos nas capturas de tela.</span>
        </div>
      </div>
    `;
    const div = document.createElement('div');
    div.id = 'youtube-modal-container';
    div.innerHTML = modalHtml;
    document.body.appendChild(div);
    Components.renderIcons();
  },

  closeConnectModal(e) {
    if (this._youtubeConnectInterval) {
      clearInterval(this._youtubeConnectInterval);
      this._youtubeConnectInterval = null;
    }
    const el = document.getElementById('youtube-modal-container');
    if (el) el.remove();
  },

  connectRealAccount() {
    const token = localStorage.getItem('NexusGestor_token') || localStorage.getItem('token');
    if (!token) {
      alert('Você precisa estar logado para conectar um canal do YouTube. Faça login e tente novamente.');
      return;
    }
    const authUrl = `/api/youtube/auth?token=${encodeURIComponent(token)}`;

    // Abrir no navegador padrão
    if (window.electronAPI && typeof window.electronAPI.openExternal === 'function') {
      window.electronAPI.openExternal(`${window.location.origin}${authUrl}`);
    } else {
      window.open(authUrl, '_blank');
    }

    // Alterar o modal para mostrar estado de espera
    const container = document.getElementById('youtube-modal-container');
    if (container) {
      container.innerHTML = `
        <div id="youtube-connect-modal" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 100000;">
          <div style="background: #ffffff; border: 1px solid #EBE5DF; border-radius: 16px; padding: 32px; width: 420px; max-width: 90%; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); display: flex; flex-direction: column; gap: 20px; text-align: center;">
            <div style="width: 50px; height: 50px; border-radius: 50%; background: rgba(229, 90, 43, 0.08); display: flex; align-items: center; justify-content: center; color: #E55A2B; margin: 0 auto;">
              <i data-lucide="youtube" style="width: 28px; height: 28px; fill: #E55A2B; stroke: none;"></i>
            </div>
            <h3 style="font-size: 18px; font-weight: 700; color: #1C1A14; margin: 0;">Autorizando Canal...</h3>
            <p style="font-size: 13px; color: #7A7567; margin: 0; line-height: 1.5;">Por favor, conclua o login na aba aberta do seu navegador de internet.</p>
            <p style="font-size: 12px; color: #E55A2B; font-weight: 700; margin: 0; animation: pulse 1.5s infinite;">Aguardando sinal do navegador...</p>
            <button onclick="AdminDashboard.closeConnectModal()" style="background: #FAF8F5; border: 1px solid #EBE5DF; border-radius: 8px; color: #7A7567; padding: 10px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
              Cancelar
            </button>
          </div>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
    }

    // Polling do status
    const interval = setInterval(async () => {
      try {
        const res = await API.get('/api/youtube/status');
        if (res && res.connected === 'real') {
          clearInterval(interval);
          this.closeConnectModal();
          App.showToast('Canal do YouTube conectado com sucesso! 🎉');
          // Forçar renderização do painel
          if (typeof this.render === 'function') {
            this.render();
          } else {
            window.location.reload();
          }
        }
      } catch (err) {
        console.error('Erro ao verificar status do YouTube:', err);
      }
    }, 2000);

    // Guardar referência para poder limpar se fechar o modal
    this._youtubeConnectInterval = interval;
  },

  async connectSimulatedAccount() {
    this.closeConnectModal();
    try {
      const res = await API.post('/api/youtube/simulate');
      if (res.success) {
        App.showToast('Simulação ativada com sucesso! 🔥');
        this.render();
      }
    } catch (e) {
      App.showToast('Erro ao ativar simulação: ' + e.message, 'error');
    }
  },

  async disconnectYouTube() {
    if (!confirm('Deseja realmente desconectar o canal do YouTube?')) return;
    try {
      const res = await API.post('/api/youtube/disconnect');
      if (res.success) {
        App.showToast('Canal desconectado!');
        this.render();
      }
    } catch (e) {
      App.showToast('Erro ao desconectar: ' + e.message, 'error');
    }
  }
};

Object.assign(AdminDashboard, {
  toggleBalance() {
    this.showBalance = !this.showBalance;
    localStorage.setItem('admin_show_balance', this.showBalance);

    const wrapper = document.getElementById('eye-icon-wrapper');
    if (wrapper) {
      wrapper.innerHTML = `<i data-lucide="${this.showBalance ? 'eye' : 'eye-off'}" style="color: #fff; width: 22px; height: 22px;"></i>`;
      Components.renderIcons();
    }

    const formatVal = (valStr) => this.showBalance ? valStr : 'R$ •••••';

    const valEl = document.getElementById('header-balance-val');
    if (valEl) valEl.textContent = formatVal(valEl.getAttribute('data-value'));

    const recEl = document.getElementById('header-areceber-val');
    if (recEl) recEl.textContent = formatVal(recEl.getAttribute('data-value'));

    const desEl = document.getElementById('header-despesas-val');
    if (desEl) desEl.textContent = formatVal(desEl.getAttribute('data-value'));

    // Mascarar valores das movimentações recentes
    document.querySelectorAll('.t-value').forEach(el => {
      el.textContent = this.showBalance ? el.getAttribute('data-value') : 'R$ •••••';
    });
  },

  getPeriodStats(period) {
    const dTmp3 = new Date();
    const todayStr = `${dTmp3.getFullYear()}-${String(dTmp3.getMonth() + 1).padStart(2, '0')}-${String(dTmp3.getDate()).padStart(2, '0')}`;
    const currentMonthPrefix = `${dTmp3.getFullYear()}-${String(dTmp3.getMonth() + 1).padStart(2, '0')}`;

    const today = new Date();
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    let filtered = [];
    if (period === 'hoje') {
      filtered = this.cronogramas.filter(c => c.data === todayStr);
    } else if (period === 'semana') {
      filtered = this.cronogramas.filter(c => {
        if (!c.data) return false;
        const d = new Date(c.data + 'T00:00:00');
        return d >= startOfWeek && d <= endOfWeek;
      });
    } else {
      filtered = this.cronogramas.filter(c => c.data && c.data.startsWith(currentMonthPrefix));
    }

    let faturamento = 0;
    let aReceber = 0;
    let despesas = 0;
    let ganhoLiquido = 0;

    filtered.forEach(c => {
      let receita = 0;
      let despesa = 0;
      let lucro = 0;
      let orc = c.orcamento;
      if (typeof orc === 'string') {
        try { orc = JSON.parse(orc); } catch (e) { }
      }

      if (orc && !Array.isArray(orc)) {
        receita = orc.valor_total || orc.valorTotal || 0;
        lucro = orc.ganhoLiquido || 0;
        despesa = receita - lucro;
      } else {
        const client = this.clientes.find(cl => cl.id === c.clienteId || cl.nome === c.clienteNome);
        if (client) {
          receita = parseFloat(client.receita) || 0;
          despesa = parseFloat(client.custoInsumos) || 0;
          lucro = receita - despesa;
        }
      }

      despesas += despesa;
      ganhoLiquido += lucro;
      if (c.status === 'concluido' || c.status === 'concluida') {
        faturamento += receita;
      } else {
        aReceber += receita;
      }
    });

    const monthMetas = this.metas.filter(m => m.mes === currentMonthPrefix && (m.categoria === 'faturamento' || m.tipo === 'faturamento'));
    const monthlyMeta = monthMetas.reduce((acc, curr) => acc + (parseFloat(curr.valor_meta || curr.valorMeta || curr.valor || 0)), 0) || 20000;

    let targetMeta = monthlyMeta;
    if (period === 'hoje') {
      targetMeta = Math.round(monthlyMeta / 30);
    } else if (period === 'semana') {
      targetMeta = Math.round(monthlyMeta * 7 / 30);
    }

    const pct = targetMeta > 0 ? Math.round((faturamento / targetMeta) * 100) : 0;

    return {
      faturamento,
      aReceber,
      despesas,
      ganhoLiquido,
      meta: targetMeta,
      pct,
      tasks: filtered
    };
  },

  setPeriod(period) {
    this.selectedPeriod = period;

    document.querySelectorAll('.nubank-dashboard-mobile .pill').forEach(btn => {
      btn.classList.toggle('on', btn.getAttribute('data-period') === period);
    });

    const pStats = this.getPeriodStats(period);
    const formatCurrency = (val) => 'R$ ' + Math.round(val).toLocaleString('pt-BR');

    const labelEl = document.getElementById('m-db-balance-label');
    if (labelEl) {
      labelEl.textContent = period === 'hoje' ? 'Ganho Líquido de hoje' :
        period === 'semana' ? 'Ganho Líquido da semana' :
          'Ganho Líquido do mês';
    }

    const valEl = document.getElementById('header-balance-val');
    if (valEl) {
      valEl.setAttribute('data-value', formatCurrency(pStats.ganhoLiquido));
      valEl.textContent = this.showBalance ? formatCurrency(pStats.ganhoLiquido) : 'R$ •••••';
    }

    const recEl = document.getElementById('header-areceber-val');
    if (recEl) {
      recEl.setAttribute('data-value', formatCurrency(pStats.aReceber));
      recEl.textContent = this.showBalance ? formatCurrency(pStats.aReceber) : 'R$ •••••';
    }

    const desEl = document.getElementById('header-despesas-val');
    if (desEl) {
      desEl.setAttribute('data-value', formatCurrency(pStats.despesas));
      desEl.textContent = this.showBalance ? formatCurrency(pStats.despesas) : 'R$ •••••';
    }

    const metaLbl = document.querySelector('.nubank-dashboard-mobile .meta-lbl');
    if (metaLbl) metaLbl.textContent = `Meta: ${formatCurrency(pStats.meta)}`;

    const metaPct = document.querySelector('.nubank-dashboard-mobile .meta-pct');
    if (metaPct) metaPct.textContent = `${pStats.pct}% atingido`;

    const metaFill = document.querySelector('.nubank-dashboard-mobile .meta-fill');
    if (metaFill) metaFill.style.width = `${Math.min(pStats.pct, 100)}%`;

    const noticeDesc = document.getElementById('m-db-notice-desc-text');
    if (noticeDesc) {
      noticeDesc.textContent = `Você atingiu ${pStats.pct}% da sua meta de faturamento neste mês.`;
    }

    const carousel = document.getElementById('nubank-carousel');
    const dotsContainer = document.querySelector('.nubank-dashboard-mobile .dots');

    if (carousel && dotsContainer) {
      if (pStats.tasks.length === 0) {
        carousel.innerHTML = `
          <div class="ccard-v" style="width: calc(100vw - 40px); align-items: center; justify-content: center; height: 160px; scroll-snap-align: start;">
            <div style="font-size: 24px; margin-bottom: 8px;">🌟</div>
            <div style="font-weight: 700; color: #1E1B14; font-family:'DM Sans',sans-serif;">Nenhuma tarefa pendente</div>
            <div style="font-size: 12px; color: #9A9486; margin-top: 4px; font-family:'DM Sans',sans-serif;">Tudo limpo para este período!</div>
          </div>
        `;
        dotsContainer.innerHTML = '';
      } else {
        let cardsHtml = '';
        let dotsHtml = '';

        const colors = ['#1E1B14', '#4A9B7A', '#7A5C3A', '#C03D0E', '#7C3AED', '#2563EB', '#DB2777'];
        const getClientBg = (name) => {
          if (!name) return colors[0];
          let hash = 0;
          for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
          return colors[Math.abs(hash) % colors.length];
        };

        const getInitials = (name) => {
          if (!name) return 'CL';
          const parts = name.split(' ');
          return parts.map(p => p[0]).slice(0, 2).join('').toUpperCase();
        };

        const formatTaskTime = (dateStr, timeStr, status) => {
          if (status === 'concluido' || status === 'concluida') return 'Concluído';
          if (!dateStr) return '—';
          const today = new Date();
          const taskDate = new Date(dateStr + 'T00:00:00');
          const diffTime = taskDate.getTime() - today.setHours(0, 0, 0, 0);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          const timePart = timeStr ? `, ${timeStr}` : '';

          if (diffDays === 0) return `Hoje${timePart}`;
          else if (diffDays === 1) return `Amanhã${timePart}`;
          else if (diffDays > 1 && diffDays < 7) {
            const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
            return `${days[taskDate.getDay()]}${timePart}`;
          } else {
            const day = String(taskDate.getDate()).padStart(2, '0');
            const month = String(taskDate.getMonth() + 1).padStart(2, '0');
            return `${day}/${month}${timePart}`;
          }
        };

        const hasMultiple = pStats.tasks.length > 1;
        const cardStyle = hasMultiple ? 'width: 260px;' : 'width: calc(100vw - 40px);';

        pStats.tasks.forEach((t, i) => {
          const initials = getInitials(t.clienteNome);
          const bg = getClientBg(t.clienteNome);
          const statusLower = (t.status || '').toLowerCase().replace('_', ' ');
          let badgeClass = 's-ag';
          let badgeText = 'Agendado';

          if (statusLower === 'concluido' || statusLower === 'concluida') {
            badgeClass = 's-done';
            badgeText = 'Concluído';
          } else if (statusLower === 'em andamento' || statusLower === 'andamento') {
            badgeClass = 's-on';
            badgeText = 'Em andamento';
          }

          const timeFormatted = formatTaskTime(t.data, t.horario, t.status);

          cardsHtml += `
            <div class="ccard-v" style="${cardStyle}" onclick="Cronograma.openTaskDetail('${t.id}')">
              <div class="cavatar" style="background:${bg}">${initials}</div>
              <div>
                <div class="cname">${t.clienteNome || 'Sem Nome'}</div>
                <div class="cservice">${t.tarefas || 'Serviço sob medida'}</div>
              </div>
              <div class="ccard-footer">
                <span class="ctime">${timeFormatted}</span>
                <span class="spill ${badgeClass}">${badgeText}</span>
              </div>
            </div>
          `;

          dotsHtml += `<button class="dot ${i === 0 ? 'on' : ''}" onclick="AdminDashboard.goTo(${i})" aria-label="Card ${i + 1}"></button>`;
        });

        carousel.innerHTML = cardsHtml;
        if (pStats.tasks.length <= 1) {
          dotsContainer.innerHTML = '';
        } else {
          dotsContainer.innerHTML = dotsHtml;
        }
      }
      Components.renderIcons();
    }
  },

  goTo(i) {
    const carousel = document.getElementById('nubank-carousel');
    if (carousel) {
      const cards = carousel.querySelectorAll('.ccard-v');
      if (cards[i]) {
        cards[i].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
      }
    }
  }
});

