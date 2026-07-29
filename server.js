import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));

// Route handler for MONETA Sistem page
app.get(['/sistem', '/sistem/', '/moneta-sistem', '/moneta-sistem/', '/moneta-sistiem', '/moneta-sistiem/'], (req, res) => {
  res.sendFile(path.join(__dirname, 'sistem.html'));
});

// Fallback to index.html for unknown HTML navigation routes
app.use((req, res) => {
  // If request path has an extension (e.g. .js, .css, .png, .jpg, .svg, .ico, etc), return 404
  if (path.extname(req.path)) {
    return res.status(404).type('text/plain').send('404 Not Found');
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`MONETA server running on http://0.0.0.0:${PORT}`);
});
