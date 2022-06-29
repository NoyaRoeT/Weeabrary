const Story = require('../models/story');
const Chapter = require('../models/chapter');
const catchAsync = require('../utils/catchAsync')
const catchAsyncError = require('../utils/catchAsyncError');
const ExpressError = require('../utils/ExpressError');
const {cloudinary} = require('../cloudinary');

const myWorks = {};
const chapters = {};

// myWorks Controllers
myWorks.index = catchAsync(async (req, res) => {
    const stories = await Story.find({author: req.user._id});
    res.render('myworks/index', {stories});
})

myWorks.renderNew = (req, res) => {
    res.render('myworks/new', {story: new Story()});
}

myWorks.new = catchAsync(async (req, res) => {
    const author = req.user;
    const newStory = new Story({
        title: req.body.title,
        synopsis: req.body.synopsis,
        author: author._id,
    });

    if (req.file) {
        newStory.image = {url: req.file.path, filename: req.file.filename};
    }

    await newStory.save();
    author.works.push(newStory._id);
    await author.save();
    req.flash('success', 'Successfully created a new story!');
    res.redirect(`/myworks/${newStory.slug}`);  
})

myWorks.deleteImageIfError = catchAsyncError(async (err, req, res, next) => {
    if (req.file) await cloudinary.uploader.destroy(req.file.filename);
    next(err);
})

myWorks.renderEdit = catchAsync(async (req, res) => {
    const story = await Story.findOne({slug: req.params.slug}).populate('chapters', 'title');
    if (!story) throw new ExpressError('Could not find this work!', 404);
    res.render('myworks/edit', {story});
})

myWorks.edit = catchAsync(async (req, res) => {
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
})

myWorks.delete = catchAsync(async (req, res) => {
    const story = await Story.findOne({slug: req.params.slug});
    if (!story) throw new ExpressError('Could not find this work!', 404);
    await story.deleteOne();
    req.flash('success', 'Succesfully deleted your story!');
    res.redirect('/myworks');
})

module.exports.myWorks = myWorks;

// Chapters controllers
chapters.renderNew = catchAsync(async (req, res) => {
    const story = await Story.findOne({slug: req.params.slug});
    if (!story) throw new ExpressError('Could not find this work!', 404);
    res.render('myworks/chapters/new', {story: story, chapter: new Chapter()});
});

chapters.renderEdit = catchAsync(async (req, res) => {
    const story = await Story.findOne({slug: req.params.slug})
    if (!story) throw new ExpressError('Could not find this work!', 404);
    const chapterId = story.chapters[req.params.chNum];
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) throw new ExpressError('Could not find this chapter!', 404);
    chapter.num = req.params.chNum;
    res.render('myworks/chapters/edit', {chapter: chapter , story: story});
})

chapters.new = catchAsync(async (req, res) => {
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
})

chapters.edit = catchAsync(async (req, res) => {
    const story = await Story.findOne({slug: req.params.slug});
    if (!story) throw new ExpressError('Could not find this work!', 404);
    const chapter = await Chapter.findById(story.chapters[req.params.chNum]);
    if (!chapter) throw new ExpressError('Could not find this chapter!', 404);
    chapter.title = req.body.title;
    chapter.body = req.body.body;
    await chapter.save();
    req.flash('success', 'Succesfully edited a chapter!');
    res.redirect(`/myworks/${story.slug}/chapters/${req.params.chNum}`);
})

chapters.delete = catchAsync(async (req, res) => {
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
})

module.exports.chapters = chapters;