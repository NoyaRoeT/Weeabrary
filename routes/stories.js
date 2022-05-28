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
router.get('/:slug', async (req, res) => {
    try {
        const story = await Story.findOne({slug: req.params.slug}).populate('chapters', 'title');
        if (!story) {
            return res.redirect('/stories');
        }
        res.render('stories/show', {story: story});
    } catch (e) {
        res.redirect('/stories');
    }
})

// Get a chapter
router.get('/:slug/chapter/:chapterNum', async (req, res) => {
    let story;
    try {
        story = await Story.findOne({slug: req.params.slug});
        if (!story) { return res.redirect('/stories'); }
        const chapter = await Chapter.findById(story.chapters[req.params.chapterNum]);
        if (!chapter) { return res.redirect(`/stories/${story.slug}`); }
        story = {title: story.title, slug: story.slug};
        res.render('stories/chapters/show', {story: story, chapter: chapter});
    } catch(e) {
        if (!story) {
            res.redirect('/stories');
        }
        res.redirect(`/stories/${story.slug}`);
    }
})

module.exports = router;