const express = require("express");
const {
  getProductValidator,
  createProductValidator,
  updateCategoryValidator,
  deleteCategoryValidator,
} = require("../utils/validators/productValidator");

const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
  resizeProductImages,
} = require("../services/productService");
const { protect, allowedTo } = require("../services/authService");

router
  .route("/")
  .get(getProducts)
  .post(
    protect,
    allowedTo("admin", "manager"),
    uploadProductImages,
    resizeProductImages,
    createProductValidator,
    createProduct
  );
router
  .route("/:id")
  .get(getProductValidator, getProductById)
  .put(
    protect,
    allowedTo("admin", "manager"),
    uploadProductImages,
    resizeProductImages,
    updateCategoryValidator,
    updateProduct
  )
  .delete(protect, allowedTo("admin"), deleteCategoryValidator, deleteProduct);

module.exports = router;
