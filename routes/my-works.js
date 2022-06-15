const express = require('express');
const Story = require('../models/story');
const Chapter = require('../models/chapter');
const router = express.Router();
const multer = require('multer');
const {storage, cloudinary} = require('../cloudinary');
const upload = multer({storage});
const catchAsync = require('../utils/catchAsync');

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
router.get('/:slug', async (req, res) => {
    const story = await Story.findOne({slug: req.params.slug}).populate('chapters', 'title');
    res.render('myworks/edit', {story});
});

// save a new novel
router.post('/', upload.single('image'), catchAsync(async (req, res) => {
    const newStory = new Story({
        title: req.body.title,
        synopsis: req.body.synopsis,
    });
    if (req.file) {
        newStory.image = {url: req.file.path, filename: req.file.filename};
    }
    try {
        await newStory.save();
        res.redirect(`/myworks/${newStory.slug}`);
    } catch (e) {
        if (req.file) {
            await cloudinary.uploader.destroy(req.file.filename);
        }
        return next(e);
    }
})) // Need a special error handler to delete uploaded files

// edit a story
router.put('/:slug', upload.single('image'), catchAsync(async (req, res) => {
    let story;
    try {
        story = await Story.findOne({slug: req.params.slug});
        story.title = req.body.title;
        story.synopsis = req.body.synopsis;
        if (!req.file) {
            await story.save();
            return res.redirect(`/myworks/${story.slug}`);
        }
        const oldFilename = story.image.filename;
        story.image = {url: req.file.path, filename: req.file.filename};
        await story.save();
        if (oldFileName) {
            await cloudinary.uploader.destroy(oldFilename); // If no such file, then nth happens
        }
        res.redirect(`/myworks/${story.slug}`);
    } catch(e) {
        if (req.file) {
            await cloudinary.uploader.destroy(req.file.filename);
        }
        return next(e);
    }
})) // Need a special error handler to delete uploaded files

// delete a story
router.delete('/:slug', catchAsync(async (req, res) => {

    const story = await Story.findOne({slug: req.params.slug});
    if (!story) { return res.redirect('/myworks'); }
    await Chapter.deleteMany({owningStory: story._id});
    if (story.image.filename) {
        await cloudinary.uploader.destroy(story.image.filename);
    }
    await Story.deleteOne({_id: story._id});
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
    res.render('myworks/chapters/new', {story: story, chapter: new Chapter()});
}))

// GET /myworks/:storyId/chapters/:chNum/edit to edit a particular chapter
router.get('/:slug/chapters/:chNum', catchAsync(async (req, res) => {
    const story = await Story.findOne({slug: req.params.slug})
    const chapterId = story.chapters[req.params.chNum];
    const chapter = await Chapter.findById(chapterId);
    chapter.num = req.params.chNum;
    res.render('myworks/chapters/edit', {chapter: chapter , story: story});

}));

// POST /myworks/:storyID/chapter route to save new chapter
router.post('/:slug/chapters', catchAsync(async (req, res) => {
    const story = await Story.findOne({slug: req.params.slug});
    const newChapter = new Chapter({
        title: req.body.title,
        body: req.body.body,
        owningStory: story.id
    });
    await newChapter.save();
    story.chapters.push(newChapter._id);
    await story.save()
    res.redirect(`/myworks/${story.slug}`);
}))

// Save chapter update route
router.put('/:slug/chapters/:chNum', catchAsync(async (req, res) => {
    const story = await Story.findOne({slug: req.params.slug});
    const chapter = await Chapter.findById(story.chapters[req.params.chNum]);
    chapter.title = req.body.title;
    chapter.body = req.body.body;
    await chapter.save();
    res.redirect(`/myworks/${story.slug}/chapters/${req.params.chNum}`);
}))

// Delete chapter route
router.delete('/:slug/chapters/:chNum', catchAsync(async (req, res) => {
    const story = await Story.findOne({slug: req.params.slug});
    if (!story) {
        return res.redirect('/myworks;')
    }
    if (req.params.chNum < 0 || req.params.chNum >= story.chapters.length) {
        return res.redirect(`/myworks/${story.slug}`);
    }
    const chId = story.chapters[req.params.chNum];
    story.chapters.splice(req.params.chNum, 1);
    await Chapter.deleteOne({_id: chId});
    await story.save();
    res.redirect(`/myworks/${story.slug}`);
}))

module.exports = router;