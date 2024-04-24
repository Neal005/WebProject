const RoomService = require("../services/room.service");

class RoomController {
  static async createChatRoom(req, res) {
    const data = await RoomService.createChatRoom(req.body.members);
    console.log(req.body.members);
    res.json({ data });
  }

  static async getRoomsOfUser(req, res) {
    const data = await RoomService.getRoomsOfUser(req.user.userId);
    res.json({ data });
  }

  static async getRoomOfUsers(req, res) {
    const data = await RoomService.getRoomOfUsers(
      req.params.firstUserId,
      req.params.secondUserId
    );
    res.json({ data });
  }
}

module.exports = RoomController;
