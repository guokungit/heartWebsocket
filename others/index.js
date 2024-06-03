// server.js (Node.js 端运行)
const WebSocket = require('ws');

const server = new WebSocket.Server({ port: 8080 });

server.on('connection', (ws) => {
  console.log('New client connected');

  ws.send('Welcome to the WebSocket server!');

  ws.on('message', (message) => {
    if (message === 'ping') {
      ws.send('pong');
    } else {
      console.log(`Received: ${message}`);
      ws.send(`Server received: ${message}`);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

console.log('WebSocket server is running on ws://localhost:8080');
