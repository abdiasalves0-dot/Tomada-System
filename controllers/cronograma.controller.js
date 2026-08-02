const { Cronograma, Padeiro, Atividade, Avaliacao, Cliente, Produto } = require('../data/db-adapter');
const { PrismaClient } = require('@prisma/client');
const prismaDirecto = new PrismaClient();

function sanitizeUnicode(val) {
  if (typeof val === 'string') {
    if (typeof val.toWellFormed === 'function') return val.toWellFormed();
    return val.replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, '');
  }
  if (Array.isArray(val)) return val.map(sanitizeUnicode);
  if (val && typeof val === 'object') {
    const res = {};
    for (const k of Object.keys(val)) {
      res[k] = sanitizeUnicode(val[k]);
    }
    return res;
  }
  return val;
}

function parseChecklist(checklistData) {
  if (!checklistData) return null;
  if (typeof checklistData === 'string') {
    try {
      return JSON.parse(checklistData);
    } catch (e) {
      console.error('Erro ao fazer parse do checklist:', e);
      return null;
    }
  }
  return checklistData;
}

function syncTaskState(tarefa, updateData, concluidaListId, emAndamentoListId, pendenteListId) {
  const originalChecklist = parseChecklist(tarefa.checklist);
  let checklist = updateData.checklist !== undefined ? parseChecklist(updateData.checklist) : originalChecklist;
  const hasChecklist = Array.isArray(checklist) && checklist.length > 0;

  const oldListId = tarefa.kanbanListId;
  const newListId = updateData.kanbanListId !== undefined ? updateData.kanbanListId : oldListId;
  const listChanged = updateData.kanbanListId !== undefined && updateData.kanbanListId !== oldListId;

  const oldStatus = tarefa.status;
  const newStatus = updateData.status !== undefined ? updateData.status : oldStatus;
  const statusChanged = updateData.status !== undefined && updateData.status !== oldStatus;

  // Case A: Card dragged/moved to Concluída, or status set directly to 'concluida'
  if (
    (listChanged && newListId === concluidaListId) ||
    (statusChanged && newStatus === 'concluida')
  ) {
    updateData.status = 'concluida';
    updateData.kanbanListId = concluidaListId;
    updateData.progresso = 100;
    if (hasChecklist) {
      checklist = checklist.map(item => ({ ...item, done: true }));
      updateData.checklist = checklist;
    }
  }
  // Case B: Card dragged/moved out of Concluída, or status set to non-concluida when it was completed
  else if (
    (listChanged && oldListId === concluidaListId && newListId !== concluidaListId) ||
    (statusChanged && oldStatus === 'concluida' && newStatus !== 'concluida')
  ) {
    let targetStatus = 'em_andamento';
    if (newListId === pendenteListId || newStatus === 'pendente') {
      targetStatus = 'pendente';
    }
    updateData.status = targetStatus;
    
    if (newListId === concluidaListId || !newListId) {
      updateData.kanbanListId = (targetStatus === 'pendente' && pendenteListId) ? pendenteListId : emAndamentoListId;
    } else {
      updateData.kanbanListId = newListId;
    }

    if (hasChecklist) {
      const updatedChecklist = checklist.map(item => ({ ...item }));
      if (updatedChecklist.length > 0) {
        updatedChecklist[updatedChecklist.length - 1].done = false;
      }
      updateData.checklist = updatedChecklist;
      const doneCount = updatedChecklist.filter(c => c.done).length;
      updateData.progresso = Math.round((doneCount / updatedChecklist.length) * 100);
    } else {
      updateData.progresso = 0;
    }
  }
  // Case C: Checklist updated directly
  else if (updateData.checklist !== undefined) {
    if (hasChecklist) {
      const doneCount = checklist.filter(c => c.done).length;
      const total = checklist.length;
      const allDone = doneCount === total;
      
      const lastItemDone = checklist[total - 1] && checklist[total - 1].done === true;
      
      if (allDone || lastItemDone) {
        updateData.status = 'concluida';
        updateData.kanbanListId = concluidaListId;
        updateData.progresso = 100;
        checklist = checklist.map(item => ({ ...item, done: true }));
      } else {
        if (oldStatus === 'concluida' || oldListId === concluidaListId) {
          updateData.status = 'em_andamento';
          updateData.kanbanListId = emAndamentoListId || pendenteListId;
        }
        updateData.progresso = Math.round((doneCount / total) * 100);
      }
      updateData.checklist = checklist;
    }
  }
}


