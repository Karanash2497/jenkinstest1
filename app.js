const express = require('express');
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  res.send(`
    <html>
      <body style="font-family:Arial; text-align:center; padding:50px; background:#f0f4f8">
        <h1>🐳 Docker CI/CD App</h1>
        <p>Deployed automatically via Jenkins + Docker pipeline!</p>
        <p style="color:green"><b>Status: Live</b></p>
        <p>Build: ${process.env.BUILD_NUMBER || 'local'}</p>
        <p>Time: ${new Date().toLocaleString()}</p>
      </body>
    </html>
  `);
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', build: process.env.BUILD_NUMBER || 'local', timestamp: new Date() });
});

app.listen(PORT, () => console.log(`App running on port ${PORT}`));
module.exports = app;
