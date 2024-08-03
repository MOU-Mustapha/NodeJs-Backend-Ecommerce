const sharp = require("sharp");
const jwt = require("jsonwebtoken");
const { v4: uuid4 } = require("uuid");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const userModel = require("../models/userModel");
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");
const {
  getAll,
  getOneById,
  createOne,
  deleteOne,
} = require("./handlersFactory");
const ApiError = require("../utils/apiError");

exports.uploadUserImage = uploadSingleImage("profileImage");
exports.resizeImage = asyncHandler(async (req, res, next) => {
  if (req.file) {
    const fileName = `user-${uuid4()}-${Date.now()}.jpeg`;
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`uploads/users/${fileName}`);
    // add the imageName to the body to save the imageName into the database
    req.body.profileImage = fileName;
  }
  next();
});

// @desc    get all users
// @route   GET => /api/v1/users
// @access  private
exports.getUsers = getAll(userModel);

// @desc    get specific user
// @route   GET => /api/v1/users/{id}
// @access  private
exports.getUserById = getOneById(userModel);

// @desc    create user
// @route   POST => /api/v1/users
// @access  private
exports.createUser = createOne(userModel);

// @desc    Update Specific user
// @route   PUT => /api/v1/users/{id}
// @access  private
exports.updateUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  // update any data except user password
  const user = await userModel.findByIdAndUpdate(
    id,
    {
      name: req.body.name,
      slug: req.body.slug,
      phoneNumber: req.body.phoneNumber,
      email: req.body.email,
      profileImage: req.body.profileImage,
      role: req.body.role,
    },
    {
      new: true,
    }
  );
  if (!user) {
    next(new ApiError(`no user found with this id ${id}`, 404));
  } else {
    res.status(200).json({ data: user });
  }
});
// update user password
exports.changeUserPassword = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const user = await userModel.findByIdAndUpdate(
    id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
    }
  );
  if (!user) {
    next(new ApiError(`no user found with this id ${id}`, 404));
  } else {
    res.status(200).json({ data: user });
  }
});

// @desc    Delete Specific user
// @route   DELETE => /api/v1/users/{id}
// @access  Private
exports.deleteUser = deleteOne(userModel);

// @desc    deactivate Specific user
// @route   put => /api/v1/users/{id}
// @access  Private
exports.deactivateUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const user = await userModel.findByIdAndUpdate(
    id,
    { active: false },
    { new: true }
  );
  if (!user) {
    next(new ApiError(`no user found with this id: ${id}`, 404));
  } else {
    res.status(200).json({ data: user });
  }
});

// @desc    activate Specific user
// @route   put => /api/v1/users/{id}
// @access  Private
exports.activateUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const user = await userModel.findByIdAndUpdate(
    id,
    { active: true },
    { new: true }
  );
  if (!user) {
    next(new ApiError(`no user found with this id: ${id}`, 404));
  } else {
    res.status(200).json({ data: user });
  }
});

// logged user

// @desc    get logged user data
// @route   get => /api/v1/users/getLoggedUserData
// @access  Private/protected
exports.getLoggedUserData = asyncHandler(async (req, res, next) => {
  // we will use the getUserById handler but we will put the user id inside the params here after that go to the next middleware
  req.params.id = req.user._id;
  next();
});

// @desc    update logged user password
// @route   put => /api/v1/users/updateLoggedUserPassword
// @access  Private/protected
exports.updateLoggedUserPassword = asyncHandler(async (req, res, next) => {
  const user = await userModel.findByIdAndUpdate(
    req.user._id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
    }
  );
  const token = jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );
  res.status(200).json({ data: user, token });
});

// @desc    update logged user data
// @route   put => /api/v1/users/updateLoggedUserData
// @access  Private/protected
exports.updateLoggedUserData = asyncHandler(async (req, res) => {
  // update any data except user password
  const user = await userModel.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      slug: req.body.slug,
      email: req.body.email,
      profileImage: req.body.profileImage,
      phoneNumber: req.body.phoneNumber,
    },
    {
      new: true,
    }
  );
  res.status(200).json({ data: user });
});

// @desc    deactivate logged user
// @route   put => /api/v1/users/deactivateLoggedUser
// @access  Private/protected
exports.deactivateLoggedUser = asyncHandler(async (req, res, next) => {
  req.params.id = req.user._id;
  next();
});
