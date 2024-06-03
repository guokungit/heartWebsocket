const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Express 路由
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// WebSocket 连接事件
wss.on('connection', function connection(ws) {
  console.log('Client connected');
  // setInterval(()=>{ws.send('this is serves')},4000)
  ws.send('Receivedfdaf: ');
  ws.on('message', function incoming(message) {
    console.log('Received: %s', message);
    // 回复客户端收到的消息
    ws.send('pong');
  });
  ws.on('close', () => {
    console.log('Client disconnected');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

server.listen(8080, () => {
  console.log('Server started on ws://localhost:8080');
});
