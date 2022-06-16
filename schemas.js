const Joi = require('joi');

module.exports.storySchema = Joi.object({
    title: Joi.string().required().max(50),
    synopsis: Joi.string().required().max(250),
});

module.exports.chapterSchema = Joi.object({
    title: Joi.string().required().max(50),
    body: Joi.string().required().max(10000)
});

module.exports.reviewSchema = Joi.object({
    review: Joi.string().required().max(250),
    rating: Joi.number().required().min(1).max(5)
});