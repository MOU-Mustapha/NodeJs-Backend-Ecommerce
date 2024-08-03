const { check } = require("express-validator");
const validationMiddleware = require("../../middlewares/validatorMiddleware");
const reviewModel = require("../../models/reviewModel");
const ApiError = require("../apiError");

// Rules + validation layer (middleware) to catch errors from rules if exist
exports.getReviewValidator = [
  check("id").isMongoId().withMessage("invalid review id format"),
  validationMiddleware,
];

// Rules + validation layer (middleware) to catch errors from rules if exist
exports.createReviewValidator = [
  check("content")
    .notEmpty()
    .withMessage("review content is required")
    .isLength({
      min: 3,
      max: 500,
    })
    .withMessage("review content must be between 3 to 500 characters"),
  check("rating")
    .notEmpty()
    .withMessage("review rating is required")
    .isFloat()
    .withMessage("ratings must be a number")
    .isLength({ min: 1 })
    .withMessage("minimum rating is 1")
    .isLength({ max: 5 })
    .withMessage("maximum rating is 5"),
  check("reviewUser")
    .notEmpty()
    .withMessage("user id is required")
    .isMongoId()
    .withMessage("invalid user id format"),
  check("product")
    .notEmpty()
    .withMessage("product id is required")
    .isMongoId()
    .withMessage("invalid product id format")
    .custom(async (productId, { req }) => {
      // check if the user add a review before to this product
      const review = await reviewModel.findOne({
        product: productId,
        reviewUser: req.user._id,
      });
      if (review) {
        throw new ApiError("you can't add a review again to this product", 400);
      }
      return true;
    }),
  validationMiddleware,
];

// Rules + validation layer (middleware) to catch errors from rules if exist
exports.updateReviewValidator = [
  check("id")
    .isMongoId()
    .withMessage("invalid review id format")
    .custom(async (reviewId, { req }) => {
      const review = await reviewModel.findOne({
        _id: reviewId,
        reviewUser: req.user._id,
      });
      if (!review) {
        throw new ApiError(
          `no review found for this id: ${reviewId} or you are not allowed to update this review`,
          404
        );
      }
      return true;
    }),
  check("content")
    .optional()
    .isLength({
      min: 3,
      max: 500,
    })
    .withMessage("review content must be between 3 to 500 characters"),
  check("rating")
    .optional()
    .isFloat()
    .withMessage("ratings must be a number")
    .isLength({ min: 1 })
    .withMessage("minimum rating is 1")
    .isLength({ max: 5 })
    .withMessage("maximum rating is 5"),
  validationMiddleware,
];

// Rules + validation layer (middleware) to catch errors from rules if exist
exports.deleteReviewValidator = [
  check("id")
    .isMongoId()
    .withMessage("invalid review id format")
    .custom(async (reviewId, { req }) => {
      if (req.user.role === "user") {
        const review = await reviewModel.findOne({
          _id: reviewId,
          reviewUser: req.user._id,
        });
        if (!review) {
          throw new ApiError(
            `no review found for this id: ${reviewId} or you are not allowed to delete this review`,
            404
          );
        }
      }
      return true;
    }),
  validationMiddleware,
];
