const express = require("express");

const router = express.Router();
const {
  createCashOrder,
  checkUserRole,
  getAllOrders,
  getOrderById,
  changeOrderStatusToPaid,
  changeOrderStatusToDelivered,
  createCheckoutSession,
} = require("../services/orderService");
const { protect, allowedTo } = require("../services/authService");

router
  .route("/")
  .get(protect, checkUserRole, getAllOrders)
  .post(protect, allowedTo("user"), createCashOrder);

router.route("/:id").get(protect, getOrderById);
router.put(
  "/pay/:orderId",
  protect,
  allowedTo("admin", "manager"),
  changeOrderStatusToPaid
);
router.put(
  "/delivery/:orderId",
  protect,
  allowedTo("admin", "manager"),
  changeOrderStatusToDelivered
);
router.post(
  "/checkout-session",
  protect,
  allowedTo("user"),
  createCheckoutSession
);

module.exports = router;
