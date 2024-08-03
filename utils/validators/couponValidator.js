const { check } = require("express-validator");
const validationMiddleware = require("../../middlewares/validatorMiddleware");
const couponModel = require("../../models/couponModel");
const ApiError = require("../apiError");

// Rules + validation layer (middleware) to catch errors from rules if exist
exports.getCouponValidator = [
  check("id").isMongoId().withMessage("invalid coupon id format"),
  validationMiddleware,
];

// Rules + validation layer (middleware) to catch errors from rules if exist
exports.createCouponValidator = [
  check("name")
    .notEmpty()
    .withMessage("coupon name is required")
    .customSanitizer((name) => name.toUpperCase())
    .custom(async (name) => {
      const coupon = await couponModel.find({ name });
      if (coupon.length > 0) {
        throw new ApiError(`coupon name is duplicated`, 409);
      }
      return true;
    }),
  check("expirationDate").notEmpty().withMessage("expiration date is required"),
  check("discount")
    .notEmpty()
    .withMessage("expiration date is required")
    .isNumeric()
    .withMessage("discount must be a number"),
  validationMiddleware,
];

// Rules + validation layer (middleware) to catch errors from rules if exist
exports.updateCouponValidator = [
  check("id").isMongoId().withMessage("invalid coupon id format"),
  check("name")
    .optional()
    .customSanitizer((name) => name.toUpperCase())
    .custom(async (name) => {
      const coupon = await couponModel.find({ name });
      if (coupon.length > 0) {
        throw new ApiError(`coupon name is duplicated`, 409);
      }
      return true;
    }),
  check("expirationDate").optional(),
  check("discount")
    .optional()
    .isNumeric()
    .withMessage("discount must be a number"),
  validationMiddleware,
];

// Rules + validation layer (middleware) to catch errors from rules if exist
exports.deleteCouponValidator = [
  check("id").isMongoId().withMessage("invalid coupon id format"),
  validationMiddleware,
];
