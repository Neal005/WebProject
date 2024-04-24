const router = require("express").Router();
const MessageController = require("../controllers/message.controller");
const { asyncHandler } = require("../middlewares/handleError");

router.post("/", asyncHandler(MessageController.createMessage));
router.get("/:roomId", asyncHandler(MessageController.getMessages));

module.exports = router;
