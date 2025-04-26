const express = require('express');
const path = require('path');
const WebSocket = require('ws');
const { analyzeCode } = require('./analyzer');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// WebSocket Server
const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', (ws) => {
  console.log('New analyzer connection');
  
  ws.on('message', (message) => {
    try {
      const { code, requestId } = JSON.parse(message);
      const analysis = analyzeCode(code);
      ws.send(JSON.stringify({
        requestId,
        analysis
      }));
    } catch (err) {
      console.error('Analysis error:', err);
      ws.send(JSON.stringify({
        error: 'Failed to analyze code'
      }));
    }
  });
});

// HTTP Server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Upgrade HTTP to WebSocket
server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

// API Routes
app.post('/api/analyze', (req, res) => {
  try {
    const { code } = req.body;
    const analysis = analyzeCode(code);
    res.json(analysis);
  } catch (err) {
    res.status(500).json({ error: 'Analysis failed' });
  }
});
