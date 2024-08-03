const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "order must belong to user"],
    },
    cartItems: [
      {
        product: {
          type: mongoose.Schema.ObjectId,
          ref: "Product",
        },
        quantity: Number,
        color: String,
        price: Number,
      },
    ],
    taxPrice: {
      type: Number,
      default: 0,
    },
    shippingPrice: {
      type: Number,
      default: 0,
    },
    totalOrderPrice: Number,
    paymentType: {
      type: String,
      enum: ["cash", "visa"],
      default: "cash",
    },
    shippingAddress: {
      id: mongoose.Schema.Types.ObjectId,
      alias: String,
      details: String,
      phoneNumber: String,
      city: String,
      postalCode: String,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: Date,
    isDelivered: {
      type: Boolean,
      default: false,
    },
    deliveredAt: Date,
  },
  { timestamps: true }
);

orderSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name email phoneNumber profileImage",
  }).populate("cartItems.product");
  next();
});

const orderModel = mongoose.model("Order", orderSchema);

module.exports = orderModel;
