const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "coupon name is required"],
      unique: [true, "coupon must be unique"],
      trim: true,
    },
    expirationDate: {
      type: Date,
      required: [true, "coupon expiration is required"],
    },
    discount: {
      type: Number,
      required: [true, "coupon discount is required"],
      min: [1, "coupon discount must be greater than 0"],
      max: [99, "coupon discount must be less than 100"],
    },
  },
  { timestamps: true }
);

const couponModel = mongoose.model("Coupon", couponSchema);

module.exports = couponModel;
