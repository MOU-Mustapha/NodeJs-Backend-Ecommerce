const express = require("express");
const {
  signup,
  uploadUserImage,
  resizeImage,
  login,
  forgetPassword,
  verifyPasswordResetCode,
  resetPassword,
} = require("../services/authService");
const {
  signupValidator,
  loginValidator,
  forgetPasswordValidator,
  resetPasswordValidator,
} = require("../utils/validators/authValidator");

const router = express.Router();

router.post("/signup", uploadUserImage, resizeImage, signupValidator, signup);
router.post("/login", loginValidator, login);
router.post("/forgetPassword", forgetPasswordValidator, forgetPassword);
router.post("/verifyResetCode", verifyPasswordResetCode);
router.put("/resetPassword", resetPasswordValidator, resetPassword);

module.exports = router;
