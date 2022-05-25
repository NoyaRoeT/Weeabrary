const express = require('express');
const router = express.Router();
const Story = require('../models/story');
const Chapter = require('../models/chapter');
const { request } = require('express');
const { findById } = require('../models/story');

// List all stories
router.get('/', async (req, res) => {
    const stories = await Story.find({});
    res.render('stories/index', {stories: stories});
})

// Create new story
router.get('/new', (req, res) => {
    res.render('stories/new', {story: new Story()});
})

// Edit a story
router.get('/:id/edit', async (req, res) => {
    try {
        const story = await Story.findById(req.params.id);
        if (!story) {
            res.redirect('/stories');
            return;
        }
        res.render('stories/edit', {story: story});
    } catch (e) {
        res.redirect('/stories');
    }
})

// Show a specific story
router.get('/:id', async (req, res) => {
    try {
        const story = await Story.findById(req.params.id);
        res.render('stories/show', {story: story});
    } catch (e) {
        console.log(e);
        res.redirect('/stories');
    }
})

// Save new story
router.post('/', async (req, res) => {
    const newStory = new Story({
        title: req.body.title,
        synopsis: req.body.synopsis
    });
    try {
        await newStory.save();
        res.redirect('/stories');
    } catch (e) {
        console.log(e);
        res.render('stories/new', {story: newStory, errorMessage: "Failed to create story"});
    }
})

// Save edit to story
router.put('/:id', async (req, res) => {
    const story = await Story.findById(req.params.id);
    try {
        story.title = req.body.title;
        story.synopsis = req.body.synopsis;
        story.lastModified = Date.now();
        await story.save();
        res.redirect(`/stories/${story.id}`);
    } catch(e) {
        console.log(e);
        res.render('stories/edit', {story: story, errorMessage: "Failed to edit story"});
    }
})

// Delete story
router.delete('/:id', async (req, res) => {
    try {
        await Story.deleteOne({_id: req.params.id});
        res.redirect('/stories');
    } catch (e) {
        console.log(e);
        res.redirect('/stories');
    }
})

// Create a new chapter
router.get('/:storyId/chapter/new', async (req, res) => {
    try {
        const story = await Story.findById(req.params.storyId);
        res.render('chapters/new', {story: story, chapter: new Chapter()});
    } catch (e) {
        console.log(e);
    }
})

// Get a chapter
router.get('/:storyId/chapter/:chapterNum', async (req, res) => {
    let story = await Story.findById(req.params.storyId);
    if (!story) {
        res.redirect('/stories');
        return;
    }
    try {
        const chapter = await Chapter.findById(story.chapters[req.params.chapterNum - 1]);
        story = {title: story.title};
        res.render('chapters/show', {story: story, chapter: chapter});
    } catch(e) {
        console.log(e);
        res.redirect('/stories');
    }

})

// Save new chapter
router.post('/:storyId/chapter', async (req, res) => {
    try {
        const story = await Story.findById(req.params.storyId);
        if (!story) {
            res.redirect('/stories');
            return;
        }
        const newChapter = new Chapter({
            title: req.body.title,
            body: req.body.body
        });
        await newChapter.save();
        story.chapters.push(newChapter._id);
        await story.save()
        res.redirect(`/stories/${story.id}/chapter/${story.chapters.length}`);
    } catch (e) {
        console.log(e);
        res.redirect('/stories');
    }
})

module.exports = router;