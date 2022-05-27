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
    },
    owningStory: {
        type: mongoose.Schema.ObjectId ,
        ref: 'Story',
    }
})

module.exports = mongoose.model('Chapter', chapterSchema);