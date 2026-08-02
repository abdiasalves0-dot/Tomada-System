const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const { JWT_SECRET, BASE_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, ADMIN_ALLOWED_IP_HASH } = require('../config');
const client = new OAuth2Client(GOOGLE_CLIENT_ID);
const { Admin, Padeiro, Criador } = require('../data/db-adapter');
const emailService = require('../data/emailService');
const { PrismaClient } = require('@prisma/client');
const prismaWebAuthn = new PrismaClient();
const { logSecurityEvent } = require('../data/auditService');
const { seedDefaultProductsForAdmin } = require('../data/productSeeder');
const { seedDefaultClientsForAdmin } = require('../data/clientSeeder');

/**
 * Extrai o IP real do cliente (considerando proxies/load balancers)
 * e retorna o hash SHA-256 para comparação segura.
 */
function getClientIpHash(req) {
  const rawIp = req.headers['cf-connecting-ip']
    || req.headers['x-real-ip']
    || (req.headers['x-forwarded-for'] || '').split(',')[0].trim()
    || req.socket?.remoteAddress
    || req.ip
    || '';
  const cleanIp = rawIp.replace(/^::ffff:/, '');
  return crypto.createHash('sha256').update(cleanIp).digest('hex');
}

/**
 * Verifica se o IP do cliente é autorizado para login de admin.
 */
function isAdminIpAllowed(req) {
  // Trava de IP desativada por completo conforme solicitado pelo usuário
  return true;
}

/**
 * Verifica se uma conta (admin ou padeiro) está bloqueada.
 * Usa comparação explícita (=== true / === false) para que campos
 * undefined/null no banco NUNCA sejam tratados como "deletado" ou "inativo".
 */
function isBlocked(account) {
  if (!account) return { blocked: false };
  if (account.deletado === true) return { blocked: true, reason: 'Usuário inexistente' };
  if (account.ativo === false) return { blocked: true, reason: 'Usuário desativado' };
  return { blocked: false };
}

/**
 * Verifica se o admin tem credenciais WebAuthn e retorna o tipo de resposta adequada.
 * Retorna: { type: 'requires2FA', challengeToken } | { type: 'requiresSetup2FA', setupToken } | { type: 'direct' }
 */
async function checkWebAuthn2FA(admin, role) {
  // Apenas o papel 'superadmin' exige verificação biométrica (WebAuthn 2FA)
  if (role !== 'superadmin') return { type: 'direct' };

  try {
    const credentials = await prismaWebAuthn.webAuthnCredential.findMany({
      where: { adminId: admin.id }
    });

    if (credentials.length > 0) {
      // Tem biometria cadastrada → exigir verificação
      const challengeToken = jwt.sign({
        adminId: admin.id,
        type: 'webauthn_challenge'
      }, JWT_SECRET, { expiresIn: '5m' });

      return { type: 'requires2FA', challengeToken };
    } else {
      // Não tem biometria → pedir para cadastrar
      const setupToken = jwt.sign({
        adminId: admin.id,
        type: 'webauthn_setup'
      }, JWT_SECRET, { expiresIn: '10m' });

      return { type: 'requiresSetup2FA', setupToken };
    }
  } catch (e) {
    console.error('[WebAuthn] Erro ao checar credenciais:', e.message);
    // Em caso de erro, permite login direto (graceful degradation)
    return { type: 'direct' };
  }
}

