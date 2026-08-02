const { Cronograma, Cliente, Produto } = require('./data/db-adapter');

async function main() {
  try {
    const cronogramas = await Cronograma.find({});
    const clientes = await Cliente.find({});
    const produtos = await Produto.find({});

    console.log("=== Database Counts ===");
    console.log(`Cronogramas: ${cronogramas.length}`);
    console.log(`Clientes: ${clientes.length}`);
    console.log(`Produtos: ${produtos.length}`);

    console.log("\n=== Clientes CustoInsumos sample ===");
    clientes.slice(0, 5).forEach(c => {
      console.log(`Cliente: ${c.nome} (id: ${c.id}) - custoInsumos: ${c.custoInsumos} (type: ${typeof c.custoInsumos})`);
    });

    console.log("\n=== Cronogramas Orcamento sample ===");
    cronogramas.slice(0, 5).forEach(c => {
      console.log(`Cronograma Date: ${c.data} - Orcamento:`, c.orcamento, `(type: ${typeof c.orcamento})`);
    });

    console.log("\n=== Products Preco sample ===");
    produtos.slice(0, 5).forEach(p => {
      console.log(`Produto: ${p.descricao} (id: ${p.id}) - preco: ${p.preco} (type: ${typeof p.preco})`);
    });

  } catch (err) {
    console.error("Error running test_gastos:", err);
  } finally {
    process.exit(0);
  }
}

main();
