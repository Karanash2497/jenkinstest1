const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const ENV = process.env.APP_ENV || 'production';

const colors = {
  dev: '#3B82F6',
  staging: '#F59E0B',
  production: '#10B981'
};

app.get('/', (req, res) => {
  res.send(`
    <html>
      <body style="font-family:Arial; text-align:center; padding:50px;
        background:${colors[ENV] || '#6B7280'}">
        <h1 style="color:white">🚀 ${ENV.toUpperCase()} Environment</h1>
        <p style="color:white">Deployed via Jenkins + Docker</p>
        <p style="color:white">Build: #${process.env.BUILD_NUMBER || 'local'}</p>
        <p style="color:white">Time: ${new Date().toLocaleString()}</p>
      </body>
    </html>
  `);
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: ENV,
    build: process.env.BUILD_NUMBER || 'local',
    timestamp: new Date()
  });
});

app.listen(PORT, () => console.log(`${ENV} app running on port ${PORT}`));
module.exports = app;
