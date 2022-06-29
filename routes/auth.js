const express = require('express');
const router = express.Router();
const { setReturnTo } = require('../controllers/middleware');
const {auth} = require('../controllers/auth');

router.get('/login', auth.renderLogin);

router.post('/login', auth.authenticateLocal, auth.login);

router.get('/logout', auth.logout)

router.use(setReturnTo);

router.get('/register', auth.renderRegister)

router.post('/register', auth.register)

module.exports = router;