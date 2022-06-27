const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const review = require('./review');
const Story = require('./story');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email cannot be blank'],
        unique: true // Not actually a validation
    },
    works: {
        type: [{
            type: mongoose.Schema.ObjectId,
            ref: 'Story',
        }],
        default: [],
        validate: [arrayLimit, 'User cannot have more than 100 works.'],
    }
})

function arrayLimit(val) {
    return val.length <= 100;
}


// Adds username, hash and salt field to userSchema.
// Ensures usernames are unique + additional methods.
userSchema.plugin(passportLocalMongoose);

userSchema.pre('deleteOne', {document: true}, async function() {
    let user = this;
    await Story.deleteMany({author: user._id});
    await review.deleteMany({author: user._id});
})

module.exports = mongoose.model('User', userSchema);