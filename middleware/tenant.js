const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');
const { runWithAdminId } = require('../data/context');

function tenantMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded; // Salva o usuário decodificado na requisição

      // Determina o adminId do tenant para isolamento absoluto de dados entre contas
      const adminId = decoded.adminId || decoded.id;

      if (adminId) {
        return runWithAdminId(adminId, next);
      }
    } catch (e) {
      // Token inválido ou expirado, deixa o authMiddleware tratar
    }
  }

  next();
}

module.exports = tenantMiddleware;
