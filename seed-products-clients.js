const fs = require('fs');
const path = require('path');
const { Produto } = require('./data/db-adapter');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  console.log('Deletando produtos existentes...');
  await Produto.deleteMany({});
  
  // 1. Importar produtos de marcenaria do fornecedores_produtos.db (JSON)
  console.log('Lendo produtos de marcenaria...');
  const dbPath = path.join(__dirname, 'data', 'fornecedores_produtos.db');
  const rawData = fs.readFileSync(dbPath, 'utf8');
  const jsonProdutos = JSON.parse(rawData);
  
  const mappedProdutos = jsonProdutos.map(item => {
    // Determinar categoria a partir do prefixo do código
    let categoria = 'Marcenaria';
    if (item.produtoCodigo) {
      const prefix = item.produtoCodigo.split('-')[0].toUpperCase();
      if (prefix === 'MAD') categoria = 'Madeiras';
      else if (prefix === 'FIT') categoria = 'Ferragens';
      else if (prefix === 'QUI') categoria = 'Químicos';
      else if (prefix === 'FER') categoria = 'Ferramentas';
    }
    
    return {
      descricao: item.produtoNome || '',
      codigo: item.produtoCodigo || null,
      fornecedor: item.fornecedor || null,
      categoria: categoria,
      preco: item.preco !== undefined ? parseFloat(item.preco) : null,
      unidade: item.unidade || null,
      ativo: item.ativo !== false,
      estoque: 0
    };
  });
  
  console.log(`Inserindo ${mappedProdutos.length} produtos de marcenaria...`);
  await Produto.insertMany(mappedProdutos);
  console.log('✅ Produtos de marcenaria inseridos com sucesso!');
  
  // 2. Importar equipamentos/ferramentas do script SQL
  console.log('Lendo script SQL de ferramentas de marcenaria...');
  const sqlPath = path.join(__dirname, 'ferramentas_marceneiro_postgres.sql');
  let sqlContent = fs.readFileSync(sqlPath, 'utf8');
  
  // Adiciona CASCADE nos drops para evitar erros de dependência de chaves estrangeiras
  sqlContent = sqlContent
    .replace(/DROP TABLE IF EXISTS ferramentas/gi, 'DROP TABLE IF EXISTS ferramentas CASCADE')
    .replace(/DROP TABLE IF EXISTS categorias/gi, 'DROP TABLE IF EXISTS categorias CASCADE');

  // Remover comentários SQL (-- ...) para evitar que comandos válidos sejam ignorados
  sqlContent = sqlContent.replace(/--.*$/gm, '');
  
  console.log('Executando script SQL no banco...');
  // O Prisma permite rodar o script SQL usando $executeRawUnsafe.
  // Dividimos por ponto e vírgula para executar cada comando individualmente
  const sqlStatements = sqlContent
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0);
    
  for (const statement of sqlStatements) {
    console.log(`Executando: ${statement.substring(0, 100)}...`);
    await prisma.$executeRawUnsafe(statement);
  }
  console.log('✅ Equipamentos e ferramentas de marcenaria inseridos com sucesso!');
}

run()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });

