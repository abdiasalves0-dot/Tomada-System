const { PrismaClient } = require('./gestaoPadeiro-fdd83e32d29c2ac32a0f0529bc342c95e0b35aef/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const manualTasks = await prisma.cronograma.findMany({
      where: {
        OR: [
          { observacao: null },
          { observacao: '' },
          { observacao: { not: 'Escala Inteligente Automática' } }
        ]
      },
      orderBy: { criadoEm: 'desc' },
      take: 5
    });
    console.log("Manual tasks:");
    console.log(JSON.stringify(manualTasks, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
test();
