const Joi = require('joi');
const { listIndexes } = require('./models/listing');
const review = require('./models/review');

const listingsSchema = Joi.object({
    listings: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        price: Joi.number().required().min(0),
        location: Joi.string().required(),
        country: Joi.string().required(),
        image: Joi.string().allow('', null)
    }).required(),
});

const reviewSchema = Joi.object({
    review: Joi.object({
        username: Joi.string().optional(),
        comment: Joi.string().required(),
        rating: Joi.number().required().min(0).max(5),
    }).required(),
});


module.exports = {
    listingsSchema,
    reviewSchema
}
