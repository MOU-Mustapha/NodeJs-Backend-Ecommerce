const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const asyncHandler = require("express-async-handler");
const orderModel = require("../models/orderModel");
const cartModel = require("../models/cartModel");
const productModel = require("../models/productModel");
const ApiError = require("../utils/apiError");
const { getOneById, getAll } = require("./handlersFactory");

// @desc    create cash order
// @route   post => /api/v1/orders
// @access  protected/user

exports.createCashOrder = asyncHandler(async (req, res, next) => {
  // get the cart depend on the user that logged in
  const cart = await cartModel.findOne({ user: req.user._id });
  if (!cart) {
    return next(new ApiError("There is no cart for this user", 404));
  }
  // we have to get the taxPrice and shipping price form the app settings but we will assume them
  const taxPrice = 0;
  const shippingPrice = 0;
  // get the order total price depend in the cartPrice or the cartPriceAfterDiscount
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalPrice;
  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;
  // get the specific address details
  const address = req.user.addresses.find(
    (add) => add._id.toString() === req.body.shippingAddress
  );
  // create the order with default payment type (cash)
  const order = await orderModel.create({
    user: req.user._id,
    cartItems: cart.cartItems,
    totalOrderPrice,
    shippingAddress: address,
  });
  // we have to update the products data (decrement the product quantity with the quantity sold in the order) and (increment the sold field with the quantity sold in the order)
  if (order) {
    const bulkOptions = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
      },
    }));
    await productModel.bulkWrite(bulkOptions, {});
    // clear the user cart
    await cartModel.findOneAndDelete({ user: req.user._id });
  }
  res.status(201).json({
    success: true,
    message: "cash order created successfully",
    data: order,
  });
});

// @desc    get all orders
// @route   post => /api/v1/orders
// @access  protected/user-admin-manager

exports.checkUserRole = asyncHandler(async (req, res, next) => {
  if (req.user.role === "user") {
    req.query.id = req.user._id;
  }
  next();
});
exports.getAllOrders = getAll(orderModel, undefined, "user");

// @desc    get specific order
// @route   post => /api/v1/orders/{orderId}
// @access  protected/user-admin-manager

exports.getOrderById = getOneById(orderModel);

// @desc    change order paid status to paid
// @route   post => /api/v1/orders/paid/{orderId}
// @access  protected/admin-manager

exports.changeOrderStatusToPaid = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const order = await orderModel.findByIdAndUpdate(
    orderId,
    {
      isPaid: true,
      paidAt: Date.now(),
    },
    {
      new: true,
    }
  );
  res.status(200).json({
    success: true,
    message: "order status changed to paid successfully",
    data: order,
  });
});

// @desc    change order delivery status to delivered
// @route   post => /api/v1/orders/delivery/{orderId}
// @access  protected/admin-manager

exports.changeOrderStatusToDelivered = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const order = await orderModel.findByIdAndUpdate(
    orderId,
    {
      isDelivered: true,
      deliveredAt: Date.now(),
    },
    {
      new: true,
    }
  );
  res.status(200).json({
    success: true,
    message: "order status changed to delivered successfully",
    data: order,
  });
});

// @desc    create checkout session from stripe and send it as a response
// @route   post => /api/v1/orders/checkout-session
// @access  protected/user

exports.createCheckoutSession = asyncHandler(async (req, res, next) => {
  const cart = await cartModel.findOne({ user: req.user._id });
  if (!cart) {
    return next(new ApiError("There is no cart for this user", 404));
  }
  const taxPrice = 0;
  const shippingPrice = 0;
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalPrice;
  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;
  const address = req.user.addresses.find(
    (add) => add._id.toString() === req.body.shippingAddress
  );
  // create stripe checkout session
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "egp",
          product_data: {
            name: req.user.name,
          },
          unit_amount: totalOrderPrice * 100, // by default stripe divide the price by 100
        },
        quantity: 1, // we send the total order price so we dun have to send the quantity
      },
    ],
    mode: "payment",
    success_url: `${req.protocol}://${req.get("host")}/orders`,
    cancel_url: `${req.protocol}://${req.get("host")}/cart`,
    customer_email: req.user.email,
    client_reference_id: cart._id.toString(), // because after the process is done i want to create the order so we need the cartId
    metadata: {
      alias: address.alias,
      details: address.details,
      phoneNumber: address.phoneNumber,
      city: address.city,
      postalCode: address.postalCode,
    },
  });
  // send the session as a response
  res.status(200).json({
    success: true,
    message: "Stripe checkout session created successfully",
    data: session,
  });
});
