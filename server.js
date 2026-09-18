/* ==========================================================================
   PORTOFOLIO LOCAL SERVER WITH DIRECT FILE STORAGE - SERVER.JS
   Uses Pure Node.js Standard Library (No external npm packages required)
   Saves uploaded images directly into assets/projects & assets/certificates
   Saves portfolio database into data/portfolio.json
   ========================================================================== */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;
const ASSETS_DIR = path.join(ROOT_DIR, 'assets');
const DATA_FILE = path.join(ROOT_DIR, 'data', 'portfolio.json');

// Ensure directories exist
['projects', 'certificates'].forEach(dir => {
  const targetDir = path.join(ASSETS_DIR, dir);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
});
if (!fs.existsSync(path.join(ROOT_DIR, 'data'))) {
  fs.mkdirSync(path.join(ROOT_DIR, 'data'), { recursive: true });
}

// MIME types dictionary
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

const server = http.createServer((req, res) => {
  // CORS Headers for seamless local access
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // --- API ROUTE 1: UPLOAD GAMBAR LANGSUNG KE ASSETS/ ---
  if (req.method === 'POST' && pathname === '/api/upload') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      // Safeguard against gigantic payload (> 30MB)
      if (body.length > 35 * 1024 * 1024) {
        res.writeHead(413, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Ukuran file melebihi batas 30MB' }));
        req.destroy();
      }
    });

    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const folderType = (payload.type === 'certificates') ? 'certificates' : 'projects';
        const originalName = payload.filename || 'upload.png';
        const base64Data = payload.base64;

        if (!base64Data) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Data base64 tidak ditemukan' }));
          return;
        }

        // Extract base64 image data
        const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        let ext = path.extname(originalName).toLowerCase() || '.png';
        let buffer;

        if (matches && matches.length === 3) {
          const mimeType = matches[1];
          if (mimeType.includes('jpeg') || mimeType.includes('jpg')) ext = '.jpg';
          else if (mimeType.includes('webp')) ext = '.webp';
          else if (mimeType.includes('png')) ext = '.png';
          else if (mimeType.includes('pdf')) ext = '.pdf';
          buffer = Buffer.from(matches[2], 'base64');
        } else {
          buffer = Buffer.from(base64Data, 'base64');
        }

        // Create clean, unique file name
        const cleanName = path.basename(originalName, path.extname(originalName))
          .replace(/[^a-zA-Z0-9_-]/g, '-')
          .toLowerCase();
        const savedFileName = `${Date.now()}-${cleanName}${ext}`;
        const savePath = path.join(ASSETS_DIR, folderType, savedFileName);

        // Write file directly into assets folder!
        fs.writeFileSync(savePath, buffer);

        // Return relative path for web
        const relativeUrl = `assets/${folderType}/${savedFileName}`;
        console.log(`[Upload Berhasil] Disimpan ke: ${relativeUrl} (${buffer.length} bytes)`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          url: relativeUrl,
          filename: savedFileName
        }));
      } catch (err) {
        console.error('Error saat menyimpan upload:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // --- API ROUTE 2: SIMPAN DATA PORTOFOLIO KE DATA/PORTFOLIO.JSON ---
  if (req.method === 'POST' && pathname === '/api/save-portfolio') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
        console.log('[Data Tersimpan] data/portfolio.json berhasil diperbarui');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // --- API ROUTE 3: BACA DATA PORTOFOLIO DARI DATA/PORTFOLIO.JSON ---
  if (req.method === 'GET' && pathname === '/api/portfolio') {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf8');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(content);
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'File data/portfolio.json belum ada' }));
    }
    return;
  }

  // --- API ROUTE 4: SIMPAN PESAN KONTAK KE DATA/MESSAGES.JSON ---
  if (req.method === 'POST' && pathname === '/api/contact') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const msg = JSON.parse(body);
        const messagesFile = path.join(ROOT_DIR, 'data', 'messages.json');
        let messages = [];
        if (fs.existsSync(messagesFile)) {
          try {
            messages = JSON.parse(fs.readFileSync(messagesFile, 'utf8'));
          } catch (e) { messages = []; }
        }

        const newEntry = {
          id: 'msg-' + Date.now(),
          timestamp: new Date().toISOString(),
          name: msg.name || 'Anonymous',
          email: msg.email || '',
          message: msg.message || ''
        };

        messages.unshift(newEntry);
        fs.writeFileSync(messagesFile, JSON.stringify(messages, null, 2), 'utf8');
        console.log(`[Pesan Masuk] Dari: ${newEntry.name} (${newEntry.email})`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Pesan berhasil disimpan' }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // --- STATIC FILE SERVING (index.html, css, js, assets, etc.) ---
  let decodedPathname = pathname;
  try {
    decodedPathname = decodeURIComponent(pathname);
  } catch (e) {
    decodedPathname = pathname;
  }

  let safePath = path.normalize(decodedPathname).replace(/^(\.\.[\/\\])+/, '');
  if (safePath === '/' || safePath === '\\') {
    safePath = 'index.html';
  }

  const filePath = path.join(ROOT_DIR, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found: ' + pathname);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;

      if (start >= stats.size || end >= stats.size || start > end) {
        res.writeHead(416, { 'Content-Range': `bytes */${stats.size}` });
        res.end();
        return;
      }

      const chunkSize = (end - start) + 1;
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${stats.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': contentType
      });

      const stream = fs.createReadStream(filePath, { start, end });
      stream.pipe(res);
      return;
    }

    const headers = {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Accept-Ranges': 'bytes'
    };

    res.writeHead(200, headers);
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Portofolio Web Server Aktif di: http://localhost:${PORT}`);
  console.log(`📁 Upload file otomatis tersimpan ke folder assets/`);
  console.log(`💾 Data portofolio tersimpan ke data/portfolio.json`);
  console.log(`====================================================`);
});
