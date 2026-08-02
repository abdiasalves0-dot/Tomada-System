const { Orcamento, Contrato } = require('../data/db-adapter');

/**
 * Retorna string YYYY-MM-DD no fuso local
 */
function toLocalISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Formata valor para exibição compacta: 12500 => "12,5K"
 */
function fmtK(v) {
  v = parseFloat(v) || 0;
  if (Math.abs(v) >= 1_000_000) return (v / 1_000_000).toFixed(1).replace('.', ',') + 'M';
  if (Math.abs(v) >= 1_000) return (v / 1_000).toFixed(1).replace('.', ',') + 'K';
  return v.toFixed(0);
}

/**
 * GET /api/financeiro/stats?periodo=diario|semanal|mensal
 *
 * Agrega dados reais de orçamentos e contratos para alimentar
 * o painel financeiro.
 */
exports.getFinanceiroStats = async (req, res) => {
  try {
    const periodo = req.query.periodo || 'mensal';
    const hoje = new Date();
    const hojeISO = toLocalISO(hoje);
    const mesAtual = hojeISO.slice(0, 7); // YYYY-MM

    // ── Semana (seg-dom)
    const dow = hoje.getDay();
    const diffMon = dow === 0 ? 6 : dow - 1;
    const seg = new Date(hoje);
    seg.setDate(hoje.getDate() - diffMon);
    const semInicio = toLocalISO(seg);
    const semFim = toLocalISO(new Date(seg.getTime() + 6 * 86400000));

    // ── Ontem
    const ontem = new Date(hoje);
    ontem.setDate(ontem.getDate() - 1);
    const ontemISO = toLocalISO(ontem);

    // ── Buscar todos os dados em paralelo
    const [orcsDocs, contratosDocs] = await Promise.all([
      Orcamento.find(),
      Contrato.find()
    ]);

    const orcs = orcsDocs.map(o => (o.toObject ? o.toObject() : o));
    const contratos = contratosDocs.map(c => (c.toObject ? c.toObject() : c));

    // ── Helper para extração robusta de data (YYYY-MM-DD)
    const getOrcDateStr = (o) => {
      const raw = o.data || o.criadoEm || o.createdAt || o.validade || '';
      if (!raw) return '';
      if (typeof raw === 'string') {
        if (raw.includes('T')) return raw.split('T')[0];
        return raw.slice(0, 10);
      }
      if (raw instanceof Date) {
        return toLocalISO(raw);
      }
      return String(raw).slice(0, 10);
    };

    // ── Helpers de filtro por período
    const inPeriod = (dateStr) => {
      if (!dateStr) return false;
      if (periodo === 'diario')  return dateStr === hojeISO;
      if (periodo === 'semanal') return dateStr >= semInicio && dateStr <= semFim;
      if (periodo === 'geral')   return true;
      return dateStr.startsWith(mesAtual); // mensal
    };

    // ── Orçamentos do período filtrado
    const orcsPeriodo = orcs.filter(o => inPeriod(getOrcDateStr(o)));

    // ── Status case-insensitive helpers
    const STATUS_RECEITA_LOWER = [
      'aprovado',
      'em produção',
      'em producao',
      'concluído',
      'concluido',
      'assinado por ambas',
      'enviado para assinatura'
    ];

    const isStatusReceita = (status) => {
      if (!status) return false;
      return STATUS_RECEITA_LOWER.includes(String(status).trim().toLowerCase());
    };

    const isStatusPendente = (status) => {
      if (!status) return true;
      const s = String(status).trim().toLowerCase();
      return ['pendente', 'em análise', 'em analise', 'rascunho', 'enviado'].includes(s);
    };

    const isStatusRecusado = (status) => {
      if (!status) return false;
      const s = String(status).trim().toLowerCase();
      return ['recusado', 'rejeitado', 'cancelado'].includes(s);
    };

    const orcsAprovados    = orcsPeriodo.filter(o => isStatusReceita(o.status));
    const orcsEmAberto     = orcsPeriodo.filter(o => isStatusPendente(o.status));
    const orcsRejeitados   = orcsPeriodo.filter(o => isStatusRecusado(o.status));

    // Receita = soma dos aprovados/concluídos
    const receitaBruta  = orcsAprovados.reduce((s, o) => s + (parseFloat(o.valor_total) || 0), 0);
    // Custo = mão de obra dos aprovados
    const custoTotal    = orcsAprovados.reduce((s, o) => s + (parseFloat(o.maoDeObra) || 0), 0);
    const lucroBruto    = receitaBruta - custoTotal;
    const margemPct     = receitaBruta > 0 ? Math.round((lucroBruto / receitaBruta) * 100) : 0;

    // ── Período anterior para comparação
    const orcsMesAnterior = orcs.filter(o => {
      const dStr = getOrcDateStr(o);
      if (!dStr) return false;
      const mesAnt = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
      const mAnt = `${mesAnt.getFullYear()}-${String(mesAnt.getMonth() + 1).padStart(2, '0')}`;
      return dStr.startsWith(mAnt) && isStatusReceita(o.status);
    });
    const receitaMesAnterior = orcsMesAnterior.reduce((s, o) => s + (parseFloat(o.valor_total) || 0), 0);
    const variacaoReceita = receitaMesAnterior > 0
      ? Math.round(((receitaBruta - receitaMesAnterior) / receitaMesAnterior) * 100)
      : (receitaBruta > 0 ? 100 : 0);

    // ── Recebido no Período (diario/semanal/mensal/geral) e Variação comparativa
    let recebidoHoje = 0;
    let variacaoHoje = 0;

    if (periodo === 'diario') {
      const orcsHoje  = orcs.filter(o => getOrcDateStr(o) === hojeISO && isStatusReceita(o.status));
      const orcsOntem = orcs.filter(o => getOrcDateStr(o) === ontemISO && isStatusReceita(o.status));
      recebidoHoje = orcsHoje.reduce((s, o) => s + (parseFloat(o.valor_total) || 0), 0);
      const recebidoOntem = orcsOntem.reduce((s, o) => s + (parseFloat(o.valor_total) || 0), 0);
      variacaoHoje = recebidoOntem > 0
        ? Math.round(((recebidoHoje - recebidoOntem) / recebidoOntem) * 100)
        : (recebidoHoje > 0 ? 100 : 0);
    } else if (periodo === 'semanal') {
      const orcsSemana = orcs.filter(o => {
        const dStr = getOrcDateStr(o);
        return dStr >= semInicio && dStr <= semFim && isStatusReceita(o.status);
      });
      recebidoHoje = orcsSemana.reduce((s, o) => s + (parseFloat(o.valor_total) || 0), 0);

      const semAntInicioDate = new Date(seg);
      semAntInicioDate.setDate(semAntInicioDate.getDate() - 7);
      const semAntInicio = toLocalISO(semAntInicioDate);
      
      const semAntFimDate = new Date(seg);
      semAntFimDate.setDate(semAntFimDate.getDate() - 1);
      const semAntFim = toLocalISO(semAntFimDate);

      const orcsSemanaAnterior = orcs.filter(o => {
        const dStr = getOrcDateStr(o);
        return dStr >= semAntInicio && dStr <= semAntFim && isStatusReceita(o.status);
      });
      const recebidoSemanaAnterior = orcsSemanaAnterior.reduce((s, o) => s + (parseFloat(o.valor_total) || 0), 0);

      variacaoHoje = recebidoSemanaAnterior > 0
        ? Math.round(((recebidoHoje - recebidoSemanaAnterior) / recebidoSemanaAnterior) * 100)
        : (recebidoHoje > 0 ? 100 : 0);
    } else if (periodo === 'geral') {
      const orcsAprovadosTotal = orcs.filter(o => isStatusReceita(o.status));
      recebidoHoje = orcsAprovadosTotal.reduce((s, o) => s + (parseFloat(o.valor_total) || 0), 0);
      variacaoHoje = 100;
    } else {
      // mensal (Mês atual vs Mês anterior)
      const orcsMes = orcs.filter(o => {
        const dStr = getOrcDateStr(o);
        return dStr.startsWith(mesAtual) && isStatusReceita(o.status);
      });
      recebidoHoje = orcsMes.reduce((s, o) => s + (parseFloat(o.valor_total) || 0), 0);

      const mesAntDate = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
      const mesAntStr = `${mesAntDate.getFullYear()}-${String(mesAntDate.getMonth() + 1).padStart(2, '0')}`;
      const orcsMesAnterior = orcs.filter(o => {
        const dStr = getOrcDateStr(o);
        return dStr.startsWith(mesAntStr) && isStatusReceita(o.status);
      });
      const recebidoMesAnterior = orcsMesAnterior.reduce((s, o) => s + (parseFloat(o.valor_total) || 0), 0);

      variacaoHoje = recebidoMesAnterior > 0
        ? Math.round(((recebidoHoje - recebidoMesAnterior) / receitaMesAnterior) * 100)
        : (recebidoHoje > 0 ? 100 : 0);
    }

    // ── Contratos assinados (financeiramente fechados)
    const contratosAssinados = contratos.filter(c => c.status === 'Assinado por ambas');
    const valorContratado    = contratosAssinados.reduce((s, c) => s + (parseFloat(c.valor) || 0), 0);

    // ── Gráfico de barras: receita por mês (últimos 6 meses)
    const barChart = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      const mesStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const mesLabel = d.toLocaleDateString('pt-BR', { month: 'short' });
      const valor = orcs
        .filter(o => {
          const dStr = getOrcDateStr(o);
          return dStr.startsWith(mesStr) && isStatusReceita(o.status);
        })
        .reduce((s, o) => s + (parseFloat(o.valor_total) || 0), 0);
      barChart.push({ mes: mesStr, label: mesLabel, valor, valorFmt: fmtK(valor) });
    }

    // Altura relativa para o gráfico (0–100%)
    const maxBar = Math.max(...barChart.map(b => b.valor), 1);
    barChart.forEach(b => { b.height = Math.round((b.valor / maxBar) * 90) + 10; });

    // ── Gauge: lucro como % da receita (capacidade)
    const gaugePct = receitaBruta > 0 ? Math.min(Math.round((lucroBruto / receitaBruta) * 100), 100) : 0;

    // ── Breakdown por status dos orçamentos do período
    const statusBreakdown = {};
    orcsPeriodo.forEach(o => {
      const s = o.status || 'Pendente';
      statusBreakdown[s] = (statusBreakdown[s] || 0) + 1;
    });

    // ── Top clientes por receita
    const clienteMap = {};
    orcsAprovados.forEach(o => {
      const key = o.clienteId || o.clienteNome || 'Desconhecido';
      if (!clienteMap[key]) {
        clienteMap[key] = { nome: o.clienteNome || 'Cliente', valor: 0, qtd: 0 };
      }
      clienteMap[key].valor += parseFloat(o.valor_total) || 0;
      clienteMap[key].qtd++;
    });
    const topClientes = Object.values(clienteMap)
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 5)
      .map(c => ({ ...c, valorFmt: fmtK(c.valor) }));

    // ── Heatmap: distribuição semanal de orçamentos (últimas 3 semanas)
    const heatmapData = buildHeatmap(orcs);

    // ── Orçamentos recentes
    const orcamentosRecentes = orcs
      .sort((a, b) => getOrcDateStr(b).localeCompare(getOrcDateStr(a)))
      .slice(0, 8)
      .map(o => ({
        codigo: o.codigo,
        clienteNome: o.clienteNome || '—',
        valor: parseFloat(o.valor_total) || 0,
        valorFmt: fmtK(parseFloat(o.valor_total) || 0),
        status: o.status || 'Pendente',
        data: getOrcDateStr(o)
      }));

    res.json({
      periodo,
      // KPIs principais
      receitaBruta,
      receitaBrutaFmt: fmtK(receitaBruta),
      custoTotal,
      custoTotalFmt: fmtK(custoTotal),
      lucroBruto,
      lucroBrutoFmt: fmtK(lucroBruto),
      margemPct,
      variacaoReceita,
      // Hoje
      recebidoHoje,
      recebidoHojeFmt: fmtK(recebidoHoje),
      variacaoHoje,
      // Contratos
      totalContratos: contratos.length,
      contratosAssinados: contratosAssinados.length,
      valorContratado,
      valorContratadoFmt: fmtK(valorContratado),
      // Orçamentos
      totalOrcamentos: orcsPeriodo.length,
      orcsAprovados: orcsAprovados.length,
      orcsEmAberto: orcsEmAberto.length,
      orcsRejeitados: orcsRejeitados.length,
      // Gauge
      gaugePct,
      // Gráfico
      barChart,
      // Heatmap
      heatmapData,
      // Tabela
      topClientes,
      orcamentosRecentes,
      statusBreakdown
    });
  } catch (error) {
    console.error('Erro ao carregar stats financeiro:', error);
    res.status(500).json({ error: 'Erro ao carregar estatísticas financeiras' });
  }
};

