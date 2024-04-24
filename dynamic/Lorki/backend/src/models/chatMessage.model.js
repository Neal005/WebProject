const { model, Schema } = require("mongoose");

const DOCUMENT_NAME = "ChatMessage";
const COLLECTION_NAME = "chatMessages";

const chatMessageModel = new Schema(
  {
    room: {
      type: Schema.Types.ObjectId,
      ref: "ChatRoom",
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = model(DOCUMENT_NAME, chatMessageModel);
