const { Cliente, Atividade, Orcamento } = require('../data/db-adapter');

const allowedFields = [
  'codigo', 'nome', 'razaoSocial', 'nomeFantasia', 'cnpj',
  'inscricaoEstadual', 'email', 'telefone', 'celular', 'cep',
  'endereco', 'numero', 'bairro', 'cidade', 'estado', 'ativo',
  'receita', 'custoInsumos', 'adminId'
];

exports.listClientes = async (req, res) => {
  try {
    const adminId = req.user?.adminId || req.user?.id;
    const filter = adminId ? { adminId } : {};

    const [clientes, atividades, orcamentos] = await Promise.all([
      Cliente.find(filter),
      Atividade.find({
        ...filter,
        $or: [
          { notaCliente: { $gt: 0 } },
          { notaPadeiroCliente: { $gt: 0 } }
        ]
      }),
      Orcamento.find(filter)
    ]);

    const notesByClient = {};
    atividades.forEach(a => {
      const key = a.clienteId;
      if (!key) return;
      if (!notesByClient[key]) notesByClient[key] = [];
      const score = a.notaPadeiroCliente !== undefined && a.notaPadeiroCliente !== null ? a.notaPadeiroCliente : a.notaCliente;
      if (score) notesByClient[key].push(score);
    });

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

    const enrichedClientes = clientes.map(c => {
      const cJson = typeof c.toJSON === 'function' ? c.toJSON() : c;
      const notes = notesByClient[c.id] || [];
      const notaMedia = notes.length > 0 
        ? notes.reduce((sum, n) => sum + parseFloat(n), 0) / notes.length 
        : null;

      // Find budgets for this client
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

      return {
        ...cJson,
        notaMedia: notaMedia !== null ? Math.round(notaMedia * 10) / 10 : null,
        orcamentoDescricao: clientBudgets.join(', ') || null
      };
    });

    res.json(enrichedClientes);
  } catch (error) {
    console.error('Erro ao listar clientes:', error);
    res.status(500).json({ error: 'Erro interno ao listar clientes' });
  }
};

exports.createCliente = async (req, res) => {
  let filteredData = {};
  try {
    const novo = { ...req.body };
    if (novo.ativo !== undefined) {
      novo.ativo = (novo.ativo === 'true' || novo.ativo === 'on' || novo.ativo === true || novo.ativo === '1');
    } else {
      novo.ativo = true;
    }
    
    // Converter campos financeiros para Float
    if (novo.receita !== undefined && novo.receita !== null) {
      novo.receita = parseFloat(novo.receita) || 0;
    }
    if (novo.custoInsumos !== undefined && novo.custoInsumos !== null) {
      novo.custoInsumos = parseFloat(novo.custoInsumos) || 0;
    }
    
    // Convert empty strings to null
    for (const key of Object.keys(novo)) {
      if (typeof novo[key] === 'string' && novo[key].trim() === '') {
        novo[key] = null;
      }
    }

    // Gerar código CLI-XXXX sequencial automaticamente se não fornecido
    if (!novo.codigo) {
      const clientes = await Cliente.find();
      let maxNum = 1000;
      clientes.forEach(c => {
        if (c.codigo && c.codigo.startsWith('CLI-')) {
          const num = parseInt(c.codigo.substring(4), 10);
          if (!isNaN(num) && num > maxNum) {
            maxNum = num;
          }
        }
      });
      novo.codigo = `CLI-${maxNum + 1}`;
    }

    novo.adminId = req.user?.adminId || req.user?.id;

    // Filtrar apenas campos permitidos pelo Prisma
    const filteredData = {};
    allowedFields.forEach(field => {
      if (novo[field] !== undefined) {
        filteredData[field] = novo[field];
      }
    });

    const cliente = await Cliente.create(filteredData);
    res.status(201).json(cliente);
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    console.error('Erro detalhes:', { code: error.code, meta: error.meta, message: error.message });
    console.error('req.body:', JSON.stringify(req.body));
    console.error('Dados filtrados:', JSON.stringify(filteredData));
    res.status(500).json({ error: 'Erro ao criar cliente', details: error.message });
  }
};

exports.updateCliente = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (updateData.ativo !== undefined) {
      updateData.ativo = (updateData.ativo === 'true' || updateData.ativo === 'on' || updateData.ativo === true || updateData.ativo === '1');
    }
    
    // Converter campos financeiros para Float
    if (updateData.receita !== undefined && updateData.receita !== null) {
      updateData.receita = parseFloat(updateData.receita) || 0;
    }
    if (updateData.custoInsumos !== undefined && updateData.custoInsumos !== null) {
      updateData.custoInsumos = parseFloat(updateData.custoInsumos) || 0;
    }
    
    // Convert empty strings to null
    for (const key of Object.keys(updateData)) {
      if (typeof updateData[key] === 'string' && updateData[key].trim() === '') {
        updateData[key] = null;
      }
    }

    // Filtrar apenas campos permitidos pelo Prisma
    const filteredData = {};
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    });

    const cliente = await Cliente.findByIdAndUpdate(req.params.id, filteredData, { new: true });
    if (!cliente) return res.status(404).json({ error: 'Não encontrado' });
    res.json(cliente);
  } catch (e) {
    res.status(400).json({ error: 'ID inválido' });
  }
};

exports.deleteCliente = async (req, res) => {
  try {
    await Cliente.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ error: 'ID inválido' });
  }
};
