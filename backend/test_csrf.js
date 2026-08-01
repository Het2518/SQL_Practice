const app = require('./server'); // This starts the server
const http = require('http');

setTimeout(() => {
  http.get('http://localhost:5000/api/auth/csrf', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('STATUS:', res.statusCode);
      console.log('HEADERS:', res.headers);
      console.log('BODY:', data);
      process.exit(0);
    });
  }).on('error', (err) => {
    console.error('Error:', err.message);
    process.exit(1);
  });
}, 2000);
