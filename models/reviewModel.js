const mongoose = require("mongoose");
const productModel = require("./productModel");

const reviewSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, "review content is required"],
      trim: true,
      minlength: [3, "too short review content"],
      maxlength: [500, "too long review content"],
    },
    rating: {
      type: Number,
      required: [true, "review rating is required"],
      min: [1, "minimum review rating is 1"],
      max: [5, "minimum review rating is 5"],
    },
    reviewUser: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "review must belong to specific user"],
    },
    // parent reference (one to many relation)
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: [true, "review must belong to specific product"],
    },
  },
  { timestamps: true }
);

reviewSchema.pre(/^find/, function (next) {
  this.populate({ path: "reviewUser", select: "name email" });
  next();
});

reviewSchema.statics.calculateAverageAndQuantityRatings = async function (
  productId
) {
  const result = await this.aggregate([
    // stage 1: get the reviews that related to specific product based on the productId
    { $match: { product: productId } },
    // stage 2: group all the reviews and calculate number of reviews and the average rating
    {
      $group: {
        _id: "$product",
        ratingsAverage: { $avg: "$rating" },
        ratingsQuantity: { $sum: 1 },
      },
    },
  ]);
  // we need to update the product data
  if (result.length > 0) {
    await productModel.findByIdAndUpdate(productId, {
      ratingsAverage: result[0].ratingsAverage,
      ratingsQuantity: result[0].ratingsQuantity,
    });
  } else {
    await productModel.findByIdAndUpdate(productId, {
      ratingsAverage: 0,
      ratingsQuantity: 0,
    });
  }
};

reviewSchema.post("save", async function () {
  await this.constructor.calculateAverageAndQuantityRatings(this.product);
});

const reviewModel = mongoose.model("Review", reviewSchema);

module.exports = reviewModel;
