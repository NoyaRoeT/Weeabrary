const express = require('express');
const router = express.Router();
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');

router.get('/register', (req, res) => {
    res.render('auth/register');
})


router.post('/register', catchAsync(async (req, res) => {
    const {email, username, password} = req.body;
    const user = new User({email, username});
    User.register(user, password)
    .then(user => {
        req.flash('success', 'Welcome to Weeabrary!');
        res.redirect('/stories');
    })
    .catch(err => {
        console.log(err.message);
        req.flash('error', err.message);
        res.redirect('/auth/register');
    })
}))

router.get('/login', (req, res) => {
    res.render('auth/login');
})

const authenticateLocal = passport.authenticate('local', {failureFlash: true, failureRedirect:'/auth/login'});
router.post('/login', authenticateLocal, (req, res) => {
    req.flash('success', 'Welcome back!')
    res.redirect('/stories');
})

module.exports = router;