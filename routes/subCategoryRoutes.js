const express = require("express");

const {
  createSubCategoryValidator,
  getSubCategoryValidator,
  updateSubCategoryValidator,
  deleteSubCategoryValidator,
} = require("../utils/validators/subCategoryValidator");
const { protect, allowedTo } = require("../services/authService");

// mergeParams => allow us to access parameters from another route
// example: we need to access the categoryId Parameter from the category route or category router
const router = express.Router({ mergeParams: true });
const {
  createSubCategory,
  getSubCategories,
  getSubCategoryById,
  updateSubCategory,
  deleteSubCategory,
  addingCategoryIdToBody,
} = require("../services/subCategoryService");

router
  .route("/")
  .get(getSubCategories)
  .post(
    protect,
    allowedTo("admin", "manager"),
    addingCategoryIdToBody,
    createSubCategoryValidator,
    createSubCategory
  );
router
  .route("/:id")
  .get(getSubCategoryValidator, getSubCategoryById)
  .put(
    protect,
    allowedTo("admin", "manager"),
    updateSubCategoryValidator,
    updateSubCategory
  )
  .delete(
    protect,
    allowedTo("admin"),
    deleteSubCategoryValidator,
    deleteSubCategory
  );

module.exports = router;
