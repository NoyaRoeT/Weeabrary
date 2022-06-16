const mongoose = require('mongoose');
const Chapter = require('./chapter');
const Review = require('./review');
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
    rating: {
        num: {
            type: Number,
            min: 0,
            default: 0,
        },
        score: {
            type: Number,
            min: 0,
            max: 5,
            default: 0,
        }
    }
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