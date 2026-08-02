const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient({ log: ['query', 'error', 'warn'] });
  
  try {
    console.log('Testing Prisma create with exact payload from frontend...');
    
    const result = await prisma.cliente.create({
      data: {
        nome: 'Test Client Debug',
        receita: 5000,
        custoInsumos: 2000,
        endereco: 'Rua Test',
        estado: 'SP',
        bairro: 'Centro',
        codigo: 'CLI-9999',
        ativo: true
      }
    });
    
    console.log('SUCCESS:', JSON.stringify(result, null, 2));
    
    // Cleanup
    await prisma.cliente.delete({ where: { id: result.id } });
    console.log('Cleaned up test record.');
  } catch (err) {
    console.error('ERROR NAME:', err.name);
    console.error('ERROR CODE:', err.code);
    console.error('ERROR MESSAGE:', err.message);
    console.error('ERROR META:', JSON.stringify(err.meta, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

main();
