const { Schema, model } = require("mongoose");

const DOCUMENT_NAME = "Section";
const COLLECTION_NAME = "sections";

const sectionSchema = new Schema(
  {
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = model(DOCUMENT_NAME, sectionSchema);
