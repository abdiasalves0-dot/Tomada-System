const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const admins = await p.admin.findMany({ select: { id: true, email: true, role: true, nome: true } });
  console.log(JSON.stringify(admins, null, 2));
  await p.$disconnect();
}
main();
