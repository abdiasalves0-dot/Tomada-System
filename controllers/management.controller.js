const bcrypt = require('bcryptjs');
const { Admin, Padeiro, Atividade, Meta, Avaliacao, Cronograma, Cliente, Criador } = require('../data/db-adapter');
const { runWithAdminId } = require('../data/context');

// ═══════════════════════════════════════════════════════════
// 🛡️ FUNÇÕES DE MASCARAMENTO DE DADOS PESSOAIS (PII)
// ═══════════════════════════════════════════════════════════

/**
 * Mascara CPF: 123.456.789-01 → 123.***.***-01
 */
function maskCpf(cpf) {
  if (!cpf) return cpf;
  const clean = cpf.replace(/\D/g, '');
  if (clean.length < 5) return '***.***.***-**';
  return `${clean.slice(0, 3)}.***.***-${clean.slice(-2)}`;
}

/**
 * Mascara E-mail: usuario@email.com → us***@email.com
 */
function maskEmail(email) {
  if (!email) return email;
  const [local, domain] = email.split('@');
  if (!domain) return '***@***.com';
  const visible = local.slice(0, 2);
  return `${visible}***@${domain}`;
}

/**
 * Mascara RG: 12.345.678-9 → **.***.***-*
 */
function maskRg(rg) {
  if (!rg) return rg;
  return rg.replace(/\d/g, '*');
}

/**
 * Mascara Telefone: (11) 99999-1234 → (***) *****-1234
 */
function maskTelefone(telefone) {
  if (!telefone) return telefone;
  const digits = telefone.replace(/\D/g, '');
  if (digits.length < 4) return '***';
  return `***-${digits.slice(-4)}`;
}

/**
 * Aplica mascaramento completo a um objeto de usuário.
 * Remove campos ultra-sensíveis e mascara campos de PII.
 */
function sanitizeUser(user) {
  const {
    passwordHash, senha, firstAccessToken, firstAccessExpiry,
    ...safe
  } = user;

  // Mascarar dados pessoais
  if (safe.cpf) safe.cpf = maskCpf(safe.cpf);
  if (safe.email) safe.email = maskEmail(safe.email);
  if (safe.rg) safe.rg = maskRg(safe.rg);
  if (safe.telefone) safe.telefone = maskTelefone(safe.telefone);

  return safe;
}

// ═══════════════════════════════════════════════════════════

exports.listUsers = async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'superadmin') return res.status(403).json({ error: 'Acesso restrito' });
  try {
    let admins, padeiros;
    // Executa a busca fora do contexto de tenant para trazer todos os usuários do sistema
    await runWithAdminId(null, async () => {
      try {
        admins = await Admin.find({ deletado: { $ne: true } });
        padeiros = await Padeiro.find({ deletado: { $ne: true } });
      } catch (e) {
        // Fallback se a coluna deletado não existir
        console.warn('Fallback: deletado column missing, fetching all users');
        admins = await Admin.find();
        padeiros = await Padeiro.find();
      }
    });
    
    const combined = [
      ...admins.map(a => ({ ...a, source: 'admin' })),
      ...padeiros.map(p => ({ ...p, source: 'padeiro' }))
    ];

    // 🛡️ Sanitizar todos os dados antes de enviar ao frontend
    res.json(combined.map(u => sanitizeUser(u)));
  } catch (error) {
    console.error('Error listing users:', error);
    res.status(500).json({ error: 'Erro ao listar usuários' });
  }
};


