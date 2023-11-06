const { Schema, model, Types } = require("mongoose");

const DOCUMENT_NAME = "Project";
const COLLECTION_NAME = "projects";

const projectSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    members: {
      type: [Schema.Types.ObjectId],
    },
    pinnedUsers: {
      type: [Schema.Types.ObjectId],
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = model(DOCUMENT_NAME, projectSchema);
