const https = require('https');
const url = require('url');
require('dotenv').config();

const ZAPSIGN_TOKEN = process.env.ZAPSIGN_TOKEN || '24375006-6190-4f65-8170-d83bf0faa6d6b5a10ccd-c164-4393-bf4d-59c411e6a7de';
const WEBHOOK_URL = 'https://bancada-kohl.vercel.app/api/contratos/webhook';

const endpoints = [
  'https://sandbox.zapsign.com.br/api/v1/user/company/webhook/',
  'https://api.zapsign.com.br/api/v1/user/company/webhook/'
];

async function registerWebhook(endpoint) {
  return new Promise((resolve, reject) => {
    const urlObj = url.parse(endpoint);
    const payload = JSON.stringify({ url: WEBHOOK_URL });

    const options = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ZAPSIGN_TOKEN}`,
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    console.log(`Enviando solicitação para ${urlObj.hostname}...`);

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.write(payload);
    req.end();
  });
}

async function run() {
  console.log(`🔗 Iniciando registro do webhook: ${WEBHOOK_URL}\n`);
  for (const endpoint of endpoints) {
    try {
      const response = await registerWebhook(endpoint);
      console.log(`Status HTTP: ${response.status}`);
      console.log('Resposta:', JSON.stringify(response.body, null, 2));
      console.log('-------------------------------------------');
    } catch (err) {
      console.error(`❌ Erro no endpoint ${endpoint}:`, err.message);
    }
  }
}

run();
