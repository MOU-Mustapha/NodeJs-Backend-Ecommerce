const asyncHandler = require("express-async-handler");
const userModel = require("../models/userModel");

// @desc    add product to wishlist
// @route   POST => /api/v1/wishlist
// @access  private/protected/user
exports.addProductToWishlist = asyncHandler(async (req, res) => {
  const user = await userModel.findByIdAndUpdate(
    req.user._id,
    {
      // $addToSet => adding the product id to wishlist array if it is not already exist (if exist before nth will happen)
      $addToSet: { wishlist: req.body.productId },
    },
    { new: true }
  );
  res.status(200).json({
    success: true,
    message: "product added successfully to wishlist",
    data: user.wishlist,
  });
});

// @desc    delete product from wishlist
// @route   delete => /api/v1/wishlist/:id
// @access  private/protected/user
exports.deleteProductFromWishlist = asyncHandler(async (req, res) => {
  const user = await userModel.findByIdAndUpdate(
    req.user._id,
    {
      // $pull => removing the product id from wishlist array if it is already exist (if not exist nth will happen)
      $pull: { wishlist: req.params.id },
    },
    { new: true }
  );
  res.status(200).json({
    success: true,
    message: "product removed successfully from wishlist",
    data: user.wishlist,
  });
});

// @desc    get logged user wishlist
// @route   delete => /api/v1/wishlist
// @access  private/protected/user
exports.getLoggedUserWishlist = asyncHandler(async (req, res) => {
  const user = await userModel.findById(req.user._id).populate("wishlist");
  res.status(200).json({ data: user.wishlist });
});
