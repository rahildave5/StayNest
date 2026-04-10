const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");
const { url } = require("node:inspector");

const listingSchema = new Schema({
    title: String,
    description: String,
    image: {
        url: String,
        filename: String,
    },
    price: Number,
    location: String,
    country: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        },
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
});

listingSchema.post("findOneAndDelete", async (listings) => {
    if
        (listings.reviews.length) {
        await Review.deleteMany({ _id: { $in: listings.reviews } });
    }
});



const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing; 