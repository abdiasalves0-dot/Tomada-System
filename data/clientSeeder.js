const fs = require('fs');
const path = require('path');
const { Cliente } = require('./db-adapter');

/**
 * Cadastra os 10 clientes padrão para um novo administrador (tenant).
 * 
 * @param {string} adminId ID do administrador
 */
async function seedDefaultClientsForAdmin(adminId) {
  try {
    const jsonPath = path.join(__dirname, 'defaultClients.json');
    if (!fs.existsSync(jsonPath)) {
      console.warn(`[SEEDER] defaultClients.json não encontrado em ${jsonPath}`);
      return;
    }

    const defaultClients = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    // Preparar lista de clientes associados ao adminId
    const clientsToInsert = defaultClients.map((c, index) => ({
      ...c,
      codigo: `CLI-${index + 1}`,
      adminId
    }));

    await Cliente.insertMany(clientsToInsert);
    console.log(`[SEEDER] ${clientsToInsert.length} clientes padrão cadastrados para o admin ${adminId}`);
  } catch (err) {
    console.error(`[SEEDER] Falha ao cadastrar clientes padrão para admin ${adminId}:`, err.message);
  }
}

module.exports = {
  seedDefaultClientsForAdmin
};