function getOrCalculateCategory(o) {
  if (o.categoria) return o.categoria;
  const desc = (o.descricao || '').toLowerCase();
  if (desc.includes('cozinha') || desc.includes('banheiro') || desc.includes('gabinete') || desc.includes('copa')) return 'Cozinha';
  if (desc.includes('quarto') || desc.includes('guarda-roupa') || desc.includes('cama') || desc.includes('closet') || desc.includes('painel')) return 'Quarto';
  if (desc.includes('escritório') || desc.includes('mesa') || desc.includes('gôndola') || desc.includes('prateleira') || desc.includes('balcão') || desc.includes('comercial')) return 'Escritório';
  return 'Cozinha'; // fallback
}

/**
 * Monta matriz heatmap 3×7 (categorias × dias da semana) com contagem de orçamentos
 */
function buildHeatmap(orcs) {
  const hoje = new Date();
  const dow = hoje.getDay(); // 0 is Sunday, 6 is Saturday
  const dom = new Date(hoje);
  dom.setDate(hoje.getDate() - dow); // Sunday of current week

  const CATEGORIES = ['Cozinha', 'Quarto', 'Escritório'];
  const rows = [];

  CATEGORIES.forEach(category => {
    const row = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(dom);
      d.setDate(dom.getDate() + i);
      const iso = toLocalISO(d);
      const count = orcs.filter(o => o.data === iso && getOrCalculateCategory(o) === category).length;
      row.push({ date: iso, count });
    }
    rows.push(row);
  });

  // Descobrir máximo para normalização
  const maxCount = Math.max(...rows.flat().map(d => d.count), 1);
  rows.forEach(row => row.forEach(d => {
    d.intensity = d.count === 0 ? 0 : Math.ceil((d.count / maxCount) * 3); // 0, 1, 2, 3
  }));

  return rows;
}
