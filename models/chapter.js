const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        maxLength: 50,
    },
    body: {
        type: String,
        required: true,
        maxLength: 10000,
    }
})

module.exports = mongoose.model('Chapter', chapterSchema);