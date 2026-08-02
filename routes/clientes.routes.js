const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/clientes.controller');
const statsCtrl = require('../controllers/clientes-stats.controller');
const { authMiddleware, adminOnly } = require('../middleware/auth');

// Stats route MUST come before /:id to avoid route conflict
router.get('/stats', authMiddleware, statsCtrl.getClientesStats);

router.get('/', authMiddleware, ctrl.listClientes);
router.post('/', authMiddleware, adminOnly, ctrl.createCliente);
router.put('/:id', authMiddleware, adminOnly, ctrl.updateCliente);
router.delete('/:id', authMiddleware, adminOnly, ctrl.deleteCliente);

module.exports = router;
