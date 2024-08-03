class ApiFeatures {
  constructor(mongooseQuery, queryString) {
    this.mongooseQuery = mongooseQuery;
    this.queryString = queryString;
  }
  filter() {
    const queryStringObject = { ...this.queryString };
    const excludedQueries = [
      "pageNo",
      "pageSize",
      "sort",
      "ascending",
      "fields",
      "id",
    ];
    excludedQueries.forEach((value) => delete queryStringObject[value]);
    // filtration with ranges [gte, gt, lte, lt] and so on
    let queryString = JSON.stringify(queryStringObject);
    queryString = queryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );
    this.mongooseQuery = this.mongooseQuery.find(JSON.parse(queryString));
    return this;
  }
  sort() {
    if (this.queryString.sort) {
      // to avoid that the sort key has (,) if there is more than one field to sort with like ("price,sold") it should be ("price sold")
      const sortBy = this.queryString.sort.split(",").join(" ");
      if (this.queryString.ascending === "true") {
        this.mongooseQuery = this.mongooseQuery.sort(sortBy);
      } else {
        this.mongooseQuery = this.mongooseQuery.sort(`-${sortBy}`);
      }
    } else {
      this.mongooseQuery = this.mongooseQuery.sort("-createdAt");
    }
    return this;
  }
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.select(fields);
    } else {
      this.mongooseQuery = this.mongooseQuery.select("-__v");
    }
    return this;
  }
  search(moduleName) {
    if (this.queryString.keyword) {
      const keywordRegex = new RegExp(this.queryString.keyword, "i");
      let query = {};
      if (moduleName === "products") {
        query = {
          $or: [
            { title: { $regex: keywordRegex } },
            { description: { $regex: keywordRegex } },
          ],
        };
        // query.$or = [
        //   { title: { $regex: keywordRegex } },
        //   { description: { $regex: keywordRegex } },
        // ];
      } else {
        query = {
          $or: [{ name: { $regex: keywordRegex } }],
        };
        // query.$or = [{ name: { $regex: keywordRegex } }];
      }
      this.mongooseQuery = this.mongooseQuery.find(query);
    }
    return this;
  }
  pagination(totalCountOfData) {
    const pageNo = +this.queryString.pageNo || 1;
    const pageSize = +this.queryString.pageSize || 10;
    const skip = (pageNo - 1) * pageSize; // if pageNo = 2 so we gonna skip the first (2-1)*10 = 10 products
    const pagination = {};
    pagination.pageNo = pageNo;
    pagination.pageSize = pageSize;
    pagination.numberOfPages = Math.ceil(totalCountOfData / pageSize); // we need this if the number is less than 1 or have a fraction
    if (pageNo * pageSize < totalCountOfData) {
      pagination.nextPage = pageNo + 1;
    }
    if (skip > 0) {
      pagination.previousPage = pageNo - 1;
    }
    this.mongooseQuery = this.mongooseQuery.skip(skip).limit(pageSize);
    this.paginationResults = pagination;
    return this;
  }
}

module.exports = ApiFeatures;
