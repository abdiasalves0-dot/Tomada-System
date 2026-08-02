const { Produto } = require('../data/db-adapter');

// Campos válidos para serviços
const allowedFields = ['descricao', 'descricaoLonga', 'preco', 'ativo', 'categoria', 'adminId'];

exports.listProdutos = async (req, res) => {
  try {
    const adminId = req.user?.adminId || req.user?.id;
    const filter = adminId ? { adminId } : {};
    const servicos = await Produto.find(filter);
    const result = servicos.map(p => p.toObject ? p.toObject() : p);
    res.json(result);
  } catch (error) {
    console.error('Erro ao listar serviços:', error);
    res.status(500).json({ error: 'Erro ao listar serviços' });
  }
};

exports.createProduto = async (req, res) => {
  try {
    const novo = { ...req.body };
    novo.adminId = req.user?.adminId || req.user?.id;
    if (novo.ativo !== undefined) {
      novo.ativo = (novo.ativo === 'true' || novo.ativo === 'on' || novo.ativo === true || novo.ativo === '1');
    } else {
      novo.ativo = true;
    }
    if (novo.preco !== undefined) {
      novo.preco = parseFloat(novo.preco);
      if (isNaN(novo.preco)) novo.preco = 0;
    }
    for (const key of Object.keys(novo)) {
      if (typeof novo[key] === 'string' && novo[key].trim() === '') novo[key] = null;
    }
    const filteredData = {};
    allowedFields.forEach(field => { if (novo[field] !== undefined) filteredData[field] = novo[field]; });
    const servico = await Produto.create(filteredData);
    res.status(201).json(servico);
  } catch (error) {
    console.error('Erro ao criar serviço:', error);
    res.status(500).json({ error: 'Erro ao criar serviço' });
  }
};

exports.updateProduto = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (updateData.ativo !== undefined) {
      updateData.ativo = (updateData.ativo === 'true' || updateData.ativo === 'on' || updateData.ativo === true || updateData.ativo === '1');
    }
    if (updateData.preco !== undefined) {
      updateData.preco = parseFloat(updateData.preco);
      if (isNaN(updateData.preco)) updateData.preco = 0;
    }
    for (const key of Object.keys(updateData)) {
      if (typeof updateData[key] === 'string' && updateData[key].trim() === '') updateData[key] = null;
    }
    const filteredData = {};
    allowedFields.forEach(field => { if (updateData[field] !== undefined) filteredData[field] = updateData[field]; });
    const servico = await Produto.findByIdAndUpdate(req.params.id, filteredData, { new: true });
    if (!servico) return res.status(404).json({ error: 'Serviço não encontrado' });
    res.json(servico);
  } catch (e) {
    res.status(400).json({ error: 'ID inválido' });
  }
};

exports.deleteProduto = async (req, res) => {
  try {
    await Produto.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ error: 'ID inválido' });
  }
};
