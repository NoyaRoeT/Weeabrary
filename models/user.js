const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email cannot be blank'],
        unique: true // Not actually a validation
    }
})


// Adds username, hash and salt field to userSchema.
// Ensures usernames are unique + additional methods.
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);