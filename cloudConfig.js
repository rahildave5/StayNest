const cloudinary = require("cloudinary").v2;
const cloudinaryStorage = require("multer-storage-cloudinary");

if (process.env.CLOUD_NAME && process.env.CLOUD_API_KEY && process.env.CLOUD_API_SECRET) {
    cloudinary.config({
        cloud_name: process.env.CLOUD_NAME,
        api_key: process.env.CLOUD_API_KEY,
        api_secret: process.env.CLOUD_API_SECRET
    });
}

const storage = cloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "AirBNB",
        allowedFormats: ["jpg", "jpeg", "png"],
        public_id: (req, file) => {
            const name = file.originalname.split(".")[0];
            return `${name}-${Date.now()}`;
        }
    }
});

module.exports = storage;