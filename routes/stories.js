const express = require('express');
const router = express.Router();
const Story = require('../models/story');
const Chapter = require('../models/chapter');
const Review = require('../models/review');
const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');
const {reviewSchema} = require('../schemas');

/* Story */
router.get('/', catchAsync(async (req, res) => {
    const stories = await Story.find({});
    res.render('stories/index', {stories: stories});
}));

router.get('/:slug', catchAsync(async (req, res) => {
    const story = await Story.findOne({slug: req.params.slug}).populate('chapters', 'title');
    if (!story) throw new ExpressError('Could not find this story!', 404);
    res.render('stories/show', {story: story});
}))

/* Chapter */
router.get('/:slug/chapters/:chapterNum', catchAsync(async (req, res) => {
    const story = await Story.findOne({slug: req.params.slug});
    if (!story) throw new ExpressError('Could not find this story!', 404);
    const chapter = await Chapter.findById(story.chapters[req.params.chapterNum]);
    if (!chapter) throw new ExpressError('Could not find this chapter!', 404);
    chapter.chapterNum = parseInt(req.params.chapterNum);
    res.render('stories/chapters/show', {story: story, chapter: chapter});
}))

/* Review */
const validateReview = function (req, res, next) {
    const { error } = reviewSchema.validate(req. body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }
    return next();
}

router.post('/:slug/reviews', validateReview, catchAsync(async (req, res) => {
    const story = await Story.findOne({slug: req.params.slug});
    if (!story) throw new ExpressError('Could not find this story!', 404);
    const review = new Review({
        review: req.body.review,
        rating: req.body.rating,
        owningStory: story.id,
    });
    await review.save();
    story.rating.score = (review.rating + story.rating.num * story.rating.score) / (++story.rating.num);
    await story.save();
    res.redirect(`/stories/${story.slug}`);
}))

module.exports = router;