const mongoose = require("mongoose");

const dev = true;

class MongoDB {
  constructor() {
    this.connect();
  }

  connect() {
    if (dev) {
      mongoose.set("debug", true);
      mongoose.set("debug", { color: true });
    }

    mongoose
      .connect(process.env.MONGODB_URI)
      .then(() => {
        console.log("MongoDB is connected!");
      })
      .catch((err) => {
        console.log("Error when connecting to MongoDB:: ", err);
      });
  }

  static getInstance() {
    if (!MongoDB.instance) {
      MongoDB.instance = new MongoDB();
    }
    return MongoDB.instance;
  }
}

const instanceMongoDB = MongoDB.getInstance();

module.exports = instanceMongoDB;
