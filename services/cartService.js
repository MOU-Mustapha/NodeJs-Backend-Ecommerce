const asyncHandler = require("express-async-handler");
const cartModel = require("../models/cartModel");
const couponModel = require("../models/couponModel");
const productModel = require("../models/productModel");
const ApiError = require("../utils/apiError");

// @desc    add product to cart
// @route   POST => /api/v1/cart
// @access  private/protected/user

exports.addProductToCart = asyncHandler(async (req, res) => {
  const { productId, color, quantity } = req.body;
  // get user cart if exist
  const userCart = await cartModel.findOne({ user: req.user._id });
  const product = await productModel.findById(productId);
  if (!userCart) {
    // create new cart for this user
    const newCart = await cartModel.create({
      user: req.user._id,
      cartItems: [
        {
          product: productId,
          color,
          quantity,
          price: product.price,
        },
      ],
      totalPrice: product.price * quantity,
      totalPriceAfterDiscount: undefined,
    });
    res.status(200).json({
      success: true,
      message: "product added successfully to cart",
      data: newCart,
    });
  } else {
    // update existing cart
    const productExist = userCart.cartItems.find(
      (item) =>
        item.product._id.toString() === productId && item.color === color
    );
    if (productExist) {
      // 1- product already exist in cart, update product quantity
      productExist.quantity += +quantity;
    } else {
      // 2- product dose not exist in cart, add product to cart
      userCart.cartItems.push({
        product: productId,
        color,
        quantity,
        price: product.price,
      });
    }
    // calculate total cart price
    let totalPrice = 0;
    userCart.cartItems.forEach((item) => {
      totalPrice += item.price * item.quantity;
    });
    userCart.totalPrice = totalPrice;
    userCart.totalPriceAfterDiscount = undefined;
    await userCart.save();
    res.status(200).json({
      success: true,
      message: "product added successfully to cart",
    });
  }
});

// @desc    get user cart
// @route   GET => /api/v1/cart
// @access  private/protected/user

exports.getUserCart = asyncHandler(async (req, res) => {
  const userCart = await cartModel.findOne({ user: req.user._id });
  res.status(200).json({ data: userCart || [] });
});

// @desc    delete product from cart
// @route   delete => /api/v1/cart/:id
// @access  private/protected/user

exports.deleteProductFromCart = asyncHandler(async (req, res) => {
  const userCart = await cartModel.findOneAndUpdate(
    { user: req.user._id },
    {
      // $pull => removing the product id from wishlist array if it is already exist (if not exist nth will happen)
      $pull: {
        cartItems: {
          _id: req.params.id,
        },
      },
    },
    { new: true }
  );
  let totalPrice = 0;
  userCart.cartItems.forEach((item) => {
    totalPrice += item.price * item.quantity;
  });
  userCart.totalPrice = totalPrice;
  userCart.totalPriceAfterDiscount = undefined;
  await userCart.save();
  res.status(200).json({
    success: true,
    message: "product removed successfully from cart",
    data: userCart.cartItems,
  });
});

// @desc    clear user cart
// @route   delete => /api/v1/cart
// @access  private/protected/user

exports.clearUserCart = asyncHandler(async (req, res) => {
  await cartModel.findOneAndDelete({ user: req.user._id });
  res.status(200).json({
    success: true,
    message: "cart cleared successfully",
  });
});

// @desc    update product quantity in cart
// @route   delete => /api/v1/cart/:id
// @access  private/protected/user

exports.updateProductQuantity = asyncHandler(async (req, res, next) => {
  const { quantity } = req.body;
  const { id } = req.params;
  const userCart = await cartModel.findOne({ user: req.user._id });
  const productExist = userCart.cartItems.find(
    (item) => item._id.toString() === id
  );
  if (!productExist) {
    return next(new ApiError(`no record found in the cart for this id: ${id}`));
  }
  productExist.quantity = quantity;
  let totalPrice = 0;
  userCart.cartItems.forEach((item) => {
    totalPrice += item.price * item.quantity;
  });
  userCart.totalPrice = totalPrice;
  userCart.totalPriceAfterDiscount = undefined;
  await userCart.save();
  res.status(200).json({
    success: true,
    message: "product quantity updated successfully",
  });
});

// @desc    apply coupon on cart
// @route   delete => /api/v1/cart/applyCoupon
// @access  private/protected/user

exports.applyCouponOnCart = asyncHandler(async (req, res, next) => {
  // get the coupon from database
  const coupon = await couponModel.findOne({
    name: req.body.couponName,
    expirationDate: { $gt: Date.now() },
  });
  if (!coupon) {
    return next(
      new ApiError(
        `no coupon found for this name: ${req.body.couponName} or this coupon is expired`
      )
    );
  }
  // get the user cart to calculate the price after discount
  const userCart = await cartModel.findOne({ user: req.user._id });
  const { totalPrice } = userCart;
  // calculate the price after discount
  userCart.totalPriceAfterDiscount =
    totalPrice - totalPrice * (coupon.discount / 100);
  await userCart.save();
  res.status(200).json({
    success: true,
    message: "coupon applied successfully",
  });
});
