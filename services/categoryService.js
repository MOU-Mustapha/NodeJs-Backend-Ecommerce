const sharp = require("sharp");
const { v4: uuid4 } = require("uuid");
const asyncHandler = require("express-async-handler");
const categoryModel = require("../models/categoryModel");
const {
  deleteOne,
  updateOne,
  createOne,
  getOneById,
  getAll,
} = require("./handlersFactory");
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");

exports.uploadCategoryImage = uploadSingleImage("image");
// using asyncHandler and (async - await) to ensure that image processing has finished before go to the next middleware
exports.resizeImage = asyncHandler(async (req, res, next) => {
  if (req.file) {
    const fileName = `category-${uuid4()}-${Date.now()}.jpeg`;
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`uploads/categories/${fileName}`);
    // add the imageName to the body to save the imageName into the database
    req.body.image = fileName;
  }
  next();
});

// @desc    get all categories
// @route   GET => /api/v1/categories
// @access  public

// with getAll factory
exports.getCategories = getAll(categoryModel);

// without getAll factory
// exports.getCategories = asyncHandler(async (req, res) => {
//   // const pageNo = +req.query.pageNo || 1;
//   // const pageSize = +req.query.pageSize || 10;
//   // const skip = (pageNo - 1) * pageSize; // if pageNo = 2 so we gonna skip the first (2-1)*10 = 10 categories
//   const totalCategories = await categoryModel.countDocuments();
//   const apiFeature = new ApiFeatures(categoryModel.find(), req.query)
//     .pagination(totalCategories)
//     .filter()
//     .search()
//     .limitFields()
//     .sort();
//   const { mongooseQuery, paginationResults } = apiFeature;
//   const allCategories = await mongooseQuery;
//   res.status(200).json({
//     totalCount: totalCategories,
//     ...paginationResults,
//     data: allCategories,
//   });
// });

// @desc    get specific category
// @route   GET => /api/v1/categories/{categoryId}
// @access  public

// with getById factory
exports.getCategoryById = getOneById(categoryModel);

// without getById factory
// exports.getCategoryById = asyncHandler(async (req, res, next) => {
//   const { id } = req.params;
//   const category = await categoryModel.findById(id);
//   if (!category) {
//     // res.status(404).json({ errorMsg: "no category found with this id" });
//     // using error class
//     next(new ApiError(`no category found with this id ${id}`, 404));
//   } else {
//     res.status(200).json({ data: category });
//   }
// });

// @desc    create category
// @route   POST => /api/v1/categories
// @access  Private

// with create factory
exports.createCategory = createOne(categoryModel);

// without create factory
// exports.createCategory = asyncHandler(async (req, res) => {
//   const { name } = req.body;
//   // const newCategory = categoryModel({ name });
//   // newCategory
//   //   .save()
//   //   .then((doc) => {
//   //     return res.json(doc);
//   //   })
//   //   .catch((err) => {
//   //     return res.json(err);
//   //   });

//   // categoryModel
//   //   .create({ name, slug: slugify(name) })
//   //   .then((category) => {
//   //     res.status(201).json({ data: category });
//   //   })
//   //   .catch((err) => {
//   //     res.status(400).send(err);
//   //   });

//   // async await Code
//   const newCategory = await categoryModel.create({ name, slug: slugify(name) });
//   res.status(201).json({ data: newCategory });
// });

// @desc    Update Specific category
// @route   PUT => /api/v1/categories/{categoryId}
// @access  Private

// with update factory
exports.updateCategory = updateOne(categoryModel);

// without update factory
// exports.updateCategory = asyncHandler(async (req, res, next) => {
// const { id } = req.params;
//   const { name } = req.body;
//   const category = await categoryModel.findOneAndUpdate(
//     { _id: id },
//     { name, slug: slugify(name) },
//     { new: true }
//   );
//   if (!category) {
//     // res.status(404).json({ errorMsg: "no category found with this id" });
//     // using error class
//     next(new ApiError(`no category found with this id ${id}`, 404));
//   } else {
//     res.status(200).json({ data: category });
//   }
// });

// @desc    Delete Specific category
// @route   DELETE => /api/v1/categories/{categoryId}
// @access  Private

// with delete factory
exports.deleteCategory = deleteOne(categoryModel);

// without delete factory
// exports.deleteCategory = asyncHandler(async (req, res, next) => {
//   const { categoryId } = req.params;
//   const deletedCategory = await categoryModel.findByIdAndDelete(categoryId);
//   if (!deletedCategory) {
//     // res.status(404).json({ errorMsg: "no category found with this id" });
//     // using error class
//     next(new ApiError(`no category found with this id ${categoryId}`, 404));
//   } else {
//     res.status(200).json({ data: deletedCategory });
//   }
// });
