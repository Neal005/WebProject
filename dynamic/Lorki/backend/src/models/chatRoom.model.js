const { model, Schema } = require("mongoose");

const DOCUMENT_NAME = "ChatRoom";
const COLLECTION_NAME = "chatrooms";

const chatRoomModel = new Schema(
  {
    members: {
      type: Array,
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = model(DOCUMENT_NAME, chatRoomModel);
