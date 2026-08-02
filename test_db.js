const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Checking tables...");
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema='public'
    `;
    console.log("Tables in database:", tables);

    // Check if there are columns in PadeiroMeta
    const metaCols = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'PadeiroMeta'
    `;
    console.log("PadeiroMeta columns:", metaCols);

    // Try finding some padeiroMetas
    const metas = await prisma.padeiroMeta.findMany();
    console.log("PadeiroMetas count:", metas.length);
    if (metas.length > 0) {
      console.log("Sample PadeiroMeta:", metas[0]);
    }
  } catch (err) {
    console.error("Error checking database:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
