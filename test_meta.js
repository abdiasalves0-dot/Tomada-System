const { Meta } = require('./data/db-adapter');

async function test() {
  try {
    console.log("Creating meta using Meta.create()...");
    const result = await Meta.create({
      padeiroId: '5ff1af0f-a40d-4a8d-b915-fdb88bfdfa3d',
      tipo: 'faturamento',
      nome: null,
      metaKg: 500,
      periodo: '2026-06',
      observacao: 'Test Observation'
    });
    console.log("Meta created:", result);
  } catch (err) {
    console.error("Error with Meta.create():", err);
  }
}

test();
