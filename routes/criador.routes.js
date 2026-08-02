const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/criador.controller');
const { authMiddleware } = require('../middleware/auth');

// Autenticação
router.post('/registro', ctrl.registro);
router.post('/login', ctrl.login);

// Projetos
router.post('/projetos', authMiddleware, ctrl.criarProjeto);
router.get('/projetos', authMiddleware, ctrl.listarProjetos);
router.get('/projetos/:id', authMiddleware, ctrl.detalharProjeto);
router.delete('/projetos/:id', authMiddleware, ctrl.deletarProjeto);
router.put('/projetos/:id/vincular', authMiddleware, ctrl.vincularProfissional);

// Recomendações
const ytCtrl = require('../controllers/youtube.controller');
router.get('/recomendacoes', ytCtrl.obterRecomendacoesNicho);

module.exports = router;
