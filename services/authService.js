const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const sharp = require("sharp");
const bcrypt = require("bcryptjs");
const { v4: uuid4 } = require("uuid");
const asyncHandler = require("express-async-handler");
const userModel = require("../models/userModel");
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");
const ApiError = require("../utils/apiError");
const sendEmail = require("../utils/sendEmail");

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

const generateToken = (user) =>
  jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );

// @desc    signup
// @route   POST => /api/v1/auth/signup
// @access  public
exports.signup = asyncHandler(async (req, res) => {
  // create user
  const user = await userModel.create(req.body);
  // generate JWT
  const token = generateToken(user);
  res.status(201).json({ data: user, token });
});

// @desc    login
// @route   POST => /api/v1/auth/login
// @access  public
exports.login = asyncHandler(async (req, res) => {
  // check user existence and match password
  const user = await userModel.findOne({ email: req.body.email });
  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    throw new ApiError(`incorrect email or password`, 401);
  }
  if (!user.active) {
    throw new ApiError(
      `deactivated account, please contact the admin for activation to login`,
      401
    );
  }
  // generate JWT
  const token = generateToken(user);
  res.status(200).json({ data: user, token });
});

// @desc    protect routes
exports.protect = asyncHandler(async (req, res, next) => {
  // check if there is token in the request
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(
      new ApiError(
        "you are not logged in, please login first to access this route",
        401
      )
    );
  }
  // verify token ( if there is change happen or expired token )
  const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
  // check if user with this token exists
  const user = await userModel.findById(decodedToken.userId);
  if (!user) {
    return next(new ApiError(`no user found for this token`, 401));
  }
  // check if user change his password after token generated
  if (user.passwordChangedAt) {
    const passwordChangedAtTimeInSeconds =
      user.passwordChangedAt.getTime() / 1000;
    if (passwordChangedAtTimeInSeconds > decodedToken.iat) {
      return next(
        new ApiError(
          `user recently changed his password, please login again`,
          401
        )
      );
    }
  }
  req.user = user;
  next();
});

// @desc    for permissions
exports.allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    // access the roles
    // access the user role (req.user.role)
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(`you are not allowed to access this route`, 403)
      );
    }
    next();
  });

// @desc    forget password
// @route   POST => /api/v1/auth/forgetPassword
// @access  public
exports.forgetPassword = asyncHandler(async (req, res, next) => {
  // check if email already exists
  const user = await userModel.findOne({ email: req.body.email });
  if (!user) {
    return next(new ApiError(`no user found with this email`, 404));
  }
  // generate reset password code and save it
  // change resetCode type to string to hash this code before save it in the database
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");
  user.passwordResetCode = hashedResetCode;
  // expiration time for the password reset code (10 mins)
  user.passwordResetCodeExpiration = Date.now() + 10 * 60 * 1000;
  user.passwordResetCodeVerification = false;
  await user.save();
  // send this reset password code to user email
  try {
    await sendEmail({
      email: user.email,
      subject: "password reset code",
      message: `Hi ${user.name},
      your password reset code is ${resetCode}
      you have 10 minutes to use this reset password code`,
    });
  } catch (err) {
    user.passwordResetCode = undefined;
    user.passwordResetCodeExpiration = undefined;
    user.passwordResetCodeVerification = undefined;
    await user.save();
    return next(
      new ApiError(
        `there was an error while sending the email, please try again later`,
        500
      )
    );
  }
  res.status(200).json({
    status: "success",
    message: "password reset code sent to mail",
  });
});

// @desc    verify password reset code
// @route   POST => /api/v1/auth/verifyResetCode
// @access  public
exports.verifyPasswordResetCode = asyncHandler(async (req, res, next) => {
  // get user based on password reset code
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");
  const user = await userModel.findOne({
    passwordResetCode: hashedResetCode,
    // to make sure that the reset code is not expired so it has to be grater than date.now()
    passwordResetCodeExpiration: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ApiError(`invalid password reset code or expired`, 404));
  }
  // set the password reset code verification to true
  user.passwordResetCodeVerification = true;
  await user.save();
  res.status(200).json({
    status: "success",
    message: "password reset code verified",
  });
});

// @desc    reset password
// @route   POST => /api/v1/auth/resetPassword
// @access  public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // get user based on the email sent in the request
  const user = await userModel.findOne({ email: req.body.email });
  if (!user) {
    return next(new ApiError(`no user found with this email`, 404));
  }
  // check if the password reset code is verified
  if (!user.passwordResetCodeVerification) {
    return next(new ApiError(`password reset code is not verified`, 400));
  }
  // update the user password we don't have to hash the password as we already use the mongoose middleware in the user model to hash the password before save
  user.password = req.body.newPassword;
  // reset all the values related to the password reset code
  user.passwordResetCode = undefined;
  user.passwordResetCodeExpiration = undefined;
  user.passwordResetCodeVerification = undefined;
  await user.save();
  res.status(200).json({
    status: "success",
    message: "password changed successfully",
  });
});
