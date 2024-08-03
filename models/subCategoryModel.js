const mongoose = require("mongoose");

const subCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "subcategory name is required"],
      trim: true,
      unique: [true, "subcategory must be unique"],
      minlength: [2, "too short subcategory name"],
      maxlength: [32, "too long subcategory name"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    // parent of subCategory => ref is the name of categoryModel
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "Category",
      required: [true, "subcategory must belong to parent category"],
    },
  },
  { timestamps: true }
);

// mongoose middleware for population
subCategorySchema.pre(/^find/, function (next) {
  this.populate("category");
  next();
});

const subCategoryModel = mongoose.model("SubCategory", subCategorySchema);

module.exports = subCategoryModel;