exports.createUser = async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'superadmin') return res.status(403).json({ error: 'Acesso restrito' });
  try {
    const { nome, email, senha, role, filial } = req.body;
    
    if (!nome || !email || !senha) return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });

    // Check if email already exists in either collection
    const existsAdmin = await Admin.findOne({ email });
    const existsPadeiro = await Padeiro.findOne({ email });
    const existsCriador = await Criador.findOne({ email });
    if (existsAdmin || existsPadeiro || existsCriador) return res.status(400).json({ error: 'Email já cadastrado' });

    const passwordHash = await bcrypt.hash(senha, 10);
    
    let novo;
    if (role === 'padeiro') {
      novo = await Padeiro.create({
        nome,
        email,
        passwordHash,
        role: 'padeiro',
        filial: filial || null,
        ativo: req.body.ativo !== undefined ? (req.body.ativo === 'true' || req.body.ativo === true) : true,
        criadoEm: new Date().toISOString()
      });
    } else if (role === 'criador') {
      novo = await Criador.create({
        nome,
        email,
        senha: passwordHash,
        role: 'criador',
        ativo: req.body.ativo !== undefined ? (req.body.ativo === 'true' || req.body.ativo === true) : true,
        criadoEm: new Date().toISOString()
      });
    } else {
      novo = await Admin.create({
        nome,
        email,
        passwordHash,
        role: role || 'gestor_regional',
        filial: role !== 'admin' ? (filial || null) : null,
        ativo: req.body.ativo !== undefined ? (req.body.ativo === 'true' || req.body.ativo === true) : true,
        criadoEm: new Date().toISOString()
      });
    }

    const result = { ...novo };
    delete result.passwordHash;
    res.status(201).json(result);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
};

exports.deleteUser = async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'superadmin') return res.status(403).json({ error: 'Acesso restrito' });
  try {
    // Prevent self-deletion
    if (req.params.id === req.user.id) return res.status(400).json({ error: 'Você não pode excluir seu próprio usuário' });
    
    const userId = req.params.id;

    await runWithAdminId(null, async () => {
      // Try to delete from Admin
      const deletedAdmin = await Admin.findByIdAndDelete(userId);
      
      // If not admin, try Padeiro and perform cascade delete
      if (!deletedAdmin) {
        await Promise.all([
          Padeiro.findByIdAndDelete(userId),
          Atividade.deleteMany({ padeiroId: userId }),
          Meta.deleteMany({ padeiroId: userId }),
          Avaliacao.deleteMany({ padeiroId: userId }),
          Cronograma.deleteMany({ padeiroId: userId })
        ]);
      } else {
        // If it was an admin, also clean up evaluations performed by them if necessary
        await Avaliacao.deleteMany({ avaliadoPor: userId });
      }
    });
    
    res.json({ success: true, message: 'Usuário e todos os seus registros foram excluídos permanentemente.' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Erro ao excluir usuário permanentemente', details: error.message });
  }
};
exports.updateUser = async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'superadmin') return res.status(403).json({ error: 'Acesso restrito' });
  try {
    const { nome, email, senha, role, filial, ativo } = req.body;
    const updateData = { nome, email, role };
    
    if (ativo !== undefined) {
      updateData.ativo = (ativo === 'true' || ativo === true);
    }
    
    if (role !== 'admin' && role !== 'superadmin') {
      updateData.filial = filial || null;
    } else {
      updateData.filial = null;
    }

    if (senha) {
      updateData.passwordHash = await bcrypt.hash(senha, 10);
    }

    await runWithAdminId(null, async () => {
      // Check if user is currently in Admin or Padeiro collection
      const currentAdmin = await Admin.findById(req.params.id);
      const currentPadeiro = await Padeiro.findById(req.params.id);
      const currentCriador = await Criador.findById(req.params.id);

      if (currentCriador) {
        const payload = {
          nome: updateData.nome || currentCriador.nome,
          email: updateData.email || currentCriador.email,
          ativo: updateData.ativo !== undefined ? updateData.ativo : currentCriador.ativo
        };
        if (senha) {
          payload.senha = await bcrypt.hash(senha, 10);
        }
        await Criador.findByIdAndUpdate(req.params.id, payload);
        return;
      }

      if (role === 'padeiro') {
        // If we are changing role to baker:
        if (currentAdmin) {
          // Move from Admin to Padeiro collection
          await Admin.findByIdAndDelete(req.params.id);
          await Padeiro.create({
            id: req.params.id,
            nome: updateData.nome || currentAdmin.nome,
            email: updateData.email || currentAdmin.email,
            passwordHash: updateData.passwordHash || currentAdmin.passwordHash,
            role: 'padeiro',
            filial: updateData.filial !== undefined ? updateData.filial : currentAdmin.filial,
            ativo: updateData.ativo !== undefined ? updateData.ativo : currentAdmin.ativo,
            criadoEm: currentAdmin.criadoEm || new Date().toISOString()
          });
        } else if (currentPadeiro) {
          // Just update in Padeiro collection
          await Padeiro.findByIdAndUpdate(req.params.id, updateData);
        }
      } else {
        // If we are changing role to manager/admin (i.e. not baker):
        if (currentPadeiro) {
          // Move from Padeiro to Admin collection
          await Padeiro.findByIdAndDelete(req.params.id);
          await Admin.create({
            id: req.params.id,
            nome: updateData.nome || currentPadeiro.nome,
            email: updateData.email || currentPadeiro.email,
            passwordHash: updateData.passwordHash || currentPadeiro.passwordHash,
            role: role || 'gestor_regional',
            filial: updateData.filial !== undefined ? updateData.filial : currentPadeiro.filial,
            ativo: updateData.ativo !== undefined ? updateData.ativo : currentPadeiro.ativo,
            criadoEm: currentPadeiro.criadoEm || new Date().toISOString()
          });
        } else if (currentAdmin) {
          // Just update in Admin collection
          await Admin.findByIdAndUpdate(req.params.id, updateData);
        }
      }
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: 'Erro ao atualizar usuário', details: error.message, stack: error.stack });
  }
};