exports.login = async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) return res.status(400).json({ error: 'Nome de usuário (ou e-mail) e senha são obrigatórios' });

  const identifierLower = email.toLowerCase().trim();

  try {
    // Check admin
    let admin = await Admin.findOne({ nome: { $like: `${identifierLower}%` } });
    if (!admin) {
      admin = await Admin.findOne({ email: { $like: identifierLower } });
    }
    if (admin) {
      const hash = admin.passwordHash || admin.senha;
      const valid = await bcrypt.compare(senha, hash);
      if (!valid) {
        await logSecurityEvent('login_falha', admin.email || admin.nome, req, { erro: 'Senha incorreta (Admin)' });
        return res.status(401).json({ error: 'Senha incorreta' });
      }
      if (admin.deletado === true) return res.status(403).json({ error: 'Usuário inexistente' });

      const role = admin.role || 'admin';

      // 🛡️ BLINDAGEM 1: Validar IP via hash SHA-256
      if (role === 'admin' && !isAdminIpAllowed(req)) {
        console.warn(`[SEGURANÇA] Tentativa de login admin bloqueada - IP hash não autorizado`);
        return res.status(403).json({ error: 'Acesso negado. Contate o administrador do sistema.' });
      }

      // 🛡️ BLINDAGEM 2: Verificação biométrica (WebAuthn 2FA)
      const webauthnResult = await checkWebAuthn2FA(admin, role);

      if (webauthnResult.type === 'requires2FA') {
        await logSecurityEvent('webauthn_verificacao_solicitada', admin.email || admin.nome, req, { msg: 'Requer 2FA biométrico' });
        return res.json({
          requires2FA: true,
          challengeToken: webauthnResult.challengeToken,
          user: { nome: admin.nome }
        });
      }

      if (webauthnResult.type === 'requiresSetup2FA') {
        await logSecurityEvent('webauthn_registro_solicitado', admin.email || admin.nome, req, { msg: 'Requer cadastro de 2FA biométrico' });
        return res.json({
          requiresSetup2FA: true,
          setupToken: webauthnResult.setupToken,
          user: { nome: admin.nome }
        });
      }

      // Login direto (para roles não-admin ou fallback)
      const token = jwt.sign({
        id: admin.id,
        adminId: admin.id,
        email: admin.email,
        role: role,
        nome: admin.nome,
        filial: admin.filial || null
      }, JWT_SECRET, { expiresIn: '5d' });

      await logSecurityEvent('login_sucesso', admin.email || admin.nome, req, { role: role, metodo: 'senha' });
      return res.json({
        token,
        user: {
          id: admin.id,
          adminId: admin.id,
          nome: admin.nome,
          email: admin.email,
          role: role,
          filial: admin.filial || null
        }
      });
    }

    // Check padeiro
    let padeiro = await Padeiro.findOne({ nome: { $like: `${identifierLower}%` } });
    if (!padeiro && !identifierLower.includes('@')) {
      // Padeiros não tem e-mail no schema.prisma, usam CPF
      padeiro = await Padeiro.findOne({ cpf: { $like: identifierLower } });
    }
    if (!padeiro) {
      const criador = await Criador.findOne({ email: identifierLower });
      if (criador) {
        const valid = await bcrypt.compare(senha, criador.senha);
        if (!valid) {
          await logSecurityEvent('login_falha', criador.email || criador.nome, req, { erro: 'Senha incorreta (Criador)' });
          return res.status(401).json({ error: 'Senha incorreta' });
        }
        const token = jwt.sign({ id: criador.id, adminId: criador.id, email: criador.email, role: 'criador', nome: criador.nome, cargo: 'CRIADOR' }, JWT_SECRET, { expiresIn: '5d' });
        await logSecurityEvent('login_sucesso', criador.email || criador.nome, req, { role: 'criador', metodo: 'senha' });
        return res.json({ token, user: { id: criador.id, adminId: criador.id, nome: criador.nome, email: criador.email, role: 'criador', cargo: 'CRIADOR' } });
      }
    }
    if (!padeiro || padeiro.deletado === true) {
      await logSecurityEvent('login_falha', identifierLower, req, { erro: 'Usuário não encontrado' });
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    if (padeiro.ativo === false) return res.status(403).json({ error: 'Usuário desativado' });

    const pHash = padeiro.passwordHash || padeiro.senha;
    if (!pHash) return res.status(403).json({ error: 'first_access', message: 'Primeiro acesso. Verifique seu e-mail para definir sua senha.' });

    const valid = await bcrypt.compare(senha, pHash);
    if (!valid && senha !== pHash) {
      await logSecurityEvent('login_falha', padeiro.email || padeiro.nome || identifierLower, req, { erro: 'Senha incorreta (Técnico)' });
      return res.status(401).json({ error: 'Senha incorreta' });
    }

    const token = jwt.sign({ id: padeiro.id, adminId: padeiro.adminId, email: padeiro.email, role: padeiro.role, nome: padeiro.nome, cargo: padeiro.cargo, filial: padeiro.filial }, JWT_SECRET, { expiresIn: '5d' });
    await logSecurityEvent('login_sucesso', padeiro.email || padeiro.nome || identifierLower, req, { role: padeiro.role, metodo: 'senha' });
    return res.json({ token, user: { id: padeiro.id, adminId: padeiro.adminId, nome: padeiro.nome, email: padeiro.email, role: padeiro.role, cargo: padeiro.cargo, codTec: padeiro.codTec, filial: padeiro.filial } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Erro no servidor', detail: error.message, stack: error.stack });
  }
};

exports.googleLogin = async (req, res) => {
  const { credential } = req.body;
  if (!credential) return res.status(400).json({ error: 'Credencial do Google é obrigatória' });

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    const email = payload.email.toLowerCase().trim();

    let admin = await Admin.findOne({ email: new RegExp(`^${email}$`, 'i') });
    if (admin) {
      if (admin.deletado === true) return res.status(403).json({ error: 'Usuário inexistente' });
      if (admin.ativo === false) return res.status(403).json({ error: 'Usuário desativado' });
      const role = admin.role || 'admin';

      // 🛡️ BLINDAGEM: Se o usuário é admin, validar IP via hash SHA-256
      if (role === 'admin' && !isAdminIpAllowed(req)) {
        console.warn(`[SEGURANÇA] Tentativa de login Google admin bloqueada - IP hash não autorizado`);
        return res.status(403).json({ error: 'Acesso negado. Contate o administrador do sistema.' });
      }

      const token = jwt.sign({ id: admin.id, adminId: admin.id, email: admin.email, role: role, nome: admin.nome, filial: admin.filial || null }, JWT_SECRET, { expiresIn: '5d' });
      return res.json({ token, user: { id: admin.id, adminId: admin.id, nome: admin.nome, email: admin.email, role: role, filial: admin.filial || null } });
    }

    let padeiro = await Padeiro.findOne({ email: new RegExp(`^${email}$`, 'i') });
    if (padeiro) {
      if (padeiro.deletado === true) return res.status(403).json({ error: 'Usuário inexistente' });
      if (padeiro.ativo === false) return res.status(403).json({ error: 'Usuário desativado' });
      const token = jwt.sign({ id: padeiro.id, adminId: padeiro.adminId, email: padeiro.email, role: padeiro.role, nome: padeiro.nome, cargo: padeiro.cargo, filial: padeiro.filial }, JWT_SECRET, { expiresIn: '5d' });
      await logSecurityEvent('login_sucesso', padeiro.email || padeiro.nome, req, { role: padeiro.role, metodo: 'google' });
      return res.json({ token, user: { id: padeiro.id, adminId: padeiro.adminId, nome: padeiro.nome, email: padeiro.email, role: padeiro.role, cargo: padeiro.cargo, codTec: padeiro.codTec, filial: padeiro.filial } });
    }

    // Se não encontrou admin nem padeiro, cria conta automaticamente como gestor
    const newAdmin = await Admin.create({
      nome: payload.name || email.split('@')[0],
      email: email,
      senha: '',
      role: 'indeciso',
      ativo: true,
      deletado: false
    });

    const token = jwt.sign({ id: newAdmin.id, adminId: newAdmin.id, email: newAdmin.email, role: newAdmin.role, nome: newAdmin.nome, filial: null }, JWT_SECRET, { expiresIn: '5d' });
    return res.json({
      token,
      user: { id: newAdmin.id, adminId: newAdmin.id, nome: newAdmin.nome, email: newAdmin.email, role: newAdmin.role, filial: null },
      isNewUser: true
    });
  } catch (error) {
    console.error("Google Login error:", error);
    res.status(401).json({ error: 'Falha na autenticação com o Google' });
  }
};

/**
 * Handle Google Redirect (POST from Google)
 */
exports.googleLoginRedirect = async (req, res) => {
  const { credential } = req.body;
  if (!credential) return res.status(400).send('Credencial ausente');

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    const email = payload.email.toLowerCase().trim();

    let user = null;
    let role = null;

    // Check admin
    let admin = await Admin.findOne({ email: new RegExp(`^${email}$`, 'i') });
    if (admin && admin.deletado !== true) {
      if (admin.ativo !== false) {
        role = admin.role || 'admin';

        // 🛡️ BLINDAGEM: Se o usuário é admin, validar IP via hash SHA-256
        if (role === 'admin' && !isAdminIpAllowed(req)) {
          console.warn(`[SEGURANÇA] Tentativa de login Google Redirect admin bloqueada - IP hash não autorizado`);
          return res.status(403).send('Acesso negado. Contate o administrador do sistema.');
        }

        user = { id: admin.id, adminId: admin.id, nome: admin.nome, email: admin.email, role: role, filial: admin.filial || null };
      }
    } else {
      // Check padeiro
      let padeiro = await Padeiro.findOne({ email: new RegExp(`^${email}$`, 'i') });
      if (padeiro && padeiro.deletado !== true && padeiro.ativo !== false) {
        role = padeiro.role;
        user = { id: padeiro.id, adminId: padeiro.adminId, nome: padeiro.nome, email: padeiro.email, role: padeiro.role, cargo: padeiro.cargo, codTec: padeiro.codTec, filial: padeiro.filial };
      }
    }

    if (!user) {
      // Auto-cadastro via Google no fluxo de Redirect
      const newAdminId = 'adm_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
      const newAdmin = await Admin.create({
        id: newAdminId,
        nome: payload.name || email.split('@')[0],
        email: email,
        passwordHash: '',
        role: 'indeciso',
        ativo: true,
        deletado: false
      });
      await seedDefaultProductsForAdmin(newAdmin.id);
      await seedDefaultClientsForAdmin(newAdmin.id);
      role = newAdmin.role;
      user = { id: newAdmin.id, adminId: newAdmin.id, nome: newAdmin.nome, email: newAdmin.email, role: newAdmin.role, filial: null };
    }

    const token = jwt.sign({ ...user }, JWT_SECRET, { expiresIn: '5d' });

    // HTML that saves data to localStorage and redirects to home
    res.send(`
      <html>
        <head><title>Autenticando...</title></head>
        <body>
          <p>Autenticando, por favor aguarde...</p>
          <script>
            const token = ${JSON.stringify(token)};
            const user = ${JSON.stringify(user)};
            localStorage.setItem('NexusGestor_token', token);
            localStorage.setItem('NexusGestor_user', JSON.stringify(user));
            window.location.href = '/';
          </script>
        </body>
      </html>
    `);

  } catch (error) {
    console.error("Google Redirect error:", error);
    res.status(401).send(`Falha na autenticação: ${error.message} (Stack: ${error.stack})`);
  }
};

