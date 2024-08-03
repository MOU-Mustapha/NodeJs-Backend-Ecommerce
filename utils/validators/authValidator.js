const slugify = require("slugify");
const { check } = require("express-validator");
const validationMiddleware = require("../../middlewares/validatorMiddleware");
const userModel = require("../../models/userModel");
const ApiError = require("../apiError");

// Rules + validation layer (middleware) to catch errors from rules if exist
exports.signupValidator = [
  check("name")
    .notEmpty()
    .withMessage("User name is required")
    .custom(async (name, { req }) => {
      req.body.slug = slugify(name);
    }),
  check("email")
    .notEmpty()
    .withMessage("User email is required")
    .isEmail()
    .withMessage("invalid email format")
    .custom(async (email) => {
      const user = await userModel.find({ email });
      if (user.length > 0) {
        throw new ApiError(`email is duplicated`, 409);
      }
    }),
  check("password")
    .notEmpty()
    .withMessage("password is required")
    .isLength({ min: 6 })
    .withMessage("password must be at least 6 characters"),
  check("passwordConfirm")
    .notEmpty()
    .withMessage("confirmation password is required")
    .custom((passConfirm, { req }) => {
      if (passConfirm !== req.body.password) {
        throw new ApiError(
          `password and confirmation password do not match`,
          400
        );
      }
      return true;
    }),
  check("profileImage").optional(),
  check("phoneNumber")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("invalid phone number, accept EG or SA phone numbers only"),
  validationMiddleware,
];

exports.loginValidator = [
  check("email")
    .notEmpty()
    .withMessage("User email is required")
    .isEmail()
    .withMessage("invalid email format"),
  check("password").notEmpty().withMessage("password is required"),
  validationMiddleware,
];

exports.forgetPasswordValidator = [
  check("email")
    .notEmpty()
    .withMessage("User email is required")
    .isEmail()
    .withMessage("invalid email format"),
  validationMiddleware,
];

exports.resetPasswordValidator = [
  check("email")
    .notEmpty()
    .withMessage("User email is required")
    .isEmail()
    .withMessage("invalid email format"),
  check("newPassword")
    .notEmpty()
    .withMessage("new password is required")
    .isLength({ min: 6 })
    .withMessage("new password must be at least 6 characters"),
  check("passwordConfirm")
    .notEmpty()
    .withMessage("confirmation password is required")
    .custom((passConfirm, { req }) => {
      if (passConfirm !== req.body.newPassword) {
        throw new ApiError(
          `new password and confirmation password do not match`,
          400
        );
      }
      return true;
    }),
  validationMiddleware,
];
