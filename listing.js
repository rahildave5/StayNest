const mongoose = require("mongoose");
const Schema = mongoose.Schema;

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

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing; 