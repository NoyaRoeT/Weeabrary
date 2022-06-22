const express = require('express');
const Story = require('../models/story');
const Chapter = require('../models/chapter');
const router = express.Router();
const multer = require('multer');
const {storage, cloudinary} = require('../cloudinary');
const upload = multer({storage});
const catchAsync = require('../utils/catchAsync');
const catchAsyncError = require('../utils/catchAsyncError');
const ExpressError = require('../utils/ExpressError');
const Joi = require('joi');
const {storySchema, chapterSchema} = require('../schemas');
const { validate } = require('../models/story');

// list all novels created
router.get('/', catchAsync(async (req, res) => {
    const stories = await Story.find({});
    res.render('myworks/index', {stories});
}))

// get the form to create a new novel
router.get('/new', (req, res) => {
    res.render('myworks/new', {story: new Story()});
})

// get the form to edit a story
router.get('/:slug', catchAsync(async (req, res) => {
    const story = await Story.findOne({slug: req.params.slug}).populate('chapters', 'title');
    if (!story) throw new ExpressError('Could not find this work!', 404);
    res.render('myworks/edit', {story});
}))

const validateStory = (req, res, next) => {
    const { error } = storySchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }
    return next();
}

// save a new novel
router.post('/', upload.single('image'), validateStory, catchAsync(async (req, res) => {
    const newStory = new Story({
        title: req.body.title,
        synopsis: req.body.synopsis,
    });
    if (req.file) {
        newStory.image = {url: req.file.path, filename: req.file.filename};
    }
    await newStory.save();
    req.flash('success', 'Successfully created a new story!');
    res.redirect(`/myworks/${newStory.slug}`);
    
}), catchAsyncError(async (err, req, res, next) => {
    if (req.file) await cloudinary.uploader.destroy(req.file.filename);
    next(err);
})) // Need a special error handler to delete uploaded files

// edit a story
router.put('/:slug', upload.single('image'), validateStory, catchAsync(async (req, res) => {
    const story = await Story.findOne({slug: req.params.slug});
    if (!story) throw new ExpressError('Could not find this work!', 404);
    story.title = req.body.title;
    story.synopsis = req.body.synopsis;
    if (!req.file) {
        await story.save();
        req.flash('success', 'Succesfully edited your story!');
        return res.redirect(`/myworks/${story.slug}`);
    }
    const oldFileName = story.image.filename;
    story.image = {url: req.file.path, filename: req.file.filename};
    await story.save();
    if (oldFileName) {
        await cloudinary.uploader.destroy(oldFileName); // If no such file, then nth happens
    }
    req.flash('success', 'Succesfully edited your story!');
    res.redirect(`/myworks/${story.slug}`);
    // In terms of code, error will only be thrown at .save() (e.g. fail mongoose validation)
    // In that case, the story obj is unchanged hence only need to delete new uploaded img.
}), catchAsyncError(async (err, req, res, next) => {
    if (req.file) await cloudinary.uploader.destroy(req.file.filename);
    next(err);
})) // Need a special error handler to delete uploaded files

// delete a story
router.delete('/:slug', catchAsync(async (req, res) => {

    const story = await Story.findOne({slug: req.params.slug});
    if (!story) throw new ExpressError('Could not find this work!', 404);
    if (story.image.filename) {
        await cloudinary.uploader.destroy(story.image.filename);
    }
    await story.deleteOne();
    req.flash('success', 'Succesfully deleted your story!');
    res.redirect('/myworks');
}))

// // delete cover image
// router.delete('/:slug/image', async (req, res) => {
//     let story;
//     try {
//         story = await Story.findOne({slug: req.params.slug});
//         if (!story) {
//             return res.redirect('/myworks');
//         }
//         await cloudinary.uploader.destroy(story.image.filename);
//         story.image = {};
//         await story.save();
//         return res.redirect(`/myworks/${story.slug}`);
//     } catch (e) {
//         if (!story) {
//             return res.redirect('/myworks');
//         }
//         return res.redirect(`/myworks/${story.slug}`);
//     }
// })

// GET /myworks/:storyId/chapters/new route to create a new chapter
router.get('/:slug/chapters/new', catchAsync(async (req, res) => {
    const story = await Story.findOne({slug: req.params.slug});
    if (!story) throw new ExpressError('Could not find this work!', 404);
    res.render('myworks/chapters/new', {story: story, chapter: new Chapter()});
}))

// GET /myworks/:storyId/chapters/:chNum/edit to edit a particular chapter
router.get('/:slug/chapters/:chNum', catchAsync(async (req, res) => {
    const story = await Story.findOne({slug: req.params.slug})
    if (!story) throw new ExpressError('Could not find this work!', 404);
    const chapterId = story.chapters[req.params.chNum];
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) throw new ExpressError('Could not find this chapter!', 404);
    chapter.num = req.params.chNum;
    res.render('myworks/chapters/edit', {chapter: chapter , story: story});

}));

const validateChapter = (req, res, next) => {
    const { error } = chapterSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }
    return next();
}

// POST /myworks/:storyID/chapter route to save new chapter
router.post('/:slug/chapters', validateChapter, catchAsync(async (req, res) => {
    const story = await Story.findOne({slug: req.params.slug});
    if (!story) throw new ExpressError('Could not find this work!', 404);
    const newChapter = new Chapter({
        title: req.body.title,
        body: req.body.body,
        owningStory: story.id
    });
    await newChapter.save();
    story.chapters.push(newChapter._id);
    await story.save()
    req.flash('success', 'Succesfully added a chapter!');
    res.redirect(`/myworks/${story.slug}`);
}))

// Save chapter update route
router.put('/:slug/chapters/:chNum', validateChapter, catchAsync(async (req, res) => {
    const story = await Story.findOne({slug: req.params.slug});
    if (!story) throw new ExpressError('Could not find this work!', 404);
    const chapter = await Chapter.findById(story.chapters[req.params.chNum]);
    if (!chapter) throw new ExpressError('Could not find this chapter!', 404);
    chapter.title = req.body.title;
    chapter.body = req.body.body;
    await chapter.save();
    req.flash('success', 'Succesfully edited a chapter!');
    res.redirect(`/myworks/${story.slug}/chapters/${req.params.chNum}`);
}))

// Delete chapter route
router.delete('/:slug/chapters/:chNum', catchAsync(async (req, res) => {
    const story = await Story.findOne({slug: req.params.slug});
    if (!story) throw new ExpressError('Could not find this work!', 404);
    if (req.params.chNum < 0 || req.params.chNum >= story.chapters.length) {
        throw new ExpressError('Could not find this chapter!', 404);
    }
    const chId = story.chapters[req.params.chNum];
    story.chapters.splice(req.params.chNum, 1);
    await Chapter.deleteOne({_id: chId});
    await story.save();
    req.flash('success', 'Succesfully deleted a chapter!');
    res.redirect(`/myworks/${story.slug}`);
}))

module.exports = router;