const express = require('express');
const serverless = require('serverless-http');
const app = express();

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/transcribe', async (req, res) => {
  // Your existing POST logic here
});

module.exports.handler = serverless(app);
