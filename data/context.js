const { AsyncLocalStorage } = require('async_hooks');

// Cria o storage para armazenar as informações do tenant de forma assíncrona por request
const tenantStorage = new AsyncLocalStorage();

/**
 * Retorna o ID do admin/tenant ativo no contexto atual.
 * Retorna null se não houver um contexto ativo (ex: fora de uma requisição HTTP autenticada).
 */
function getAdminId() {
  const store = tenantStorage.getStore();
  return store ? store.adminId : null;
}

/**
 * Executa uma função dentro do contexto do adminId especificado.
 */
function runWithAdminId(adminId, fn) {
  return tenantStorage.run({ adminId }, fn);
}

module.exports = {
  tenantStorage,
  getAdminId,
  runWithAdminId
};
