const asyncHandler = require("express-async-handler");
const userModel = require("../models/userModel");

// @desc    add address to user
// @route   POST => /api/v1/addresses
// @access  private/protected/user
exports.addAddress = asyncHandler(async (req, res) => {
  const user = await userModel.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { addresses: req.body },
    },
    { new: true }
  );
  res.status(200).json({
    success: true,
    message: "address added successfully",
    data: user.addresses,
  });
});

// @desc    delete address from user
// @route   delete => /api/v1/addresses/:id
// @access  private/protected/user
exports.updateAddress = asyncHandler(async (req, res) => {
  const user = await userModel.findById(req.user._id);
  const address = user.addresses.id(req.params.id);
  address.$set(req.body);
  await user.save();
  res.status(200).json({
    success: true,
    message: "address updated successfully",
    data: user.addresses.id(req.params.id),
  });
});

// @desc    delete address from user
// @route   delete => /api/v1/addresses/:id
// @access  private/protected/user
exports.deleteAddress = asyncHandler(async (req, res) => {
  const user = await userModel.findByIdAndUpdate(
    req.user._id,
    {
      // $pull => removing the product id from wishlist array if it is already exist (if not exist nth will happen)
      $pull: { addresses: { _id: req.params.id } },
    },
    { new: true }
  );
  res.status(200).json({
    success: true,
    message: "address removed successfully",
    data: user.addresses,
  });
});

// @desc    get logged user addresses
// @route   delete => /api/v1/addresses
// @access  private/protected/user
exports.getLoggedUserAddresses = asyncHandler(async (req, res) => {
  const user = await userModel.findById(req.user._id);
  res.status(200).json({ data: user.addresses });
});
