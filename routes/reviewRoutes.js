const express = require("express");
const {
  getReviews,
  addingUserIdToCreateReview,
  createReview,
  getReviewById,
  updateReview,
  deleteReview,
} = require("../services/reviewService");
const { protect, allowedTo } = require("../services/authService");
const {
  getReviewValidator,
  deleteReviewValidator,
  createReviewValidator,
  updateReviewValidator,
} = require("../utils/validators/reviewValidator");

const router = express.Router();

router
  .route("/")
  .get(getReviews)
  .post(
    protect,
    allowedTo("user"),
    addingUserIdToCreateReview,
    createReviewValidator,
    createReview
  );
router
  .route("/:id")
  .get(getReviewValidator, getReviewById)
  .put(protect, allowedTo("user"), updateReviewValidator, updateReview)
  .delete(
    protect,
    allowedTo("user", "admin", "manager"),
    deleteReviewValidator,
    deleteReview
  );

module.exports = router;
