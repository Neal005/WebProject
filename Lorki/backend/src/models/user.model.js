const { Schema, model } = require("mongoose");

const DOCUMENT_NAME = "User";
const COLLECTION_NAME = "users";

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = model(DOCUMENT_NAME, userSchema);
