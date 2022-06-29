const Story = require('../models/story');
const Chapter = require('../models/chapter');
const Review = require('../models/review');
const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');

const stories = {};
const reviews = {};

stories.index = catchAsync(async (req, res) => {
    const stories = await Story.find({});
    res.render('stories/index', {stories: stories});
});

stories.show = catchAsync(async (req, res) => {
    const story = await Story.findOne({slug: req.params.slug}).populate('chapters', 'title').populate('author', 'username');
    if (!story) throw new ExpressError('Could not find this story!', 404);
    const reviews = await Review.find({owningStory: story._id}).populate('author', 'username');
    let review = new Review();
    if (req.review) {
        res.locals.currentUser.hasReview = true;
        review = req.review;
    }
    res.render('stories/show', {story: story, review: review, reviews: reviews});
});

stories.showChapter = catchAsync(async (req, res) => {
    const story = await Story.findOne({slug: req.params.slug});
    if (!story) throw new ExpressError('Could not find this story!', 404);
    const chapter = await Chapter.findById(story.chapters[req.params.chapterNum]);
    if (!chapter) throw new ExpressError('Could not find this chapter!', 404);
    chapter.chapterNum = parseInt(req.params.chapterNum);
    res.render('stories/chapters/show', {story: story, chapter: chapter});
})

module.exports.stories = stories;

reviews.new = catchAsync(async (req, res) => {
    if (req.review) {
        req.flash('error', 'Already wrote a review.');
        return res.redirect(`/stories/${req.params.slug}`);
    }
    const story = await Story.findOne({slug: req.params.slug});
    if (!story) throw new ExpressError('Could not find this story!', 404);
    const review = new Review({
        review: req.body.review,
        rating: req.body.rating,
        owningStory: story.id,
        author: req.user._id
    });
    await review.save();
    req.flash('success', 'Successfully posted a review!');
    res.redirect(`/stories/${story.slug}`);
});

reviews.edit = catchAsync(async (req, res) => {
    const review = await Review.findById(req.params.reviewId);
    if (!review) throw new ExpressError('Could not find this review', 404);
    review.rating = req.body.rating;
    review.review = req.body.review;
    await review.save();
    req.flash('success', 'Successfully edited a review!');
    res.redirect(`/stories/${req.params.slug}`);
})

reviews.delete = catchAsync(async (req, res) => {
    await Review.deleteOne({_id: req.params.reviewId});
    req.flash('success', 'Successfully deleted a review!');
    res.redirect(`/stories/${req.params.slug}`);
})

module.exports.reviews = reviews;