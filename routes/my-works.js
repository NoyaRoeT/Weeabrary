const express = require('express');
const router = express.Router();
const multer = require('multer');
const {storage} = require('../cloudinary');
const upload = multer({storage});
const catchAsync = require('../utils/catchAsync');
const {isLoggedIn, validateChapter, validateStory, isAuthor, setReturnTo} = require('../controllers/middleware');
const {myWorks, chapters} = require('../controllers/my-works');

router.use(setReturnTo);
router.use(isLoggedIn);

// list all novels created
router.get('/', myWorks.index);

// get the form to create a new novel
router.get('/new', myWorks.renderNew);

// save a new novel
router.post('/', upload.single('image'), validateStory, myWorks.new, myWorks.deleteImageIfError);

// get the form to edit a story
router.get('/:slug', catchAsync(isAuthor), myWorks.renderEdit);

// edit a story
router.put('/:slug', catchAsync(isAuthor), upload.single('image'), validateStory, myWorks.edit, myWorks.deleteImageIfError);

// delete a story
router.delete('/:slug', catchAsync(isAuthor), myWorks.delete);

// render form to create a new chapter
router.get('/:slug/chapters/new', catchAsync(isAuthor), chapters.renderNew);

// render form to edit a chapter
router.get('/:slug/chapters/:chNum', catchAsync(isAuthor), chapters.renderEdit);

// create new chapter
router.post('/:slug/chapters', catchAsync(isAuthor), validateChapter, chapters.new)

// edit chapter
router.put('/:slug/chapters/:chNum', catchAsync(isAuthor), validateChapter, chapters.edit)

// Delete chapter route
router.delete('/:slug/chapters/:chNum', catchAsync(isAuthor), chapters.delete)

module.exports = router;