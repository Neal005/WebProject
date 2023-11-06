const RoomController = require("../controllers/room.controller");
const { asyncHandler } = require("../middlewares/handleError");

const router = require("express").Router();

router.post("/", asyncHandler(RoomController.createChatRoom));
router.get("/", asyncHandler(RoomController.getRoomsOfUser));
router.get(
  "/:firstUserId/:secondUserId",
  asyncHandler(RoomController.getRoomOfUsers)
);

module.exports = router;
