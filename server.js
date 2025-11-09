const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// URL do GAS — substitua pelo seu URL se necessário
const GAS_URL = process.env.GAS_URL || 'https://script.google.com/macros/s/AKfycbyGelso1gXJEKWBCDScAyVBGPp9ncWsuUjN8XS-Cd7R8xIH7p6PWEZo2eH-WZcs99yNaA/exec';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS preflight handler
app.options('/api/gas', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  return res.sendStatus(204);
});

// Proxy endpoint that forwards requests to the GAS URL
app.all('/api/gas', async (req, res) => {
  try {
    // Reconstruct target URL with query string
    const qs = req.originalUrl.split('?')[1] || '';
    const targetUrl = GAS_URL + (qs ? '?' + qs : '');

    const options = {
      method: req.method,
      headers: {
        'Content-Type': req.get('Content-Type') || 'application/json',
      },
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      options.body = JSON.stringify(req.body);
    }

    const response = await fetch(targetUrl, options);
    const text = await response.text();

    // Try to return JSON if possible
    try {
      const data = JSON.parse(text);
      res.setHeader('Content-Type', 'application/json');
      res.header('Access-Control-Allow-Origin', '*');
      return res.status(response.status).json(data);
    } catch (e) {
      res.header('Access-Control-Allow-Origin', '*');
      return res.status(response.status).send(text);
    }
  } catch (err) {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Proxy error', details: err.message });
  }
});

// Serve static build
const buildPath = path.join(__dirname, 'dist');
if (require('fs').existsSync(buildPath)) {
  app.use(express.static(buildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