exports.syncClientesFromJson = async (req, res) => {
  const allowed = ['superadmin', 'admin', 'gestor_geral'];
  if (!allowed.includes(req.user.role)) return res.status(403).json({ error: 'Acesso restrito' });

  const path = require('path');
  const fs = require('fs');

  try {
    const filePath = path.join(__dirname, '..', 'data', 'clientes.json');
    if (!fs.existsSync(filePath)) {
      return res.status(400).json({ error: 'Arquivo data/clientes.json não encontrado no servidor.' });
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    console.log(`[SYNC CLIENTES] Iniciando sincronização total (substituição) de ${data.length} clientes via API...`);

    // Deleta todos os clientes atuais para substituição completa
    await Cliente.deleteMany({});

    let inseridos = 0;

    for (const item of data) {
      if (!item.nome) continue;
      
      const codigo = item.codigo ? String(item.codigo) : '';
      
      await Cliente.create({
        id: item.id || Math.random().toString(36).substr(2, 9) + Date.now().toString(36),
        codigo: codigo,
        nome: item.nome ? String(item.nome) : '',
        nomeFantasia: item.nomeFantasia ? String(item.nomeFantasia) : '',
        inscricaoEstadual: item.inscricaoEstadual ? String(item.inscricaoEstadual) : '',
        cnpj: item.cnpj ? String(item.cnpj) : '',
        endereco: item.endereco ? String(item.endereco) : '',
        bairro: item.bairro ? String(item.bairro) : '',
        estado: item.estado ? String(item.estado) : '',
        ativo: item.ativo !== undefined ? !!item.ativo : true,
        criadoEm: item.criadoEm || new Date().toISOString()
      });
      inseridos++;
    }

    console.log(`[SYNC CLIENTES] Sincronização de substituição concluída! ${inseridos} clientes importados.`);
    res.json({ 
      success: true, 
      message: `Sincronização realizada com sucesso! A base de dados foi totalmente substituída: ${inseridos} clientes foram importados.` 
    });
  } catch (error) {
    console.error('Erro na sincronização de clientes:', error);
    res.status(500).json({ error: 'Erro interno ao sincronizar os clientes.', details: error.message });
  }
};

exports.resetAllDatabase = async (req, res) => {
  const allowed = ['superadmin', 'admin', 'gestor_geral', 'criador', 'editor'];
  if (!allowed.includes(req.user.role)) return res.status(403).json({ error: 'Acesso restrito' });
  try {
    const db = require('../data/db-adapter');
    const adminId = req.user.adminId || req.user.id;
    const filter = adminId ? { adminId } : {};
    
    // Clear business data tables for this tenant/admin
    await Promise.all([
      db.Padeiro.deleteMany(filter),
      db.Meta.deleteMany(filter),
      db.Atividade.deleteMany(filter),
      db.Avaliacao.deleteMany(filter),
      db.Cronograma.deleteMany(filter),
      db.Localizacao.deleteMany(filter),
      db.Cliente.deleteMany(filter),
      db.PushSubscription.deleteMany(filter),
      db.Orcamento.deleteMany(filter),
      db.Contrato.deleteMany(filter),
      db.Produto.deleteMany(filter)
    ]);
    
    res.json({ success: true, message: 'Seus dados foram apagados com sucesso.' });
  } catch (error) {
    console.error('Erro ao resetar dados:', error);
    res.status(500).json({ error: 'Erro ao resetar dados', details: error.message });
  }
};

exports.deleteAllExceptSuperadmin = async (req, res) => {
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ error: 'Acesso restrito. Apenas o Super Admin pode realizar esta ação.' });
  }

  try {
    const fs = require('fs');
    const path = require('path');
    const db = require('../data/db-adapter');

    await runWithAdminId(null, async () => {
      // 1. Deletar todos os dados dos colaboradores no banco de dados
      await Promise.all([
        db.Padeiro.deleteMany({}),
        db.Atividade.deleteMany({}),
        db.Meta.deleteMany({}),
        db.Avaliacao.deleteMany({}),
        db.Cronograma.deleteMany({}),
        db.Localizacao ? db.Localizacao.deleteMany({}) : Promise.resolve(),
        db.PushSubscription ? db.PushSubscription.deleteMany({}) : Promise.resolve(),
        db.Contrato ? db.Contrato.deleteMany({}) : Promise.resolve(),
        db.Colaborador ? db.Colaborador.deleteMany({}) : Promise.resolve(),
        db.TimelineEvent ? db.TimelineEvent.deleteMany({}) : Promise.resolve(),
        db.HistoricoLocalizacao ? db.HistoricoLocalizacao.deleteMany({}) : Promise.resolve()
      ]);

      // 2. Deletar todos os admins exceto o superadmin
      await db.Admin.deleteMany({
        role: { $ne: 'superadmin' }
      });

      // 3. Deletar todos os arquivos físicos de uploads relacionados (PII)
      const uploadsDir = path.join(__dirname, '..', 'uploads');
      if (fs.existsSync(uploadsDir)) {
        const deleteFolderRecursive = (dirPath) => {
          if (fs.existsSync(dirPath)) {
            fs.readdirSync(dirPath).forEach((file) => {
              const curPath = path.join(dirPath, file);
              if (fs.lstatSync(curPath).isDirectory()) {
                deleteFolderRecursive(curPath);
              } else {
                try {
                  fs.unlinkSync(curPath);
                } catch (e) {
                  // ignore unlink error
                }
              }
            });
          }
        };

        // Limpar subpastas críticas de uploads sem deletar a raiz
        ['contratos', 'assinaturas', 'atividades', 'fotos', 'padeiros', 'perfis'].forEach(sub => {
          const subPath = path.join(uploadsDir, sub);
          if (fs.existsSync(subPath)) {
            deleteFolderRecursive(subPath);
          }
        });
      }
    });

    // Registrar o evento de auditoria
    const { logSecurityEvent } = require('../data/auditService');
    await logSecurityEvent('exclusao_massa_usuarios', req.user.email || req.user.nome, req, { msg: 'Exclusão definitiva e limpeza de todos os arquivos e dados de usuários (exceto superadmin)' });

    res.json({ success: true, message: 'Todos os usuários (exceto o Super Admin), seus dados de localização, contratos e arquivos físicos foram excluídos definitivamente.' });
  } catch (error) {
    console.error('Error deleting all users except superadmin:', error);
    res.status(500).json({ error: 'Erro ao excluir todos os usuários definitivamente', details: error.message });
  }
};

