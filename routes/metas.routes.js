const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/metas.controller');
const { authMiddleware, adminOnly } = require('../middleware/auth');

router.get('/producao', authMiddleware, ctrl.getMetasProducao);
router.get('/ferramentas', authMiddleware, ctrl.listFerramentas);
router.post('/ferramentas', authMiddleware, ctrl.createFerramenta);
router.post('/:id/aporte', authMiddleware, ctrl.addAporte);

router.get('/', authMiddleware, ctrl.listMetas);
router.post('/', authMiddleware, ctrl.createMeta);
router.put('/:id', authMiddleware, ctrl.updateMeta);
router.delete('/reset/all', authMiddleware, adminOnly, ctrl.resetAllMetas);
router.delete('/:id', authMiddleware, ctrl.deleteMeta);

module.exports = router;
