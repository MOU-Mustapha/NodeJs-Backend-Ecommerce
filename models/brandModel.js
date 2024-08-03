const mongoose = require("mongoose");

// 1-create schema
const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "brand name is required"],
      unique: [true, "brand must be unique"],
      minlength: [3, "too short brand name"],
      maxlength: [32, "too long brand name"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    image: String,
  },
  { timestamps: true }
);

const setImageURL = (doc) => {
  // return the image field to be baseURL + imageName
  if (doc.image) {
    const imageUrl = `${process.env.BASE_URL}/brands/${doc.image}`;
    doc.image = imageUrl;
  }
};
brandSchema.post("init", (doc) => {
  setImageURL(doc);
});
brandSchema.post("save", (doc) => {
  setImageURL(doc);
});

// 2-convert schema to model
const brandModel = mongoose.model("Brand", brandSchema);

module.exports = brandModel;
