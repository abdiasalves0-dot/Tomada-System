const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/orcamentos.controller');
const { authMiddleware, adminOnly } = require('../middleware/auth');

router.get('/', authMiddleware, ctrl.listOrcamentos);
router.post('/', authMiddleware, adminOnly, ctrl.createOrcamento);
router.put('/:id', authMiddleware, adminOnly, ctrl.updateOrcamento);
router.delete('/:id', authMiddleware, adminOnly, ctrl.deleteOrcamento);

module.exports = router;