// Memória para armazenar tokens de login temporários iniciados do app Electron
const googleLoginSessions = new Map();

/**
 * GET /api/auth/google-login-callback
 * Executado pelo navegador externo ao finalizar o login do Google. Exibe mensagem de sucesso e envia o token pro app Electron.
 */
exports.googleLoginCallback = async (req, res) => {
  const { code, state: sessionId } = req.query;
  if (!code) return res.status(400).send('Código de autorização ausente');

  try {
    const { google } = require('googleapis');

    // Obter host e protocolo da requisição
    const host = req.headers.host || 'localhost:3000';
    const protocol = req.secure || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
    const redirectUri = `${protocol}://${host}/api/auth/google-login-callback`;

    const oauth2Client = new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      redirectUri
    );

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Obter dados do usuário
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    const email = payload.email.toLowerCase().trim();

    let user = null;
    let role = null;

    // Buscar admin
    let admin = await Admin.findOne({ email: new RegExp(`^${email}$`, 'i') });
    if (admin && admin.deletado !== true) {
      if (admin.ativo !== false) {
        role = admin.role || 'admin';
        user = { id: admin.id, adminId: admin.id, nome: admin.nome, email: admin.email, role: role, filial: admin.filial || null };
      }
    } else {
      // Buscar padeiro
      let padeiro = await Padeiro.findOne({ email: new RegExp(`^${email}$`, 'i') });
      if (padeiro && padeiro.deletado !== true && padeiro.ativo !== false) {
        role = padeiro.role;
        user = { id: padeiro.id, adminId: padeiro.adminId, nome: padeiro.nome, email: padeiro.email, role: padeiro.role, cargo: padeiro.cargo, codTec: padeiro.codTec, filial: padeiro.filial };
      }
    }

    if (!user) {
      const newAdminId = 'adm_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
      const newAdmin = await Admin.create({
        id: newAdminId,
        nome: payload.name || email.split('@')[0],
        email: email,
        senha: '',
        role: 'indeciso',
        ativo: true,
        deletado: false
      });
      role = newAdmin.role;
      user = { id: newAdmin.id, adminId: newAdmin.id, nome: newAdmin.nome, email: newAdmin.email, role: newAdmin.role, filial: null, isNewUser: true };
    }

    const token = jwt.sign({ ...user }, JWT_SECRET, { expiresIn: '5d' });

    // Salvar na memória do servidor para o polling do app Electron
    if (sessionId) {
      googleLoginSessions.set(sessionId, { token, user });
    }

    res.send(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>Login Concluído com Sucesso</title>
        <style>
          body { font-family: 'Outfit', sans-serif; background: #FAF8F5; color: #1C1A14; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
          .card { background: #FFFFFF; border-radius: 24px; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); max-width: 440px; border: 1px solid #EBE5DF; }
          .icon { font-size: 52px; margin-bottom: 16px; }
          h2 { font-size: 24px; font-weight: 800; margin: 0 0 12px 0; color: #1C1A14; }
          p { font-size: 14px; color: #64748B; margin: 0 0 24px 0; line-height: 1.6; }
        </style>
      </head>
        <div class="card">
          <div class="icon">🔒</div>
          <h2>Login Concluído com Sucesso!</h2>
          <p>Você foi autenticado. Redirecionando para o aplicativo...</p>
        </div>
        <script>
          try {
            const token = ${JSON.stringify(token)};
            const user = ${JSON.stringify(user)};
            localStorage.setItem('NexusGestor_token', token);
            localStorage.setItem('NexusGestor_user', JSON.stringify(user));
          } catch (e) {
            console.error('Erro ao salvar localStorage:', e);
          }
          setTimeout(() => {
            if (window.opener) {
              window.close();
            } else {
              window.location.href = '/';
            }
          }, 600);
        </script>
      </body>
      </html>
    `);

  } catch (err) {
    console.error('Erro no callback do Google Login:', err);
    res.status(500).send(`Erro ao autenticar com o Google: ${err.message}`);
  }
};

exports.saveLoginSession = (sessionId, sessionData) => {
  googleLoginSessions.set(sessionId, sessionData);
};

/**
 * GET /api/auth/check-login-session?sessionId=XXX
 * Polling endpoint para o app Electron verificar se a autenticação via navegador foi concluída.
 */
exports.checkLoginSession = (req, res) => {
  const { sessionId } = req.query;
  if (!sessionId) return res.status(400).json({ error: 'sessionId é obrigatório' });

  const session = googleLoginSessions.get(sessionId);
  if (session) {
    // Apagar a sessão para evitar uso duplo
    googleLoginSessions.delete(sessionId);
    return res.json({ success: true, token: session.token, user: session.user });
  }

  res.json({ success: false });
};

exports.firstAccess = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email é obrigatório' });

  try {
    const padeiro = await Padeiro.findOne({ email: new RegExp(`^${email.trim()}$`, 'i') });
    if (!padeiro) return res.status(404).json({ error: 'E-mail não encontrado no sistema' });
    if (padeiro.passwordHash) return res.status(400).json({ error: 'Senha já definida. Faça login normalmente.' });

    // Generate token
    const token = jwt.sign({ email: padeiro.email, type: 'first_access' }, JWT_SECRET, { expiresIn: '24h' });
    padeiro.firstAccessToken = token;
    padeiro.firstAccessExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    await padeiro.save();

    // Send email
    await emailService.sendFirstAccessEmail(padeiro.email, token, BASE_URL);

    res.json({
      success: true,
      message: 'E-mail enviado! Verifique sua caixa de entrada.',
      ...(emailService.getProviderName() === 'mock' ? { token, mockMode: true } : {})
    });
  } catch (error) {
    console.error("First access error:", error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
};

exports.setPassword = async (req, res) => {
  const { token, senha } = req.body;
  if (!token || !senha) return res.status(400).json({ error: 'Token e senha são obrigatórios' });
  if (senha.length < 6) return res.status(400).json({ error: 'Senha deve ter no mínimo 6 caracteres' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const padeiro = await Padeiro.findOne({ email: new RegExp(`^${decoded.email}$`, 'i') });
    if (!padeiro) return res.status(404).json({ error: 'Usuário não encontrado' });

    padeiro.passwordHash = await bcrypt.hash(senha, 10);
    padeiro.firstAccessToken = null;
    padeiro.firstAccessExpiry = null;
    padeiro.atualizadoEm = new Date().toISOString();
    await padeiro.save();

    res.json({ success: true, message: 'Senha definida com sucesso! Faça login.' });
  } catch (e) {
    return res.status(400).json({ error: 'Token inválido ou expirado' });
  }
};

exports.getPendingEmails = (req, res) => {
  const emails = emailService.getPendingEmails(req.params.email);
  res.json(emails);
};

exports.register = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  if (!firstName || !email || !password) {
    return res.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios' });
  }

  const emailLower = email.toLowerCase().trim();
  const nomeCompleto = `${firstName.trim()} ${lastName ? lastName.trim() : ''}`.trim();

  try {
    const existingAdmin = await Admin.findOne({ email: emailLower });
    if (existingAdmin) {
      return res.status(400).json({ error: 'E-mail já cadastrado' });
    }

    const existingPadeiro = await Padeiro.findOne({ email: emailLower });
    if (existingPadeiro) {
      return res.status(400).json({ error: 'E-mail já cadastrado' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newAdmin = await Admin.create({
      nome: nomeCompleto,
      email: emailLower,
      senha: passwordHash,
      role: 'indeciso',
      ativo: true,
      deletado: false
    });

    const token = jwt.sign({ id: newAdmin.id, adminId: newAdmin.id, email: newAdmin.email, role: 'indeciso', nome: newAdmin.nome, filial: null }, JWT_SECRET, { expiresIn: '5d' });
    res.json({ success: true, message: 'Conta criada com sucesso!', token, user: { id: newAdmin.id, adminId: newAdmin.id, nome: newAdmin.nome, email: newAdmin.email, role: 'indeciso', filial: null } });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Erro ao criar conta' });
  }
};

exports.updateRole = async (req, res) => {
  const { email, role } = req.body;
  if (!email || !role) return res.status(400).json({ error: 'E-mail e role são obrigatórios' });

  const emailLower = email.toLowerCase().trim();

  try {
    if (role === 'criador') {
      const admin = await Admin.findOne({ email: emailLower });
      if (!admin) return res.status(404).json({ error: 'Usuário não encontrado' });

      await Admin.findByIdAndUpdate(admin.id, { role: 'criador' });

      const token = jwt.sign({ id: admin.id, adminId: admin.id, email: admin.email, role: 'criador', nome: admin.nome, filial: admin.filial || null }, JWT_SECRET, { expiresIn: '5d' });
      return res.json({
        success: true,
        token,
        user: { id: admin.id, adminId: admin.id, nome: admin.nome, email: admin.email, role: 'criador', filial: admin.filial || null }
      });
    } else if (role === 'editor') {
      const admin = await Admin.findOne({ email: emailLower });
      if (!admin) return res.status(404).json({ error: 'Usuário não encontrado' });

      await Admin.findByIdAndUpdate(admin.id, { role: 'editor' });

      const token = jwt.sign({ id: admin.id, adminId: admin.id, email: admin.email, role: 'editor', nome: admin.nome, filial: admin.filial || null }, JWT_SECRET, { expiresIn: '5d' });
      return res.json({
        success: true,
        token,
        user: { id: admin.id, adminId: admin.id, nome: admin.nome, email: admin.email, role: 'editor', filial: admin.filial || null }
      });
    }

    res.status(400).json({ error: 'Role inválida' });
  } catch (error) {
    console.error('Erro ao atualizar role:', error);
    res.status(500).json({ error: 'Erro ao atualizar perfil', detail: error.message });
  }
};