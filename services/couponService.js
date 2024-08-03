const couponModel = require("../models/couponModel");
const {
  deleteOne,
  updateOne,
  createOne,
  getOneById,
  getAll,
} = require("./handlersFactory");

// @desc    get all coupons
// @route   GET => /api/v1/coupons
// @access  private/admin-manager

exports.getCoupons = getAll(couponModel);

// @desc    get specific coupon
// @route   GET => /api/v1/coupons/{couponId}
// @access  private/admin-manager

exports.getCouponById = getOneById(couponModel);

// @desc    create coupon
// @route   POST => /api/v1/coupons
// @access  private/admin-manager

exports.createCoupon = createOne(couponModel);

// @desc    Update Specific coupon
// @route   PUT => /api/v1/coupons/{couponId}
// @access  private/admin-manager

exports.updateCoupon = updateOne(couponModel);

// @desc    Delete Specific coupon
// @route   DELETE => /api/v1/coupons/{couponId}
// @access  private/admin-manager

exports.deleteCoupon = deleteOne(couponModel);
