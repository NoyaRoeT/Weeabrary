const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
    title: {
        type: String,
        maxlength: 50,
        required: true,
    },
    synopsis: {
        type: String,
        maxlength: 250,
        required: true,
    },
    chapters: {
        type: [Number],
        default: [],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    lastModified: {
        type: Date,
        default: Date.now,
    }
})

module.exports = mongoose.model('Story', storySchema);