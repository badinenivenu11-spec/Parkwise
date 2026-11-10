const express = require('express');
const router = express.Router();
const { demoLogin, switchRole, getMe } = require('../controllers/authController');
const { demoAuth } = require('../middleware/demoAuth');

router.post('/demo-login', demoLogin);
router.put('/switch-role', switchRole);
router.get('/me', demoAuth, getMe);

module.exports = router;
