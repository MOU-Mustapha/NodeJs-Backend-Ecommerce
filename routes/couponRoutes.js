const express = require("express");
const {
  getCouponValidator,
  createCouponValidator,
  updateCouponValidator,
  deleteCouponValidator,
} = require("../utils/validators/couponValidator");

const router = express.Router();
const {
  getCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} = require("../services/couponService");
const { protect, allowedTo } = require("../services/authService");

router.use(protect, allowedTo("admin", "manager"));
router.route("/").get(getCoupons).post(createCouponValidator, createCoupon);
router
  .route("/:id")
  .get(getCouponValidator, getCouponById)
  .put(updateCouponValidator, updateCoupon)
  .delete(deleteCouponValidator, deleteCoupon);

module.exports = router;
