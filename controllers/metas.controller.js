const { Meta, Padeiro, Ferramenta, CategoriaFerramenta, Cronograma, Cliente } = require('../data/db-adapter');

exports.listMetas = async (req, res) => {
  const query = {};
  const adminId = req.user?.adminId || req.user?.id;
  if (adminId) query.adminId = adminId;
  if (req.user.role === 'padeiro') query.padeiroId = req.user.id;
  
  let metas = await Meta.find(query);

  // Filter by branch if user is a Regional Manager (not admin, superadmin or baker)
  if (req.user.role !== 'admin' && req.user.role !== 'superadmin' && req.user.role !== 'padeiro' && req.user.filial && req.user.filial !== 'null') {
    const filiais = Array.isArray(req.user.filial) ? req.user.filial : [req.user.filial];
    const padeirosDaFilial = await Padeiro.find({ filial: { $in: filiais } });
    const ids = padeirosDaFilial.map(p => p.id);
    metas = metas.filter(m => ids.includes(m.padeiroId));
  }

  res.json(metas);
};

exports.createMeta = async (req, res) => {
  try {
    const validColumns = ['id', 'padeiroId', 'tipo', 'nome', 'metaKg', 'realizado', 'periodo', 'observacao', 'criadoPor', 'criadoEm', 'atualizadoEm', 'adminId'];
    const nova = { criadoPor: req.user.id, adminId: req.user?.adminId || req.user?.id, criadoEm: new Date().toISOString() };
    
    validColumns.forEach(col => {
      if (req.body[col] !== undefined) {
        if (col === 'metaKg' || col === 'realizado') {
          nova[col] = parseFloat(req.body[col]) || 0;
        } else {
          nova[col] = req.body[col];
        }
      }
    });

    if (req.user.role === 'padeiro') {
      nova.padeiroId = req.user.id;
    }

    const meta = await Meta.create(nova);
    res.status(201).json(meta);
  } catch (error) {
    console.error('Erro ao criar meta:', error);
    res.status(500).json({ error: 'Erro ao criar meta', details: error.message });
  }
};

exports.updateMeta = async (req, res) => {
  try {
    const validColumns = ['id', 'padeiroId', 'tipo', 'nome', 'metaKg', 'realizado', 'periodo', 'observacao', 'criadoPor', 'criadoEm', 'atualizadoEm'];
    const updateData = { atualizadoEm: new Date().toISOString() };

    validColumns.forEach(col => {
      if (req.body[col] !== undefined) {
        if (col === 'metaKg' || col === 'realizado') {
          updateData[col] = parseFloat(req.body[col]) || 0;
        } else {
          updateData[col] = req.body[col];
        }
      }
    });

    if (req.user.role === 'padeiro') {
      updateData.padeiroId = req.user.id;
    }

    const meta = await Meta.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!meta) return res.status(404).json({ error: 'Não encontrado' });
    res.json(meta);
  } catch (e) {
    console.error('Erro ao atualizar meta:', e);
    res.status(400).json({ error: 'Erro ao atualizar meta', details: e.message });
  }
};

exports.resetAllMetas = async (req, res) => {
  try {
    await Meta.deleteMany({});
    res.json({ success: true, message: 'Todas as metas foram removidas.' });
  } catch (e) {
    res.status(500).json({ error: 'Erro ao resetar metas' });
  }
};

exports.deleteMeta = async (req, res) => {
  try {
    await Meta.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ error: 'ID inválido' });
  }
};

// --- NOVOS MÉTODOS PARA WISHLIST DE FERRAMENTAS ---

exports.listFerramentas = async (req, res) => {
  try {
    const list = await Ferramenta.find({});
    res.json(list);
  } catch (error) {
    console.error('Erro ao buscar ferramentas:', error);
    res.status(500).json({ error: 'Erro ao buscar ferramentas' });
  }
};

exports.createFerramenta = async (req, res) => {
  try {
    const { nome, preco } = req.body;
    if (!nome || !preco) {
      return res.status(400).json({ error: 'Nome e preço são obrigatórios' });
    }

    let catId = 1;
    const cat = await CategoriaFerramenta.findOne({ nome: 'Ferramentas Eletricas' });
    if (cat) catId = cat.id;

    const novaFerramenta = await Ferramenta.create({
      categoriaId: catId,
      nome,
      precoMedio: parseFloat(preco),
      precoMin: parseFloat(preco),
      precoMax: parseFloat(preco),
      tier: 'padrao',
      unidade: 'unidade'
    });
    res.status(201).json(novaFerramenta);
  } catch (error) {
    console.error('Erro ao criar ferramenta:', error);
    res.status(500).json({ error: 'Erro ao criar ferramenta', details: error.message });
  }
};

exports.addAporte = async (req, res) => {
  try {
    const { id } = req.params;
    const { valor } = req.body;
    const meta = await Meta.findById(id);
    if (!meta) {
      return res.status(404).json({ error: 'Meta não encontrada' });
    }

    const novoRealizado = (parseFloat(meta.realizado) || 0) + (parseFloat(valor) || 0);
    const updated = await Meta.findByIdAndUpdate(id, { realizado: novoRealizado }, { new: true });
    res.json(updated);
  } catch (error) {
    console.error('Erro ao adicionar aporte:', error);
    res.status(500).json({ error: 'Erro ao adicionar aporte', details: error.message });
  }
};

exports.getMetasProducao = async (req, res) => {
  try {
    const { mes } = req.query; // YYYY-MM
    if (!mes) return res.status(400).json({ error: 'Mês é obrigatório no formato YYYY-MM' });

    // 1. Fetch all tasks
    const cronogramas = await Cronograma.find({});

    // Filter by date starting with 'mes'
    const cronogramasDoMes = cronogramas.filter(c => c.data && c.data.startsWith(mes));

    // 2. Fetch all clients
    const clientes = await Cliente.find({});

    // 3. Calculate profit for each technician (padeiroId)
    const producao = {};
    
    // Initialize for all bakers
    const padeiros = await Padeiro.find({});
    padeiros.forEach(p => {
      producao[p.id] = 0;
    });

    cronogramasDoMes.forEach(c => {
      let lucro = 0;
      let orc = c.orcamento;
      if (typeof orc === 'string') {
        try { orc = JSON.parse(orc); } catch (e) {}
      }

      if (orc && !Array.isArray(orc) && typeof orc.ganhoLiquido === 'number') {
        lucro = orc.ganhoLiquido;
      } else {
        const client = clientes.find(cl => cl.id === c.clienteId || cl.nome === c.clienteNome);
        if (client) {
          const receita = parseFloat(client.receita) || 0;
          const custo = parseFloat(client.custoInsumos) || 0;
          lucro = receita - custo;
        }
      }

      if (c.padeiroId) {
        producao[c.padeiroId] = (producao[c.padeiroId] || 0) + lucro;
      }
    });

    res.json(producao);
  } catch (error) {
    console.error('Erro ao calcular produção de metas:', error);
    res.status(500).json({ error: 'Erro ao calcular produção de metas', details: error.message });
  }
};
