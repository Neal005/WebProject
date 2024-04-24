const router = require("express").Router();
const { verifyToken } = require("../middlewares/tokenHandler");

router.use("/auth", require("./auth.route"));
router.use("/user", verifyToken, require("./user.route"));
router.use("/message", verifyToken, require("./message.route"));
router.use("/room", verifyToken, require("./room.route"));
router.use("/project", verifyToken, require("./project.route"));
router.use(
  "/project/:projectId/section",
  verifyToken,
  require("./section.route")
);
router.use("/project/:projectId/task", verifyToken, require("./task.route"));
router.use("/subtask", verifyToken, require("./subtask.route"));

module.exports = router;
