const express = require('express');
const Story = require('../models/story');
const Chapter = require('../models/chapter');
const router = express.Router();

// GET /myworks to list all novels created
router.get('/', async (req, res) => {
    try {
        const stories = await Story.find({});
        res.render('myworks/index', {stories});
    } catch {
        res.statusCode(404).send("Something went wrong!");
    }
})

// GET /myworks/new to get the form to create a new novel
router.get('/new', (req, res) => {
    res.render('myworks/new', {story: new Story()});
})

// GET /myworks/:storyId to get the form to edit a story
router.get('/:storyId', async (req, res) => {
    try {
        const story = await Story.findById(req.params.storyId).populate('chapters', 'title');
        res.render('myworks/edit', {story});
    } catch {
        res.redirect('/myworks');
    }
})

// POST /myworks to save a new novel
router.post('/', async (req, res) => {
    const newStory = new Story({
        title: req.body.title,
        synopsis: req.body.synopsis
    });
    try {
        await newStory.save();
        res.redirect('/myworks');
    } catch (e) {
        console.log(e);
        res.render('myworks/new', {story: newStory, errorMessage: "Failed to create story"});
    }
})

// PUT /myworks/:storyId to edit a story
router.put('/:storyId', async (req, res) => {
    let story;
    try {
        story = await Story.findById(req.params.storyId);
        story.title = req.body.title;
        story.synopsis = req.body.synopsis;
        story.lastModified = Date.now();
        await story.save();
        res.redirect(`/myworks/${story.id}`);
    } catch(e) {
        if (!story) {
            return res.redirect('/myworks');
        }
        res.render('myworks/edit', {story: story, errorMessage: "Failed to edit story"});
    }
})

// DELETE /myworks/:storyId to delete a story
router.delete('/:storyId', async (req, res) => {
    try {
        await Story.deleteOne({id: req.params.storyId});
        res.redirect('/myworks');
    } catch (e) {
        res.redirect('/myworks');
    }
})

// GET /myworks/:storyId/chapters/new route to create a new chapter
router.get('/:storyId/chapters/new', async (req, res) => {
    let story;
    try {
        story = await Story.findById(req.params.storyId);
        res.render('myworks/chapters/new', {story: story, chapter: new Chapter()});
    } catch (e) {
        if (!story) {
            return res.redirect('/myworks');
        }
        res.redirect('/myworks/:storyId');
    }
})

// GET /myworks/:storyId/chapters/:chNum/edit to edit a particular chapter
router.get('/:storyId/chapters/:chNum', async (req, res) => {
    let story;
    try {
        story = await Story.findById(req.params.storyId)
        if (!story) {
            res.redirect('/myworks');
        }
        const chapterId = story.chapters[req.params.chNum];
        if (!chapterId) {
            res.redirect(`/myworks/${story.id}`);
        }
        const chapter = await Chapter.findById(chapterId);
        res.render('myworks/chapters/edit', {chapter: chapter , story: {title: story.title, id: story.id} })
    } catch (e) {
        res.redirect('/myworks/:storyId');
    }
})

// POST /myworks/:storyID/chapter route to save new chapter
router.post('/:storyId/chapters', async (req, res) => {
    let story;
    try {
        story = await Story.findById(req.params.storyId);
        const newChapter = new Chapter({
            title: req.body.title,
            body: req.body.body
        });
        await newChapter.save();
        story.chapters.push(newChapter._id);
        await story.save()
        res.redirect(`/myworks/${story.id}`);
    } catch (e) {
        if (!story) {
            return res.redirect('/myworks');
        }
        res.redirect(`/myworks/${story.id}/chapters/new`);
    }
})

router.put('/:storyId/chapters/:chId', async (req, res) => {
    let chapter;
    try {
        chapter = await Chapter.findById(req.params.chId);
        chapter.title = req.body.title;
        chapter.body = req.body.body;
        await chapter.save();
    } catch {
    } finally {
        res.redirect(`/myworks/${req.params.storyId}/`);
    }
})

module.exports = router;