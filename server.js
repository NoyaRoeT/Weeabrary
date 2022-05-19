if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const expressLayouts = require('express-ejs-layouts');
const path = require('path')

// Routers
const indexRouter = require('./routes/index');

// Connecting to MongoDb
const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL)
    .then(() => {
        console.log('Connected to Database.');
    })
    .catch(err => {
        console.log("Error connecting to Database.")
        console.log(err);
    })

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', path.join('layouts', 'layout'));

app.use(expressLayouts);
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

app.listen(process.env.PORT || 3000);