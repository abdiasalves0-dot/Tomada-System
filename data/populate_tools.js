const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  try {
    const sqlPath = path.join(__dirname, '..', 'ferramentas_marceneiro_postgres.sql');
    console.log(`Reading SQL from: ${sqlPath}`);
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Split statements by semicolon, but ignore comments
    const lines = sqlContent.split('\n');
    let cleanedSql = '';
    for (let line of lines) {
      const cleanLine = line.split('--')[0].trim(); // Remove comments
      if (cleanLine) {
        cleanedSql += cleanLine + ' ';
      }
    }

    const statements = cleanedSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    console.log(`Executing ${statements.length} SQL statements...`);

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      console.log(`Executing stmt ${i + 1}/${statements.length}...`);
      await prisma.$executeRawUnsafe(stmt);
    }

    console.log("Database successfully populated with tools and categories!");
  } catch (err) {
    console.error("Error populating database:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
