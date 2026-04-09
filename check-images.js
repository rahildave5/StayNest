const mongoose = require("mongoose");
const Listing = require("./models/listing");

(async () => {
    await mongoose.connect("mongodb://127.0.0.1:27017/bookBNB");
    const docs = await Listing.find({}).select("title image").limit(3).lean();
    console.log(JSON.stringify(docs, null, 2));
    await mongoose.disconnect();
})().catch((e) => {
    console.error(e);
    process.exit(1);
});
