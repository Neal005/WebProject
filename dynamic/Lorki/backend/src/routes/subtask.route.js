const SubTaskController = require("../controllers/subtask.controller");
const { asyncHandler } = require("../middlewares/handleError");
const {
  checkParamObjectId,
  checkBodyObjectId,
} = require("../middlewares/validation");
const { validate } = require("../middlewares/validation");

const router = require("express").Router();

router.get(
  "/:taskId",
  checkParamObjectId("taskId"),
  validate,
  asyncHandler(SubTaskController.getAll)
);

router.post(
  "/",
  checkBodyObjectId("task"),
  validate,
  asyncHandler(SubTaskController.create)
);
router.put(
  "/:subtaskId",
  checkParamObjectId("subtaskId"),
  validate,
  asyncHandler(SubTaskController.update)
);
router.delete(
  "/:subtaskId",
  checkParamObjectId("subtaskId"),
  validate,
  asyncHandler(SubTaskController.delete)
);

module.exports = router;
