const subCategoryModel = require("../models/subCategoryModel");
const {
  deleteOne,
  updateOne,
  createOne,
  getOneById,
  getAll,
} = require("./handlersFactory");

// @desc    get all subcategories
// @route   GET => /api/v1/subcategories
// @access  public

// with getAll factory
exports.getSubCategories = getAll(subCategoryModel, undefined, "category");

// without getAll factory
// exports.getSubCategories = asyncHandler(async (req, res) => {
//   // const pageNo = +req.query.pageNo || 1;
//   // const pageSize = +req.query.pageSize || 10;
//   // const skip = (pageNo - 1) * pageSize; // if pageNo = 2 so we gonna skip the first (2-1)*10 = 10 subcategories
//   // if we need to use get all subCategories/category we need to make it req.params instead of req.query
//   // const { categoryId } = req.query;
//   // let filteredObject = {};
//   // if (categoryId) {
//   //   filteredObject = { category: categoryId };
//   // }

//   const totalSubCategories = await subCategoryModel.countDocuments();
//   const apiFeature = new ApiFeatures(
//     subCategoryModel.find().populate("category"),
//     req.query
//   )
//     .pagination(totalSubCategories)
//     .filter()
//     .search()
//     .limitFields()
//     .sort();
//   const { mongooseQuery, paginationResults } = apiFeature;
//   const allSubCategories = await mongooseQuery;
//   res.status(200).json({
//     totalCount: totalSubCategories,
//     ...paginationResults,
//     data: allSubCategories,
//   });
// });

// @desc    get specific subcategory
// @route   GET => /api/v1/subcategories/{subcategoryId}
// @access  public

// with getById factory
exports.getSubCategoryById = getOneById(subCategoryModel);

// without getById factory
// exports.getSubCategoryById = asyncHandler(async (req, res, next) => {
//   const { id } = req.params;
//   const subCategory = await subCategoryModel.findById(id).populate("category");
//   if (!subCategory) {
//     next(new ApiError(`no subcategory found with this id ${id}`, 404));
//   } else {
//     res.status(200).json({ data: subCategory });
//   }
// });

// to add subCategory inside specific category (nested route)
exports.addingCategoryIdToBody = (req, res, next) => {
  if (!req.body.category) {
    req.body.category = req.params.id;
  }
  next();
};

// @desc    create subcategory
// @route   POST => /api/v1/subcategories
// @access  Private

// with create factory
exports.createSubCategory = createOne(subCategoryModel);

// without create factory
// exports.createSubCategory = asyncHandler(async (req, res) => {
//   const { name, category } = req.body;
//   const newSubCategory = await subCategoryModel.create({
//     name,
//     slug: slugify(name),
//     category,
//   });
//   res.status(201).json({ data: newSubCategory });
// });

// @desc    Update Specific subcategory
// @route   PUT => /api/v1/subcategories/{subcategoryId}
// @access  Private

// with update factory
exports.updateSubCategory = updateOne(subCategoryModel);

// without update factory
// exports.updateSubCategory = asyncHandler(async (req, res, next) => {
//   const { name, category } = req.body;
//   const { id } = req.params;
//   const subCategory = await subCategoryModel.findOneAndUpdate(
//     { _id: id },
//     { name, slug: slugify(name), category },
//     { new: true }
//   );
//   if (!subCategory) {
//     next(new ApiError(`no subcategory found with this id ${id}`, 404));
//   } else {
//     res.status(200).json({ data: subCategory });
//   }
// });

// @desc    Delete Specific subcategory
// @route   DELETE => /api/v1/subcategories/{subcategoryId}
// @access  Private

// with delete factory
exports.deleteSubCategory = deleteOne(subCategoryModel);

// without delete factory
// exports.deleteSubCategory = asyncHandler(async (req, res, next) => {
//   const { id } = req.params;
//   const deletedSubCategory = await subCategoryModel.findByIdAndDelete(id);
//   if (!deletedSubCategory) {
//     next(new ApiError(`no subcategory found with this id ${id}`, 404));
//   } else {
//     res.status(200).json({ data: deletedSubCategory });
//   }
// });
