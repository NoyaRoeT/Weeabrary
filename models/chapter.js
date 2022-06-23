const mongoose = require('mongoose');
const createDomPurify = require('dompurify');
const {JSDOM} = require('jsdom');
const dompurify = createDomPurify(new JSDOM().window);

const chapterSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Chapter title cannot be blank.'],
        maxLength: 50,
    },
    body: {
        type: String,
        required: [true, 'Chapter body cannot be blank.'],
        maxLength: 10000,
    },
    owningStory: {
        type: mongoose.Schema.ObjectId ,
        ref: 'Story',
    }
})

chapterSchema.pre('validate', function(next) {
    if (this.body) {
        this.body = dompurify.sanitize(this.body);
    }
    next();
});

module.exports = mongoose.model('Chapter', chapterSchema);