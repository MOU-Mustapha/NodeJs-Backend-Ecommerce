const sharp = require("sharp");
const { v4: uuid4 } = require("uuid");
const expressAsyncHandler = require("express-async-handler");
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");
const brandModel = require("../models/brandModel");
const {
  deleteOne,
  updateOne,
  createOne,
  getOneById,
  getAll,
} = require("./handlersFactory");

exports.uploadBrandImage = uploadSingleImage("image");
// using asyncHandler and (async - await) to ensure that image processing has finished before go to the next middleware
exports.resizeImage = expressAsyncHandler(async (req, res, next) => {
  if (req.file) {
    const fileName = `brand-${uuid4()}-${Date.now()}.jpeg`;
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`uploads/brands/${fileName}`);
    // add the imageName to the body to save the imageName into the database
    req.body.image = fileName;
  }
  next();
});

// @desc    get all brands
// @route   GET => /api/v1/brands
// @access  public

// with getAll factory
exports.getBrands = getAll(brandModel);

// without getAll factory
// exports.getBrands = asyncHandler(async (req, res) => {
//   // const pageNo = +req.query.pageNo || 1;
//   // const pageSize = +req.query.pageSize || 10;
//   // const skip = (pageNo - 1) * pageSize; // if pageNo = 2 so we gonna skip the first (2-1)*10 = 10 brands
//   const totalBrands = await brandModel.countDocuments();
//   const apiFeature = new ApiFeatures(brandModel.find(), req.query)
//     .pagination(totalBrands)
//     .filter()
//     .search()
//     .limitFields()
//     .sort();
//   const { mongooseQuery, paginationResults } = apiFeature;
//   const allBrands = await mongooseQuery;
//   res.status(200).json({
//     totalCount: totalBrands,
//     ...paginationResults,
//     data: allBrands,
//   });
// });

// @desc    get specific brand
// @route   GET => /api/v1/brand/{brandId}
// @access  public

// with getById factory
exports.getBrandById = getOneById(brandModel);

// without getById factory
// exports.getBrandById = asyncHandler(async (req, res, next) => {
//   const { id } = req.params;
//   const brand = await brandModel.findById(id);
//   if (!brand) {
//     next(new ApiError(`no brand found with this id ${id}`, 404));
//   } else {
//     res.status(200).json({ data: brand });
//   }
// });

// @desc    create brand
// @route   POST => /api/v1/brands
// @access  Private

// with create factory
exports.createBrand = createOne(brandModel);

// without create factory
// exports.createBrand = asyncHandler(async (req, res) => {
//   const { name } = req.body;
//   const newBrand = await brandModel.create({ name, slug: slugify(name) });
//   res.status(201).json({ data: newBrand });
// });

// @desc    Update Specific brand
// @route   PUT => /api/v1/brands/{brandId}
// @access  Private

// with update factory
exports.updateBrand = updateOne(brandModel);

// without update factory
// exports.updateBrand = asyncHandler(async (req, res, next) => {
//   const { id } = req.params;
//   const { name } = req.body;
//   const brand = await brandModel.findOneAndUpdate(
//     { _id: id },
//     { name, slug: slugify(name) },
//     { new: true }
//   );
//   if (!brand) {
//     next(new ApiError(`no brand found with this id ${id}`, 404));
//   } else {
//     res.status(200).json({ data: brand });
//   }
// });

// @desc    Delete Specific brand
// @route   DELETE => /api/v1/brands/{brandId}
// @access  Private

// with delete factory
exports.deleteBrand = deleteOne(brandModel);

// without delete factory
// exports.deleteBrand = asyncHandler(async (req, res, next) => {
//   const { id } = req.params;
//   const deletedBrand = await brandModel.findByIdAndDelete(id);
//   if (!deletedBrand) {
//     next(new ApiError(`no brand found with this id ${id}`, 404));
//   } else {
//     res.status(200).json({ data: deletedBrand });
//   }
// });
