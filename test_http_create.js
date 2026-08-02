// Test HTTP POST to create a client via the running server
const http = require('http');

const data = JSON.stringify({
  nome: 'Test Debug HTTP',
  receita: 1000,
  custoInsumos: 500,
  endereco: 'Rua Test',
  estado: 'SP',
  bairro: 'Centro'
});

// First, login to get a token
const loginData = JSON.stringify({ email: 'admin@bancada.com', senha: '123456' });

const loginReq = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/login',
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(loginData) }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('Login response:', res.statusCode, body);
    
    let token;
    try {
      token = JSON.parse(body).token;
    } catch(e) {
      console.log('Login failed, trying without auth...');
      // Try without token to see the error
      makeClienteRequest('fake-token');
      return;
    }
    
    if (token) {
      makeClienteRequest(token);
    } else {
      console.log('No token received. Response:', body);
    }
  });
});
loginReq.write(loginData);
loginReq.end();

function makeClienteRequest(token) {
  console.log('\nCreating client with token:', token.substring(0, 20) + '...');
  
  const req = http.request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/clientes',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data),
      'Authorization': `Bearer ${token}`
    }
  }, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      console.log('Create client status:', res.statusCode);
      console.log('Create client body:', body);
    });
  });
  
  req.on('error', (e) => {
    console.error('Request error:', e.message);
  });
  
  req.write(data);
  req.end();
}
