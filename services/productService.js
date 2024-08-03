const sharp = require("sharp");
const { v4: uuid4 } = require("uuid");
const asyncHandler = require("express-async-handler");
const productModel = require("../models/productModel");
const {
  deleteOne,
  updateOne,
  createOne,
  getOneById,
  getAll,
} = require("./handlersFactory");
const {
  uploadMultipleImages,
} = require("../middlewares/uploadImageMiddleware");

exports.uploadProductImages = uploadMultipleImages([
  { name: "imageCover", maxCount: 1 },
  { name: "images", maxCount: 5 },
]);
exports.resizeProductImages = asyncHandler(async (req, res, next) => {
  // image processing for imageCover
  if (req.files.imageCover) {
    const imageCoverFileName = `product-${uuid4()}-${Date.now()}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`uploads/products/${imageCoverFileName}`);
    // add the imageName to the body to save the imageName into the database
    req.body.imageCover = imageCoverFileName;
  }
  // image processing for images array
  if (req.files.images) {
    req.body.images = [];
    await Promise.all(
      req.files.images.map(async (img, i) => {
        const imageName = `product-${uuid4()}-${Date.now()}-${i + 1}.jpeg`;
        await sharp(img.buffer)
          .resize(600, 600)
          .toFormat("jpeg")
          .jpeg({ quality: 90 })
          .toFile(`uploads/products/${imageName}`);
        // add the imageName to the body to save the imageName into the database
        req.body.images.push(imageName);
      })
    );
  }
  next();
});

// @desc    get all products
// @route   GET => /api/v1/products
// @access  public

// with getAll factory
exports.getProducts = getAll(productModel, "products");

// without getAll factory
// exports.getProducts = asyncHandler(async (req, res) => {
//   // filtration
//   // const queryStringObject = { ...req.query };
//   // const excludedQueries = ["pageNo", "pageSize", "sort", "ascending", "fields"];
//   // excludedQueries.forEach((value) => delete queryStringObject[value]);
//   // // filtration with ranges [gte, gt, lte, lt] and so on
//   // let queryString = JSON.stringify(queryStringObject);
//   // queryString = queryString.replace(
//   //   /\b(gte|gt|lte|lt)\b/g,
//   //   (match) => `$${match}`
//   // );

//   // pagination
//   // const pageNo = +req.query.pageNo || 1;
//   // const pageSize = +req.query.pageSize || 10;
//   // const skip = (pageNo - 1) * pageSize; // if pageNo = 2 so we gonna skip the first (2-1)*10 = 10 products

//   const totalProducts = await productModel.countDocuments();
//   const apiFeatures = new ApiFeatures(
//     productModel
//       .find()
//       .populate("category")
//       .populate("subCategories")
//       .populate("brand"),
//     req.query
//   )
//     .pagination(totalProducts)
//     .filter()
//     .search("products")
//     .limitFields()
//     .sort();

//   // build query
//   // let mongooseQuery = productModel
//   //   .find(JSON.parse(queryString))
//   //   .populate("category")
//   //   .populate("subCategories")
//   //   .populate("brand");

//   // sorting
//   // if (req.query.sort) {
//   //   // to avoid that the sort key has (,) if there is more than one field to sort with like ("price,sold") it should be ("price sold")
//   //   const sortBy = req.query.sort.split(",").join(" ");
//   //   if (req.query.ascending === "true") {
//   //     mongooseQuery = mongooseQuery.sort(sortBy);
//   //   } else {
//   //     mongooseQuery = mongooseQuery.sort(`-${sortBy}`);
//   //   }
//   // } else {
//   //   mongooseQuery = mongooseQuery.sort("-createdAt");
//   // }

//   // fields limiting
//   // if (req.query.fields) {
//   //   const fields = req.query.fields.split(",").join(" ");
//   //   mongooseQuery = mongooseQuery.select(fields);
//   // } else {
//   //   mongooseQuery = mongooseQuery.select("-__v");
//   // }

//   // search
//   // if (req.query.keyword) {
//   //   const keywordRegex = new RegExp(req.query.keyword, "i");
//   //   const query = {
//   //     $or: [
//   //       { title: { $regex: keywordRegex } },
//   //       { description: { $regex: keywordRegex } },
//   //     ],
//   //   };
//   //   mongooseQuery = mongooseQuery.find(query);
//   // }

//   const { mongooseQuery, paginationResults } = apiFeatures;
//   // execute query
//   const allProducts = await mongooseQuery;

//   // response
//   res.status(200).json({
//     totalCount: totalProducts,
//     ...paginationResults,
//     data: allProducts,
//   });
// });

// @desc    get specific product
// @route   GET => /api/v1/products/{productId}
// @access  public

// with getById factory
exports.getProductById = getOneById(productModel, "reviews");

// without getById factory
// exports.getProductById = asyncHandler(async (req, res, next) => {
//   const { id } = req.params;
//   const product = await productModel
//     .findById(id)
//     .populate("category")
//     .populate("subCategories")
//     .populate("brand");
//   if (!product) {
//     next(new ApiError(`no product found with this id ${id}`, 404));
//   } else {
//     res.status(200).json({ data: product });
//   }
// });

// @desc    create product
// @route   POST => /api/v1/products
// @access  Private

// with create factory
exports.createProduct = createOne(productModel);

// without create factory
// exports.createProduct = asyncHandler(async (req, res) => {
//   req.body.slug = slugify(req.body.title);
//   const newProduct = await productModel.create(req.body);
//   res.status(201).json({ data: newProduct });
// });

// @desc    Update Specific product
// @route   PUT => /api/v1/products/{productId}
// @access  Private

// with update factory
exports.updateProduct = updateOne(productModel);

// without update factory
// exports.updateProduct = asyncHandler(async (req, res, next) => {
//   const { id } = req.params;
//   if (req.body.title) {
//     req.body.slug = slugify(req.body.title);
//   }
//   const product = await productModel.findOneAndUpdate({ _id: id }, req.body, {
//     new: true,
//   });
//   if (!product) {
//     next(new ApiError(`no product found with this id ${id}`, 404));
//   } else {
//     res.status(200).json({ data: product });
//   }
// });

// @desc    Delete Specific product
// @route   DELETE => /api/v1/products/{productId}
// @access  Private

// with delete factory
exports.deleteProduct = deleteOne(productModel);

// without delete factory
// exports.deleteProduct = asyncHandler(async (req, res, next) => {
//   const { id } = req.params;
//   const deletedProduct = await productModel.findByIdAndDelete(id);
//   if (!deletedProduct) {
//     next(new ApiError(`no product found with this id ${id}`, 404));
//   } else {
//     res.status(200).json({ data: deletedProduct });
//   }
// });
