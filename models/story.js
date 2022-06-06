const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
mongoose.plugin(slug);

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
    },
    chapters: {
        type: [mongoose.Schema.ObjectId],
        ref: 'Chapter',
        default: [],
    },
    slug: {
        type: String,
        slug: 'title',
        unique: true,
    },
    image: {
        url: String,
        filename: String,
    },
})

storySchema.virtual('thumbnail').get(function() {
    return this.image.url.replace('/upload', '/upload/w_200');
})

module.exports = mongoose.model('Story', storySchema);