const TaskController = require("../controllers/task.controller");
const { asyncHandler } = require("../middlewares/handleError");
const {
  checkParamObjectId,
  validate,
  checkBodyObjectId,
} = require("../middlewares/validation");

const router = require("express").Router({ mergeParams: true });

router.post(
  "/",
  checkParamObjectId("projectId"),
  checkBodyObjectId("sectionId"),
  validate,
  asyncHandler(TaskController.create)
);

router.put(
  "/position",
  checkParamObjectId("projectId"),
  validate,
  asyncHandler(TaskController.updatePosition)
);

router.put(
  "/:taskId",
  checkParamObjectId("projectId"),
  checkParamObjectId("taskId"),
  validate,
  asyncHandler(TaskController.update)
);

router.delete(
  "/:taskId",
  checkParamObjectId("projectId"),
  checkParamObjectId("taskId"),
  validate,
  asyncHandler(TaskController.delete)
);

module.exports = router;
