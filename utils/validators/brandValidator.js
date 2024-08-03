const slugify = require("slugify");
const { check } = require("express-validator");
const validationMiddleware = require("../../middlewares/validatorMiddleware");
const brandModel = require("../../models/brandModel");
const ApiError = require("../apiError");

// Rules + validation layer (middleware) to catch errors from rules if exist
exports.getBrandValidator = [
  check("id").isMongoId().withMessage("invalid brand id format"),
  validationMiddleware,
];

// Rules + validation layer (middleware) to catch errors from rules if exist
exports.createBrandValidator = [
  check("name")
    .notEmpty()
    .withMessage("brand name is required")
    .isLength({
      min: 3,
      max: 32,
    })
    .withMessage("brand name must be between 3 to 32 characters")
    .custom(async (name) => {
      const allBrands = await brandModel.find({ name });
      if (allBrands.length > 0) {
        throw new ApiError(`name is duplicated`, 409);
      }
    })
    .custom(async (name, { req }) => {
      req.body.slug = slugify(name);
    }),
  validationMiddleware,
];

// Rules + validation layer (middleware) to catch errors from rules if exist
exports.updateBrandValidator = [
  check("id").isMongoId().withMessage("invalid brand id format"),
  check("name")
    .optional()
    .isLength({
      min: 3,
      max: 32,
    })
    .withMessage("brand name must be between 3 to 32 characters")
    .custom(async (name) => {
      const allBrands = await brandModel.find({ name });
      if (allBrands.length > 0) {
        throw new ApiError(`name is duplicated`, 409);
      }
    })
    .custom(async (name, { req }) => {
      req.body.slug = slugify(name);
    }),
  validationMiddleware,
];

// Rules + validation layer (middleware) to catch errors from rules if exist
exports.deleteBrandValidator = [
  check("id").isMongoId().withMessage("invalid brand id format"),
  validationMiddleware,
];
