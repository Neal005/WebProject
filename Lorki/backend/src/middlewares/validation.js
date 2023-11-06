const { validationResult, param, body } = require("express-validator");
const { default: mongoose } = require("mongoose");
const ApiError = require("../utils/apiError");
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    next(new ApiError(400, errors.errors));
  }
  next();
};

const isObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const checkParamObjectId = (field) =>
  param(field)
    .custom((value) => {
      console.log({ value });
      if (!isObjectId(value)) return Promise.reject();
      return Promise.resolve();
    })
    .withMessage("Invalid ProjectId");

const checkBodyObjectId = (field) =>
  body(field)
    .custom((value) => {
      console.log({ value });
      if (!isObjectId(value)) return Promise.reject();
      return Promise.resolve();
    })
    .withMessage("Invalid ProjectId");

module.exports = {
  validate,
  isObjectId,
  checkParamObjectId,
  checkBodyObjectId,
};
