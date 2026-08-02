const { AuditLog } = require('../data/db-adapter');

/**
 * Retorna os logs de auditoria de segurança.
 * Apenas acessível por superadmin.
 */
exports.getLogs = async (req, res) => {
  try {
    // Garantir que apenas superadmin possa acessar esta rota
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ error: 'Acesso negado. Apenas o Super Admin pode visualizar os logs de auditoria.' });
    }

    const { search } = req.query;
    let query = {};

    if (search) {
      const searchPattern = `%${search}%`;
      query = {
        $or: [
          { evento: { $like: searchPattern } },
          { usuario: { $like: searchPattern } },
          { ip: { $like: searchPattern } },
          { detalhes: { $like: searchPattern } }
        ]
      };
    }

    // Buscar logs ordenados por data decrescente
    const logs = await AuditLog.find(query).sort({ data: -1 }).limit(100);

    res.json({ success: true, logs });
  } catch (error) {
    console.error('[AUDIT] Erro ao buscar logs de auditoria:', error);
    res.status(500).json({ error: 'Erro ao buscar logs de auditoria', detail: error.message });
  }
};
