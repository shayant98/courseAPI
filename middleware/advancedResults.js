const advancedResults = (model, populate) => async (req, res, next) => {
  let query;

  // Copy req.query
  const reqQuery = { ...req.query };

  // Fields to exclude
  const removeFields = ["select", "sort", "limit", "page"];

  //loop over removeFields and delete from reqQuery
  removeFields.forEach(param => {
    delete reqQuery[param];
  });

  //Create queryStr
  let queryStr = JSON.stringify(reqQuery);

  //adding "$" to mongoDB operators
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  //inding resource
  query = model.find(JSON.parse(queryStr)); //virtuals in model

  //select fields
  if (req.query.select) {
    const fields = req.query.select.split(",").join(" ");
    query = query.select(fields);
  }

  //sort fields
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query.sort("-createdAt");
  }

  //Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await model.countDocuments();

  if (populate) {
    query = query.populate(populate); //virtuals in model
  }

  query = query.skip(startIndex).limit(limit);

  // Query execution
  const results = await query;

  //Pagination Result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }
  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.advancedResults = {
    success: true,
    count: results.length,
    pagination,
    data: results
  };
  next();
};

module.exports = advancedResults;
