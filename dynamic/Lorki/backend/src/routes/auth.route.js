const router = require("express").Router();
const UserController = require("../controllers/user.controller");
const { body } = require("express-validator");
const { validate } = require("../middlewares/validation");
const { asyncHandler } = require("../middlewares/handleError");
const { verifyToken } = require("../middlewares/tokenHandler");

router.post(
  "/register",
  body("email").isEmail().withMessage("Invalid Email"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
  body("phone")
    .isMobilePhone("vi-VN")
    .withMessage("Invalid phone number format"),
  body("firstName").notEmpty().withMessage("First Name is required"),
  body("lastName").notEmpty().withMessage("Last Name is required"),
  validate,
  asyncHandler(UserController.register)
);
router.post(
  "/login",
  body("email").isEmail().withMessage("Invalid Email"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
  validate,
  asyncHandler(UserController.login)
);

router.post(
  "/check-email",
  body("email").isEmail().withMessage("Invalid Email"),
  validate,
  asyncHandler(UserController.checkEmail)
);

module.exports = router;
