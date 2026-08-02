/**
 * ============================================================
 * WebAuthn Controller - Autenticação Biométrica (2FA)
 * ============================================================
 * Gerencia registro e verificação de credenciais biométricas
 * (digital, Windows Hello, Face ID) para o login de admin.
 * ============================================================
 */

const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse
} = require('@simplewebauthn/server');

const jwt = require('jsonwebtoken');
const { JWT_SECRET, BASE_URL } = require('../config');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { logSecurityEvent } = require('../data/auditService');

// ─── Configuração do Relying Party (RP) ───────────────────
// O RP ID deve ser o domínio do site (sem protocolo nem porta)
function getRpConfig(req) {
  let rpID = 'localhost';
  let origin = 'http://localhost:3000';

  // 1. Tenta obter dinamicamente a partir dos headers da requisição
  const reqHost = req?.headers?.host; // ex: bancada-kohl.vercel.app ou localhost:3000
  const reqOrigin = req?.headers?.origin || (req?.headers?.referer ? new URL(req.headers.referer).origin : null);

  if (reqHost) {
    rpID = reqHost.split(':')[0]; // extrai o hostname (remove a porta)
  }

  if (reqOrigin) {
    origin = reqOrigin;
  } else if (reqHost) {
    // se não houver origin, monta com base no host e protocolo apropriado
    const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';
    origin = `${isHttps ? 'https' : 'http'}://${reqHost}`;
  }

  // 2. Se não conseguiu detectar dinamicamente, usa a BASE_URL como fallback
  if (!reqHost && BASE_URL) {
    try {
      const url = new URL(BASE_URL);
      rpID = url.hostname;
      origin = url.origin;
    } catch (e) {
      // fallback final
    }
  }

  return {
    rpName: 'Tomada Sistema',
    rpID,
    origin
  };
}

// Armazenamento temporário de challenges persistido no Banco (compatível com Serverless/Vercel)
const pendingChallenges = {
  async set(key, value) {
    const chave = `webauthn_${key}`;
    const valorObj = JSON.stringify(value);
    const existing = await prisma.configuracao.findFirst({ where: { chave } });
    if (existing) {
      await prisma.configuracao.update({
        where: { id: existing.id },
        data: { valor: valorObj }
      });
    } else {
      await prisma.configuracao.create({
        data: { chave, valor: valorObj }
      });
    }
  },
  async get(key) {
    const chave = `webauthn_${key}`;
    const config = await prisma.configuracao.findFirst({ where: { chave } });
    if (!config) return null;
    try { return JSON.parse(config.valor); } catch (e) { return null; }
  },
  async delete(key) {
    const chave = `webauthn_${key}`;
    await prisma.configuracao.deleteMany({ where: { chave } });
  }
};

// ─── REGISTRO DE CREDENCIAL BIOMÉTRICA ────────────────────

/**
 * POST /api/auth/webauthn/register-options
 * Gera as opções para o navegador iniciar o registro biométrico.
 * Requer um setupToken JWT emitido pelo login.
 */
