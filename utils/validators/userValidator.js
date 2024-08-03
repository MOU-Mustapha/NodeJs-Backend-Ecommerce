const slugify = require("slugify");
const bcrypt = require("bcryptjs");
const { check } = require("express-validator");
const validationMiddleware = require("../../middlewares/validatorMiddleware");
const userModel = require("../../models/userModel");
const ApiError = require("../apiError");

// Rules + validation layer (middleware) to catch errors from rules if exist
exports.getUserValidator = [
  check("id").isMongoId().withMessage("invalid user id format"),
  validationMiddleware,
];

// Rules + validation layer (middleware) to catch errors from rules if exist
exports.createUserValidator = [
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
  check("role").optional(),
  check("phoneNumber")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("invalid phone number, accept EG or SA phone numbers only"),
  validationMiddleware,
];

// Rules + validation layer (middleware) to catch errors from rules if exist

// update user data except password
exports.updateUserValidator = [
  check("id").isMongoId().withMessage("invalid User id format"),
  check("name")
    .optional()
    .custom(async (name, { req }) => {
      req.body.slug = slugify(name);
    }),
  check("email")
    .optional()
    .isEmail()
    .withMessage("invalid email format")
    .custom(async (email) => {
      const user = await userModel.find({ email });
      if (user.length > 0) {
        throw new ApiError(`email is duplicated`, 409);
      }
    }),
  check("profileImage").optional(),
  check("role").optional(),
  check("phoneNumber")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("invalid phone number"),
  validationMiddleware,
];
// update user password
exports.updateUserPasswordValidator = [
  check("id").isMongoId().withMessage("invalid User id format"),
  check("currentPassword")
    .notEmpty()
    .withMessage("current password is required")
    .custom(async (currentPass, { req }) => {
      const user = await userModel.findById(req.params.id);
      if (!user) {
        throw new ApiError(`no user found with this id: ${req.params.id}`, 400);
      }
      const isMatch = await bcrypt.compare(currentPass, user.password);
      if (!isMatch) {
        throw new ApiError(`incorrect current password`, 400);
      }
      return true;
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
  validationMiddleware,
];
// Rules + validation layer (middleware) to catch errors from rules if exist
exports.deleteUserValidator = [
  check("id").isMongoId().withMessage("invalid User id format"),
  validationMiddleware,
];
exports.deactivateAndActivateUserValidator = [
  check("id").isMongoId().withMessage("invalid User id format"),
  validationMiddleware,
];

// update Logged user password
exports.updateLoggedUserPasswordValidator = [
  check("currentPassword")
    .notEmpty()
    .withMessage("current password is required")
    .custom(async (currentPass, { req }) => {
      const user = await userModel.findById(req.user._id);
      if (!user) {
        throw new ApiError(`no user found with this id: ${req.user._id}`, 400);
      }
      const isMatch = await bcrypt.compare(currentPass, user.password);
      if (!isMatch) {
        throw new ApiError(`incorrect current password`, 400);
      }
      return true;
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
  validationMiddleware,
];

// update Logged user Data
exports.updateLoggedUserValidator = [
  check("name")
    .optional()
    .custom(async (name, { req }) => {
      req.body.slug = slugify(name);
    }),
  check("email")
    .optional()
    .isEmail()
    .withMessage("invalid email format")
    .custom(async (email) => {
      const user = await userModel.find({ email });
      if (user.length > 0) {
        throw new ApiError(`email is duplicated`, 409);
      }
    }),
  check("profileImage").optional(),
  check("phoneNumber")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("invalid phone number"),
  validationMiddleware,
];
