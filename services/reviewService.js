const asyncHandler = require("express-async-handler");
const reviewModel = require("../models/reviewModel");
const {
  deleteOne,
  updateOne,
  createOne,
  getOneById,
  getAll,
} = require("./handlersFactory");

// @desc    get all reviews
// @route   GET => /api/v1/reviews
// @access  public

exports.getReviews = getAll(reviewModel, undefined, "product");

// @desc    get specific review
// @route   GET => /api/v1/reviews/{reviewId}
// @access  public

exports.getReviewById = getOneById(reviewModel);

// @desc    create review
// @route   POST => /api/v1/reviews
// @access  Private/protected/user

exports.addingUserIdToCreateReview = asyncHandler((req, res, next) => {
  req.body.reviewUser = req.user._id;
  next();
});
exports.createReview = createOne(reviewModel);

// @desc    Update Specific review
// @route   PUT => /api/v1/reviews/{reviewId}
// @access  Private/protected/user

exports.updateReview = updateOne(reviewModel);

// @desc    Delete Specific review
// @route   DELETE => /api/v1/reviews/{reviewId}
// @access  Private/protected/user-admin-manager

// with delete factory
exports.deleteReview = deleteOne(reviewModel);
