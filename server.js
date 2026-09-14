import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { apiMiddleware } from './server-api.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json());
app.use(apiMiddleware);

const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`WorkBloom server running on http://0.0.0.0:${PORT}`);
});
