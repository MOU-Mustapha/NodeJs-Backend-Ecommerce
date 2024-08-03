const slugify = require("slugify");
const { check } = require("express-validator");
const validationMiddleware = require("../../middlewares/validatorMiddleware");
const categoryModel = require("../../models/categoryModel");
const subcategoryModel = require("../../models/subCategoryModel");
const productModel = require("../../models/productModel");
const ApiError = require("../apiError");

// Rules + validation layer (middleware) to catch errors from rules if exist
exports.getProductValidator = [
  check("id").isMongoId().withMessage("invalid product id format"),
  validationMiddleware,
];

// Rules + validation layer (middleware) to catch errors from rules if exist
exports.createProductValidator = [
  check("title")
    .notEmpty()
    .withMessage("product title is required")
    .isLength({
      min: 3,
      max: 100,
    })
    .withMessage("product title must be between 3 to 100 characters")
    .custom(async (title) => {
      const allProducts = await productModel.find({ title });
      if (allProducts.length > 0) {
        throw new ApiError(`title is duplicated`, 409);
      }
    })
    .custom(async (title, { req }) => {
      req.body.slug = slugify(title);
    }),
  check("description")
    .notEmpty()
    .withMessage("product description is required")
    .isLength({
      min: 20,
    })
    .withMessage("product description must be at least 20 characters"),
  check("quantity")
    .notEmpty()
    .withMessage("product quantity is required")
    .isNumeric()
    .withMessage("product quantity must be a number"),
  check("price")
    .notEmpty()
    .withMessage("product price is required")
    .isNumeric()
    .withMessage("product price must be a number"),
  check("priceAfterDiscount")
    .optional()
    .isNumeric()
    .withMessage("product price after discount must be a number")
    .toFloat()
    .custom((value, { req }) => {
      if (req.body.price <= value) {
        throw new Error(
          "product price after discount must be less than product price"
        );
      } else {
        return true;
      }
    }),
  check("colors")
    .optional()
    .isArray()
    .withMessage("colors must be an array of strings"),
  check("imageCover").notEmpty().withMessage("product image cover is required"),
  check("images")
    .optional()
    .isArray()
    .withMessage("images must be an array of strings"),
  check("category")
    .notEmpty()
    .withMessage("product must belong to parent category")
    .isMongoId()
    .withMessage("invalid category id format")
    .custom(async (categoryId) => {
      const category = await categoryModel.findById(categoryId);
      if (!category) {
        throw new ApiError(`no category found for this id: ${categoryId}`);
      }
    }),
  check("subCategories")
    .optional()
    .isArray()
    .withMessage("subcategories must be an array of strings")
    .isMongoId()
    .withMessage("invalid subcategories ids format")
    .custom(async (subCategoriesIds) => {
      const subCategories = await subcategoryModel.find({
        _id: { $exists: true, $in: subCategoriesIds },
      });
      if (subCategories.length !== subCategoriesIds.length) {
        throw new ApiError(`Invalid subcategories ids`);
      }
    })
    .custom(async (subCategoriesIds, { req }) => {
      const subCategories = await subcategoryModel.find({
        category: req.body.category,
      });
      const subCategoriesIdsRelatedToCategory = [];
      subCategories.forEach((subCat) => {
        subCategoriesIdsRelatedToCategory.push(subCat._id.toString());
      });
      const checkSubCategoriesRelatedToCategory = subCategoriesIds.every((id) =>
        subCategoriesIdsRelatedToCategory.includes(id)
      );
      if (!checkSubCategoriesRelatedToCategory) {
        throw new ApiError(`subcategories ids not belong to category`);
      }
    }),
  check("brand").optional().isMongoId().withMessage("invalid brand id format"),
  check("ratingsAverage")
    .optional()
    .isNumeric()
    .withMessage("ratings average must be a number")
    .isLength({ min: 1 })
    .withMessage("minimum rating is 1")
    .isLength({ max: 5 })
    .withMessage("maximum rating is 5"),
  check("ratingsQuantity")
    .optional()
    .isNumeric()
    .withMessage("ratings quantity must be a number"),
  validationMiddleware,
];

// Rules + validation layer (middleware) to catch errors from rules if exist
exports.updateCategoryValidator = [
  check("id").isMongoId().withMessage("invalid product id format"),
  check("title")
    .optional()
    .isLength({
      min: 3,
      max: 100,
    })
    .withMessage("product title must be between 3 to 100 characters")
    .custom(async (title) => {
      const allProducts = await productModel.find({ title });
      if (allProducts.length > 0) {
        throw new ApiError(`title is duplicated`);
      }
    })
    .custom(async (title, { req }) => {
      req.body.slug = slugify(title);
    }),
  check("description")
    .optional()
    .isLength({
      min: 20,
    })
    .withMessage("product description must be at least 20 characters"),
  check("quantity")
    .optional()
    .isNumeric()
    .withMessage("product quantity must be a number"),
  check("price")
    .optional()
    .isNumeric()
    .withMessage("product price must be a number"),
  check("priceAfterDiscount")
    .optional()
    .isNumeric()
    .withMessage("product price after discount must be a number")
    .toFloat()
    .custom((value, { req }) => {
      if (req.body.price <= value) {
        throw new Error(
          "product price after discount must be less than product price"
        );
      } else {
        return true;
      }
    }),
  check("colors")
    .optional()
    .isArray()
    .withMessage("colors must be an array of strings"),
  check("imageCover").optional(),
  check("images")
    .optional()
    .isArray()
    .withMessage("images must be an array of strings"),
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
  check("subCategories")
    .optional()
    .isArray()
    .withMessage("subCategory must be an array of strings")
    .isMongoId()
    .withMessage("invalid subcategory id format")
    .custom(async (subCategoriesIds) => {
      const subCategories = await subcategoryModel.find({
        _id: { $exists: true, $in: subCategoriesIds },
      });
      if (subCategories.length !== subCategoriesIds.length) {
        throw new ApiError(`Invalid subcategories ids`);
      }
    })
    .custom(async (subCategoriesIds, { req }) => {
      const subCategories = await subcategoryModel.find({
        category: req.body.category,
      });
      const subCategoriesIdsRelatedToCategory = [];
      subCategories.forEach((subCat) => {
        subCategoriesIdsRelatedToCategory.push(subCat._id.toString());
      });
      const checkSubCategoriesRelatedToCategory = subCategoriesIds.every((id) =>
        subCategoriesIdsRelatedToCategory.includes(id)
      );
      if (!checkSubCategoriesRelatedToCategory) {
        throw new ApiError(`subcategories ids not belong to category`);
      }
    }),
  check("brand").optional().isMongoId().withMessage("invalid brand id format"),
  check("ratingsAverage")
    .optional()
    .isNumeric()
    .withMessage("ratings average must be a number")
    .isLength({ min: 1 })
    .withMessage("minimum rating is 1")
    .isLength({ max: 5 })
    .withMessage("maximum rating is 5"),
  check("ratingsQuantity")
    .optional()
    .isNumeric()
    .withMessage("ratings quantity must be a number"),
  validationMiddleware,
];

// Rules + validation layer (middleware) to catch errors from rules if exist
exports.deleteCategoryValidator = [
  check("id").isMongoId().withMessage("invalid product id format"),
  validationMiddleware,
];
