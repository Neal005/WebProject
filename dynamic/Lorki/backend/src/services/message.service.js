const ChatMessage = require("../models/chatMessage.model");

class MessageService {
  static async createMessage({ room, sender, message }) {
    const newMessage = await ChatMessage.create({ room, sender, message });
    return { message: newMessage };
  }

  static async getMessages(roomId) {
    const messages = await ChatMessage.find({ room: roomId }).lean();
    return { messages };
  }
}

module.exports = MessageService;
