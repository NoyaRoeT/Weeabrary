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

// Routers
const indexRouter = require('./routes/index');
const storiesRouter = require('./routes/stories');
const myWorksRouter = require('./routes/my-works');

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

// Session config and use
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
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

// Use routers
app.use('/', indexRouter);
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