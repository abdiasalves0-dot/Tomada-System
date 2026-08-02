const { AuditLog } = require('./db-adapter');
const { getAdminId } = require('./context');

/**
 * Registra um evento de auditoria de segurança no banco de dados.
 * 
 * @param {string} evento Nome do evento (ex: 'login_sucesso', 'login_falha', 'webauthn_registro_sucesso', 'webauthn_verificacao_sucesso', etc.)
 * @param {string} usuario Identificador do usuário (e-mail ou nome)
 * @param {object} req Objeto Request do Express para capturar o IP real
 * @param {object} detalhes Objeto contendo informações de contexto adicionais
 */
async function logSecurityEvent(evento, usuario, req, detalhes = {}) {
  try {
    const rawIp = req?.headers?.['cf-connecting-ip']
      || req?.headers?.['x-real-ip']
      || (req?.headers?.['x-forwarded-for'] || '').split(',')[0].trim()
      || req?.socket?.remoteAddress
      || req?.ip
      || '0.0.0.0';
    const ip = rawIp.replace(/^::ffff:/, '');
    const adminId = getAdminId() || null;

    await AuditLog.create({
      evento,
      usuario,
      ip,
      detalhes: JSON.stringify(detalhes),
      adminId
    });
  } catch (err) {
    console.error('[AUDIT] Falha ao registrar log de segurança:', err.message);
  }
}

module.exports = {
  logSecurityEvent
};
