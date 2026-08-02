const express = require('express');
const router = express.Router();
const { authMiddleware, adminOnly } = require('../middleware/auth');
const upload = require('../config/multer');

function getCtrl() {
  delete require.cache[require.resolve('../controllers/youtube.controller')];
  return require('../controllers/youtube.controller');
}

// Rotas públicas ou com tratamento especial
router.get('/auth', (req, res, next) => getCtrl().auth(req, res, next));
router.get('/callback', (req, res, next) => getCtrl().callback(req, res, next));

// Rotas protegidas que exigem login e papel de admin/gestor
router.get('/status', authMiddleware, adminOnly, (req, res, next) => getCtrl().status(req, res, next));
router.get('/stats', authMiddleware, adminOnly, (req, res, next) => getCtrl().stats(req, res, next));
router.post('/simulate', authMiddleware, adminOnly, (req, res, next) => getCtrl().simulate(req, res, next));
router.post('/disconnect', authMiddleware, adminOnly, (req, res, next) => getCtrl().disconnect(req, res, next));
router.get('/canal-sugestoes', authMiddleware, adminOnly, (req, res, next) => getCtrl().obterSugestoesCanal(req, res, next));
router.post('/gerar-texto-ia', authMiddleware, adminOnly, (req, res, next) => getCtrl().gerarTextoIA(req, res, next));
router.get('/gerar-pdf-tendencias', authMiddleware, adminOnly, (req, res, next) => getCtrl().gerarPDFTendencias(req, res, next));
router.get('/download-pdf-tendencias', (req, res, next) => getCtrl().downloadPDFTendencias(req, res, next));

// Descobrir Canais
router.get('/search', authMiddleware, adminOnly, (req, res, next) => getCtrl().searchChannels(req, res, next));

// Baixador de Vídeos do YouTube
router.get('/video-info', (req, res, next) => getCtrl().getVideoInfo(req, res, next));
router.post('/process-download', (req, res, next) => getCtrl().processDownload(req, res, next));
router.get('/stream-download', (req, res, next) => getCtrl().streamDownload(req, res, next));

// Recomendação de Conteúdo por Nicho com IA + YouTube API
router.get('/recomendacoes', (req, res, next) => getCtrl().obterRecomendacoesNicho(req, res, next));

// Gerar Roteiro Completo de Vídeo com IA Gemini
router.post('/gerar-roteiro', (req, res, next) => getCtrl().gerarRoteiroVideo(req, res, next));

// Gerar Pacote de SEO Completo de Vídeo com IA Gemini
router.post('/gerar-seo', (req, res, next) => getCtrl().gerarSEOVideo(req, res, next));

// Analisar Áudio/Vídeo MP3/MP4 para SEO Falado Multimodal
router.post('/analisar-audio-seo', upload.single('file'), (req, res, next) => getCtrl().analisarAudioSEO(req, res, next));

module.exports = router;
