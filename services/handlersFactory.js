const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const ApiFeatures = require("../utils/apiFeatures");

exports.deleteOne = (model) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const deletedDocument = await model.findByIdAndDelete(id);
    if (!deletedDocument) {
      // res.status(404).json({ errorMsg: "no category found with this id" });
      // using error class
      next(new ApiError(`no document found with this id ${id}`, 404));
    } else {
      if (deletedDocument.reviewUser) {
        await model.calculateAverageAndQuantityRatings(deletedDocument.product);
      }
      res.status(200).json({ data: deletedDocument });
    }
  });

exports.updateOne = (model) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const document = await model.findByIdAndUpdate(id, req.body, { new: true });
    if (!document) {
      // res.status(404).json({ errorMsg: "no category found with this id" });
      // using error class
      next(new ApiError(`no document found with this id ${id}`, 404));
    } else {
      // trigger save event to fire the schema.post("save") in reviews schema
      document.save();
      res.status(200).json({ data: document });
    }
  });

exports.createOne = (model) =>
  asyncHandler(async (req, res) => {
    const newDocument = await model.create(req.body);
    res.status(201).json({ data: newDocument });
  });

exports.getOneById = (model, populationOptions) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    // build query
    let query = model.findById(id);
    if (populationOptions) {
      query = query.populate(populationOptions);
    }
    // execute query
    const document = await query;
    if (!document) {
      next(new ApiError(`no document found with this id ${id}`, 404));
    } else {
      res.status(200).json({ data: document });
    }
  });

exports.getAll = (model, moduleName, filterKey) =>
  asyncHandler(async (req, res) => {
    let filterObj = {};
    if (req.query.id && filterKey) {
      filterObj = { [filterKey]: req.query.id };
    }
    const totalDocuments = await model.countDocuments();
    const apiFeature = new ApiFeatures(model.find(filterObj), req.query)
      .pagination(totalDocuments)
      .filter()
      .search(moduleName)
      .limitFields()
      .sort();
    const { mongooseQuery, paginationResults } = apiFeature;
    const allDocuments = await mongooseQuery;
    res.status(200).json({
      totalCount: totalDocuments,
      ...paginationResults,
      data: allDocuments,
    });
  });
