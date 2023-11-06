const { Schema, model } = require("mongoose");

const DOCUMENT_NAME = "SubTask";
const COLLECTION_NAME = "subtasks";

const subTaskSchema = new Schema(
  {
    task: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = model(DOCUMENT_NAME, subTaskSchema);
