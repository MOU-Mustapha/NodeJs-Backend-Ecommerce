const mongoose = require("mongoose");

// 1-create schema
const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "product title is required"],
      trim: true,
      minlength: [3, "too short product title"],
      maxlength: [100, "too long product title"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, "product description is required"],
      minlength: [20, "too short product description"],
    },
    quantity: {
      type: Number,
      required: [true, "product quantity is required"],
    },
    sold: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "product price is required"],
      trim: true,
    },
    priceAfterDiscount: {
      type: Number,
    },
    colors: {
      type: [String],
    },
    imageCover: {
      type: String,
      required: [true, "product image is required"],
    },
    images: {
      type: [String],
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "Category",
      required: [true, "product must belong to a category"],
    },
    subCategories: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "SubCategory",
      },
    ],
    brand: {
      type: mongoose.Schema.ObjectId,
      ref: "Brand",
    },
    ratingsAverage: {
      type: Number,
      default: 0,
      min: [1, "minimum rating is 1"],
      max: [5, "maximum rating is 5"],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    // to enable virtual populate
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.virtual("reviews", {
  // the review model
  ref: "Review",
  // the link between the review model and the product model is the product id (key name is product in review schema)
  foreignField: "product",
  // the field called product in the review schema equals the field called _id in the product schema
  localField: "_id",
});

// mongoose middleware for population
productSchema.pre(/^find/, function (next) {
  this.populate("category").populate("subCategories").populate("brand");
  next();
});

// return image url into the response
const setImageURL = (doc) => {
  // return the image field to be baseURL + imageName
  if (doc.imageCover) {
    const imageUrl = `${process.env.BASE_URL}/products/${doc.imageCover}`;
    doc.imageCover = imageUrl;
  }
  if (doc.images) {
    doc.images = doc.images.map((img) => {
      const imageUrl = `${process.env.BASE_URL}/products/${img}`;
      return imageUrl;
    });
  }
};

// getAll - getById - update
productSchema.post("init", (doc) => {
  setImageURL(doc);
});

// create
productSchema.post("save", (doc) => {
  setImageURL(doc);
});

// 2-convert schema to model
const productModel = mongoose.model("Product", productSchema);

module.exports = productModel;
