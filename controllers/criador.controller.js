const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');
const { Criador, Projeto, Padeiro } = require('../data/db-adapter');

// Registrar novo Criador
exports.registro = async (req, res) => {
  try {
    const { nome, email, senha, canalYoutube } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    }

    const emailLower = email.toLowerCase().trim();
    const existe = await Criador.findOne({ email: emailLower });
    if (existe) {
      return res.status(400).json({ error: 'Este e-mail já está cadastrado' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);
    const novoCriador = await Criador.create({
      nome,
      email: emailLower,
      senha: senhaHash,
      role: 'criador',
      canalYoutube: canalYoutube || ''
    });

    return res.status(201).json({
      message: 'Criador registrado com sucesso',
      user: {
        id: novoCriador.id,
        nome: novoCriador.nome,
        email: novoCriador.email,
        role: novoCriador.role
      }
    });
  } catch (error) {
    console.error('Erro no registro do criador:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Login do Criador
exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios' });
    }

    const emailLower = email.toLowerCase().trim();
    const criador = await Criador.findOne({ email: emailLower });

    if (!criador) {
      return res.status(401).json({ error: 'E-mail ou senha incorretos' });
    }

    const senhaValida = await bcrypt.compare(senha, criador.senha);
    if (!senhaValida) {
      return res.status(401).json({ error: 'E-mail ou senha incorretos' });
    }

    const token = jwt.sign(
      {
        id: criador.id,
        adminId: criador.id,
        nome: criador.nome,
        email: criador.email,
        role: criador.role
      },
      JWT_SECRET,
      { expiresIn: '5d' }
    );

    return res.json({
      token,
      user: {
        id: criador.id,
        adminId: criador.id,
        nome: criador.nome,
        email: criador.email,
        role: criador.role,
        canalYoutube: criador.canalYoutube
      }
    });
  } catch (error) {
    console.error('Erro no login do criador:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Criar novo Projeto
exports.criarProjeto = async (req, res) => {
  try {
    const { titulo, descricao, tipo, dataLimite, profissionalId } = req.body;
    const criadorId = req.user.id; // Definido pelo middleware de autenticação

    if (!titulo || !tipo) {
      return res.status(400).json({ error: 'Título e tipo de projeto são obrigatórios' });
    }

    const projeto = await Projeto.create({
      titulo,
      descricao: descricao || '',
      tipo, // video, thumb, ambos
      status: 'aberto',
      criadorId,
      profissionalId: profissionalId || null,
      dataLimite: dataLimite ? new Date(dataLimite) : null
    });

    return res.status(201).json(projeto);
  } catch (error) {
    console.error('Erro ao criar projeto:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Listar Projetos do Criador logado
exports.listarProjetos = async (req, res) => {
  try {
    const criadorId = req.user.id;
    const projetos = await Projeto.find({ criadorId });
    return res.json(projetos);
  } catch (error) {
    console.error('Erro ao listar projetos:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Detalhar um Projeto
exports.detalharProjeto = async (req, res) => {
  try {
    const { id } = req.params;
    const criadorId = req.user.id;

    const projeto = await Projeto.findOne({ id, criadorId });
    if (!projeto) {
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }

    return res.json(projeto);
  } catch (error) {
    console.error('Erro ao detalhar projeto:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Excluir um Projeto
exports.deletarProjeto = async (req, res) => {
  try {
    const { id } = req.params;
    const criadorId = req.user.id;

    const deletado = await Projeto.findByIdAndDelete(id);
    if (!deletado) {
      return res.status(404).json({ error: 'Projeto não encontrado ou não autorizado' });
    }

    return res.json({ message: 'Projeto deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar projeto:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Listar Profissionais disponíveis (Editores/Thumbmakers)
exports.listarProfissionais = async (req, res) => {
  try {
    // Busca profissionais ativos. No banco original eles estão na tabela Padeiro.
    const profissionais = await Padeiro.find({ status: 'ativo' });
    
    // Filtramos para retornar apenas os dados seguros e públicos de portfólio
    const filtrados = profissionais.map(p => ({
      id: p.id,
      nome: p.nome,
      cargo: p.cargo || 'Editor / Thumbmaker',
      fotoPerfil: p.fotoPerfil,
      ativo: p.ativo
    }));

    return res.json(filtrados);
  } catch (error) {
    console.error('Erro ao listar profissionais:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Vincular Profissional a um Projeto
exports.vincularProfissional = async (req, res) => {
  try {
    const { id } = req.params; // ID do projeto
    const { profissionalId } = req.body;
    const criadorId = req.user.id;

    const projeto = await Projeto.findOne({ id, criadorId });
    if (!projeto) {
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }

    // Verificar se profissional existe
    if (profissionalId) {
      const prof = await Padeiro.findById(profissionalId);
      if (!prof) {
        return res.status(404).json({ error: 'Profissional não encontrado' });
      }
    }

    const atualizado = await Projeto.findByIdAndUpdate(id, {
      profissionalId: profissionalId || null,
      status: profissionalId ? 'em_producao' : 'aberto'
    });

    return res.json(atualizado);
  } catch (error) {
    console.error('Erro ao vincular profissional:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
