const multer = require("multer");
const ApiError = require("../utils/apiError");

const multerConfigurations = () => {
  // cb like next in express (reject case [null], resolve case ["destination"])

  // 1- using disk storage engine
  // const multerStorage = multer.diskStorage({
  //   destination: function (req, file, cb) {
  //     cb(null, "uploads/categories");
  //   },
  //   filename: function (req, file, cb) {
  //     const imageExtension = file.mimetype.split("/")[1];
  //     const fileName = `category-${uuid4()}-${Date.now()}.${imageExtension}`;
  //     cb(null, fileName);
  //   },
  // });
  // 2- using memory storage engine
  const multerStorage = multer.memoryStorage();
  const multerFilter = function (req, file, cb) {
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb(new ApiError("only images are allowed", 400), false);
    }
  };
  const upload = multer({ storage: multerStorage, fileFilter: multerFilter });
  return upload;
};

exports.uploadSingleImage = (fieldName) =>
  multerConfigurations().single(fieldName);
exports.uploadMultipleImages = (arrayOfFields) =>
  multerConfigurations().fields(arrayOfFields);