exports.listCronograma = async (req, res) => {
  const query = {};
  const adminId = req.user?.adminId || req.user?.id;
  if (adminId) {
    query.adminId = adminId;
  }
  if (req.query.data) {
    query.data = req.query.data;
  }
  if (req.query.padeiroId) {
    query.padeiroId = req.query.padeiroId;
  }
  if (req.query.semana) {
    const monday = new Date(req.query.semana);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const monStr = monday.toISOString().split('T')[0];
    const sunStr = sunday.toISOString().split('T')[0];
    query.data = { $gte: monStr, $lte: sunStr };
  }
  
  let tarefas = await Cronograma.find(query);

  // Filter by branch if user is a Regional Manager (not admin or superadmin)
  if (req.user.role !== 'admin' && req.user.role !== 'superadmin' && req.user.filial && req.user.filial !== 'null') {
    const filiais = Array.isArray(req.user.filial) ? req.user.filial : [req.user.filial];
    const padeirosDaFilial = await Padeiro.find({ filial: { $in: filiais } });
    const ids = padeirosDaFilial.map(p => p.id);
    tarefas = tarefas.filter(t => ids.includes(t.padeiroId));
  }

  res.json(tarefas);
};

exports.getWeeklyAgenda = async (req, res) => {
  const { filial, semana } = req.query;
  if (!semana) return res.status(400).json({ error: 'Data da semana obrigatória' });

  try {
    const filter = {};
    if (filial) {
      // Simplificando de RegExp para comparação direta para evitar erros de sintaxe SQL
      filter.filial = filial;
    }
    const padeiros = await Padeiro.find(filter).sort({ nome: 1 });

    const monday = new Date(semana);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const monStr = monday.toISOString().split('T')[0];
    const sunStr = sunday.toISOString().split('T')[0];

    const padeiroIds = padeiros.map(p => p.id);
    const agenda = await Cronograma.find({
      padeiroId: { $in: padeiroIds },
      data: { $gte: monStr, $lte: sunStr }
    }).sort({ data: 1 }); // Simplificando sort para evitar ambiguidade no mock

    res.json({ padeiros, agenda });
  } catch (error) {
    console.error('ERRO DETALHADO AGENDA:', error);
    res.status(500).json({ 
      error: 'Erro ao carregar agenda semanal', 
      details: error.message,
      stack: error.stack 
    });
  }
};

exports.createTarefa = async (req, res) => {
  try {
    // Only allow fields that exist in the cronogramas table
    const allowedFields = [
      'nome', 'padeiroId', 'padeiroNome', 'codTec', 'clienteId', 'clienteNome',
      'data', 'horario', 'turno', 'tarefas', 'status', 'kanbanListId', 'tempoMinimoMinutos', 'posicao',
      'observacao', 'criadoPor', 'criadoEm', 'atualizadoEm',
      'tags', 'progresso', 'checklist', 'orcamento', 'adminId'
    ];
    const nova = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) nova[key] = sanitizeUnicode(req.body[key]);
    }
    if (nova.nome && !nova.tarefas) nova.tarefas = nova.nome;
    if (nova.tarefas && !nova.nome) nova.nome = nova.tarefas;
    nova.criadoPor = req.user.id;
    nova.adminId = req.user.adminId || req.user.id;
    nova.criadoEm = new Date().toISOString();

    // Garantir tipos corretos para campos inteiros (Prisma exige Int, não String)
    if (nova.tempoMinimoMinutos !== undefined && nova.tempoMinimoMinutos !== null) {
      const parsed = parseInt(nova.tempoMinimoMinutos, 10);
      nova.tempoMinimoMinutos = isNaN(parsed) ? null : parsed;
    }
    if (nova.progresso !== undefined && nova.progresso !== null) {
      const parsed = parseInt(nova.progresso, 10);
      nova.progresso = isNaN(parsed) ? 0 : parsed;
    }
    if (nova.posicao !== undefined && nova.posicao !== null) {
      const parsed = parseInt(nova.posicao, 10);
      nova.posicao = isNaN(parsed) ? null : parsed;
    }

    // Sanitizar FKs opcionais para evitar violação de chave estrangeira com string vazia ""
    if (nova.padeiroId === '' || !nova.padeiroId) nova.padeiroId = null;
    if (nova.kanbanListId === '' || !nova.kanbanListId) nova.kanbanListId = null;
    if (nova.clienteId === '' || !nova.clienteId) nova.clienteId = null;

    const tarefa = await Cronograma.create(nova);
    res.status(201).json(tarefa);
  } catch (e) {
    console.error('Erro ao criar tarefa no cronograma:', e);
    res.status(500).json({ error: 'Erro ao criar tarefa: ' + e.message });
  }
};

