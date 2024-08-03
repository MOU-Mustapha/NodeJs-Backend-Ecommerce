const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "user name is required"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, "user email is required"],
      unique: [true, "user email must be unique"],
      lowercase: true,
    },
    phoneNumber: String,
    profileImage: String,
    password: {
      type: String,
      required: [true, "user password is required"],
      minlength: [6, "too short user password"],
    },
    passwordChangedAt: Date,
    passwordResetCode: String,
    passwordResetCodeExpiration: Date,
    passwordResetCodeVerification: Boolean,
    role: {
      type: String,
      enum: ["user", "admin", "manager"],
      default: "user",
    },
    active: {
      type: Boolean,
      default: true,
    },
    // child reference (one to many relation)
    wishlist: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
      },
    ],
    addresses: [
      {
        id: mongoose.Schema.Types.ObjectId,
        alias: String,
        details: String,
        phoneNumber: String,
        city: String,
        postalCode: String,
      },
    ],
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  // hashing user password
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const setImageUrl = (doc) => {
  if (doc.profileImage) {
    const imageUrl = `${process.env.BASE_URL}/users/${doc.profileImage}`;
    doc.profileImage = imageUrl;
  }
};
userSchema.post("init", (doc) => {
  setImageUrl(doc);
});
userSchema.post("save", (doc) => {
  setImageUrl(doc);
});

const userModel = mongoose.model("User", userSchema);

module.exports = userModel;
