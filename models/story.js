const mongoose = require('mongoose');
const Chapter = require('./chapter');
const Review = require('./review');
const slug = require('mongoose-slug-generator');
mongoose.plugin(slug);

const storySchema = new mongoose.Schema({
    title: {
        type: String,
        maxlength: 50,
        required: [true, 'Story title cannot be blank.'],
    },
    synopsis: {
        type: String,
        maxlength: 250,
        required: [true, 'Story synopsis cannot be blank.'],
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

storySchema.pre('save', function(next) {
    this.lastModified = Date.now();
    next();
})

storySchema.pre('deleteOne', { document: true }, async function() {
    let story = this;
    const deleteChapters = async function() {
        if (story.chapters.length) {
            await Chapter.deleteMany({owningStory: story._id});
        }
    }
    await Promise.all([deleteChapters(), Review.deleteMany({owningStory: story._id})])
})

storySchema.virtual('thumbnail').get(function() {
    return this.image.url.replace('/upload', '/upload/w_200');
})

module.exports = mongoose.model('Story', storySchema);