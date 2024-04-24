const handleError = (err, req, res, next) => {
  console.log("Here");
  const statusCode = err.statusCode || 500;
  const errors = err.errors || [
    {
      param: null,
      msg: "Internal Server Error",
    },
  ];
  return res.status(statusCode).json({ errors });
};

const asyncHandler = (fn) => (req, res, next) => {
  fn(req, res, next).catch((err) => {
    console.log(err);
    next(err);
  });
};

module.exports = { handleError, asyncHandler };
