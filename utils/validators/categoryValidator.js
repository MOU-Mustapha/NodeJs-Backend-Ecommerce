const slugify = require("slugify");
const { check } = require("express-validator");
const validationMiddleware = require("../../middlewares/validatorMiddleware");
const categoryModel = require("../../models/categoryModel");
const ApiError = require("../apiError");

// Rules + validation layer (middleware) to catch errors from rules if exist
exports.getCategoryValidator = [
  check("id").isMongoId().withMessage("invalid category id format"),
  validationMiddleware,
];

// Rules + validation layer (middleware) to catch errors from rules if exist
exports.createCategoryValidator = [
  check("name")
    .notEmpty()
    .withMessage("category name is required")
    .isLength({
      min: 3,
      max: 32,
    })
    .withMessage("category name must be between 3 to 32 characters")
    .custom(async (name) => {
      const allCategories = await categoryModel.find({ name });
      if (allCategories.length > 0) {
        throw new ApiError(`name is duplicated`, 409);
      }
    })
    .custom(async (name, { req }) => {
      req.body.slug = slugify(name);
    }),
  validationMiddleware,
];

// Rules + validation layer (middleware) to catch errors from rules if exist
exports.updateCategoryValidator = [
  check("id").isMongoId().withMessage("invalid category id format"),
  check("name")
    .optional()
    .isLength({
      min: 3,
      max: 32,
    })
    .withMessage("category name must be between 3 to 32 characters")
    .custom(async (name) => {
      const allCategories = await categoryModel.find({ name });
      if (allCategories.length > 0) {
        throw new ApiError(`name is duplicated`, 409);
      }
    })
    .custom(async (name, { req }) => {
      req.body.slug = slugify(name);
    }),
  validationMiddleware,
];

// Rules + validation layer (middleware) to catch errors from rules if exist
exports.deleteCategoryValidator = [
  check("id").isMongoId().withMessage("invalid category id format"),
  validationMiddleware,
];
