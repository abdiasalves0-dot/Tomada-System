const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/auditoria.controller');
const { authMiddleware } = require('../middleware/auth');

router.get('/logs', authMiddleware, ctrl.getLogs);

module.exports = router;