exports.updateTarefa = async (req, res) => {
  try {
    // Only allow fields that exist in the cronogramas table
    const allowedFields = [
      'nome', 'padeiroId', 'padeiroNome', 'codTec', 'clienteId', 'clienteNome',
      'data', 'horario', 'turno', 'tarefas', 'status', 'kanbanListId', 'tempoMinimoMinutos', 'posicao',
      'observacao', 'criadoPor', 'criadoEm', 'atualizadoEm',
      'tags', 'progresso', 'checklist', 'orcamento'
    ];
    const updateData = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) updateData[key] = sanitizeUnicode(req.body[key]);
    }
    if (updateData.nome && !updateData.tarefas) updateData.tarefas = updateData.nome;
    if (updateData.tarefas && !updateData.nome) updateData.nome = updateData.tarefas;

    // Garantir tipos corretos para campos inteiros (Prisma exige Int, não String)
    if (updateData.tempoMinimoMinutos !== undefined && updateData.tempoMinimoMinutos !== null) {
      const parsed = parseInt(updateData.tempoMinimoMinutos, 10);
      updateData.tempoMinimoMinutos = isNaN(parsed) ? null : parsed;
    }
    if (updateData.progresso !== undefined && updateData.progresso !== null) {
      const parsed = parseInt(updateData.progresso, 10);
      updateData.progresso = isNaN(parsed) ? 0 : parsed;
    }
    if (updateData.posicao !== undefined && updateData.posicao !== null) {
      const parsed = parseInt(updateData.posicao, 10);
      updateData.posicao = isNaN(parsed) ? null : parsed;
    }

    // Sanitizar FKs opcionais
    if (updateData.padeiroId === '') updateData.padeiroId = null;
    if (updateData.kanbanListId === '') updateData.kanbanListId = null;
    if (updateData.clienteId === '') updateData.clienteId = null;

    const tarefa = await Cronograma.findById(req.params.id);
    if (!tarefa) return res.status(404).json({ error: 'Tarefa não encontrada' });

    let concluidaListId = null;
    let emAndamentoListId = null;
    let pendenteListId = null;
    try {
      const listas = await prismaDirecto.kanbanList.findMany({
        orderBy: { posicao: 'asc' }
      });
      const cList = listas.find(l => l.titulo.toLowerCase().includes('conclu'));
      const eList = listas.find(l => l.titulo.toLowerCase().includes('andamento'));
      const pList = listas.find(l => l.titulo.toLowerCase().includes('pendente'));
      if (cList) concluidaListId = cList.id;
      if (eList) emAndamentoListId = eList.id;
      if (pList) pendenteListId = pList.id;
    } catch (e) {
      console.warn('Não foi possível buscar as listas do Kanban:', e.message);
    }

    syncTaskState(tarefa, updateData, concluidaListId, emAndamentoListId, pendenteListId);

    const tarefaFinal = await Cronograma.findByIdAndUpdate(
      req.params.id,
      { ...updateData, atualizadoEm: new Date().toISOString() },
      { new: true }
    );

    res.json(tarefaFinal);
  } catch (e) {
    console.error("Erro ao atualizar cronograma:", e);
    res.status(400).json({ error: 'ID inválido ou erro na atualização' });
  }
};

exports.deleteAllTarefas = async (req, res) => {
  try {
    const activitiesToDelete = await Atividade.find({ cronogramaId: { $ne: null } });
    const activityIds = activitiesToDelete.map(a => a.id);

    await Cronograma.deleteMany({});
    await Atividade.deleteMany({ cronogramaId: { $ne: null } });

    if (activityIds.length > 0) {
      await Avaliacao.deleteMany({ atividadeId: { $in: activityIds } });
    }

    res.json({ success: true, message: 'Todo o cronograma foi excluído.' });
  } catch (e) {
    res.status(500).json({ error: 'Erro ao excluir cronograma' });
  }
};

exports.deleteTarefa = async (req, res) => {
  try {
    const id = req.params.id;
    const activitiesToDelete = await Atividade.find({ cronogramaId: id });
    const activityIds = activitiesToDelete.map(a => a.id);

    await Cronograma.findByIdAndDelete(id);
    await Atividade.deleteMany({ cronogramaId: id });

    if (activityIds.length > 0) {
      await Avaliacao.deleteMany({ atividadeId: { $in: activityIds } });
    }

    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ error: 'ID inválido' });
  }
};

