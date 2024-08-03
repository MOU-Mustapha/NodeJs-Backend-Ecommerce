const slugify = require("slugify");
const { check } = require("express-validator");
const validationMiddleware = require("../../middlewares/validatorMiddleware");
const categoryModel = require("../../models/categoryModel");
const subCategoryModel = require("../../models/subCategoryModel");
const ApiError = require("../apiError");

// Rules + validation layer (middleware) to catch errors from rules if exist
exports.getSubCategoryValidator = [
  check("id").isMongoId().withMessage("invalid subcategory id format"),
  validationMiddleware,
];

// Rules + validation layer (middleware) to catch errors from rules if exist
exports.createSubCategoryValidator = [
  check("name")
    .notEmpty()
    .withMessage("subcategory name is required")
    .isLength({
      min: 2,
      max: 32,
    })
    .withMessage("subcategory name must be between 2 to 32 characters")
    .custom(async (name) => {
      const allSubCategories = await subCategoryModel.find({ name });
      if (allSubCategories.length > 0) {
        throw new ApiError(`name is duplicated`, 409);
      }
    })
    .custom(async (name, { req }) => {
      req.body.slug = slugify(name);
    }),
  check("category")
    .notEmpty()
    .withMessage("subcategory must belong to parent category")
    .isMongoId()
    .withMessage("invalid category id format")
    .custom(async (categoryId) => {
      const category = await categoryModel.findById(categoryId);
      if (!category) {
        throw new ApiError(`no category found for this id: ${categoryId}`);
      }
    }),
  validationMiddleware,
];

// Rules + validation layer (middleware) to catch errors from rules if exist
exports.updateSubCategoryValidator = [
  check("id").isMongoId().withMessage("invalid subcategory id format"),
  check("name")
    .optional()
    .isLength({
      min: 2,
      max: 32,
    })
    .withMessage("subcategory name must be between 2 to 32 characters")
    .custom(async (name) => {
      const allSubCategories = await subCategoryModel.find({ name });
      if (allSubCategories.length > 0) {
        throw new ApiError(`name is duplicated`, 409);
      }
    })
    .custom(async (name, { req }) => {
      req.body.slug = slugify(name);
    }),
  check("category")
    .optional()
    .isMongoId()
    .withMessage("invalid category id format")
    .custom(async (categoryId) => {
      const category = await categoryModel.findById(categoryId);
      if (!category) {
        throw new ApiError(`no category found for this id: ${categoryId}`);
      }
    }),
  validationMiddleware,
];

// Rules + validation layer (middleware) to catch errors from rules if exist
exports.deleteSubCategoryValidator = [
  check("id").isMongoId().withMessage("invalid subcategory id format"),
  validationMiddleware,
];
