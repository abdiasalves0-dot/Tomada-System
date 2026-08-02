const https = require('https');
const url = require('url');
require('dotenv').config();

const ZAPSIGN_TOKEN = process.env.ZAPSIGN_TOKEN || '24375006-6190-4f65-8170-d83bf0faa6d6b5a10ccd-c164-4393-bf4d-59c411e6a7de';

console.log('Testing connection to ZapSign...');
console.log('Token (truncated):', ZAPSIGN_TOKEN.substring(0, 10) + '...');

const options = {
  hostname: 'api.zapsign.com.br',
  port: 443,
  path: '/api/v1/docs/',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${ZAPSIGN_TOKEN}`
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('HTTP Status Code:', res.statusCode);
    try {
      const parsed = JSON.parse(data);
      if (res.statusCode === 200) {
        console.log('✅ Connection Successful! Verified credentials on ZapSign.');
        console.log('Documents Count / Info:', Array.isArray(parsed) ? parsed.length : parsed);
      } else {
        console.error('❌ Error response from ZapSign:', parsed);
      }
    } catch (e) {
      console.error('❌ Response is not valid JSON:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Connection error:', e);
});

req.end();
