const { body } = require("express-validator");
const SectionController = require("../controllers/section.controller");
const { asyncHandler } = require("../middlewares/handleError");
const { checkParamObjectId } = require("../middlewares/validation");
const { validate } = require("../middlewares/validation");

const router = require("express").Router({ mergeParams: true });

router.post(
  "/",
  body("title").notEmpty().withMessage("Section's title is required"),
  checkParamObjectId("projectId"),
  validate,
  asyncHandler(SectionController.create)
);

router.put(
  "/:sectionId",
  body("title").notEmpty().withMessage("Section's title is required"),
  checkParamObjectId("projectId"),
  checkParamObjectId("sectionId"),
  validate,
  asyncHandler(SectionController.update)
);

router.delete(
  "/:sectionId",
  checkParamObjectId("projectId"),
  checkParamObjectId("sectionId"),
  validate,
  asyncHandler(SectionController.delete)
);

module.exports = router;
