const { Orcamento } = require('../data/db-adapter');

const allowedFields = [
  'codigo', 'clienteNome', 'clienteId', 'descricao', 'data',
  'validade', 'valor_total', 'status', 'observacoes', 'itens',
  'maoDeObra', 'descontoPct', 'incrementoPct',
  'marcenariaNome', 'marcenariaDocumento', 'marcenariaTelefone', 'marcenariaEmail',
  'condicoesPagamento', 'prazoEntrega', 'categoria', 'adminId'
];

exports.listOrcamentos = async (req, res) => {
  try {
    const adminId = req.user?.adminId || req.user?.id;
    const filter = adminId ? { adminId } : {};
    const orcamentos = await Orcamento.find(filter);
    // Return sorted by code descending or ascending (we will do code ascending for now, but descending can also be nice. Let's do ascending of codes or descending of date)
    const result = orcamentos.map(o => o.toObject ? o.toObject() : o);
    res.json(result);
  } catch (error) {
    console.error('Erro ao listar orçamentos:', error);
    res.status(500).json({ error: 'Erro interno ao listar orçamentos' });
  }
};

exports.createOrcamento = async (req, res) => {
  try {
    const data = { ...req.body };
    data.adminId = req.user?.adminId || req.user?.id;
    
    // Auto-generate code if not provided
    if (!data.codigo) {
      const year = new Date().getFullYear();
      const prefix = `ORC-${year}-`;
      const orcamentos = await Orcamento.find();
      let maxNum = 0;
      orcamentos.forEach(o => {
        if (o.codigo && o.codigo.startsWith(prefix)) {
          const numPart = o.codigo.replace(prefix, '');
          const num = parseInt(numPart, 10);
          if (!isNaN(num) && num > maxNum) {
            maxNum = num;
          }
        }
      });
      const nextNumStr = String(maxNum + 1).padStart(3, '0');
      data.codigo = `${prefix}${nextNumStr}`;
    }

    if (!data.data) {
      data.data = new Date().toISOString().split('T')[0];
    }

    // Convert numeric fields
    if (data.valor_total !== undefined) {
      data.valor_total = parseFloat(data.valor_total) || 0;
    }
    if (data.maoDeObra !== undefined) {
      data.maoDeObra = parseFloat(data.maoDeObra) || 0;
    }
    if (data.descontoPct !== undefined) {
      data.descontoPct = parseFloat(data.descontoPct) || 0;
    }
    if (data.incrementoPct !== undefined) {
      data.incrementoPct = parseFloat(data.incrementoPct) || 0;
    }

    // Filter fields
    const filtered = {};
    allowedFields.forEach(f => {
      if (data[f] !== undefined) {
        filtered[f] = data[f];
      }
    });

    const novo = await Orcamento.create(filtered);
    res.status(201).json(novo);
  } catch (error) {
    console.error('Erro ao criar orçamento:', error);
    res.status(500).json({ error: 'Erro ao criar orçamento', details: error.message });
  }
};

exports.updateOrcamento = async (req, res) => {
  try {
    const data = { ...req.body };

    // Convert numeric fields
    if (data.valor_total !== undefined) {
      data.valor_total = parseFloat(data.valor_total) || 0;
    }
    if (data.maoDeObra !== undefined) {
      data.maoDeObra = parseFloat(data.maoDeObra) || 0;
    }
    if (data.descontoPct !== undefined) {
      data.descontoPct = parseFloat(data.descontoPct) || 0;
    }
    if (data.incrementoPct !== undefined) {
      data.incrementoPct = parseFloat(data.incrementoPct) || 0;
    }

    // Filter fields
    const filtered = {};
    allowedFields.forEach(f => {
      if (data[f] !== undefined) {
        filtered[f] = data[f];
      }
    });

    const updated = await Orcamento.findByIdAndUpdate(req.params.id, filtered, { new: true });
    if (!updated) return res.status(404).json({ error: 'Orçamento não encontrado' });
    res.json(updated);
  } catch (error) {
    console.error('Erro ao atualizar orçamento:', error);
    res.status(500).json({ error: 'Erro ao atualizar orçamento', details: error.message });
  }
};

exports.deleteOrcamento = async (req, res) => {
  try {
    await Orcamento.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir orçamento:', error);
    res.status(500).json({ error: 'Erro ao excluir orçamento' });
  }
};
