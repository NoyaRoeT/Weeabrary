const express = require('express');
const router = express.Router();

// Show all anime route
router.get('/', (req, res) => {
    res.render('anime/index');
})

// New anime route
router.get('/new', (req, res) => {
    res.render('anime/new');
})

// Add new anime route
router.post('/', (req, res) => {
    res.send('Added new anime!');
})

module.exports = router;