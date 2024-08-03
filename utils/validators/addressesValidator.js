const { check } = require("express-validator");
const validationMiddleware = require("../../middlewares/validatorMiddleware");
const userModel = require("../../models/userModel");
const ApiError = require("../apiError");

// Rules + validation layer (middleware) to catch errors from rules if exist
exports.addAddressValidator = [
  check("alias")
    .notEmpty()
    .withMessage("alias is required")
    .custom(async (value, { req }) => {
      const user = await userModel.findById(req.user._id);
      const addressExist = user.addresses.some(
        (address) => address.alias.toLowerCase() === value.toLowerCase()
      );
      if (addressExist) {
        throw new ApiError(
          `address with alias: ${req.body.alias} already exists`
        );
      }
      return true;
    }),
  check("details").notEmpty().withMessage("details is required"),
  check("phoneNumber").notEmpty().withMessage("phoneNumber is required"),
  check("city").notEmpty().withMessage("city is required"),
  check("postalCode").notEmpty().withMessage("postal code is required"),
  validationMiddleware,
];

// Rules + validation layer (middleware) to catch errors from rules if exist
exports.updateAddressValidator = [
  check("id")
    .isMongoId()
    .withMessage("invalid address id format")
    .custom(async (addressId, { req }) => {
      const user = await userModel.findById(req.user._id);
      const address = user.addresses.id(addressId);
      if (!address) {
        throw new ApiError(`no address found for this id: ${addressId}`);
      }
      return true;
    }),
  check("alias")
    .optional()
    .custom(async (value, { req }) => {
      const user = await userModel.findById(req.user._id);
      const addressExist = user.addresses.find(
        (address) => address.alias.toLowerCase() === value.toLowerCase()
      );
      if (addressExist && addressExist._id.toString() !== req.params.id) {
        throw new ApiError(
          `address with alias: ${req.body.alias} already exists`
        );
      }
      return true;
    }),
  check("details").optional(),
  check("phoneNumber").optional(),
  check("city").optional(),
  check("postalCode").optional(),
  validationMiddleware,
];

// Rules + validation layer (middleware) to catch errors from rules if exist
exports.deleteAddressValidator = [
  check("id")
    .isMongoId()
    .withMessage("invalid product id format")
    .custom(async (addressId, { req }) => {
      const user = await userModel.findById(req.user._id);
      const address = user.addresses.id(addressId);
      if (!address) {
        throw new ApiError(`no address found for this id: ${addressId}`);
      }
      return true;
    }),
  validationMiddleware,
];
