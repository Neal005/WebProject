const { body } = require("express-validator");
const UserController = require("../controllers/user.controller");
const { asyncHandler } = require("../middlewares/handleError");
const { checkParamObjectId, validate } = require("../middlewares/validation");

const router = require("express").Router();

router.get("/", asyncHandler(UserController.getCurrentUser));
router.get("/all", asyncHandler(UserController.getAllUsers));
router.get(
  "/:userId",
  checkParamObjectId("userId"),
  validate,
  asyncHandler(UserController.getUser)
);

router.put(
  "/:userId",
  checkParamObjectId("userId"),
  body("phone")
    .isMobilePhone("vi-VN")
    .withMessage("Invalid phone number format"),
  body("firstName").isLength({ min: 1 }).withMessage("First Name is not empty"),
  body("lastName").isLength({ min: 1 }).withMessage("Last Name is not empty"),
  validate,
  asyncHandler(UserController.update)
);

module.exports = router;
