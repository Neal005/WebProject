const MessageService = require("../services/message.service");

class MessageController {
  static async createMessage(req, res) {
    const data = await MessageService.createMessage(req.body);
    res.json({ data });
  }

  static async getMessages(req, res) {
    const data = await MessageService.getMessages(req.params.roomId);
    res.json({ data });
  }
}

module.exports = MessageController;
