const mongoose = require("mongoose");

// 1-create schema
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "category name is required"],
      unique: [true, "category must be unique"],
      minlength: [3, "too short category name"],
      maxlength: [32, "too long category name"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    image: String,
  },
  { timestamps: true }
);

// return image url into the response
const setImageURL = (doc) => {
  // return the image field to be baseURL + imageName
  if (doc.image) {
    const imageUrl = `${process.env.BASE_URL}/categories/${doc.image}`;
    doc.image = imageUrl;
  }
};

// getAll - getById - update
categorySchema.post("init", (doc) => {
  setImageURL(doc);
});
// create
categorySchema.post("save", (doc) => {
  setImageURL(doc);
});

// 2-convert schema to model
const categoryModel = mongoose.model("Category", categorySchema);

module.exports = categoryModel;
