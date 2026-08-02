const fs = require('fs');
const path = require('path');
const { Produto } = require('./db-adapter');

/**
 * Cadastra a lista de produtos padrão para um novo administrador (tenant).
 * 
 * @param {string} adminId ID do administrador
 */
async function seedDefaultProductsForAdmin(adminId) {
  try {
    const jsonPath = path.join(__dirname, 'defaultProducts.json');
    if (!fs.existsSync(jsonPath)) {
      console.warn(`[SEEDER] defaultProducts.json não encontrado em ${jsonPath}`);
      return;
    }

    const defaultProducts = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    // Preparar lista de produtos associados ao adminId
    const productsToInsert = defaultProducts.map(p => ({
      ...p,
      adminId
    }));

    await Produto.insertMany(productsToInsert);
    console.log(`[SEEDER] ${productsToInsert.length} produtos padrão cadastrados para o admin ${adminId}`);
  } catch (err) {
    console.error(`[SEEDER] Falha ao cadastrar produtos padrão para admin ${adminId}:`, err.message);
  }
}

module.exports = {
  seedDefaultProductsForAdmin
};
