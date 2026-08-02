require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

async function clean() {
  console.log('🧹 Limpando dados do banco de dados (Prisma)...');
  
  try {
    await prisma.atividade.deleteMany({});
    console.log('✅ Atividades deletadas.');
  } catch (e) { console.error('Erro ao deletar atividades:', e.message); }

  try {
    await prisma.cronograma.deleteMany({});
    console.log('✅ Cronogramas deletados.');
  } catch (e) { console.error('Erro ao deletar cronogramas:', e.message); }

  try {
    await prisma.avaliacao.deleteMany({});
    console.log('✅ Avaliações deletadas.');
  } catch (e) { console.error('Erro ao deletar avaliações:', e.message); }

  try {
    await prisma.padeiroMeta.deleteMany({});
    await prisma.historicoMetas.deleteMany({});
  } catch (e) {}

  try {
    await prisma.padeiro.deleteMany({});
    console.log('✅ Padeiros deletados.');
  } catch (e) { console.error('Erro ao deletar padeiros:', e.message); }

  try {
    await prisma.webAuthnCredential.deleteMany({});
    await prisma.admin.deleteMany({});
    
    const hash = await bcrypt.hash('Tomada123', 10);
    const tomadaAdmin = await prisma.admin.create({
      data: {
        id: 'admin-tomada-001',
        nome: 'Tomada',
        email: 'admin@tomada.com',
        senha: hash,
        role: 'admin'
      }
    });
    console.log('✅ Admin Tomada criado:', tomadaAdmin.email);
  } catch (e) { console.error('Erro ao recriar Admin Tomada:', e.message); }

  // 3. Limpar arquivos JSON locais
  const DATA_DIR = path.join(__dirname, 'data');
  const emptyJSON = (filename, content = []) => {
    const jsonPath = path.join(DATA_DIR, filename);
    const dbPath = path.join(DATA_DIR, filename.replace('.json', '.db'));
    fs.writeFileSync(jsonPath, JSON.stringify(content, null, 2), 'utf-8');
    if (fs.existsSync(dbPath)) {
      fs.writeFileSync(dbPath, JSON.stringify(content, null, 2), 'utf-8');
    }
  };

  emptyJSON('padeiros.json', []);
  emptyJSON('colaboradores.json', []);
  emptyJSON('atividades.json', []);
  emptyJSON('cronograma.json', []);
  emptyJSON('avaliacoes.json', []);
  emptyJSON('metas.json', []);

  const hash = await bcrypt.hash('Tomada123', 10);
  emptyJSON('admin.json', [{
    id: 'admin-tomada-001',
    nome: 'Tomada',
    email: 'admin@tomada.com',
    passwordHash: hash,
    role: 'admin',
    ativo: true
  }]);

  console.log('✅ Arquivos JSON e .db limpos (apenas o admin Tomada mantido).');
  await prisma.$disconnect();
}

clean().catch(console.error);
