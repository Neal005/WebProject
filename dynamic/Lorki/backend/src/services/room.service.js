const ChatRoom = require("../models/chatRoom.model");
class RoomService {
  static async createChatRoom(membersId) {
    const room = await ChatRoom.create({
      members: membersId,
    });

    return {
      room,
    };
  }

  static async getRoomsOfUser(userId) {
    const rooms = await ChatRoom.find({
      members: { $in: [userId] },
    });

    return {
      rooms,
    };
  }

  static async getRoomOfUsers(firstUserId, secondUserId) {
    const room = await ChatRoom.find({
      members: { $all: [firstUserId, secondUserId] },
    });
    return { room };
  }
}

module.exports = RoomService;
