const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');

const auth = {};

auth.renderLogin = (req, res) => {
    if (req.isAuthenticated()) {
        req.flash('error', 'Already logged in.');
        return res.redirect('/myworks');
    }
    res.render('auth/login');
}

auth.authenticateLocal = passport.authenticate('local', {failureFlash: true, failureRedirect:'/auth/login'});

auth.login = (req, res) => {
    req.flash('success', 'Welcome back!')
    let redirectUrl = '/myworks';
    if (req.session.returnTo) {
        redirectUrl = (req.session.returnTo.method === 'GET') ? req.session.returnTo.url : req.session.returnTo.base;
    }
    if (redirectUrl === '/auth/register') {
        redirectUrl = '/myworks';
    }
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

auth.logout = (req, res, next) => {
    req.logout();
    req.flash('success', 'Succesfully signed out.');
    let redirectUrl = '/stories';
    if (req.session.returnTo) {
        redirectUrl = (req.session.returnTo.method === 'GET') ? req.session.returnTo.url : req.session.returnTo.base;
    }
    return res.redirect(redirectUrl);
}

auth.renderRegister = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.render('auth/register');
    }
    req.logout();
    req.flash('error', 'Signed Out');
    res.redirect('/auth/register');
}

auth.register = catchAsync(async (req, res, next) => {
    const {email, username, password} = req.body;
    const user = new User({email, username});
    User.register(user, password)
    .then(user => {
        req.login(user, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Weeabrary!');
            res.redirect('/stories');
        });
    })
    .catch(err => {
        return next(err);
    })
})

module.exports.auth = auth;