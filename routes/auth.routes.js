const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/auth.controller');
const webauthn = require('../controllers/webauthn.controller');

router.post('/login', ctrl.login);
router.post('/google-login', ctrl.googleLogin);
router.post('/google-login-redirect', ctrl.googleLoginRedirect);
router.get('/google-login-callback', ctrl.googleLoginCallback);
router.get('/check-login-session', ctrl.checkLoginSession);
router.post('/register', ctrl.register);
router.post('/first-access', ctrl.firstAccess);
router.post('/set-password', ctrl.setPassword);
router.post('/update-role', ctrl.updateRole);
router.get('/pending-emails/:email', ctrl.getPendingEmails);

// WebAuthn 2FA endpoints
router.post('/webauthn/register-options', webauthn.registerOptions);
router.post('/webauthn/register-verify', webauthn.registerVerify);
router.post('/webauthn/login-options', webauthn.loginOptions);
router.post('/webauthn/login-verify', webauthn.loginVerify);

module.exports = router;
