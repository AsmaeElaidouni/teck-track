const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// ── Storage config ────────────────────────────────────────────────────────────
const uploadDir = path.join(__dirname, '../../uploads/library');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
        cb(null, `${Date.now()}_${safe}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB max (pour les vidéos MP4)
    fileFilter: (req, file, cb) => {
        const allowed = ['.pdf', '.png', '.jpg', '.jpeg', '.mp4', '.docx', '.doc'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) cb(null, true);
        else cb(new Error('Format non autorisé: seuls PDF, PNG, JPG, MP4, DOCX sont acceptés'));
    }
});

// ── In-memory store (persists while server is alive) ─────────────────────────
// On reload we rebuild from disk
let documents = [];

const syncFromDisk = () => {
    try {
        const metaPath = path.join(uploadDir, 'meta.json');
        if (fs.existsSync(metaPath)) {
            documents = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
        }
    } catch { documents = []; }
};
syncFromDisk();

const saveMeta = () => {
    const metaPath = path.join(uploadDir, 'meta.json');
    fs.writeFileSync(metaPath, JSON.stringify(documents, null, 2));
};

// ── GET /api/library — list all docs ─────────────────────────────────────────
router.get('/', authMiddleware, (req, res) => {
  // Recharger le meta.json à chaque requête pour être sûr
  syncFromDisk();
  res.json(documents);
});

// ── POST /api/library — upload doc (admin only) ───────────────────────────────
router.post('/', authMiddleware, adminMiddleware, upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'Aucun fichier reçu.' });

    const { title, machine } = req.body;
    const ext = path.extname(req.file.originalname).toLowerCase();
    const typeMap = { '.pdf': 'PDF', '.png': 'Image', '.jpg': 'Image', '.jpeg': 'Image', '.mp4': 'Vidéo', '.docx': 'Doc', '.doc': 'Doc' };

    const doc = {
        id: Date.now(),
        title: title || req.file.originalname,
        machine: machine || 'Général',
        type: typeMap[ext] || 'Doc',
        size: `${(req.file.size / 1024 / 1024).toFixed(1)} MB`,
        filename: req.file.filename,
        originalName: req.file.originalname,
        uploadedAt: new Date().toISOString()
    };

    documents.unshift(doc);
    saveMeta();
    res.status(201).json(doc);
});

// ── GET /api/library/:filename/download — stream file ────────────────────────
router.get('/:filename/download', authMiddleware, (req, res) => {
    const filePath = path.join(uploadDir, req.params.filename);
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'Fichier introuvable.' });
    res.download(filePath);
});

// ── DELETE /api/library/:id — admin only ──────────────────────────────────────
router.delete('/:id', authMiddleware, adminMiddleware, (req, res) => {
    const id = parseInt(req.params.id);
    const idx = documents.findIndex(d => d.id === id);
    if (idx === -1) return res.status(404).json({ message: 'Document non trouvé.' });

    const doc = documents[idx];
    const filePath = path.join(uploadDir, doc.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    documents.splice(idx, 1);
    saveMeta();
    res.json({ message: 'Document supprimé.' });
});

module.exports = router;
