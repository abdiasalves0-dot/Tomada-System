const ctrl = require('./controllers/cronograma.controller');
const { Cronograma } = require('./data/db-adapter');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runTests() {
  // 1. Fetch or create a test task
  let task = await prisma.cronograma.findFirst();
  if (!task) {
    // Let's find a padeiro first
    const pad = await prisma.padeiro.findFirst();
    if (!pad) {
      console.log('No Padeiro found, cannot run integration test');
      return;
    }
    task = await prisma.cronograma.create({
      data: {
        padeiroId: pad.id,
        data: '2026-06-17',
        status: 'pendente',
        checklist: [
          { text: 'Item 1', done: false },
          { text: 'Item 2', done: false },
          { text: 'Item 3', done: false }
        ]
      }
    });
  }

  const id = task.id;
  console.log('Using task ID:', id);

  // Fetch list IDs
  const listas = await prisma.kanbanList.findMany({ orderBy: { posicao: 'asc' } });
  const cList = listas.find(l => l.titulo.toLowerCase().includes('conclu'));
  const eList = listas.find(l => l.titulo.toLowerCase().includes('andamento'));
  const pList = listas.find(l => l.titulo.toLowerCase().includes('pendente'));
  const cId = cList ? cList.id : null;
  const eId = eList ? eList.id : null;
  const pId = pList ? pList.id : null;

  // Helper mock response
  const mockRes = () => {
    const res = {};
    res.status = (code) => {
      res.statusCode = code;
      return res;
    };
    res.json = (data) => {
      res.jsonData = data;
      return res;
    };
    return res;
  };

  // Test Case 1: Start with unchecked checklist in Pendente
  console.log('\n--- TEST CASE 1: Reset task to Pendente ---');
  await Cronograma.findByIdAndUpdate(id, {
    status: 'pendente',
    kanbanListId: pId,
    progresso: 0,
    checklist: [
      { text: 'Item 1', done: false },
      { text: 'Item 2', done: false },
      { text: 'Item 3', done: false }
    ]
  });

  // Test Case 2: Complete all checklist items (simulate checking them)
  console.log('\n--- TEST CASE 2: Complete checklist ---');
  let req = {
    params: { id },
    body: {
      checklist: [
        { text: 'Item 1', done: true },
        { text: 'Item 2', done: true },
        { text: 'Item 3', done: true }
      ]
    }
  };
  let res = mockRes();
  await ctrl.updateTarefa(req, res);
  console.log('Resulting status:', res.jsonData.status);
  console.log('Resulting progress:', res.jsonData.progresso);
  console.log('Resulting list ID:', res.jsonData.kanbanListId);
  if (res.jsonData.status === 'concluida' && res.jsonData.kanbanListId === cId) {
    console.log('✅ PASS: Auto-moved to Concluída');
  } else {
    console.log('❌ FAIL');
  }

  // Test Case 3: Uncheck an item (simulate unchecking)
  console.log('\n--- TEST CASE 3: Uncheck one item ---');
  req = {
    params: { id },
    body: {
      checklist: [
        { text: 'Item 1', done: true },
        { text: 'Item 2', done: true },
        { text: 'Item 3', done: false }
      ]
    }
  };
  res = mockRes();
  await ctrl.updateTarefa(req, res);
  console.log('Resulting status:', res.jsonData.status);
  console.log('Resulting progress:', res.jsonData.progresso);
  console.log('Resulting list ID:', res.jsonData.kanbanListId);
  if (res.jsonData.status === 'em_andamento' && res.jsonData.kanbanListId === eId) {
    console.log('✅ PASS: Reverted to em_andamento and Em Andamento list');
  } else {
    console.log('❌ FAIL');
  }

  // Test Case 4: Drag card to Concluída (simulate drag)
  console.log('\n--- TEST CASE 4: Drag card to Concluída ---');
  req = {
    params: { id },
    body: {
      kanbanListId: cId
    }
  };
  res = mockRes();
  await ctrl.updateTarefa(req, res);
  console.log('Resulting status:', res.jsonData.status);
  console.log('Resulting progress:', res.jsonData.progresso);
  console.log('Checklist items done:', res.jsonData.checklist.every(item => item.done));
  if (res.jsonData.status === 'concluida' && res.jsonData.checklist.every(item => item.done)) {
    console.log('✅ PASS: Auto-checked all items');
  } else {
    console.log('❌ FAIL');
  }

  // Test Case 5: Drag card out of Concluída (simulate drag back to Pendente)
  console.log('\n--- TEST CASE 5: Drag card out of Concluída ---');
  req = {
    params: { id },
    body: {
      kanbanListId: pId
    }
  };
  res = mockRes();
  await ctrl.updateTarefa(req, res);
  console.log('Resulting status:', res.jsonData.status);
  console.log('Resulting progress:', res.jsonData.progresso);
  console.log('Checklist items:', res.jsonData.checklist);
  const checklist = res.jsonData.checklist;
  if (res.jsonData.status === 'pendente' && checklist[checklist.length - 1].done === false) {
    console.log('✅ PASS: Reverted to pendente and last item unchecked');
  } else {
    console.log('❌ FAIL');
  }

  // Test Case 7: Mark only the last checklist item done (simulate auto-conclude)
  console.log('\n--- TEST CASE 7: Mark only the last checklist item done ---');
  await Cronograma.findByIdAndUpdate(id, {
    status: 'em_andamento',
    kanbanListId: eId,
    progresso: 17,
    checklist: [
      { text: 'Cliente aprovar orçamento', done: true },
      { text: 'comprar os materiais', done: false },
      { text: 'organizar o projeto tipo fazaer tal parte', done: false },
      { text: 'fabricação', done: false },
      { text: 'montagem:', done: false },
      { text: 'montagem entrega na casa do cliente', done: false }
    ]
  });

  req = {
    params: { id },
    body: {
      checklist: [
        { text: 'Cliente aprovar orçamento', done: true },
        { text: 'comprar os materiais', done: false },
        { text: 'organizar o projeto tipo fazaer tal parte', done: false },
        { text: 'fabricação', done: false },
        { text: 'montagem:', done: false },
        { text: 'montagem entrega na casa do cliente', done: true }
      ]
    }
  };
  res = mockRes();
  await ctrl.updateTarefa(req, res);
  console.log('Resulting status:', res.jsonData.status);
  console.log('Resulting list ID:', res.jsonData.kanbanListId);
  console.log('Resulting progress:', res.jsonData.progresso);
  console.log('Checklist items done:', res.jsonData.checklist.every(item => item.done));
  if (
    res.jsonData.status === 'concluida' &&
    res.jsonData.kanbanListId === cId &&
    res.jsonData.progresso === 100 &&
    res.jsonData.checklist.every(item => item.done)
  ) {
    console.log('✅ PASS: Auto-completion by last item works correctly');
  } else {
    console.log('❌ FAIL');
  }
}

runTests().catch(console.error);
