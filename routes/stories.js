const express = require('express');
const Story = require('../models/story');
const router = express.Router();

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
    const story = await Story.findById(req.params.id);
    if (story) {
        res.render('stories/edit', {story: story});
    } else {
        res.redirect('/stories');
    }
})

// Show a specific story
router.get('/:id', async (req, res) => {
    const story = await Story.findById(req.params.id);
    try {
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

module.exports = router;