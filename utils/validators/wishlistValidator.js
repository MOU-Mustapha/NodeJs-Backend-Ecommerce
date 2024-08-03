const { check } = require("express-validator");
const validationMiddleware = require("../../middlewares/validatorMiddleware");
const productModel = require("../../models/productModel");
const ApiError = require("../apiError");

// Rules + validation layer (middleware) to catch errors from rules if exist
exports.addProductToWishlistValidator = [
  check("productId")
    .notEmpty()
    .withMessage("productId is required")
    .isMongoId()
    .withMessage("invalid product id format")
    .custom(async (productId) => {
      const product = await productModel.findById(productId);
      if (!product) {
        throw new ApiError(`no product found for this id: ${productId}`);
      }
      return true;
    }),
  validationMiddleware,
];

// Rules + validation layer (middleware) to catch errors from rules if exist
exports.deleteProductFromWishlistValidator = [
  check("id")
    .isMongoId()
    .withMessage("invalid product id format")
    .custom(async (productId) => {
      const product = await productModel.findById(productId);
      if (!product) {
        throw new ApiError(`no product found for this id: ${productId}`);
      }
      return true;
    }),
  validationMiddleware,
];
