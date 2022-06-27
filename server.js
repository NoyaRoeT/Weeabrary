if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const expressLayouts = require('express-ejs-layouts');
const path = require('path')
const methodOverride = require('method-override');
const ExpressError = require('./utils/ExpressError');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');

// Routers
const indexRouter = require('./routes/index');
const storiesRouter = require('./routes/stories');
const myWorksRouter = require('./routes/my-works');
const authRouter = require('./routes/auth');

// Connecting to MongoDb
const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL)
    .then(() => {
        console.log('Connected to Database.');
    })
    .catch(err => {
        console.error(err);
    })

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', path.join('layouts', 'layout'));

app.use(expressLayouts);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({limit: '10mb', extended: false}));
app.use(methodOverride('_method'));

// Session config and use, flash
const sessionConfig = {
    secret: 'thisshouldbeabettersecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24,
        maxAge: 1000 * 60 * 60 * 24
    }
};
app.use(session(sessionConfig));
app.use(flash());

// Passport
app.use(passport.initialize());
app.use(passport.session()); // Middleware that uses serialize and deserialize to store and retrieve user data.

const User = require('./models/user');
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser()); // Saves user inside the express-session
passport.deserializeUser(User.deserializeUser()); // Retreives user data from session and perform condition-based operations.

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

// Use routers
app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/stories', storiesRouter);
app.use('/myworks', myWorksRouter);

// 404 Route
app.all('*', (req, res, next) => {
    next(new ExpressError('Page does not exist!', 404));
})

app.use((err, req, res, next) => {
    const {statusCode = 500} = err;
    if (!err.message) {
        err.message = "Oh no! Something went wrong!";
    }
    res.status(statusCode).render('error', {error: err});
})

app.listen(process.env.PORT || 3000);