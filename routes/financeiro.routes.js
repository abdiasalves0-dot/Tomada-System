const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/financeiro.controller');
const { authMiddleware, adminOnly } = require('../middleware/auth');

router.get('/stats', authMiddleware, adminOnly, ctrl.getFinanceiroStats);

module.exports = router;
