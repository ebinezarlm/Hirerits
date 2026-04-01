/**
 * Custom server: serves static dist/ and CMS API for admin.
 * Run after `npm run build`. Set ADMIN_PASSWORD and ADMIN_SECRET in .env.
 */
require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 4321;
const DIST = path.join(__dirname, 'dist');
const DATA_DIR = path.join(__dirname, 'data');
const UPLOAD_DIR = path.join(__dirname, 'public', 'uploads');
const COOKIE_NAME = 'hire_ritz_admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';
const SECRET = process.env.ADMIN_SECRET || 'change-me-in-production';
const COLLECTIONS = ['testimonials', 'metrics', 'industries'];

function getDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    const srcData = path.join(__dirname, 'src', 'data');
    if (fs.existsSync(srcData)) {
      fs.readdirSync(srcData).forEach((name) => {
        if (name.endsWith('.json')) {
          const dest = path.join(DATA_DIR, name);
          if (!fs.existsSync(dest)) {
            fs.copyFileSync(path.join(srcData, name), dest);
          }
        }
      });
    }
  }
  return DATA_DIR;
}

function readCollection(collection) {
  const filePath = path.join(getDataDir(), `${collection}.json`);
  if (!fs.existsSync(filePath)) {
    const fallback = path.join(__dirname, 'src', 'data', `${collection}.json`);
    if (fs.existsSync(fallback)) {
      return JSON.parse(fs.readFileSync(fallback, 'utf-8'));
    }
    return collection === 'metrics' ? {} : [];
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function writeCollection(collection, data) {
  const filePath = path.join(getDataDir(), `${collection}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

function getItemById(collection, id) {
  const data = readCollection(collection);
  if (collection === 'metrics') return data && typeof data === 'object' && !Array.isArray(data) ? data : null;
  if (!Array.isArray(data)) return null;
  const item = data.find((x) => String(x.id) === String(id));
  return item ?? null;
}

function setItemById(collection, id, payload) {
  if (collection === 'metrics') {
    const data = readCollection(collection) || {};
    const merged = { ...data, ...payload };
    writeCollection(collection, merged);
    return true;
  }
  const data = readCollection(collection) || [];
  const index = id != null ? data.findIndex((x) => String(x.id) === String(id)) : -1;
  const nextId = index >= 0 ? data[index].id : Math.max(0, ...data.map((x) => Number(x.id) || 0)) + 1;
  const newItem = { ...(index >= 0 ? data[index] : {}), ...payload, id: nextId };
  if (index >= 0) data[index] = newItem;
  else data.push(newItem);
  writeCollection(collection, data);
  return true;
}

function deleteItemById(collection, id) {
  if (collection === 'metrics') return false;
  const data = readCollection(collection) || [];
  const filtered = data.filter((x) => String(x.id) !== String(id));
  if (filtered.length === data.length) return false;
  writeCollection(collection, filtered);
  return true;
}

function sign(payload) {
  return crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
}

function createToken() {
  const exp = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const payload = JSON.stringify({ exp });
  const b64 = Buffer.from(payload).toString('base64url');
  return `${b64}.${sign(b64)}`;
}

function isAuthenticated(req) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return false;
  try {
    const [payloadB64, sig] = token.split('.');
    if (!payloadB64 || !sig) return false;
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8'));
    if (payload.exp < Date.now()) return false;
    const expected = sign(payloadB64);
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
  } catch {
    return false;
  }
}

function requireAuth(req, res, next) {
  if (!isAuthenticated(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

app.use(express.json());
app.use(cookieParser());
app.use(express.static(DIST));
app.use('/uploads', express.static(UPLOAD_DIR));

// Auth
app.post('/api/auth/login', (req, res) => {
  const password = (req.body?.password ?? '').trim();
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ ok: false, error: 'Invalid password' });
  }
  res.cookie(COOKIE_NAME, createToken(), {
    path: '/',
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60,
    secure: process.env.NODE_ENV === 'production',
  });
  res.json({ ok: true });
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME, { path: '/' });
  res.json({ ok: true });
});

app.get('/api/auth/session', (req, res) => {
  res.json({ ok: isAuthenticated(req) });
});

// CMS
app.get('/api/cms/:collection', requireAuth, (req, res) => {
  const { collection } = req.params;
  if (!COLLECTIONS.includes(collection)) return res.status(404).json({ error: 'Not found' });
  res.json(readCollection(collection));
});

app.post('/api/cms/:collection', requireAuth, (req, res) => {
  const { collection } = req.params;
  if (!COLLECTIONS.includes(collection)) return res.status(404).json({ error: 'Not found' });
  const ok = setItemById(collection, req.body?.id ?? null, req.body || {});
  res.json({ ok });
});

app.get('/api/cms/:collection/:id', requireAuth, (req, res) => {
  const { collection, id } = req.params;
  if (!COLLECTIONS.includes(collection)) return res.status(404).json({ error: 'Not found' });
  const item = getItemById(collection, id);
  if (item == null) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

app.put('/api/cms/:collection/:id', requireAuth, (req, res) => {
  const { collection, id } = req.params;
  if (!COLLECTIONS.includes(collection)) return res.status(404).json({ error: 'Not found' });
  const { id: _omit, ...body } = req.body || {};
  const ok = setItemById(collection, id, body);
  res.json({ ok });
});

app.delete('/api/cms/:collection/:id', requireAuth, (req, res) => {
  const { collection, id } = req.params;
  if (!COLLECTIONS.includes(collection)) return res.status(404).json({ error: 'Not found' });
  const ok = deleteItemById(collection, id);
  res.json({ ok });
});

// Upload
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
const upload = multer({ dest: UPLOAD_DIR, limits: { fileSize: 50 * 1024 * 1024 } });
app.post('/api/upload', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  const ext = path.extname(req.file.originalname) || '';
  const newName = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}${ext}`;
  const newPath = path.join(UPLOAD_DIR, newName);
  fs.renameSync(req.file.path, newPath);
  res.json({ ok: true, url: `/uploads/${newName}` });
});

// Fallback for admin edit URLs not prerendered (e.g. new item id)
app.get('/admin/cms/:collection/:id', (req, res, next) => {
  const editPage = path.join(DIST, 'admin', 'cms', req.params.collection, 'new', 'index.html');
  const fallback = path.join(DIST, 'admin', 'cms', req.params.collection, 'index.html');
  if (fs.existsSync(editPage)) {
    return res.sendFile(editPage);
  }
  if (fs.existsSync(fallback)) {
    return res.sendFile(fallback);
  }
  next();
});

// SPA fallback: serve index for non-file admin routes
app.get('/admin*', (req, res, next) => {
  const p = path.join(DIST, req.path, 'index.html');
  if (fs.existsSync(p)) return res.sendFile(p);
  next();
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Admin: http://localhost:${PORT}/admin`);
});