exports.getPadeiroAgenda = async (req, res) => {
  if (req.user.role !== 'padeiro') {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  try {
    const agenda = await Cronograma.find({ padeiroId: req.user.id })
      .sort({ data: 1, horario: 1 });
    res.json(agenda);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar agenda' });
  }
};

exports.updateTarefaStatus = async (req, res) => {
  try {
    const { status, kanbanListId } = req.body;
    if (!status && !kanbanListId) return res.status(400).json({ error: 'Status ou kanbanListId é obrigatório' });
    
    const updateData = {};
    if (status) updateData.status = status;
    if (kanbanListId !== undefined) updateData.kanbanListId = kanbanListId;

    const tarefa = await Cronograma.findById(req.params.id);
    if (!tarefa) return res.status(404).json({ error: 'Tarefa não encontrada' });

    let concluidaListId = null;
    let emAndamentoListId = null;
    let pendenteListId = null;
    try {
      const listas = await prismaDirecto.kanbanList.findMany({
        orderBy: { posicao: 'asc' }
      });
      const cList = listas.find(l => l.titulo.toLowerCase().includes('conclu'));
      const eList = listas.find(l => l.titulo.toLowerCase().includes('andamento'));
      const pList = listas.find(l => l.titulo.toLowerCase().includes('pendente'));
      if (cList) concluidaListId = cList.id;
      if (eList) emAndamentoListId = eList.id;
      if (pList) pendenteListId = pList.id;
    } catch (e) {
      console.warn('Não foi possível buscar as listas do Kanban:', e.message);
    }

    syncTaskState(tarefa, updateData, concluidaListId, emAndamentoListId, pendenteListId);

    const tarefaFinal = await Cronograma.findByIdAndUpdate(
      req.params.id,
      { ...updateData, atualizadoEm: new Date().toISOString() },
      { new: true }
    );

    res.json(tarefaFinal);
  } catch (e) {
    console.error("Erro ao atualizar status do cronograma:", e);
    res.status(400).json({ error: 'ID inválido ou erro ao atualizar status' });
  }
};

exports.getPadeiroProgress = async (req, res) => {
  const { padeiroId, data } = req.query;
  if (!padeiroId || !data) {
    return res.status(400).json({ error: 'padeiroId e data são obrigatórios' });
  }
  try {
    const totalTasks = await Cronograma.countDocuments({ padeiroId, data });
    const completedTasks = await Cronograma.countDocuments({ padeiroId, data, status: 'concluida' });
    const percent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    res.json({ totalTasks, completedTasks, percent });
  } catch (error) {
    console.error('Erro ao buscar progresso:', error);
    res.status(500).json({ error: 'Erro ao carregar progresso' });
  }
};

exports.getGastosStats = async (req, res) => {
  try {
    const { mes } = req.query; // formato YYYY-MM
    
    // 1. Buscar todas as tarefas
    const cronogramas = await Cronograma.find({});
    
    // 2. Buscar todos os clientes
    const clientes = await Cliente.find({});

    // 3. Buscar todos os produtos para consultar preços dos insumos
    const produtos = await Produto.find({});

    let totalGastosMes = 0;
    let countGastosTasks = 0;

    // Filtrar por data se fornecido
    const filteredTasks = mes 
      ? cronogramas.filter(c => c.data && c.data.startsWith(mes))
      : cronogramas;

    filteredTasks.forEach(c => {
      let taskGastos = 0;
      let orc = c.orcamento;
      if (typeof orc === 'string') {
        try { orc = JSON.parse(orc); } catch (e) {}
      }

      if (orc) {
        // A. Se tiver itens detalhados no orçamento, somar quantidade * preço do produto
        const itens = Array.isArray(orc) ? orc : (orc.itens || []);
        let sumItens = 0;
        itens.forEach(item => {
          const prod = produtos.find(p => p.id === item.produtoId);
          if (prod) {
            const qty = parseFloat(item.quantidade) || 0;
            const price = parseFloat(prod.preco) || 0;
            sumItens += qty * price;
          }
        });

        if (sumItens > 0) {
          taskGastos = sumItens;
        } else if (!Array.isArray(orc)) {
          // B. Se a soma dos itens for 0, tentar usar a diferença valor_total - ganhoLiquido
          const valorTotal = orc.valor_total || orc.valorTotal || 0;
          const lucro = typeof orc.ganhoLiquido === 'number' ? orc.ganhoLiquido : 0;
          if (valorTotal > 0 && valorTotal > lucro) {
            taskGastos = valorTotal - lucro;
          }
        }
      }

      // C. Fallback para custoInsumos do cliente se ainda for 0
      if (taskGastos === 0 && Array.isArray(clientes)) {
        const client = clientes.find(cl => cl.id === c.clienteId || cl.nome === c.clienteNome);
        if (client) {
          taskGastos = parseFloat(client.custoInsumos) || 0;
        }
      }

      if (taskGastos > 0) {
        totalGastosMes += taskGastos;
        countGastosTasks++;
      }
    });

    let mediaGastosClientes = 0;
    if (countGastosTasks > 0) {
      mediaGastosClientes = totalGastosMes / countGastosTasks;
    } else if (Array.isArray(clientes) && clientes.length > 0) {
      const totalGastos = clientes.reduce((sum, c) => sum + (parseFloat(c.custoInsumos) || 0), 0);
      mediaGastosClientes = totalGastos / clientes.length;
    }

    res.json({
      totalGastosMes,
      countGastosTasks,
      mediaGastosClientes
    });
  } catch (error) {
    console.error('Erro ao calcular gastos:', error);
    res.status(500).json({ error: 'Erro ao calcular estatísticas de gastos', details: error.message });
  }
};
