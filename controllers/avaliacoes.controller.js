const { Avaliacao, Padeiro } = require('../data/db-adapter');

exports.listAvaliacoes = async (req, res) => {
  try {
    const query = {};
    if (req.user.role === 'padeiro') query.padeiroId = req.user.id;
    if (req.query.padeiroId) query.padeiroId = req.query.padeiroId;
    if (req.query.clienteId) query.clienteId = req.query.clienteId;
    if (req.query.tipo) query.tipo = req.query.tipo;

    let avaliacoes = await Avaliacao.find(query);

    if (req.user.role !== 'admin' && req.user.role !== 'padeiro' && req.user.filial && req.user.filial !== 'null') {
      const filiais = Array.isArray(req.user.filial) ? req.user.filial : [req.user.filial];
      const padeirosDaFilial = await Padeiro.find({ filial: { $in: filiais }, deletado: { $ne: true } });
      const ids = padeirosDaFilial.map(p => p.id);
      avaliacoes = avaliacoes.filter(a => ids.includes(a.padeiroId));
    }

    res.json(avaliacoes);
  } catch (error) {
    console.error('Erro ao listar avaliações:', error);
    res.status(500).json({ error: 'Erro ao carregar avaliações' });
  }
};

exports.createAvaliacao = async (req, res) => {
  try {
    const allowedFields = [
      'id', 'padeiroId', 'padeiroNome', 'clienteId', 'clienteNome', 'atividadeId',
      'tipo', 'respostas', 'nota', 'observacao', 'avaliadoPor', 'avaliadoPorNome', 'criadoEm'
    ];

    const nova = {
      criadoEm: new Date().toISOString()
    };

    for (const key of allowedFields) {
      if (req.body[key] !== undefined) nova[key] = req.body[key];
    }

    const avaliacao = await Avaliacao.create(nova);
    res.status(201).json(avaliacao);
  } catch (error) {
    console.error('Erro ao criar avaliação:', error);
    res.status(500).json({ error: 'Erro ao criar avaliação', details: error.message });
  }
};

exports.resetAllAvaliacoes = async (req, res) => {
  try {
    await Avaliacao.deleteMany({});
    res.json({ success: true, message: 'Todas as avaliações foram removidas.' });
  } catch (e) {
    console.error('Erro ao resetar avaliações:', e);
    res.status(500).json({ error: 'Erro ao resetar avaliações' });
  }
};
