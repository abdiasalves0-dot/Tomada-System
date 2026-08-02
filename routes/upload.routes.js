const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/upload.controller');
const { authMiddleware } = require('../middleware/auth');
const upload = require('../config/multer');

router.post('/:type', authMiddleware, (req, res, next) => {
  console.log(`[UPLOAD DEBUG] Iniciando upload. Tipo: ${req.params.type}`);
  next();
}, upload.array('files', 10), ctrl.uploadFiles);

router.post('/base64/:type', authMiddleware, ctrl.uploadBase64);

// Rota de proxy para servir arquivos do Google Drive
router.get('/file/:fileId', ctrl.serveFile);

// Rotas públicas para download e atualização de APK
router.get('/apk/latest', ctrl.getLatestApk);
router.get('/apk/download/:fileId', ctrl.downloadApk);

module.exports = router;
