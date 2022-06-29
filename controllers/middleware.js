const ExpressError = require('../utils/ExpressError');
const {storySchema, chapterSchema, reviewSchema} = require('../schemas');
const Story = require('../models/story');
const Review = require('../models/review');

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = {
            url: req.originalUrl,
            method: req.method,
            base: req.baseUrl,
        };
        req.flash('error', 'You need to be signed in.');
        return res.redirect('/auth/login');
    }
    next();
}

module.exports.setReturnTo = (req, res, next) => {
    req.session.returnTo = {
        url: req.originalUrl,
        method: req.method,
        base: req.baseUrl,
    }
    next();
}

module.exports.isAuthor = async (req, res, next) => {
    const story = await Story.findOne({slug: req.params.slug});
    if (!story) throw new ExpressError('Could not find this work!', 404);
    if (!story.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to edit this story');
        return res.redirect('/myworks');
    }
    
    next();
}

module.exports.validateStory = (req, res, next) => {
    const { error } = storySchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }
    return next();
}

module.exports.validateChapter = (req, res, next) => {
    const { error } = chapterSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }
    return next();
}

module.exports.validateReview = function (req, res, next) {
    const { error } = reviewSchema.validate(req. body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }
    return next();
}

module.exports.isReviewAuthor = async (req, res, next) => {
    const review = await Review.findById(req.params.reviewId);
    if (!review) throw new ExpressError('Could not find this review!', 404);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do this.');
        return res.redirect(`/stories/${req.params.slug}`);
    }
    next();
}

module.exports.userHasReview = async (req, res, next) => {
    if (!req.user) {
        return next();
    }

    const story = await Story.findOne({slug: req.params.slug});
    const review = await Review.findOne({owningStory: story._id, author: req.user._id});

    if (review) {
        req.review = review;
    }
    next();
}
