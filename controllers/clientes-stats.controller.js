const { Cliente, Cronograma, Atividade, Orcamento } = require('../data/db-adapter');

/**
 * Retorna a string ISO (YYYY-MM-DD) de uma Date no fuso local.
 */
function toLocalISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Retorna { inicio, fim } como strings YYYY-MM-DD para a semana (seg–dom)
 * que contém a data fornecida.
 */
function getWeekRange(date) {
  const dayOfWeek = date.getDay(); // 0=dom
  const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(date);
  monday.setDate(date.getDate() - diffToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { inicio: toLocalISO(monday), fim: toLocalISO(sunday) };
}

/**
 * GET /api/clientes/stats?periodo=diario|semanal|mensal
 * 
 * Retorna métricas agregadas sobre clientes, cronogramas e atividades
 * para alimentar o dashboard de Clientes.
 */
exports.getClientesStats = async (req, res) => {
  try {
    const periodo = req.query.periodo || 'diario';
    const mesFiltro = req.query.mes;
    const mesesNomes = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    
    const hoje = new Date();
    const hojeISO = toLocalISO(hoje);
    
    let mesAtual = hojeISO.slice(0, 7); // YYYY-MM
    if (mesFiltro && mesesNomes.includes(mesFiltro)) {
      const monthIdx = String(mesesNomes.indexOf(mesFiltro) + 1).padStart(2, '0');
      const year = hoje.getFullYear();
      mesAtual = `${year}-${monthIdx}`;
    }

    // Buscar dados em paralelo
    const [clientesDocs, cronogramasDocs, atividadesDocs, orcamentosDocs] = await Promise.all([
      Cliente.find(),
      Cronograma.find(),
      Atividade.find(),
      Orcamento.find()
    ]);

    const clientes = clientesDocs.map(d => typeof d.toJSON === 'function' ? d.toJSON() : d);
    const cronogramas = cronogramasDocs.map(d => typeof d.toJSON === 'function' ? d.toJSON() : d);
    const atividades = atividadesDocs.map(d => typeof d.toJSON === 'function' ? d.toJSON() : d);
    const orcamentos = orcamentosDocs.map(d => typeof d.toJSON === 'function' ? d.toJSON() : d);

    // Group budget descriptions by client
    const budgetsByClient = {};
    orcamentos.forEach(o => {
      const idKey = o.clienteId;
      const nameKey = o.clienteNome ? o.clienteNome.toLowerCase().trim() : '';
      
      if (idKey) {
        if (!budgetsByClient[idKey]) budgetsByClient[idKey] = [];
        if (o.descricao && !budgetsByClient[idKey].includes(o.descricao)) {
          budgetsByClient[idKey].push(o.descricao);
        }
      }
      if (nameKey) {
        if (!budgetsByClient[nameKey]) budgetsByClient[nameKey] = [];
        if (o.descricao && !budgetsByClient[nameKey].includes(o.descricao)) {
          budgetsByClient[nameKey].push(o.descricao);
        }
      }
    });

    clientes.forEach(c => {
      const clientBudgets = [];
      if (budgetsByClient[c.id]) {
        clientBudgets.push(...budgetsByClient[c.id]);
      }
      const clientNameKey = c.nome ? c.nome.toLowerCase().trim() : '';
      if (clientNameKey && budgetsByClient[clientNameKey]) {
        budgetsByClient[clientNameKey].forEach(desc => {
          if (!clientBudgets.includes(desc)) {
            clientBudgets.push(desc);
          }
        });
      }
      c.orcamentoDescricao = clientBudgets.join(', ') || null;
    });

    // ─── Filtrar cronogramas por período ────────────────────────────────
    let cronogramasFiltrados = [];
    let labelPeriodo = '';

    if (periodo === 'diario') {
      cronogramasFiltrados = cronogramas.filter(c => c && c.data === hojeISO);
      labelPeriodo = 'hoje';
    } else if (periodo === 'semanal') {
      const { inicio, fim } = getWeekRange(hoje);
      cronogramasFiltrados = cronogramas.filter(c => c && c.data && typeof c.data === 'string' && c.data >= inicio && c.data <= fim);
      labelPeriodo = 'esta semana';
    } else {
      // mensal
      cronogramasFiltrados = cronogramas.filter(c => c && c.data && typeof c.data === 'string' && c.data.startsWith(mesAtual));
      labelPeriodo = mesFiltro ? `mês de ${mesFiltro}` : 'este mês';
    }

    // ─── Status breakdown ──────────────────────────────────────────────
    const concluidos = cronogramasFiltrados.filter(c => c && (c.status === 'concluido' || c.status === 'concluida')).length;
    const pendentes = cronogramasFiltrados.filter(c => c && c.status === 'pendente').length;
    const emAndamento = cronogramasFiltrados.filter(c => c && c.status === 'em_andamento').length;
    const totalCronogramas = cronogramasFiltrados.length;
    const percentualConcluido = totalCronogramas > 0
      ? Math.round((concluidos / totalCronogramas) * 100)
      : 0;

    // ─── Clientes ativos (que têm ativo = true) ────────────────────────
    const clientesAtivos = clientes.filter(c => c && c.ativo !== false).length;
    const totalClientes = clientes.length;

    // ─── Dados financeiros dos clientes ────────────────────────────────
    const receitaTotal = clientes.reduce((s, c) => s + (c ? (parseFloat(c.receita) || 0) : 0), 0);
    const custoInsumosTotal = clientes.reduce((s, c) => s + (c ? (parseFloat(c.custoInsumos) || 0) : 0), 0);
    const lucroLiquido = receitaTotal - custoInsumosTotal;

    // ─── Clientes mais ativos (por quantidade de cronogramas no período) ─
    const cronogramasPorCliente = {};
    cronogramasFiltrados.forEach(c => {
      if (!c) return;
      const key = c.clienteId || c.clienteNome || 'Desconhecido';
      if (!cronogramasPorCliente[key]) {
        cronogramasPorCliente[key] = {
          id: c.clienteId,
          nome: c.clienteNome || 'Cliente sem nome',
          totalCronogramas: 0,
          concluidos: 0,
          pendentes: 0,
          emAndamento: 0,
          statusUltimo: c.status,
          checklistTotal: 0,
          checklistDone: 0
        };
      }
      cronogramasPorCliente[key].totalCronogramas++;
      if (c.status === 'concluido' || c.status === 'concluida') cronogramasPorCliente[key].concluidos++;
      if (c.status === 'pendente') cronogramasPorCliente[key].pendentes++;
      if (c.status === 'em_andamento') cronogramasPorCliente[key].emAndamento++;
      cronogramasPorCliente[key].statusUltimo = c.status;

      // Agregar progresso do checklist
      if (c.checklist && Array.isArray(c.checklist)) {
        cronogramasPorCliente[key].checklistTotal += c.checklist.length;
        cronogramasPorCliente[key].checklistDone += c.checklist.filter(item => item && item.done === true).length;
      }
    });

    const clientesMaisAtivos = Object.values(cronogramasPorCliente)
      .sort((a, b) => b.totalCronogramas - a.totalCronogramas)
      .slice(0, 5);

    // ─── Enriquecer com dados do cadastro de clientes ──────────────────
    clientesMaisAtivos.forEach(ca => {
      const clienteCadastro = clientes.find(c => c && c.id === ca.id);
      if (clienteCadastro) {
        ca.nome = clienteCadastro.nomeFantasia || clienteCadastro.nome || ca.nome;
        ca.cidade = clienteCadastro.cidade || '';
        ca.telefone = clienteCadastro.telefone || '';
        ca.receita = parseFloat(clienteCadastro.receita) || 0;
        ca.custoInsumos = parseFloat(clienteCadastro.custoInsumos) || 0;
        ca.orcamentoDescricao = clienteCadastro.orcamentoDescricao || null;
      }
    });

    // ─── Próximos agendamentos (cronogramas pendentes a partir de hoje) ─
    let baseCronogramas = cronogramas.filter(c => c && c.status === 'pendente');
    if (mesFiltro) {
      baseCronogramas = baseCronogramas.filter(c => {
        if (!c || !c.data || typeof c.data !== 'string') return false;
        const dateObj = new Date(c.data + 'T12:00:00');
        return mesesNomes[dateObj.getMonth()] === mesFiltro;
      });
    } else {
      baseCronogramas = baseCronogramas.filter(c => c && c.data && typeof c.data === 'string' && c.data >= hojeISO);
    }

    const proximosAgendamentos = baseCronogramas
      .sort((a, b) => String(a.data || '').localeCompare(String(b.data || '')))
      .slice(0, 5)
      .map(c => ({
        data: c.data,
        clienteId: c.clienteId,
        clienteNome: c.clienteNome || 'Cliente sem nome',
        padeiroNome: c.padeiroNome || '',
        horario: c.horario || '',
        turno: c.turno || '',
        status: c.status
      }));

    // ─── Atividades no período (para métricas de produção) ─────────────
    let atividadesFiltradas = [];
    if (periodo === 'diario') {
      atividadesFiltradas = atividades.filter(a => a && a.data === hojeISO);
    } else if (periodo === 'semanal') {
      const { inicio, fim } = getWeekRange(hoje);
      atividadesFiltradas = atividades.filter(a => a && a.data && typeof a.data === 'string' && a.data >= inicio && a.data <= fim);
    } else {
      atividadesFiltradas = atividades.filter(a => a && a.data && typeof a.data === 'string' && a.data.startsWith(mesAtual));
    }

    // Considera finalizadas E em_andamento com kgTotal para refletir produção real
    const atividadesComProducao = atividadesFiltradas.filter(a =>
      a && (a.status === 'finalizada' || a.status === 'em_andamento') && (a.kgTotal || 0) > 0
    );
    const totalAtividades = atividadesFiltradas.length;
    const totalFinalizadas = atividadesFiltradas.filter(a => a && a.status === 'finalizada').length;

    // ─── producaoTotal: soma de kgTotal das atividades (campo real) ────
    const producaoTotal = atividadesComProducao.reduce((s, a) => s + (a.kgTotal || 0), 0);

    // ─── Filtrar orçamentos por período e status para estatísticas de produção ───────────
    let orcamentosFiltrados = [];
    const statusValidos = ['Aprovado', 'Em produção', 'Concluído'];

    if (periodo === 'diario') {
      orcamentosFiltrados = orcamentos.filter(o => o && o.data === hojeISO && statusValidos.includes(o.status));
    } else if (periodo === 'semanal') {
      const { inicio, fim } = getWeekRange(hoje);
      orcamentosFiltrados = orcamentos.filter(o => o && o.data && typeof o.data === 'string' && o.data >= inicio && o.data <= fim && statusValidos.includes(o.status));
    } else {
      // mensal
      orcamentosFiltrados = orcamentos.filter(o => o && o.data && typeof o.data === 'string' && o.data.startsWith(mesAtual) && statusValidos.includes(o.status));
    }

    const producaoPorProduto = {};
    orcamentosFiltrados.forEach(o => {
      if (o && o.itens && Array.isArray(o.itens)) {
        o.itens.forEach(item => {
          if (item) {
            const nome = item.produtoNome || 'Produto';
            const qtd = parseFloat(item.quantidade) || 0;
            if (qtd > 0) {
              producaoPorProduto[nome] = (producaoPorProduto[nome] || 0) + qtd;
            }
          }
        });
      }
    });

    const producao = Object.entries(producaoPorProduto)
      .map(([nome, qtd]) => ({ nome, qtd }))
      .sort((a, b) => b.qtd - a.qtd)
      .slice(0, 4);

    while (producao.length < 4) {
      producao.push({ nome: '—', qtd: 0 });
    }

    // ─── chartData: dados financeiros por cliente ─────────────────────
    const chartDataFinanceiro = clientes
      .filter(c => c && c.ativo !== false && ((parseFloat(c.receita) || 0) > 0 || (parseFloat(c.custoInsumos) || 0) > 0))
      .sort((a, b) => (parseFloat(b.receita) || 0) - (parseFloat(a.receita) || 0))
      .slice(0, 7)
      .map(c => ({
        nome: String(c.nomeFantasia || c.nome || 'Cliente').split(' ').slice(0, 2).join(' '),
        receita: parseFloat(c.receita) || 0,
        custoInsumos: parseFloat(c.custoInsumos) || 0,
        lucro: (parseFloat(c.receita) || 0) - (parseFloat(c.custoInsumos) || 0)
      }));

    // ─── chartData semanal (mantém kg por dia para compatibilidade) ───
    const { inicio: semInicio, fim: semFim } = getWeekRange(hoje);
    const diasSemana = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(semInicio + 'T12:00:00');
      d.setDate(d.getDate() + i);
      diasSemana.push(toLocalISO(d));
    }
    const chartData = diasSemana.map(dia => {
      const atsDia = atividades.filter(a =>
        a &&
        a.data === dia &&
        (a.status === 'finalizada' || a.status === 'em_andamento') &&
        (a.kgTotal || 0) > 0
      );
      return {
        dia,
        kg: atsDia.reduce((s, a) => s + (a.kgTotal || 0), 0)
      };
    });

    // ─── Clientes recentes (últimos cadastrados) ───────────────────────
    const clientesRecentes = clientes
      .filter(c => c)
      .slice()
      .sort((a, b) => {
        const dA = a.criadoEm || a.id || '';
        const dB = b.criadoEm || b.id || '';
        return String(dB).localeCompare(String(dA));
      })
      .slice(0, 5)
      .map(c => ({
        id: c.id,
        nome: c.nomeFantasia || c.nome || 'Cliente sem nome',
        cidade: c.cidade || '',
        telefone: c.telefone || '',
        ativo: c.ativo,
        orcamentoDescricao: c.orcamentoDescricao || null
      }));

    res.json({
      periodo,
      labelPeriodo,
      // Totais
      totalClientes,
      clientesAtivos,
      // Financeiro
      receitaTotal,
      custoInsumosTotal,
      lucroLiquido,
      chartDataFinanceiro,
      // Cronogramas no período
      totalCronogramas,
      concluidos,
      pendentes,
      emAndamento,
      percentualConcluido,
      // Atividades no período
      totalAtividades,
      totalFinalizadas,
      producao,
      producaoTotal,
      chartData,
      // Rankings e listas
      clientesMaisAtivos,
      proximosAgendamentos,
      clientesRecentes
    });
  } catch (error) {
    console.error('Erro ao carregar stats de clientes:', error);

    // Tratar erro de banco de dados offline ou instável (Prisma P1001 ou similar) de forma graciosa
    const isDbError = error.code === 'P1001' || 
                      (error.message && (error.message.includes('Can\'t reach database') || error.message.includes('database server')));

    if (isDbError) {
      console.warn('[Offline Fallback] Servidor do banco de dados inacessível. Retornando dados padrão.');
      return res.json({
        periodo: req.query.periodo || 'diario',
        labelPeriodo: 'Modo Offline (Sem Conexão)',
        totalClientes: 0,
        clientesAtivos: 0,
        receitaTotal: 0,
        custoInsumosTotal: 0,
        lucroLiquido: 0,
        chartDataFinanceiro: [],
        totalCronogramas: 0,
        concluidos: 0,
        pendentes: 0,
        emAndamento: 0,
        percentualConcluido: 0,
        totalAtividades: 0,
        totalFinalizadas: 0,
        producao: {},
        producaoTotal: 0,
        chartData: [],
        clientesMaisAtivos: [],
        proximosAgendamentos: [],
        clientesRecentes: []
      });
    }

    res.status(500).json({ error: 'Erro ao carregar estatísticas de clientes', detail: error.message, stack: error.stack });
  }
};
