const express = require("express");
const { protect, allowedTo } = require("../services/authService");

const {
  getLoggedUserAddresses,
  addAddress,
  deleteAddress,
  updateAddress,
} = require("../services/addressesServices");
const {
  deleteAddressValidator,
  addAddressValidator,
  updateAddressValidator,
} = require("../utils/validators/addressesValidator");

const router = express.Router();

router.use(protect, allowedTo("user"));

router
  .route("/")
  .get(getLoggedUserAddresses)
  .post(addAddressValidator, addAddress);
router
  .route("/:id")
  .put(updateAddressValidator, updateAddress)
  .delete(deleteAddressValidator, deleteAddress);

module.exports = router;
