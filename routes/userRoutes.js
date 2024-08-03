const express = require("express");
const {
  getUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  uploadUserImage,
  resizeImage,
  deactivateUser,
  activateUser,
  changeUserPassword,
  getLoggedUserData,
  updateLoggedUserPassword,
  updateLoggedUserData,
  deactivateLoggedUser,
} = require("../services/userService");
const {
  getUserValidator,
  createUserValidator,
  updateUserValidator,
  deleteUserValidator,
  updateUserPasswordValidator,
  deactivateAndActivateUserValidator,
  updateLoggedUserPasswordValidator,
  updateLoggedUserValidator,
} = require("../utils/validators/userValidator");
const { protect, allowedTo } = require("../services/authService");

const router = express.Router();

// logged user routes
router.get("/getLoggedUserData", protect, getLoggedUserData, getUserById);
router.put(
  "/changeLoggedUserPassword",
  protect,
  updateLoggedUserPasswordValidator,
  updateLoggedUserPassword
);
router.put(
  "/changeLoggedUserData",
  protect,
  uploadUserImage,
  resizeImage,
  updateLoggedUserValidator,
  updateLoggedUserData
);
router.put(
  "/deactivateLoggedUser",
  protect,
  deactivateLoggedUser,
  deactivateUser
);

router
  .route("/")
  .get(protect, allowedTo("admin"), getUsers)
  .post(
    protect,
    allowedTo("admin"),
    uploadUserImage,
    resizeImage,
    createUserValidator,
    createUser
  );
router
  .route("/:id")
  .get(protect, allowedTo("admin"), getUserValidator, getUserById)
  .put(
    protect,
    allowedTo("admin"),
    uploadUserImage,
    resizeImage,
    updateUserValidator,
    updateUser
  )
  .delete(protect, allowedTo("admin"), deleteUserValidator, deleteUser);
router.put(
  "/changePassword/:id",
  protect,
  allowedTo("admin"),
  updateUserPasswordValidator,
  changeUserPassword
);
router.put(
  "/deactivate/:id",
  protect,
  allowedTo("admin"),
  deactivateAndActivateUserValidator,
  deactivateUser
);
router.put(
  "/activate/:id",
  protect,
  allowedTo("admin"),
  deactivateAndActivateUserValidator,
  activateUser
);

module.exports = router;
