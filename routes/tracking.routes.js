const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/tracking.controller');
const { authMiddleware, adminOnly } = require('../middleware/auth');

router.get('/trail/:userId', authMiddleware, ctrl.getTrail);
router.delete('/trail/:userId', authMiddleware, adminOnly, ctrl.deleteTrail);
router.delete('/reset/all', authMiddleware, adminOnly, ctrl.resetAll);

module.exports = router;
