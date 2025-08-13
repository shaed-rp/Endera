const http = require('http');

// Test health endpoint
const testHealth = () => {
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/health',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`Health endpoint status: ${res.statusCode}`);
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Health endpoint response:', JSON.parse(data));
    });
  });

  req.on('error', (e) => {
    console.error('Health endpoint error:', e.message);
  });

  req.end();
};

// Test Supabase connection endpoint
const testSupabase = () => {
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/test',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`\nTest endpoint status: ${res.statusCode}`);
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Test endpoint response:', JSON.parse(data));
    });
  });

  req.on('error', (e) => {
    console.error('Test endpoint error:', e.message);
  });

  req.end();
};

// Run tests
console.log('Testing API endpoints...\n');
testHealth();
setTimeout(testSupabase, 1000);

