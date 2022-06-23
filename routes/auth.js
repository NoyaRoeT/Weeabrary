const express = require('express');
const router = express.Router();
const User = require('../models/user');

router.get('/register', (req, res) => {
    res.render('auth/register');
})

router.get('/login', (req, res) => {
    res.render('auth/login');
})

module.exports = router;