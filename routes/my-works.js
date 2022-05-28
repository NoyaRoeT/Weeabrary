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
router.get('/:slug', async (req, res) => {
    try {
        const story = await Story.findOne({slug: req.params.slug}).populate('chapters', 'title');
        if (! story) {
            return res.redirect('/myworks');
        }
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
router.put('/:slug', async (req, res) => {
    let story;
    try {
        story = await Story.findOne({slug: req.params.slug});
        if (!story) { return res.redirect('/myworks'); }
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
router.delete('/:slug', async (req, res) => {
    let story;
    try {
        story = await Story.findOne({slug: req.params.slug});
        if (!story) { return res.redirect('/myworks'); }
        await Chapter.deleteMany({owningStory: story._id});
        await Story.deleteOne({_id: story._id});
        res.redirect('/myworks');
    } catch (e) {
        res.redirect('/myworks');
    }
})

// GET /myworks/:storyId/chapters/new route to create a new chapter
router.get('/:slug/chapters/new', async (req, res) => {
    let story;
    try {
        story = await Story.findOne({slug: req.params.slug});
        if (!story) {
            return res.redirect('/myworks');
        }
        res.render('myworks/chapters/new', {story: story, chapter: new Chapter()});
    } catch (e) {
        if (!story) {
            return res.redirect('/myworks');
        }
        res.redirect('/myworks/:storyId');
    }
})

// GET /myworks/:storyId/chapters/:chNum/edit to edit a particular chapter
router.get('/:slug/chapters/:chNum', async (req, res) => {
    let story;
    try {
        story = await Story.findOne({slug: req.params.slug})
        if (!story) {
            return res.redirect('/myworks');
        }
        const chapterId = story.chapters[req.params.chNum];
        if (!chapterId) {
            return res.redirect(`/myworks/${story.slug}`);
        }
        const chapter = await Chapter.findById(chapterId);
        chapter.num = req.params.chNum;
        res.render('myworks/chapters/edit', {chapter: chapter , story: {title: story.title, slug: story.slug}});
    } catch (e) {
        res.redirect(`/myworks/${story.slug}`);
    }
})

// POST /myworks/:storyID/chapter route to save new chapter
router.post('/:slug/chapters', async (req, res) => {
    let story;
    try {
        story = await Story.findOne({slug: req.params.slug});
        if (!story) {
            return res.redirect('/myworks');
        }
        const newChapter = new Chapter({
            title: req.body.title,
            body: req.body.body,
            owningStory: story.id
        });
        await newChapter.save();
        story.chapters.push(newChapter._id);
        await story.save()
        res.redirect(`/myworks/${story.slug}`);
    } catch (e) {
        if (!story) {
            return res.redirect('/myworks');
        }
        res.redirect(`/myworks/${story.slug}/chapters/new`);
    }
})

// Save chapter update route
router.put('/:slug/chapters/:chNum', async (req, res) => {
    let story;
    let chapter;
    try {
        story = await Story.findOne({slug: req.params.slug});
        if (!story) {
            return res.redirect('/myworks');
        }
        chapter = await Chapter.findById(story.chapters[req.params.chNum]);
        if (!chapter) {
            return res.redirect(`/myworks/${story.slug}`);
        }
        chapter.title = req.body.title;
        chapter.body = req.body.body;
        await chapter.save();
    } catch (e) {
        console.log(e);
    } finally {
        // Since the route will handle nonexistent story by itself.
        res.redirect(`/myworks/${req.params.slug}/`);
    }
})

// Delete chapter route
router.delete('/:slug/chapters/:chNum', async (req, res) => {
    let story;
    try {
        story = await Story.findOne({slug: req.params.slug});
        if (!story) {
            return res.redirect('/myworks;')
        }
        if (req.params.chNum < 0 || req.params.chNum >= story.chapters.length) {
            return res.redirect(`/myworks/${story.slug}`);
        }
        console.log(`chNum: ${req.params.chNum}`);
        const chId = story.chapters[req.params.chNum];
        console.log(`chNum: ${chId}`);
        story.chapters.splice(req.params.chNum, 1);
        console.log(`chNum: ${chId}`);
        await Chapter.deleteOne({_id: chId});
        await story.save();
        res.redirect(`/myworks/${story.slug}`);
    } catch (e) {
        if (!story) {
            return res.redirect('/myworks');
        }
        return res.redirect(`/myworks/${story.slug}`);
    }
})

module.exports = router;