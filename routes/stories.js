const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const {validateReview, isLoggedIn, isReviewAuthor, userHasReview, setReturnTo} = require('../controllers/middleware');
const {stories, reviews} = require('../controllers/stories');

router.use(setReturnTo);

/* Story */
router.get('/', stories.index);

router.get('/:slug', catchAsync(userHasReview), stories.show);

/* Chapter */
router.get('/:slug/chapters/:chapterNum', stories.showChapter);

/* Review */
router.use(isLoggedIn);

router.post('/:slug/reviews', catchAsync(userHasReview), validateReview, reviews.new)

router.put('/:slug/reviews/:reviewId', catchAsync(isReviewAuthor), validateReview, reviews.edit)

router.delete('/:slug/reviews/:reviewId', catchAsync(isReviewAuthor), reviews.delete)

module.exports = router;