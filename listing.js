const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema({
    title: String,
    description: String,
    image: {
        type: String,
        default: "https://blog.3bee.com/en/nature-positive-regenerating-nature-for-the-future/",
        set: (v) =>
            v === ""
                ? "https://blog.3bee.com/en/nature-positive-regenerating-nature-for-the-future/"
                : v,
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
});

listingSchema.post("findOneAndDelete", async (listings) => {
    if
        (listings.reviews.length) {
        await Review.deleteMany({ _id: { $in: listings.reviews } });
    }
});



const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing; 
