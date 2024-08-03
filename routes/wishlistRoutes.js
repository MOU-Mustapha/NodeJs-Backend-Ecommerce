const express = require("express");
const { protect, allowedTo } = require("../services/authService");
const {
  addProductToWishlistValidator,
  deleteProductFromWishlistValidator,
} = require("../utils/validators/wishlistValidator");
const {
  getLoggedUserWishlist,
  addProductToWishlist,
  deleteProductFromWishlist,
} = require("../services/wishlistService");

const router = express.Router();

router.use(protect, allowedTo("user"));

router
  .route("/")
  .get(getLoggedUserWishlist)
  .post(addProductToWishlistValidator, addProductToWishlist);
router.delete(
  "/:id",
  deleteProductFromWishlistValidator,
  deleteProductFromWishlist
);

module.exports = router;
