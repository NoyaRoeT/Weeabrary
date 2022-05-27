const express = require('express');
const router = express.Router();
const Story = require('../models/story');
const Chapter = require('../models/chapter');
const { request } = require('express');
const { findById } = require('../models/story');
const story = require('../models/story');

// List all stories
router.get('/', async (req, res) => {
    const stories = await Story.find({});
    res.render('stories/index', {stories: stories});
})

// Show a specific story
router.get('/:id', async (req, res) => {
    try {
        const story = await Story.findById(req.params.id).populate('chapters', 'title');
        res.render('stories/show', {story: story});
    } catch (e) {
        res.redirect('/stories');
    }
})

// Get a chapter
router.get('/:storyId/chapter/:chapterNum', async (req, res) => {
    let story;
    try {
        story = await Story.findById(req.params.storyId);
        if (!story) { return res.redirect('/stories'); }
        const chapter = await Chapter.findById(story.chapters[req.params.chapterNum]);
        story = {title: story.title, id: story.id};
        res.render('stories/chapters/show', {story: story, chapter: chapter});
    } catch(e) {
        if (!story) {
            res.redirect('/stories');
        }
        res.redirect(`/stories/${story.id}`);
    }
})

module.exports = router;