exports.registerOptions = async (req, res) => {
  try {
    const { setupToken } = req.body;
    if (!setupToken) return res.status(400).json({ error: 'Token de setup ausente' });

    let decoded;
    try {
      decoded = jwt.verify(setupToken, JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ error: 'Token expirado ou inválido' });
    }

    if (decoded.type !== 'webauthn_setup') {
      return res.status(400).json({ error: 'Token inválido para esta operação' });
    }

    const admin = await prisma.admin.findUnique({ where: { id: decoded.adminId } });
    if (!admin) return res.status(404).json({ error: 'Admin não encontrado' });

    // Buscar credenciais já existentes para excluir do registro
    const existingCreds = await prisma.webAuthnCredential.findMany({
      where: { adminId: admin.id }
    });

    const { rpName, rpID } = getRpConfig(req);

    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userID: new TextEncoder().encode(admin.id),
      userName: admin.email,
      userDisplayName: admin.nome,
      attestationType: 'none',
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'required' // OBRIGATÓRIO: exige biometria (permite local ou via celular/QR Code)
      },
      excludeCredentials: existingCreds.map(c => ({
        id: c.credentialId,
        type: 'public-key',
        transports: c.transports || []
      }))
    });

    // Salvar challenge temporariamente
    await pendingChallenges.set(`reg_${admin.id}`, {
      challenge: options.challenge,
      adminId: admin.id,
      expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutos
    });

    res.json(options);
  } catch (error) {
    console.error('[WebAuthn] Erro em registerOptions:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
};

/**
 * POST /api/auth/webauthn/register-verify
 * Verifica a resposta do navegador e salva a credencial biométrica.
 */
exports.registerVerify = async (req, res) => {
  try {
    const { setupToken, response: attResponse, deviceName } = req.body;
    if (!setupToken || !attResponse) {
      return res.status(400).json({ error: 'Dados incompletos' });
    }

    let decoded;
    try {
      decoded = jwt.verify(setupToken, JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ error: 'Token expirado ou inválido' });
    }

    const pending = await pendingChallenges.get(`reg_${decoded.adminId}`);
    if (!pending || pending.expiresAt < Date.now()) {
      await pendingChallenges.delete(`reg_${decoded.adminId}`);
      return res.status(400).json({ error: 'Challenge expirado. Tente novamente.' });
    }

    const { rpID, origin } = getRpConfig(req);

    const verification = await verifyRegistrationResponse({
      response: attResponse,
      expectedChallenge: pending.challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      requireUserVerification: true
    });

    if (!verification.verified || !verification.registrationInfo) {
      await logSecurityEvent('webauthn_registro_falha', decoded.adminId, req, { erro: 'Verificação de biometria falhou no servidor' });
      return res.status(400).json({ error: 'Verificação biométrica falhou' });
    }

    const { credential } = verification.registrationInfo;

    // Salvar credencial no banco
    await prisma.webAuthnCredential.create({
      data: {
        adminId: decoded.adminId,
        credentialId: typeof credential.id === 'string' ? credential.id : Buffer.from(credential.id).toString('base64url'),
        publicKey: Buffer.from(credential.publicKey).toString('base64'),
        counter: BigInt(credential.counter),
        transports: attResponse.response.transports || ['internal'],
        deviceName: deviceName || 'Dispositivo Principal'
      }
    });

    // Limpar challenge
    await pendingChallenges.delete(`reg_${decoded.adminId}`);

    // Emitir JWT final (o registro bem-sucedido já conta como autenticação)
    const admin = await prisma.admin.findUnique({ where: { id: decoded.adminId } });
    const token = jwt.sign({
      id: admin.id,
      adminId: admin.id,
      email: admin.email,
      role: admin.role,
      nome: admin.nome,
      filial: null
    }, JWT_SECRET, { expiresIn: '5d' });

    console.log(`🔐 [WebAuthn] Credencial biométrica registrada para admin: ${admin.email}`);
    await logSecurityEvent('webauthn_registro_sucesso', admin.email || admin.nome, req, { deviceName: deviceName || 'Dispositivo Principal' });

    res.json({
      verified: true,
      token,
      user: {
        id: admin.id,
        adminId: admin.id,
        nome: admin.nome,
        email: admin.email,
        role: admin.role,
        filial: null
      }
    });
  } catch (error) {
    console.error('[WebAuthn] Erro em registerVerify:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
};

// ─── AUTENTICAÇÃO BIOMÉTRICA (LOGIN) ──────────────────────

/**
 * POST /api/auth/webauthn/login-options
 * Gera as opções de autenticação para o navegador solicitar a biometria.
 */
exports.loginOptions = async (req, res) => {
  try {
    const { challengeToken } = req.body;
    if (!challengeToken) return res.status(400).json({ error: 'Token ausente' });

    let decoded;
    try {
      decoded = jwt.verify(challengeToken, JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ error: 'Token expirado ou inválido' });
    }

    if (decoded.type !== 'webauthn_challenge') {
      return res.status(400).json({ error: 'Token inválido para esta operação' });
    }

    const credentials = await prisma.webAuthnCredential.findMany({
      where: { adminId: decoded.adminId }
    });

    if (credentials.length === 0) {
      return res.status(400).json({ error: 'Nenhuma credencial biométrica encontrada' });
    }

    const { rpID } = getRpConfig(req);

    const options = await generateAuthenticationOptions({
      rpID,
      userVerification: 'required',
      allowCredentials: credentials.map(c => ({
        id: c.credentialId,
        type: 'public-key'
      }))
    });

    // Salvar challenge
    await pendingChallenges.set(`auth_${decoded.adminId}`, {
      challenge: options.challenge,
      adminId: decoded.adminId,
      expiresAt: Date.now() + 5 * 60 * 1000
    });

    res.json(options);
  } catch (error) {
    console.error('[WebAuthn] Erro em loginOptions:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
};

/**
 * POST /api/auth/webauthn/login-verify
 * Verifica a biometria e emite o JWT final.
 */
exports.loginVerify = async (req, res) => {
  try {
    const { challengeToken, response: authResponse } = req.body;
    if (!challengeToken || !authResponse) {
      return res.status(400).json({ error: 'Dados incompletos' });
    }

    let decoded;
    try {
      decoded = jwt.verify(challengeToken, JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ error: 'Token expirado ou inválido' });
    }

    const pending = await pendingChallenges.get(`auth_${decoded.adminId}`);
    if (!pending || pending.expiresAt < Date.now()) {
      await pendingChallenges.delete(`auth_${decoded.adminId}`);
      return res.status(400).json({ error: 'Challenge expirado. Tente novamente.' });
    }

    // Encontrar a credencial no banco
    const credentialIdB64 = authResponse.id;
    const credential = await prisma.webAuthnCredential.findUnique({
      where: { credentialId: credentialIdB64 }
    });

    if (!credential || credential.adminId !== decoded.adminId) {
      return res.status(400).json({ error: 'Credencial biométrica não encontrada' });
    }

    const { rpID, origin } = getRpConfig(req);

    const verification = await verifyAuthenticationResponse({
      response: authResponse,
      expectedChallenge: pending.challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      requireUserVerification: true,
      credential: {
        id: Buffer.from(credential.credentialId, 'base64url'),
        publicKey: Buffer.from(credential.publicKey, 'base64'),
        counter: Number(credential.counter),
        transports: credential.transports || ['internal']
      }
    });

    if (!verification.verified) {
      const admin = await prisma.admin.findUnique({ where: { id: decoded.adminId } });
      await logSecurityEvent('webauthn_verificacao_falha', admin ? (admin.email || admin.nome) : decoded.adminId, req, { erro: 'Verificação biométrica falhou' });
      return res.status(401).json({ error: 'Verificação biométrica falhou' });
    }

    // Atualizar counter para prevenir ataques de replay
    await prisma.webAuthnCredential.update({
      where: { id: credential.id },
      data: { counter: BigInt(verification.authenticationInfo.newCounter) }
    });

    // Limpar challenge
    await pendingChallenges.delete(`auth_${decoded.adminId}`);

    // Emitir JWT final
    const admin = await prisma.admin.findUnique({ where: { id: decoded.adminId } });
    const token = jwt.sign({
      id: admin.id,
      adminId: admin.id,
      email: admin.email,
      role: admin.role,
      nome: admin.nome,
      filial: null
    }, JWT_SECRET, { expiresIn: '5d' });

    console.log(`🔐 [WebAuthn] Login biométrico verificado para: ${admin.email}`);
    await logSecurityEvent('webauthn_verificacao_sucesso', admin.email || admin.nome, req, { deviceName: credential.deviceName || 'Dispositivo Principal' });

    res.json({
      verified: true,
      token,
      user: {
        id: admin.id,
        adminId: admin.id,
        nome: admin.nome,
        email: admin.email,
        role: admin.role,
        filial: null
      }
    });
  } catch (error) {
    console.error('[WebAuthn] Erro em loginVerify:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
};
