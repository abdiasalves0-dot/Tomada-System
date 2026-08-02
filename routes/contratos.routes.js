const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/contratos.controller');
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, ctrl.listContratos);
router.post('/', authMiddleware, ctrl.createContrato);
router.get('/colaborador/template', authMiddleware, ctrl.colaboradorTemplate);
router.post('/colaborador', authMiddleware, ctrl.createColaboradorContrato);
router.post('/:id/reminder', authMiddleware, ctrl.resendReminder);
router.put('/:id/cancel', authMiddleware, ctrl.cancelContrato);
router.post('/webhook', ctrl.webhookContrato); // Rota pública da ZapSign (sem authMiddleware)

module.exports = router;
