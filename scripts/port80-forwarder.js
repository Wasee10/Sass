const http = require('http');

const server = http.createServer((req, res) => {
  const target = `http://localhost:3000${req.url}`;
  console.log(`[Port 80 Forwarder] Redirecting ${req.url} -> ${target}`);
  res.writeHead(302, { Location: target });
  res.end();
});

server.listen(80, '127.0.0.1', () => {
  console.log('[Port 80 Forwarder] Active on http://localhost:80 -> forwarding to http://localhost:3000');
});

server.on('error', (err) => {
  console.warn('[Port 80 Forwarder Notice]', err.message);
});
