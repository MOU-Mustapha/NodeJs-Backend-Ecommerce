const express = require("express");

const router = express.Router();
const {
  addProductToCart,
  getUserCart,
  deleteProductFromCart,
  clearUserCart,
  updateProductQuantity,
  applyCouponOnCart,
} = require("../services/cartService");
const { protect, allowedTo } = require("../services/authService");

router.use(protect, allowedTo("user"));
router.route("/").get(getUserCart).post(addProductToCart).delete(clearUserCart);
router.route("/:id").put(updateProductQuantity).delete(deleteProductFromCart);
router.post("/applyCoupon", applyCouponOnCart);

module.exports = router;
